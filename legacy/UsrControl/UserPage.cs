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

		public string glyname//操作员名称
		{
			get { return (Session["GLYNAME"] != null) ? Session["GLYNAME"].ToString() : ""; }
		}

		public string jgbh//机构编号
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

		public string jgmc//机构名称
		{
			get { return (Session["JGMC"] != null) ? Session["JGMC"].ToString () : ""; }
		}
		public string zjgmc//上级机构名称
		{
			get { return (Session["ZJGMC"] != null) ? Session["ZJGMC"].ToString () : ""; }
		}
		public string judger
		{
			get { return (Session["JUDGER"] != null) ? Session["JUDGER"].ToString () : ""; }
		}

		public string sljgbh
		{
			get { return (Session["SLJGBH"] != null) ? Session["SLJGBH"].ToString () : ""; }
		}
		public string groupname
		{
			get { return (Session["GROUPNAME"] != null) ? Session["GROUPNAME"].ToString () : ""; }
		}
		public string roleid
		{
			get { return (Session["ROLEID"] != null) ? Session["ROLEID"].ToString () : ""; }
		}
		#endregion
	}
}