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

namespace jxc.admin.info
{
	/// <summary>
	/// xwdt_add 的摘要说明。
	/// </summary>
	public class xwdt_add : jxc.UsrControl.UserPage
	{
		protected System.Web.UI.WebControls.TextBox title;
		protected System.Web.UI.WebControls.TextBox inputdate;
		protected System.Web.UI.WebControls.Button Button2;
		public string name = "";
		protected System.Web.UI.WebControls.DropDownList DropDownList1;
		protected System.Web.UI.WebControls.TextBox zz;
		protected System.Web.UI.WebControls.TextBox writer;

		protected FreeTextBoxControls.FreeTextBox FreeTextBox1;

		private void Page_Load(object sender, System.EventArgs e)
		{
			if (!this.Page.IsPostBack)
			{
				this.inputdate.Text = System.DateTime.Now.ToString ("yyyy-MM-dd");
				this.zz.Text = this.glyname;
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
			if (this.Page.IsPostBack)
			{
				if (this.title.Text == "")
				{
					utils.Alert (this,"新闻标题不能为空！");
					return;
				}
				if (this.FreeTextBox1.Text == "")
				{
					utils.Alert (this,"新闻详细内容不能为空！");
					return;
				}

				string cmd = "insert into t_master2(bt,zz,fbsj,nr,xh,judgestate,writer) values ('" +
					this.title.Text.Trim () +  "','" + 
					this.glydh + "','" + 
					this.inputdate.Text.Trim () + "','" + 
					this.FreeTextBox1.Text.Trim().Replace("'","\"") + "',0,0,'" + this.writer.Text.Trim () + "')";

				try
				{
					DBBase.ExecuteSql (cmd);
				}
				catch (Exception ee)
				{
					utils.Alert (this,"填加失败！" + ee.Message);
					return;
				}

				utils.Alert (this,"填加成功！");
				//this.Button2.Enabled = false;
			}
		}
	}
}
