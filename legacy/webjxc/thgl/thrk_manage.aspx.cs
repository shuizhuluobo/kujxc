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
	/// thrk_manage 的摘要说明。
	/// </summary>
	public class thrk_manage :jxc.UsrControl.UserPage//System.Web.UI.Page//  
	{
		protected System.Web.UI.WebControls.DataGrid Datagrid1;
		protected System.Web.UI.WebControls.Button change;
		protected System.Web.UI.WebControls.Button delete;
		protected System.Web.UI.WebControls.Button add;
		protected System.Web.UI.WebControls.Button query;
		protected System.Web.UI.WebControls.TextBox cpname;

		protected dgNavigation DgNavigation1;
		protected System.Web.UI.WebControls.DropDownList DropDownListlx;
		protected System.Web.UI.WebControls.Button Button1;
	
		utils u = new utils ();

		private void Page_Load(object sender, System.EventArgs e)
		{
			u.SetGridStyle(this.Datagrid1);
		
			DgNavigation1.SetTarget(Datagrid1,null,new BindDataDelegate(BindData));//BindData是你的数据邦定事件
			DgNavigation1.SetStyle(20, false);//10表示每页分10行，true表示无分页时自动隐藏
			if (!this.Page.IsPostBack)
			{
				utils.BindDropDownList("select jgmc,jgmc from cnc_jgglb where parent1='01'",this.DropDownListlx);
				BindData ();
				//delete.Attributes.Add("onclick","return confirm('您真的要打印吗？')");
			//	change.Attributes.Add("onclick","return confirm('您真的确认已经下拨？')");
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
			this.Datagrid1.ItemDataBound += new System.Web.UI.WebControls.DataGridItemEventHandler(this.Datagrid1_ItemDataBound);
			this.Button1.Click += new System.EventHandler(this.Button1_Click);
			this.Load += new System.EventHandler(this.Page_Load);

		}
		#endregion

		private void BindData ()
		{
			string cmd = "select * from 退货单 where 1=1 ";
			if (this.cpname.Text != string.Empty)
				cmd += " and 客户名称 like '%" + this.cpname.Text.Trim () + "%'";
             if (DropDownListlx.SelectedIndex!=0)
				 cmd +=" and 地区 ='"+this.DropDownListlx.SelectedItem.ToString()+"'";

			if (this.groupname.ToString()!="0")
			{
				cmd+=" and 经办人='"+this.glyname.ToString()+"'";
				this.DropDownListlx.Enabled=false;
			}
			cmd+=" order by 退货日期 desc ";
			DataSet ds = DBBase.ExecuteSql4Ds (cmd,"thrk");
			this.Datagrid1.DataSource = ds.Tables["thrk"].DefaultView;
			this.Datagrid1.DataBind ();
		}

		private void query_Click(object sender, System.EventArgs e)
		{
			BindData ();
		}

		private void add_Click(object sender, System.EventArgs e)
		{
			string id = utils.FindFirstCheckedItem(this.Datagrid1);

			u.OpenIEWindowRight(this,"thrk_edit.aspx?rkid="+id,750,550);
			
		}

		private void change_Click(object sender, System.EventArgs e)
		{
		string id = utils.FindFirstCheckedItem(this.Datagrid1);
//			u.OpenIEWindowRight(this,"thrk_edit.aspx?cpid=" + id,500,500);
			string cmd="update 退货单 set 到货确认='是' where xsid='"+id+"'";
			DBBase.ExecuteSql (cmd);
			BindData ();
	    
		}

		private void delete_Click(object sender, System.EventArgs e)
		{
//			string id = utils.FindFirstCheckedItem(this.Datagrid1);
//			u.OpenIEWindowPrint(this,"xsprint.aspx?id="+id,750,550);
			string id = utils.FindFirstCheckedItem(this.Datagrid1);
			u.OpenIEWindowPrint(this,"xsprint.aspx?id="+id,750,550);
			BindData ();
		}

		private void Datagrid1_ItemDataBound(object sender, System.Web.UI.WebControls.DataGridItemEventArgs e)
		{
			
		}

		private void Button1_Click(object sender, System.EventArgs e)
		{
			string id = utils.FindFirstCheckedItem(this.Datagrid1);
            if (id!="")
			u.OpenIEWindowRight(this,"thrk_edit.aspx?xsid="+id,750,550);
			else
            utils.Alert (this,"请选择要修改的销售单!");
		}
	}
}
