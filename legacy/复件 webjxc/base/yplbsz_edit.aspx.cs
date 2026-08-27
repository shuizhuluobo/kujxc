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
	/// yplbsz_add 的摘要说明。
	/// </summary>
	public class yplbsz_edit :jxc.UsrControl.UserPage//System.Web.UI.Page// 
	{
		protected System.Web.UI.WebControls.TextBox rkrq;
		protected System.Web.UI.WebControls.TextBox cpid;
		protected System.Web.UI.WebControls.TextBox Textbox1;
		protected System.Web.UI.WebControls.Button save;
	
		private void Page_Load(object sender, System.EventArgs e)
		{
				CodeSearch();
			if (!this.Page.IsPostBack)
			{
				if (this.Request.QueryString["id"]!="")
				{
					Textbox1.Text=this.Request.QueryString["id"].ToString();
					this.rkrq.Enabled=false;
					Textbox1.Enabled=false;
					string cmd = "SELECT yplbid,样品类别,撤柜天数 FROM [样品类别] where yplbid='" + Textbox1.Text + "'";
					SqlDataReader dr = DBBase.ExecuteSqlReader (cmd);
					if (dr.Read ())
					{
                         this.cpid.Text=dr["撤柜天数"].ToString();
						 this.rkrq.Text=dr["样品类别"].ToString();
					}
					dr.Close();
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
			this.PreRender += new System.EventHandler(this.yplbsz_edit_PreRender);

		}
		#endregion

		private void save_Click(object sender, System.EventArgs e)
		{
			//string id = this.Request.QueryString["cpid"];
			if (Convert.ToDouble(this.cpid.Text)<=0) 
			{
                utils.Alert (this,"撤柜天数不能为0");
				return;
			}
			if (this.rkrq.Text=="") 
			{
				utils.Alert (this,"样品类别不能为空");
				return;
			}
			if (this.Textbox1.Text=="") 
			{
				utils.Alert (this,"样品编码不能为空");
				return;
			}

				string cmd="";
			if (this.Request.QueryString["id"]!="")
			{
				cmd="update 样品类别 set 撤柜天数="+cpid.Text.ToString()+" where yplbid='"+this.Request.QueryString["id"].ToString()+"'";
			}
			else
			{
				cmd="insert into 样品类别(yplbid,样品类别,撤柜天数)values('"+Textbox1.Text+"','"+this.rkrq.Text+"',"+this.cpid.Text.ToString()+")";     
			}
			try
			{
				DBBase.ExecuteSql (cmd);
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
//			string[] strs;
//			if(!Page.IsPostBack)
//			{
//				string strScript;
//
//				strScript = JSUtil.GetOpenDialogScript("产品选择","../CommonSearch/spselect.aspx",380,400,"yplbsz_edit");
//
//				this.cpname.Attributes.Add("OnDblClick",strScript);
//
//			}
//			if(Session["Ret_Search_Value"]!=null)
//			{
//				if (Request["HiddenCommon"]!=null && Request["HiddenCommon"]!="")
//				{
//					switch(Request["HiddenCommon"].ToString())
//					{
//						case"产品选择":
//							strs = Session["Ret_Search_Value"].ToString().Split(',');
//							if (this.cpname.Text.ToString()!="")
//							{
//								this.cpname.Text = strs[1];
//								this.cpid.Text = strs[0];
//								this.Textbox1.Text=strs[2];
//							}
//							else
//							{
//								this.cpname.Text =strs[1];
//								this.cpid.Text =strs[0];
//								this.Textbox1.Text=strs[2];
//
//							}
//							this.ViewState["KindCommon"]=null;
//							Session["Ret_Search_Value"]=null;
//							break;
//					}
//				}
//			}
//			JSUtil.ExecuteBlock(this,"parent.frames[\"yplbsz_edit\"].yplbsz_edit.HiddenCommon.value=\"\"");

		}

		private void yplbsz_edit_PreRender(object sender, System.EventArgs e)
		{
			this.RegisterHiddenField("HiddenCommon",Request["HiddenCommon"]);
		}

		private void cpname_TextChanged(object sender, System.EventArgs e)
		{
		
		}
	}
}
