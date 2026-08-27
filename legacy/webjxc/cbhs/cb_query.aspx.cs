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
	/// cb_query 的摘要说明。
	/// </summary>
	public class cb_query : System.Web.UI.Page
	{
		protected System.Web.UI.WebControls.DataGrid Datagrid1;
		protected dgNavigation DgNavigation1;
		protected System.Web.UI.WebControls.DropDownList DropDownList1;
		protected System.Web.UI.WebControls.Button query;
		protected System.Web.UI.WebControls.RadioButtonList RadioButtonList1;
		protected System.Web.UI.WebControls.TextBox min;
		protected System.Web.UI.WebControls.TextBox max;
		protected System.Web.UI.WebControls.Label zkcs;
		protected System.Web.UI.WebControls.Label zcb;
		protected System.Web.UI.WebControls.TextBox minkcs;
		protected System.Web.UI.WebControls.TextBox maxkcs;
		utils u = new utils ();

		private void Page_Load(object sender, System.EventArgs e)
		{
			u.SetGridStyle(this.Datagrid1);
			DgNavigation1.SetTarget(Datagrid1,null,new BindDataDelegate(BindData));//BindData是你的数据邦定事件
			DgNavigation1.SetStyle(20, false);//10表示每页分10行，true表示无分页时自动隐藏
			if (!this.Page.IsPostBack)
			{
				utils.BindDropDownList("select jgbh,jgmc from cnc_jgglb where rank=1",this.DropDownList1);
				BindData ();
				//delete.Attributes.Add("onclick","return confirm('您真的要删除吗？')");
			}
		}

		private void BindData ()
		{
			//6string cmd = "select rk4,b.cp2,sum(rk7) kcs,sum(rk7*rk62) as cb from j_rk a,j_cp b where a.rk2=b.cp1 ";  // group by rk4,cp2 order by rk4,cp2" ;

//			string cmd = "select  仓库名称,b.产品名称,sum(剩余数量) kcs,sum(剩余数量*入库单价) as cb from 入库单 a,产品信息 b where a.cpid=b.cpid ";  // group by rk4,cp2 order by rk4,cp2" ;
			string cmd = "select  仓库名称,产品名称,sum(剩余数量) kcs,sum(剩余数量*入库单价) as cb from 入库单 a where 1=1 ";  // group by rk4,cp2 order by rk4,cp2" ;

			if (this.DropDownList1.SelectedIndex>0)
			{
				cmd += " and 仓库名称='" + this.DropDownList1.SelectedItem.Text + "'";

				if (this.RadioButtonList1.SelectedIndex == 1)
					cmd += " and 仓库名称 + rtrim(ltrim(str(cpid))) not in (select dq+rtrim(ltrim(str(cpid))) from t_pcb)";
			}
			else
			{
				if (this.RadioButtonList1.SelectedIndex == 1)
					cmd += " and cpid not in (select cpid from t_pcb)";
			}
			

			cmd += " group by 仓库名称,产品名称";

			cmd = "select * from (" + cmd + ") c where 1=1";

			if (this.min.Text != "")
				cmd += " and cb>=" + this.min.Text.Trim ();
			if (this.max.Text != "")
				cmd += " and cb<=" + this.max.Text.Trim ();

			if (this.minkcs.Text != "")
				cmd += " and kcs>=" + this.minkcs.Text.Trim ();
			if (this.maxkcs.Text != "")
				cmd += " and kcs<=" + this.maxkcs.Text.Trim ();


			cmd += " order by 仓库名称,产品名称";
			
		
			DataSet ds = DBBase.ExecuteSql4Ds (cmd,"j_cp");
			this.Datagrid1.DataSource = ds.Tables["j_cp"].DefaultView;
			this.Datagrid1.DataBind ();

			decimal zkcss=0,zcbs=0;
			for (int i=0;i<ds.Tables[0].Rows.Count;i++)
			{
				zkcss += decimal.Parse(ds.Tables[0].Rows[i]["kcs"].ToString ());
				zcbs += decimal.Parse(ds.Tables[0].Rows[i]["cb"].ToString ());
			}
			this.zkcs.Text = zkcss.ToString ();
			this.zcb.Text = zcbs.ToString ();
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

		private void query_Click(object sender, System.EventArgs e)
		{
			BindData ();
		}
	}
}
