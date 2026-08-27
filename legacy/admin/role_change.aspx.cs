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

namespace jxc.admin
{
	/// <summary>
	/// role_change 的摘要说明。
	/// </summary>
	public class role_change : System.Web.UI.Page
	{
		protected System.Web.UI.WebControls.TextBox des;
		protected System.Web.UI.WebControls.Button save;
	
		private void Page_Load(object sender, System.EventArgs e)
		{
			if (!this.Page.IsPostBack)
			{
				string cmd = "select des from cnc_qxgroup where groupid=" + this.Request.QueryString["id"];
				SqlDataReader dr = DBBase.ExecuteSqlReader (cmd);
				dr.Read ();
				this.des.Text = dr[0].ToString ();
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
			string cmd = "update cnc_qxgroup set des='" + this.des.Text.Trim () + "' where groupid=" + this.Request.QueryString["id"];
			try
			{
				DBBase.ExecuteSql(cmd);
				utils.Alert (this,"修改角色成功");
			}
			catch
			{
				utils.Alert (this,"修改角色失败，系统已恢复到保存前的状态");
				return;
			}
		}
	}
}
