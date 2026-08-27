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
	/// class_change 的摘要说明。
	/// </summary>
	public class class_change : System.Web.UI.Page
	{
		protected System.Web.UI.WebControls.TextBox parentid;
		protected System.Web.UI.WebControls.TextBox ranks;
		protected System.Web.UI.WebControls.TextBox des;
		protected System.Web.UI.WebControls.RadioButtonList ifend;
		protected System.Web.UI.WebControls.RadioButtonList ifsing;
		protected System.Web.UI.WebControls.Button save;
	
		private void Page_Load(object sender, System.EventArgs e)
		{
			if (!this.Page.IsPostBack)
			{
				string cmd = "select * from cnc_info where id=" + this.Request.QueryString["id"];
				SqlDataReader dr = DBBase.ExecuteSqlReader (cmd);
				if (dr.Read ())
				{
					this.parentid.Text = dr["parentid"].ToString ();
					this.ranks.Text = dr["rank"].ToString ();
					this.des.Text = dr["des"].ToString ();
					for (int i=0;i<this.ifend.Items.Count;i++)
					{
						if (this.ifend.Items[i].Value == dr["ifend"].ToString ())
						{
							this.ifend.SelectedIndex = i;
							break;
						}
					}
					for (int i=0;i<this.ifsing.Items.Count;i++)
					{
						if (this.ifend.Items[i].Value == dr["ifsing"].ToString ())
						{
							this.ifsing.SelectedIndex = i;
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
			string cmd = "update cnc_info set des='" + this.des.Text.Trim () +
				"',ifend=" + this.ifend.SelectedItem.Value + ",ifsing=" + this.ifsing.SelectedItem.Value + " where id=" + this.Request.QueryString["id"];
			try
			{
				DBBase.ExecuteSql (cmd);
				utils.Alert (this,"修改成功");
			}
			catch
			{
				utils.Alert (this,"修改失败");
			}
		}
	}
}
