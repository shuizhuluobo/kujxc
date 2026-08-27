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

namespace health.front
{
	/// <summary>
	/// change_pwd 的摘要说明。
	/// </summary>
	public class change_pwd : health.UsrControl.UserPage2
	{
		protected System.Web.UI.WebControls.TextBox tglydh;
		protected System.Web.UI.WebControls.TextBox ymm;
		protected System.Web.UI.WebControls.TextBox pwd1;
		protected System.Web.UI.WebControls.TextBox pwd2;
		protected System.Web.UI.WebControls.Button Button1;
	
		private void Page_Load(object sender, System.EventArgs e)
		{
			if (!this.Page.IsPostBack)
			{
				this.tglydh.Text = this.memcode;
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
			this.Button1.Click += new System.EventHandler(this.Button1_Click);
			this.Load += new System.EventHandler(this.Page_Load);

		}
		#endregion

		private void Button1_Click(object sender, System.EventArgs e)
		{
			if (this.ymm.Text.Trim () == "")
			{
				utils.Alert (this,"请输入原密码");
				return;
			}
			if (this.pwd1.Text.Trim () == "" || this.pwd2.Text.Trim() == "")
			{
				utils.Alert (this,"口令不能为空");
				return;
			}
			if (this.pwd1.Text.Trim () != this.pwd2.Text.Trim ())
			{
				utils.Alert (this,"两次新口令不一致");
				return;
			}

			string memtype = this.memtype;
			string cmd = "";
			cmd = "select 1 from dt_grxx where sfzh='" + this.memcode + "' and pwd='" + this.ymm.Text.Trim () + "'";
			if (!DBBase.IsValuesExists(cmd))
			{
				utils.Alert (this,"口令有误，请重新输入");
				return;
			}
			
			cmd = "update dt_grxx set pwd = '" + this.pwd1.Text.Trim () + "' where sfzh='" + this.memcode + "'"; 
			
			try
			{
				DBBase.ExecuteSql (cmd);
				utils.Alert (this,"修改口令成功");
			}
			catch
			{
				utils.Alert (this,"修改口令失败，请与管理员联系");
				return;
			}
		}
	}
}
