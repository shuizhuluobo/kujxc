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
	/// xsdbmx_manage 的摘要说明。
	/// </summary>
	public class xsdbmx_manage :jxc.UsrControl.UserPage//System.Web.UI.Page//  
	{
		protected System.Web.UI.WebControls.DataGrid Datagrid1;
		protected System.Web.UI.WebControls.Button change;
		protected System.Web.UI.WebControls.Button delete;
		protected System.Web.UI.WebControls.Button add;
		protected System.Web.UI.WebControls.Button query;
		protected System.Web.UI.WebControls.TextBox cpname;

		protected dgNavigation DgNavigation1;
		protected System.Web.UI.WebControls.DropDownList DropDownListlx;
	
		utils u = new utils ();

		private void Page_Load(object sender, System.EventArgs e)
		{
			u.SetGridStyle(this.Datagrid1);
		
			DgNavigation1.SetTarget(Datagrid1,null,new BindDataDelegate(BindData));//BindData是你的数据邦定事件
			DgNavigation1.SetStyle(20, false);//10表示每页分10行，true表示无分页时自动隐藏
			if (!this.Page.IsPostBack)
			{
				utils.BindDropDownList("select jgmc,jgmc from cnc_jgglb where parent1='01'",this.DropDownListlx);
				BindData ();
				delete.Attributes.Add("onclick","return confirm('您真的要打印吗？')");
				change.Attributes.Add("onclick","return confirm('您真的确认要审核？')");
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
			this.Load += new System.EventHandler(this.Page_Load);

		}
		#endregion

		private void BindData ()
		{
			string cmd = "select * from (SELECT a.[xsid], a.[产品名称], a.[cpid], a.[产品型号], a.[销售数量], a.[制作明细],a.[已调拨],a.[到货确认],b.[销售日期],a.[rkid],a.[单价],a.[是否审核],a.[产品类别],b.客户名称,b.店名,b.经办人,b.地区 FROM [销售单明细] as a,[销售单] as b where a.xsid=b.xsid ) as xx where 1=1 ";
			if (this.cpname.Text != string.Empty)
				cmd += " and 客户名称 like '%" + this.cpname.Text.Trim () + "%'";
             if (DropDownListlx.SelectedIndex!=0)
				 cmd +=" and 地区 ='"+this.DropDownListlx.SelectedItem.ToString()+"'";

			if (this.groupname.ToString()!="0")
			{
				cmd+=" and 地区='"+this.zjgmc.ToString()+"'";
				this.DropDownListlx.Enabled=false;
			}

			cmd+=" order by 销售日期 desc ";
			DataSet ds = DBBase.ExecuteSql4Ds (cmd,"xsdbmx");
			this.Datagrid1.DataSource = ds.Tables["xsdbmx"].DefaultView;
			this.Datagrid1.DataBind ();
		}

		private void query_Click(object sender, System.EventArgs e)
		{
			BindData ();
		}

		private void add_Click(object sender, System.EventArgs e)
		{
			string id = utils.FindFirstCheckedItem(this.Datagrid1);		
			if (id!="")
			{
			u.OpenIEWindowRight(this,"xsdb_edit.aspx?id="+id,750,550);
				BindData ();
			}
			else
				utils.Alert (this,"请选择要调拨的销售单!");

		}

		private void change_Click(object sender, System.EventArgs e)
		{
//		string id = utils.FindFirstCheckedItem(this.Datagrid1);
////			u.OpenIEWindowRight(this,"xsdbmx_edit.aspx?cpid=" + id,500,500);
//			string cmd="update 销售单 set 库保确认='是' where rkid='"+id+"'";
//			DBBase.ExecuteSql (cmd);
//			BindData ();
			string id = utils.FindFirstCheckedItem(this.Datagrid1);
			if (id!="")
			{
				u.OpenIEWindowRight(this,"../cksh_edit.aspx?rkid="+id,750,550);	
				BindData ();
			}
			else
				utils.Alert (this,"请选择要审核的销售单!");

			
		
	    
		}

		private void delete_Click(object sender, System.EventArgs e)
		{
			string id = utils.FindFirstCheckedItem(this.Datagrid1);
			u.OpenIEWindowPrint(this,"xsprint.aspx?id="+id,750,550);
		}

		private void Datagrid1_ItemDataBound(object sender, System.Web.UI.WebControls.DataGridItemEventArgs e)
		{
			//  确定是数据行而非页首或页尾
			if (e.Item.ItemType == ListItemType.Item || e.Item.ItemType == ListItemType.AlternatingItem)
			{
				//  取得 manager 字段的值
				string isManager = (string)DataBinder.Eval(e.Item.DataItem, "已调拨");

				if (isManager == "否")
				{
					//  设置文本及背景颜色.
					e.Item.Cells[8].Text = "未调拨";
					e.Item.Cells[8].ForeColor=System.Drawing.Color.Red;
				}
				else
				{
					//  仅设置文本.
					//e.Item.Cells[2].Text = "";
					e.Item.Cells[8].Text = "已调拨";
					e.Item.Cells[8].ForeColor=System.Drawing.Color.Blue;
				}
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
						Datagrid1.Items[i].Cells[4].RowSpan=colnum;
						Datagrid1.Items[j].Cells[4].Visible=false;
						Datagrid1.Items[i].Cells[5].RowSpan=colnum;
						Datagrid1.Items[j].Cells[5].Visible=false;
						Datagrid1.Items[i].Cells[6].RowSpan=colnum;
						Datagrid1.Items[j].Cells[6].Visible=false;
						Datagrid1.Items[i].Cells[7].RowSpan=colnum;
						Datagrid1.Items[j].Cells[7].Visible=false; 				
					}     
					else
						break;
				}
				i=j-1;
			}
         
		}
	}
}
