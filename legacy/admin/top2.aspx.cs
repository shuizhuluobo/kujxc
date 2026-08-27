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

namespace jxc.admin
{
	/// <summary>
	/// top2 的摘要说明。
	/// </summary>
	public class top2 : System.Web.UI.Page
	{
		public string regname = "";
		public string realname = "";
		public string memname = "";
		private void Page_Load(object sender, System.EventArgs e)
		{
			
			if (!this.Page.IsPostBack)
			{
				if (this.Session["GLYNAME"] == null || this.Session["GLYNAME"] == null)
				{
					string str = "<script language=\"javascript\"> parent.parent.location='report.aspx' </script>";
					this.Response.Write (str);
					return;
				}

				regname = this.Session["GLYDH"].ToString ();
				realname = this.Session["GLYNAME"].ToString ();
				memname = this.Session["GLMEMCODE"].ToString ();
				SqlDataReader dr = DBBase.ExecuteSqlReader ("select jgmc from cnc_jgglb where jgbh='" + memname + "'");
				dr.Read ();
				memname = dr[0].ToString ();
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
			this.Load += new System.EventHandler(this.Page_Load);
		}
		#endregion
	}
}
