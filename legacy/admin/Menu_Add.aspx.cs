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

namespace jxc.admin
{
	/// <summary>
	/// Menu_Add 的摘要说明。
	/// </summary>
	public class Menu_Add : System.Web.UI.Page
	{
		protected System.Web.UI.WebControls.TextBox rank;
		protected System.Web.UI.WebControls.TextBox imgpath;
		protected System.Web.UI.WebControls.TextBox parentid;
		protected System.Web.UI.WebControls.TextBox des;
		protected System.Web.UI.WebControls.TextBox id;
		protected System.Web.UI.WebControls.TextBox qxcd;
		protected System.Web.UI.WebControls.Button save;
	
		private void Page_Load(object sender, System.EventArgs e)
		{
			if (!this.Page.IsPostBack)
			{
				this.parentid.Text = this.Request.QueryString["id"];
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
			if (this.id.Text.Trim () == "")
			{
				utils.Alert (this,"编号不能为空");
				return;
			}
			if (this.des.Text.Trim () == "")
			{
				utils.Alert (this,"描述不能为空");
				return;
			}
			if (this.rank.Text.Trim () == "")
			{
				utils.Alert (this,"级别不能为空");
				return;
			}
			dboper oper = new dboper ();
			if (oper.IsExists ("select 1 from cnc_qxcdb where id=" + this.id.Text))
			{
				utils.Alert (this,"编号重复");
				oper.shutdown ();
				return;
			}
			string cmd = "insert into cnc_qxcdb (id,des,parentid,qxcd,rank,imgpath) values(" + this.id.Text + 
				",'" + this.des.Text.Trim () + "'," + this.parentid.Text + ",'" + this.qxcd.Text.Trim () + "'," + this.rank.Text.Trim () + ",'" + this.imgpath.Text.Trim () + "')";
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
