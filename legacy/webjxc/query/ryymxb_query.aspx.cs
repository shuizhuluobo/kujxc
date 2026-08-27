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
	/// ryymxb_query 的摘要说明。
	/// </summary>
	public class ryymxb_query : jxc.UsrControl.UserPage//System.Web.UI.Page//  
	{
		protected System.Web.UI.WebControls.DropDownList DropDownList1;
		protected System.Web.UI.WebControls.Button query;
		protected System.Web.UI.WebControls.DataGrid Datagrid1;
	
		protected dgNavigation DgNavigation1;
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
			string cmd1="";
			if (this.DropDownList1.SelectedIndex!=0)
				 cmd1=" and 地区='"+this.DropDownList1.SelectedValue.ToString()+"'";
			if (this.groupname.ToString()!="0")
			{
				cmd1+=" and 地区='"+this.zjgmc.ToString()+"'";
				DropDownList1.Enabled=false;
			}
			string cmd = "SELECT [cwid], [店名], [地区], [日期1],[xsid],[总金额], isnull([预收定金],0) as 预收定金, isnull([销售成本],0)+isnull(退货成本,0) as 销售成本, [其他],总金额-(isnull([销售成本],0)+isnull(退货成本,0)) as 毛利润,(case isnull(总金额,0) when 0 then '--' else rtrim(str((总金额-销售成本)/总金额*100)) + '%' end) as 毛利率 FROM [地区财务] where 1=1 ";
			DataSet ds = DBBase.ExecuteSql4Ds (cmd+cmd1+" order by 日期1 desc","dbd");
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
			//  确定是数据行而非页首或页尾
			if (e.Item.ItemType == ListItemType.Item || e.Item.ItemType == ListItemType.AlternatingItem)
			{
				//  取得 manager 字段的值
				string isManager =Convert.ToString(DataBinder.Eval(e.Item.DataItem, "毛利润"));
				if (Convert.ToDouble(isManager)<=0) 
				{
					e.Item.Cells[6].ForeColor=System.Drawing.Color.Red;
				}
			}
		}
	}
}
