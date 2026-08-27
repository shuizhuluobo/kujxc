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
	/// zxdy_add 的摘要说明。
	/// </summary>
	public class zxdy_add : jxc.UsrControl.UserPage
	{
		protected System.Web.UI.WebControls.Label twxm;
		protected System.Web.UI.WebControls.Label yb;
		protected System.Web.UI.WebControls.Label lldh;
		protected System.Web.UI.WebControls.Label email;
		protected System.Web.UI.WebControls.Label txdz;
		protected System.Web.UI.WebControls.Label twbt;
		protected System.Web.UI.WebControls.TextBox hfsj;
		protected System.Web.UI.WebControls.Button save;
		protected System.Web.UI.WebControls.TextBox hfnr;
		protected System.Web.UI.WebControls.TextBox hfr;
		protected System.Web.UI.WebControls.Label fbsj;
		protected System.Web.UI.WebControls.TextBox tenr;

		utils u = new utils ();
		private void Page_Load(object sender, System.EventArgs e)
		{
			if (!this.Page.IsPostBack)
			{
			//	this.name.Text = this.Request.QueryString["name"];
				string cmd = "select twxm,yb,lldh,email,txdz,twbt,fasj,hfr,hfsj,hfnr,twnr from index_zxdy where zxdyid=" + this.Request.QueryString["id2"];
				SqlDataReader dr = DBBase.ExecuteSqlReader (cmd);
				if (dr.Read ())
				{
					if (!dr.IsDBNull (0))
						this.twxm.Text = dr.GetString (0);

					if (!dr.IsDBNull (1))
						this.yb.Text = dr.GetString (1);
					if (!dr.IsDBNull (2))
						this.lldh.Text = dr.GetString (2);
					if (!dr.IsDBNull (3))
						this.email.Text = dr.GetString (3);
					if (!dr.IsDBNull (4))
						this.txdz.Text = dr.GetString (4);
					if (!dr.IsDBNull (5))
						this.twbt.Text = dr.GetString (5);
					if (!dr.IsDBNull (6))
						this.fbsj.Text = dr.GetDateTime(6).ToString ("yyyy-MM-dd");
					if (!dr.IsDBNull (7))
						this.hfr.Text = dr.GetString (7);
					if (!dr.IsDBNull (8))
						this.hfsj.Text = dr.GetDateTime (8).ToString ("yyyy-MM-dd");
					if (!dr.IsDBNull (9))
						this.hfnr.Text = dr.GetString (9);
					if (!dr.IsDBNull (10))
						this.tenr.Text = dr.GetString (10).ToString ();
				}
				dr.Close ();
				this.hfsj.Text = System.DateTime.Now.ToString ("yyyy-MM-dd");
				this.hfr.Text = this.glyname;
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
			if (this.Page.IsPostBack)
			{
				if (this.hfr.Text.Trim () == "")
				{
					utils.Alert (this,"回复人不能为空!");
					return;
				}
				if (this.hfsj.Text.Trim () == "")
				{
					utils.Alert (this,"回复时间不能为空!");
					return;
				}
				if (this.hfnr.Text.Trim () == "")
				{
					utils.Alert (this,"回复内容不能为空!");
					return;
				}
				string cmd = "update index_zxdy set hfr='" + this.hfr.Text.Trim () + "',hfsj='" + this.hfsj.Text.Trim() + "',hfnr='" + this.hfnr.Text.Trim () + "',sfhf='是' where zxdyid=" + this.Request.QueryString["id2"];
				
				DBBase.ExecuteSql (cmd);
				utils.Alert (this,"回复成功!");
			}
		}
	}
}
