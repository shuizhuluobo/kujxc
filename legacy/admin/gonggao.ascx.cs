namespace jxc.admin
{
	using System;
	using System.Data;
	using System.Drawing;
	using System.Web;
	using System.Web.UI.WebControls;
	using System.Web.UI.HtmlControls;

	/// <summary>
	///		gonggao 的摘要说明。
	/// </summary>
	public class gonggao : System.Web.UI.UserControl
	{
		protected System.Web.UI.WebControls.DataGrid dgfiList;

		private void Page_Load(object sender, System.EventArgs e)
		{
			if (!this.Page.IsPostBack)
			{
				//string cmd = "select bh,bt,cnc_glyb.glyname as zz,fbsj from t_master2,cnc_glyb where t_master2.zz=cnc_glyb.glydh    order by cnc_glyb.rank asc ,fbsj desc";
				string cmd = "select top 10 bh,bt,cnc_glyb.glyname as zz,fbsj,(select orderid from rs_corsub where listid=cnc_glyb.rank) as orderid from t_master2,cnc_glyb where t_master2.zz=cnc_glyb.glydh  order by orderid asc ,fbsj desc";
				
				DataSet ds = DBBase.ExecuteSql4Ds (cmd,"t_master2");
				this.dgfiList.DataSource = ds.Tables[0].DefaultView;
				this.dgfiList.DataBind ();
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
