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
using System.IO;
using System.Web.Security;
namespace jxc.admin
{
	/// <summary>
	/// gly_add 的摘要说明。
	/// </summary>
	public class gly_add : jxc.UsrControl.UserPage
	{
		protected System.Web.UI.WebControls.TextBox pwd1;
		protected System.Web.UI.WebControls.Button add;
		protected System.Web.UI.WebControls.TextBox tglydh;
		protected System.Web.UI.WebControls.TextBox tglyname;
		protected System.Web.UI.WebControls.DropDownList Dropdownlist2;
		protected System.Web.UI.WebControls.TextBox ssjg;
		protected System.Web.UI.HtmlControls.HtmlInputHidden hidjg;
		protected System.Web.UI.WebControls.DropDownList ranks;
		protected System.Web.UI.WebControls.DropDownList rank;
		protected System.Web.UI.WebControls.TextBox pwd2;
	
		private void Page_Load(object sender, System.EventArgs e)
		{
			if (!this.Page.IsPostBack)
			{
				utils.BindDropDownList ("select groupid,des from cnc_qxgroup",this.rank);
				utils.BindDropDownList ("select listid,listname from rs_corsub where sortid=6 order by orderid asc",this.Dropdownlist2);
				//utils.BindDropDownList ("select 
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
			this.add.Click += new System.EventHandler(this.add_Click);
			this.Load += new System.EventHandler(this.Page_Load);

		}
		#endregion

		private void add_Click(object sender, System.EventArgs e)
		{
			if(this.Page.IsPostBack)
			{
				if (this.tglydh.Text.Trim () == "")
				{
					utils.Alert (this,"操作员代号不能空！");
					return;
				}
				if (this.tglyname.Text.Trim () == "")
				{
					utils.Alert (this,"操作员姓名不能空！");
					return;
				}
					
				if (this.pwd1.Text.Trim () != pwd2.Text.Trim ())
				{
					utils.Alert (this,"两次口令不一致！");
					return;
				}
				if (DBBase.IsValuesExists ("select 1 from cnc_glyb where glydh='"+ this.tglydh.Text.Trim () +"'"))
				{
					utils.Alert (this,"该操作员已经存在！");
					return;
				}
			
				if (this.Dropdownlist2.SelectedIndex <= 0)
				{
					utils.Alert (this,"请选择用户职务");
					return;
				}
				try
				{
					string cmd = "insert into cnc_glyb (glydh,glymm,jgbh,groupid,glyname,ifuse,rank) values('" + this.tglydh.Text.Trim () + "','" + this.pwd1.Text.Trim () + "','"  + this.Request.QueryString["jgbh"] + "',"+this.rank.SelectedValue.ToString()+",'" + this.tglyname.Text.Trim () + "',1,'" + this.Dropdownlist2.SelectedItem.Value + "')";
					DBBase.ExecuteSqlReader(cmd);

					utils.Alert (this,"增加操作员成功！");
				}
				catch (Exception ee)
				{
					utils.Alert (this,"增加操作员失败！" + ee.Message);
					return;
				}
			}
		}
	}
}
