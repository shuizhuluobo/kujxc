using System;
using System.Collections;
using System.ComponentModel;
using System.Data;
using System.Data.SqlClient;
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
	/// khSelect_Search 的摘要说明。
	/// </summary>
	public class khSelect_Search : System.Web.UI.Page
	{
		protected System.Web.UI.WebControls.DataGrid Datagrid1;
		protected System.Web.UI.WebControls.Button add;
		protected System.Web.UI.WebControls.Button query;
		protected System.Web.UI.WebControls.TextBox cpname;

		protected dgNavigation DgNavigation1;
	
		utils u = new utils ();

		private void Page_Load(object sender, System.EventArgs e)
		{
		//	Datagrid1.OnDblClick+=new CustomControl.DataGridPro.dlgtDblClickEventHandler(Datagrid1_OnDblClick);
		//	Datagrid1.OnDblClick+=new DataGrid.

			u.SetGridStyle(this.Datagrid1);
			DgNavigation1.SetTarget(Datagrid1,null,new BindDataDelegate(BindData));//BindData是你的数据邦定事件
			DgNavigation1.SetStyle(20, false);//10表示每页分10行，true表示无分页时自动隐藏
			if (!this.Page.IsPostBack)
			{
				
				BindData ();
				//delete.Attributes.Add("onclick","return confirm('您真的要删除吗？')");
				//change.Attributes.Add("onclick","return confirm('您真的确认已经到货？')");
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
			this.add.Click += new System.EventHandler(this.change_Click);
			this.Datagrid1.ItemDataBound += new System.Web.UI.WebControls.DataGridItemEventHandler(this.Datagrid1_ItemDataBound);
			this.Datagrid1.SelectedIndexChanged += new System.EventHandler(this.Datagrid1_SelectedIndexChanged);
			this.Load += new System.EventHandler(this.Page_Load);

		}
		#endregion
		private void BindData ()
		{
			string cmd = "select * from 基础信息_客户档案 where 1=1 ";
			if (this.cpname.Text != string.Empty)
				cmd += " and 客户名称 like '%" + this.cpname.Text.Trim () + "%' or 助记码 like '%" + this.cpname.Text.Trim () + "%'";

			DataSet ds = DBBase.ExecuteSql4Ds (cmd,"rySelect");
			this.Datagrid1.DataSource = ds.Tables[0].DefaultView;
			this.Datagrid1.DataBind ();

		}

		private void query_Click(object sender, System.EventArgs e)
		{
			BindData ();
		}

		private void add_Click(object sender, System.EventArgs e)
		{
	
		}

		private void change_Click(object sender, System.EventArgs e)
		{
			string Selection="";
			string id = utils.FindFirstCheckedItem(this.Datagrid1);
			if (id!=null)
			{
				string cmd = "select * from 基础信息_客户档案 where 1=1 and 客户ID='"+id+"'";
				SqlDataReader dr = DBBase.ExecuteSqlReader (cmd);
				if (dr.Read ())
				{
					Selection=dr["客户ID"].ToString()+","+dr["客户名称"].ToString()+","+dr["联系人"].ToString();
				}
				Session.Add("Ret_Search_Value",Selection);
				JSUtil.ExecuteBlock(this,"window.returnValue=\"SubmitForm\"");
			}
						JSUtil.CloseWindow(this);

		}
		//双击事件
		private void Datagrid1_OnDblClick(ref System.Web.UI.WebControls.DataGrid theDataGrid, int iMouseDblClickedRowIndex, int iMouseDblClickedColumnIndex)
		{
			string Selection;//存放表格里选中的每行
			int i;
			//关键字的所在的列序号
//			i=Datagrid1.GetFirstSelectedItemIndex();
//			Selection=DataGridPro1.theDataGrid.Items[i].Cells[0].Text+","+DataGridPro1.theDataGrid.Items[i].Cells[1].Text ;
//			Session.Add("Ret_Search_Value",Selection);
//			JSUtil.ExecuteBlock(this,"window.returnValue=\"SubmitForm\"");
//			JSUtil.CloseWindow(this);

		}
		private void     DoItemSelect(Object objSource,DataGridCommandEventArgs objArgs)       
		{       
			if     (objArgs.CommandName=="Select")       
			{       
                                                                              
				//MyDataGrid.SelectedIndex=objArgs.Item.ItemIndex;       
				//BindDataGrid();                                                                                                
				int xx=objArgs.Item.ItemIndex; 
				JSUtil.Close(this);
			}       
		}     


		private void Datagrid1_ItemDataBound(object sender, System.Web.UI.WebControls.DataGridItemEventArgs e)
		{
			//e.Item.Attributes.Add("OnClick",Page.GetPostBackClientEvent(e.Item.Cells[4].Controls[0],String.Empty)); 
		//	String xx=e.Item.Cells[1].Text;
		}

		private void Datagrid1_SelectedIndexChanged(object sender, System.EventArgs e)
		{
          //  String xx=Datagrid1.SelectedItem.Cells[1].Text;
			string Selection="";
			string id = Datagrid1.SelectedItem.Cells[1].Text;
			if (id!=null)
			{
				string cmd = "select * from 基础信息_客户档案 where 1=1 and 客户ID='"+id+"'";
				SqlDataReader dr = DBBase.ExecuteSqlReader (cmd);
				if (dr.Read ())
				{
					Selection=dr["客户ID"].ToString()+","+dr["客户名称"].ToString()+","+dr["联系人"].ToString();
				}
				Session.Add("Ret_Search_Value",Selection);
				JSUtil.ExecuteBlock(this,"window.returnValue=\"SubmitForm\"");
			}
			JSUtil.CloseWindow(this);
		}
	}
}
