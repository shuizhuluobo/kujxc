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
using System.Data.SqlClient;
using jxc.ascx;

namespace jxc.admin.bases
{
	/// <summary>
	/// thrksp_manage 的摘要说明。
	/// </summary>
	public class thrksp_manage :jxc.UsrControl.UserPage//System.Web.UI.Page//  
	{
		protected System.Web.UI.WebControls.DataGrid Datagrid1;
		protected System.Web.UI.WebControls.Button change;
		protected System.Web.UI.WebControls.Button add;
		protected System.Web.UI.WebControls.Button query;
		protected System.Web.UI.WebControls.TextBox cpname;

		protected dgNavigation DgNavigation1;
		protected System.Web.UI.WebControls.DropDownList DropDownListlx;
		protected System.Web.UI.WebControls.DropDownList Dropdownlist1;
		protected System.Web.UI.WebControls.Button Button1;
		protected System.Web.UI.WebControls.Button Button2;
		protected System.Web.UI.WebControls.TextBox Textbox1;
		protected System.Web.UI.WebControls.Button send;
	
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
				send.Attributes.Add("onclick","return confirm('您真的确认同意退货？ 确认后将发送到下一步!')");
				change.Attributes.Add("onclick","return confirm('您确认不同意退货？确认后将退回到上一步!')");
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
			this.add.Click += new System.EventHandler(this.add_Click);
			this.send.Click += new System.EventHandler(this.delete_Click);
			this.change.Click += new System.EventHandler(this.change_Click);
			this.Button1.Click += new System.EventHandler(this.Button1_Click);
			this.query.Click += new System.EventHandler(this.query_Click);
			this.Button2.Click += new System.EventHandler(this.Button2_Click);
			this.Datagrid1.ItemDataBound += new System.Web.UI.WebControls.DataGridItemEventHandler(this.Datagrid1_ItemDataBound);
			this.Datagrid1.SelectedIndexChanged += new System.EventHandler(this.Datagrid1_SelectedIndexChanged);
			this.Load += new System.EventHandler(this.Page_Load);

		}
		#endregion

		private void BindData ()
		{
			string cmd = "select * from (SELECT a.[thid], a.[产品名称], a.[cpid],a.[产品型号], a.[退货数量],b.[退货日期],a.[rkid],a.[单价],a.[是否审核],b.[单据状态],a.[产品类别],b.客户名称,b.店名,b.经办人,b.地区,b.主管审核,b.总会计审核,b.销售单号,b.状态 FROM [退货单明细] as a,[退货单] as b where a.thid=b.thid ) as xx where 1=1 and 状态=2  ";
			if (this.cpname.Text != string.Empty)
				cmd += " and 客户名称 like '%" + this.cpname.Text.Trim () + "%'";
			if (this.Textbox1.Text != string.Empty)
				cmd += " and thid like '%" + this.Textbox1.Text.Trim () + "%'";
             if (DropDownListlx.SelectedIndex!=0)
				 cmd +=" and 地区 ='"+this.DropDownListlx.SelectedItem.ToString()+"'";
             if (Dropdownlist1.SelectedIndex==0)
				 cmd+=" and 总会计审核='是'";
			if (Dropdownlist1.SelectedIndex==1)
				cmd+=" and 总会计审核='否'";

			if (this.roleid.ToString()=="3")
			{
				//cmd+=" and 经办人='"+this.glyname.ToString()+"'";店名
				cmd+=" and 地区='"+this.jgmc.ToString()+"'";
				this.DropDownListlx.Enabled=false;
			}
			cmd+=" order by 退货日期 desc ";
			DataSet ds = DBBase.ExecuteSql4Ds (cmd,"thrksp");
			this.Datagrid1.DataSource = ds.Tables["thrksp"].DefaultView;
			this.Datagrid1.DataBind ();
		}

		private void query_Click(object sender, System.EventArgs e)
		{
			BindData ();
		}

		private void add_Click(object sender, System.EventArgs e)
		{
			string id = utils.FindFirstCheckedItem(this.Datagrid1);
			u.OpenIEWindowRight(this,"thrk_edit.aspx?rkid="+id,750,550);
			
		}

		private void change_Click(object sender, System.EventArgs e)
		{
//		string id = utils.FindFirstCheckedItem(this.Datagrid1);
////			u.OpenIEWindowRight(this,"thrksp_edit.aspx?cpid=" + id,500,500);
//				string cmd="update 退货单 set 主管审核='是' where thid='"+id+"'";
//			DBBase.ExecuteSql (cmd);
//			BindData ();
			string id = utils.FindFirstCheckedItem(this.Datagrid1);
			//u.OpenIEWindowPrint(this,"xsprint.aspx?id="+id,750,550);
			string cmd="update 退货单 set 单据状态='回退',状态=1 where thid='"+id+"'";
			DBBase.ExecuteSql (cmd);
			BindData ();
	    
		}

		private void delete_Click(object sender, System.EventArgs e)
		{
			string id = utils.FindFirstCheckedItem(this.Datagrid1);
			//u.OpenIEWindowPrint(this,"xsprint.aspx?id="+id,750,550);
			string cmd="update 退货单 set 单据状态='发送',状态=3,主管审核='是' where thid='"+id+"'";
			DBBase.ExecuteSql (cmd);
            BindData ();
		}

		private void Datagrid1_ItemDataBound(object sender, System.Web.UI.WebControls.DataGridItemEventArgs e)
		{
			//  确定是数据行而非页首或页尾
			if (e.Item.ItemType == ListItemType.Item || e.Item.ItemType == ListItemType.AlternatingItem)
			{
				//  取得 manager 字段的值
				string isManager = (string)DataBinder.Eval(e.Item.DataItem, "主管审核");

				if (isManager == "是")
				{
					//  设置文本及背景颜色.
					e.Item.Cells[9].Text = "已通过";
					e.Item.Cells[9].ForeColor=System.Drawing.Color.Blue;
				}
				else
				{
					//  仅设置文本
					e.Item.Cells[9].Text = "未审核";
					e.Item.Cells[9].ForeColor=System.Drawing.Color.Red;
				}
				isManager = (string)DataBinder.Eval(e.Item.DataItem, "总会计审核");

				if (isManager == "是")
				{
					//  设置文本及背景颜色.
					e.Item.Cells[10].Text = "已通过";
					e.Item.Cells[10].ForeColor=System.Drawing.Color.Blue;
				}
				else
				{
					//  仅设置文本.
					e.Item.Cells[10].Text = "未审核";
					e.Item.Cells[10].ForeColor=System.Drawing.Color.Red;
				}
				isManager = (string)DataBinder.Eval(e.Item.DataItem, "单据状态");

//				if (isManager == "回退")
//				{
//					e.Item.Cells[11].Text = "回退";
//					e.Item.Cells[11].ForeColor=System.Drawing.Color.Blue;
//				}
//				else
//				{
//					e.Item.Cells[11].Text = "发送";
//					e.Item.Cells[11].ForeColor=System.Drawing.Color.Red;
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
						Datagrid1.Items[i].Cells[2].RowSpan=colnum;
						Datagrid1.Items[j].Cells[2].Visible=false;
						Datagrid1.Items[i].Cells[5].RowSpan=colnum;
						Datagrid1.Items[j].Cells[5].Visible=false;
						Datagrid1.Items[i].Cells[6].RowSpan=colnum;
						Datagrid1.Items[j].Cells[6].Visible=false;
						Datagrid1.Items[i].Cells[7].RowSpan=colnum;
						Datagrid1.Items[j].Cells[7].Visible=false; 		
						Datagrid1.Items[i].Cells[8].RowSpan=colnum;
						Datagrid1.Items[j].Cells[8].Visible=false; 
						Datagrid1.Items[i].Cells[9].RowSpan=colnum;
						Datagrid1.Items[j].Cells[9].Visible=false; 
						Datagrid1.Items[i].Cells[10].RowSpan=colnum;
						Datagrid1.Items[j].Cells[10].Visible=false; 
						Datagrid1.Items[i].Cells[11].RowSpan=colnum;
						Datagrid1.Items[j].Cells[11].Visible=false; 
					}     
					else
						break;
				}
				i=j-1;
			}
         
		}

		private void Button1_Click(object sender, System.EventArgs e)
		{
			this.Response.Redirect("thrk_manage.aspx",true);
	//	u.OpenIEWindowPrint(this,"thrk_manage.aspx",750,550);
		}

		private void Button2_Click(object sender, System.EventArgs e)
		{

            string id = utils.FindFirstCheckedItem(this.Datagrid1);
			u.OpenIEWindowRight(this,"thrksp_edit.aspx?thid="+id,750,550);
//			string id = utils.FindFirstCheckedItem(this.Datagrid1);
//			if (id!="")
//			{
//				string sqlstr="select  单据状态 from 退货单 where thid='"+id+"'";
//				SqlDataReader dr1 = DBBase.ExecuteSqlReader (sqlstr);
//				dr1.Read ();
//				sqlstr=dr1["单据状态"].ToString();
//				if (sqlstr=="完成")
//				{
//					utils.Alert (this,"该单据已经生成退货单,不能进行修改!");
//					dr1.Close();
//					return;
//				}
//				else
//				{
//					dr1.Close();
//					u.OpenIEWindowRight(this,"thrk_edit.aspx?thid="+id,750,550);
//				}
//
//			}
//			else
//				utils.Alert (this,"请选择要修改的退货单!");
		}

		private void Datagrid1_SelectedIndexChanged(object sender, System.EventArgs e)
		{
		
		}
	}
}
