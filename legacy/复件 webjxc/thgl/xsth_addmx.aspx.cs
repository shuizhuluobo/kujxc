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
	public class xsth_addmx :jxc.UsrControl.UserPage//System.Web.UI.Page// 
	{
		protected System.Web.UI.WebControls.TextBox cpname;
		protected System.Web.UI.WebControls.TextBox Textbox5;
		protected System.Web.UI.WebControls.TextBox Textbox6;
		protected System.Web.UI.WebControls.TextBox Textbox7;
		protected System.Web.UI.WebControls.TextBox Textbox2;
		protected System.Web.UI.WebControls.TextBox cpbm;
		protected System.Web.UI.WebControls.TextBox rkid;
		protected System.Web.UI.WebControls.TextBox danjia;
		protected System.Web.UI.WebControls.TextBox Textbox1;
		protected System.Web.UI.WebControls.TextBox rkdrkid;
		protected System.Web.UI.WebControls.TextBox Textbox3;
		protected System.Web.UI.WebControls.TextBox yanse;
		protected System.Web.UI.WebControls.TextBox xinghao;
		protected System.Web.UI.WebControls.TextBox guige;
		protected System.Web.UI.WebControls.TextBox sysl;
		protected System.Web.UI.WebControls.Button save;
	
		private void Page_Load(object sender, System.EventArgs e)
		{
			CodeSearch();
			if (!this.Page.IsPostBack)
			{
				if (this.zjgmc.ToString()=="")
					return;
				this.Textbox2.Text=this.Request.QueryString["rkid"];

//				rkrq.Text=string.Format("{0:yyyy-MM-dd}",DateTime.Now);
//				this.czy.Text=this.glyname.ToString();
//				utils.BindDropDownList("select dept,dept from dept where d4=1",this.DropDownListlx);
//				utils.BindDropDownList("select listid,listname from rs_corsub where sortid=7",this.DropDownListlx);
//				string id = this.Request.QueryString["rkid"];
//				if (id != string.Empty && id != null)
//				{
//					string cmd = "select * from 入库单 where rkid='" + id + "'";
//					SqlDataReader dr = DBBase.ExecuteSqlReader (cmd);
//					if (dr.Read ())
//					{
//						Textbox2.Text=dr["rkid"].ToString();
//						this.cpname.Text = dr["产品名称"].ToString ();
//						this.cpid.Text = dr["cpid"].ToString ();
//						this.Textbox4.Text = dr["仓库名称"].ToString ();
//						this.Textbox3.Text = dr["入库数量"].ToString (); 
//						this.czy.Text = dr["操作员"].ToString ();
//						this.Textbox5.Text = dr["入库单价"].ToString ();
//						this.Textbox1.Text = dr["剩余数量"].ToString (); 
//					}
//					dr.Close ();

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
			this.PreRender += new System.EventHandler(this.xsth_addmx_PreRender);

		}
		#endregion

		private void save_Click(object sender, System.EventArgs e)
		{
			//string id = this.Request.QueryString["cpid"];
			if (cpname.Text=="")
				return;
			if (Convert.ToDouble(this.Textbox6.Text)<=0) 
			{
                utils.Alert (this,"退货数量不能为0");
				return;
			}
			if (Convert.ToDouble(this.Textbox6.Text)>Convert.ToDouble(this.sysl.Text)) 
			{
				utils.Alert (this,"退货数量不能超过该批次库存数量！");
				return;
			}
				string cmd;
				string xsdmxid = utils.Getbm("xsdmxid","销售单明细",this.glydh.ToString()+string.Format("{0:yyyyMMdd}",DateTime.Now),4);
            cmd="insert into 销售单明细 ([xsdmxid], [xsid], [产品名称], [cpid], [产品型号], [销售数量], [制作明细], [已调拨], [到货确认],[rkid],[单价],[产品类别],零售价,颜色,规格) values('";
			cmd+=xsdmxid+"','"+this.Textbox2.Text.Trim()+"','";
			cmd+=this.cpname.Text.Trim()+"','";
			cmd+= this.cpbm.Text.Trim()+"','";
			cmd+= this.Textbox5.Text.ToString()+"',";
			cmd+=this.Textbox6.Text.ToString()+",'";
			cmd+=this.Textbox7.Text.ToString()+"','否','否','"+this.rkid.Text+"',"+danjia.Text+",'"+this.Textbox1.Text+"',"+this.Textbox3.Text.Trim()+",'"+yanse.Text+"','"+guige.Text+"')";
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

				strScript = JSUtil.GetOpenDialogScript("产品选择","../CommonSearch/dhdmxSelect.aspx",550,650,"xsth_addmx");

				this.cpname.Attributes.Add("OnDblClick",strScript);

			}
			if(Session["Ret_Search_Value"]!=null)
			{
				if (Request["HiddenCommon"]!=null && Request["HiddenCommon"]!="")
				{
					switch(Request["HiddenCommon"].ToString())
					{
						case"产品选择":
						//产品名称，cpid，xbid,进货价，产品类别， 进货价
							strs = Session["Ret_Search_Value"].ToString().Split(',');
							if (strs[0].ToString()!="")
							{
								string cmd = "select * from 销售单明细 where xsid='" + Textbox2.Text + "' and cpid='"+strs[1].ToString()+"'";
								SqlDataReader dr = DBBase.ExecuteSqlReader (cmd);
								if (dr.HasRows)
								{
									this.cpname.Text ="";
									this.rkid.Text ="";
									this.cpbm.Text="";
									this.danjia.Text="";
									this.Textbox1.Text="";
									Textbox3.Text="";//零售价;
									yanse.Text="";//"颜色
									xinghao.Text="";//型号
									guige.Text="";//规格
									sysl.Text="0";//剩余数量
									utils.Alert (this,"已经增加过该商品!");
								}
								else
								{
									//产品名称，cpid，xbid,进货价，产品类别， 进货价
									this.cpname.Text = strs[0];
									this.rkid.Text = strs[2];
									this.cpbm.Text=strs[1];//条型码
									this.danjia.Text=strs[3];//成本价
									this.Textbox1.Text=strs[4];
									Textbox3.Text=strs[5];//零售价;
									Textbox6.Text=strs[6];
//									yanse.Text=strs[6];//"颜色
//									xinghao.Text=strs[7];//型号
//									guige.Text=strs[8];//规格
									sysl.Text=strs[6];//剩余数量
								}
								dr.Close();
							}
							else
							{
								this.cpname.Text ="";
								this.rkid.Text ="";
								this.cpbm.Text="";
								this.danjia.Text="";
								this.Textbox1.Text="";
								Textbox3.Text="";//零售价;
								yanse.Text="";//"颜色
								xinghao.Text="";//型号
								guige.Text="";//规格
								sysl.Text="0";//剩余数量
//								Textbox6.Text="0";

							}
							this.ViewState["KindCommon"]=null;
							Session["Ret_Search_Value"]=null;
							break;
					}
				}
			}
			JSUtil.ExecuteBlock(this,"parent.frames[\"xsth_addmx\"].xsth_addmx.HiddenCommon.value=\"\"");

		}

		private void xsth_addmx_PreRender(object sender, System.EventArgs e)
		{
			this.RegisterHiddenField("HiddenCommon",Request["HiddenCommon"]);
		}
	}
}
