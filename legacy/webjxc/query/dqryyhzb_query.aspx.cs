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
using jxc.ascx;

namespace jxc.webjxc.query
{
	/// <summary>
	/// dqryyhzb_query 的摘要说明。
	/// </summary>
	public class dqryyhzb_query :jxc.UsrControl.UserPage//System.Web.UI.Page//  
	{
		protected System.Web.UI.WebControls.Button query;
		protected System.Web.UI.WebControls.TextBox dqmc;
		protected System.Web.UI.WebControls.DataGrid Datagrid1;
	
		protected dgNavigation DgNavigation1;
		protected System.Web.UI.WebControls.TextBox Textbox1;
		protected System.Web.UI.WebControls.CheckBox CheckBox1;
		protected System.Web.UI.WebControls.Label Label1;
		utils u = new utils ();
		private void Page_Load(object sender, System.EventArgs e)
		{
			u.SetGridStyle(this.Datagrid1);
			DgNavigation1.SetTarget(Datagrid1,null,new BindDataDelegate(BindData));//BindData是你的数据邦定事件
			DgNavigation1.SetStyle(20, false);//10表示每页分10行，true表示无分页时自动隐藏
			if (!this.Page.IsPostBack)
			{
				BindData ();
			}
		}
		private void BindData ()
		{
			this.Label1.Text="";
			string cmd = "";
			string cmd1="";
			string cmd2="";
			if (this.CheckBox1.Checked)
			{
               cmd2=" and 日期1 ='"+this.Textbox1.Text.ToString()+"'";
			}
			if (this.groupname.ToString()!="0")
			{
				cmd1+=" and 地区='"+this.zjgmc.ToString()+"'";
			}
			if (this.dqmc.Text == string.Empty)
				cmd = "select 地区,总金额,销售成本,日期1,(总金额-销售成本) as 毛利润,(case 总金额 when 0 then '--' else rtrim(str((总金额-销售成本)/总金额*100)) + '%' end) as 毛利率 from (SELECT 地区,日期1,sum([总金额]) as 总金额, sum(销售成本) as 销售成本 FROM [地区财务] where 1=1 "+cmd2+cmd1+" group by 地区,日期1) a";
			else
				cmd = "select 地区,总金额,销售成本,日期1,(总金额-销售成本) as 毛利润,(case 总金额 when 0 then '--' else rtrim(str((总金额-销售成本)/总金额*100)) + '%' end) as 毛利率 from (SELECT 地区,日期1,sum([总金额]) as 总金额, sum(销售成本) as 销售成本 FROM [地区财务]  where 地区 like '%" + this.dqmc.Text.Trim () + "%'"+cmd2+cmd1+" group by 地区,日期1) a";
				

			DataSet ds = DBBase.ExecuteSql4Ds (cmd+" order by 日期1 desc","dbd");
			this.Datagrid1.DataSource = ds.Tables[0].DefaultView;
			this.Datagrid1.DataBind ();

			if (this.dqmc.Text == string.Empty)
				cmd = "select sum(总金额) as 总金额,sum(销售成本) as 销售成本,sum(总金额-销售成本) as 毛利润 from [地区财务] where 1=1 "+cmd2+cmd1;
			else
				cmd = "select sum(总金额) as 总金额,sum(销售成本) as 销售成本,sum(总金额-销售成本) as 毛利润 from [地区财务]  where 地区 like '%" + this.dqmc.Text.Trim () + "%'"+cmd2+cmd1;
			SqlDataReader dr = DBBase.ExecuteSqlReader (cmd);
			if (dr.Read ())
			{
				if (dr["总金额"].ToString()!="")
				{
					this.Label1.Text="累计 总金额:"+dr["总金额"].ToString()+" 销售成本:"+dr["销售成本"].ToString()+" 毛利润:"+dr["毛利润"].ToString();
				}
			}
			dr.Close();
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
					e.Item.Cells[5].ForeColor=System.Drawing.Color.Red;
				}
			}
		}
	}
}
