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
	/// spdb_add 的摘要说明。
	/// </summary>
	public class ypbgl_ckedit :jxc.UsrControl.UserPage//System.Web.UI.Page// 
	{
		protected System.Web.UI.WebControls.TextBox cpname;
		protected System.Web.UI.WebControls.TextBox Textbox5;
		protected System.Web.UI.WebControls.TextBox Textbox6;
		protected System.Web.UI.WebControls.TextBox Textbox7;
		protected System.Web.UI.WebControls.TextBox Textbox2;
		protected System.Web.UI.WebControls.TextBox cpbm;
		protected System.Web.UI.WebControls.TextBox danjia;
		protected System.Web.UI.WebControls.TextBox Textbox1;
		protected System.Web.UI.WebControls.DropDownList DropDownList1;
		protected System.Web.UI.WebControls.TextBox rkid;
		protected System.Web.UI.WebControls.TextBox Textbox3;
		protected System.Web.UI.WebControls.TextBox Textbox4;
		protected System.Web.UI.WebControls.Button save;
	
		private void Page_Load(object sender, System.EventArgs e)
		{
			//CodeSearch();
			if (!this.Page.IsPostBack)
			{
				//this.Textbox2.Text=this.Request.QueryString["rkid"];
				Textbox3.Text=string.Format("{0:yyyy-MM-dd}",DateTime.Now);
				//				this.czy.Text=this.glyname.ToString();
				utils.BindDropDownList("select 样品类别,样品类别 from 样品类别 ",this.DropDownList1);
				//utils.BindDropDownList("select jgmc,jgmc from cnc_jgglb where parent1='"+this.parents.ToString()+"'",this.DropDownList2);
				string id = this.Request.QueryString["id"];
				if (id != string.Empty && id != null)
				{
					string cmd = "select * from 样品入库单 where yprkid='" + id + "'";
					SqlDataReader dr = DBBase.ExecuteSqlReader (cmd);
					if (dr.Read ())
					{
						rkid.Text=dr["rkid"].ToString();
						this.cpname.Text = dr["产品名称"].ToString ();
						this.cpbm.Text = dr["cpid"].ToString ();
						this.Textbox4.Text = dr["店名"].ToString ();
						this.DropDownList1.SelectedValue = dr["产品类别"].ToString (); 
						//	this.czy.Text = dr["操作员"].ToString ();
						this.danjia.Text= dr["单价"].ToString ();
						this.Textbox6.Text = dr["剩余数量"].ToString (); 
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
			this.Load += new System.EventHandler(this.Page_Load);
			this.PreRender += new System.EventHandler(this.ypbgl_ckedit_PreRender);

		}
		#endregion

		private void save_Click(object sender, System.EventArgs e)
		{
			//string id = this.Request.QueryString["cpid"];
			if (this.cpname.Text=="")
				return;
			if (Convert.ToDouble(this.Textbox6.Text)<=0) 
			{
				utils.Alert (this,"出库数量不能为0,或为负数!");
				return;
			}
			string cmd1 = "select * from 样品入库单 where yprkid='" + this.Request.QueryString["id"] + "'";
			SqlDataReader dr = DBBase.ExecuteSqlReader (cmd1);
			if (dr.Read ())
			{
				if ((Convert.ToDouble(dr["剩余数量"].ToString())-Convert.ToDouble(this.Textbox6.Text))<0)
				{
					utils.Alert (this,"出库数量不能大于剩余数量!");
					return;
				}
			}
			dr.Close();
			string[] cmd=new string[2];
			string xsdmxid = utils.Getbm("yprkid","样品入库单",this.glydh.ToString()+string.Format("{0:yyyyMMdd}",DateTime.Now),4);
            cmd[0]="insert into 样品入库单 ([yprkid], [产品名称], [cpid], [产品型号], [入库数量], [剩余数量], [备注], [入库日期], [到货确认],[rkid],[单价],[产品类别],[店名],[仓库名称],[操作员]) values('";
			cmd[0]+=xsdmxid+"','";
			cmd[0]+=this.cpname.Text.Trim()+"','";
			cmd[0]+= this.cpbm.Text.Trim()+"','";
			cmd[0]+= this.Textbox5.Text.ToString()+"',-";
			cmd[0]+=this.Textbox6.Text.ToString()+",-";
			cmd[0]+=this.Textbox6.Text.ToString()+",'";
			cmd[0]+=this.Textbox7.Text.ToString()+"','";
			cmd[0]+=this.Textbox3.Text.ToString()+"','";
			cmd[0]+="否','"+this.rkid.Text+"',"+danjia.Text+",'";
			cmd[0]+=this.DropDownList1.SelectedValue+"','"+this.Textbox4.Text+"','"+this.zjgmc.ToString()+"','"+this.glyname.ToString()+"')";
			string id = this.Request.QueryString["id"];
			if (id != string.Empty && id != null)
			{
				cmd[1]="update 样品入库单 set 剩余数量=剩余数量-"+this.Textbox6.Text+" where yprkid='" + id + "'";
			}
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

				strScript = JSUtil.GetOpenDialogScript("产品选择","../CommonSearch/sprk.aspx",550,500,"ypbgl_ckedit");

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
							if (strs[0].ToString()!="")
							{
								this.cpname.Text = strs[0];
								this.rkid.Text = strs[2];
								this.cpbm.Text=strs[1];
								this.danjia.Text=strs[3];
								this.Textbox1.Text=strs[4];
							}
							else
							{
								this.cpname.Text ="";
								this.rkid.Text ="";
								this.cpbm.Text="";
								this.danjia.Text="";
								this.Textbox1.Text="";

							}
							this.ViewState["KindCommon"]=null;
							Session["Ret_Search_Value"]=null;
							break;
					}
				}
			}
			JSUtil.ExecuteBlock(this,"parent.frames[\"ypbgl_ckedit\"].ypbgl_ckedit.HiddenCommon.value=\"\"");

		}

		private void ypbgl_ckedit_PreRender(object sender, System.EventArgs e)
		{
			this.RegisterHiddenField("HiddenCommon",Request["HiddenCommon"]);
		}
	}
}
