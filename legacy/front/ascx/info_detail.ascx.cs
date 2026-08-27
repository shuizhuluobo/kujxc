namespace health.front.ascx
{
	using System;
	using System.Data;
	using System.Data.SqlClient;
	using System.Drawing;
	using System.Web;
	using System.Web.UI.WebControls;
	using System.Web.UI.HtmlControls;

	/// <summary>
	///		info_detail 的摘要说明。
	/// </summary>
	public class info_detail : System.Web.UI.UserControl
	{
		public string bt="",nr="";

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
	//		if (!this.Page.IsPostBack)
			{
				string cmd = "select top 1 bt,fbsj,nr from t_master where judgestate=1 and lbbh=" + this._mm;
				SqlDataReader dr = DBBase.ExecuteSqlReader (cmd);
				if (dr.Read ())
				{
					bt = dr["bt"].ToString ();
					nr = dr["nr"].ToString ();
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
