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
	/// kccx_query 的摘要说明。
	/// </summary>
	public class kccx_query : System.Web.UI.Page
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
		protected System.Web.UI.WebControls.DropDownList Dropdownlist2;
		protected System.Web.UI.WebControls.TextBox Textbox6;
		protected System.Web.UI.WebControls.DropDownList Dropdownlist3;
		protected System.Web.UI.WebControls.CheckBox CheckBox1;
		utils u = new utils ();
		private void Page_Load(object sender, System.EventArgs e)
		{

			u.SetGridStyle2(this.Datagrid1);
//			DgNavigation1.SetTarget(Datagrid1,null,new BindDataDelegate(BindData));//BindData是你的数据邦定事件
//			DgNavigation1.SetStyle(20, false);//10表示每页分10行，true表示无分页时自动隐藏
			if (!this.Page.IsPostBack)
			{
				utils.BindDropDownList("select jgmc,jgmc from cnc_jgglb where parent1='01'",this.DropDownList1);
                utils.BindDropDownList("select listname,listname from 产品类别 where orderid=0",this.Dropdownlist3);
				
				BindData ();
			}
		}
		private void BindData ()
		{
			string cmd = "SELECT [产品名称], [仓库名称],店名,产品类别,型号,cpid, sum(剩余数量-供退+客退) as 库存数量 FROM [入库单] where 单据标志='正常' and 1=1 ";
			if (CheckBox1.Checked)
                cmd+=" and (剩余数量-供退+客退)>0";
			if (DropDownList1.SelectedIndex!=0)
               cmd+=" and 仓库名称='"+this.DropDownList1.SelectedValue+"'";
			if (rkrq.Text!="")
				cmd+=" and (产品名称 like '%"+rkrq.Text+"%' or cpid like '%"+rkrq.Text+"%')";
			if (Textbox5.Text!="")
				cmd+=" and 店名 like '%"+Textbox5.Text+"%'";
			if (Dropdownlist3.SelectedIndex!=0)
				cmd+=" and 产品类别 = '"+Dropdownlist3.SelectedValue+"'";
			cmd+=" group by 仓库名称,店名,产品类别,型号,cpid,[产品名称] order by 产品类别,型号,产品名称,库存数量 ";
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
			this.Load += new System.EventHandler(this.Page_Load);

		}
		#endregion

		private void query_Click(object sender, System.EventArgs e)
		{
			BindData ();
		}

		private void Datagrid1_ItemDataBound(object sender, System.Web.UI.WebControls.DataGridItemEventArgs e)
		{
			if (e.Item.ItemType == ListItemType.Item || e.Item.ItemType == ListItemType.AlternatingItem)
				　
			{
				//CalcTotal(e.Item.Cells[6].Text);
　　          // e.Item.Cells[6].Text = string.Format("{0:F2}", Convert.ToDouble(e.Item.Cells[6].Text));
				runningTotal=runningTotal+Convert.ToDouble(e.Item.Cells[6].Text);
				//runningTotal1=runningTotal1+Convert.ToDouble(e.Item.Cells[8].Text);

			}
			else
				if(e.Item.ItemType == ListItemType.Footer )
			{
　　           e.Item.Cells[1].Text="合计:";
　　           e.Item.Cells[6].Text = string.Format("{0:F2}", runningTotal);
//
//			   string cmd="select  sum([剩余数量]) as 库存数量 FROM [入库单] where 1=1 ";
//				if (DropDownList1.SelectedIndex!=0)
//					cmd+=" and 仓库名称='"+this.DropDownList1.SelectedValue+"'";
//				if (rkrq.Text!="")
//					cmd+=" and 产品名称 like '%"+rkrq.Text+"%'";
//				if (Textbox5.Text!="")
//					cmd+=" and 店名 like '%"+Textbox5.Text+"%'";
//				SqlDataReader dr = DBBase.ExecuteSqlReader (cmd+"");
//				if (dr.Read ())
//				{
//					e.Item.Cells[4].Text="总数量:";
//					e.Item.Cells[5].Text=dr["库存数量"].ToString();
//				}
//				dr.Close();
			//	e.Item.Cells[8].Text = string.Format("{0:F2}", runningTotal1);
			}

		}

		private void Button1_Click(object sender, System.EventArgs e)
		{
			string id = utils.FindFirstCheckedItem(this.Datagrid1);
			u.OpenIEWindowRight(this,"kccx_edit.aspx?id="+id,800,500);
		}
	}
}
