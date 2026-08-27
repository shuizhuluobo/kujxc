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
using   MSScriptControl; 
namespace jxc.admin.bases
{
	/// <summary>
	/// dqzz_add 的摘要说明。
	/// </summary>
	public class dqzz_edit :jxc.UsrControl.UserPage//System.Web.UI.Page// 
	{
		protected System.Web.UI.WebControls.DropDownList DropDownListlx;
		protected System.Web.UI.WebControls.TextBox czy;
		protected System.Web.UI.WebControls.TextBox Textbox2;
		protected System.Web.UI.WebControls.TextBox Textbox4;
		protected System.Web.UI.WebControls.TextBox Textbox5;
		protected System.Web.UI.WebControls.TextBox Textbox1;
		protected System.Web.UI.WebControls.TextBox Textbox3;
		protected System.Web.UI.WebControls.TextBox Textbox6;
		protected System.Web.UI.WebControls.TextBox zhaiyao;
		protected System.Web.UI.WebControls.DropDownList DropDownList1;
		protected System.Web.UI.WebControls.DropDownList Dropdownlist2;
		protected System.Web.UI.WebControls.Button save;
	
		private void Page_Load(object sender, System.EventArgs e)
		{
			//CodeSearch();
			if (!this.Page.IsPostBack)
			{
				Textbox1.Text=string.Format("{0:yyyy-MM-dd}",DateTime.Now);
				this.Textbox2.Text=this.zjgmc.ToString();
				utils.BindDropDownList("select jgmc,jgmc from cnc_jgglb where parent1='01'",this.Dropdownlist2);

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
			this.Dropdownlist2.SelectedIndexChanged += new System.EventHandler(this.Dropdownlist2_SelectedIndexChanged);
			this.ID = "dqzz_edit";
			this.Load += new System.EventHandler(this.Page_Load);
			this.PreRender += new System.EventHandler(this.dqzz_edit_PreRender);

		}
		#endregion

		private void save_Click(object sender, System.EventArgs e)
		{
		    string id=System.Guid.NewGuid().ToString();
			string cmd="insert into 地区总账(zzid,日期,地区,摘要,借方,贷方,余额,其他,分类)values('";
			cmd+=id+"','"+Textbox1.Text.ToString()+"','"+this.Textbox2.Text.ToString()+"','"+zhaiyao.Text.ToString()+"',"+Textbox4.Text.ToString();
			cmd+=","+Textbox3.Text+","+Textbox6.Text+",'"+Textbox5.Text+"','"+this.DropDownList1.SelectedValue.ToString()+"')";

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
		private void dqzz_edit_PreRender(object sender, System.EventArgs e)
		{
			this.RegisterHiddenField("HiddenCommon",Request["HiddenCommon"]);
		}

		private void Dropdownlist2_SelectedIndexChanged(object sender, System.EventArgs e)
		{
			this.Textbox2.Text=this.Dropdownlist2.SelectedValue.ToString();
		}

	}
	
}
