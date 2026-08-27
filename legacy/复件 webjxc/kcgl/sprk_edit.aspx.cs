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
	/// sprk_add 的摘要说明。
	/// </summary>
	public class sprk_edit :jxc.UsrControl.UserPage//System.Web.UI.Page// 
	{
		protected System.Web.UI.WebControls.DropDownList DropDownListlx;
		protected System.Web.UI.WebControls.TextBox Textbox1;
		protected System.Web.UI.WebControls.TextBox rkrq;
		protected System.Web.UI.WebControls.TextBox cpname;
		protected System.Web.UI.WebControls.TextBox cpid;
		protected System.Web.UI.WebControls.TextBox czy;
		protected System.Web.UI.WebControls.TextBox rksl;
		protected System.Web.UI.WebControls.Button save;
	
		private void Page_Load(object sender, System.EventArgs e)
		{
						CodeSearch();
			if (!this.Page.IsPostBack)
			{
//				utils.BindDropDownList("select dept,dept from dept where d4=1",this.DropDownListlx);
				utils.BindDropDownList("select jgmc,jgmc from cnc_jgglb where parent1='01'",this.DropDownListlx);
				rkrq.Text=string.Format("{0:yyyy-MM-dd}",DateTime.Now);
				this.czy.Text=this.glyname.ToString();
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
			this.PreRender += new System.EventHandler(this.sprk_edit_PreRender);

		}
		#endregion

		private void save_Click(object sender, System.EventArgs e)
		{
			//string id = this.Request.QueryString["cpid"];
			if (Convert.ToDouble(this.rksl.Text)<=0) 
			{
                utils.Alert (this,"入库数量不能为0");
				return;
			}
			if (DropDownListlx.SelectedIndex==0) 
			{
				utils.Alert (this,"仓库不能为空");
				return;
			}
			if (cpname.Text=="") 
			{
				utils.Alert (this,"产品不能为空");
				return;
			}
				string[] cmd=new string[2];
				string rkid = utils.Getbm("rkid","入库单",string.Format("{0:yyyyMMdd}",DateTime.Now),4);
				cmd[0] = "INSERT INTO [入库单]([rkid], [产品名称], [cpid], [仓库名称], [操作员], [入库数量],[剩余数量], [入库单价],[入库日期], [到货确认], [库保确认]) VALUES(";
				cmd[0] += "'" + rkid + "','" + this.cpname.Text.Trim () + "','" + this.cpid.Text.Trim () + "','" + this.DropDownListlx.SelectedItem.Text + "',";
				cmd[0] += "'" + this.glyname.ToString() + "'," + this.rksl.Text.Trim() + ","+ this.rksl.Text.Trim() + "," + this.Textbox1.Text.Trim()  + ",'"+rkrq.Text+"','是','否')";
			   // string zzid = utils.Getbm("zzid","地区总账",string.Format("{0:yyyyMM}",DateTime.Now),6);
			string zzid=System.Guid.NewGuid().ToString();
			    cmd[1]="insert into 地区总账(zzid,日期,地区,摘要,借方,贷方,余额,其他,分类,单据号)values('"+zzid+"','"+DateTime.Now.ToString("yyyy-MM-dd")+"','"+this.DropDownListlx.SelectedValue.ToString()+"','从总公司进货(产品名称："+this.cpname.Text.Trim () +")',"+Convert.ToDouble(this.rksl.Text)*Convert.ToDouble(this.Textbox1.Text)+",0,"+Convert.ToDouble(this.rksl.Text)*Convert.ToDouble(this.Textbox1.Text)+",'总库保下拨','公司进货','"+rkid+"')";
			
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
		/// <summary>
		/// 画面中code的检索画面启动返回等处理
		/// </summary>
		private void CodeSearch()
		{
			string[] strs;
			if(!Page.IsPostBack)
			{
				string strScript;

				strScript = JSUtil.GetOpenDialogScript("产品选择","../CommonSearch/spselect.aspx",380,400,"sprk_edit");

				this.cpname.Attributes.Add("OnDblClick",strScript);

			}
			if(Session["Ret_Search_Value"]!=null)
			{
				if (Request["HiddenCommon"]!=null && Request["HiddenCommon"]!="")
				{
					switch(Request["HiddenCommon"].ToString())
					{
						case"产品选择":
							strs = Session["Ret_Search_Value"].ToString().Split(',');
							if (this.cpname.Text.ToString()!="")
							{
								this.cpname.Text = strs[1];
								this.cpid.Text = strs[0];
								this.Textbox1.Text=strs[2];
							}
							else
							{
								this.cpname.Text =strs[1];
								this.cpid.Text =strs[0];
								this.Textbox1.Text=strs[2];

							}
							this.ViewState["KindCommon"]=null;
							Session["Ret_Search_Value"]=null;
							break;
					}
				}
			}
			JSUtil.ExecuteBlock(this,"parent.frames[\"sprk_edit\"].sprk_edit.HiddenCommon.value=\"\"");

		}

		private void sprk_edit_PreRender(object sender, System.EventArgs e)
		{
						this.RegisterHiddenField("HiddenCommon",Request["HiddenCommon"]);
		}
	}
}
