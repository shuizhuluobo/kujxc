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

namespace jxc.admin.bases
{
	/// <summary>
	/// Base_Add 的摘要说明。
	/// </summary>
	public class Base_Add : System.Web.UI.Page
	{
		protected System.Web.UI.WebControls.TextBox sortid;
		protected System.Web.UI.WebControls.TextBox listid;
		protected System.Web.UI.WebControls.TextBox listname;
		protected System.Web.UI.WebControls.Button save;
	
		private void Page_Load(object sender, System.EventArgs e)
		{
			if (!this.Page.IsPostBack)
			{
				this.sortid.Text = this.Request.QueryString["sortid"];
				string cmd = "select max(convert(int,listid)) + 1 from rs_corsub where sortid=" + this.Request.QueryString["sortid"];
				SqlDataReader dr = DBBase.ExecuteSqlReader (cmd);
				if (dr.Read ())
				{
					this.listid.Text = dr[0].ToString ();
				}
				else
				{
					this.listid.Text = this.Request.QueryString["sortid"] + "001";
				}
				dr.Close ();
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
			this.save.Click += new System.EventHandler(this.save_Click);
			this.Load += new System.EventHandler(this.Page_Load);

		}
		#endregion

		private void save_Click(object sender, System.EventArgs e)
		{
			string cmd = "insert into rs_corsub(listid,listname,sortid,ynstop)values('" + this.listid.Text.Trim () + "','" +
				this.listname.Text.Trim () + "'," + this.Request.QueryString["sortid"] + ",0)";

			try
			{
				DBBase.ExecuteSql (cmd);
				utils.Alert (this,"保存成功");
				JSUtil.Close(this);
			}
			catch(Exception ee)
			{
				utils.Alert (this,"存盘失败,系统已恢复到保存前的状态" + ee.Message);
			}
			
		}
	}
}
