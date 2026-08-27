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

namespace jxc.admin.bases
{
	/// <summary>
	/// page_button_add 的摘要说明。
	/// </summary>
	public class page_button_add : System.Web.UI.Page
	{
		protected System.Web.UI.WebControls.DropDownList Dropdownlist1;
		protected System.Web.UI.WebControls.TextBox ids;
		protected System.Web.UI.WebControls.TextBox idname;
		protected System.Web.UI.WebControls.Button save;
		protected System.Web.UI.WebControls.DropDownList DropDownList1;
		protected System.Web.UI.WebControls.DropDownList gn;
	
		private void Page_Load(object sender, System.EventArgs e)
		{
			if(!this.Page.IsPostBack)
			{
				utils.BindDropDownList ("select id,des from cnc_qxcdb where rank=0",this.Dropdownlist1);
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
			this.DropDownList1.SelectedIndexChanged += new System.EventHandler(this.Dropdownlist1_SelectedIndexChanged);
			this.save.Click += new System.EventHandler(this.save_Click);
			this.Load += new System.EventHandler(this.Page_Load);

		}
		#endregion

		private void Dropdownlist1_SelectedIndexChanged(object sender, System.EventArgs e)
		{
			utils.BindDropDownList ("select id,des from cnc_qxcdb where rank!=0 and parentid=" + this.Dropdownlist1.SelectedItem.Value,this.gn);
		
		}

		private void save_Click(object sender, System.EventArgs e)
		{
			if (this.Dropdownlist1.SelectedIndex>0)
			{
				if (this.gn.SelectedIndex==0)
					utils.Alert (this,"请选择功能名称");
			}
			else
			{
				utils.Alert (this,"请选择功能名称");
			}

			if (DBBase.IsValuesExists ("select 1 from cnc_qxcdb_child where pageid=" + this.gn.SelectedItem.Value + " and ids='" + this.ids.Text.Trim () + "'"))
			{
				utils.Alert (this,"该按钮已设置");
				return;
			}

			string cmd = "insert into cnc_qxcdb_child(pageid,ids,idname)values(" + this.gn.SelectedItem.Value + ",'" + this.ids.Text.Trim () + "','" + this.idname.Text.Trim () + "')";
			DBBase.ExecuteSql (cmd);
			utils.Alert (this,"保存成功");
		}
	}
}
