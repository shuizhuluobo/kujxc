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

namespace jxc.admin
{
	/// <summary>
	/// gly_change 的摘要说明。
	/// </summary>
	public class gly_change : System.Web.UI.Page
	{
		protected System.Web.UI.WebControls.TextBox tglydh;
		protected System.Web.UI.WebControls.TextBox tglyname;
		protected System.Web.UI.WebControls.DropDownList DropDownList1;
		protected System.Web.UI.WebControls.Button add;
	
		private void Page_Load(object sender, System.EventArgs e)
		{
			if (!this.Page.IsPostBack)
			{
				this.tglydh.Text = this.Request.QueryString["id"];
				string cmd = "select glyname from cnc_glyb where glydh='" + this.Request.QueryString["id"] + "'";
				SqlDataReader dr = DBBase.ExecuteSqlReader (cmd);
				if (dr.Read ())
				{
					this.tglyname.Text = dr[0].ToString ();
				}
				dr.Close ();
				utils.BindDropDownList ("select roleid,role from cnc_role",this.DropDownList1);
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
			this.add.Click += new System.EventHandler(this.add_Click);
			this.Load += new System.EventHandler(this.Page_Load);

		}
		#endregion

		private void add_Click(object sender, System.EventArgs e)
		{
			string cmd = "update cnc_glyb set glyname='" + this.tglyname.Text.Trim () + "',roleid=" + this.DropDownList1.SelectedItem.Value + " where glydh='" + this.tglydh.Text.Trim () + "'";
			
			try
			{
				DBBase.ExecuteSql(cmd);
				utils.Alert (this,"保存成功");
			}
			catch(Exception ee)
			{
				utils.Alert (this,"存盘失败,系统已恢复到保存前的状态" + ee.Message);
			}
			
		}
	}
}
