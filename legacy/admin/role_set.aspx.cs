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
using  jxc.ascx;

namespace jxc.admin
{
	/// <summary>
	/// role_set 的摘要说明。
	/// </summary>
	public class role_set : System.Web.UI.Page
	{
		protected System.Web.UI.WebControls.DataGrid Datagrid1;
		protected System.Web.UI.WebControls.Button add;
		protected System.Web.UI.WebControls.Button delete;
		protected System.Web.UI.WebControls.Button Button1;
	
		protected dgNavigation DgNavigation1;
		utils u = new utils ();
		private void Page_Load(object sender, System.EventArgs e)
		{
			u.SetGridStyle(this.Datagrid1);
			DgNavigation1.SetTarget(Datagrid1,null,new BindDataDelegate(BindData));//BindData是你的数据邦定事件
			DgNavigation1.SetStyle(20, true);//10表示每页分10行，true表示无分页时自动隐藏
			if (!this.Page.IsPostBack)
			{
				BindData ();
				delete.Attributes.Add("onclick","return confirm('您真的要删除吗？')");
			}
		}

		private void BindData ()
		{
			string id = this.Request.QueryString["id"];
			string cmd = "select * from cnc_qxgroup order by groupid";
			DataSet ds = DBBase.ExecuteSql4Ds (cmd,"cnc_qxgroup");
			this.Datagrid1.DataSource = ds.Tables["cnc_qxgroup"].DefaultView;
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
			this.delete.Click += new System.EventHandler(this.delete_Click);
			this.Button1.Click += new System.EventHandler(this.Button1_Click);
			this.Load += new System.EventHandler(this.Page_Load);

		}
		#endregion

		private void add_Click(object sender, System.EventArgs e)
		{
			u.OpenIEWindowRight (this,"role_add.aspx",400,400);
		}

		private void delete_Click(object sender, System.EventArgs e)
		{
			string id = utils.FindFirstCheckedItem (this.Datagrid1);
			if (id=="")
			{
				utils.Alert (this,"至少选择一项");
				return;
			}
			if (id == "0")
			{
				utils.Alert (this,"系统管理角色为系统保留不能删除");
				return;
			}
			string cmd = "delete from cnc_qxgroup where groupid=" + id;
			try
			{
				DBBase.ExecuteSql(cmd);
				utils.Alert (this,"删除角色成功");
			}
			catch
			{
				utils.Alert (this,"删除角色失败，系统已恢复到保存前的状态");
				return;
			}
		}

		private void Button1_Click(object sender, System.EventArgs e)
		{
			string id = utils.FindFirstCheckedItem (this.Datagrid1);
			if (id=="")
			{
				utils.Alert (this,"至少选择一项");
				return;
			}
			if (id == "0")
			{
				utils.Alert (this,"系统管理角色为系统保留不能修改");
				return;
			}
			u.OpenIEWindowRight(this,"role_change.aspx?id=" + id,400,400);
		}
	}
}
