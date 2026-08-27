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

namespace jxc.admin.info
{
	/// <summary>
	/// xwdt_manage 的摘要说明。
	/// </summary>
	public class xwdt_manage : jxc.UsrControl.UserPage
	{
		protected System.Web.UI.WebControls.DataGrid Datagrid1;
		protected System.Web.UI.WebControls.Button add;
		protected System.Web.UI.WebControls.Button delete;
		protected System.Web.UI.WebControls.Button change;

		protected dgNavigation DgNavigation1;
		utils u = new utils ();
		public string name = "";
		protected System.Web.UI.WebControls.CheckBox selectall;
	
		protected FreeTextBoxControls.FreeTextBox FreeTextBox1;

		private void Page_Load(object sender, System.EventArgs e)
		{
			u.SetGridStyle(this.Datagrid1);
			DgNavigation1.SetTarget(Datagrid1, selectall,new BindDataDelegate(BindData));//BindData是你的数据邦定事件
			DgNavigation1.SetStyle(12, false);//10表示每页分10行，true表示无分页时自动隐藏
			if (!this.Page.IsPostBack)
			{
				this.selectall.Checked = false;
				delete.Attributes.Add("onclick","return confirm('您真的要删除吗？')");
				BindData ();
			}
		}

		private void BindData ()
		{
			string cmd = "select bh,bt,cnc_glyb.glyname as zz,fbsj,(select orderid from rs_corsub where listid=cnc_glyb.rank) as orderid from t_master2,cnc_glyb where t_master2.zz=cnc_glyb.glydh  order by orderid asc ,fbsj desc";
			
			DataSet ds =DBBase.ExecuteSql4Ds(cmd,"t_master");
			this.Datagrid1.DataSource = ds.Tables["t_master"];
			this.Datagrid1.DataBind ();
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
			this.change.Click += new System.EventHandler(this.change_Click);
			this.Load += new System.EventHandler(this.Page_Load);

		}
		#endregion

		private void add_Click(object sender, System.EventArgs e)
		{
			string direction = "xwdt_add.aspx?id=" + this.Request.QueryString["id"];
			u.OpenIEWindowRight (this,direction,580,500);
		}

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

		private void delete_Click(object sender, System.EventArgs e)
		{
			if (this.Page.IsPostBack)
			{
				string id=utils.FindCheckedItem (this.Datagrid1);
				if (id == "")
				{
					utils.Alert (this,"你没有选择!");
					return;
				}
				string [] ids = id.Split(',');

				string cmd = "delete from t_master2 where bh in (" + id + ")";

				try
				{
					DBBase.ExecuteSql (cmd);
				}
				catch (Exception ee)
				{
					utils.Alert (this,"删除公告失败！" + ee.Message);
					return;
				}

				utils.Alert (this,"删除公告成功！");
				BindData ();
			}
		}

		private void change_Click(object sender, System.EventArgs e)
		{
			if (this.Page.IsPostBack)
			{
				string id=utils.FindFirstCheckedItem (this.Datagrid1);
				if (id == "")
				{
					utils.Alert (this,"你没有选择!");
					return;
				}
				string direction = "xwdt_change.aspx?bh=" + id;
				u.OpenIEWindowRight (this,direction,580,500);
			}
		}

		private void Button1_Click(object sender, System.EventArgs e)
		{
			if (this.Page.IsPostBack)
			{
				string id=utils.FindFirstCheckedItem (this.Datagrid1);
				if (id == "")
				{
					utils.Alert (this,"你没有选择要排序的行!");
					return;
				}

				foreach (DataGridItem _item in this.Datagrid1.Items) 
				{
					if (((CheckBox) _item.Cells[0].FindControl("selectcheck")).Checked)
					{
						string updatecmd = "update t_master set xh = " +  ((TextBox)_item.Cells[4].FindControl("orderid")).Text.Trim() + "where bh =" +   Datagrid1.DataKeys [_item.ItemIndex].ToString().Trim ();
						
						DBBase.ExecuteSql(updatecmd);
					}
				}

				utils.Alert (this,"修改成功");
				BindData ();
			}
		}

		private void Button2_Click(object sender, System.EventArgs e)
		{
			BindData ();
		}
	}
}
