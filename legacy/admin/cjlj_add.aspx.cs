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
	/// cjlj_add 的摘要说明。
	/// </summary>
	public class cjlj_add : System.Web.UI.Page
	{
		protected System.Web.UI.WebControls.TextBox xsmc;
		protected System.Web.UI.WebControls.TextBox ljdz;
		protected System.Web.UI.WebControls.Button Button2;
		utils u = new utils ();
		private void Page_Load(object sender, System.EventArgs e)
		{
			/*
			if (!this.Page.IsPostBack)
			{
				string cmd = "select max(linkid) from index_link";
				dboper oper = new dboper();
				SqlDataReader dr = oper.GetData (cmd);
				string id =  "";
				if (dr.HasRows)
				{
					if (dr.Read ())
					{
						if (!dr.IsDBNull(0))
							id = (dr.GetDecimal(0) + 1).ToString ();
						else
							id = "1";
					}
				}
				else
					id = "1";
				this.bh.Text = id;
				dr.Close ();
				oper.shutdown ();
				oper.Dispose ();
			}
			*/
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
				if (this.xsmc.Text == "")
				{
					utils.Alert (this,"显示名称不能为空！");
					return;
				}
				if (this.ljdz.Text == "")
				{
					utils.Alert (this,"链接地址不能为空！");
					return;
				}

				string cmd = "insert into index_link (xsmc,ljdz) values ('" +   this.xsmc.Text.Trim () + "','" + this.ljdz.Text.Trim () + "')";

				dboper oper = new dboper();
				try
				{
					oper.Exec (cmd);
				}
				catch (Exception ee)
				{
					utils.Alert (this,"填加超级链接失败！" + ee.Message);
					oper.shutdown ();
					oper.Dispose ();
					return;
				}

				utils.Alert (this,"填加超级链接成功！");
				oper.shutdown ();
				oper.Dispose ();
			}
		}
	}
}
