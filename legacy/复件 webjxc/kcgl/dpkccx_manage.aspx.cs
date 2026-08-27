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
	/// dpkccx_manage 的摘要说明。
	/// </summary>
	public class dpkccx_manage : jxc.UsrControl.UserPage//System.Web.UI.Page
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
		protected System.Web.UI.WebControls.DropDownList Dropdownlist3;
	
		utils u = new utils ();

		private void Page_Load(object sender, System.EventArgs e)
		{
			u.SetGridStyle(this.Datagrid1);
			DgNavigation1.SetTarget(Datagrid1,null,new BindDataDelegate(BindData));//BindData是你的数据邦定事件
			DgNavigation1.SetStyle(20, false);//10表示每页分10行，true表示无分页时自动隐藏
			if (!this.Page.IsPostBack)
			{
                Textbox1.Text=string.Format("{0:yyyy-MM-dd}",DateTime.Now.AddDays(-7));
				Textbox2.Text=string.Format("{0:yyyy-MM-dd}",DateTime.Now);		
			//	TextBox2.Text=str1;
				BindData ();
				utils.BindDropDownList("select listname,listname from 产品类别 where orderid=0",this.Dropdownlist3);
				delete.Attributes.Add("onclick","return confirm('您真的要删除吗？')");
				change.Attributes.Add("onclick","return confirm('您真的确认已经下拨？')");
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
			this.Load += new System.EventHandler(this.Page_Load);

		}
		#endregion

		private void BindData ()
		{
		string cmd = "select *,(剩余数量+客退-供退) as 实际库存 from 入库单 where (剩余数量+客退-供退)<>0 ";//and 仓库名称='"+this.zjgmc.ToString()+"'";
		//	string cmd = "select * from 入库单 where 剩余数量<>0 ";

			if (this.cpname.Text != string.Empty)
				cmd += " and 产品名称 like '%" + this.cpname.Text.Trim () + "%'";
            if (this.DropDownList1.SelectedIndex==0)
				cmd+=" and 库保确认='否'";
			if (this.DropDownList1.SelectedIndex==1)
				cmd+=" and 库保确认='是'";
			if (this.DropDownList2.SelectedIndex==0)
				cmd+=" and 到货确认='否'";
			if (this.DropDownList2.SelectedIndex==1)
				cmd+=" and 到货确认='是'";
			if (Dropdownlist3.SelectedIndex!=0)
				cmd+=" and 产品类别 = '"+Dropdownlist3.SelectedValue+"'";
			if (CheckBox1.Checked)
				cmd+=" and 入库日期 between '"+this.Textbox1.Text.ToString()+"' and '"+this.Textbox2.Text.ToString()+"' ";

			DataSet ds = DBBase.ExecuteSql4Ds (cmd+" order by 入库日期 desc,rkid desc,cpid,型号,颜色","dpkccx");
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
			u.OpenIEWindowRight(this,"dpkccx_edit.aspx",600,600);
			
		}

		private void change_Click(object sender, System.EventArgs e)
		{
		string id = utils.FindFirstCheckedItem(this.Datagrid1);
//			u.OpenIEWindowRight(this,"dpkccx_edit.aspx?cpid=" + id,500,500);
			string cmd="update 下拨单 set 库保确认='是' where rkid='"+id+"'";
			DBBase.ExecuteSql (cmd);
			BindData ();
	    
		}

		private void delete_Click(object sender, System.EventArgs e)
		{
		
		}

		private void Datagrid1_ItemDataBound(object sender, System.Web.UI.WebControls.DataGridItemEventArgs e)
		{
			//  确定是数据行而非页首或页尾
//			if (e.Item.ItemType == ListItemType.Item || e.Item.ItemType == ListItemType.AlternatingItem)
//			{
				//  取得 manager 字段的值
//				string isManager = (string)DataBinder.Eval(e.Item.DataItem, "库保确认");
//
//				if (isManager == "否")
//				{
//					//  设置文本及背景颜色.
//					e.Item.Cells[13].Text = "未发货";
//					e.Item.Cells[13].ForeColor=System.Drawing.Color.Red;
//				}
//				else
//				{
//					//  仅设置文本.
//					//e.Item.Cells[2].Text = "";
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
//			}
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
	}
}
