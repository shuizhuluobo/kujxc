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

namespace jxc.admin.bases
{
	/// <summary>
	/// role_child_view 的摘要说明。
	/// </summary>
	public class role_child_view : System.Web.UI.Page
	{
		protected System.Web.UI.WebControls.Label output;
	
		private void Page_Load(object sender, System.EventArgs e)
		{
			if (!this.Page.IsPostBack)
			{
				string table = "";
				string cmd0 = "select distinct pageid,(SELECT DES FROM CNC_QXCDB WHERE ID=PAGEID) as pagename from cnc_role_child where roleid=" + this.Request.QueryString["id"];
				SqlDataReader dr = DBBase.ExecuteSqlReader (cmd0);
				if (dr.HasRows)
				{
					while (dr.Read ())
					{
						table += "<p class=title3>" + dr[1].ToString () + "&nbsp;&nbsp;";
						string cmd = "select ids,idname,ifpower from cnc_role_child where roleid=" + this.Request.QueryString["id"] + " and pageid=" + dr[0].ToString ();
						SqlDataReader dr2 = DBBase.ExecuteSqlReader (cmd);
						while (dr2.Read ())
						{
							table += "<INPUT type=\"checkbox\" name=" + dr2["ids"].ToString ();
							if (dr2["ifpower"].ToString () == "1")
							{
								table += " CHECKED >";
							}
							table += dr2["idname"].ToString ();
							table += "&nbsp;";
						}
						dr2.Close ();
						table += "</p>";
					}
					
				}
				dr.Close ();

				this.output.Text = table;
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
