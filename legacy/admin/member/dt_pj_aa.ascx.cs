namespace health.admin.member
{
	using System;
	using System.Data;
	using System.Drawing;
	using System.Web;
	using System.Web.UI.WebControls;
	using System.Web.UI.HtmlControls;

	/// <summary>
	///		dt_pj 的摘要说明。
	/// </summary>
	public class dt_pj : System.Web.UI.UserControl
	{
		protected System.Web.UI.WebControls.DataGrid Datagrid1;
		protected System.Web.UI.WebControls.Panel Panel1;

		utils u = new utils ();
		private void Page_Load(object sender, System.EventArgs e)
		{
			u.SetGridStyle (this.Datagrid1);
			if (!this.Page.IsPostBack)
			{
					
				string cmd = "select CLXT_TZ,TZTZ,CLJN_FHL,CLSZ_TJZS,CLXT_TQQ,CLSZ_DJZL,CLSZ_XZFYS1,CLSZ_WL,CLSZ_ZT,CLSZ_YWQZ,ZF,DJ from dt_pj_aa where sfzh='" + this.Request.QueryString["sfzh"] + "'";
				cmd += " union " + "select CLXT_TZ,TZTZ,CLJN_FHL,CLSZ_TJZS,CLXT_TQQ,CLSZ_DJZL,CLSZ_XZFYS1,CLSZ_WL,CLSZ_ZT,CLSZ_YWQZ,ZF,DJ from dt_pj_ab where sfzh='" + this.Request.QueryString["sfzh"] + "'";
				
				DataSet ds = DBBase.ExecuteSql4Ds (cmd,"dt_pj_aa");
				if (ds.Tables["dt_pj_aa"].Rows.Count == 0)
				{
					this.Panel1.Visible = false;
				}
				else
				{
					this.Datagrid1.DataSource = ds.Tables["dt_pj_aa"].DefaultView;
					this.Datagrid1.DataBind ();
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
		///		设计器支持所需的方法 - 不要使用代码编辑器
		///		修改此方法的内容。
		/// </summary>
		private void InitializeComponent()
		{
			this.Load += new System.EventHandler(this.Page_Load);

		}
		#endregion
	}
}
