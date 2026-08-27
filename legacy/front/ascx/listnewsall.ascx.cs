namespace health.front.ascx
{
	using System;
	using System.Data;
	using System.Drawing;
	using System.Web;
	using System.Web.UI.WebControls;
	using System.Web.UI.HtmlControls;
	using System.Data.SqlClient;
	using health.ascx;

	/// <summary>
	///		listnews 的摘要说明。
	/// </summary>
	public abstract class listnewsall : System.Web.UI.UserControl
	{
		protected System.Web.UI.WebControls.DataGrid dgfiList;

		protected dgNavigation DgNavigation1;

		private void Page_Load(object sender, System.EventArgs e)
		{
			DgNavigation1.SetTarget(dgfiList, null,new BindDataDelegate(ShowData));//BindData是你的数据邦定事件
			DgNavigation1.SetStyle(12, false);//10表示每页分10行，true表示无分页时自动隐藏
			if (!this.Page.IsPostBack)
			{
				ShowData();
			}
				
		}
	
		private void ShowData()
		{
			String sql="SELECT bh,bt,zz,convert(char(10),fbsj,102) as fbsj,DATEDIFF(Day,fbsj, getdate()) as IsRed   FROM t_master  order by fbsj desc";
			DataSet ds = DBBase.ExecuteSql4Ds (sql,"index_news");
			
			dgfiList.DataSource =ds.Tables["index_news"].DefaultView;
			dgfiList.DataBind();
			
			//当日新闻用特殊色表示
			for (int i=0;i<dgfiList.Items.Count;i++)
			{
				Label lblIsRed=(Label)dgfiList.Items[i].FindControl("IsRed");
				Label lblCRed=(Label)dgfiList.Items[i].FindControl("CRed");
				if (lblIsRed.Text=="0")
				{
					lblCRed.ForeColor=ColorTranslator.FromHtml("#FF0000");
				}
			}
		}
		#region Web Form Designer generated code
		override protected void OnInit(EventArgs e)
		{
			//
			// CODEGEN：该调用是 ASP.NET Web 窗体设计器所必需的。
			//
			InitializeComponent();
			base.OnInit(e);
		}
		
		///		设计器支持所需的方法 - 不要使用
		///		代码编辑器修改此方法的内容。
		/// </summary>
		private void InitializeComponent()
		{
			this.Load += new System.EventHandler(this.Page_Load);

		}
		#endregion

		
	}
}
