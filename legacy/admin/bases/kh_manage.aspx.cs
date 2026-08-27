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
	/// kh_manage 的摘要说明。
	/// </summary>
	public class kh_manage : System.Web.UI.Page
	{
		protected System.Web.UI.WebControls.DataGrid Datagrid1;
		protected System.Web.UI.WebControls.Button change;
		protected System.Web.UI.WebControls.Button delete;
		protected System.Web.UI.WebControls.Button add;
		protected System.Web.UI.WebControls.Button query;
		protected System.Web.UI.WebControls.TextBox cpname;

		protected dgNavigation DgNavigation1;
		protected System.Web.UI.WebControls.DropDownList DropDownList1;
		protected System.Web.UI.WebControls.Button Button1;
	
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
				Button1.Attributes.Add("onclick","return confirm('您真的要删除吗,删除后数据不可恢复!!!')");
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
			this.query.Click += new System.EventHandler(this.query_Click);
			this.add.Click += new System.EventHandler(this.add_Click);
			this.delete.Click += new System.EventHandler(this.delete_Click);
			this.change.Click += new System.EventHandler(this.change_Click);
			this.Button1.Click += new System.EventHandler(this.Button1_Click);
			this.Load += new System.EventHandler(this.Page_Load);

		}
		#endregion

		private void BindData ()
		{
			string cmd = "select * from 基础信息_客户档案 where 1=1  ";
			if (this.cpname.Text != string.Empty)
				cmd += " and 客户名称 like '%" + this.cpname.Text.Trim () + "%'";
//			if (this.DropDownList1.SelectedIndex==0)
//				cmd+=" and 是否下柜='否'";
//			if (this.DropDownList1.SelectedIndex==1)
//				cmd+=" and 是否下柜='是'";

			DataSet ds = DBBase.ExecuteSql4Ds (cmd+" order by 地区,客户名称 desc","kh");
			this.Datagrid1.DataSource = ds.Tables[0].DefaultView;
			this.Datagrid1.DataBind ();
		}

		private void query_Click(object sender, System.EventArgs e)
		{
			BindData ();
		}

		private void add_Click(object sender, System.EventArgs e)
		{
			//string id = utils.FindFirstCheckedItem(this.Datagrid1);
			u.OpenIEWindowRight(this,"kh_edit.aspx",500,500);
			
		}

		private void change_Click(object sender, System.EventArgs e)
		{
			string id = utils.FindFirstCheckedItem(this.Datagrid1);
			u.OpenIEWindowRight(this,"kh_edit.aspx?khid=" + id,500,500);
		}

		private void delete_Click(object sender, System.EventArgs e)
		{
					string id = utils.FindFirstCheckedItem(this.Datagrid1);
			//u.OpenIEWindowRight(this,"yplbsz_edit.aspx?cpid=" + id,500,500);
						string cmd="update 基础信息_客户档案 set 状态='停用' where 客户ID='"+id+"'";
						DBBase.ExecuteSql (cmd);
						BindData ();
		}

		private void Button1_Click(object sender, System.EventArgs e)
		{
			string id = utils.FindFirstCheckedItem(this.Datagrid1);
			string[] cmd=new string[2];
            cmd[0]="update 基础信息_客户档案 set 状态='停用' where 客户ID='"+id+"'";
			cmd[1]="delete 基础信息_客户档案 where 客户ID='"+id+"'";
			DBBase.ExecuteSqls (cmd);
			BindData (); 
		}
	}
}
