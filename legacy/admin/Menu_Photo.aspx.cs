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
	/// Menu_Photo 的摘要说明。
	/// </summary>
	public class Menu_Photo : jxc.UsrControl.UserPage
	{
		protected System.Web.UI.WebControls.DataList Datalist;
	
		private void Page_Load(object sender, System.EventArgs e)
		{
			if (!this.Page.IsPostBack)
			{
				string cmd ="select des,qxcd,imgpath from cnc_glyb_child where parentid=" + this.Request.QueryString["id"] + " and glydh='" + this.glydh + "'";
				DataSet ds = DBBase.ExecuteSql4Ds (cmd,"cnc_glyb_child");
				this.Datalist.DataSource = ds.Tables["cnc_glyb_child"].DefaultView;
				this.Datalist.DataBind ();
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
