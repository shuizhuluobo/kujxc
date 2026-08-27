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
	/// ddxs_manage 的摘要说明。
	/// </summary>
	public class ddxs_manage : System.Web.UI.Page
	{
		protected System.Web.UI.WebControls.DataGrid Datagrid1;
		protected System.Web.UI.WebControls.Button change;
		protected System.Web.UI.WebControls.Button delete;
		protected System.Web.UI.WebControls.Button add;
		protected System.Web.UI.WebControls.Button query;
		protected System.Web.UI.WebControls.TextBox cpname;
		protected dgNavigation DgNavigation1;
		protected System.Web.UI.WebControls.DropDownList DropDownList1;
		protected System.Web.UI.WebControls.TextBox Textbox2;
		protected System.Web.UI.WebControls.TextBox Textbox1;
		protected System.Web.UI.WebControls.CheckBox CheckBox1;
		protected System.Web.UI.WebControls.Label Label1;
		protected System.Web.UI.WebControls.DropDownList DropDownList2;
		protected System.Web.UI.WebControls.Label Label2;
		protected System.Web.UI.WebControls.CheckBox Checkbox2;
		protected System.Web.UI.WebControls.TextBox txtkh;
		protected System.Web.UI.WebControls.Button Button1;
		protected System.Web.UI.WebControls.Button Button2;
		protected System.Web.UI.WebControls.CheckBox Checkbox3;
		protected System.Web.UI.WebControls.TextBox Textbox3;
		protected System.Web.UI.WebControls.CheckBox Checkbox4;
		protected System.Web.UI.WebControls.TextBox txtgys;
	
		utils u = new utils ();

		private void Page_Load(object sender, System.EventArgs e)
		{
			u.SetGridStyle(this.Datagrid1);
			DgNavigation1.SetTarget(Datagrid1,null,new BindDataDelegate(BindData));//BindData是你的数据邦定事件
			DgNavigation1.SetStyle(20, false);//10表示每页分10行，true表示无分页时自动隐藏
			if (!this.Page.IsPostBack)
			{
                Textbox1.Text=string.Format("{0:yyyy-MM-dd}",DateTime.Now.AddDays(-7));
				Textbox2.Text=string.Format("{0:yyyy-MM-dd}",DateTime.Now.AddDays(1));		

			//	TextBox2.Text=str1;
				BindData ();
				
				delete.Attributes.Add("onclick","return confirm('您真的要删除吗？')");
				change.Attributes.Add("onclick","return confirm('您真的确认已经到货？')");
				Button1.Attributes.Add("onclick","return confirm('您真的确认已经付款吗？')");
				Button2.Attributes.Add("onclick","return confirm('您真的确认发票已经收到吗？')");
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
			this.Button1.Click += new System.EventHandler(this.Button1_Click);
			this.Button2.Click += new System.EventHandler(this.Button2_Click);
			this.delete.Click += new System.EventHandler(this.delete_Click);
			this.Datagrid1.ItemDataBound += new System.Web.UI.WebControls.DataGridItemEventHandler(this.Datagrid1_ItemDataBound);
			this.Datagrid1.SelectedIndexChanged += new System.EventHandler(this.Datagrid1_SelectedIndexChanged);
			this.Load += new System.EventHandler(this.Page_Load);

		}
		#endregion

		private void BindData ()
		{
			string cmd = "select * from 下拨单 where 标志='是' and 到货确认='是' and 单据状态='未完' ";
			if (this.cpname.Text != string.Empty)
				cmd += " and 产品名称 like '%" + this.cpname.Text.Trim () + "%'";
            if (this.DropDownList1.SelectedIndex==0)
				cmd+=" and 发票标志='未开'";
			if (this.DropDownList1.SelectedIndex==1)
				cmd+=" and 发票标志='已开'";
//			if (this.DropDownList2.SelectedIndex==0)
//				cmd+=" and 到货确认='否'";
//			if (this.DropDownList2.SelectedIndex==1)
//				cmd+=" and 到货确认='是'";
			if (CheckBox1.Checked)
				cmd+=" and 入库日期 between '"+this.Textbox1.Text.ToString()+"' and '"+this.Textbox2.Text.ToString()+"' ";
            if (this.Checkbox2.Checked)
				cmd+=" and   供应商 like '%"+this.txtgys.Text+"%' ";
			if (this.Checkbox3.Checked)
				cmd+=" and   备注 like '%"+this.Textbox3.Text+"%' ";
            if(this.Checkbox4.Checked)
				cmd+=" and 销售标志 ='否'";
			DataSet ds = DBBase.ExecuteSql4Ds (cmd+" order by 入库日期 desc,rkid desc,cpid,型号,颜色","ddxs");
			this.Datagrid1.DataSource = ds.Tables[0].DefaultView;
			this.Datagrid1.DataBind ();

		}

		private void query_Click(object sender, System.EventArgs e)
		{
			BindData ();
		}

		private void add_Click(object sender, System.EventArgs e)
		{
			string id = utils.FindCheckedItem(this.Datagrid1);
			Session.Remove("tmpid");
			Session.Add("tmpid",id);
			string id1=utils.FindFirstCheckedItem(this.Datagrid1);
			string cmd = "select 备注 from 下拨单 where rkid='" +id1.ToString()+"'";
			SqlDataReader dr = DBBase.ExecuteSqlReader (cmd);
			id1="";
			if (dr.Read())
				id1=dr["备注"].ToString();
			u.OpenIEWindowRight(this,"ddxsck_edit.aspx?khmc="+id1.ToString(),780,600);
			
		}

		private void change_Click(object sender, System.EventArgs e)
		{
		string id = utils.FindFirstCheckedItem(this.Datagrid1);
//			u.OpenIEWindowRight(this,"ddxs_edit.aspx?cpid=" + id,500,500);
			string cmd="update 下拨单 set 到货确认='是' where rkid='"+id+"'";
			DBBase.ExecuteSql (cmd);
			BindData ();
	    
		}

		private void delete_Click(object sender, System.EventArgs e)
		{
		
		}

		private void Datagrid1_ItemDataBound(object sender, System.Web.UI.WebControls.DataGridItemEventArgs e)
		{
			//  确定是数据行而非页首或页尾
			if (e.Item.ItemType == ListItemType.Item || e.Item.ItemType == ListItemType.AlternatingItem)
			{
				//  取得 manager 字段的值
				string isManager = (string)DataBinder.Eval(e.Item.DataItem, "付款标志");

				if (isManager == "未付")
				{
					//  设置文本及背景颜色.
					e.Item.Cells[13].Text = "未付";
					e.Item.Cells[13].ForeColor=System.Drawing.Color.Red;
				}
				else
				{
					//  仅设置文本.
					//e.Item.Cells[2].Text = "";
					e.Item.Cells[13].Text = "已付";
					e.Item.Cells[13].ForeColor=System.Drawing.Color.Blue;
				}
				isManager = (string)DataBinder.Eval(e.Item.DataItem, "销售标志");

				if (isManager == "否")
				{
					//  设置文本及背景颜色.
					e.Item.Cells[12].Text = "否";
					e.Item.Cells[12].ForeColor=System.Drawing.Color.Red;
				}
				else
				{
					//  仅设置文本.
					//e.Item.Cells[2].Text = "";
					e.Item.Cells[12].Text = "是";
					e.Item.Cells[12].ForeColor=System.Drawing.Color.Blue;
				}
				isManager = (string)DataBinder.Eval(e.Item.DataItem, "发票标志");

				if (isManager == "未开")
				{
					//  设置文本及背景颜色.
					e.Item.Cells[14].Text = "未开";
					e.Item.Cells[14].ForeColor=System.Drawing.Color.Red;
				}
				else
				{
					//  仅设置文本.
					//e.Item.Cells[2].Text = "";
					e.Item.Cells[14].Text = "已开";
					e.Item.Cells[14].ForeColor=System.Drawing.Color.Blue;
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
			string id = utils.FindFirstCheckedItem(this.Datagrid1);
			//			u.OpenIEWindowRight(this,"ddxs_edit.aspx?cpid=" + id,500,500);
			string cmd="update 下拨单 set 付款标志='已付' where rkid='"+id+"'";
			DBBase.ExecuteSql (cmd);
			BindData ();
		}

		private void Button2_Click(object sender, System.EventArgs e)
		{
			string id = utils.FindFirstCheckedItem(this.Datagrid1);
			//			u.OpenIEWindowRight(this,"ddxs_edit.aspx?cpid=" + id,500,500);
			string cmd="update 下拨单 set 发票标志='已开' where rkid='"+id+"'";
			DBBase.ExecuteSql (cmd);
			BindData ();
		}

		private void Datagrid1_SelectedIndexChanged(object sender, System.EventArgs e)
		{
		
		}
	}
}
