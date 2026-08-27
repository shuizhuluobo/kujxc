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
using System.IO;
using jxc.ascx;

namespace jxc.admin
{
	/// <summary>
	/// all_sp_manage 的摘要说明。
	/// </summary>
	public class all_sp_manage : System.Web.UI.Page
	{
		protected System.Web.UI.WebControls.DataGrid Datagrid1;
		protected dgNavigation DgNavigation1;
		protected System.Web.UI.WebControls.Button changesort;
		protected System.Web.UI.WebControls.Button Button1;
		
		utils u = new utils ();
		private void Page_Load(object sender, System.EventArgs e)
		{
			u.SetGridStyle(this.Datagrid1);
			DgNavigation1.SetTarget(Datagrid1,null,new BindDataDelegate(BindData));//BindData是你的数据邦定事件
			DgNavigation1.SetStyle(20, true);//10表示每页分10行，true表示无分页时自动隐藏
			if (!this.Page.IsPostBack)
			{
				BindData ();
				this.Button1.Attributes.Add("onclick","return confirm('您真的要删除吗？')");
			}
		}

		private void BindData ()
		{
			string cmd = "select bh,bt,fbsj,case sptype when 0 then (select judgename from rs_corsub where listid=judgeczy) else (select glyname from cnc_glyb where glydh=judgeczy) end as judge,(case iffinish when 0 then '<font color=red>审批中</font>' when '1' then '审批通过' when '2' then '待定' else '不通过' end) as status,finishdate from t_master order by bh desc";
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
			this.changesort.Click += new System.EventHandler(this.changesort_Click);
			this.Button1.Click += new System.EventHandler(this.Button1_Click);
			this.Load += new System.EventHandler(this.Page_Load);

		}
		#endregion

		private void changesort_Click(object sender, System.EventArgs e)
		{
			string id = utils.FindFirstCheckedItem(this.Datagrid1);
			if (id == "")
			{
				utils.Alert (this,"请选择一项");
				return;
			}
			u.OpenIEWindowRight (this,"spr_view_judge.aspx?id=" + id,800,600);
		}

		private void Button1_Click(object sender, System.EventArgs e)
		{
	//		string id = utils.FindFirstCheckedItem(this.Datagrid1);

			string id = utils.FindCheckedItem (this.Datagrid1);
			if (id == "")
			{
				utils.Alert (this,"至少选择一项");
				return;
			}
			string [] ids = id.Split(',');

			for (int i=0;i<ids.Length;i++)
			{
				/*
				//判断是否审批完成
				if (DBBase.IsValuesExists ("select 1 from t_master where iffinish=0 and bh=" + ids[i]))
				{
					continue;
				}
				*/
				//首先清理掉附件
				string cmd = "select spyy from t_master_child_yy where parentid in (select id from t_master_child where bh=" + ids[i] + ")";
				SqlDataReader dr = DBBase.ExecuteSqlReader (cmd);
				if (dr.HasRows)
				{
					while (dr.Read ())
					{
						File.Delete (Server.MapPath(dr[0].ToString ()));					
					}
				}
				dr.Close ();

				cmd = "select sqyy from t_master_yy where bh=" + ids[i];
				dr = DBBase.ExecuteSqlReader (cmd);
				if (dr.HasRows)
				{
					while (dr.Read ())
					{
						File.Delete (Server.MapPath(dr[0].ToString ()));					
					}
				}
				dr.Close ();

				//删除数据库记录
				string []cmds = new string[4];
				cmds[0] = "delete from t_master_child_yy where parentid in (select id from t_master_child where bh=" + ids[i] + ")";
				cmds[1] = "delete from t_master_child where bh=" + ids[i];
				cmds[2] = "delete from t_master_yy where bh=" + ids[i];
				cmds[3] = "delete from t_master where bh=" + ids[i];

				try
				{
					DBBase.ExecuteSqls (cmds);
				}
				catch (Exception ee)
				{
					
				}
			}
			BindData();
		}
	}
}
