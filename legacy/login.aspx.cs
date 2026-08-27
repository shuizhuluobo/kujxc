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
using System.Web.Security;

using jxc.ascx;

namespace jxc
{
	/// <summary>
	/// login 的摘要说明。
	/// </summary>
	public class login : System.Web.UI.Page
	{
		//public commlogon Commlogon1;

		public commlogon Commlogon1;
		private void Page_Load(object sender, System.EventArgs e)
		{
			if (this.Page.IsPostBack)
			{
				try
				{
					string cmd = "select databasesname,servername,[user],pwd,databasesname2 from system_databases where number='" + this.Commlogon1.DropDownList1.SelectedItem.Value + "'";
					//string cmd = "select databasesname,servername,[user],pwd,databasesname2 from system_databases where 1=1 ";
					SqlDataReader dr = DBBase2.ExecuteSqlReader (cmd);
					dr.Read ();
						DBBase.strConn = "SERVER=" + dr[1].ToString () + ";DATABASE='" + dr[0].ToString () + "';UID='" + dr[2].ToString () + "';PWD='" + dr[3].ToString () + "'";
						DBBase3.strConn = "SERVER=" + dr[1].ToString () + ";DATABASE='" + dr[4].ToString () + "';UID='" + dr[2].ToString () + "';PWD='" + dr[3].ToString () + "'";
						this.Application.Add("strconn","SERVER=" + dr[1].ToString () + ";DATABASE='" + dr[0].ToString () + "';UID='" + dr[2].ToString () + "';PWD='" + dr[3].ToString () + "'");
					dr.Close ();

					cmd = "select glymm,dm,glyname,b.parent1,b.jgbh,b.jgmc,b.rank,b.ifend,a.rank as judger,groupid,roleid from CNC_glyb a,cnc_jgglb b where a.jgbh=b.jgbh and glydh='" + this.Commlogon1.UserId + "'";
					if (!DBBase.IsValuesExists(cmd))
					{
						utils.Alert (this,"管理员名或会员号码输入有误！");
						return;
					}
					else
					{
						dr = DBBase.ExecuteSqlReader (cmd);
						if (dr.Read ())
						{
							if (dr.GetString(0) != this.Commlogon1.Password)
							{
								dr.Close ();
								utils.Alert (this,"错误的口令!");
								return;
							}
						}
						this.Session.Add ("GLYDH",this.Commlogon1.UserId.Trim ());
						this.Session.Add ("GLYNAME",dr["glyname"].ToString ());
						this.Session.Add ("GLMEMCODE",dr["jgbh"].ToString ());
						this.Session.Add ("PARENT",dr["parent1"].ToString ());
						this.Session.Add ("JGMC",dr["jgmc"].ToString ());
						this.Session.Add ("RANK",dr["rank"].ToString ());
						this.Session.Add ("IFEND",dr["ifend"].ToString ());						
						this.Session.Add ("JUDGER",dr["judger"].ToString ());
						this.Session.Add ("GROUPNAME",dr["groupid"].ToString ());
						this.Session.Add ("ROLEID",dr["roleid"].ToString ());
                        string str=dr["groupid"].ToString ();
						if (str=="1")//除了店销售,财务外
						{
							this.Session.Add("ZJGMC",dr["jgmc"].ToString());//上级地区名称
							this.Session.Add ("JGMC",dr["dm"].ToString ());
						}
						else
						{
							if (str=="3")//除了店销售,财务外
							{
							   this.Session.Add("ZJGMC",dr["jgmc"].ToString());//上级地区名称
								this.Session.Add ("JGMC",dr["dm"].ToString ());
							}
							else
							{
								cmd = "select jgmc from cnc_jgglb where jgbh= '"+dr["parent1"].ToString ()+"'";
								dr.Close ();
								dr = DBBase.ExecuteSqlReader (cmd);
								if (dr.HasRows)
								{
									dr.Read();
									this.Session.Add("ZJGMC",dr["jgmc"].ToString());//上级地区名称
							
								}
								else
								{
									this.Session.Add("ZJGMC","总公司");
								}
							}
						}
						dr.Close();

					}
				}
				catch (Exception ee)
				{
					this.Response.Redirect ("admin/Error.aspx?Err=错误的用户名或口令!");
				}
				this.Response.Redirect ("admin/VerifySignIn.aspx");
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
