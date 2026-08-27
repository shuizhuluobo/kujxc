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
	/// product_add 的摘要说明。
	/// </summary>
	public class product_del : jxc.UsrControl.UserPage
	{
		protected System.Web.UI.WebControls.TextBox cpid;
		protected System.Web.UI.WebControls.Button save;
	
		private void Page_Load(object sender, System.EventArgs e)
		{
			if (!this.Page.IsPostBack)
			{

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

				//string cpid = utils.Getbm("cpid","产品信息",string.Format("{0:yyyyMM}",DateTime.Now),3);
			  string cmd = "delete 入库单 where cpid='"+this.cpid.Text+"'";
				try
				{
					DBBase.ExecuteSql (cmd);
					utils.Alert (this,"保存成功");
					JSUtil.Close(this);
				}
				catch
				{
					utils.Alert (this,"保存失败");
				}
			
		}
	}
}
