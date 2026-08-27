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
	/// my_judge_manage 的摘要说明。
	/// </summary>
	public class my_judge_manage : jxc.UsrControl.UserPage
	{
		protected System.Web.UI.WebControls.DataGrid Datagrid1;
		protected System.Web.UI.WebControls.Button add;
	
		protected dgNavigation DgNavigation1;
		protected System.Web.UI.WebControls.Button changesort;

		utils u = new utils ();
		private void Page_Load(object sender, System.EventArgs e)
		{
			u.SetGridStyle(this.Datagrid1);
			DgNavigation1.SetTarget(Datagrid1,null,new BindDataDelegate(BindData));//BindData是你的数据邦定事件
			DgNavigation1.SetStyle(20, true);//10表示每页分10行，true表示无分页时自动隐藏
			if (!this.Page.IsPostBack)
			{
				BindData ();
			}
		}
		private void BindData()
		{
			string cmd = "select a.bh,bt,fbsj,(select glyname from cnc_glyb where glydh=zz) as glyname,(select judgename from rs_corsub where listid=judgeczy) as judge,(case iffinish when 0 then '<font color=red>审批中</font>' when '1' then '审批通过' when '2' then '待定' else '不通过' end) as status  from t_master a,t_master_child b where a.bh=b.bh and b.glydh='" + this.glydh + "' order by a.fbsj desc";
			DataSet ds = DBBase.ExecuteSql4Ds (cmd,"t_master");
			this.Datagrid1.DataSource = ds.Tables[0].DefaultView;
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
			this.changesort.Click += new System.EventHandler(this.changesort_Click);
			this.Load += new System.EventHandler(this.Page_Load);

		}
		#endregion

		private void changesort_Click(object sender, System.EventArgs e)
		{
			string id = utils.FindFirstCheckedItem(this.Datagrid1);
			if (id == "")
			{
				utils.Alert (this,"请选择一项");
				return;
			}
			u.OpenIEWindowRight (this,"view_judge.aspx?id=" + id,800,600);
		}

		private void add_Click(object sender, System.EventArgs e)
		{
			string id = utils.FindFirstCheckedItem(this.Datagrid1);
			if (id == "")
			{
				utils.Alert (this,"请选择一项");
				return;
			}
			u.OpenIEWindowRight (this,"change_judge.aspx?id=" + id,800,600);
		}
	}
}
