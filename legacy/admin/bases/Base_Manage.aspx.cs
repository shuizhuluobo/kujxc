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

namespace jxc.admin.bases
{
	/// <summary>
	/// Base_Manage 的摘要说明。
	/// </summary>
	public class Base_Manage : jxc.UsrControl.UserPage
	{
		protected System.Web.UI.WebControls.DataGrid Datagrid1;
		protected System.Web.UI.WebControls.Button add;
		protected System.Web.UI.WebControls.Button delete;
		protected System.Web.UI.WebControls.DropDownList DropDownList1;
		protected System.Web.UI.WebControls.Button change;
	
		utils u = new utils ();
		private void Page_Load(object sender, System.EventArgs e)
		{
			u.SetGridStyle (this.Datagrid1);
			if (!this.Page.IsPostBack)
			{
				utils.BindDropDownList ("select sortid,sortname from rs_cormain",this.DropDownList1);
				delete.Attributes.Add("onclick","return confirm('您真的要删除吗？')");
			}

			if (this.rank!="0")
			{
				this.add.Visible=false;
				this.delete.Visible=false;
				this.change.Visible=false;
			}
			if (this.rank=="1")
			{
				this.add.Visible=true;
				this.delete.Visible=true;
				this.change.Visible=true;
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
		/// 设计器支持所需的方法 - 不要使用代码编辑器修改
		/// 此方法的内容。
		/// </summary>
		private void InitializeComponent()
		{    
			this.DropDownList1.SelectedIndexChanged += new System.EventHandler(this.DropDownList1_SelectedIndexChanged);
			this.add.Click += new System.EventHandler(this.add_Click);
			this.delete.Click += new System.EventHandler(this.delete_Click);
			this.change.Click += new System.EventHandler(this.change_Click);
			this.Load += new System.EventHandler(this.Page_Load);

		}
		#endregion

		private void DropDownList1_SelectedIndexChanged(object sender, System.EventArgs e)
		{
			BindData ();
		}
		private void BindData ()
		{
			if (this.DropDownList1.SelectedIndex>0)
			{
				string cmd = "select * from rs_corsub where sortid="+ this.DropDownList1.SelectedItem.Value;
				DataSet ds = DBBase.ExecuteSql4Ds (cmd,"rs_corsub");
				this.Datagrid1.DataSource = ds.Tables["rs_corsub"].DefaultView;
				this.Datagrid1.DataBind ();
				this.Datagrid1.Visible=true;
			}
			else
				this.Datagrid1.Visible=false;

		}

		private void add_Click(object sender, System.EventArgs e)
		{
			if (this.DropDownList1.SelectedIndex > 0)
			{
				string direction = "Base_Add.aspx?sortid=" + this.DropDownList1.SelectedItem.Value;
				u.OpenIEWindowRight (this,direction,400,400);
			}
		}

		private void delete_Click(object sender, System.EventArgs e)
		{
			string id = utils.FindFirstCheckedItem(this.Datagrid1);
			if (id == "")
			{
				utils.Alert (this,"请选择一项");
				return;
			}
			try
			{
				DBBase.ExecuteSql ("delete from rs_corsub where listid=" + id);
				utils.Alert (this,"删除成功");
				BindData ();
			}
			catch
			{
				utils.Alert (this,"删除失败");
			}
		}

		private void change_Click(object sender, System.EventArgs e)
		{
			string id = utils.FindFirstCheckedItem(this.Datagrid1);
			if (id == "")
			{
				utils.Alert (this,"请选择一项");
				return;
			}
			string direction = "Base_Change.aspx?id=" + id;
			u.OpenIEWindowRight (this,direction,400,400);
		}
	}
}
