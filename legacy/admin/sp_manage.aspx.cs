using System;
using System.Collections;
using System.ComponentModel;
using System.Data;
using System.Data.SqlClient;
using System.Drawing;
using System.Web;
using System.Web.SessionState;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Web.UI.HtmlControls;
using jxc.ascx;
using System.IO;

namespace jxc.admin
{
	/// <summary>
	/// sp_manage 的摘要说明。
	/// </summary>
	public class sp_manage : jxc.UsrControl.UserPage
	{
		protected System.Web.UI.WebControls.DataGrid Datagrid1;
		protected System.Web.UI.WebControls.Button add;
		protected System.Web.UI.WebControls.Button delete;
		protected System.Web.UI.WebControls.Button changesort;
		protected dgNavigation DgNavigation1;
		
		utils u = new utils ();
		private void Page_Load(object sender, System.EventArgs e)
		{
			u.SetGridStyle(this.Datagrid1);
			DgNavigation1.SetTarget(Datagrid1,null,new BindDataDelegate(BindData));//BindData是你的数据邦定事件
			DgNavigation1.SetStyle(20, true);//10表示每页分10行，true表示无分页时自动隐藏
			if (!this.Page.IsPostBack)
			{
				BindData ();
				delete.Attributes.Add("onclick","return confirm('您真的要删除吗？')");
			}
		}

		private void BindData ()
		{
			string cmd = "select bh,bt,fbsj,case sptype when 0 then (select judgename from rs_corsub where listid=judgeczy) else (select glyname from cnc_glyb where glydh=judgeczy) end as judge,(case iffinish when 0 then '<font color=red>审批中</font>' when '1' then '审批通过' when '2' then '待定' else '不通过' end) as status,finishdate,(select des from b_streamtype where b_streamtype.id=type) as type from t_master where zz='" + this.glydh + "' order by fbsj desc";
			DataSet ds = DBBase.ExecuteSql4Ds (cmd,"cnc_qxcdb");
			this.Datagrid1.DataSource = ds.Tables["cnc_qxcdb"].DefaultView;
			this.Datagrid1.DataBind ();
		}


		#region Web 窗体设计器生成的代码
		override protected void OnInit(EventArgs e)
		{
			//
			// CODEGEN: 该调用是 ASP.NET Web 窗体设计器所必需的。
			//
			InitializeComponent();
			base.OnInit(e);
		}
		
		/// <summary>
		/// 设计器支持所需的方法 - 不要使用代码编辑器修改
		/// 此方法的内容。
		/// </summary>
		private void InitializeComponent()
		{    
			this.add.Click += new System.EventHandler(this.add_Click);
			this.delete.Click += new System.EventHandler(this.delete_Click);
			this.changesort.Click += new System.EventHandler(this.changesort_Click);
			this.Load += new System.EventHandler(this.Page_Load);

		}
		#endregion

		private void add_Click(object sender, System.EventArgs e)
		{
			u.OpenIEWindowRight (this,"sp_add.aspx",800,600);
		}

		private void changesort_Click(object sender, System.EventArgs e)
		{
			string id = utils.FindFirstCheckedItem(this.Datagrid1);
			if (id == "")
			{
				utils.Alert (this,"请选择一项");
				return;
			}
			u.OpenIEWindowRight (this,"view_judge.aspx?id=" + id,800,600);
		}

		private void delete_Click(object sender, System.EventArgs e)
		{
			string id = utils.FindFirstCheckedItem(this.Datagrid1);
			if (id == "")
			{
				utils.Alert (this,"请选择一项");
				return;
			}
			string cmd = "select judgeczy,iffinish from t_master where bh=" + id;
			SqlDataReader dr = DBBase.ExecuteSqlReader (cmd);
			if (dr.Read ())
			{
				if (dr["judgeczy"].ToString () == "60001")
				{	
					//删除服务器上的语音文件
					SqlDataReader dr2 = DBBase.ExecuteSqlReader ("select sqyy from t_master_yy where bh=" + id);
					while (dr2.Read ())
					{
						File.Delete (Server.MapPath(dr2[0].ToString ()));
					}
					dr2.Close ();
					string [] cmds = new string[2];
					cmds[0] = "delete from t_master_yy where bh=" + id;
					cmds[1] = "delete from t_master where bh=" + id;									  
					DBBase.ExecuteSqls (cmds);
					utils.Alert (this,"删除成功");
					BindData ();
				}
				else
				{
					if (dr["iffinish"].ToString () == "1" || dr["iffinish"].ToString () == "3")
					{
						SqlDataReader dr2 = DBBase.ExecuteSqlReader ("select sqyy from t_master_yy where bh=" + id);
						while (dr2.Read ())
						{
							File.Delete (Server.MapPath(dr2[0].ToString ()));
						}
						dr2.Close ();
						string [] cmds = new string[2];
						cmds[0] = "delete from t_master_yy where bh=" + id;
						cmds[1] = "delete from t_master where bh=" + id;									  
						DBBase.ExecuteSqls (cmds);
						utils.Alert (this,"删除成功");
						BindData ();
					}
					else
						utils.Alert (this,"该申请已经进入审批流程，不能删除");
				}
			}
			dr.Close ();
		}
	}
}
