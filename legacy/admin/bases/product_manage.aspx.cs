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
	/// product_manage 的摘要说明。
	/// </summary>
	public class product_manage :jxc.UsrControl.UserPage// System.Web.UI.Page
	{
		protected System.Web.UI.WebControls.DataGrid Datagrid1;
		protected System.Web.UI.WebControls.Button change;
		protected System.Web.UI.WebControls.Button delete;
		protected System.Web.UI.WebControls.Button add;
		protected System.Web.UI.WebControls.Button query;
		protected System.Web.UI.WebControls.TextBox cpname;

		protected dgNavigation DgNavigation1;
		protected System.Web.UI.WebControls.DropDownList DropDownList1;
		protected System.Web.UI.WebControls.Button Button1;
		protected System.Web.UI.WebControls.CheckBox CheckBox1;
		protected System.Web.UI.WebControls.TextBox Textbox1;
		protected System.Web.UI.WebControls.DropDownList Dropdownlist3;
	
		utils u = new utils ();

		private void Page_Load(object sender, System.EventArgs e)
		{
			u.SetGridStyle(this.Datagrid1);
			DgNavigation1.SetTarget(Datagrid1,null,new BindDataDelegate(BindData));//BindData是你的数据邦定事件
			DgNavigation1.SetStyle(20, false);//10表示每页分10行，true表示无分页时自动隐藏
			if (!this.Page.IsPostBack)
			{
				utils.BindDropDownList("select listname,listname from 产品类别 where orderid=0",this.Dropdownlist3);
				if (this.roleid.ToString()=="8")
				{

					this.delete.Enabled=true;
					this.Button1.Enabled=true;
				}
				BindData ();
				delete.Attributes.Add("onclick","return confirm('您真的要删除吗？')");
				Button1.Attributes.Add("onclick","return confirm('您真的要删除吗,删除后数据不可恢复!!!')");


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
			this.Dropdownlist3.SelectedIndexChanged += new System.EventHandler(this.Dropdownlist3_SelectedIndexChanged);
			this.query.Click += new System.EventHandler(this.query_Click);
			this.add.Click += new System.EventHandler(this.add_Click);
			this.delete.Click += new System.EventHandler(this.delete_Click);
			this.change.Click += new System.EventHandler(this.change_Click);
			this.Button1.Click += new System.EventHandler(this.Button1_Click);
			this.Load += new System.EventHandler(this.Page_Load);

		}
		#endregion

		private void BindData ()
		{
			string cmd = "select * from 产品信息 where 1=1  ";
			if (this.cpname.Text != string.Empty)
				cmd += " and (产品名称 like '%" + this.cpname.Text.Trim () + "%' or cpid='"+this.cpname.Text.Trim()+"')";
			if (this.DropDownList1.SelectedIndex==0)
				cmd+=" and 是否下柜='否'";
			if (this.DropDownList1.SelectedIndex==1)
				cmd+=" and 是否下柜='是'";
            if (this.CheckBox1.Checked)
				cmd+=" and 类别 like '%"+this.Textbox1.Text+"%'";
			DataSet ds = DBBase.ExecuteSql4Ds (cmd+" order by 修改日期 desc","product");
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
			u.OpenIEWindowRight(this,"product_edit.aspx",500,500);
			
		}

		private void change_Click(object sender, System.EventArgs e)
		{
			string id = utils.FindFirstCheckedItem(this.Datagrid1);
			u.OpenIEWindowRight(this,"product_edit.aspx?cpid=" + id,500,500);
		}

		private void delete_Click(object sender, System.EventArgs e)
		{
					string id = utils.FindFirstCheckedItem(this.Datagrid1);
			//u.OpenIEWindowRight(this,"yplbsz_edit.aspx?cpid=" + id,500,500);
						string cmd="update 产品信息 set 是否下柜='是' where cpid='"+id+"'";
						DBBase.ExecuteSql (cmd);
						BindData ();
		}

		private void Button1_Click(object sender, System.EventArgs e)
		{
			string id = utils.FindFirstCheckedItem(this.Datagrid1);
			string[] cmd=new string[2];
            cmd[0]="update 产品信息 set 是否下柜='是' where cpid='"+id+"'";
			cmd[1]="delete 入库单 where cpid='"+id+"'";
			DBBase.ExecuteSqls (cmd);
			BindData (); 
		}

		private void Dropdownlist3_SelectedIndexChanged(object sender, System.EventArgs e)
		{
			Textbox1.Text=this.Dropdownlist3.SelectedValue.ToString();
		}
	}
}
