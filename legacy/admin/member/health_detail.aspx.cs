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

namespace health.admin.member
{
	/// <summary>
	/// health_detail 的摘要说明。
	/// </summary>
	public class health_detail : System.Web.UI.Page
	{
		protected System.Web.UI.WebControls.Panel Panel1;
	
		private void Page_Load(object sender, System.EventArgs e)
		{
			if (!this.Page.IsPostBack)
			{

				string sfzh = this.Request.QueryString["sfzh"];
				string cmd = "select distinct drsj from dt_jc_aa where sfzh='" + sfzh + "'";
				SqlDataReader dr = DBBase.ExecuteSqlReader (cmd);
				while (dr.Read ())
				{
					Control cl = this.LoadControl("dt_jc_aa.ascx");
					((dt_jc_aa) cl).jcrq = dr[0].ToString (); 
					this.Panel1.Controls.Add(cl);
				}
				dr.Close ();

				cmd = "select distinct drsj from dt_jc_ab where sfzh='" + sfzh + "'";
				dr = DBBase.ExecuteSqlReader (cmd);
				while (dr.Read ())
				{
					Control cl = this.LoadControl("dt_jc_ab.ascx");
					((dt_jc_ab) cl).jcrq = dr[0].ToString (); 
					this.Panel1.Controls.Add(cl);
				}
				dr.Close ();

				cmd = "select distinct drsj from dt_jc_o where sfzh='" + sfzh + "'";
				dr = DBBase.ExecuteSqlReader (cmd);
				while (dr.Read ())
				{
					Control cl = this.LoadControl("dt_jc_o.ascx");
					((dt_jc_o) cl).jcrq = dr[0].ToString (); 
					this.Panel1.Controls.Add(cl);
				}
				dr.Close ();
				/*
				Control cl = this.LoadControl("dt_jc_aa.ascx");
				//((dt_jc_aa) cl).jcrq 
				this.Panel1.Controls.Add(cl);
				*/
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
