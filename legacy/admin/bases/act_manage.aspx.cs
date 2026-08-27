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

namespace jxc.admin.bases
{
	/// <summary>
	/// act_manage 的摘要说明。
	/// </summary>
	public class act_manage : System.Web.UI.Page
	{
		protected System.Web.UI.WebControls.DataGrid Datagrid1;
		protected System.Web.UI.WebControls.Button add;
		protected System.Web.UI.WebControls.Button delete;
		protected System.Web.UI.WebControls.Button change;
		utils u = new utils ();
		private void Page_Load(object sender, System.EventArgs e)
		{
			u.SetGridStyle (this.Datagrid1);
			if (!this.Page.IsPostBack)
			{
				delete.Attributes.Add("onclick","return confirm('您真的要删除吗？')");
				BindData ();
			}
		}
		private void BindData ()
		{
			string cmd = "select id,(select listname  from rs_corsub where listid=rankid) as rank,(select name from cnc_act where cnc_act.id=actid) as actname,(case memtype when 0 then '个人网员' else '企业网员' end) as memtype,nofee,count,feeone from act_rank_set";
			DataSet ds = DBBase.ExecuteSql4Ds (cmd,"act_rank_set");
			this.Datagrid1.DataSource = ds.Tables["act_rank_set"].DefaultView;
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
			this.delete.Click += new System.EventHandler(this.delete_Click);
			this.change.Click += new System.EventHandler(this.change_Click);
			this.Load += new System.EventHandler(this.Page_Load);

		}
		#endregion

		private void add_Click(object sender, System.EventArgs e)
		{
			u.OpenIEWindowRight (this,"act_rank_add.aspx",500,500);
		}

		private void delete_Click(object sender, System.EventArgs e)
		{
			string id = utils.FindFirstCheckedItem (this.Datagrid1);
			if (id == "")
			{
				utils.Alert (this,"至少选择一项");
				return;
			}
			string cmd = "delete from act_rank_set where id=" + id;
			try
			{
				DBBase.ExecuteSql(cmd);
				utils.Alert (this,"删除成功");
				BindData ();
			}
			catch
			{
				utils.Alert (this,"删除失败，请与管理员联系");
				return;
			}
		}

		private void change_Click(object sender, System.EventArgs e)
		{
			string id = utils.FindFirstCheckedItem (this.Datagrid1);
			if (id == "")
			{
				utils.Alert (this,"至少选择一项");
				return;
			}
			u.OpenIEWindowRight (this,"act_rank_change.aspx?id=" + id,500,500);
		}
	}
}
