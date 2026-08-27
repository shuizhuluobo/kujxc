namespace health.front
{
	using System;
	using System.Data;
	using System.Data.SqlClient;
	using System.Drawing;
	using System.Web;
	using System.Web.UI;
	using System.Web.UI.WebControls;
	using System.Web.UI.HtmlControls;
	using System.Web.Security;
	/// <summary>
	///		qlogon 的摘要说明。
	/// </summary>
	public class qlogon : System.Web.UI.UserControl
	{
		protected System.Web.UI.WebControls.TextBox pwd;
		protected System.Web.UI.WebControls.Panel Panel1;
		protected System.Web.UI.HtmlControls.HtmlTable tb1;
		protected System.Web.UI.HtmlControls.HtmlTable table1;
		protected System.Web.UI.HtmlControls.HtmlTable Table2;
		protected System.Web.UI.WebControls.LinkButton LinkButton1;
		public string memcode = "",xm="";
		protected System.Web.UI.WebControls.Label checkvalue;
		protected System.Web.UI.WebControls.ImageButton ImageButton1;
		protected System.Web.UI.WebControls.RadioButton RadioButton1;
		protected System.Web.UI.WebControls.RadioButton RadioButton2;
		protected System.Web.UI.WebControls.TextBox sfzh;

		private void Page_Load(object sender, System.EventArgs e)
		{
			if (!this.Page.IsPostBack)
			{
				
				this.tb1.Visible = false;
				this.table1.Visible = false;
				this.Table2.Visible = false;
				this.RadioButton1.Checked = true;
			}
			
			reload ();

		}
		private void reload ()
		{
			Control c = this.FindControl ("Panel1");
			c.Controls.Clear ();

			if (this.Session["MEMCODE"] != null)
			{
				this.table1.Visible = false;
				this.Table2.Visible = true;
				this.tb1.Visible = true;
				this.ImageButton1.Visible = false;
				xm = this.Session["MEMNAME"].ToString ().Trim ();
				memcode = this.Session["MEMCODE"].ToString ();
			}
			else
			{
				this.table1.Visible = true;
				this.Table2.Visible = false;
				this.tb1.Visible = false;
				this.ImageButton1.Visible = true;
				
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
		///		设计器支持所需的方法 - 不要使用代码编辑器
		///		修改此方法的内容。
		/// </summary>
		private void InitializeComponent()
		{
			this.ImageButton1.Click += new System.Web.UI.ImageClickEventHandler(this.ImageButton1_Click);
			this.LinkButton1.Click += new System.EventHandler(this.LinkButton1_Click);
			this.Load += new System.EventHandler(this.Page_Load);

		}
		#endregion

		private void LinkButton1_Click(object sender, System.EventArgs e)
		{
			if (this.Page.IsPostBack)
			{
				this.Session.Remove ("MEMCODE");
				this.Session.Remove ("MEMNAME");
				
				reload ();
				this.Response.Redirect("index.aspx");
			}
		}

		private void ImageButton1_Click(object sender, System.Web.UI.ImageClickEventArgs e)
		{
			if (this.Page.IsPostBack)
			{
				if (this.sfzh.Text.Trim () == "")
				{
					utils.Alert (this,"请输入证件号！");
					return;
				}
				if (this.pwd.Text.Trim () == "")
				{
					utils.Alert (this,"请输入口令！");
					return;
				}

				if (this.RadioButton1.Checked == true)
				{
					string judgecmd = "";

					judgecmd = "select pwd,xm from dt_grxx where sfzh='" + this.sfzh.Text.Trim () + "' and pwd='" + this.pwd.Text.Trim () + "'";
					SqlDataReader dr = DBBase.ExecuteSqlReader (judgecmd);
					if (dr.HasRows)
					{
						dr.Read ();

						this.Session.Add ("MEMCODE",this.sfzh.Text.Trim ());
						this.Session.Add ("MEMNAME",dr["xm"].ToString ());
						memcode = this.Session["MEMCODE"].ToString ();
						xm = this.Session["MEMNAME"].ToString ();

						dr.Close ();
					}
					else
					{
						dr.Close ();
						utils.Alert (this,"登录失败，请检查身份证、口令输入是否正确");
						return;
					}
					reload ();
				}
				else
				{
					try
					{
						string cmd = "select glymm,glyname,b.parent1,b.parent2,b.jgbh,b.jgmc,b.rank,b.ifend from CNC_glyb a,cnc_jgglb b where a.jgbh=b.jgbh and glydh='" + this.sfzh.Text.Trim () + "'";
						if (!DBBase.IsValuesExists(cmd))
						{
							utils.Alert (this,"管理员名或会员号码输入有误！");
							return;
						}
						else
						{
							SqlDataReader dr = DBBase.ExecuteSqlReader (cmd);
							if (dr.Read ())
							{
								if (dr.GetString(0) != FormsAuthentication.HashPasswordForStoringInConfigFile(this.sfzh.Text.Trim ()+this.pwd.Text.Trim (), "MD5"))
								{
									dr.Close ();
									utils.Alert (this,"错误的口令!");
									return;
								}
							}
							this.Session.Add ("GLYDH",this.sfzh.Text.Trim ());
							this.Session.Add ("GLYNAME",dr["glyname"].ToString ());
							this.Session.Add ("GLMEMCODE",dr["jgbh"].ToString ());
							this.Session.Add ("PARENT",dr["parent1"].ToString ());
							this.Session.Add ("JGMC",dr["jgmc"].ToString ());
							this.Session.Add ("RANK",dr["rank"].ToString ());
							this.Session.Add ("IFEND",dr["ifend"].ToString ());
							this.Session.Add ("SLJGBH",dr["parent2"].ToString ());
						
							dr.Close ();
						}
					}
					catch (Exception ee)
					{
						this.Response.Redirect ("/admin/Error.aspx?Err=错误的用户名或口令!");
					}
					this.Response.Redirect ("/admin/VerifySignIn.aspx");
				}
			}
		}
	}
}
