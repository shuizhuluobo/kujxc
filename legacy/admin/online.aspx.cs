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

namespace jxc.admin
{
	/// <summary>
	/// online 的摘要说明。
	/// </summary>
	public class online : jxc.UsrControl.UserPage
	{
		public string onlines = "";
		private void Page_Load(object sender, System.EventArgs e)
		{
			if (!this.Page.IsPostBack)
			{
				if (DBBase.IsValuesExists ("select 1 from icme_sms where receiver='" + this.glydh + "' and ifread=0"))
				{
					string str = "<script language=javascript> mytop=screen.availHeight-310;myleft=0;var newmsgwin=window.open('MsgMember.aspx?jgbh=" + this.glydh + "','auto_call_show','height=230,width=400,status=0,toolbar=no,menubar=no,location=no,scrollbars=yes,top='+mytop+',left='+myleft+',resizable=yes');newmsgwin.focus();</script>";
					this.Response.Write (str);
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
