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
	/// kcpd_manage 的摘要说明。
	/// </summary>
	public class kcpd_manage : jxc.UsrControl.UserPage//System.Web.UI.Page// 
	{
		protected System.Web.UI.WebControls.DataGrid Datagrid1;
		protected System.Web.UI.WebControls.Button add;
		protected System.Web.UI.WebControls.Button query;
		protected System.Web.UI.WebControls.TextBox cpname;

		protected dgNavigation DgNavigation1;
		protected System.Web.UI.WebControls.Button Button1;
		//protected Classes.AreaInfo myClass=new Client.Classes.AreaInfo();
//
		utils u = new utils ();

		private void Page_Load(object sender, System.EventArgs e)
		{
			u.SetGridStyle2(this.Datagrid1);
			//DgNavigation1.SetTarget(Datagrid1,null,new BindDataDelegate(BindData));//BindData是你的数据邦定事件
			//DgNavigation1.SetStyle(20, false);//10表示每页分10行，true表示无分页时自动隐藏
			if (!this.Page.IsPostBack)
			{
				
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
			this.add.Click += new System.EventHandler(this.add_Click);
			this.Button1.Click += new System.EventHandler(this.Button1_Click);
			this.Datagrid1.CancelCommand += new System.Web.UI.WebControls.DataGridCommandEventHandler(this.Datagrid1_CancelCommand);
			this.Datagrid1.EditCommand += new System.Web.UI.WebControls.DataGridCommandEventHandler(this.Datagrid1_EditCommand);
			this.Datagrid1.UpdateCommand += new System.Web.UI.WebControls.DataGridCommandEventHandler(this.Datagrid1_UpdateCommand);
			this.Datagrid1.DeleteCommand += new System.Web.UI.WebControls.DataGridCommandEventHandler(this.Datagrid1_DeleteCommand);
			this.Datagrid1.ItemDataBound += new System.Web.UI.WebControls.DataGridItemEventHandler(this.Datagrid1_ItemDataBound);
			this.Load += new System.EventHandler(this.Page_Load);

		}
		#endregion

		private void BindData ()
		{
//			string[] cmd=new string[1];
//			cmd[0]="delete 地区产品盘点 whre  仓库名称='"+this.zjgmc.ToString()+"'";
//			 cmd[1]="insert into 地区产品盘点([仓库名称], [产品名称],[cpid], [剩余数量]) select 仓库名称,产品名称,cpid,sum(剩余数量)as 剩余数量 from 样品入库单 where 1=1 ";
//                   cmd[1]+=" and 仓库名称='"+this.zjgmc.ToString();
//                   cmd[1]+="' group by 仓库名称,产品名称,cpid"; 

			string cmd = "select * from (select *,实际库存-剩余数量 as 库存差 from  地区产品盘点 where 店名='"+this.jgmc.ToString()+"') as xx where 1=1";
		//	cmd+="(select 店名,产品名称,cpid,sum(剩余数量)as 样品米数 from 样品入库单 group by 店名,产品名称,cpid) as yy where xx.产品名称=yy.产品名称 and xx.店名=yy.店名";
			if (this.cpname.Text != string.Empty)
				cmd += " and xx.产品名称 like '%" + this.cpname.Text.Trim () + "%'";
			if (this.groupname.ToString()!="0")
			{
				cmd+=" and xx.店名='"+this.jgmc.ToString()+"'";

			}
			
			DataSet ds = DBBase.ExecuteSql4Ds (cmd+" order by xx.店名 ","kcpd");
			this.Datagrid1.DataSource = ds.Tables[0].DefaultView;
			this.Datagrid1.DataBind ();
		}

		private void query_Click(object sender, System.EventArgs e)
		{
			BindData ();
		}

		private void add_Click(object sender, System.EventArgs e)
		{
			string[] cmd=new string[2];
			cmd[0]="delete 地区产品盘点 where  店名='"+this.jgmc.ToString()+"'";
			cmd[1]="insert into 地区产品盘点([店名], [产品名称],[cpid], [剩余数量],颜色,规格) select 店名,产品名称,cpid,sum(剩余数量)as 剩余数量,颜色,规格 from 入库单 where 1=1 ";
			cmd[1]+=" and 店名='"+this.jgmc.ToString();
			cmd[1]+="' group by 店名,产品名称,cpid,颜色,规格"; 
			try
			{
				DBBase.ExecuteSqls (cmd);
				utils.Alert (this,"新建成功");
			}
			catch
			{
				utils.Alert (this,"保存失败");
			}
			BindData();
		}

		private void change_Click(object sender, System.EventArgs e)
		{

		}

		private void delete_Click(object sender, System.EventArgs e)
		{
		
		}

		private void Button1_Click(object sender, System.EventArgs e)
		{
			string id = utils.FindFirstCheckedItem(this.Datagrid1);
			if (id!="")
			u.OpenIEWindowRight(this,"kcpd_ckedit.aspx?id="+id,550,450);
			else
				 utils.Alert (this,"请选择要出库的产品!");

		}

		private void Datagrid1_ItemDataBound(object sender, System.Web.UI.WebControls.DataGridItemEventArgs e)
		{
			//  确定是数据行而非页首或页尾
//			if (e.Item.ItemType == ListItemType.Item || e.Item.ItemType == ListItemType.AlternatingItem)
//			{
//				//  取得 manager 字段的值
//				string isManager =Convert.ToString(DataBinder.Eval(e.Item.DataItem, "天数"));
//				if (Convert.ToDouble(isManager)<=0) 
//				{
//					e.Item.Cells[2].ForeColor=System.Drawing.Color.Red;
//					e.Item.Cells[10].ForeColor=System.Drawing.Color.Red;
//				}
//			}
			if (e.Item.ItemType == ListItemType.Item || e.Item.ItemType == ListItemType.AlternatingItem)
			{
				//  取得 manager 字段的值
				string isManager =Convert.ToString(DataBinder.Eval(e.Item.DataItem, "库存差"));
				if (Convert.ToDouble(isManager)>0) 
				{
					e.Item.Cells[8].ForeColor=System.Drawing.Color.Blue;
				}
				else
					if (Convert.ToDouble(isManager)<0)
					{
                       e.Item.Cells[8].ForeColor=System.Drawing.Color.Red;
					}
			}
		}

		private void Datagrid1_EditCommand(object source, System.Web.UI.WebControls.DataGridCommandEventArgs e)
		{
				Datagrid1.EditItemIndex = e.Item.ItemIndex;
                BindData();

		}

		private void Datagrid1_UpdateCommand(object source, System.Web.UI.WebControls.DataGridCommandEventArgs e)
		{
			//string code = ((TextBox)e.Item.Cells[1].Controls[0]).Text;
			string name = ((TextBox)e.Item.Cells[6].Controls[0]).Text;
			//Datagrid1.DataKeys [item.ItemIndex].ToString ();
			//string id = ((TextBox)e.Item.Cells[1].Controls[0]).Text;
              string id=Datagrid1.DataKeys [e.Item.ItemIndex].ToString ();
			string cmd="update 地区产品盘点 set 实际库存="+name+" where pdid="+id;
			DBBase.ExecuteSql (cmd);
			//myClass.upDateArea(id,code,name);
			Datagrid1.EditItemIndex = -1;
		//	DG1.DataSource = myClass.bindGrid();
			BindData();
		}

		private void Datagrid1_CancelCommand(object source, System.Web.UI.WebControls.DataGridCommandEventArgs e)
		{
			Datagrid1.EditItemIndex = -1;
	        BindData();
		}

		private void Datagrid1_DeleteCommand(object source, System.Web.UI.WebControls.DataGridCommandEventArgs e)
		{
		
		}
	}
}
