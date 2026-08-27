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

namespace jxc.admin
{
	/// <summary>
	/// general_query 的摘要说明。
	/// </summary>
	public class general_query : jxc.UsrControl.UserPage
	{
		protected System.Web.UI.WebControls.TextBox begin;
		protected System.Web.UI.WebControls.TextBox enddate;
		protected System.Web.UI.WebControls.Label Label1;
		protected System.Web.UI.WebControls.Button Button1;
	
		private void Page_Load(object sender, System.EventArgs e)
		{
			if (!this.Page.IsPostBack)
			{
				
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
			this.Button1.Click += new System.EventHandler(this.Button1_Click);
			this.Load += new System.EventHandler(this.Page_Load);

		}
		#endregion

		private void Button1_Click(object sender, System.EventArgs e)
		{
			string table = "";
			SqlDataReader dr = null;
			decimal per_fee=0,en_fee=0;
			int gt=0,sy=0,nz=0,wz=0,qt=0;

			table += "<table id=\"Datagrid1\" cellpadding=\"0\" cellspacing=\"1\" border=\"1\" width=\"100%\" class=\"title3\" align=\"center\">";
			table += "<tr><td>单位名称</td><td>个人收费额</td><td>个人个数</td><td>企业收费额</td><td>企业个数</td><td>内资</td><td>内资个数</td><td>外资</td><td>外资个数</td><td>私营</td><td>私营个数</td><td>个体</td><td>个体个数</td><td>其他</td><td>其他个数</td></tr>";
			DataSet ds = DBBase.ExecuteSql4Ds("select jgbh,jgmc from cnc_jgglb order by sortid asc","cnc_jgglb");
			for (int i=0;i<ds.Tables["cnc_jgglb"].Rows.Count;i++)
			{
				table += "<tr><td>" + ds.Tables["cnc_jgglb"].Rows[i][1] + "</td>";
				string cmd = "select isnull(sum(a.fee),0),count(*) from pay_record a,cnc_personal b where a.memcode=b.memcode and memtype=0 and code=100 and b.unitid='" + ds.Tables[0].Rows[i][0].ToString () + "'";
				if (this.begin.Text.Trim () != "")
					cmd += " and feetime>='" + this.begin.Text.Trim () + "'";
				if (this.enddate.Text.Trim () != "")
					cmd += " and feetime<='" + this.enddate.Text.Trim () + "'";

				dr = DBBase.ExecuteSqlReader (cmd);
				dr.Read ();
				table += "<td>" + dr[0].ToString () + "</td>";
				table += "<td>" + dr[1].ToString () + "</td>";
				dr.Close ();
					
				//table += "<td>" + Convert.ToString (per_fee) + "</td>";
				cmd = "select isnull(sum(a.fee),0),count(*) from pay_record a,GSGSJIN_BASIS02 b where a.memcode=b.memcode and memtype=1 and code=200 and field105='" + ds.Tables[0].Rows[i][0].ToString () + "'";
				if (this.begin.Text.Trim () != "")
					cmd += " and feetime>='" + this.begin.Text.Trim () + "'";
				if (this.enddate.Text.Trim () != "")
					cmd += " and feetime<='" + this.enddate.Text.Trim () + "'";

				dr = DBBase.ExecuteSqlReader (cmd);
				dr.Read ();
				en_fee = Convert.ToDecimal (dr[0].ToString ());
				table += "<td>" + Convert.ToString (en_fee) + "</td>";
				table += "<td>" + dr[1].ToString () + "</td>";
				dr.Close ();


				dr = DBBase.ExecuteSqlReader ("select listid from rs_corsub where sortid=5 order by listid asc");
				while (dr.Read ())
				{
					string cmd2 = "";
					if (dr[0].ToString () == "其他")
						cmd2= "select isnull(sum(a.fee),0),count(*) from pay_record a,GSGSJIN_BASIS02 b where a.memcode=b.memcode and a.code=200 and b.entertype not in ('50001','50002','50003','50004') and field105='" + ds.Tables[0].Rows[i][0].ToString () + "'";
					else
						cmd2 = "select isnull(sum(a.fee),0),count(*) from pay_record a,GSGSJIN_BASIS02 b where a.memcode=b.memcode and a.code=200 and b.entertype='" + dr[0].ToString () + "' and field105='" + ds.Tables[0].Rows[i][0].ToString () + "'";
					if (this.begin.Text.Trim () != "")
						cmd2 += " and feetime>='" + this.begin.Text.Trim () + "'";
					if (this.enddate.Text.Trim () != "")
						cmd2 += " and feetime<='" + this.enddate.Text.Trim () + "'";
					SqlDataReader dr2 = DBBase.ExecuteSqlReader (cmd2);
					dr2.Read ();
					table += "<td>" +dr2[0].ToString () + "</td>";
					table += "<td>" +dr2[1].ToString () + "</td>";
					dr2.Close ();
				}
				dr.Close ();
				table += "</tr>";

				this.Label1.Text = table;	
			}
			
		}
	}
}
