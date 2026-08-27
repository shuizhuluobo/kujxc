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
	/// sp_detail 的摘要说明。
	/// </summary>
	public class sp_detail : System.Web.UI.Page
	{
		protected System.Web.UI.HtmlControls.HtmlGenericControl view;
	
		private void Page_Load(object sender, System.EventArgs e)
		{
			if (!this.Page.IsPostBack)
			{
				string cmd = "select judgenr from t_master_child where id=" + this.Request.QueryString["id"];
				SqlDataReader dr = DBBase.ExecuteSqlReader (cmd);
				if (dr.Read ())
				{
					this.view.InnerHtml = dr[0].ToString ();
				}
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
