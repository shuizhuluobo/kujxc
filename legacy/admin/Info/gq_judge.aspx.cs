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

namespace jxc.admin.Info
{
	/// <summary>
	/// gq_judge 的摘要说明。
	/// </summary>
	public class gq_judge : System.Web.UI.Page
	{
		protected System.Web.UI.WebControls.DataGrid Datagrid1;
		protected System.Web.UI.WebControls.Button judge;
		protected System.Web.UI.WebControls.DropDownList DropDownList1;
		protected System.Web.UI.WebControls.Button query;
		protected System.Web.UI.WebControls.Button delete;
	
		protected dgNavigation DgNavigation1;
		protected System.Web.UI.WebControls.Button Button1;
		protected System.Web.UI.WebControls.Button Button2;
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
			this.Button1.Click += new System.EventHandler(this.Button1_Click);
			this.judge.Click += new System.EventHandler(this.judge_Click);
			this.Load += new System.EventHandler(this.Page_Load);

		}
		#endregion

		private void judge_Click(object sender, System.EventArgs e)
		{
			string id = utils.FindFirstCheckedItem (this.Datagrid1);
			if (id == "")
			{
				utils.Alert (this,"请选择一项");
				return;
			}
			u.OpenIEWindowRight(this,"gq_change.aspx?id="+id,700,500);
		}

		private void query_Click(object sender, System.EventArgs e)
		{
			BindData ();
		}
		private void BindData ()
		{
			string cmd = "select id,title,comid,addtime,province+city as area,(case pass when 0 then '未审核' else '已审核' end) as ifjudge from ytsdinfo where 1=1 ";
			if (this.DropDownList1.SelectedIndex > 0)
				cmd += " and pass=" + this.DropDownList1.SelectedItem.Value;
			DataSet ds = DBBase.ExecuteSql4Ds (cmd,"ytsdinfo");
			this.Datagrid1.DataSource = ds.Tables["ytsdinfo"].DefaultView;
			this.Datagrid1.DataBind ();
		}

		private void Button1_Click(object sender, System.EventArgs e)
		{
			string id = utils.FindFirstCheckedItem (this.Datagrid1);
			if (id == "")
			{
				utils.Alert (this,"请选择一项");
				return;
			}
			u.OpenIEWindowRight(this,"gq_change.aspx?id="+id,700,500);
		}
	}
}
