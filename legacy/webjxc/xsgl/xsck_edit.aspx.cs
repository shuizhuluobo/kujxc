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
	public class ckmx_edit :jxc.UsrControl.UserPage//System.Web.UI.Page// 
	{
		protected System.Web.UI.WebControls.TextBox rkrq;
		protected System.Web.UI.WebControls.TextBox czy;
		protected System.Web.UI.WebControls.TextBox Textbox2;
		protected System.Web.UI.WebControls.TextBox Textbox1;
		protected System.Web.UI.WebControls.TextBox Textbox3;
		protected System.Web.UI.WebControls.TextBox Textbox4;
		protected System.Web.UI.WebControls.DataGrid Datagrid1;
		protected System.Web.UI.WebControls.TextBox Textbox5;
		protected System.Web.UI.WebControls.TextBox Textbox6;
		protected System.Web.UI.WebControls.TextBox Textbox7;
		protected System.Web.UI.WebControls.Button Button1;
		protected System.Web.UI.WebControls.Button Button2;
		protected System.Web.UI.WebControls.TextBox Textbox8;
		protected System.Web.UI.WebControls.TextBox Textbox9;
		protected System.Web.UI.WebControls.Button save;
		protected System.Web.UI.WebControls.Label Label1;
		protected System.Web.UI.WebControls.Button Button3;
		protected System.Web.UI.WebControls.TextBox txtwldwid;
		protected System.Web.UI.WebControls.TextBox txttmp;

			utils u = new utils ();
		private void Page_Load(object sender, System.EventArgs e)
		{
			CodeSearch();
			if (!this.Page.IsPostBack)
			{

				//string cmd1 ="INSERT INTO [入库单]([rkid], [产品名称], [cpid], [颜色], [型号], [仓库名称], [操作员], [入库数量], [入库单价], [折扣率], [剩余数量], [入库日期], [确认日期], [到货确认], [备注], [库保确认], [产品类别], [店名], [标志], [入库单编号], [规格], [进货价], [rkidold], [下拨单编号], [wldwid], [供应商])";
             //   DBBase.ExecuteSqlReader (cmd);
				this.Textbox3.Text=string.Format("{0:yyyy-MM-dd}",DateTime.Now);
				rkrq.Text=this.jgmc.ToString();
			    //this.Textbox4.Text=Textbox3.Text;
				this.czy.Text=this.glyname.ToString();
				string id = this.Request.QueryString["rkid"];
				Textbox2.Text= utils.Getbm("xsid","销售单",this.glydh.ToString()+string.Format("{0:yyyyMM}",DateTime.Now),4);
				Button2.Attributes.Add("onclick","return confirm('您真的要删除吗？')");
				BindData ();
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
			this.Datagrid1.SelectedIndexChanged += new System.EventHandler(this.Datagrid1_SelectedIndexChanged);
			this.Button1.Click += new System.EventHandler(this.Button1_Click);
			this.Button2.Click += new System.EventHandler(this.Button2_Click);
			this.Textbox5.TextChanged += new System.EventHandler(this.Textbox9_TextChanged);
			this.Textbox9.TextChanged += new System.EventHandler(this.Textbox9_TextChanged);
			this.Textbox4.TextChanged += new System.EventHandler(this.Textbox8_TextChanged);
			this.Textbox8.TextChanged += new System.EventHandler(this.Textbox8_TextChanged);
			this.save.Click += new System.EventHandler(this.save_Click);
			this.Button3.Click += new System.EventHandler(this.Button3_Click);
			this.Load += new System.EventHandler(this.Page_Load);
			this.PreRender += new System.EventHandler(this.ckmx_edit_PreRender);

		}
		#endregion

		private void BindData ()
		{
		//	string cmd = "SELECT *,入库数量*入库单价 as 金额 FROM 下拨单 where rkid ='"+Textbox2.Text+"'";
			string cmd = "select *,销售数量*零售价 as 总金额 from 销售单明细 where 1=1 and xsid='"+Textbox2.Text+"' order by 产品名称,xsdmxid desc";

			DataSet ds = DBBase.ExecuteSql4Ds (cmd,"cksh");
			this.Datagrid1.DataSource = ds.Tables["cksh"].DefaultView;
			this.Datagrid1.DataBind ();
			cmd="select isnull(sum([零售价]*[销售数量]),0) as 总金额 from 销售单明细 where 1=1 and xsid='"+Textbox2.Text+"'";
			SqlDataReader dr = DBBase.ExecuteSqlReader (cmd);
			if (dr.HasRows)
			{
				if (dr.Read())
					if (dr["总金额"]!=null)
					Textbox5.Text=Convert.ToDouble(dr["总金额"].ToString()).ToString();
				    else
						Textbox5.Text="0";
			}
			else
				Textbox5.Text="0";
			
			dr.Close();
			//Textbox8.Text=Convert.ToString(Convert.ToDouble(this.Textbox9.Text)*Convert.ToDouble(this.Textbox5.Text)/10);
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

				strScript = JSUtil.GetOpenDialogScript("客户选择","../CommonSearch/khSelect.aspx",550,650,"Form1");

				this.Textbox1.Attributes.Add("OnDblClick",strScript);

			}
			if(Session["Ret_Search_Value"]!=null)
			{
				if (Request["HiddenCommon"]!=null && Request["HiddenCommon"]!="")
				{
					switch(Request["HiddenCommon"].ToString())
					{
						case"客户选择":
							strs = Session["Ret_Search_Value"].ToString().Split(',');
							if (this.Textbox1.Text.ToString()!="")
							{
								this.Textbox1.Text = strs[1];
								this.txtwldwid.Text = strs[0];
							}
							else
							{
								this.Textbox1.Text =strs[1];
								this.txtwldwid.Text =strs[0];
							}
							this.ViewState["KindCommon"]=null;
							Session["Ret_Search_Value"]=null;
							break;
					}
				}
			}
			JSUtil.ExecuteBlock(this,"parent.frames[\"Form1\"].Form1.HiddenCommon.value=\"\"");

		}
		private void save_Click(object sender, System.EventArgs e)
		{
			if (Textbox1.Text=="")
			{
				utils.Alert (this,"客户名称不能为空!");
				return;
			}
			if (Convert.ToDouble(this.Textbox8.Text)<0) 
			{
				utils.Alert (this,"实付金额不能小于0!");
				return;
			}
//			if (Convert.ToDouble(this.Textbox7.Text)<0) 
//			{
//				utils.Alert (this,"找回金额不能小于0!");
//				return;
//			}

            string strcmd="insert into 销售单 ([xsid],[店名], [总计金额], [预付定金], [客户名称], [销售日期], [付款金额], [折扣率], [备注], [经办人], [找回], [审核通过], [地区],应付金额,wldwid) values('";
			strcmd+=Textbox2.Text+"','"+this.jgmc.ToString()+"',";
			strcmd+=this.Textbox5.Text.Trim()+",";
			strcmd+= this.Textbox8.Text+",'";
			strcmd+= this.Textbox1.Text.ToString()+"','";
			strcmd+=Textbox3.Text.ToString()+"','";
			strcmd+=this.Textbox4.Text.ToString()+"',";
			strcmd+=this.Textbox9.Text.ToString()+",'";
			strcmd+=this.Textbox6.Text.ToString()+"','";
			strcmd+=this.czy.Text.ToString()+"','";
			strcmd+=this.Textbox7.Text.ToString()+"','";
			strcmd+="否','";
			strcmd+=this.zjgmc.ToString()+"',"+this.Textbox5.Text+",'"+this.txtwldwid.Text+"')";
			try
			{
				DBBase.ExecuteSql (strcmd);//保存销售单
//				string dqrq1=string.Format("{0:yyyy-MM-dd}",DateTime.Now);
//				string dqrq2=string.Format("{0:yyyy-MM-01}",DateTime.Now);
//				string cmd2 = "select [xsdmxid], [xsid], [产品名称], [cpid], [产品型号], [销售数量],[rkid],[单价]*[销售数量] as chengben from 销售单明细 where xsid='" + Textbox2.Text + "'";
//				double chengben=0;
//				SqlDataReader dr = DBBase.ExecuteSqlReader (cmd2);
//				while (dr.Read ())
//				{
//					chengben=chengben+Convert.ToDouble(dr["chengben"].ToString ());
//					string cmd1="";
//					if (Convert.ToDouble(dr["销售数量"].ToString ())>=0) 
//				
//						cmd1="update 入库单 set 剩余数量=(剩余数量-("+dr["销售数量"].ToString ()+")) where rkid='"+dr["rkid"].ToString ()+"'";
//					else
//						cmd1="update 入库单 set 剩余数量=(剩余数量+("+dr["销售数量"].ToString ()+")) where rkid='"+dr["rkid"].ToString ()+"'";
//					DBBase.ExecuteSql (cmd1);
//				
//				}
//				dr.Close ();
//				string[] cmd=new string[4];
//				string id = utils.Getbm("cwid","地区财务",string.Format("{0:yyyyMMdd}",DateTime.Now),4);
//				cmd[0]="insert into 地区财务( [cwid], [店名], [地区], [xsid], [客户], [经办人], [时间1], [总金额], [预收定金], [销售成本], [其他], [日期1], [日期2], [是否结算])values('";
//				cmd[0]+=id+"','";
//				cmd[0]+=this.jgmc.ToString()+"','";
//				cmd[0]+=this.zjgmc.ToString()+"','";
//				cmd[0]+=Textbox2.Text+"','";
//				cmd[0]+=Textbox1.Text+"','";
//				cmd[0]+=this.czy.Text.ToString()+"','";
//				cmd[0]+=Textbox3.Text+"',";
//				//cmd[0]+=Textbox4.Text+"',";
//				cmd[0]+=this.Textbox8.Text.Trim()+",";
//				cmd[0]+=this.Textbox8.Text+",";
//				cmd[0]+=chengben.ToString()+",'";
//				cmd[0]+="销售收入"+"','";
//				cmd[0]+=dqrq1.ToString()+"','";
//				cmd[0]+=dqrq2.ToString()+"','否')";
//				id = utils.Getbm("cnzid","地区出纳",string.Format("{0:yyyyMMdd}",DateTime.Now),4);
//				cmd[1]="insert into 地区出纳( [cnzid], [日期], [地区], [摘要], [借方], [贷方], [余额], [其他])values('";
//				cmd[1]+=id+"','";
//				cmd[1]+=dqrq1.ToString()+"','";
//				cmd[1]+=this.zjgmc.ToString()+"','";
//				cmd[1]+="销售产品收款"+"',";
//				cmd[1]+=this.Textbox8.Text+",";
//				cmd[1]+="0,";
//				cmd[1]+=Textbox8.Text+",'";
//				cmd[1]+="销售店"+this.jgmc.ToString()+"销售单号:"+Textbox2.Text+"')";
//				id = utils.Getbm("kjid","地区会计",string.Format("{0:yyyyMMdd}",DateTime.Now),4);
//				cmd[2]="insert into 地区会计([kjid], [日期], [地区], [摘要], [借方], [贷方], [余额], [其他])values('";
//				cmd[2]+=id+"','";
//				cmd[2]+=dqrq1.ToString()+"','";
//				cmd[2]+=this.zjgmc.ToString()+"','";
//				cmd[2]+="销售总计金额"+"',";
//				cmd[2]+=this.Textbox8.Text+",";
//				cmd[2]+="0,";
//				cmd[2]+=Textbox8.Text+",'";
//				cmd[2]+="销售店"+this.jgmc.ToString()+"销售单号:"+Textbox2.Text+"')";
//				cmd[3]="update 销售单明细 set 标志='是' where xsid='"+Textbox2.Text+"'";//update by 2010-01-29
//				DBBase.ExecuteSqls (cmd);

				utils.Alert (this,"保存成功!");
//				u.OpenIEWindowRight(this,"cksh_zzxp.aspx?xsid="+Textbox2.Text,600,350);
				JSUtil.Close(this);
			}
			catch
			{
				utils.Alert (this,"保存失败");
				return;
			}
		}

		private void Datagrid1_SelectedIndexChanged(object sender, System.EventArgs e)
		{
		
		}

		private void Button1_Click(object sender, System.EventArgs e)
		{
			//string id = ;//utils.FindFirstCheckedItem(this.Datagrid1);
			//u.OpenIEWindowRight(this,"xsck_addmx.aspx?rkid="+Textbox2.Text,600,350);
			u.OpenIEWindowRight(this,"xsck_addmx.aspx?rkid="+Textbox2.Text,600,350);
            BindData ();
		}

		private void Button2_Click(object sender, System.EventArgs e)
		{
			string id = utils.FindFirstCheckedItem(this.Datagrid1);
			string cmd="delete 销售单明细  where test="+id;
			DBBase.ExecuteSql (cmd);
			BindData ();
		}

		private void Textbox9_TextChanged(object sender, System.EventArgs e)
		{
			Textbox8.Text=Convert.ToString(Convert.ToDouble(this.Textbox9.Text)*Convert.ToDouble(this.Textbox5.Text)/10);
		}

		private void Button3_Click(object sender, System.EventArgs e)
		{
			string id =Textbox2.Text;
			if (id!=null)
			{
				u.OpenIEWindowPrint(this,"cksh_zzxp.aspx?xsdmxid="+Textbox2.Text,250,550);
//				//id = utils.FindFirstCheckedItem(this.Datagrid1);
//				string cmd="update 销售单明细 set 打印状态='已打印' where xsdmxid='"+id+"'";
//				DBBase.ExecuteSql (cmd);
			}	
			//u.CloseWindow(this);
		}

		private void Textbox8_TextChanged(object sender, System.EventArgs e)
		{
			Textbox7.Text=Convert.ToString(Convert.ToDouble(this.Textbox4.Text)-Convert.ToDouble(this.Textbox8.Text));
		}

		private void ckmx_edit_PreRender(object sender, System.EventArgs e)
		{
			this.RegisterHiddenField("HiddenCommon",Request["HiddenCommon"]);
		}
	}
}
