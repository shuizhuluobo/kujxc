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
using System.Data.SqlClient;

namespace jxc.admin.bases
{
	/// <summary>
	/// khdzd_manage 的摘要说明。
	/// </summary>
	public class khdzd_manage : jxc.UsrControl.UserPage//System.Web.UI.Page
	{
		protected System.Web.UI.WebControls.Button change;
		protected System.Web.UI.WebControls.Button delete;
		protected System.Web.UI.WebControls.Button add;
		protected System.Web.UI.WebControls.Button query;
		protected System.Web.UI.WebControls.TextBox cpname;

		protected dgNavigation DgNavigation1;
		protected System.Web.UI.WebControls.DropDownList DropDownList1;
		protected System.Web.UI.WebControls.DropDownList DropDownList2;
		protected System.Web.UI.WebControls.TextBox Textbox2;
		protected System.Web.UI.WebControls.TextBox Textbox1;
		protected System.Web.UI.WebControls.CheckBox CheckBox1;
		protected System.Web.UI.WebControls.Label Label1;
		protected System.Web.UI.WebControls.Label Label2;
		protected System.Web.UI.WebControls.DataGrid Datagrid1;
		protected System.Web.UI.WebControls.TextBox Textbox3;
		protected System.Web.UI.WebControls.Label Label3;
		protected System.Web.UI.WebControls.CheckBox Checkbox2;
	
		utils u = new utils ();

		private void Page_Load(object sender, System.EventArgs e)
		{
			u.SetGridStyle4(this.Datagrid1);
		//	DgNavigation1.SetTarget(Datagrid1,null,new BindDataDelegate(BindData));//BindData是你的数据邦定事件
			//DgNavigation1.SetStyle(20, true);//10表示每页分10行，true表示无分页时自动隐藏
			if (!this.Page.IsPostBack)
			{
                Textbox1.Text=string.Format("{0:yyyy-MM-dd}",DateTime.Now.AddDays(-7));
				Textbox2.Text=string.Format("{0:yyyy-MM-dd}",DateTime.Now.AddDays(1));		
			//	TextBox2.Text=str1;
				BindData ();
				
				//delete.Attributes.Add("onclick","return confirm('您真的要删除吗？')");
				change.Attributes.Add("onclick","return confirm('您真的确认已经对帐？')");
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
			this.change.Click += new System.EventHandler(this.change_Click);
			this.delete.Click += new System.EventHandler(this.delete_Click);
			this.Datagrid1.ItemDataBound += new System.Web.UI.WebControls.DataGridItemEventHandler(this.Datagrid1_ItemDataBound);
			this.Datagrid1.SelectedIndexChanged += new System.EventHandler(this.Datagrid1_SelectedIndexChanged);
			this.Load += new System.EventHandler(this.Page_Load);

		}
		#endregion

		private void BindData ()
		{
		//string cmd = "select *,(剩余数量+客退-供退) as 实际库存 from 入库单 where 1=1 ";//and 仓库名称='"+this.zjgmc.ToString()+"'";
		//	string cmd = "select * from 入库单 where 剩余数量<>0 ";
//			string cmd="select *,入库数量 * 进货价 as 金额 from (SELECT [rkid], [店名],[供应商], [产品名称], [cpid], [仓库名称] as 地区,";
//cmd+="[进货价], [入库数量], [入库日期] FROM [r_进货明细]";
//cmd+="union ";
//cmd+="SELECT xsid as rkid, [店名], [客户名称] as 供应商,[产品名称],[cpid],[地区],"; 
//cmd+="[进货价] ,[出库数量] as 入库数量,[销售日期] as 入库日期  FROM [r_退供应商明细] ) a where 1=1 ";
			
string cmd="select *,出库数量 * 零售价 as 金额 from (SELECT [xsid], [销售日期],[客户名称],[店名],地区,  [cpid],  ";
cmd+=" [出库数量], [零售价], [进货价], [产品名称],对帐状态,'xsid' as dh,zdbm  FROM [r_出库明细] ";
cmd+=" union ";
cmd+=" SELECT [thid] as xsid, [退货日期] as 销售日期, [客户名称], [店名], [地区], [cpid], ";
cmd+=" [出库数量], [零售价], [进货价],  [产品名称],对帐状态,'thid' as dh,zdbm FROM [r_客户退货明细] ) a where 1=1 ";
			string cmd1="select sum(出库数量 * 零售价) as 金额 from (SELECT [xsid], [销售日期],[客户名称],[店名],地区,  [cpid],  ";
			cmd1+=" [出库数量], [零售价], [进货价], [产品名称],对帐状态,'xsid' as dh,zdbm  FROM [r_出库明细] ";
			cmd1+=" union ";
			cmd1+=" SELECT [thid] as xsid, [退货日期] as 销售日期, [客户名称], [店名], [地区], [cpid], ";
			cmd1+=" [出库数量], [零售价], [进货价],  [产品名称],对帐状态,'thid' as dh,zdbm FROM [r_客户退货明细] ) a where 1=1 ";
			if (this.Textbox3.Text != string.Empty)
			{
				cmd += " and 产品名称 like '%" + this.Textbox3.Text.Trim()+"%'";
				cmd1 += " and 产品名称 like '%" + this.Textbox3.Text.Trim()+"%'";
			}
			if  (Checkbox2.Checked)
			{
				if (this.cpname.Text != string.Empty)
				{
					cmd += " and 客户名称 like '%" + this.cpname.Text.Trim () + "%'";
					cmd1 += " and 客户名称 like '%" + this.cpname.Text.Trim () + "%'";
				}
			}
			else
			{
				cmd += " and 客户名称 = '" + this.cpname.Text.Trim () + "'";
				cmd1 += " and 客户名称 = '" + this.cpname.Text.Trim () + "'";
			}
			if (this.DropDownList1.SelectedItem.Value=="否")
			{
				cmd+=" and 对帐状态='否'";
				cmd1+=" and 对帐状态='否'";
			}
			if (this.DropDownList1.SelectedItem.Value=="是")
			{
				cmd+=" and 对帐状态='是'";
				cmd1+=" and 对帐状态='是'";
			}
			if (this.DropDownList2.SelectedIndex==0)
			{
				cmd+=" and 到货确认='否'";
				cmd1+=" and 到货确认='否'";
			}
			if (this.DropDownList2.SelectedIndex==1)
			{
				cmd+=" and 到货确认='是'";
				cmd1+=" and 到货确认='是'";
			}
			if (CheckBox1.Checked)
			{
				cmd+=" and 销售日期 between '"+this.Textbox1.Text.ToString()+"' and '"+this.Textbox2.Text.ToString()+"' ";
				cmd1+=" and 销售日期 between '"+this.Textbox1.Text.ToString()+"' and '"+this.Textbox2.Text.ToString()+"' ";
			}
          

			DataSet ds = DBBase.ExecuteSql4Ds (cmd+" order by 销售日期 desc","khdzd");
			this.Datagrid1.DataSource = ds.Tables[0].DefaultView;
			this.Datagrid1.DataBind ();

			SqlDataReader dr = DBBase.ExecuteSqlReader (cmd1);
			if (dr.Read ())
			{
				Label3.Text="总计:"+dr["金额"].ToString();  
			}
			dr.Close();

		}

		private void query_Click(object sender, System.EventArgs e)
		{
			BindData ();
		}

		private void add_Click(object sender, System.EventArgs e)
		{
			//string id = utils.FindFirstCheckedItem(this.Datagrid1);
			u.OpenIEWindowRight(this,"khdzd_edit.aspx",600,600);
			
		}

		private void change_Click(object sender, System.EventArgs e)
		{
			string id = utils.FindFirstCheckedItem(this.Datagrid1);
			//string id=utils.FindCheckedItem(this.Datagrid1);

			//


			string cmd="update 销售明细批次 set 对帐状态='是' where zdbm='"+id.ToString()+"'";
			DBBase.ExecuteSql(cmd);
            
			cmd="select xsid,thid FROM  销售明细批次 where zdbm="+id.ToString();
			SqlDataReader dr = DBBase.ExecuteSqlReader (cmd);
			if (dr.HasRows)
			{
				if (dr["xsid"].ToString()!="")
				{
					cmd="update 销售明细批次 set 对帐状态='是' where xsid='"+dr["xsid"].ToString() +"'";
					DBBase.ExecuteSql(cmd);
				}
			}
			dr.Close();
//			string id = utils.FindFirstCheckedItem(this.Datagrid1);
//			string cmd="select *,出库数量 * 零售价 as 金额 from (SELECT [xsid], [销售日期],[客户名称],[店名],地区,  [cpid],  ";
//			cmd+=" [出库数量], [零售价], [进货价], [产品名称],对帐状态,'xsid' as dh  FROM [r_出库明细] ";
//			cmd+=" union ";
//			cmd+=" SELECT [thid] as xsid, [退货日期] as 销售日期, [客户名称], [店名], [地区], [cpid], ";
//			cmd+=" [出库数量], [零售价], [进货价],  [产品名称],对帐状态,'thid' as dh FROM [r_客户退货明细] ) a where 1=1 ";			
//			SqlDataReader dr = DBBase.ExecuteSqlReader (cmd);
//			if (dr.HasRows)
//			{
//				if (dr.Read())
//					if (dr["标志"].ToString()=="正常")
//					{
//						cmd="update 入库单 set 对帐状态='是' where rkid='"+id.ToString()+"'";
//						DBBase.ExecuteSql(cmd);
//						dr.Close();
//						BindData ();
//						return;
//					}
//					else
//					{
//						cmd="update 销售单 set 对帐状态='是' where xsid='"+id.ToString()+"'";
//						DBBase.ExecuteSql(cmd);
//						dr.Close();
//						BindData ();
//						return;
//					}
//			}
//	    
		}


		private void delete_Click(object sender, System.EventArgs e)
		{
			u.OpenIEWindowPrint(this,"khdzd_managemx.aspx",800,600);
		}

		private void Datagrid1_ItemDataBound(object sender, System.Web.UI.WebControls.DataGridItemEventArgs e)
		{
			//  确定是数据行而非页首或页尾
			if (e.Item.ItemType == ListItemType.Item || e.Item.ItemType == ListItemType.AlternatingItem)
			{
				//  取得 manager 字段的值
				string isManager = (string)DataBinder.Eval(e.Item.DataItem, "对帐状态");

				if (isManager == "是")
				{
					//  设置文本及背景颜色.
					e.Item.Cells[11].Text = "是";
					e.Item.Cells[11].ForeColor=System.Drawing.Color.Red;
				}
//				else
//				{
//					  仅设置文本.
//					e.Item.Cells[2].Text = "";
//					e.Item.Cells[13].Text = "已发货";
//					e.Item.Cells[13].ForeColor=System.Drawing.Color.Blue;
//				}
//				isManager = (string)DataBinder.Eval(e.Item.DataItem, "到货确认");
//
//				if (isManager == "否")
//				{
//					//  设置文本及背景颜色.
//					e.Item.Cells[12].Text = "未到货";
//					e.Item.Cells[12].ForeColor=System.Drawing.Color.Red;
//				}
//				else
//				{
//					//  仅设置文本.
//					//e.Item.Cells[2].Text = "";
//					e.Item.Cells[12].Text = "已到货";
//					e.Item.Cells[12].ForeColor=System.Drawing.Color.Blue;
//				}
			}
			for(int i=0;i<Datagrid1.Items.Count-1;i++)
			{   
				int colnum=1;
				int j;
				for( j=i+1;j<Datagrid1.Items.Count;j++)
				{
					if(Datagrid1.Items[i].Cells[1].Text==Datagrid1.Items[j].Cells[1].Text)      
					{
						colnum++;
						Datagrid1.Items[i].Cells[1].RowSpan=colnum;
						Datagrid1.Items[j].Cells[1].Visible=false;     
						Datagrid1.Items[i].Cells[0].RowSpan=colnum;
						Datagrid1.Items[j].Cells[0].Visible=false; 
//						Datagrid1.Items[i].Cells[2].RowSpan=colnum;
//						Datagrid1.Items[j].Cells[2].Visible=false;
//						Datagrid1.Items[i].Cells[3].RowSpan=colnum;
//						Datagrid1.Items[j].Cells[3].Visible=false;
//						Datagrid1.Items[i].Cells[7].RowSpan=colnum;
//						Datagrid1.Items[j].Cells[7].Visible=false;
//						Datagrid1.Items[i].Cells[8].RowSpan=colnum;
//						Datagrid1.Items[j].Cells[8].Visible=false;
						Datagrid1.Items[i].Cells[9].RowSpan=colnum;
						Datagrid1.Items[j].Cells[9].Visible=false;
						Datagrid1.Items[i].Cells[10].RowSpan=colnum;
						Datagrid1.Items[j].Cells[10].Visible=false;
						Datagrid1.Items[i].Cells[11].RowSpan=colnum;
						Datagrid1.Items[j].Cells[11].Visible=false;
//						Datagrid1.Items[i].Cells[12].RowSpan=colnum;
//						Datagrid1.Items[j].Cells[12].Visible=false;
//						Datagrid1.Items[i].Cells[13].RowSpan=colnum;
//						Datagrid1.Items[j].Cells[13].Visible=false;
					}     
					else
						break;
				}
				i=j-1;
			}
		}

		private void Datagrid1_SelectedIndexChanged(object sender, System.EventArgs e)
		{
		
		}
	}
}
