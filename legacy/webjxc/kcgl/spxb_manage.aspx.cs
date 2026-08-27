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

namespace jxc.admin.bases.kcgl
{
	/// <summary>
	/// spxb_manage 的摘要说明。
	/// </summary>
	public class spxb_manage :jxc.UsrControl.UserPage//System.Web.UI.Page// 
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
		protected System.Web.UI.WebControls.TextBox txtgys;
		protected System.Web.UI.WebControls.Button Button1;
		protected System.Web.UI.WebControls.Button Button2;
		protected System.Web.UI.WebControls.CheckBox Checkbox3;
		protected System.Web.UI.WebControls.Button Button3;
		protected System.Web.UI.WebControls.TextBox Textbox3;
		protected System.Web.UI.WebControls.Button btnedit;
		protected System.Web.UI.WebControls.CheckBox Checkbox4;
	
		utils u = new utils ();

		private void Page_Load(object sender, System.EventArgs e)
		{
			u.SetGridStyle(this.Datagrid1);
			DgNavigation1.SetTarget(Datagrid1,null,new BindDataDelegate(BindData));//BindData是你的数据邦定事件
			DgNavigation1.SetStyle(40, false);//10表示每页分10行，true表示无分页时自动隐藏
			if (!this.Page.IsPostBack)
			{
				Textbox3.Text=this.glyname.ToString();
				if (this.roleid!="8")
				{
					
					string a = this.roleid.ToString();
					if(a.IndexOf("4")>-1)
					{
						add.Enabled=true;
					}
					if(a.IndexOf("8")>-1)
					{
						change.Enabled=true;
					}
					if(a.IndexOf("1")>-1)
					{
						//字符串A中包含字符串B
						change.Enabled=true;
					}
					if(a.IndexOf("9")>-1)//仓管办
					{
						//字符串A中包含字符串B
						//change.Enabled=true;
					}
					if(a.IndexOf("3")>-1)//财务
					{
						Button1.Enabled=true;
						Button2.Enabled=true;
						change.Enabled=true;
					}
					if(a.IndexOf("6")>-1)
					{
						Button1.Enabled=true;
						Button2.Enabled=true;
					}
					if(a.IndexOf("4")>-1)
					{
						Button1.Enabled=true;
						Button2.Enabled=true;
					}
				}
				else
				{
                     add.Enabled=true;
					change.Enabled=true;
					Button1.Enabled=true;
					Button2.Enabled=true;
				}
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
			this.delete.Click += new System.EventHandler(this.delete_Click);
			this.btnedit.Click += new System.EventHandler(this.btnedit_Click);
			this.Button3.Click += new System.EventHandler(this.Button3_Click);
			this.change.Click += new System.EventHandler(this.change_Click);
			this.Button2.Click += new System.EventHandler(this.Button2_Click);
			this.Button1.Click += new System.EventHandler(this.Button1_Click);
			this.Datagrid1.ItemDataBound += new System.Web.UI.WebControls.DataGridItemEventHandler(this.Datagrid1_ItemDataBound);
			this.Datagrid1.SelectedIndexChanged += new System.EventHandler(this.Datagrid1_SelectedIndexChanged);
			this.Load += new System.EventHandler(this.Page_Load);

		}
		#endregion

		private void BindData ()
		{
			string cmd = "select * from 下拨单 where 标志='是'  ";
			if (this.cpname.Text != string.Empty)
				cmd += " and 产品名称 like '%" + this.cpname.Text.Trim () + "%'";
            if (this.DropDownList1.SelectedIndex==0)
				cmd+=" and 发票标志='未开'";
			if (this.DropDownList1.SelectedIndex==1)
				cmd+=" and 发票标志='已开'";
			if (this.DropDownList2.SelectedIndex==0)
				cmd+=" and 到货确认='否'";
			if (this.DropDownList2.SelectedIndex==1)
				cmd+=" and 到货确认='是'";
			if (CheckBox1.Checked)
				cmd+=" and 入库日期 between '"+this.Textbox1.Text.ToString()+"' and '"+this.Textbox2.Text.ToString()+"' ";
            if (this.Checkbox2.Checked)
				cmd+=" and   供应商 like '%"+this.txtgys.Text+"%' ";
			if (this.Checkbox3.Checked)
				cmd+=" and   操作员 like '%"+this.Textbox3.Text+"%' ";

		    if (Checkbox4.Checked==true)
				cmd+=" and 付款标志='未付'";

			DataSet ds = DBBase.ExecuteSql4Ds (cmd+" order by rkid desc,入库单编号 desc,入库日期 desc,cpid,型号,颜色","spxb");
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
			u.OpenIEWindowRight(this,"spxb_edit.aspx",780,600);
			
		}

		private void change_Click(object sender, System.EventArgs e)
		{
		    string id = utils.FindFirstCheckedItem(this.Datagrid1);
//			u.OpenIEWindowRight(this,"spxb_edit.aspx?cpid=" + id,500,500);
			string cmd="update 下拨单 set 到货确认='是' where rkid='"+id+"'";
			DBBase.ExecuteSql (cmd);
			BindData ();
	    
		}

		private void delete_Click(object sender, System.EventArgs e)
		{
			string id = utils.FindFirstCheckedItem(this.Datagrid1);
			string cmd = "select * from 下拨单 where 入库单编号=(select 入库单编号 from 下拨单 where  rkid='"+id.ToString()+"') and 到货确认='是'";
			SqlDataReader dr = DBBase.ExecuteSqlReader (cmd);
			if (dr.HasRows)
			{
				dr.Close();
				id="0";
				utils.Alert (this,"该记录不能作废！请查看是否已经到货确认！");
				return;
			}
			dr.Close();
			cmd = "select * from 下拨单 where 入库单编号=(select 入库单编号 from 下拨单 where  操作员='"+this.glyname.ToString()+"' and rkid='"+id.ToString()+"')  and 到货确认='否' ";
			dr = DBBase.ExecuteSqlReader (cmd);
			if (dr.HasRows)
			{
				dr.Close();
				cmd="update 下拨单 set 标志='否' where 入库单编号=(select 入库单编号 from 下拨单 where  操作员='"+this.glyname.ToString()+"' and rkid='"+id.ToString()+"') and 到货确认='否'";
				DBBase.ExecuteSql(cmd);
				utils.Alert (this,"该单据已经作废！");
				BindData ();
				return;
			}
			else
			{
				utils.Alert (this,"只有该单据的操作员才可以作废！");
				return;
			}
			
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
				isManager = (string)DataBinder.Eval(e.Item.DataItem, "到货确认");

				if (isManager == "否")
				{
					//  设置文本及背景颜色.
					e.Item.Cells[12].Text = "未到";
					e.Item.Cells[12].ForeColor=System.Drawing.Color.Red;
				}
				else
				{
					//  仅设置文本.
					//e.Item.Cells[2].Text = "";
					e.Item.Cells[12].Text = "已到";
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
//						Datagrid1.Items[i].Cells[0].RowSpan=colnum;
//						Datagrid1.Items[j].Cells[0].Visible=false; 
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

		private void Button1_Click(object sender, System.EventArgs e)
		{
//			string id = utils.FindFirstCheckedItem(this.Datagrid1);
//			//			u.OpenIEWindowRight(this,"spxb_edit.aspx?cpid=" + id,500,500);
//			string cmd="update 下拨单 set 付款标志='已付' where rkid='"+id+"'";
//			DBBase.ExecuteSql (cmd);
//			BindData ();
			string id = utils.FindCheckedItem (this.Datagrid1);
			if (id == "")
			{
				utils.Alert (this,"至少选择一项");
				return;
			}
			string [] ids = id.Split(',');

			for (int i=0;i<ids.Length;i++)
			{
				string cmd="update 下拨单 set 付款标志='已付' where rkid='"+ids[i]+"'";
				DBBase.ExecuteSql (cmd);
				
			}
			BindData ();
		}

		private void Button2_Click(object sender, System.EventArgs e)
		{
//			string id = utils.FindFirstCheckedItem(this.Datagrid1);
//			//			u.OpenIEWindowRight(this,"spxb_edit.aspx?cpid=" + id,500,500);
//			string cmd="update 下拨单 set 发票标志='已开' where rkid='"+id+"'";
//			DBBase.ExecuteSql (cmd);
//			BindData ();


			string id = utils.FindCheckedItem (this.Datagrid1);
			if (id == "")
			{
				utils.Alert (this,"至少选择一项");
				return;
			}
			string [] ids = id.Split(',');

			for (int i=0;i<ids.Length;i++)
			{
				string cmd="update 下拨单 set 发票标志='已开' where rkid='"+ids[i]+"'";
				DBBase.ExecuteSql (cmd);
				
			}
			BindData ();
		}

		private void Button3_Click(object sender, System.EventArgs e)
		{
			string id = utils.FindFirstCheckedItem(this.Datagrid1);
			u.OpenIEWindowPrint(this,"spxbprint.aspx?id="+id,750,550);
			BindData ();
		}

		private void btnedit_Click(object sender, System.EventArgs e)
		{
			string id = utils.FindFirstCheckedItem(this.Datagrid1);
			string cmd = "select * from 下拨单 where 入库单编号=(select 入库单编号 from 下拨单 where  rkid='"+id.ToString()+"') and 到货确认='是'";
			SqlDataReader dr = DBBase.ExecuteSqlReader (cmd);
			if (dr.HasRows)
			{
				utils.Alert (this,"该单据不能修改！");
				return;
			}
				dr.Close();
			cmd = "select * from 下拨单 where 入库单编号=(select 入库单编号 from 下拨单 where  操作员='"+this.glyname.ToString()+"' and rkid='"+id.ToString()+"')  and 到货确认='否' ";
			dr = DBBase.ExecuteSqlReader (cmd);
			if (dr.HasRows)
			{
				if (dr.Read())
				{
					u.OpenIEWindowPrint(this,"spxb_change.aspx?dhdid="+dr["入库单编号"].ToString()+"&gysmc="+dr["供应商"].ToString(),750,550);
					dr.Close();
					BindData ();
					return;
				}
			}
			else
			{
				utils.Alert (this,"当前操作员不能修改该订货单！");
				return;
			}

		}

		private void Datagrid1_SelectedIndexChanged(object sender, System.EventArgs e)
		{
		
		}
	}
}
