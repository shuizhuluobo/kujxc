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
using health.front.ascx;

namespace health
{
	/// <summary>
	/// one 的摘要说明。
	/// </summary>
	public class one : System.Web.UI.Page
	{
		protected System.Web.UI.WebControls.Panel Panel1;
		
		public string des = "";
		private void Page_Load(object sender, System.EventArgs e)
		{
			//if (!this.Page.IsPostBack)
			{
				string ifsing = "";
				string cmd = "select ifsing from cnc_info where id=" + this.Request.QueryString["id"];
				SqlDataReader dr = DBBase.ExecuteSqlReader (cmd);
				if (dr.Read())
				{
					ifsing = dr["ifsing"].ToString ();
				}
				dr.Close ();

				if (ifsing == "0")  //单条
				{
					Control c1 = this.LoadControl ("ascx/info_detail.ascx");

					info_detail il = (info_detail)c1;
					il.mm = this.Request.QueryString["id"];
					this.Panel1.Controls.Add (c1);
				}
				else
				{
					Control c1 = this.LoadControl ("ascx/info_list.ascx");

					info_list il = (info_list)c1;
					il.mm = this.Request.QueryString["id"];
					this.Panel1.Controls.Add (c1);

				}
				des = this.Request.QueryString["des"];
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
