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
	/// dhdmxSelect_Search 的摘要说明。
	/// </summary>
	public class dhdmxSelect_Search : jxc.UsrControl.UserPage//System.Web.UI.Page//
	{
		protected System.Web.UI.WebControls.DataGrid Datagrid1;
		protected System.Web.UI.WebControls.Button add;
		protected System.Web.UI.WebControls.Button query;
		protected System.Web.UI.WebControls.TextBox cpname;

		protected dgNavigation DgNavigation1;
		protected System.Web.UI.WebControls.DropDownList DropDownList1;
		protected System.Web.UI.WebControls.TextBox Textbox1;
	
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
			this.Datagrid1.SelectedIndexChanged += new System.EventHandler(this.Datagrid1_SelectedIndexChanged);
			this.Load += new System.EventHandler(this.Page_Load);

		}
		#endregion
		private void BindData ()
		{
			//string cmd = "select * from 入库单 where 剩余数量<>0 and 仓库名称='"+this.zjgmc.ToString()+"' and 店名='"+this.jgmc.ToString()+"'";
		//	string cmd = "select *,(剩余数量-供退+客退) as 实际数量 from 入库单 where (单据标志='正常' or 单据标志='结转') and (剩余数量-供退+客退)>0 and 店名='"+this.jgmc.ToString()+"'";
			// [仓库名称], [店名], [cpid], [产品名称], [入库单编号], [进货价],[入库数量]
			string cmd ="select * from V_供应商退货明细 where 店名='"+this.jgmc.ToString()+"'";
	
			if (this.Textbox1.Text != string.Empty)
				cmd += " and (供应商 like '%" + this.Textbox1.Text.Trim () + "%')";
//								if (this.cpname.Text != string.Empty)
//				cmd += " and (产品名称 like '%" + this.cpname.Text.Trim () + "%'";
			if (this.cpname.Text != string.Empty)
				cmd += " and (产品名称 like '%" + this.cpname.Text.Trim () + "%' or cpid='"+this.cpname.Text.Trim()+"')";
//           if (this.DropDownList1.SelectedValue!="所有")
//				cmd +=" and 产品类别='"+this.DropDownList1.SelectedValue+"' ";
			DataSet ds = DBBase.ExecuteSql4Ds (cmd+" order by 入库日期 desc,产品名称","dhdmxSelect");
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
//			string Selection="";
//			string id = utils.FindFirstCheckedItem(this.Datagrid1);
//			if (id!=null)
//			{
//				string cmd = "select * from 入库单 where 1=1 and 入库单编号='"+id+"'";
//				SqlDataReader dr = DBBase.ExecuteSqlReader (cmd);
//				if (dr.Read ())
//				{
//					Selection=dr["产品名称"].ToString()+","+dr["cpid"].ToString()+","+dr["rkid"].ToString()+","+dr["入库单价"].ToString()+","+dr["产品类别"].ToString();
//				}
//				Session.Add("Ret_Search_Value",Selection);
//				JSUtil.ExecuteBlock(this,"window.returnValue=\"SubmitForm\"");
//			}
//						JSUtil.CloseWindow(this);

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
		private void delete_Click(object sender, System.EventArgs e)
		{
		
		}

		private void Datagrid1_SelectedIndexChanged(object sender, System.EventArgs e)
		{
			string Selection="";
			string id =Datagrid1.SelectedItem.Cells[1].Text;
			if (id!=null)
			{
//				string cmd = "select *,(剩余数量-供退+客退) as 实际数量 from 入库单 where rkid='"+id+"'";
//				SqlDataReader dr = DBBase.ExecuteSqlReader (cmd);
//				if (dr.Read ())
//				{
//		Selection=dr["产品名称"].ToString()+","+dr["cpid"].ToString()+","+dr["rkid"].ToString()+","+dr["进货价"].ToString()+","+dr["产品类别"].ToString()+","+dr["入库单价"].ToString()+","+dr["颜色"].ToString()+","+dr["型号"].ToString()+","+dr["规格"].ToString()+","+dr["实际数量"].ToString();
				//产品名称，cpid，xbid,进货价，产品类别， 进货价,退货数量
				Selection=Datagrid1.SelectedItem.Cells[4].Text+","+Datagrid1.SelectedItem.Cells[3].Text+","+Datagrid1.SelectedItem.Cells[9].Text+","+Datagrid1.SelectedItem.Cells[7].Text;
				Selection+=","+Datagrid1.SelectedItem.Cells[10].Text+","+Datagrid1.SelectedItem.Cells[7].Text+","+Datagrid1.SelectedItem.Cells[6].Text;//+","+dr["颜色"].ToString()+","+dr["型号"].ToString()+","+dr["规格"].ToString()+","+dr["实际数量"].ToString();

//				}
				Session.Add("Ret_Search_Value",Selection);
		    	JSUtil.ExecuteBlock(this,"window.returnValue=\"SubmitForm\"");
			}
			JSUtil.CloseWindow(this);
		}
	}
}
