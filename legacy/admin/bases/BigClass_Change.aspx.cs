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

namespace CNC.admin.bases
{
	/// <summary>
	/// BigClass_Change 的摘要说明。
	/// </summary>
	public class BigClass_Change : System.Web.UI.Page
	{
		protected System.Web.UI.WebControls.TextBox name;
		protected FreeTextBoxControls.FreeTextBox sBody;
		protected System.Web.UI.WebControls.Button save;
	
		private void Page_Load(object sender, System.EventArgs e)
		{
			if (!this.Page.IsPostBack)
			{
				string cmd = "select bigname,help from cnc_big where bigid='" + this.Request.QueryString["id"] + "'";
				SqlDataReader dr = DBBase.ExecuteSqlReader(cmd);
				if (dr.Read ())
				{
					this.name.Text = dr[0].ToString ();
					this.sBody.Text = dr[1].ToString ();
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
			string cmd = "update cnc_big set bigname='" + this.name.Text.Trim () + ",help='" + this.sBody.Text.Trim () + "' where bigid='" + this.Request.QueryString["id"];
			try
			{
				DBBase.ExecuteSql (cmd);
				utils.Alert (this,"更新成功");
			}
			catch
			{
				utils.Alert (this,"更新失败");
			}
		}
	}
}
