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
	/// spdb_query 的摘要说明。
	/// </summary>
	public class dbddc_query  :jxc.UsrControl.UserPage//System.Web.UI.Page//     
	{
		protected System.Web.UI.WebControls.DropDownList DropDownList1;
		protected System.Web.UI.WebControls.Button query;
		protected System.Web.UI.WebControls.DataGrid Datagrid1;
		protected dgNavigation DgNavigation1;
		protected System.Web.UI.WebControls.Button Button1;
		protected System.Web.UI.WebControls.Button Button2;
		protected System.Web.UI.WebControls.DropDownList Dropdownlist2;
		protected System.Web.UI.WebControls.TextBox Textbox2;
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
				Button1.Attributes.Add("onclick","return confirm('您真的确认已经裁完？')");
			}
		}
		private void BindData ()
		{

			string cmd = "SELECT [dbid], [cpid], [产品名称], [调拨日期],[调拨仓库], [原仓库], [操作员], [调拨数量], [调拨说明], [经办说明], [xsid], [确认到货],[加工状态] FROM [调拨单] where 1=1 ";
			if (Dropdownlist2.SelectedIndex==0)
			{
                cmd += " and 调拨仓库 ='"+this.zjgmc.ToString()+"'";
				if (this.DropDownList1.SelectedIndex!=0)
					cmd+=" and 原仓库 ='"+this.DropDownList1.SelectedValue.ToString()+"'";
			}
			if (Dropdownlist2.SelectedIndex==1)
			{
				cmd += " and 原仓库 ='"+this.zjgmc.ToString()+"'";
				if (this.DropDownList1.SelectedIndex!=0)
					cmd+=" and 调拨仓库 ='"+this.DropDownList1.SelectedValue.ToString()+"'";
			}
			if (Textbox2.Text!="")
				cmd+=" and 产品名称 like '%"+Textbox2.Text+"%'";
			cmd+=" order by 调拨日期 desc";
			DataSet ds = DBBase.ExecuteSql4Ds (cmd,"dbddc");
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
			this.Button2.Click += new System.EventHandler(this.Button2_Click);
			this.Datagrid1.ItemDataBound += new System.Web.UI.WebControls.DataGridItemEventHandler(this.Datagrid1_ItemDataBound);
			this.Load += new System.EventHandler(this.Page_Load);

		}
		#endregion

		private void query_Click(object sender, System.EventArgs e)
		{
			BindData ();
		}

		private void Button1_Click(object sender, System.EventArgs e)
		{
			string id = utils.FindFirstCheckedItem(this.Datagrid1);
			string cmd="update 调拨单 set 加工状态='已裁完' where dbid='"+id+"'";
			DBBase.ExecuteSql (cmd);
			BindData ();
		}

		private void Button2_Click(object sender, System.EventArgs e)
		{
			string id = utils.FindFirstCheckedItem(this.Datagrid1);
			u.OpenIEWindowRight(this,"dbddc_edit.aspx?dbid="+id,750,550);
		}

		private void Datagrid1_ItemDataBound(object sender, System.Web.UI.WebControls.DataGridItemEventArgs e)
		{
			//  确定是数据行而非页首或页尾
			if (e.Item.ItemType == ListItemType.Item || e.Item.ItemType == ListItemType.AlternatingItem)
			{
				//  取得 manager 字段的值
				string isManager = (string)DataBinder.Eval(e.Item.DataItem, "加工状态");

				if (isManager == "已裁完")
				{
					//  设置文本及背景颜色.
					e.Item.Cells[11].Text = "已裁完";
					e.Item.Cells[11].ForeColor=System.Drawing.Color.Blue;
				}
				else
				{
					//  仅设置文本.
					//e.Item.Cells[2].Text = "";
					e.Item.Cells[11].Text = "未裁完";
					e.Item.Cells[11].ForeColor=System.Drawing.Color.Red;
				}
				isManager = (string)DataBinder.Eval(e.Item.DataItem, "确认到货");

				if (isManager == "已到")
				{
					//  设置文本及背景颜色.
					e.Item.Cells[10].Text = "已到货";
					e.Item.Cells[10].ForeColor=System.Drawing.Color.Blue;
				}
				else
				{
					//  仅设置文本.
					//e.Item.Cells[2].Text = "";
					e.Item.Cells[10].Text = "未到货";
					e.Item.Cells[10].ForeColor=System.Drawing.Color.Red;
				}
			}
		}
	}
}
