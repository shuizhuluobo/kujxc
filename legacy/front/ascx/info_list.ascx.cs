namespace health.front.ascx
{
	using System;
	using System.Data;
	using System.Drawing;
	using System.Web;
	using System.Web.UI.WebControls;
	using System.Web.UI.HtmlControls;
	using health.ascx;

	/// <summary>
	///		info_list 的摘要说明。
	/// </summary>
	public class info_list : System.Web.UI.UserControl
	{

		protected dgNavigation DgNavigation1;
		protected System.Web.UI.WebControls.DataGrid dgfiList;
		
		public string mm;
		public string des;
		public string name;

		public string _mm
		{
			get{return mm;}
			set{mm = value;}
		}
		public string _des
		{
			get {return des;}
			set {des = value;}
		}
		public string _name
		{
			get {return name;}
			set {name = value;}
		}

		private void Page_Load(object sender, System.EventArgs e)
		{
			DgNavigation1.SetTarget(dgfiList, null,new BindDataDelegate(BindData));//BindData是你的数据邦定事件
			DgNavigation1.SetStyle(12, true);//10表示每页分10行，true表示无分页时自动隐藏

			BindData();
		}

		private void BindData ()
		{
			string cmd = "select bh,bt,fbsj,lbbh,'" + des + "' as dess,'" + name + "' as names from t_master where judgestate=1 and lbbh=" + _mm;
			DataSet ds = DBBase.ExecuteSql4Ds (cmd,"t_master");
			this.dgfiList.DataSource = ds.Tables["t_master"].DefaultView;
			this.dgfiList.DataBind ();
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
