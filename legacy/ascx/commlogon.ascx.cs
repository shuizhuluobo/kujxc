namespace jxc.ascx
{
	using System;
	using System.Data;
	using System.Data.SqlClient;
	using System.Drawing;
	using System.Web;
	using System.Web.UI.WebControls;
	using System.Web.UI.HtmlControls;

	/// <summary>
	///		logon 的摘要说明。
	/// </summary>
	public class commlogon : System.Web.UI.UserControl
	{
		protected System.Web.UI.WebControls.TextBox name;
		protected System.Web.UI.WebControls.TextBox password;
		protected System.Web.UI.WebControls.Panel divPanel;
		public System.Web.UI.WebControls.DropDownList DropDownList1;
		protected System.Web.UI.WebControls.ImageButton logonin;

		public String UserId 
		{
			get 
			{
				return name.Text;
			}
			set 
			{
				name.Text = value;
			}
		}

		public String Password 
		{
			get 
			{
				return password.Text;
			}
			set 
			{
				password.Text = value;
			}
		}

		private void Page_Load(object sender, System.EventArgs e)
		{
			utils.BindDropDownList2("select number,countingroomname from System_DataBases where number='qlm003'",this.DropDownList1);
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
			this.logonin.Click += new System.Web.UI.ImageClickEventHandler(this.logonin_Click);
			this.Load += new System.EventHandler(this.Page_Load);

		}
		#endregion

		private void logonin_Click(object sender, System.Web.UI.ImageClickEventArgs e)
		{
		
		}


	}
}
