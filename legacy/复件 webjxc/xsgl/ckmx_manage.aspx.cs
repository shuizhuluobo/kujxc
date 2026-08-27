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

namespace jxc.admin.bases
{
	/// <summary>
	/// ckmx_manage 的摘要说明。
	/// </summary>
	public class ckmx_manage :jxc.UsrControl.UserPage//System.Web.UI.Page//  
	{
		protected System.Web.UI.WebControls.DataGrid Datagrid1;
		protected System.Web.UI.WebControls.Button change;
		protected System.Web.UI.WebControls.Button delete;
		protected System.Web.UI.WebControls.Button add;
		protected System.Web.UI.WebControls.Button query;
		protected System.Web.UI.WebControls.TextBox cpname;

		protected dgNavigation DgNavigation1;
		protected System.Web.UI.WebControls.DropDownList DropDownListlx;
		protected System.Web.UI.WebControls.TextBox Textbox2;
		protected System.Web.UI.WebControls.TextBox Textbox1;
		protected System.Web.UI.WebControls.CheckBox CheckBox1;
	
		utils u = new utils ();

		private void Page_Load(object sender, System.EventArgs e)
		{
			u.SetGridStyle(this.Datagrid1);
		
			DgNavigation1.SetTarget(Datagrid1,null,new BindDataDelegate(BindData));//BindData是你的数据邦定事件
			DgNavigation1.SetStyle(20, false);//10表示每页分10行，true表示无分页时自动隐藏
			if (!this.Page.IsPostBack)
			{
                this.Textbox2.Text=string.Format("{0:yyyy-MM-dd}",DateTime.Now.AddDays(1));
				this.Textbox1.Text=string.Format("{0:yyyy-MM-dd}",DateTime.Now);
				utils.BindDropDownList("select jgmc,jgmc from cnc_jgglb where parent1='01'",this.DropDownListlx);
				BindData ();
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
			this.query.Click += new System.EventHandler(this.query_Click);
			this.Datagrid1.ItemDataBound += new System.Web.UI.WebControls.DataGridItemEventHandler(this.Datagrid1_ItemDataBound);
			this.Load += new System.EventHandler(this.Page_Load);

		}
		#endregion

		private void BindData ()
		{
			//string cmd = "select * from 地区销售统计,销售总量 where 地区销售统计.产品名称*=销售总量.产品名称 ";
			string cmd="select* from (SELECT 地区, 产品名称, SUM(销售数量) AS 销售量 FROM (SELECT a.[产品名称], a.[销售数量], b.店名, b.地区  FROM [销售单明细] AS a, [销售单] AS b WHERE a.xsid = b.xsid";
			string cmd1="";

			if (this.cpname.Text != string.Empty)
				cmd1 += " and a.产品名称 like '%" + this.cpname.Text.Trim () + "%'";
             if (DropDownListlx.SelectedIndex!=0)
				 cmd1 +=" and b.地区 ='"+this.DropDownListlx.SelectedItem.ToString()+"'";
            if (this.CheckBox1.Checked)
				cmd1+=" and b.销售日期 between '"+this.Textbox1.Text+"' and '"+this.Textbox2.Text+"'";  
			
			cmd+=cmd1+") yy GROUP BY 地区, 产品名称)as z1,(SELECT 产品名称, SUM(销售数量) AS 汇总数 FROM (SELECT a.[产品名称], a.[销售数量], b.店名, b.地区 FROM [销售单明细] AS a, [销售单] AS b  WHERE a.xsid = b.xsid";
			cmd+=cmd1+") yy GROUP BY 产品名称) as z2 where z1.产品名称*=z2.产品名称";
//			if (this.groupname.ToString()!="0")
//			{
//				cmd+=" and 经办人='"+this.glyname.ToString()+"'";
//				this.DropDownListlx.Enabled=false;
//			}
			cmd+=" order by 汇总数 desc,销售量 desc ";
			DataSet ds = DBBase.ExecuteSql4Ds (cmd,"ckmx");
			this.Datagrid1.DataSource = ds.Tables["ckmx"].DefaultView;
			this.Datagrid1.DataBind ();
		}

		private void query_Click(object sender, System.EventArgs e)
		{
			BindData ();
		}

		private void add_Click(object sender, System.EventArgs e)
		{
			string id = utils.FindFirstCheckedItem(this.Datagrid1);
			u.OpenIEWindowRight(this,"ckmx_edit.aspx?rkid="+id,750,550);
			
		}

		private void change_Click(object sender, System.EventArgs e)
		{
		string id = utils.FindFirstCheckedItem(this.Datagrid1);
//			u.OpenIEWindowRight(this,"ckmx_edit.aspx?cpid=" + id,500,500);
			string cmd="update 销售单 set 到货确认='是' where xsid='"+id+"'";
			DBBase.ExecuteSql (cmd);
			BindData ();
	    
		}

		private void delete_Click(object sender, System.EventArgs e)
		{
			string id = utils.FindFirstCheckedItem(this.Datagrid1);
			u.OpenIEWindowPrint(this,"xsprint.aspx?id="+id,750,550);
		}

		private void Datagrid1_ItemDataBound(object sender, System.Web.UI.WebControls.DataGridItemEventArgs e)
		{
			for(int i=0;i<Datagrid1.Items.Count-1;i++)
			{   
				int colnum=1;
				int j;
				for( j=i+1;j<Datagrid1.Items.Count;j++)
				{
					if(Datagrid1.Items[i].Cells[1].Text==Datagrid1.Items[j].Cells[1].Text)      
					{
						colnum++;
						Datagrid1.Items[i].Cells[1].RowSpan=colnum;
						Datagrid1.Items[j].Cells[1].Visible=false;     
						Datagrid1.Items[i].Cells[0].RowSpan=colnum;
						Datagrid1.Items[j].Cells[0].Visible=false; 
					}     
					else
						break;
				}
				i=j-1;
			}
		}
	}
}
