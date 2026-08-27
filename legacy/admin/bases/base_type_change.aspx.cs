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

namespace jxc.admin.bases
{
	/// <summary>
	/// base_type_change 的摘要说明。
	/// </summary>
	public class base_type_change : System.Web.UI.Page
	{
		protected System.Web.UI.WebControls.TextBox sortname;
		protected System.Web.UI.WebControls.TextBox remark;
		protected System.Web.UI.WebControls.Button save;
	
		private void Page_Load(object sender, System.EventArgs e)
		{
			if (!this.Page.IsPostBack)
			{
				string cmd = "select sortname,remark from rs_cormain where sortid=" + this.Request.QueryString["id"];
				SqlDataReader dr = DBBase.ExecuteSqlReader (cmd);
				if (dr.Read ())
				{
					this.sortname.Text = dr[0].ToString ();
					this.remark.Text = dr[1].ToString ();
				}
				dr.Close ();
			}
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
			this.save.Click += new System.EventHandler(this.save_Click);
			this.Load += new System.EventHandler(this.Page_Load);

		}
		#endregion

		private void save_Click(object sender, System.EventArgs e)
		{
			string cmd = "update rs_cormain set sortname='" + this.sortname.Text.Trim () + "',remark='" + this.remark.Text.Trim () + "' where sortid=" + this.Request.QueryString["id"];
			dboper oper = new dboper ();
			try
			{
				oper.Exec (cmd);
				utils.Alert (this,"保存成功");
			}
			catch(Exception ee)
			{
				utils.Alert (this,"存盘失败,系统已恢复到保存前的状态" + ee.Message);
			}
			finally
			{
				oper.shutdown ();
				oper = null;
			}
		}
	}
}
