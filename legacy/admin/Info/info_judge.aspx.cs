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

namespace jxc.admin.Info
{
	/// <summary>
	/// info_judge 的摘要说明。
	/// </summary>
	public class info_judge : jxc.UsrControl.UserPage
	{
		protected dgNavigation DgNavigation1;
		utils u = new utils ();
		protected System.Web.UI.WebControls.DataGrid Datagrid1;
		protected System.Web.UI.WebControls.Button judge;
		Common cn = new Common ();
		private void Page_Load(object sender, System.EventArgs e)
		{
			u.SetGridStyle(this.Datagrid1);
			DgNavigation1.SetTarget(Datagrid1,null,new BindDataDelegate(BindData));//BindData是你的数据邦定事件
			DgNavigation1.SetStyle(20, true);//10表示每页分10行，true表示无分页时自动隐藏
			if (!this.Page.IsPostBack)
			{
				BindData ();
			}
		}

		private void BindData ()
		{
			SqlDataReader dr=null,dr2=null;
			DataSet ds = DBBase.ExecuteSql4Ds ("select bh,bt,(select glyname from cnc_glyb where glydh=zz) as zz,writer,fbsj,(select des from cnc_info where cnc_info.id in (select parentid from cnc_info where cnc_info.id=t_master.lbbh)) as des0,(select des from cnc_info where cnc_info.id=t_master.lbbh) as des,lbbh,judgestate,(case judgestate when 0 then '未审核' else '已审核' end) as shzt  from t_master where judgestate=0 and lbbh is not null","t_master");
			DataTable dt = ds.Tables["t_master"].Clone();

			for (int i=0;i<ds.Tables["t_master"].Rows.Count;i++)
			{
				string cmd = "select ifend,id,judge1,parentid from cnc_info where  id=" + ds.Tables["t_master"].Rows[i]["lbbh"].ToString ();
				dr = DBBase.ExecuteSqlReader (cmd);
				if (dr.Read ())
				{
					if (dr["parentid"].ToString () == "0") //已经是最后一级分类了
					{
						if (dr["judge1"].ToString () == this.glydh)
						{
							DataRow drw = dt.NewRow ();
						
							for (int j=0;j<ds.Tables["t_master"].Columns.Count;j++)
								drw[j] = ds.Tables["t_master"].Rows[i][j];
							dt.Rows.Add (drw);
						}
					}
					else if (dr["parentid"].ToString () != "-1")  //如果不是最后一级分类，上推一级找到一级分类
					{
						dr2 = DBBase.ExecuteSqlReader ("select ifend,id,judge1,parentid from cnc_info where id =" + dr["parentid"].ToString ());
						if (dr2.Read ())
						{
							if (dr2["judge1"].ToString () == this.glydh)
							{
								DataRow drw = dt.NewRow ();
						
								for (int j=0;j<ds.Tables["t_master"].Columns.Count;j++)
									drw[j] = ds.Tables["t_master"].Rows[i][j];
								dt.Rows.Add (drw);
							}
						}
						dr2.Close ();
					}
					else
					{
					}
				}
				dr.Close ();
				
			}
			
			this.Datagrid1.DataSource = dt.DefaultView;
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
			this.judge.Click += new System.EventHandler(this.judge_Click);
			this.Load += new System.EventHandler(this.Page_Load);

		}
		#endregion

		private void judge_Click(object sender, System.EventArgs e)
		{
			string bh = utils.FindFirstCheckedItem (this.Datagrid1);
			if (bh == "")
			{
				utils.Alert (this,"请选择一项进行审核");
				return;
			}
			u.OpenIEWindowRight (this,"info_auditing.aspx?bh=" + bh,500,500);
		}
	}
}
