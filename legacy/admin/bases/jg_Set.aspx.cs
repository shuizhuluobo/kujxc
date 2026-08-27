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
	/// jg_Set 的摘要说明。
	/// </summary>
	public class jg_Set : jxc.UsrControl.UserPage
	{
		protected System.Web.UI.WebControls.DataGrid Datagrid1;
		protected System.Web.UI.WebControls.Button add;
		protected System.Web.UI.WebControls.Button delete;
	
		protected dgNavigation DgNavigation1;
		protected System.Web.UI.WebControls.Button change;
		protected System.Web.UI.WebControls.Button Button1;
		utils u = new utils ();
		private void Page_Load(object sender, System.EventArgs e)
		{
			u.SetGridStyle(this.Datagrid1);

			DgNavigation1.SetTarget(Datagrid1,null,new BindDataDelegate(BindData));//BindData是你的数据邦定事件
			DgNavigation1.SetStyle(12, false);//10表示每页分10行，true表示无分页时自动隐藏
			if (!this.Page.IsPostBack)
			{
				BindData ();
				delete.Attributes.Add("onclick","return confirm('您真的要删除吗？')");
			}
		}
		private void BindData ()
		{
			DataSet ds = DBBase.ExecuteSql4Ds("select *,(select des from cnc_qxgroup where cnc_qxgroup.groupid=cnc_jgglb.rank) as groups from cnc_jgglb where parent1='" + this.Request.QueryString["id"] + "' order by sortid asc","cnc_jgglb");
			this.Datagrid1.DataSource = ds.Tables["cnc_jgglb"].DefaultView;
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
			this.add.Click += new System.EventHandler(this.add_Click);
			this.change.Click += new System.EventHandler(this.change_Click);
			this.delete.Click += new System.EventHandler(this.delete_Click);
			this.Button1.Click += new System.EventHandler(this.Button1_Click);
			this.Load += new System.EventHandler(this.Page_Load);

		}
		#endregion

		private void add_Click(object sender, System.EventArgs e)
		{
			string direction = "jg_add.aspx?id=" + this.Request.QueryString["id"] ;
			u.OpenIEWindowRight (this,direction,580,500);
		}

		private void change_Click(object sender, System.EventArgs e)
		{
			string jgbh = utils.FindFirstCheckedItem (this.Datagrid1);
			if (jgbh == "")
			{
				utils.Alert (this,"请选择一项");
				return;
			}
			string direction = "jg_change.aspx?jgbh=" + jgbh;
			u.OpenIEWindowRight (this,direction,580,500);
		}

		private void delete_Click(object sender, System.EventArgs e)
		{
			string jgbh = utils.FindFirstCheckedItem (this.Datagrid1);
			if (jgbh == "")
			{
				utils.Alert (this,"请选择一项");
				return;
			}

			try
			{
				DBBase.ExecuteSql ("delete from cnc_jgglb where jgbh='" + jgbh + "'");
				utils.Alert (this,"删除成功");
				BindData ();
			}
			catch
			{
				utils.Alert (this,"删除失败");
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
						if (((TextBox)_item.Cells[6].FindControl("sortid")).Text.Trim() != "")
						{
							string updatecmd = "update cnc_jgglb set sortid = " +  ((TextBox)_item.Cells[6].FindControl("sortid")).Text.Trim() + "where jgbh ='" +   Datagrid1.DataKeys [_item.ItemIndex].ToString().Trim () + "'";
							oper.Exec (updatecmd);
						}
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
