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
	/// mem_login 的摘要说明。
	/// </summary>
	public class mem_login : health.UsrControl.UserPage2
	{
		protected System.Web.UI.WebControls.Panel Panel1;
	
		private void Page_Load(object sender, System.EventArgs e)
		{
			if (!this.Page.IsPostBack)
			{
				if(this.memtype == "0")
				{
					Control c1 = this.LoadControl ("ascx/personal_menu.ascx");
					this.Panel1.Controls.Add (c1);

				}
				else
				{
					Control c1 = this.LoadControl ("ascx/enter_menu.ascx");
					this.Panel1.Controls.Add (c1);
				}

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
			this.Load += new System.EventHandler(this.Page_Load);

		}
		#endregion
	}
}
