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
using jxc.ascx;

namespace jxc.webjxc.query
{
	/// <summary>
	/// btckcx_query 的摘要说明。
	/// </summary>
	public class btckcx_query : jxc.UsrControl.UserPage//System.Web.UI.Page//  
	{
		protected System.Web.UI.WebControls.DropDownList DropDownList1;
		protected System.Web.UI.WebControls.Button query;
		protected System.Web.UI.WebControls.DataGrid Datagrid1;
	
		protected dgNavigation DgNavigation1;
		protected System.Web.UI.WebControls.TextBox rkrq;
		protected System.Web.UI.WebControls.TextBox Textbox3;
		protected System.Web.UI.WebControls.TextBox Textbox4;
		protected System.Web.UI.WebControls.CheckBox CheckBox1;
		protected System.Web.UI.WebControls.CheckBox CheckBox2;
		utils u = new utils ();
		private void Page_Load(object sender, System.EventArgs e)
		{

			u.SetGridStyle(this.Datagrid1);
			DgNavigation1.SetTarget(Datagrid1,null,new BindDataDelegate(BindData));//BindData是你的数据邦定事件
			DgNavigation1.SetStyle(20, false);//10表示每页分10行，true表示无分页时自动隐藏
			if (!this.Page.IsPostBack)
			{
				utils.BindDropDownList("select jgmc,jgmc from cnc_jgglb where parent1='01'",this.DropDownList1);
				BindData ();
			}
		}
		private void BindData ()
		{
			string cmd = "select * from (SELECT [产品名称], [仓库名称],cpid, sum([剩余数量]) as 库存数量 FROM [入库单] where 1=1";
			string cmd1="";
			if (this.groupname.ToString()!="0")
			{
				cmd+=" and 仓库名称='"+this.zjgmc.ToString()+"'";
				DropDownList1.Enabled=false;
			}
			if (DropDownList1.SelectedIndex!=0)
               cmd+=" and 仓库名称='"+this.DropDownList1.SelectedValue+"'";
			if (rkrq.Text!="")
				cmd+=" and 产品名称 like '%"+rkrq.Text+"%'";
			if (this.CheckBox1.Checked)
				cmd1+=" and 库存数量 >="+this.Textbox4.Text.ToString();
			if (this.CheckBox2.Checked)
				cmd1+=" and 库存数量 <="+this.Textbox3.Text.ToString();
			cmd+=" group by 仓库名称,cpid,[产品名称]) as xx where 1=1 "+cmd1+"  order by 库存数量 ";
			DataSet ds = DBBase.ExecuteSql4Ds (cmd,"btckcx");
			this.Datagrid1.DataSource = ds.Tables[0].DefaultView;
			this.Datagrid1.DataBind ();
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
			this.query.Click += new System.EventHandler(this.query_Click);
			this.Load += new System.EventHandler(this.Page_Load);

		}
		#endregion

		private void query_Click(object sender, System.EventArgs e)
		{
			BindData ();
		}
	}
}
