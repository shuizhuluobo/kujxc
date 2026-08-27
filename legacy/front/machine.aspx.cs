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
	/// machine 的摘要说明。
	/// </summary>
	public class machine : System.Web.UI.Page
	{
		private void Page_Load(object sender, System.EventArgs e)
		{
			if (!this.Page.IsPostBack)
			{
				string ifend = this.Request.QueryString["ifend"];
				if (ifend == "0")
					this.Response.Redirect("two.aspx?id=" + this.Request.QueryString["id"] + "&des=" + this.Request.QueryString["des"]);
				else
					this.Response.Redirect("one.aspx?id=" + this.Request.QueryString["id"] + "&des=" + this.Request.QueryString["des"]);
				
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
