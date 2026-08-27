using System;
using System.Web.UI;

namespace jxc.UsrControl
{
	/// <summary>
	/// UserPage 的摘要说明。
	/// </summary>
	public class UserPage2 : Page
	{
		public UserPage2()
		{
		}

		protected override void OnLoad(EventArgs e)
		{
			if (this.memcode == "" )
			{
				Page.RegisterStartupScript("notadminlogin", "<script language='javascript'>alert('你还没有登录或者登录已超时');top.location='" +  "/front/index.aspx';</script>");
				return;
			}
			base.OnLoad(e);
		}

		protected void ShowAlert(string content)
		{
			Page.RegisterStartupScript("alertshow", "<script language='javascript'>alert('" + content + "')</script>");
		}

		protected void ShowAlertJump(string content, string path)
		{
			Page.RegisterStartupScript("alertshow", "<script language='javascript'>alert('" + content + "');window.location='" + path + "';</script>");
		}

		#region 全局Session变量定义
		public string memcode
		{
			get { return (Session["MEMCODE"] != null) ? Session["MEMCODE"].ToString () : ""; }
		}

		public string memname
		{
			get { return (Session["MEMNAME"] != null) ? Session["MEMNAME"].ToString() : ""; }
		}

		public string memtype
		{
			get { return (Session["MEMTYPE"] != null) ? Session["MEMTYPE"].ToString () : ""; }
		}

		
		#endregion
	}
}