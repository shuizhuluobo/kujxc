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
	/// gq_change 的摘要说明。
	/// </summary>
	public class gq_change : jxc.UsrControl.UserPage
	{
		protected System.Web.UI.WebControls.TextBox id;
		protected System.Web.UI.WebControls.TextBox title;
		protected System.Web.UI.WebControls.TextBox content;
		protected System.Web.UI.WebControls.TextBox fbsj;
		protected System.Web.UI.WebControls.RadioButtonList RadioButtonList1;
		protected System.Web.UI.WebControls.Button save;
	
		private void Page_Load(object sender, System.EventArgs e)
		{
			if (!this.Page.IsPostBack)
			{
				string id = this.Request.QueryString["id"];
				string cmd = "select title,content,addtime,pass from ytsdinfo where id=" + id;
				SqlDataReader dr = DBBase.ExecuteSqlReader (cmd);
				if (dr.Read ())
				{
					this.id.Text = id;
					this.title.Text = dr["title"].ToString ();
					this.content.Text = dr["content"].ToString ();
					this.fbsj.Text = dr["addtime"].ToString ();
					for (int i=0;i<this.RadioButtonList1.Items.Count;i++)
					{
						if (this.RadioButtonList1.Items[i].Value == dr["pass"].ToString ())
						{
							this.RadioButtonList1.SelectedIndex = i;
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
			string cmd = "update ytsdinfo set pass=" + this.RadioButtonList1.SelectedItem.Value + " where id=" + this.id.Text.Trim ();
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
