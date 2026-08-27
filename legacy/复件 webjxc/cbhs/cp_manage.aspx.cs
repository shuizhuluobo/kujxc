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
	/// cp_manage 的摘要说明。
	/// </summary>
	public class cp_manage : System.Web.UI.Page
	{
		protected System.Web.UI.WebControls.Button query;
		protected System.Web.UI.WebControls.DataGrid Datagrid1;
		protected System.Web.UI.WebControls.Button add;
		protected System.Web.UI.WebControls.TextBox cpmc;

		protected dgNavigation DgNavigation1;
		protected System.Web.UI.WebControls.TextBox min;
		protected System.Web.UI.WebControls.TextBox max;
		protected System.Web.UI.WebControls.DropDownList DropDownList1;
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

		private void BindData ()
		{
			if (this.DropDownList1.SelectedIndex==0)
			{
				utils.Alert (this,"请选择地区");
				return;
			}
//			string cmd = "select a.*,b.kcs from j_cp a,(select rk2,sum(rk7) as kcs from j_rk where rk4='" + this.DropDownList1.SelectedItem.Text + "' group by rk2) b where a.cp1=b.rk2";// group by rk4,cp2 order by rk4,cp2" ;
			
			string cmd = "select a.*,b.kcs from 产品信息 a,(select cpid,sum(剩余数量) as kcs from 入库单 where 仓库名称='" + this.DropDownList1.SelectedItem.Text + "' group by cpid) b where a.cpid=b.cpid";// group by rk4,cp2 order by rk4,cp2" ;

			if (this.cpmc.Text != "")
				cmd += " and a.产品名称 like '%" + this.cpmc.Text.Trim () + "%'";
			if (this.min.Text != "")
				cmd += " and b.kcs>=" + this.min.Text.Trim ();
			if (this.max.Text != "")
				cmd += " and b.kcs<=" + this.max.Text.Trim ();
			
			cmd += " order by a.cpid asc";

			DataSet ds = DBBase.ExecuteSql4Ds (cmd,"j_cp");
			this.Datagrid1.DataSource = ds.Tables["j_cp"].DefaultView;
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
			this.Datagrid1.ItemCommand += new System.Web.UI.WebControls.DataGridCommandEventHandler(this.Datagrid1_ItemCommand);
			//this.add.Click += new System.EventHandler(this.add_Click);
			this.Button1.Click += new System.EventHandler(this.Button1_Click);
			this.Load += new System.EventHandler(this.Page_Load);

		}
		#endregion

		private void query_Click(object sender, System.EventArgs e)
		{
			BindData();
		}

	

		private void Datagrid1_ItemCommand(object source, System.Web.UI.WebControls.DataGridCommandEventArgs e)
		{
			string id =  Datagrid1.DataKeys[(int)e.Item.ItemIndex].ToString ();
			if (DBBase3.IsValuesExists("select 1 from t_pcb where cpid=" + id + " and dq='" + this.DropDownList1.SelectedItem.Text + "'"))
			{
				utils.Alert (this,"已经排除");
				return;
			}
			string cmd = "insert into t_pcb (cpid,dq)values(" + id + ",'" + this.DropDownList1.SelectedItem.Text + "')";
			
			try
			{
				DBBase.ExecuteSql (cmd);
			}
			catch
			{
				utils.Alert (this,"增加失败");
				return;
			}
			utils.Alert (this,"成功");
			
		}

		private void Button1_Click(object sender, System.EventArgs e)
		{
			string cmd = "select a.*,b.kcs from 产品信息 a,(select cpid,sum(剩余数量) as kcs from 入库单 where 仓库名称='" + this.DropDownList1.SelectedItem.Text + "' group by cpid) b where a.cpid=b.cpid";// group by rk4,cp2 order by rk4,cp2" ;

			if (this.cpmc.Text != "")
				cmd += " and a.产品名称 like '%" + this.cpmc.Text.Trim () + "%'";
			if (this.min.Text != "")
				cmd += " and b.kcs>=" + this.min.Text.Trim ();
			if (this.max.Text != "")
				cmd += " and b.kcs<=" + this.max.Text.Trim ();
			
			cmd += " order by a.cpid asc";

			DataSet ds = DBBase.ExecuteSql4Ds (cmd,"j_cp");
			string [] cmds = new string [ds.Tables[0].Rows.Count];
			for (int i=0;i<ds.Tables[0].Rows.Count;i++)
			{
				cmds[i] = " insert into t_pcb (cpid,dq)values(" + ds.Tables[0].Rows[i]["cpid"].ToString () + ",'" + this.DropDownList1.SelectedItem.Text + "')";
			}

			try
			{
				DBBase.ExecuteSqls (cmds);
			}
			catch
			{
				utils.Alert (this,"增加失败");
				return;
			}
			utils.Alert (this,"成功");
		}
	}
}
