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

namespace jxc.admin.Info
{
	/// <summary>
	/// info_auditing 的摘要说明。
	/// </summary>
	public class info_auditing : jxc.UsrControl.UserPage
	{
		protected System.Web.UI.WebControls.TextBox title;
		protected System.Web.UI.WebControls.TextBox zz;
		protected System.Web.UI.WebControls.TextBox inputdate;
		protected FreeTextBoxControls.FreeTextBox FreeTextBox1;
		protected System.Web.UI.WebControls.Button Button2;
		protected System.Web.UI.WebControls.Label judge;
		protected System.Web.UI.WebControls.Label hidlabel;
		protected System.Web.UI.WebControls.TextBox writer;
	
		public string state="";
		private void Page_Load(object sender, System.EventArgs e)
		{
			if (!this.Page.IsPostBack)
			{
				string cmd = "select * from t_master where bh = " + this.Request.QueryString["bh"];
				SqlDataReader dr = DBBase.ExecuteSqlReader(cmd);
				if (dr.Read ())
				{
					this.title.Text = dr["bt"].ToString ();
					this.inputdate.Text = dr["fbsj"].ToString ();
					this.FreeTextBox1.Text = dr["nr"].ToString ();
					this.zz.Text = dr["zz"].ToString ();
					this.judge.Text = dr["judgestate"].ToString ();
					this.writer.Text = dr["writer"].ToString ();
					if (this.judge.Text == "0")
						state = "<font color=red>审核状态：未审核－＞通过审核</font>";
					else
						state = "<font color=red>审核状态：已经审核</font>";
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
			this.Button2.Click += new System.EventHandler(this.Button2_Click);
			this.Load += new System.EventHandler(this.Page_Load);

		}
		#endregion

		private void Button2_Click(object sender, System.EventArgs e)
		{
			string cmd = "update t_master set judgestate=" + this.judge.Text.Trim () + "+1,judgedate1=getdate(),judgeczy='" + this.glydh + "' where bh=" + this.Request.QueryString["bh"];
			try
			{
				DBBase.ExecuteSql (cmd);
				utils.Alert (this,"审核成功");
			}
			catch
			{
				utils.Alert (this,"操作失败，请与管理员联系");
			}

		}
	}
}
