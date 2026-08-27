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
namespace jxc
{
	/// <summary>
	/// PopUp 的摘要说明。
	/// </summary>
	public class PopUp : System.Web.UI.Page
	{
		protected System.Web.UI.WebControls.Calendar calDate;
		protected System.Web.UI.HtmlControls.HtmlInputHidden control;
	
		private void Page_Load(object sender, System.EventArgs e)
		{
			if (!this.Page.IsPostBack)
			{
				control.Value = Request.QueryString["textbox"].ToString();
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
			this.calDate.SelectionChanged += new System.EventHandler(this.calDate_SelectionChanged);
			this.Load += new System.EventHandler(this.Page_Load);

		}
		#endregion

		public void calDate_SelectionChanged(object sender, System.EventArgs e)
		{
			if (this.Page.IsPostBack)
			{

				/*
				string  strScript = "<script>window.opener.document.forms(0)." + control.Value + ".value = '" ;
				strScript += calDate.SelectedDate.ToString("yyyy-MM-dd");
				strScript += "';window.opener.document.forms(0)." + control.Value + ".focus()";
				strScript += ";__doPostBack(window.opener.document.forms(0)." + control.Value + ".Id,'')";
				strScript += "';self.close()";

			//	strScript += "';self.close()";
				strScript += "</" + "script>";
				RegisterClientScriptBlock("anything",strScript);
				*/
				//document.getElementById(txt).value = "afadfadfa";

				string  strScript = "<script>var txt='" +  control.Value + "'";
				strScript += ";window.opener.document.getElementById(txt).value='";
				strScript += calDate.SelectedDate.ToString("yyyy-MM-dd HH:ss:mm");
				strScript += "';self.close()";

				strScript += ";window.opener.__doPostBack(txt,'')";
				
				//	strScript += "';self.close()";
				strScript += "</" + "script>";
				RegisterClientScriptBlock("anything",strScript);

			}
		}
	}
}
