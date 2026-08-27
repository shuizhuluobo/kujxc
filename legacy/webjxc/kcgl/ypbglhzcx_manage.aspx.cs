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
	/// ypbglhzcx_manage 的摘要说明。
	/// </summary>
	public class ypbglhzcx_manage : jxc.UsrControl.UserPage//System.Web.UI.Page// 
	{
		protected System.Web.UI.WebControls.DataGrid Datagrid1;
		protected System.Web.UI.WebControls.Button query;
		protected System.Web.UI.WebControls.TextBox cpname;

		protected dgNavigation DgNavigation1;
		protected System.Web.UI.WebControls.DropDownList DropDownList2;
		protected System.Web.UI.WebControls.TextBox Textbox1;
	
		utils u = new utils ();

		private void Page_Load(object sender, System.EventArgs e)
		{
			u.SetGridStyle(this.Datagrid1);
			DgNavigation1.SetTarget(Datagrid1,null,new BindDataDelegate(BindData));//BindData是你的数据邦定事件
			DgNavigation1.SetStyle(20, false);//10表示每页分10行，true表示无分页时自动隐藏
			if (!this.Page.IsPostBack)
			{
				
				//utils.BindDropDownList("select jgmc,jgmc from cnc_jgglb where parent1='"+this.parents.ToString()+"'",this.DropDownList2);
				BindData ();
			//	delete.Attributes.Add("onclick","return confirm('您真的要删除吗？')");
			//	change.Attributes.Add("onclick","return confirm('您真的确认已经到货？')");
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
			this.Load += new System.EventHandler(this.Page_Load);

		}
		#endregion

		private void BindData ()
		{
			string cmd = "select 仓库名称,cpid,产品名称,产品类别,sum(剩余数量) as 剩余数量,sum(剩余数量) * 单价 as 合计 from  样品入库单 where 1=1  ";
			if (this.cpname.Text != string.Empty)
				cmd += " and 样品入库单.产品名称 like '%" + this.cpname.Text.Trim () + "%'";
			if (this.Textbox1.Text != string.Empty)
				cmd += " and 样品入库单.店名 like '%" + this.Textbox1.Text.Trim () + "%'";
//			if (this.DropDownList2.SelectedIndex!=0)
//			{
//				cmd +=" and 样品入库单.店名='"+this.DropDownList2.SelectedValue.ToString()+"' ";
//			}
			if (this.groupname.ToString()=="1")//仓库管理
				cmd+=" and 样品入库单.仓库名称='"+this.zjgmc.ToString()+"'";
			if (this.groupname.ToString()=="2")
			{
				cmd+=" and 样品入库单.店名='"+this.jgmc.ToString()+"'";
				this.DropDownList2.Enabled=false;
			}
            cmd +=" group by 仓库名称,cpid,产品名称,产品类别,单价  order by 仓库名称,产品名称";
			DataSet ds = DBBase.ExecuteSql4Ds (cmd,"ypbglhzcx");
			this.Datagrid1.DataSource = ds.Tables[0].DefaultView;
			this.Datagrid1.DataBind ();
		}

		private void query_Click(object sender, System.EventArgs e)
		{
			BindData ();
		}

		private void add_Click(object sender, System.EventArgs e)
		{
			//string id = utils.FindFirstCheckedItem(this.Datagrid1);
//			u.OpenIEWindowRight(this,"ypbglhzcx_edit.aspx",550,450);
			
		}

		private void change_Click(object sender, System.EventArgs e)
		{

		}

		private void delete_Click(object sender, System.EventArgs e)
		{
		
		}

		private void Button1_Click(object sender, System.EventArgs e)
		{
//			string id = utils.FindFirstCheckedItem(this.Datagrid1);
//			u.OpenIEWindowRight(this,"ypbglhzcx_ckedit.aspx?id="+id,550,450);
		}
	}
}
