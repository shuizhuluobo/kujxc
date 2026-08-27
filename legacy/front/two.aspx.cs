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
	/// two 的摘要说明。
	/// </summary>
	public class two : System.Web.UI.Page
	{
		protected System.Web.UI.WebControls.Panel Panel1;
		public string des= "";
		public string name="";

		private void Page_Load(object sender, System.EventArgs e)
		{
			//if (!this.Page.IsPostBack)
			{
				string ifsing = "";
				string id = "",actid = "";

				des = this.Request.QueryString["des"];

				string cmd = "select top 1 id,ifsing,des from cnc_info";
				
				actid = this.Request.QueryString["actid"];
				if (actid != "" && actid != null)
					cmd += " where id = " + this.Request.QueryString["actid"];
				else
					cmd += " where parentid=" + this.Request.QueryString["id"]; 
				SqlDataReader dr = DBBase.ExecuteSqlReader (cmd);
				if (dr.Read ())
				{
					id = dr["id"].ToString ();
					ifsing = dr["ifsing"].ToString ();
					name = dr["des"].ToString ();
				}
				dr.Close ();

				if (ifsing == "0")  //单条
				{
					Control c1 = this.LoadControl ("ascx/info_detail.ascx");

					info_detail il = (info_detail)c1;
					il.mm = id;
					il.des = des;
					il.name = name;
					this.Panel1.Controls.Add (c1);
				}
				else
				{
					Control c1 = this.LoadControl ("ascx/info_list.ascx");

					info_list il = (info_list)c1;
					il.mm = id;
					il.des = des;
					il.name = name;
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
