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
	/// Menu_Reset 的摘要说明。
	/// </summary>
	public class Menu_Reset : jxc.UsrControl.UserPage
	{
		private void Page_Load(object sender, System.EventArgs e)
		{
			if (!this.Page.IsPostBack)
			{
				 Reset ();
			}
		}

		private void Reset ()
		{
			dboper oper = new dboper ();

			SqlParameter[] prams = {};
			try
			{
				oper.RunProc("p_menu_reset",prams);
				this.Response.Write("重置管理员菜单成功");
			}
			catch(Exception ee)
			{
				this.Response.Write("重置管理员菜单失败" + ee.Message);
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
			this.Load += new System.EventHandler(this.Page_Load);
		}
		#endregion
	}
}
