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

namespace jxc.admin.info
{
	/// <summary>
	/// xwdt_change 的摘要说明。
	/// </summary>
	public class xwdt_change : jxc.UsrControl.UserPage
	{
		protected System.Web.UI.WebControls.TextBox title;
		protected System.Web.UI.WebControls.TextBox inputdate;
		protected System.Web.UI.WebControls.DropDownList DropDownListsfgk;
		protected System.Web.UI.WebControls.TextBox sBody;
		protected System.Web.UI.WebControls.Label hidlabel;
		protected System.Web.UI.WebControls.Button Button2;
		protected System.Web.UI.WebControls.DropDownList DropDownList1;
		protected System.Web.UI.WebControls.DropDownList lbbh;
		protected System.Web.UI.WebControls.TextBox zz;
		protected System.Web.UI.WebControls.TextBox writer;
	
		protected FreeTextBoxControls.FreeTextBox FreeTextBox1;

		private void Page_Load(object sender, System.EventArgs e)
		{
			if (!this.Page.IsPostBack)
			{
				string cmd = "select * from t_master2 where bh = " + this.Request.QueryString["bh"];
				SqlDataReader dr = DBBase.ExecuteSqlReader(cmd);
				if (dr.Read ())
				{
					this.title.Text = dr["bt"].ToString ();
					this.inputdate.Text = dr["fbsj"].ToString ();
					this.FreeTextBox1.Text = dr["nr"].ToString ();
					this.zz.Text = dr["zz"].ToString ();
					this.writer.Text = dr["writer"].ToString ();

					if (dr["judgestate"].ToString () == "1") //已审核
					{
						if (this.glydh != System.Configuration.ConfigurationSettings.AppSettings["delczy"])
							this.Button2.Enabled = false;
					}
					else
					{
						if (this.glydh != dr["zz"].ToString ())
						{
							this.Button2.Enabled = false;
						}
					}
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
			if (this.Page.IsPostBack)
			{
				string cmd = "update t_master2 set bt='" + this.title.Text.Trim () + "'," + 
												" zz = '" + this.zz.Text.Trim () + "'," +
						" fbsj='" + this.inputdate.Text.Trim () + "'," + 
						" nr ='" + FreeTextBox1.Text.Replace("'","\"").Replace("\r\n","") + 
						 "',writer='" + this.writer.Text.Trim () + "' where bh = " + this.Request.QueryString["bh"];
						
				try
				{
					DBBase.ExecuteSql (cmd);
					utils.Alert (this,"修改成功！");

				}
				catch (Exception ee)
				{
					utils.Alert (this,"修改失败！" + ee.Message);
					return;
				}

			}	
		}
	}
}
