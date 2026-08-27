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
using   MSScriptControl; 
namespace jxc.admin.bases
{
	/// <summary>
	/// dqcw_add 的摘要说明。
	/// </summary>
	public class dqcw_edit :jxc.UsrControl.UserPage//System.Web.UI.Page// 
	{
		protected System.Web.UI.WebControls.DropDownList DropDownListlx;
		protected System.Web.UI.WebControls.TextBox czy;
		protected System.Web.UI.WebControls.TextBox Textbox2;
		protected System.Web.UI.WebControls.TextBox Textbox4;
		protected System.Web.UI.WebControls.TextBox Textbox5;
		protected System.Web.UI.WebControls.DropDownList DropDownList1;
		protected System.Web.UI.WebControls.TextBox Textbox1;
		protected System.Web.UI.WebControls.TextBox Textbox3;
		protected System.Web.UI.WebControls.TextBox Textbox6;
		protected System.Web.UI.WebControls.TextBox zhaiyao;
		protected System.Web.UI.WebControls.TextBox TextBox7;
		protected System.Web.UI.WebControls.TextBox TextBox8;
		protected System.Web.UI.WebControls.Button save;
	
		private void Page_Load(object sender, System.EventArgs e)
		{
			if (!this.Page.IsPostBack)
			{
				string id = this.Request.QueryString["id"];
				if (id != string.Empty && id != null)
				{
					string cmd = "select *,(总金额-预收定金) as 未回款 from 地区财务 where cwid='" + id + "'";
					SqlDataReader dr = DBBase.ExecuteSqlReader (cmd);
					if (dr.Read ())
					{
						czy.Text=dr["xsid"].ToString();
						this.Textbox2.Text = dr["总金额"].ToString ();
						this.zhaiyao.Text = dr["预收定金"].ToString ();
						this.Textbox3.Text = dr["未回款"].ToString ();
						this.Textbox4.Text = dr["未回款"].ToString (); 
						//this.czy.Text = dr["操作员"].ToString ();
						this.Textbox1.Text = dr["客户"].ToString ();
						this.TextBox7.Text=dr["店名"].ToString();
						this.TextBox8.Text=dr["地区"].ToString();
					}
					dr.Close ();

					string	cmd2 = "SELECT 是否结算 FROM 地区财务 where cwid='"+id.ToString()+"'";
					dr = DBBase.ExecuteSqlReader (cmd2);
					if (dr.Read ())
					{
						if (dr["是否结算"].ToString()!="否")
						{
							utils.Alert (this,"该销售单已经结算!");
							dr.Close();
                            JSUtil.Close(this);
							return;
						}
					}
					dr.Close();
//					if (this.roleid.ToString()=="6") 
//						this.Textbox3.ReadOnly=false;
				}
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
			this.save.Click += new System.EventHandler(this.save_Click);
			this.ID = "dqcw_edit";
			this.Load += new System.EventHandler(this.Page_Load);
			this.PreRender += new System.EventHandler(this.dqcw_edit_PreRender);

		}
		#endregion

		private void save_Click(object sender, System.EventArgs e)
		{

			if (Convert.ToDouble(this.Textbox4.Text)<Convert.ToDouble(this.Textbox3.Text))
			{
			utils.Alert (this,"实收金额不能大于尚未收回款!");
				return;
			}
			string[] cmd=new string[2];
			

		    string id = utils.Getbm("cnzid","地区出纳",string.Format("{0:yyyyMMdd}",DateTime.Now),4);
			if (Convert.ToDouble(this.Textbox4.Text)-Convert.ToDouble(this.Textbox3.Text)==0) 
			cmd[0]="update 地区财务 set 预收定金=预收定金+"+this.Textbox3.Text+",是否结算='已结算' where cwid='"+this.Request.QueryString["id"].ToString()+"'";
			else
            cmd[0]="update 地区财务 set 预收定金=预收定金+"+this.Textbox3.Text+" where cwid='"+this.Request.QueryString["id"].ToString()+"'";
			cmd[1]="insert into 地区出纳(cnzid,日期,地区,摘要,借方,贷方,余额,其他)values('";
			cmd[1]+=id+"','"+string.Format("{0:yyyy-MM-dd}",DateTime.Now)+"','"+this.TextBox8.Text.ToString()+"','"+this.TextBox7.Text+"尚未收回款"+czy.Text.ToString()+"号',"+Textbox3.Text;
			cmd[1]+=",0,"+Textbox3.Text+",'"+Textbox5.Text+"')";

//sql123="update dqcw set money_in="&newmoney&",qt='"&qt&"',jiezhang=1 where xsid="&xsid&""
//sql124="insert into chuna(sj,unit,zhaiyao,jf,df,yu,qt) values('"&date()&"','"&dept&"','尚未收回款<br>("&xsid&"号)',"&cdbl(request.Form("js"))&",0,"&cdbl(request.Form("js"))&",'尚未收回款<br>(销售店名："&n&"<br>销售单号："&xsid&")')"

			try
			{
				DBBase.ExecuteSqls (cmd);
				utils.Alert (this,"保存成功");
				JSUtil.Close(this);
			}
			catch
			{
				utils.Alert (this,"保存失败");
			}
		}
		private void dqcw_edit_PreRender(object sender, System.EventArgs e)
		{
			this.RegisterHiddenField("HiddenCommon",Request["HiddenCommon"]);
		}

	}
	
}
