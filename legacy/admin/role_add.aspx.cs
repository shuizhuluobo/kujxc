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
	/// role_add 的摘要说明。
	/// </summary>
	public class role_add : System.Web.UI.Page
	{
		protected System.Web.UI.WebControls.TextBox des;
		protected System.Web.UI.WebControls.Button save;
	
		private void Page_Load(object sender, System.EventArgs e)
		{
			// 在此处放置用户代码以初始化页面
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
			if (this.des.Text.Trim () == "")
			{
				utils.Alert (this,"角色描述不能为空");
				return;
			}
			if (DBBase.IsValuesExists("select 1 from cnc_qxgroup where des='" + this.des.Text.Trim () + "'") )
			{
				utils.Alert (this,"该角色已经存在");
				return;
			}
			string cmd = "insert into cnc_qxgroup (des) values('" + this.des.Text.Trim () + "')";
			try
			{
				DBBase.ExecuteSql(cmd);
				utils.Alert (this,"增加角色成功");
			}
			catch
			{
				utils.Alert (this,"增加角色失败，系统已恢复到保存前的状态");
				return;
			}
		}
	}
}
