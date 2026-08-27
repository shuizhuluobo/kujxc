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
	/// view_judge 的摘要说明。
	/// </summary>
	public class view_judge : System.Web.UI.Page
	{
		protected System.Web.UI.WebControls.Label fbsj;
		protected System.Web.UI.WebControls.Label bt;
		protected System.Web.UI.HtmlControls.HtmlGenericControl yy;
		protected System.Web.UI.WebControls.TextBox nr;
		protected System.Web.UI.HtmlControls.HtmlGenericControl splb;
	
		private void Page_Load(object sender, System.EventArgs e)
		{
			if (!this.Page.IsPostBack)
			{
				string cmd = "select bh,bt,zz,nr,fbsj,(select jgmc from cnc_jgglb where cnc_jgglb.jgbh=t_master.jgbh) as jgmc from t_master where bh=" + this.Request.QueryString["id"];
				SqlDataReader dr = DBBase.ExecuteSqlReader (cmd);
				if (dr.Read ())
				{
					this.fbsj.Text = dr["fbsj"].ToString ();
					this.bt.Text = dr["bt"].ToString ();
					this.nr.Text = dr["nr"].ToString ();
				}
				dr.Close ();

				//获取语音列表
				cmd = "select yyname,sqyy from t_master_yy where bh=" + this.Request.QueryString["id"];
				dr = DBBase.ExecuteSqlReader (cmd);
				while (dr.Read ())
				{
					this.yy.InnerHtml += "<a href=" + dr[1].ToString () + " target=_blank>" + dr[0].ToString () + "</a>  ";
				}
				dr.Close ();

				//获取审批意见列表
				string table = "<table style=\"BORDER-COLLAPSE: collapse\" borderColor=#0066cc cellSpacing=2 cellPadding=1 width=100% border=1 class=title3>";
				table += "<tr><td>审批环节</td><td>审批人</td><td>审批结果</td><td>审批时间</td><td>详细</td><td>审批附件</td></tr>";
				cmd = "select id,bh,(select listname from cnc_glyb,rs_corsub where cnc_glyb.glydh=t_master_child.glydh and cnc_glyb.rank=rs_corsub.listid) + '审批' as spr,result,(select glyname from cnc_glyb where cnc_glyb.glydh=t_master_child.glydh) as glyname,judgedate from t_master_child where bh=" + this.Request.QueryString["id"];
				dr = DBBase.ExecuteSqlReader (cmd);
				while (dr.Read ())
				{
					table += "<tr><td>" + dr["spr"].ToString () + "</td><td>" + dr["glyname"].ToString () + "</td><td>" + dr["result"].ToString () + "</td><td>" + dr["judgedate"].ToString () + "</td><td><a href=sp_detail.aspx?id=" + dr["id"].ToString () + " target=_blank>审批内容浏览</a></td><td>";
					string cmd2 = "select yyname,spyy from t_master_child_yy where parentid=" + dr["id"].ToString ();
					SqlDataReader dr2 = DBBase.ExecuteSqlReader (cmd2);
					string href = "";
					while (dr2.Read())
					{
						href += "<a href=" + dr2["spyy"].ToString () + " target=_blank>" + dr2["yyname"].ToString () + "</a> ";
					}
					dr2.Close ();
					table += href + "</td></tr>";
				}

				table += "</table>";
				dr.Close ();

				this.splb.InnerHtml = table;
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
			this.Load += new System.EventHandler(this.Page_Load);

		}
		#endregion
	}
}
