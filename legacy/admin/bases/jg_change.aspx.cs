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
	/// jg_change 的摘要说明。
	/// </summary>
	public class jg_change : System.Web.UI.Page
	{
		protected System.Web.UI.WebControls.TextBox jgbh;
		protected System.Web.UI.WebControls.TextBox jgmc;
		protected System.Web.UI.WebControls.TextBox parent1;
		protected System.Web.UI.WebControls.TextBox parent2;
		protected System.Web.UI.WebControls.DropDownList DropDownListlx;
		protected System.Web.UI.WebControls.TextBox addr;
		protected System.Web.UI.WebControls.TextBox lxr;
		protected System.Web.UI.WebControls.TextBox lxdh;
		protected System.Web.UI.WebControls.RadioButtonList RadioButtonList1;
		protected System.Web.UI.WebControls.TextBox jc;
		protected System.Web.UI.WebControls.Button save;
	
		private void Page_Load(object sender, System.EventArgs e)
		{
			if (!this.Page.IsPostBack)
			{
				utils.BindDropDownList("select groupid,des from cnc_qxgroup",this.DropDownListlx);
			

				string jgbh=this.Request.QueryString["jgbh"];
				SqlDataReader dr = DBBase.ExecuteSqlReader ("select * from cnc_jgglb where jgbh='" + jgbh + "'");
				if (dr.Read ())
				{
					this.jgbh.Text = dr["jgbh"].ToString ();
					this.jgmc.Text = dr["jgmc"].ToString ();
					this.parent1.Text = dr["parent1"].ToString ();
				//	this.parent2.Text = dr["parent2"].ToString ();
					this.addr.Text = dr["addr"].ToString ();
					this.lxr.Text = dr["lxr"].ToString ();
					this.lxdh.Text = dr["lxdh"].ToString ();
					this.jc.Text = dr["jc"].ToString ();

					for (int i=0;i<this.DropDownListlx.Items.Count;i++)
					{
						if (this.DropDownListlx.Items[i].Value == dr["rank"].ToString ())
						{
							this.DropDownListlx.SelectedIndex = i;
							break;
						}
					}
					for(int i=0;i<this.RadioButtonList1.Items.Count;i++)
					{
						if (this.RadioButtonList1.Items[i].Value == dr["ifend"].ToString ())
						{
							this.RadioButtonList1.SelectedIndex = i;
							break;
						}
					}
					
				}
				dr.Close ();

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
			if (this.jgbh.Text.Trim () == "")
			{
				utils.Alert (this,"机构编码不能为空");
				return;
			}
			if (this.jgmc.Text.Trim () == "")
			{
				utils.Alert (this,"机构名称不能为空");
				return;
			}
			if (this.DropDownListlx.SelectedIndex <= 0)
			{
				utils.Alert (this,"请选择机构级别");
				return;
			}

			string cmd = "update cnc_jgglb set jgmc='" + this.jgmc.Text.Trim () 
				+ "',rank=" + this.DropDownListlx.SelectedItem.Value + ",lxr='" + this.lxr.Text.Trim () 
				+ "',lxdh='" + this.lxdh.Text.Trim () + "',addr='" + this.addr.Text.Trim ()
				+ "',parent1='" + this.parent1.Text.Trim () 
				+ "',ifend=" + this.RadioButtonList1.SelectedItem.Value
				+ ",jc='" + this.jc.Text.Trim ()
				+ "' where jgbh='" + this.Request.QueryString["jgbh"] + "'";

			try
			{
				DBBase.ExecuteSql (cmd);
				utils.Alert (this,"保存成功");
			}
			catch(Exception ee)
			{
				utils.Alert (this,"存盘失败,系统已恢复到保存前的状态" + ee.Message);
			}

		}
	}
}
