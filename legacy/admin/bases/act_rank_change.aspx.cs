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
	/// act_rank_change 的摘要说明。
	/// </summary>
	public class act_rank_change : System.Web.UI.Page
	{
		protected System.Web.UI.WebControls.DropDownList DropDownList1;
		protected System.Web.UI.WebControls.DropDownList DropDownList2;
		protected System.Web.UI.WebControls.DropDownList Dropdownlist3;
		protected System.Web.UI.WebControls.TextBox nofee;
		protected System.Web.UI.WebControls.TextBox count;
		protected System.Web.UI.WebControls.TextBox feeone;
		protected System.Web.UI.WebControls.Button save;
	
		private void Page_Load(object sender, System.EventArgs e)
		{
			if (!this.Page.IsPostBack)
			{
				
				utils.BindDropDownList ("select id,name from cnc_act",this.Dropdownlist3);
				SqlDataReader dr = DBBase.ExecuteSqlReader ("select * from act_rank_set where id=" + this.Request.QueryString["id"]);
				if (dr.Read ())
				{
					this.nofee.Text = dr["nofee"].ToString ();
					this.count.Text = dr["count"].ToString ();
					this.feeone.Text = dr["feeone"].ToString ();

					for (int i=0;i<this.DropDownList1.Items.Count;i++)
					{
						if (this.DropDownList1.Items[i].Value == dr["memtype"].ToString ())
						{
							this.DropDownList1.SelectedIndex = i;
							break;
						}
					}

					string cmd = "";
					if (dr["memtype"].ToString () == "0")
						cmd = "select listid,listname from rs_corsub where sortid=1";
					else
						cmd = "select listid,listname from rs_corsub where sortid=2";

					utils.BindDropDownList (cmd,this.DropDownList2);
						
					for (int i=0;i<this.DropDownList2.Items.Count;i++)
					{
						if (this.DropDownList2.Items[i].Value == dr["rankid"].ToString ())
						{
							this.DropDownList2.SelectedIndex = i;
							break;
						}
					}
					for (int i=0;i<this.Dropdownlist3.Items.Count;i++)
					{
						if (this.Dropdownlist3.Items[i].Value == dr["actid"].ToString ())
						{
							this.Dropdownlist3.SelectedIndex = i;
							break;
						}
					}
				}
				dr.Close ();
				this.DropDownList1.Enabled = false;
				this.DropDownList2.Enabled = false;
				this.Dropdownlist3.Enabled = false;


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
			Common cn = new Common ();
			if (this.nofee.Text.Trim ()  == "")
			{
				utils.Alert (this,"请输入免费条数");
				return;
			}
			else
			{
				if (!cn.IsNum(this.nofee.Text.Trim ()))
				{
					utils.Alert (this,"免费条数请输入数字");
					return;
				}
			}
			if (this.count.Text.Trim () == "")
			{
				utils.Alert (this,"请输入查询条数");
				return;
			}
			else
			{
				if (!cn.IsNum(this.count.Text.Trim ()))
				{
					utils.Alert (this,"查询条数请输入数字");
					return;
				}
			}
			if (this.feeone.Text.Trim () == "")
			{
				utils.Alert (this,"请输入每条费用");
				return;
			}
			else
			{
				if (!cn.IsNumAndDot(this.nofee.Text.Trim ()))
				{
					utils.Alert (this,"每条费用请输入数字");
					return;
				}
			}
			string cmd = "update act_rank_set set nofee=" + this.nofee.Text.Trim () + ",count=" + this.count.Text.Trim () + ",feeone=" + this.feeone.Text.Trim () + " where id=" + this.Request.QueryString["id"];
			try
			{
				DBBase.ExecuteSql (cmd);
				utils.Alert (this,"保存成功");
			}
			catch
			{
				utils.Alert (this,"保存失败，请与管理员联系");
				return;
			}
		}
	}
}
