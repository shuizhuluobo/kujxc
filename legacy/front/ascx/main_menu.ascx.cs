namespace health.front.ascx
{
	using System;
	using System.Data;
	using System.Drawing;
	using System.Web;
	using System.Web.UI.WebControls;
	using System.Web.UI.HtmlControls;

	/// <summary>
	///		enter_menu 的摘要说明。
	/// </summary>
	public class enter_menu : System.Web.UI.UserControl
	{
		protected System.Web.UI.WebControls.DataList Datalist1;

		private void Page_Load(object sender, System.EventArgs e)
		{
			if (!this.Page.IsPostBack)
			{
				string cmd ="select id,des from cnc_info where parentid=" + this.Request.QueryString["id"] + " order by sortid asc";
				DataSet ds = DBBase.ExecuteSql4Ds (cmd,"cnc_info");
				this.Datalist1.DataSource = ds.Tables["cnc_info"].DefaultView;
				this.Datalist1.DataBind ();
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
