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
	/// cksh_add 的摘要说明。
	/// </summary>
	public class cksh_zzxp :jxc.UsrControl.UserPage//System.Web.UI.Page// 
	{
		protected System.Web.UI.WebControls.DropDownList DropDownListlx;
		protected System.Web.UI.WebControls.Label Label1;
		protected System.Web.UI.WebControls.Label Label2;
		protected System.Web.UI.WebControls.Label Label3;
		protected System.Web.UI.WebControls.Label Label4;
		protected System.Web.UI.WebControls.DataGrid Datagrid1;
		protected System.Web.UI.WebControls.Label Label5;
		protected System.Web.UI.WebControls.Label Label8;
		protected System.Web.UI.WebControls.Label Label9;
		protected System.Web.UI.WebControls.Label Label6;
		protected System.Web.UI.WebControls.Label Label7;
		protected System.Web.UI.WebControls.Label Label11;
		protected System.Web.UI.WebControls.Label Label13;
		protected System.Web.UI.WebControls.Label Label14;
		protected System.Web.UI.WebControls.Label Label15;
		protected System.Web.UI.WebControls.Label Label16;
		protected System.Web.UI.WebControls.Label Label10;
	
		private void Page_Load(object sender, System.EventArgs e)
		{
		//CodeSearch();
			if (!this.Page.IsPostBack)
			{
				Label16.Text=this.jgmc.ToString();
				this.Label7.Text=string.Format("{0:yyyy-MM-dd}",DateTime.Now);
			//	this.czy.Text=this.glyname.ToString();
				string id = this.Request.QueryString["xsid"].ToString();
				if (id != string.Empty && id != null)
				{
					//string cmd = "select * from 销售单明细 where xsdmxid='" + id + "'";
					string cmd = "select * from 销售单 where xsid='" + id + "'";
					SqlDataReader dr = DBBase.ExecuteSqlReader (cmd);
					if (dr.Read ())
					{
						Label1.Text=dr["销售日期"].ToString();
						this.Label2.Text = dr["xsid"].ToString ();
						this.Label3.Text = dr["经办人"].ToString ();
						this.Label4.Text = dr["操作员"].ToString (); 
						this.Label13.Text = dr["总计金额"].ToString ();		
						this.Label14.Text = dr["付款金额"].ToString ();	
						this.Label15.Text = dr["找回"].ToString ();	
					}
					dr.Close ();
				}
				BindData ();
			}
		}
		private void BindData ()
		{
			string cmd = "select *,销售数量*零售价 as 金额 from [销售单明细] where xsid='"+this.Request.QueryString["xsid"].ToString()+"'";
			DataSet ds = DBBase.ExecuteSql4Ds (cmd,"ckshmx");
			this.Datagrid1.DataSource = ds.Tables["ckshmx"].DefaultView;
			this.Datagrid1.DataBind ();
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
			this.ID = "cksh_zzxp";
			this.Load += new System.EventHandler(this.Page_Load);
			this.PreRender += new System.EventHandler(this.cksh_zzxp_PreRender);

		}
		#endregion

		private void save_Click(object sender, System.EventArgs e)
		{
//			string id = this.Request.QueryString["dbid"];
//			string[] cmd=new string[1];
//			string fhid = utils.Getbm("fhid","发货单",string.Format("{0:yyyyMM}",DateTime.Now),4);
//            cmd[0]="insert into 发货单 ([fhid], [cpid], [产品名称],[发货单号],[发货数量],[xsid],[发货时间],[收到时间],[说明],[确认到货],[发货仓库], [收货仓库], [发货人]) values('";
//			cmd[0]+=fhid+"','"+this.cpid.Text.Trim()+"','";
//			cmd[0]+=this.cpname.Text.Trim()+"','";
//			cmd[0]+= this.Textbox6.Text+"',";
//			cmd[0]+= this.Textbox1.Text.ToString()+",'";
//			cmd[0]+= this.Textbox3.Text.ToString()+"','";
//			cmd[0]+=this.rkrq.Text.ToString()+"','";
//			cmd[0]+=this.Textbox5.Text.ToString()+"','";
//			cmd[0]+=this.Textbox7.Text.ToString()+"','否','"+this.zjgmc.ToString()+"','"+this.Textbox4.Text+"','"+this.czy.Text.ToString()+"')";
//			try
//			{
//				DBBase.ExecuteSqls (cmd);
//				utils.Alert (this,"保存成功");
//			}
//			catch
//			{
//				utils.Alert (this,"保存失败");
//			}
		}
		private void cksh_zzxp_PreRender(object sender, System.EventArgs e)
		{
			this.RegisterHiddenField("HiddenCommon",Request["HiddenCommon"]);
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
//    			strScript = JSUtil.GetOpenDialogScript("产品选择","../CommonSearch/sprk.aspx",380,400,"cksh_zzxp");
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
//							}
//							else
//							{
//								this.cpname.Text =strs[1];
//								this.cpid.Text =strs[0];
//
//							}
//							this.ViewState["KindCommon"]=null;
//							Session["Ret_Search_Value"]=null;
//							break;
//					}
//				}
//			}
//			JSUtil.ExecuteBlock(this,"parent.frames[\"cksh_zzxp\"].cksh_zzxp.HiddenCommon.value=\"\"");

		}
	}
	
}
