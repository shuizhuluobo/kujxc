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
using   MSScriptControl;
using jxc.webjxc; 
using jxc.UsrControl;
namespace jxc.admin.bases
{
	/// <summary>
	/// wxgl_hzmanage 的摘要说明。
	/// </summary>
	public class wxgl_hzmanage : jxc.UsrControl.UserPage
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
		protected System.Web.UI.WebControls.CheckBox Checkbox4;
		protected System.Web.UI.WebControls.TextBox txtgys;
		protected System.Web.UI.WebControls.TextBox txtdw;
		protected System.Web.UI.WebControls.DropDownList Dropdownlist3;
		protected System.Web.UI.WebControls.DataGrid Datagrid2;
	
		utils u = new utils ();

		private void Page_Load(object sender, System.EventArgs e)
		{
			u.SetGridStyle2(this.Datagrid1);
			u.SetGridStyle2(this.Datagrid2);
//			DgNavigation1.SetTarget(Datagrid1,null,new BindDataDelegate(BindData));//BindData是你的数据邦定事件
//			DgNavigation1.SetStyle(20, false);//10表示每页分10行，true表示无分页时自动隐藏
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
			//if(!ispostback){}
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
			this.Datagrid1.CancelCommand += new System.Web.UI.WebControls.DataGridCommandEventHandler(this.Datagrid1_CancelCommand);
			this.Datagrid1.EditCommand += new System.Web.UI.WebControls.DataGridCommandEventHandler(this.Datagrid1_EditCommand);
			this.Datagrid1.UpdateCommand += new System.Web.UI.WebControls.DataGridCommandEventHandler(this.Datagrid1_UpdateCommand);
			this.Datagrid1.DeleteCommand += new System.Web.UI.WebControls.DataGridCommandEventHandler(this.Datagrid1_DeleteCommand);
			this.Datagrid1.ItemDataBound += new System.Web.UI.WebControls.DataGridItemEventHandler(this.Datagrid1_ItemDataBound);
			this.Load += new System.EventHandler(this.Page_Load);

		}
		#endregion

		private void BindData ()
		{
			string cmd = "select wxid, 用户单位, 联系人, 联系电话, 用户单位+联系人+联系电话 as 联系方式, 故障信息, 备注, 接收人, 转接人, 解决问题, 登记日期, 接货时间, 维修类别, 记录状态, 货物状态, 分值, 参与人员, 记录分组,登记人,完结人,完结日期 ";
			cmd=cmd+" FROM   维修记录  where 1=1 ";
			if (this.cpname.Text != string.Empty)
				cmd += " and 完结人 like '%" + this.cpname.Text.Trim () + "%'";
            if (this.DropDownList1.SelectedIndex==0)
				cmd+=" and 记录分组='中心'";
			if (this.DropDownList1.SelectedIndex==1)
				cmd+=" and 记录分组='西线'";
			if (this.DropDownList1.SelectedIndex==2)
				cmd+=" and 记录分组='南线'";

			if (this.DropDownList2.SelectedItem.Text=="未接收")
				cmd+=" and 记录状态='未接收'";
			if (this.DropDownList2.SelectedItem.Text=="已接收")
				cmd+=" and 记录状态='已接收'";
			if (this.DropDownList2.SelectedItem.Text=="已完成")
				cmd+=" and 记录状态='已完成'";

			if (CheckBox1.Checked)
				cmd+=" and 完结日期 between '"+this.Textbox1.Text.ToString()+"' and '"+this.Textbox2.Text.ToString()+"' ";
            if (this.Checkbox2.Checked)
				cmd+=" and   用户单位 like '%"+this.txtdw.Text+"%' ";
			if (this.Checkbox3.Checked)
				cmd+=" and  维修类别 = '"+this.Dropdownlist3.SelectedValue.ToString()+"' ";
            if(this.Checkbox4.Checked)
				cmd+=" and 销售标志 ='否'";
			DataSet ds = DBBase.ExecuteSql4Ds (cmd+" order by wxid desc","ddxs");
			this.Datagrid1.DataSource = ds.Tables[0].DefaultView;
			this.Datagrid1.DataBind ();
			this.Datagrid2.DataSource = ds.Tables[0].DefaultView;
			this.Datagrid2.DataBind ();		

		}

		private void query_Click(object sender, System.EventArgs e)
		{
			BindData ();
		}

		private void add_Click(object sender, System.EventArgs e)
		{
			string id = utils.FindCheckedItem(this.Datagrid1);
			u.OpenIEWindowRight(this,"wxdj_edit.aspx?wxid="+id,750,550);
		
		}

		private void change_Click(object sender, System.EventArgs e)
		{
		string id = utils.FindFirstCheckedItem(this.Datagrid1);
//			u.OpenIEWindowRight(this,"ddxs_edit.aspx?cpid=" + id,500,500);
			string cmd="update 维修记录 set 到货确认='是' where rkid='"+id+"'";
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
				string isManager = (string)DataBinder.Eval(e.Item.DataItem, "记录状态");

				if (isManager == "未接收")
				{
					//  设置文本及背景颜色.
					//e.Item.Cells[2].Text = "未接收";
					e.Item.Cells[2].ForeColor=System.Drawing.Color.Green;
					e.Item.Cells[3].ForeColor=System.Drawing.Color.Green;
					e.Item.Cells[4].ForeColor=System.Drawing.Color.Green;
					e.Item.Cells[5].ForeColor=System.Drawing.Color.Green;
					e.Item.Cells[6].ForeColor=System.Drawing.Color.Green;
					e.Item.Cells[7].ForeColor=System.Drawing.Color.Green;
					e.Item.Cells[8].ForeColor=System.Drawing.Color.Green;
					e.Item.Cells[9].ForeColor=System.Drawing.Color.Green;
					e.Item.Cells[10].ForeColor=System.Drawing.Color.Green;
					e.Item.Cells[11].ForeColor=System.Drawing.Color.Green;
					e.Item.Cells[12].ForeColor=System.Drawing.Color.Green;
					e.Item.Cells[13].ForeColor=System.Drawing.Color.Green;
					e.Item.Cells[14].ForeColor=System.Drawing.Color.Green;
					e.Item.Cells[15].ForeColor=System.Drawing.Color.Green;
					e.Item.Cells[16].ForeColor=System.Drawing.Color.Green;
				   
				}
				else
				{
					if (isManager == "已接收")
					{
						//e.Item.Cells[2].Text = "已接收";
						e.Item.Cells[2].ForeColor=System.Drawing.Color.Blue;
						e.Item.Cells[3].ForeColor=System.Drawing.Color.Blue;
						e.Item.Cells[4].ForeColor=System.Drawing.Color.Blue;
						e.Item.Cells[5].ForeColor=System.Drawing.Color.Blue;
						e.Item.Cells[6].ForeColor=System.Drawing.Color.Blue;
						e.Item.Cells[7].ForeColor=System.Drawing.Color.Blue;
						e.Item.Cells[8].ForeColor=System.Drawing.Color.Blue;
						e.Item.Cells[9].ForeColor=System.Drawing.Color.Blue;
						e.Item.Cells[10].ForeColor=System.Drawing.Color.Blue;
						e.Item.Cells[11].ForeColor=System.Drawing.Color.Blue;
						e.Item.Cells[12].ForeColor=System.Drawing.Color.Blue;
						e.Item.Cells[13].ForeColor=System.Drawing.Color.Blue;
						e.Item.Cells[14].ForeColor=System.Drawing.Color.Blue;
						e.Item.Cells[15].ForeColor=System.Drawing.Color.Blue;
						e.Item.Cells[16].ForeColor=System.Drawing.Color.Blue;
					}
				}
				isManager = (string)DataBinder.Eval(e.Item.DataItem, "维修类别");
				e.Item.Cells[1].Text = isManager.ToString();

			}
			

		}
		private string BindDDL(int ddd)
		{
			string sss = "";
			if (ddd==1)
			{
				sss="张三";
				return sss;
			}
			else
			{
				sss="李四";
				return sss;
			}
		}

		private void Button1_Click(object sender, System.EventArgs e)
		{
			string id = utils.FindFirstCheckedItem(this.Datagrid1);
			//			u.OpenIEWindowRight(this,"ddxs_edit.aspx?cpid=" + id,500,500);
			string cmd="update 维修记录 set 付款标志='已付' where rkid='"+id+"'";
			DBBase.ExecuteSql (cmd);
			BindData ();
		}

		private void Button2_Click(object sender, System.EventArgs e)
		{
//			string id = utils.FindFirstCheckedItem(this.Datagrid1);
//			//			u.OpenIEWindowRight(this,"ddxs_edit.aspx?cpid=" + id,500,500);
//			string cmd="update 维修记录 set 发票标志='已开' where rkid='"+id+"'";
//			DBBase.ExecuteSql (cmd);
//			BindData ();
			DGToExcel(Datagrid2);
		}

		private void Datagrid1_EditCommand(object source, System.Web.UI.WebControls.DataGridCommandEventArgs e)
		{
			Datagrid1.EditItemIndex = e.Item.ItemIndex;
			BindData();
		}

		private void Datagrid1_CancelCommand(object source, System.Web.UI.WebControls.DataGridCommandEventArgs e)
		{
			Datagrid1.EditItemIndex = -1;
			BindData();
		}

		private void Datagrid1_UpdateCommand(object source, System.Web.UI.WebControls.DataGridCommandEventArgs e)
		{
			//string code = ((TextBox)e.Item.Cells[1].Controls[0]).Text;
			//string name = ((TextBox)e.Item.Cells[5].Controls[0]).Text;
			//string name2 = ((TextBox)e.Item.Cells[6].Controls[0]).Text;
			//Datagrid1.DataKeys [item.ItemIndex].ToString ();
			//string id = ((TextBox)e.Item.Cells[1].Controls[0]).Text;
				string lxdh = ((TextBox)e.Item.Cells[7].Controls[0]).Text;//联系电话
			string gzxx = ((TextBox)e.Item.Cells[8].Controls[0]).Text;//故障信息, 故障信息
			string id=Datagrid1.DataKeys [e.Item.ItemIndex].ToString ();//e.Item.Cells[1].Text;

			DropDownList ddl=(DropDownList)(e.Item.Cells[2].FindControl( "dropId"));
          	DropDownList ddl1=(DropDownList)(e.Item.Cells[4].FindControl( "jlfz"));
            string s=ddl1.SelectedValue.ToString();
			if (id!="")
			{//this.glyname.ToString()
				string str=string.Format("{0:yyyy-MM-dd HH:mm:ss}",DateTime.Now);
				string cmd="update 维修记录 set  联系电话='"+lxdh+"', 故障信息='"+gzxx+"', 记录分组='"+s+"' where wxid="+id;
				DBBase.ExecuteSql (cmd);
				//myClass.upDateArea(id,code,name);
				Datagrid1.EditItemIndex = -1;
				//	DG1.DataSource = myClass.bindGrid();
				BindData();
			}
		}

		private void Datagrid1_DeleteCommand(object source, System.Web.UI.WebControls.DataGridCommandEventArgs e)
		{
				string bz = ((TextBox)e.Item.Cells[6].Controls[0]).Text;
		
			string id=Datagrid1.DataKeys [e.Item.ItemIndex].ToString ();//e.Item.Cells[1].Text;
			if (id!="")
			{//this.glyname.ToString()
				string str=string.Format("{0:yyyy-MM-dd HH:mm:ss}",DateTime.Now);
				string cmd="update 维修记录 set 完结人='',记录状态='已接收',完结日期=null where wxid="+id;
				DBBase.ExecuteSql (cmd);
				//myClass.upDateArea(id,code,name);
				Datagrid1.EditItemIndex = -1;
				//	DG1.DataSource = myClass.bindGrid();
				BindData();
			}
		}
		public void DGToExcel(System.Web.UI.Control ctl)
		{
			HttpContext.Current.Response.AppendHeader("Content-Disposition","attachment;filename=Excel.xls");
			HttpContext.Current.Response.Charset ="UTF-8";
			HttpContext.Current.Response.ContentEncoding =System.Text.Encoding.Default;
			HttpContext.Current.Response.ContentType ="application/ms-excel";
			ctl.Page.EnableViewState =false;
			System.IO.StringWriter tw = new System.IO.StringWriter() ;
			System.Web.UI.HtmlTextWriter hw = new System.Web.UI.HtmlTextWriter (tw);
			ctl.RenderControl(hw);
			HttpContext.Current.Response.Write(tw.ToString());
			HttpContext.Current.Response.End();
		}


	}
}
