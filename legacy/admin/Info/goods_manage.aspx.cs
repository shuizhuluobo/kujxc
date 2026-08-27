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
	/// goods_manage 的摘要说明。
	/// </summary>
	public class goods_manage : jxc.UsrControl.UserPage
	{
		protected System.Web.UI.WebControls.DataGrid Datagrid1;
		protected System.Web.UI.WebControls.Button delete;
		protected System.Web.UI.WebControls.Button change;
	
		protected dgNavigation DgNavigation1;
		utils u = new utils ();
		private void Page_Load(object sender, System.EventArgs e)
		{
			u.SetGridStyle(this.Datagrid1);
			DgNavigation1.SetTarget(Datagrid1,null,new BindDataDelegate(BindData));//BindData是你的数据邦定事件
			DgNavigation1.SetStyle(20, false);//10表示每页分10行，true表示无分页时自动隐藏
			if (!this.Page.IsPostBack)
			{
				BindData ();
				delete.Attributes.Add("onclick","return confirm('您真的要删除吗？')");
			}
		}
		private void BindData ()
		{
			string cmd = "select gdid,gdname,gdgg,gdtype,gdcolor,gdhitnum,sortid,(case pass when 100 then '已审核' else '未审核' end) as ifjudge from c_goodslist order by pass";
			DataSet ds = DBBase.ExecuteSql4Ds (cmd,"c_goodlist");
			this.Datagrid1.DataSource = ds.Tables["c_goodlist"].DefaultView;
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
			this.delete.Click += new System.EventHandler(this.delete_Click);
			this.change.Click += new System.EventHandler(this.change_Click);
			this.Load += new System.EventHandler(this.Page_Load);

		}
		#endregion

		private void add_Click(object sender, System.EventArgs e)
		{
			string direction = "addgoods.aspx?id=" + this.Request.QueryString["id"];
			u.OpenIEWindowRight (this,direction,580,500);
		}

		private void delete_Click(object sender, System.EventArgs e)
		{
			string id = utils.FindFirstCheckedItem(this.Datagrid1);
			if (id == "")
			{
				utils.Alert (this,"请选择一项");
				return;
			}
			try
			{
				DBBase.ExecuteSql ("delete from c_goodslist where gdid=" + id);
				utils.Alert (this,"删除成功");
				BindData ();
			}
			catch (Exception ee)
			{
				utils.Alert (this,"删除失败" + ee.Message);
			}
		}

		private void change_Click(object sender, System.EventArgs e)
		{
			string id = utils.FindFirstCheckedItem(this.Datagrid1);
			if (id == "")
			{
				utils.Alert (this,"请选择一项");
				return;
			}
			string direction = "goods_details.aspx?id=" + id;
			u.OpenIEWindowRight (this,direction,580,500);
			
		}

		private void changesort_Click(object sender, System.EventArgs e)
		{
			if (this.Page.IsPostBack)
			{
				dboper oper = new dboper ();
				foreach (DataGridItem _item in this.Datagrid1.Items) 
				{
					if (((CheckBox) _item.Cells[0].FindControl("selectcheck")).Checked)
					{
						if (((TextBox)_item.Cells[7].FindControl("sortid")).Text.Trim() != "")
						{
							string updatecmd = "update c_goodslist set sortid = " +  ((TextBox)_item.Cells[7].FindControl("sortid")).Text.Trim() + "where gdid =" +   Datagrid1.DataKeys [_item.ItemIndex].ToString().Trim ();
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
