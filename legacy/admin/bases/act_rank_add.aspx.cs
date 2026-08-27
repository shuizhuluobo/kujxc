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
	/// act_rank_add 的摘要说明。
	/// </summary>
	public class act_rank_add : System.Web.UI.Page
	{
		protected System.Web.UI.WebControls.TextBox nofee;
		protected System.Web.UI.WebControls.TextBox count;
		protected System.Web.UI.WebControls.TextBox feeone;
		protected System.Web.UI.WebControls.Button save;
		protected System.Web.UI.WebControls.DropDownList DropDownList1;
		protected System.Web.UI.WebControls.DropDownList Dropdownlist3;
		protected System.Web.UI.WebControls.DropDownList DropDownList2;
	
		private void Page_Load(object sender, System.EventArgs e)
		{
			if (!this.Page.IsPostBack)
			{
				utils.BindDropDownList ("select id,name from cnc_act",this.Dropdownlist3);
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
			this.DropDownList1.SelectedIndexChanged += new System.EventHandler(this.DropDownList1_SelectedIndexChanged);
			this.save.Click += new System.EventHandler(this.save_Click);
			this.Load += new System.EventHandler(this.Page_Load);

		}
		#endregion

		private void DropDownList1_SelectedIndexChanged(object sender, System.EventArgs e)
		{
			string cmd = "";
			if (this.DropDownList1.SelectedIndex>0)
			{
				if (this.DropDownList1.SelectedItem.Value == "0")  //个人网员
					cmd = "select listid,listname from rs_corsub where sortid=1";
				else
					cmd = "select listid,listname from rs_corsub where sortid=2";
				utils.BindDropDownList (cmd,this.DropDownList2);
			}
			
		}

		private void save_Click(object sender, System.EventArgs e)
		{
			if (this.DropDownList1.SelectedIndex==0)
			{
				utils.Alert (this,"请选择网员类型");
				return;
			}
			if (this.DropDownList2.SelectedIndex == 0)
			{
				utils.Alert (this,"请选择网员级别");
				return;
			}
			if (this.Dropdownlist3.SelectedIndex == 0)
			{
				utils.Alert (this,"请选择栏目");
				return;
			}
			Common cn = new Common ();
			if (this.nofee.Text.Trim ()  == "")
			{
				utils.Alert (this,"请输入免费条数");
				return;
			}
			else
			{
				if (!cn.IsNum(this.nofee.Text.Trim ()))
				{
					utils.Alert (this,"免费条数请输入数字");
					return;
				}
			}
			if (this.count.Text.Trim () == "")
			{
				utils.Alert (this,"请输入查询条数");
				return;
			}
			else
			{
				if (!cn.IsNum(this.count.Text.Trim ()))
				{
					utils.Alert (this,"查询条数请输入数字");
					return;
				}
			}
			if (this.feeone.Text.Trim () == "")
			{
				utils.Alert (this,"请输入每条费用");
				return;
			}
			else
			{
				if (!cn.IsNumAndDot(this.nofee.Text.Trim ()))
				{
					utils.Alert (this,"每条费用请输入数字");
					return;
				}
			}
			string cmd = "insert into act_rank_set (rankid,actid,memtype,nofee,count,feeone)values('"
				+ this.DropDownList2.SelectedItem.Value + "'," + this.Dropdownlist3.SelectedItem.Value 
				+ "," + this.DropDownList1.SelectedItem.Value
				+ "," + this.nofee.Text.Trim ()
				+ "," + this.count.Text.Trim ()
				+ "," + this.feeone.Text.Trim () + ")";
			try
			{
				DBBase.ExecuteSql (cmd);
				utils.Alert (this,"保存成功");
			}
			catch
			{
				utils.Alert (this,"保存失败，请与管理员联系");
				return;
			}
		}
	}
}
