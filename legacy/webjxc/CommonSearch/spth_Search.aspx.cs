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
	/// spth_Search 的摘要说明。
	/// </summary>
	public class spth_Search : jxc.UsrControl.UserPage//System.Web.UI.Page//
	{
		protected System.Web.UI.WebControls.DataGrid Datagrid1;
		protected System.Web.UI.WebControls.Button add;
		protected System.Web.UI.WebControls.Button query;
		protected System.Web.UI.WebControls.TextBox cpname;

		protected dgNavigation DgNavigation1;
		protected System.Web.UI.WebControls.DropDownList DropDownList1;
		protected System.Web.UI.WebControls.TextBox Textbox1;
		protected System.Web.UI.WebControls.TextBox Textbox2;
	
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
		//	string cmd = "select * from V销售明细 where 销售数量>0 and 地区='"+this.zjgmc.ToString()+"' and 店名='"+this.jgmc.ToString()+"'";
		//	string cmd="SELECT 地区, 店名, xsid, 客户名称, cpid, 产品名称, SUM(销售数量) AS 销售数量  from V_销售明细 where 地区='"+this.zjgmc.ToString()+"' and 店名='"+this.jgmc.ToString()+"'";
          string cmd="select 地区, 店名, xsid, 客户名称, cpid, 产品名称,单价,sum(销售数量) as 销售数量 from (SELECT [thid] AS xsid, [cpid], [产品名称], [出库日期] AS 销售日期, [可退数量] AS 销售数量,  [店名], [地区], [客户名称],单价";
                cmd+=" FROM [V_退货tmp] UNION SELECT xsid, [cpid], [产品名称], 销售日期, 销售数量, [店名], [地区], [客户名称],单价 FROM [V_销售tmp]) a ";
			    cmd+=" where 地区='"+this.zjgmc.ToString()+"' and 店名='"+this.jgmc.ToString()+"'";
			if (this.cpname.Text != string.Empty)
				cmd += " and (产品名称 like '%" + this.cpname.Text.Trim () + "%' or cpid='"+this.cpname.Text.Trim()+"')";

			if (this.Textbox1.Text !=string.Empty)
				cmd+=" and xsid='"+this.Textbox1.Text+"'";
			if (this.Textbox2.Text!=string.Empty)
				cmd+=" and 客户名称 like '%"+this.Textbox2.Text+"%'";
			DataSet ds = DBBase.ExecuteSql4Ds (cmd+" GROUP BY 地区, 店名, xsid, 客户名称, cpid, 产品名称,单价  order by xsid desc","spth");
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
				string cmd = "select * from 入库单 where 1=1 and rkid='"+id+"'";
				SqlDataReader dr = DBBase.ExecuteSqlReader (cmd);
				if (dr.Read ())
				{
					Selection=dr["产品名称"].ToString()+","+dr["cpid"].ToString()+","+dr["rkid"].ToString()+","+dr["入库单价"].ToString()+","+dr["产品类别"].ToString();
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
		private void delete_Click(object sender, System.EventArgs e)
		{
		
		}

		private void Datagrid1_SelectedIndexChanged(object sender, System.EventArgs e)
		{
			string Selection="";
			string id =Datagrid1.SelectedItem.Cells[3].Text;
			string id1 =Datagrid1.SelectedItem.Cells[1].Text;
			if (id!=null)
			{
//				string cmd = "select * from V销售明细 where 销售数量>0 and cpid='"+id+"' and xsid='"+id1+"'";
//				SqlDataReader dr = DBBase.ExecuteSqlReader (cmd);
//				if (dr.Read ())
//				{
//					Selection=dr["产品名称"].ToString()+","+dr["cpid"].ToString()+","+dr["xsid"].ToString()+","+dr["零售价"].ToString()+","+dr["zdbm"].ToString()+","+dr["销售数量"].ToString();
//				}产品名称,cpid,xsid,零售价,销售数量
				Selection=Datagrid1.SelectedItem.Cells[4].Text+","+Datagrid1.SelectedItem.Cells[3].Text+","+Datagrid1.SelectedItem.Cells[1].Text+","+Datagrid1.SelectedItem.Cells[7].Text+","+Datagrid1.SelectedItem.Cells[6].Text;
				Session.Add("Ret_Search_Value",Selection);
		    	JSUtil.ExecuteBlock(this,"window.returnValue=\"SubmitForm\"");
//				dr.Close();
			}
			JSUtil.CloseWindow(this);
		}
	}
}
