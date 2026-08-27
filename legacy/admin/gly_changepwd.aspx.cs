using System;
using System.Collections;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Web;
using System.Web.SessionState;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Web.UI.HtmlControls;
using System.Web.Security;

namespace jxc.admin
{
	/// <summary>
	/// gly_changepwd 的摘要说明。
	/// </summary>
	public class gly_changepwd : jxc.UsrControl.UserPage
	{
		protected System.Web.UI.WebControls.TextBox ymm;
		protected System.Web.UI.WebControls.TextBox pwd1;
		protected System.Web.UI.WebControls.Button Button1;
		protected System.Web.UI.WebControls.TextBox tglydh;
		protected System.Web.UI.WebControls.TextBox pwd2;
	
		private void Page_Load(object sender, System.EventArgs e)
		{
			this.tglydh.Text = this.glydh;
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
			this.Button1.Click += new System.EventHandler(this.Button1_Click);
			this.Load += new System.EventHandler(this.Page_Load);

		}
		#endregion

		private void Button1_Click(object sender, System.EventArgs e)
		{
			if (this.Page.IsPostBack)
			{
				if (this.pwd1.Text.Trim () == "")
				{
					utils.Alert (this,"新密码不能为空！");
					return;
				}
				if (this.pwd2.Text.Trim () == "")
				{
					utils.Alert (this,"新密码不能为空！");
					return;
				}
				if (this.pwd1.Text.Trim () != this.pwd2.Text.Trim ())
				{
					utils.Alert (this,"两次新密码输入不一致！");
					return;
				}

			//	if (!DBBase.IsValuesExists ("select 1 from cnc_glyb where glydh='" + this.tglydh.Text.Trim () + "' and glymm='" + FormsAuthentication.HashPasswordForStoringInConfigFile(this.tglydh.Text.Trim () + this.ymm.Text.Trim (),"MD5") + "'"))
				if (!DBBase.IsValuesExists ("select 1 from cnc_glyb where glydh='" + this.tglydh.Text.Trim () + "' and glymm='"  + this.ymm.Text.Trim ()+ "'"))
				{
					utils.Alert (this,"原密码输入有误！");
					return;
				}
				try
				{
					DBBase.ExecuteSql ("update cnc_glyb set glymm='" + this.pwd2.Text.Trim () + "' where glydh='" + this.tglydh.Text.Trim () + "'");
					utils.Alert (this,"修改密码成功！");
				}
				catch
				{
					utils.Alert (this,"修改密码失败！");
				}
			}
		}
	}
}
