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

namespace CNC.admin.bases
{
	/// <summary>
	/// SmallClass_add 的摘要说明。
	/// </summary>
	public class SmallClass_add : System.Web.UI.Page
	{
		protected System.Web.UI.WebControls.TextBox name;
		protected System.Web.UI.WebControls.TextBox big;
		protected System.Web.UI.WebControls.TextBox small;
		protected System.Web.UI.WebControls.Button save;
	
		private void Page_Load(object sender, System.EventArgs e)
		{
			if (!this.Page.IsPostBack)
			{
				this.big.Text = this.Request.QueryString["id"];
				string cmd = "select isnull(max(smallid),0) + 1 from cnc_small where bigid='" + this.Request.QueryString["id"] + "'";
				SqlDataReader dr = DBBase.ExecuteSqlReader (cmd);
				if (dr.Read ())
				{
					this.small.Text =dr[0].ToString ();
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
			if (this.name.Text.Trim () == "")
			{
				utils.Alert (this,"请输入业务小类名称");
				return;
			}
			dboper oper = new dboper ();
			if (oper.IsExists("select 1 from cnc_small where bigid='" + this.big.Text + "' and smallid=" + this.small.Text.Trim () + " and smallname='" + this.name.Text.Trim () + "'"))
			{
				utils.Alert (this,"该业务小类名称已经存在");
				oper.shutdown ();
				return;
			}

			string cmd = "insert into cnc_small (bigid,smallid,smallname)values('" + this.big.Text.Trim () + "'," + this.small.Text.Trim () + ",'" + this.name.Text.Trim () + "')";
			try
			{
				oper.Exec (cmd);
				utils.Alert (this,"保存成功");
			}
			catch(Exception ee)
			{
				utils.Alert (this,"存盘失败,系统已恢复到保存前的状态" + ee.Message);
			}
			finally
			{
				oper.shutdown ();
				oper = null;
			}
		}
	}
}
