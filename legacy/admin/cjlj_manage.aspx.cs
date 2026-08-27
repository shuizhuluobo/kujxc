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

namespace jxc.admin
{
	/// <summary>
	/// cjlj_manage 的摘要说明。
	/// </summary>
	public class cjlj_manage : System.Web.UI.Page
	{
		protected System.Web.UI.WebControls.DataGrid Datagrid1;
		protected System.Web.UI.WebControls.CheckBox selectall;
		protected System.Web.UI.WebControls.Button add;
		protected System.Web.UI.WebControls.Button delete;
	
		protected dgNavigation DgNavigation1;
		protected System.Web.UI.WebControls.Button Button1;
		utils u = new utils ();

		private void Page_Load(object sender, System.EventArgs e)
		{
			u.SetGridStyle (this.Datagrid1);
			DgNavigation1.SetTarget(Datagrid1, selectall,new BindDataDelegate(BindData));//BindData是你的数据邦定事件
			DgNavigation1.SetStyle(12, false);//10表示每页分10行，true表示无分页时自动隐藏
			if (!this.Page.IsPostBack)
			{
				this.Datagrid1.Columns[2].HeaderText = this.Request.QueryString["name"] + "标题";

				BindData ();
				this.selectall.Checked = false;
				delete.Attributes.Add("onclick","return confirm('您真的要删除吗？')");
			}
		}

		private void BindData ()
		{
			dboper oper = new dboper ();
			string cmd = "select * from index_link order by xh asc";
			DataSet ds = oper.ReturnDt(cmd,"index_link");
			this.Datagrid1.DataSource = ds.Tables["index_link"];
			this.Datagrid1.DataBind ();
			oper.shutdown ();
			oper.Dispose ();
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
			this.Datagrid1.ItemDataBound += new System.Web.UI.WebControls.DataGridItemEventHandler(this.Datagrid1_ItemDataBound);
			this.selectall.CheckedChanged += new System.EventHandler(this.selectall_CheckedChanged);
			this.add.Click += new System.EventHandler(this.add_Click);
			this.delete.Click += new System.EventHandler(this.delete_Click);
			this.Button1.Click += new System.EventHandler(this.Button1_Click);
			this.Load += new System.EventHandler(this.Page_Load);

		}
		#endregion

		private void selectall_CheckedChanged(object sender, System.EventArgs e)
		{
			if (this.Page.IsPostBack)
			{
				for (int i=0;i<this.Datagrid1.Items.Count;i++)
				{
					if (this.selectall.Checked)
						((CheckBox) Datagrid1.Items[i].Cells[1].FindControl("selectcheck")).Checked = true;
					else
						((CheckBox) Datagrid1.Items[i].Cells[1].FindControl("selectcheck")).Checked = false;
				}
			}
		}

		private void Datagrid1_ItemDataBound(object sender, System.Web.UI.WebControls.DataGridItemEventArgs e)
		{
			if (e.Item.ItemType != ListItemType.Pager && 
				e.Item.ItemType != ListItemType.Header &&
				e.Item.ItemType != ListItemType.Footer )
			{
				e.Item.Attributes.Add("onmouseover","this.bgColor='oldlace';this.style.cursor='hand'");
				e.Item.Attributes.Add("onmouseout","this.bgColor='white'");
			}
		}

		private void add_Click(object sender, System.EventArgs e)
		{
			string direction = "cjlj_add.aspx";
			u.OpenIEWindowRight (this,direction,580,500);
		}

		private void delete_Click(object sender, System.EventArgs e)
		{
			if (this.Page.IsPostBack)
			{
				string id=utils.FindFirstCheckedItem (this.Datagrid1);
				if (id == "")
				{
					utils.Alert (this,"你没有选择!");
					return;
				}
				string cmd = "delete from index_link where linkid=" + id;
				dboper oper = new dboper ();

				try
				{
					oper.Exec (cmd);
				}
				catch (Exception ee)
				{
					utils.Alert (this,"删除超级链接失败！" + ee.Message);
					oper.shutdown ();
					oper.Dispose ();
					return;
				}

				utils.Alert (this,"删除超级链接成功！");
				oper.shutdown ();
				oper.Dispose ();

				BindData ();
			}
		}

		private void Button1_Click(object sender, System.EventArgs e)
		{
			if (this.Page.IsPostBack)
			{
				dboper oper = new dboper ();
				foreach (DataGridItem _item in this.Datagrid1.Items) 
				{
					if (((CheckBox) _item.Cells[0].FindControl("selectcheck")).Checked)
					{
						string updatecmd = "update index_link set xh = " +  ((TextBox)_item.Cells[3].FindControl("orderid")).Text.Trim() + "where linkid =" +   Datagrid1.DataKeys [_item.ItemIndex].ToString().Trim ();
						oper.Exec (updatecmd);
					}
				}

				oper.shutdown ();
				oper.Dispose ();

				utils.Alert (this,"修改成功");
				BindData ();
			}
		}
	}
}
