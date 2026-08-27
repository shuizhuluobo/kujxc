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
	public class thrk_addmx :jxc.UsrControl.UserPage//System.Web.UI.Page// 
	{
		protected System.Web.UI.WebControls.TextBox Textbox2;
		protected System.Web.UI.WebControls.TextBox cpname;
		protected System.Web.UI.WebControls.TextBox xsid;
		protected System.Web.UI.WebControls.TextBox danjia;
		protected System.Web.UI.WebControls.TextBox cpbm;
		protected System.Web.UI.WebControls.TextBox Textbox5;
		protected System.Web.UI.WebControls.TextBox Textbox1;
		protected System.Web.UI.WebControls.TextBox txtgg;
		protected System.Web.UI.WebControls.TextBox txtzdbm;
		protected System.Web.UI.WebControls.TextBox txtzkl;
		protected System.Web.UI.WebControls.TextBox Textbox6;
		protected System.Web.UI.WebControls.Button save;
	
		private void Page_Load(object sender, System.EventArgs e)
		{
			CodeSearch();
			if (!this.Page.IsPostBack)
			{
				if (this.zjgmc.ToString()=="")
					return;
				this.Textbox2.Text=this.Request.QueryString["thid"];
                
//				rkrq.Text=string.Format("{0:yyyy-MM-dd}",DateTime.Now);
//				this.czy.Text=this.glyname.ToString();
//				utils.BindDropDownList("select dept,dept from dept where d4=1",this.DropDownListlx);
//			//	utils.BindDropDownList("select listid,listname from rs_corsub where sortid=7",this.DropDownListlx);
				string id = Session["thmxid"].ToString();
				if (id != string.Empty && id != null)
				{
					string cmd = "select * from 退货单明细 where thmxid='" + id + "'";
					SqlDataReader dr = DBBase.ExecuteSqlReader (cmd);
					if (dr.Read ())
					{
						Textbox2.Text=dr["xsid"].ToString();
						this.cpname.Text = dr["产品名称"].ToString ();
						this.Textbox6.Text = dr["退货数量"].ToString (); 
						//this.Textbox7.Text = dr["制作明细"].ToString ();
						this.cpbm.Text = dr["cpid"].ToString ();
						//this.Textbox1.Text = dr["剩余数量"].ToString (); 
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
			this.PreRender += new System.EventHandler(this.thrk_addmx_PreRender);

		}
		#endregion

		private void save_Click(object sender, System.EventArgs e)
		{
			//string id = this.Request.QueryString["cpid"];
			if (cpname.Text=="")
				return;

			if (this.roleid.ToString()!="6")//总会计
			if (Convert.ToDouble(this.Textbox6.Text)<0) 
			{
                utils.Alert (this,"退货数量不能<0");
				return;
			}
			if (Convert.ToDouble(this.Textbox6.Text)==0) 
			{
				utils.Alert (this,"退货数量不能=0");
				return;
			}
				string cmd;
			string id = Session["thmxid"].ToString();
			string thmxid="";
			if (id != string.Empty && id != null)
			{
              cmd="update 退货单明细 set 退货数量="+Textbox6.Text+" where thmxid='" + id + "'"; 
			}
			else
			{
//				this.cpname.Text = strs[0];//产品名称
//				this.xsid.Text = strs[2];//xsid
//				this.cpbm.Text=strs[1];//cpid
//				this.danjia.Text=strs[3];//零售价
//				this.txtzdbm.Text=strs[4];//zdbm
				thmxid = utils.Getbm("thmxid","退货单明细",this.glydh.ToString()+string.Format("{0:yyyyMMdd}",DateTime.Now),4);
				cmd="insert into 退货单明细 ([thmxid], [thid], [产品名称], [cpid], [退货数量],[单价],xsid) values('";
				cmd+=thmxid+"','"+this.Textbox2.Text.Trim()+"','";
				cmd+=this.cpname.Text.Trim()+"','";
				cmd+= this.cpbm.Text.Trim()+"',";
				cmd+=this.Textbox6.Text.ToString()+",";
				cmd+=danjia.Text+",'"+this.xsid.Text+"')";
			}
			try
			{
				DBBase.ExecuteSql (cmd);
				utils.Alert (this,"保存成功");
				JSUtil.Close(this);
				//this.save.Enabled=false;
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

				strScript = JSUtil.GetOpenDialogScript("产品选择","../CommonSearch/spth.aspx",550,650,"thrk_addmx");

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
							//dr["产品名称"]["cpid"]["rkid"]["零售价"]["折扣率"]["销售日期"]["颜色"]["型号"]["规格"]["销售数量"]
//产品名称,cpid,xsid,零售价,zdbm;销售数量
							//产品名称,cpid,xsid,零售价,销售数量
							if (strs[0].ToString()!="")
							{
								this.cpname.Text = strs[0];//产品名称
								this.xsid.Text = strs[2];//xsid
								this.cpbm.Text=strs[1];//cpid
								this.danjia.Text=strs[3];//零售价
								//this.txtzkl.Text=strs[4];Textbox6
								//this.txtzdbm.Text=strs[4];//zdbm
								this.Textbox6.Text=strs[4];
								//this.txtgg.Text=strs[7];
							}
							else
							{
								this.cpname.Text = strs[0];
								this.xsid.Text = strs[2];
								this.cpbm.Text=strs[1];
								this.danjia.Text=strs[3];
								//this.txtzkl.Text=strs[4];
								this.txtzdbm.Text=strs[4];
								this.Textbox6.Text=strs[5];
								//this.txtgg.Text=strs[7];
							}
							this.ViewState["KindCommon"]=null;
							Session["Ret_Search_Value"]=null;
							break;
					}
				}
			}
			JSUtil.ExecuteBlock(this,"parent.frames[\"thrk_addmx\"].thrk_addmx.HiddenCommon.value=\"\"");

		}

		private void thrk_addmx_PreRender(object sender, System.EventArgs e)
		{
			this.RegisterHiddenField("HiddenCommon",Request["HiddenCommon"]);
		}
	}
}
