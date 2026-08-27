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
	/// dqcn_add 的摘要说明。
	/// </summary>
	public class dqcn_edit :jxc.UsrControl.UserPage//System.Web.UI.Page// 
	{
		protected System.Web.UI.WebControls.DropDownList DropDownListlx;
		protected System.Web.UI.WebControls.TextBox czy;
		protected System.Web.UI.WebControls.TextBox Textbox2;
		protected System.Web.UI.WebControls.TextBox Textbox4;
		protected System.Web.UI.WebControls.TextBox Textbox5;
		protected System.Web.UI.WebControls.DropDownList DropDownList1;
		protected System.Web.UI.WebControls.TextBox Textbox1;
		protected System.Web.UI.WebControls.TextBox Textbox3;
		protected System.Web.UI.WebControls.TextBox Textbox6;
		protected System.Web.UI.WebControls.TextBox zhaiyao;
		protected System.Web.UI.WebControls.DropDownList DropDownList2;
		protected System.Web.UI.WebControls.Button save;
	
		private void Page_Load(object sender, System.EventArgs e)
		{
			//CodeSearch();
			if (!this.Page.IsPostBack)
			{
				Textbox1.Text=string.Format("{0:yyyy-MM-dd}",DateTime.Now);
				this.Textbox2.Text=this.zjgmc.ToString();
				
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
			this.DropDownList2.SelectedIndexChanged += new System.EventHandler(this.DropDownList2_SelectedIndexChanged);
			this.save.Click += new System.EventHandler(this.save_Click);
			this.ID = "dqcn_edit";
			this.Load += new System.EventHandler(this.Page_Load);
			this.PreRender += new System.EventHandler(this.dqcn_edit_PreRender);

		}
		#endregion

		private void save_Click(object sender, System.EventArgs e)
		{
				if (DropDownList2.SelectedValue.ToString()=="回款")
			{
				string[] cmd=new string[3];

				string id = utils.Getbm("cnzid","地区出纳",string.Format("{0:yyyyMMdd}",DateTime.Now),4);
				cmd[0]="insert into 地区出纳(cnzid,日期,地区,摘要,借方,贷方,余额,其他)values('";
				cmd[0]+=id+"','"+Textbox1.Text.ToString()+"','"+this.Textbox2.Text.ToString()+"','"+zhaiyao.Text.ToString()+"',"+Textbox4.Text.ToString();
				cmd[0]+=","+Textbox3.Text+","+Textbox6.Text+",'"+Textbox5.Text+"')";
				
			   id = utils.Getbm("kjid","地区会计",string.Format("{0:yyyyMMdd}",DateTime.Now),4);
				cmd[1]="insert into 地区会计(kjid,日期,地区,摘要,借方,贷方,余额,其他)values('";
				cmd[1]+=id+"','"+Textbox1.Text.ToString()+"','"+this.Textbox2.Text.ToString()+"','"+zhaiyao.Text.ToString()+"',"+Textbox4.Text.ToString();
				cmd[1]+=","+Textbox3.Text+","+Textbox6.Text+",'"+Textbox5.Text+"')";
			
		
				//地区总帐的贷方,备注为回款,
				id=System.Guid.NewGuid().ToString();
				cmd[2]="insert into 地区总账(zzid,日期,地区,摘要,借方,贷方,余额,其他,分类)values('";
				cmd[2]+=id+"','"+Textbox1.Text.ToString()+"','"+this.Textbox2.Text.ToString()+"','回款',"+Textbox4.Text.ToString();
				cmd[2]+=","+Textbox3.Text+","+Textbox6.Text+",'"+Textbox5.Text+"','"+this.DropDownList2.SelectedValue.ToString()+"')";
					try
					{
						DBBase.ExecuteSqls (cmd);
						utils.Alert (this,"保存成功");
						JSUtil.Close(this);
					}
					catch
					{
						utils.Alert (this,"保存失败");
					}
			}
			else
			{
				string[] cmd=new string[2];

				string id = utils.Getbm("cnzid","地区出纳",string.Format("{0:yyyyMMdd}",DateTime.Now),4);
				cmd[0]="insert into 地区出纳(cnzid,日期,地区,摘要,借方,贷方,余额,其他)values('";
				cmd[0]+=id+"','"+Textbox1.Text.ToString()+"','"+this.Textbox2.Text.ToString()+"','"+zhaiyao.Text.ToString()+"',"+Textbox4.Text.ToString();
				cmd[0]+=","+Textbox3.Text+","+Textbox6.Text+",'"+Textbox5.Text+"')";


				id = utils.Getbm("kjid","地区会计",string.Format("{0:yyyyMMdd}",DateTime.Now),4);
				cmd[1]="insert into 地区会计(kjid,日期,地区,摘要,借方,贷方,余额,其他)values('";
				cmd[1]+=id+"','"+Textbox1.Text.ToString()+"','"+this.Textbox2.Text.ToString()+"','"+zhaiyao.Text.ToString()+"',"+Textbox4.Text.ToString();
				cmd[1]+=","+Textbox3.Text+","+Textbox6.Text+",'"+Textbox5.Text+"')";
					try
					{
						DBBase.ExecuteSqls (cmd);
						utils.Alert (this,"保存成功");
						JSUtil.Close(this);
					}
					catch
					{
						utils.Alert (this,"保存失败");
					}
			}

			
		}
		private void dqcn_edit_PreRender(object sender, System.EventArgs e)
		{
			this.RegisterHiddenField("HiddenCommon",Request["HiddenCommon"]);
		}

		private void DropDownList2_SelectedIndexChanged(object sender, System.EventArgs e)
		{
			//zhaiyao.Text=this.DropDownList2.SelectedValue.ToString();
		}

	}
	
}
