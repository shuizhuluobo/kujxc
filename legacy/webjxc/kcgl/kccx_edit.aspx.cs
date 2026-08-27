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
using System.Data.SqlClient;
using jxc.ascx;

namespace jxc.webjxc.query
{
	/// <summary>
	/// kccx_edit 的摘要说明。
	/// </summary>
	public class kccx_edit : System.Web.UI.Page
	{
		protected System.Web.UI.WebControls.DropDownList DropDownList1;
		protected System.Web.UI.WebControls.Button query;
		protected System.Web.UI.WebControls.DataGrid Datagrid1;
	
		protected dgNavigation DgNavigation1;
		protected System.Web.UI.WebControls.TextBox rkrq;
		protected System.Web.UI.WebControls.TextBox Textbox1;
		protected System.Web.UI.WebControls.TextBox Textbox2;
		protected System.Web.UI.WebControls.TextBox Textbox4;
		protected System.Web.UI.WebControls.TextBox Textbox3;
		protected System.Web.UI.WebControls.RadioButton RadioButton1;
		protected System.Web.UI.WebControls.RadioButton RadioButton2;
		protected System.Web.UI.WebControls.RadioButton RadioButton3;
		protected System.Web.UI.WebControls.TextBox Textbox5;
		private double runningTotal = 0;
		protected System.Web.UI.WebControls.Label Label1;
		protected System.Web.UI.WebControls.Button Button1;
		utils u = new utils ();
		private void Page_Load(object sender, System.EventArgs e)
		{

			u.SetGridStyle2(this.Datagrid1);
//			DgNavigation1.SetTarget(Datagrid1,null,new BindDataDelegate(BindData));//BindData是你的数据邦定事件
//			DgNavigation1.SetStyle(20, false);//10表示每页分10行，true表示无分页时自动隐藏
			if (!this.Page.IsPostBack)
			{
				utils.BindDropDownList("select jgmc,jgmc from cnc_jgglb where parent1='01'",this.DropDownList1);
				BindData ();
			}
		}
		private void BindData ()
		{
			string cmd = "SELECT [产品名称], [仓库名称],店名,cpid,进货价,入库数量,供应商,(剩余数量-供退+客退) as 库存数量,入库日期 FROM [入库单] where 1=1 ";
			//(剩余数量-供退+客退)>0
			if (DropDownList1.SelectedIndex!=0)
               cmd+=" and 仓库名称='"+this.DropDownList1.SelectedValue+"'";
			if (rkrq.Text!="")
				cmd+=" and 产品名称 like '%"+rkrq.Text+"%'";
			if (Textbox5.Text!="")
				cmd+=" and 店名 like '%"+Textbox5.Text+"%'";
			if (this.Request.QueryString["id"]!="")
				cmd+=" and cpid ='"+this.Request.QueryString["id"].ToString().Trim()+"'";
			cmd+=" order by 产品名称,入库日期 desc";

			DataSet ds = DBBase.ExecuteSql4Ds (cmd,"kccx");
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
			this.Button1.Click += new System.EventHandler(this.Button1_Click);
			this.Datagrid1.ItemDataBound += new System.Web.UI.WebControls.DataGridItemEventHandler(this.Datagrid1_ItemDataBound);
			this.Datagrid1.SelectedIndexChanged += new System.EventHandler(this.Datagrid1_SelectedIndexChanged);
			this.Load += new System.EventHandler(this.Page_Load);

		}
		#endregion

		private void query_Click(object sender, System.EventArgs e)
		{
			BindData ();
		}

		private void Datagrid1_ItemDataBound(object sender, System.Web.UI.WebControls.DataGridItemEventArgs e)
		{
//			if (e.Item.ItemType == ListItemType.Item || e.Item.ItemType == ListItemType.AlternatingItem)
//				　
//			{
//				//CalcTotal(e.Item.Cells[6].Text);
//　　          // e.Item.Cells[6].Text = string.Format("{0:F2}", Convert.ToDouble(e.Item.Cells[6].Text));
//				runningTotal=runningTotal+Convert.ToDouble(e.Item.Cells[3].Text);
//				//runningTotal1=runningTotal1+Convert.ToDouble(e.Item.Cells[8].Text);
//
//			}
//			else
//				if(e.Item.ItemType == ListItemType.Footer )
//			{
//　　           e.Item.Cells[1].Text="合计:";
//　　           e.Item.Cells[3].Text = string.Format("{0:F2}", runningTotal);
//			}

		}

		private void Button1_Click(object sender, System.EventArgs e)
		{

		}

		private void Datagrid1_SelectedIndexChanged(object sender, System.EventArgs e)
		{
		
		}
	}
}
