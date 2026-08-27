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
	/// ypbglcx_manage 的摘要说明。
	/// </summary>
	public class ypbglcx_manage : jxc.UsrControl.UserPage//System.Web.UI.Page// 
	{
		protected System.Web.UI.WebControls.Button query;
		protected System.Web.UI.WebControls.TextBox cpname;

		protected dgNavigation DgNavigation1;
		protected System.Web.UI.WebControls.DropDownList DropDownList2;
		protected System.Web.UI.WebControls.DataGrid Datagrid1;
		protected System.Web.UI.WebControls.DropDownList Dropdownlist1;
	
		utils u = new utils ();

		private void Page_Load(object sender, System.EventArgs e)
		{
			u.SetGridStyle(this.Datagrid1);
			DgNavigation1.SetTarget(Datagrid1,null,new BindDataDelegate(BindData));//BindData是你的数据邦定事件
			DgNavigation1.SetStyle(20, false);//10表示每页分10行，true表示无分页时自动隐藏
			if (!this.Page.IsPostBack)
			{
				if (this.parents.ToString()=="01")
					utils.BindDropDownList("select jgmc,jgmc from cnc_jgglb where parent1='"+this.jgbh.ToString()+"'",this.DropDownList2);
				else
				{
					if (this.parents.ToString()=="000000")
					utils.BindDropDownList("select jgmc,jgmc from cnc_jgglb where parent1<>'01' and parent1<>'000000'",this.DropDownList2);
					else
					utils.BindDropDownList("select jgmc,jgmc from cnc_jgglb where parent1='"+this.parents.ToString()+"'",this.DropDownList2);
				}
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
			this.Datagrid1.ItemDataBound += new System.Web.UI.WebControls.DataGridItemEventHandler(this.Datagrid1_ItemDataBound);
			this.Load += new System.EventHandler(this.Page_Load);

		}
		#endregion

		private void BindData ()
		{
			string cmd = "select  样品类别.撤柜天数-DATEDIFF(day,样品入库单.入库日期,getdate()) as 天数 ,* from 样品入库单,样品类别 where 样品入库单.产品类别=样品类别.样品类别 and 样品入库单.剩余数量>0 ";
			if (this.cpname.Text != string.Empty)
				cmd += " and 样品入库单.产品名称 like '%" + this.cpname.Text.Trim () + "%'";
			if (this.DropDownList2.SelectedIndex!=0)
			{
				cmd +=" and 样品入库单.店名='"+this.DropDownList2.SelectedValue.ToString()+"' ";
			}
//			if (this.groupname.ToString()=="1")//仓库管理
//				cmd+=" and 样品入库单.仓库名称='"+this.zjgmc.ToString()+"'";
			if (this.groupname.ToString()=="2")
			{
				cmd+=" and 样品入库单.店名='"+this.jgmc.ToString()+"'";
				this.DropDownList2.Enabled=false;
			}
			if (this.groupname.ToString()!="0")
			{
				cmd+=" and 样品入库单.仓库名称='"+this.zjgmc.ToString()+"'";
			}
            cmd +=" order by 天数";
			DataSet ds = DBBase.ExecuteSql4Ds (cmd,"ypbglcx");
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
//			u.OpenIEWindowRight(this,"ypbglcx_edit.aspx",550,450);
			
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
//			u.OpenIEWindowRight(this,"ypbglcx_ckedit.aspx?id="+id,550,450);
		}

		private void Datagrid1_ItemDataBound(object sender, System.Web.UI.WebControls.DataGridItemEventArgs e)
		{
			//  确定是数据行而非页首或页尾
			if (e.Item.ItemType == ListItemType.Item || e.Item.ItemType == ListItemType.AlternatingItem)
			{
				//  取得 manager 字段的值
				string isManager =Convert.ToString(DataBinder.Eval(e.Item.DataItem, "天数"));
				if (Convert.ToDouble(isManager)<=0) 
				{
					e.Item.Cells[3].ForeColor=System.Drawing.Color.Red;
					e.Item.Cells[11].ForeColor=System.Drawing.Color.Red;
				}
			}
		}
	}
}
