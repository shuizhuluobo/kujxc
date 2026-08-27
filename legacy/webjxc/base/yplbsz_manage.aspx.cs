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

namespace jxc.admin.bases
{
	/// <summary>
	/// yplbsz_manage 的摘要说明。
	/// </summary>
	public class yplbsz_manage : System.Web.UI.Page
	{
		protected System.Web.UI.WebControls.DataGrid Datagrid1;
		protected System.Web.UI.WebControls.Button change;
		protected System.Web.UI.WebControls.Button delete;
		protected System.Web.UI.WebControls.Button add;
		protected System.Web.UI.WebControls.Button query;
		protected System.Web.UI.WebControls.TextBox cpname;

		protected dgNavigation DgNavigation1;
		protected System.Web.UI.WebControls.DropDownList DropDownList1;
		protected System.Web.UI.WebControls.DropDownList DropDownList2;
		protected System.Web.UI.WebControls.Button post;
		protected System.Web.UI.WebControls.Button Button1;
	
		utils u = new utils ();

		private void Page_Load(object sender, System.EventArgs e)
		{
			u.SetGridStyle(this.Datagrid1);
			DgNavigation1.SetTarget(Datagrid1,null,new BindDataDelegate(BindData));//BindData是你的数据邦定事件
			DgNavigation1.SetStyle(20, false);//10表示每页分10行，true表示无分页时自动隐藏
			if (!this.Page.IsPostBack)
			{
				
				BindData ();
				delete.Attributes.Add("onclick","return confirm('您真的要删除吗？')");
      			post.Attributes.Add("onclick","return confirm('您真的确认重新起用？')");
				Button1.Attributes.Add("onclick","return confirm('您真的确认删除所有记录？')");
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
			this.add.Click += new System.EventHandler(this.add_Click);
			this.change.Click += new System.EventHandler(this.change_Click);
			this.delete.Click += new System.EventHandler(this.delete_Click);
			this.post.Click += new System.EventHandler(this.post_Click);
			this.Datagrid1.ItemDataBound += new System.Web.UI.WebControls.DataGridItemEventHandler(this.Datagrid1_ItemDataBound);
			this.Button1.Click += new System.EventHandler(this.Button1_Click);
			this.Load += new System.EventHandler(this.Page_Load);

		}
		#endregion

		private void BindData ()
		{
			string cmd = "select * from 样品类别 where 1=1 ";
			if (this.cpname.Text != string.Empty)
				cmd += " and 样品类别 like '%" + this.cpname.Text.Trim () + "%'";
//            if (this.DropDownList1.SelectedIndex==0)
//				cmd+=" and 库保确认='否'";
//			if (this.DropDownList1.SelectedIndex==1)
//				cmd+=" and 库保确认='是'";
//			if (this.DropDownList2.SelectedIndex==0)
//				cmd+=" and 到货确认='否'";
//			if (this.DropDownList2.SelectedIndex==1)
//				cmd+=" and 到货确认='是'";
			DataSet ds = DBBase.ExecuteSql4Ds (cmd+" order by yplbid desc","yplbsz");
			this.Datagrid1.DataSource = ds.Tables[0].DefaultView;
			this.Datagrid1.DataBind ();
		}

		private void query_Click(object sender, System.EventArgs e)
		{
			BindData ();
		}

		private void add_Click(object sender, System.EventArgs e)
		{
			string id = utils.FindFirstCheckedItem(this.Datagrid1);
			u.OpenIEWindowRight(this,"yplbsz_edit.aspx?id="+id,500,500);
			
		}

		private void change_Click(object sender, System.EventArgs e)
		{
//		string id = utils.FindFirstCheckedItem(this.Datagrid1);
////			u.OpenIEWindowRight(this,"yplbsz_edit.aspx?cpid=" + id,500,500);
//			string cmd="update 入库单 set 库保确认='是' where rkid='"+id+"'";
//			DBBase.ExecuteSql (cmd);
//			BindData ();
	    
		}

		private void delete_Click(object sender, System.EventArgs e)
		{
			string id = utils.FindFirstCheckedItem(this.Datagrid1);
			//			u.OpenIEWindowRight(this,"yplbsz_edit.aspx?cpid=" + id,500,500);
			string cmd="update 样品类别 set 是否下柜='是' where yplbid='"+id+"'";
			DBBase.ExecuteSql (cmd);
			BindData ();
		}

		private void Datagrid1_ItemDataBound(object sender, System.Web.UI.WebControls.DataGridItemEventArgs e)
		{
//			//  确定是数据行而非页首或页尾
//			if (e.Item.ItemType == ListItemType.Item || e.Item.ItemType == ListItemType.AlternatingItem)
//			{
//				//  取得 manager 字段的值
//				string isManager = (string)DataBinder.Eval(e.Item.DataItem, "库保确认");
//
//				if (isManager == "否")
//				{
//					//  设置文本及背景颜色.
//					e.Item.Cells[11].Text = "未发货";
//					e.Item.Cells[11].ForeColor=System.Drawing.Color.Red;
//				}
//				else
//				{
//					//  仅设置文本.
//					//e.Item.Cells[2].Text = "";
//					e.Item.Cells[11].Text = "已发货";
//					e.Item.Cells[11].ForeColor=System.Drawing.Color.Blue;
//				}
//				isManager = (string)DataBinder.Eval(e.Item.DataItem, "到货确认");
//
//				if (isManager == "否")
//				{
//					//  设置文本及背景颜色.
//					e.Item.Cells[10].Text = "未到货";
//					e.Item.Cells[10].ForeColor=System.Drawing.Color.Red;
//				}
//				else
//				{
//					//  仅设置文本.
//					//e.Item.Cells[2].Text = "";
//					e.Item.Cells[10].Text = "已到货";
//					e.Item.Cells[10].ForeColor=System.Drawing.Color.Blue;
//				}
//			}
		}

		private void post_Click(object sender, System.EventArgs e)
		{
			string id = utils.FindFirstCheckedItem(this.Datagrid1);
			//			u.OpenIEWindowRight(this,"yplbsz_edit.aspx?cpid=" + id,500,500);
			string cmd="update 样品类别 set 是否下柜='否' where yplbid='"+id+"'";
			DBBase.ExecuteSql (cmd);
			BindData ();
		}

		private void Button1_Click(object sender, System.EventArgs e)
		{
			string[] cmd=new string[2];
			string id = utils.FindFirstCheckedItem(this.Datagrid1);
			string cmd1 = "select * from 样品类别 where yplbid='" + id + "'";
			SqlDataReader dr = DBBase.ExecuteSqlReader (cmd1);
			if (dr.Read ())
				cmd1=dr["样品类别"].ToString();
		     dr.Close ();
			cmd[0]="delete 样品类别 where yplbid='"+id+"'";
            cmd[1]="delete 样品入库单 where 产品类别='"+cmd1+"'";
			DBBase.ExecuteSqls (cmd);
			BindData ();
		}
	}
}
