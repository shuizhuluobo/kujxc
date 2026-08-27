using System;
using System.Web.UI;

namespace jxc.UsrControl
{
	/// <summary>
	/// UserPage 的摘要说明。
	/// </summary>
	public class UserPage : Page
	{
		public UserPage()
		{
		}

		protected override void OnLoad(EventArgs e)
		{
			if (this.glydh == "" || this.glyname == "" || this.jgbh == "" || this.parents == "")
			{
				Page.RegisterStartupScript("notadminlogin", "<script language='javascript'>alert('你还没有登录或者登录已超时');top.location='" +  "/login.aspx';</script>");
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
		public string glydh
		{
			get { return (Session["GLYDH"] != null) ? Session["GLYDH"].ToString () : ""; }
		}

		public string glyname
		{
			get { return (Session["GLYNAME"] != null) ? Session["GLYNAME"].ToString() : ""; }
		}

		public string jgbh
		{
			get { return (Session["GLMEMCODE"] != null) ? Session["GLMEMCODE"].ToString () : ""; }
		}

		public string parents
		{
			get { return (Session["PARENT"] != null) ? Session["PARENT"].ToString () : ""; }
		}

		public string ifend
		{
			get { return (Session["IFEND"] != null) ? Session["IFEND"].ToString () : ""; }
		}

		public string rank
		{
			get { return (Session["RANK"] != null) ? Session["RANK"].ToString () : ""; }
		}

		public string jgmc
		{
			get { return (Session["JGMC"] != null) ? Session["JGMC"].ToString () : ""; }
		}
		public string judger
		{
			get { return (Session["JUDGER"] != null) ? Session["JUDGER"].ToString () : ""; }
		}

		public string sljgbh
		{
			get { return (Session["SLJGBH"] != null) ? Session["SLJGBH"].ToString () : ""; }
		}
		#endregion
	}
}