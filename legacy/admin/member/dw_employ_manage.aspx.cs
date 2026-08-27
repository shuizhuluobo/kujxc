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
using health.ascx;

namespace health.admin.member
{
	/// <summary>
	/// dw_employ_manage 的摘要说明。
	/// </summary>
	public class dw_employ_manage : health.UsrControl.UserPage
	{
		protected System.Web.UI.WebControls.TextBox xm;
		protected System.Web.UI.WebControls.TextBox sfzh;
		protected System.Web.UI.WebControls.Button query;
		protected System.Web.UI.WebControls.DataGrid Datagrid1;
		protected System.Web.UI.WebControls.Button change;
		protected dgNavigation DgNavigation1;
		protected System.Web.UI.WebControls.RadioButton xb1;
		protected System.Web.UI.WebControls.RadioButton xb2;
		protected System.Web.UI.WebControls.RadioButton xl1;
		protected System.Web.UI.WebControls.RadioButton xl2;
		protected System.Web.UI.WebControls.RadioButton xl3;
		protected System.Web.UI.WebControls.RadioButton xl4;
		protected System.Web.UI.WebControls.RadioButton xl5;
		protected System.Web.UI.WebControls.RadioButton xl6;
		protected System.Web.UI.WebControls.RadioButton xl7;
		protected System.Web.UI.WebControls.RadioButton nlz1;
		protected System.Web.UI.WebControls.RadioButton nlz2;
		protected System.Web.UI.WebControls.RadioButton nlz3;
		protected System.Web.UI.WebControls.RadioButton nld2;
		protected System.Web.UI.WebControls.RadioButton nld3;
		protected System.Web.UI.WebControls.RadioButton nld4;
		protected System.Web.UI.WebControls.RadioButton nld5;
		protected System.Web.UI.WebControls.RadioButton nld6;
		protected System.Web.UI.WebControls.RadioButton nld7;
		protected System.Web.UI.WebControls.RadioButton nld8;
		protected System.Web.UI.WebControls.Button reset;
		protected System.Web.UI.WebControls.RadioButton nld1;
		
		utils u = new utils ();
		private void Page_Load(object sender, System.EventArgs e)
		{
			u.SetGridStyle (this.Datagrid1);
			DgNavigation1.SetTarget(Datagrid1,null,new BindDataDelegate(BindData));//BindData是你的数据邦定事件
			DgNavigation1.SetStyle(12, false);//10表示每页分10行，true表示无分页时自动隐藏

			if (!this.Page.IsPostBack)
			{
				BindData ();
			}
		}

		private void BindData ()
		{
			string cmd = "select xm,sfzh,(case xb when 1 then '男' else '女' end) as xb,ywjb,nl,sfjc,jcrq,(select b_nlz.nlz from b_nlz where b_nlz.id=dt_grxx.nlz) as nlz,(select b_xl.xl from b_xl where b_xl.id=dt_grxx.xl) as xl from dt_grxx where jgbh='" + this.jgbh + "'";
			//数据查询条件
			//姓名
			if (this.xm.Text != "")
				cmd += " and xm like '%" + this.xm.Text.Trim () + "%'";
			//身份证号
			if (this.sfzh.Text != "")
				cmd += " and sfzh like '%" + this.sfzh.Text.Trim () + "%'";
			
			//性别
			if (this.xb1.Checked == true)
			{
                cmd += " and xb = 1 ";
			}
			else if (this.xb2 .Checked == true)
			{
				cmd += " and xb = 2 ";
			}
			//学历
			if (this.xl1.Checked == true)
			{
                cmd += " and xl = 1 ";
			}
			else if (this.xl2.Checked == true)
			{
				cmd += " and xl = 2 ";
			}
			else if (this.xl3.Checked == true)
			{
				cmd += " and xl = 3 ";
			}
			else if (this.xl4.Checked == true)
			{
				cmd += " and xl = 4 ";
			}
			else if (this.xl5.Checked == true)
			{
				cmd += " and xl = 5 ";
			}
			else if (this.xl6.Checked == true)
			{
				cmd += " and xl = 6 ";
			}
			else if (this.xl7.Checked == true)
			{
				cmd += " and xl < 1 or xl > 6 ";
			}
			//年龄组
			if (this.nlz1.Checked == true)
			{
                cmd += " and nlz = 4 ";
			}
			else if (this.nlz2.Checked == true)
			{
				cmd += " and nlz = 5 ";
			}
			else if (this.nlz3.Checked == true)
			{
				cmd += " and nlz = 6 ";
			}
			//年龄段
			if (this.nld1.Checked == true)
			{
                cmd += " and nld = 1 ";
			}
			else if (this.nld2.Checked == true)
			{
				cmd += " and nld = 2 ";
			}
			else if (this.nld3.Checked == true)
			{
				cmd += " and nld = 3 ";
			}
			else if (this.nld4.Checked == true)
			{
				cmd += " and nld = 4 ";
			}
			else if (this.nld5.Checked == true)
			{
				cmd += " and nld = 5 ";
			}
			else if (this.nld6.Checked == true)
			{
				cmd += " and nld = 6 ";
			}
			else if (this.nld7.Checked == true)
			{
				cmd += " and nld = 7 ";
			}
			else if (this.nld8.Checked == true)
			{
				cmd += " and nld = 8 ";
			}
			
			DataSet ds = DBBase.ExecuteSql4Ds (cmd,"dt_grxx");
			this.Datagrid1.DataSource = ds.Tables["dt_grxx"].DefaultView;
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
			this.change.Click += new System.EventHandler(this.change_Click);
			this.reset.Click += new System.EventHandler(this.reset_Click);
			this.Load += new System.EventHandler(this.Page_Load);

		}
		#endregion

		private void change_Click(object sender, System.EventArgs e)
		{
			string regcode=utils.FindFirstCheckedItem(this.Datagrid1);
			if (regcode == "")
			{
				utils.Alert (this,"至少选择一项");
				return;
			}
			u.OpenIEWindowRight (this,"health_detail.aspx?sfzh=" + regcode,700,600);
		}

		private void query_Click(object sender, System.EventArgs e)
		{
			BindData ();
		}

		private void reset_Click(object sender, System.EventArgs e)
		{
			//清空查询条件
			this.xm.Text ="";
			this.sfzh.Text ="";
			this.xb1.Checked = false;
			this.xb2.Checked = false;
			this.nlz1.Checked = false;
			this.nlz2.Checked = false;
			this.nlz3.Checked = false;
			this.nld1.Checked = false;
			this.nld2.Checked = false;
			this.nld3.Checked = false;
			this.nld4.Checked = false;
			this.nld5.Checked = false;
			this.nld6.Checked = false;
			this.nld7.Checked = false;
			this.nld8.Checked = false;
			this.nld1.Checked = false;
			this.xl1.Checked = false;
			this.xl2.Checked = false;
			this.xl3.Checked = false;
			this.xl4.Checked = false;
			this.xl5.Checked = false;
			this.xl6.Checked = false;
			this.xl7.Checked = false;
			
			BindData ();
		}
	}
}
