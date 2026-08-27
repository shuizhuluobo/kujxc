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
using System.Web.Security;

using jxc.ascx;

namespace jxc.admin
{
	/// <summary>
	/// gly_manage 的摘要说明。
	/// </summary>
	public class gly_manage : jxc.UsrControl.UserPage
	{
		protected System.Web.UI.WebControls.DataGrid DataGrid1;
		protected System.Web.UI.WebControls.Button detail;
		protected System.Web.UI.WebControls.Button delete;
		utils u = new utils ();
		protected System.Web.UI.WebControls.Button change;
		protected System.Web.UI.WebControls.Button Button1;
		protected System.Web.UI.WebControls.Button Button2;
		protected dgNavigation DgNavigation1;
		
		private void Page_Load(object sender, System.EventArgs e)
		{
			u.SetGridStyle(this.DataGrid1);
			DgNavigation1.SetTarget(DataGrid1,null,new BindDataDelegate(BindData));//BindData是你的数据邦定事件
			if (!this.Page.IsPostBack)
			{
				BindData ();
				delete.Attributes.Add("onclick","return confirm('您真的要删除吗？')");
			}
		}
		private void BindData ()
		{
			DataSet ds = DBBase.ExecuteSql4Ds ("select glydh,glyname,cnc_role.role,(select jgmc from cnc_jgglb where cnc_jgglb.jgbh=cnc_glyb.jgbh) as ssjg,(select listname from rs_corsub where sortid=6 and listid=rank) as zw from cnc_glyb,cnc_role where cnc_role.roleid=*cnc_glyb.roleid and jgbh='" + this.Request.QueryString["id"] + "'","glyb");
			this.DataGrid1.DataSource = ds.Tables ["glyb"].DefaultView;
			this.DataGrid1.DataBind ();
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
			this.detail.Click += new System.EventHandler(this.detail_Click);
			this.change.Click += new System.EventHandler(this.change_Click);
			this.delete.Click += new System.EventHandler(this.delete_Click);
			this.Button2.Click += new System.EventHandler(this.Button2_Click);
			this.Load += new System.EventHandler(this.Page_Load);

		}
		#endregion

		private void detail_Click(object sender, System.EventArgs e)
		{
			if (this.Page.IsPostBack)
			{
				string direction = "gly_add.aspx?jgbh=" + this.Request.QueryString["id"];
				u.OpenIEWindowRight (this,direction,400,300);
			}
		}

		private void delete_Click(object sender, System.EventArgs e)
		{
			string id = utils.FindFirstCheckedItem(this.DataGrid1);
			if (id == "")
			{
				utils.Alert (this,"请选择一项");
				return;
			}
			try
			{
				DBBase.ExecuteSql ("delete from cnc_glyb where glydh='" + id + "'");
				utils.Alert (this,"删除成功");
				BindData ();
			}
			catch
			{
				utils.Alert (this,"删除失败");
			}
		}

		private void change_Click(object sender, System.EventArgs e)
		{
			string id = utils.FindFirstCheckedItem (this.DataGrid1);
			if (id == "")
			{
				utils.Alert (this,"请选择一项");
				return;
			}
			u.OpenIEWindowRight(this,"gly_change.aspx?id=" +id,400,400);
		}


		private void Button2_Click(object sender, System.EventArgs e)
		{
			string id = utils.FindFirstCheckedItem (this.DataGrid1);
			if (id == "")
			{
				utils.Alert (this,"请选择一项");
				return;
			}
			try
			{
				DBBase.ExecuteSql ("update cnc_glyb set glymm='" + id + "' where glydh='" + id + "'");
				utils.Alert (this,"重置密码成功！");
			}
			catch
			{
				utils.Alert (this,"重置密码成功！");
			}
		}
	}
}
