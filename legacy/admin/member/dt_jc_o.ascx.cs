namespace health.admin.member
{
	using System;
	using System.Data;
	using System.Drawing;
	using System.Web;
	using System.Web.UI.WebControls;
	using System.Web.UI.HtmlControls;

	/// <summary>
	///		dt_jc_o 的摘要说明。
	/// </summary>
	public class dt_jc_o : System.Web.UI.UserControl
	{
		protected System.Web.UI.WebControls.DataGrid Datagrid1;
		protected System.Web.UI.WebControls.Panel Panel1;

		utils u = new utils ();
		public string sfzh="";

		public string jcrq;

		public string _jcrq
		{
			get{return jcrq;}
			set{jcrq = value;}
		}
		private void Page_Load(object sender, System.EventArgs e)
		{
			sfzh = this.Request.QueryString["sfzh"];
			u.SetGridStyle (this.Datagrid1);
			if (!this.Page.IsPostBack)
			{
		  string cmd = "select 1 as bh,'数据'as des,CLXT_SG,CLXT_TZ,CLJN_FHL,CLXT_TQQ,CLSZ_DJZL,CLSZ_XZFYS1,CLSZ_WL,'' as ZF,'' as DJ from dt_jc_o where sfzh='" + this.Request.QueryString["sfzh"] + "' and drsj='" + this.jcrq + "'";
		  cmd += " union " + "select 2 as bh,'评价'as des,TZTZ as CLXT_SG,CLXT_TZ,CLJN_FHL,CLXT_TQQ,CLSZ_DJZL,CLSZ_XZFYS1,CLSZ_WL,ZF,(select b_dj.dj from b_dj where b_dj.id=dt_pj_o.dj) as DJ from dt_pj_o where sfzh='" + this.Request.QueryString["sfzh"] + "' and drsj='" + this.jcrq + "'";
				DataSet ds = DBBase.ExecuteSql4Ds (cmd,"dt_jc_o");
				if (ds.Tables["dt_jc_o"].Rows.Count == 0)
				{
					this.Panel1.Visible = false;
				}
				else
				{
					this.Datagrid1.DataSource = ds.Tables["dt_jc_o"].DefaultView;
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
