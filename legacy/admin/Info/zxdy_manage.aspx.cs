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

namespace jxc.admin.info
{
	/// <summary>
	/// zxdy_manage 的摘要说明。
	/// </summary>
	public class zxdy_manage : System.Web.UI.Page
	{
		protected System.Web.UI.WebControls.DataGrid Datagrid1;
		protected System.Web.UI.WebControls.Button add;
		protected System.Web.UI.WebControls.Button delete;
		protected System.Web.UI.WebControls.Button change;
		protected System.Web.UI.WebControls.Button ret;
	
		protected dgNavigation DgNavigation1;
		utils u = new utils ();
		public string name = "";

		private void Page_Load(object sender, System.EventArgs e)
		{
			u.SetGridStyle(this.Datagrid1);
			DgNavigation1.SetTarget(Datagrid1, null,new BindDataDelegate(BindData));//BindData是你的数据邦定事件
			DgNavigation1.SetStyle(12, false);//10表示每页分10行，true表示无分页时自动隐藏
			if (!this.Page.IsPostBack)
			{
				BindData ();
				delete.Attributes.Add("onclick","return confirm('您真的要删除吗？')");
				name = this.Request.QueryString["name"];
			}
		}

		private void BindData ()
		{
			string cmd = "select zxdyid,twxm,fasj,twbt,sfhf,(case twlb when 0 then '公众调查' when 1 then '政务监督' else '申述举报' end) as lb from index_zxdy order by sfhf";
			DataSet ds = DBBase.ExecuteSql4Ds(cmd,"index_zxdy");
			this.Datagrid1.DataSource = ds.Tables["index_zxdy"];
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
			this.delete.Click += new System.EventHandler(this.delete_Click);
			this.ret.Click += new System.EventHandler(this.ret_Click);
			this.Load += new System.EventHandler(this.Page_Load);

		}
		#endregion

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


		private void ret_Click(object sender, System.EventArgs e)
		{
			string key = "";
			foreach (DataGridItem item in Datagrid1.Items)
			{
				if (((CheckBox) item.Cells[1].FindControl("selectcheck")).Checked)
				{
					key = Datagrid1.DataKeys [item.ItemIndex].ToString () ;
					break;
				}
			}
			if (key == "")
			{
				utils.Alert (this,"请选择一项进行回复!");
				return;
			}
			string direction = "zxdy_add.aspx?id2=" + key ;
			
			u.OpenIEWindowRight (this,direction,580,600);
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
				string cmd = "delete from index_zxdy where zxdyid=" + id;

				try
				{
					DBBase.ExecuteSql (cmd);
				}
				catch (Exception ee)
				{
					utils.Alert (this,"删除在线答疑失败！" + ee.Message);
					return;
				}

				utils.Alert (this,"删除在线答疑成功！");

				BindData ();
			}
		}
	}
}
