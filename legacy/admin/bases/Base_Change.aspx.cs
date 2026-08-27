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
	/// Base_Change 的摘要说明。
	/// </summary>
	public class Base_Change : jxc.UsrControl.UserPage
	{
		protected System.Web.UI.WebControls.TextBox listid;
		protected System.Web.UI.WebControls.TextBox sortid;
		protected System.Web.UI.WebControls.TextBox listname;
		protected System.Web.UI.WebControls.DropDownList DropDownList1;
		protected System.Web.UI.WebControls.Button save;
	
		private void Page_Load(object sender, System.EventArgs e)
		{
			if (!this.Page.IsPostBack)
			{
				string cmd = "select * from rs_corsub where listid='" + this.Request.QueryString["id"] + "'";
				SqlDataReader dr = DBBase.ExecuteSqlReader (cmd);
				if (dr.Read ())
				{
					this.listid.Text = dr["listid"].ToString ();
					this.listname.Text = dr["listname"].ToString ();
					this.sortid.Text = dr["sortid"].ToString ();

					for (int i=0;i<this.DropDownList1.Items.Count;i++)
					{
						if (this.DropDownList1.Items[i].Value == dr["ynstop"].ToString ())
						{
							this.DropDownList1.SelectedIndex = i;
							break;
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
			this.save.Click += new System.EventHandler(this.save_Click);
			this.Load += new System.EventHandler(this.Page_Load);

		}
		#endregion

		private void save_Click(object sender, System.EventArgs e)
		{
			string cmd = "update rs_corsub set listname='" + this.listname.Text.Trim () + "', ynstop=" + this.DropDownList1.SelectedItem.Value + " where listid='" + this.Request.QueryString["id"].ToString () + "'";
			
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
