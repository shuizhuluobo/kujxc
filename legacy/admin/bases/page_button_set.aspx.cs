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
	/// page_button_set 的摘要说明。
	/// </summary>
	public class page_button_set : System.Web.UI.Page
	{
		protected dgNavigation DgNavigation1;
		protected System.Web.UI.WebControls.CheckBox selectall;
		protected System.Web.UI.WebControls.Button add;
		protected System.Web.UI.WebControls.DataGrid Datagrid1;
		protected System.Web.UI.WebControls.DropDownList Dropdownlist1;
		protected System.Web.UI.WebControls.DropDownList gn;
		protected System.Web.UI.WebControls.Button query;
		utils u = new utils ();
		private void Page_Load(object sender, System.EventArgs e)
		{
			u.SetGridStyle(this.Datagrid1);
			DgNavigation1.SetTarget(Datagrid1,null,new BindDataDelegate(BindData));//BindData是你的数据邦定事件
			DgNavigation1.SetStyle(20, false);//10表示每页分10行，true表示无分页时自动隐藏
			if (!this.Page.IsPostBack)
			{
				utils.BindDropDownList ("select id,des from cnc_qxcdb where rank=0",this.Dropdownlist1);

				BindData ();
			}
		}
		private void BindData ()
		{
			string cmd = "select id,ids,idname,(select des from cnc_qxcdb where id=pageid) as des from cnc_qxcdb_child where 1=1 ";
			if (this.gn.SelectedIndex > 0)
				cmd += " and pageid=" + this.gn.SelectedItem.Value;

			DataSet ds = DBBase.ExecuteSql4Ds (cmd,"cnc_qxcdb_child");
			this.Datagrid1.DataSource = ds.Tables["cnc_qxcdb_child"].DefaultView;
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
			this.Dropdownlist1.SelectedIndexChanged += new System.EventHandler(this.Dropdownlist1_SelectedIndexChanged);
			this.query.Click += new System.EventHandler(this.query_Click);
			this.add.Click += new System.EventHandler(this.add_Click);
			this.Load += new System.EventHandler(this.Page_Load);

		}
		#endregion

		private void Dropdownlist1_SelectedIndexChanged(object sender, System.EventArgs e)
		{
			utils.BindDropDownList ("select id,des from cnc_qxcdb where rank!=0 and parentid=" + this.Dropdownlist1.SelectedItem.Value,this.gn);
		}

		private void query_Click(object sender, System.EventArgs e)
		{
			BindData ();
		}

		private void add_Click(object sender, System.EventArgs e)
		{
			u.OpenIEWindowRight (this,"page_button_add2.aspx",500,500);
		}
	}
}
