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
	/// sprhelp 的摘要说明。
	/// </summary>
	public class sprhelp : System.Web.UI.Page
	{
		protected System.Web.UI.WebControls.DataGrid DataGrid1;
		protected System.Web.UI.HtmlControls.HtmlInputHidden control;
		protected System.Web.UI.HtmlControls.HtmlInputHidden Hidden1;
		utils u = new utils ();
		private void Page_Load(object sender, System.EventArgs e)
		{
			u.SetGridStyle(this.DataGrid1);
			if (!this.Page.IsPostBack)
			{
				this.control.Value = this.Session["TEXTBOX"].ToString ();
				this.Hidden1.Value = this.Session["HIDTEXTBOX"].ToString ();

				DataSet ds = DBBase.ExecuteSql4Ds ("select glydh,glyname,(select jgmc from cnc_jgglb where cnc_jgglb.jgbh=cnc_glyb.jgbh) as ssjg,(select listname from rs_corsub where sortid=6 and listid=rank) as zw from cnc_glyb where jgbh='" + this.Request.QueryString["id"] + "'","glyb");
				this.DataGrid1.DataSource = ds.Tables ["glyb"].DefaultView;
				this.DataGrid1.DataBind ();
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
			this.DataGrid1.ItemCommand += new System.Web.UI.WebControls.DataGridCommandEventHandler(this.DataGrid1_ItemCommand);
			this.Load += new System.EventHandler(this.Page_Load);

		}
		#endregion

		private void Button1_Click(object sender, System.EventArgs e)
		{
			
			
			
			//string  strScript = "<script>window.parent.close();";
			//strScript += "</" + "script>";
			//RegisterClientScriptBlock("anything",strScript);
		}

		private void DataGrid1_ItemCommand(object source, System.Web.UI.WebControls.DataGridCommandEventArgs e)
		{
			string listid = this.DataGrid1.DataKeys[e.Item.ItemIndex].ToString ();
			
			string listname = "";

			dboper oper = new dboper ();

			SqlDataReader dr = oper.GetData ("select glyname from cnc_glyb where glydh='" + listid + "'");
			dr.Read ();
			listname = dr["glyname"].ToString ();
			dr.Close ();
			oper.shutdown ();

			string  strScript = "<script>window.parent.opener.document.forms(0)." + this.control.Value + ".value = '" ;
			strScript += listname;
			strScript += "';window.parent.opener.document.forms(0)." + this.Hidden1.Value + ".value='";
			strScript += listid;
			strScript += "';window.parent.close();";
			strScript += "</" + "script>";
			RegisterClientScriptBlock("anything",strScript);
		}
	}
}
