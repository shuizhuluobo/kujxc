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

namespace jxc.admin.Info
{
	/// <summary>
	/// Class_add 的摘要说明。
	/// </summary>
	public class Class_add : jxc.UsrControl.UserPage
	{
		protected System.Web.UI.WebControls.TextBox parentid;
		protected System.Web.UI.WebControls.TextBox des;
		protected System.Web.UI.WebControls.Button save;
		protected System.Web.UI.WebControls.RadioButtonList RadioButtonList1;
		protected System.Web.UI.WebControls.TextBox ranks;
		protected System.Web.UI.WebControls.RadioButtonList Radiobuttonlist2;
	
		Common cn = new Common ();
		private void Page_Load(object sender, System.EventArgs e)
		{
			if (!this.Page.IsPostBack)
			{
				string parentid = this.Request.QueryString["id"];
				if (!cn.IsNum(parentid))
				{
					this.Response.Write ("非法参数");
					return;
				}
				int ranks = 0;
				SqlDataReader dr = DBBase.ExecuteSqlReader ("select rank,ifend from cnc_info where id=" + parentid);
				if (dr.Read ())
				{
					if (dr[1].ToString () == "1")
					{
						utils.Alert (this,"末枝不能再增加类别了");
						this.save.Enabled = false;
						dr.Close ();
						return;
					}
					ranks = Convert.ToInt32(dr[0].ToString ()) + 1;
				}
				dr.Close ();
				this.ranks.Text = ranks.ToString ();
				this.parentid.Text = parentid;
				save.Attributes.Add("onclick","return confirm('您确认是否末枝设置正确吗？')");

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
			this.Load += new System.EventHandler(this.Page_Load);

		}
		#endregion

		private void save_Click(object sender, System.EventArgs e)
		{
			if (this.des.Text.Trim () == "")
			{
				utils.Alert (this,"咨询类别名称不能为空");
				return;
			}
			string cmd = "insert into cnc_info (des,parentid,rank,ifend,ifsing)values('" + this.des.Text.Trim () + "'," + this.parentid.Text.Trim () + "," + this.ranks.Text.Trim () + "," + this.RadioButtonList1.SelectedItem.Value + "," + this.Radiobuttonlist2.SelectedItem.Value + ")"; 
			try
			{
				DBBase.ExecuteSql (cmd);
				utils.Alert (this,"增加咨讯类别成功");
			}
			catch
			{
				utils.Alert (this,"增加咨讯类别失败，请与管理员联系");
			}
		}
	}
}
