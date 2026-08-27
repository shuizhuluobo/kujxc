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
using jxc.ascx;

namespace jxc.admin.bases
{
	/// <summary>
	/// role_set 的摘要说明。
	/// </summary>
	public class role_set : System.Web.UI.Page
	{
		protected System.Web.UI.WebControls.DataGrid Datagrid1;
		protected System.Web.UI.WebControls.Button add;
		protected System.Web.UI.WebControls.Button delete;
		protected System.Web.UI.WebControls.Button change;
	
		protected dgNavigation DgNavigation1;
		protected System.Web.UI.WebControls.CheckBox selectall;
		utils u = new utils ();
		private void Page_Load(object sender, System.EventArgs e)
		{
			u.SetGridStyle(this.Datagrid1);
			DgNavigation1.SetTarget(Datagrid1,null,new BindDataDelegate(BindData));//BindData是你的数据邦定事件
			DgNavigation1.SetStyle(20, false);//10表示每页分10行，true表示无分页时自动隐藏
			if (!this.Page.IsPostBack)
			{
				BindData ();
				delete.Attributes.Add("onclick","return confirm('您真的要删除吗？')");
			}
		}
		private void BindData ()
		{
			
			DataSet ds = DBBase.ExecuteSql4Ds ("select * from cnc_role","cnc_role");
			this.Datagrid1.DataSource = ds.Tables["cnc_role"].DefaultView;
			this.Datagrid1.DataBind ();
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
			this.add.Click += new System.EventHandler(this.add_Click);
			this.Load += new System.EventHandler(this.Page_Load);

		}
		#endregion

		private void add_Click(object sender, System.EventArgs e)
		{
			u.OpenIEWindowRight(this,"role_add.aspx",500,500);
		}
	}
}
