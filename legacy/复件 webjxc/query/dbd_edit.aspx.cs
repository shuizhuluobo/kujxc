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
	/// dbd_add 的摘要说明。
	/// </summary>
	public class dbd_edit :jxc.UsrControl.UserPage//System.Web.UI.Page// 
	{
		protected System.Web.UI.WebControls.DropDownList DropDownListlx;
		protected System.Web.UI.WebControls.TextBox Textbox1;
		protected System.Web.UI.WebControls.TextBox rkrq;
		protected System.Web.UI.WebControls.TextBox cpname;
		protected System.Web.UI.WebControls.TextBox cpid;
		protected System.Web.UI.WebControls.TextBox czy;
		protected System.Web.UI.WebControls.TextBox Textbox2;
		protected System.Web.UI.WebControls.TextBox Textbox3;
		protected System.Web.UI.WebControls.TextBox Textbox4;
		protected System.Web.UI.WebControls.TextBox Textbox5;
		protected System.Web.UI.WebControls.TextBox Textbox6;
		protected System.Web.UI.WebControls.TextBox Textbox7;
		protected System.Web.UI.WebControls.Button save;
	
		private void Page_Load(object sender, System.EventArgs e)
		{
			//CodeSearch();
			if (!this.Page.IsPostBack)
			{
				rkrq.Text=string.Format("{0:yyyy-MM-dd}",DateTime.Now);
				Textbox5.Text=rkrq.Text;
				this.czy.Text=this.glyname.ToString();
				string id = this.Request.QueryString["dbid"];
				if (id != string.Empty && id != null)
				{
					string cmd = "select * from 调拨单 where dbid='" + id + "'";
					SqlDataReader dr = DBBase.ExecuteSqlReader (cmd);
					if (dr.Read ())
					{
						Textbox2.Text=dr["dbid"].ToString();
						this.cpname.Text = dr["产品名称"].ToString ();
						this.cpid.Text = dr["cpid"].ToString ();
						this.Textbox4.Text = dr["调拨仓库"].ToString ();
						this.Textbox1.Text = dr["调拨数量"].ToString (); 
						this.czy.Text = this.glyname.ToString();
						this.Textbox3.Text = dr["xsid"].ToString ();						
					}
					dr.Close ();

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
			this.ID = "dbd_edit";
			this.Load += new System.EventHandler(this.Page_Load);
			this.PreRender += new System.EventHandler(this.dbd_edit_PreRender);

		}
		#endregion

		private void save_Click(object sender, System.EventArgs e)
		{
			string id = this.Request.QueryString["dbid"];
			string[] cmd=new string[1];
			string fhid = utils.Getbm("fhid","发货单",string.Format("{0:yyyyMM}",DateTime.Now),4);
            cmd[0]="insert into 发货单 ([fhid], [cpid], [产品名称],[发货单号],[发货数量],[xsid],[发货时间],[收到时间],[说明],[确认到货],[发货仓库], [收货仓库], [发货人]) values('";
			cmd[0]+=fhid+"','"+this.cpid.Text.Trim()+"','";
			cmd[0]+=this.cpname.Text.Trim()+"','";
			cmd[0]+= this.Textbox6.Text+"',";
			cmd[0]+= this.Textbox1.Text.ToString()+",'";
			cmd[0]+= this.Textbox3.Text.ToString()+"','";
			cmd[0]+=this.rkrq.Text.ToString()+"','";
			cmd[0]+=this.Textbox5.Text.ToString()+"','";
			cmd[0]+=this.Textbox7.Text.ToString()+"','否','"+this.zjgmc.ToString()+"','"+this.Textbox4.Text+"','"+this.czy.Text.ToString()+"')";
			try
			{
				DBBase.ExecuteSqls (cmd);
				utils.Alert (this,"保存成功");
			}
			catch
			{
				utils.Alert (this,"保存失败");
			}
		}
		private void dbd_edit_PreRender(object sender, System.EventArgs e)
		{
			this.RegisterHiddenField("HiddenCommon",Request["HiddenCommon"]);
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

    			strScript = JSUtil.GetOpenDialogScript("产品选择","../CommonSearch/sprk.aspx",380,400,"dbd_edit");

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
							}
							else
							{
								this.cpname.Text =strs[1];
								this.cpid.Text =strs[0];

							}
							this.ViewState["KindCommon"]=null;
							Session["Ret_Search_Value"]=null;
							break;
					}
				}
			}
			JSUtil.ExecuteBlock(this,"parent.frames[\"dbd_edit\"].dbd_edit.HiddenCommon.value=\"\"");

		}
	}
	
}
