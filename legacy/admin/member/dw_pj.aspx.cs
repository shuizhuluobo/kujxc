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

namespace health.admin.member
{
	/// <summary>
	/// dw_pj 的摘要说明。
	/// </summary>
	public class dw_pj : System.Web.UI.Page
	{
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
		protected System.Web.UI.WebControls.RadioButton nld1;
		protected System.Web.UI.WebControls.RadioButton nld2;
		protected System.Web.UI.WebControls.RadioButton nld3;
		protected System.Web.UI.WebControls.RadioButton nld4;
		protected System.Web.UI.WebControls.RadioButton nld5;
		protected System.Web.UI.WebControls.RadioButton nld6;
		protected System.Web.UI.WebControls.RadioButton nld7;
		protected System.Web.UI.WebControls.RadioButton nld8;
		protected System.Web.UI.WebControls.Button query;
		protected System.Web.UI.WebControls.Button reset;
		protected System.Web.UI.HtmlControls.HtmlGenericControl outvalue;
	
		private void Page_Load(object sender, System.EventArgs e)
		{
			// 在此处放置用户代码以初始化页面
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
			this.reset.Click += new System.EventHandler(this.reset_Click);
			this.Load += new System.EventHandler(this.Page_Load);

		}
		#endregion

		private void query_Click(object sender, System.EventArgs e)
		{
			
			int sum=0,yx=0,hg=0,lh=0,bhg=0,qt=0;
			string cmd = "";

			cmd = MakeCmd ("select b.dj,a.sfzh from dt_grxx a,dt_pj_aa b where a.sfzh=b.sfzh");
			DataSet ds = DBBase.ExecuteSql4Ds (cmd,"dt_grxx");

			cmd = MakeCmd ("select b.dj,a.sfzh from dt_grxx a,dt_pj_ab b where a.sfzh=b.sfzh");
			DBBase.FillDataSet (cmd,"dt_grxx",ref ds);

			cmd = MakeCmd ("select b.dj,a.sfzh from dt_grxx a,dt_pj_o b where a.sfzh=b.sfzh");
			DBBase.FillDataSet (cmd,"dt_grxx",ref ds);

			sum = ds.Tables["dt_grxx"].Rows.Count;
			string dj = string.Empty;
			for (int i=0;i<sum;i++)
			{
				dj = ds.Tables["dt_grxx"].Rows[i][0].ToString();
				if (dj == "1")
					bhg += 1;
				else if (dj == "2")
					hg += 1;
				else if (dj == "3")
					lh += 1;
				else if (dj == "4")
					yx += 1;
				else qt += 1;
			}

			decimal bl;
			
			string table = "<table cellpadding=\"0\" cellspacing=\"1\" border=\"1\" width=\"100%\" class=\"title3\" align=\"center\" style=\"BORDER-COLLAPSE: collapse\" borderColor=#0066cc>";
			table += "<tr><td>等级</td><td>人数</td><td>比例</td></tr>";
			bl = decimal.Round(yx*100/sum,2);
			table += "<tr><td>优秀</td><td>" + yx.ToString () + "</td><td>" + bl.ToString() + "%</td></tr>";
			bl = decimal.Round(lh*100/sum,2);
			table += "<tr><td>良好</td><td>" + lh.ToString () + "</td><td>" + bl.ToString() + "%</td></tr>";
			bl = decimal.Round(hg*100/sum,2);
			table += "<tr><td>及格</td><td>" + hg.ToString () + "</td><td>" + bl.ToString() + "%</td></tr>";
			bl = decimal.Round(bhg*100/sum,2);
			
			table += "<tr><td>不及格</td><td>" + bhg.ToString () + "</td><td>" + bl.ToString() + "%</td></tr>";
			table += "<tr><td>合计</td><td>" + sum.ToString () + "</td><td>100%</td></tr></table>";

			this.outvalue.InnerHtml = table;
		}

		private string MakeCmd(string begincmd)
		{
			string cmd = begincmd;
			
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
			return cmd;
		}

		private void reset_Click(object sender, System.EventArgs e)
		{
			//清空查询条件
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
		}
	}


}
