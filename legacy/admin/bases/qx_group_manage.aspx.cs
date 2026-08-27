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
	/// qx_group_manage 的摘要说明。
	/// </summary>
	public class qx_group_manage : System.Web.UI.Page
	{
		protected System.Web.UI.WebControls.Button add;
		protected System.Web.UI.WebControls.DropDownList DropDownList1;
		protected System.Web.UI.WebControls.DataGrid Datagrid1;
	
		protected dgNavigation DgNavigation1;
		protected System.Web.UI.WebControls.Button query;
		utils u = new utils ();
		private void Page_Load(object sender, System.EventArgs e)
		{
			u.SetGridStyle(this.Datagrid1);
			DgNavigation1.SetTarget(Datagrid1,null,new BindDataDelegate(BindData));//BindData是你的数据邦定事件
			DgNavigation1.SetStyle(20, false);//10表示每页分10行，true表示无分页时自动隐藏
			if (!this.Page.IsPostBack)
			{
				utils.BindDropDownList("select groupid,des from cnc_qxgroup",this.DropDownList1);
				BindData ();
			}
		}
		private void BindData ()
		{
			string cmd = "SELECT id,";
			cmd += "(SELECT des FROM cnc_qxgroup WHERE cnc_qxgroup_child.groupid = cnc_qxgroup.groupid) AS groupname,";
			cmd += "(SELECT des FROM cnc_qxcdb WHERE cnc_qxgroup_child.id = cnc_qxcdb.id) AS des1,";
			cmd += "(SELECT des FROM cnc_qxcdb WHERE cnc_qxgroup_child.parentid = cnc_qxcdb.id) AS des2 ,";
			cmd += " (case rank when 0 then '<font color=red>一级</font>' else '二级' end) as rank ";
			cmd += "FROM cnc_qxgroup_child where 1=1 ";
			if (this.DropDownList1.SelectedIndex != 0)
				cmd += " and groupid=" + this.DropDownList1.SelectedItem.Value;

			cmd += " order by parentid asc";

			DataSet ds = DBBase.ExecuteSql4Ds (cmd,"cnc_qxgroup_child");
			this.Datagrid1.DataSource = ds.Tables["cnc_qxgroup_child"].DefaultView;
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
			this.query.Click += new System.EventHandler(this.query_Click);
			this.Load += new System.EventHandler(this.Page_Load);

		}
		#endregion

		private void query_Click(object sender, System.EventArgs e)
		{
			BindData ();
		}
	}
}
