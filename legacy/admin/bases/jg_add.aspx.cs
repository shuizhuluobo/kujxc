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
using System.Web.Security;

namespace jxc.admin.bases
{
	/// <summary>
	/// jg_add 的摘要说明。
	/// </summary>
	public class jg_add : jxc.UsrControl.UserPage
	{
		protected System.Web.UI.WebControls.TextBox parent1;
		protected System.Web.UI.WebControls.TextBox addr;
		protected System.Web.UI.WebControls.TextBox lxr;
		protected System.Web.UI.WebControls.TextBox lxdh;
		protected System.Web.UI.WebControls.DropDownList DropDownListlx;
		protected System.Web.UI.WebControls.RadioButtonList RadioButtonList1;
		protected System.Web.UI.WebControls.TextBox jc;
		protected System.Web.UI.WebControls.TextBox jgbhs;
		protected System.Web.UI.WebControls.TextBox jgmcs;
		protected System.Web.UI.WebControls.Button save;
	
		private void Page_Load(object sender, System.EventArgs e)
		{
			if (!this.Page.IsPostBack)
			{
				this.parent1.Text = this.Request.QueryString["id"];
				this.jgbhs.Text = this.parent1.Text;
				utils.BindDropDownList("select groupid,des from cnc_qxgroup order by sortid asc",this.DropDownListlx);
				int ranks = Convert.ToInt32(this.rank);
				for (int i=0;i<this.DropDownListlx.Items.Count;i++)
				{
					if (this.DropDownListlx.Items[i].Value==(ranks+1).ToString())
					{
						this.DropDownListlx.SelectedIndex=i;
						break;
					}
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
			this.Load += new System.EventHandler(this.Page_Load);

		}
		#endregion

		private void save_Click(object sender, System.EventArgs e)
		{
			if (this.jgbhs.Text.Trim () == "")
			{
				utils.Alert (this,"机构编码不能为空");
				return;
			}
			if (this.jgbhs.Text.Trim () == this.parent1.Text.Trim ())
			{
				utils.Alert (this,"请修改机构编号");
				return;
			}
			if (this.jgmcs.Text.Trim () == "")
			{
				utils.Alert (this,"机构名称不能为空");
				return;
			}
			
			if (this.DropDownListlx.SelectedIndex <= 0)
			{
				utils.Alert (this,"请选择机构级别");
				return;
			}
			
			if (DBBase.IsValuesExists ("select 1 from cnc_jgglb where jgbh='" + this.jgbhs.Text.Trim () + "'"))
			{
				utils.Alert (this,"机构编码重复");
				return;
			}
			if (DBBase.IsValuesExists("select 1 from cnc_jgglb where jgmc='" + this.jgmcs.Text.Trim () + "'"))
			{
				utils.Alert (this,"机构名称重复");
				
				return;
			}
			
			string [] cmds = new string [1];
			cmds[0] = "insert into cnc_jgglb (jgbh,jgmc,parent1,rank,addr,lxr,lxdh,ifend,jc) values('" + 
				this.jgbhs.Text.Trim () + "','" + this.jgmcs.Text.Trim () + "','" + this.parent1.Text.Trim () + "',"
				  + this.DropDownListlx.SelectedItem.Value + ",'" + 
				this.addr.Text.Trim () + "','" + this.lxr.Text.Trim () + "','" + this.lxdh.Text.Trim () + "'," + this.RadioButtonList1.SelectedItem.Value + ",'" + this.jc.Text.Trim () + "')";

			//cmds[1] = "insert into cnc_glyb (glydh,glymm,jgbh,groupid,glyname,ifuse,rank) values('" 
			//	+ this.jgbhs.Text.Trim () + "','" + FormsAuthentication.HashPasswordForStoringInConfigFile(this.jgbhs.Text.Trim () + this.jgbhs.Text.Trim (),"MD5") + "','" + this.jgbhs.Text.Trim () + "',1,'" + this.jgmc + "',1,'600001')";
		//	cmds[2] = "insert into cnc_glyb_child select '" + this.jgbhs.Text.Trim () + "', b.id,b.des,b.parentid,b.qxcd,b.rank,b.imgpath,b.sortid  from cnc_qxgroup_child a,cnc_qxcdb b where a.groupid=" + this.DropDownListlx.SelectedItem.Value + " and a.id=b.id";
			try
			{
				DBBase.ExecuteSqls (cmds);
				utils.Alert (this,"保存成功");
			}
			catch(Exception ee)
			{
				utils.Alert (this,"存盘失败,系统已恢复到保存前的状态" + ee.Message);
				return;
			}
		}
	}
}
