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
	/// pc_manage 的摘要说明。
	/// </summary>
	public class pc_manage : System.Web.UI.Page
	{
		protected System.Web.UI.WebControls.DropDownList DropDownList1;
		protected System.Web.UI.WebControls.Button query;
		protected System.Web.UI.WebControls.DataGrid Datagrid1;
		protected dgNavigation DgNavigation1;
		protected System.Web.UI.WebControls.Button Button1;
		
		utils u = new utils ();
	
		private void Page_Load(object sender, System.EventArgs e)
		{
			u.SetGridStyle(this.Datagrid1);
			DgNavigation1.SetTarget(Datagrid1,null,new BindDataDelegate(BindData));//BindData是你的数据邦定事件
			DgNavigation1.SetStyle(20, false);//10表示每页分10行，true表示无分页时自动隐藏
			if (!this.Page.IsPostBack)
			{
				utils.BindDropDownList("select jgbh,jgmc from cnc_jgglb where rank=1",this.DropDownList1);

				//BindData ();
				//delete.Attributes.Add("onclick","return confirm('您真的要删除吗？')");
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
			this.Button1.Click += new System.EventHandler(this.Button1_Click);
			this.Datagrid1.ItemCommand += new System.Web.UI.WebControls.DataGridCommandEventHandler(this.Datagrid1_ItemCommand);
			this.Load += new System.EventHandler(this.Page_Load);

		}
		#endregion

		private void query_Click(object sender, System.EventArgs e)
		{
			BindData ();
		}

		private void BindData ()
		{
			string cmd = "select id,(select 产品名称 from 产品信息 where cpid=t_pcb.cpid) as cpname,dq,cpid from t_pcb";
			if (this.DropDownList1.SelectedIndex > 0)
				cmd += " where dq='" + this.DropDownList1.SelectedItem.Text + "'";

			DataSet ds = DBBase.ExecuteSql4Ds (cmd,"j_cp");
			this.Datagrid1.DataSource = ds.Tables["j_cp"].DefaultView;
			this.Datagrid1.DataBind ();
		}

		private void Datagrid1_ItemCommand(object source, System.Web.UI.WebControls.DataGridCommandEventArgs e)
		{
			string id =  Datagrid1.DataKeys[(int)e.Item.ItemIndex].ToString ();
			
			string cmd = "delete from t_pcb where id=" + id;
			
			try
			{
				DBBase.ExecuteSql (cmd);
				BindData();
			}
			catch
			{
				utils.Alert (this,"失败");
				return;
			}
			utils.Alert (this,"成功");
		}

		private void Button1_Click(object sender, System.EventArgs e)
		{
			string cmd = "select id,(select 产品名称 from 产品信息 where cpid=t_pcb.cpid) as cpname,dq,cpid from t_pcb";
			if (this.DropDownList1.SelectedIndex > 0)
				cmd += " where dq='" + this.DropDownList1.SelectedItem.Text + "'";

			DataSet ds = DBBase.ExecuteSql4Ds (cmd,"j_cp");

			string [] cmds = new string[ds.Tables[0].Rows.Count];
			for (int i=0;i<ds.Tables[0].Rows.Count;i++)
				cmds[i] = "delete from t_pcb where id=" + ds.Tables[0].Rows[i]["id"].ToString ();

			try
			{
				DBBase.ExecuteSqls (cmds);
				BindData();
			}
			catch
			{
				utils.Alert (this,"失败");
				return;
			}
			utils.Alert (this,"成功");

		}
	}
}
