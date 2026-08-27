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
	/// role_child_add 的摘要说明。
	/// </summary>
	public class role_child_add : System.Web.UI.Page
	{
		protected System.Web.UI.WebControls.Button save;
		protected System.Web.UI.WebControls.DropDownList gn;
		protected System.Web.UI.WebControls.DataList DataList1;
		protected System.Web.UI.WebControls.CheckBox CheckBox1;
		protected System.Web.UI.WebControls.DataGrid Datagrid1;
		protected System.Web.UI.WebControls.DropDownList Dropdownlist1;
		protected System.Web.UI.WebControls.Button view;
		protected System.Web.UI.WebControls.DropDownList role;
		utils u = new utils ();

		private void Page_Load(object sender, System.EventArgs e)
		{
			if(!this.Page.IsPostBack)
			{
				utils.BindDropDownList ("select roleid,role from cnc_role",this.role);
				utils.BindDropDownList ("select id,des from cnc_qxcdb where rank=0",this.Dropdownlist1);
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
			this.view.Click += new System.EventHandler(this.view_Click);
			this.Dropdownlist1.SelectedIndexChanged += new System.EventHandler(this.Dropdownlist1_SelectedIndexChanged);
			this.gn.SelectedIndexChanged += new System.EventHandler(this.gn_SelectedIndexChanged_1);
			this.save.Click += new System.EventHandler(this.save_Click);
			this.Load += new System.EventHandler(this.Page_Load);

		}
		#endregion

		private void save_Click(object sender, System.EventArgs e)
		{
			string [] cmds = new string[Datagrid1.Items.Count + 1];

			cmds[0] = " delete from cnc_role_child where roleid=" + this.role.SelectedItem.Value + " and pageid=" + this.gn.SelectedItem.Value ;
			for (int i=0;i<Datagrid1.Items.Count;i++)
			{
				//选中权限的项
				Label id =(Label)Datagrid1.Items[i].FindControl("labelid");
				CheckBox box = (CheckBox) Datagrid1.Items[i].Cells[0].FindControl("checkid");
				string power = "0";
				if (box.Checked)
					power = "1";
				cmds[i+1] = "insert into cnc_role_child(roleid,pageid,ids,idname,ifpower)values(" + this.role.SelectedItem.Value
					+ "," + this.gn.SelectedItem.Value + ",'" + id.Text.Trim () + "','" + box.Text + "'," + power + ")";

			}
			DBBase.ExecuteSqls (cmds);
			utils.Alert (this,"设置成功");
		}


		private void gn_SelectedIndexChanged_1(object sender, System.EventArgs e)
		{
			string cmd = "select ids,idname from cnc_qxcdb_child where pageid=" + this.gn.SelectedItem.Value ;
			DataSet ds = DBBase.ExecuteSql4Ds (cmd,"cnc_qxcdb_child");
			this.Datagrid1.DataSource = ds.Tables[0].DefaultView;
			this.Datagrid1.DataBind ();
		}

		private void Dropdownlist1_SelectedIndexChanged(object sender, System.EventArgs e)
		{
			utils.BindDropDownList ("select id,des from cnc_qxcdb where rank!=0 and parentid=" + this.Dropdownlist1.SelectedItem.Value,this.gn);
			
		}

		private void view_Click(object sender, System.EventArgs e)
		{
			if (this.role.SelectedIndex != 0)
			{
				u.OpenIEWindowRight(this,"role_child_view.aspx?id=" + this.role.SelectedItem.Value,500,500);
			}
		}
	}
}
