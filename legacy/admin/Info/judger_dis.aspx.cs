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

namespace jxc.admin.Info
{
	/// <summary>
	/// judger_dis 的摘要说明。
	/// </summary>
	public class judger_dis : jxc.UsrControl.UserPage
	{
		protected System.Web.UI.WebControls.TextBox parentid;
		protected System.Web.UI.WebControls.DropDownList judge1;
		protected System.Web.UI.WebControls.Button save;
	
		private void Page_Load(object sender, System.EventArgs e)
		{
			if (!this.Page.IsPostBack)
			{
				utils.BindDropDownList ("select glydh,glyname from cnc_glyb where jgbh='" + this.jgbh + "'",this.judge1);
			//	utils.BindDropDownList ("select glydh,glyname from cnc_glyb where jgbh='" + this.jgbh + "'",this.judge2);
				string id = this.Request.QueryString["id"];
				string cmd = "select des from cnc_info where id=" +id;
				SqlDataReader dr = DBBase.ExecuteSqlReader (cmd);
				if (dr.Read ())
				{
					this.parentid.Text = dr[0].ToString ();
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
			if (this.judge1.SelectedIndex == 0)
			{
				utils.Alert (this,"请选择审批人");
				return;
			}
			string cmd = "update cnc_info set judge1='" + this.judge1.SelectedItem.Value + "' where id=" + this.Request.QueryString["id"];
			try
			{
				DBBase.ExecuteSql (cmd);
				utils.Alert (this,"保存成功");
			}
			catch
			{
				utils.Alert (this,"保存失败，请与管理员联系");
			}
		}
	}
}
