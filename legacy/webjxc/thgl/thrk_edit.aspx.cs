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
	public class thrk_edit :jxc.UsrControl.UserPage//System.Web.UI.Page// 
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
		protected System.Web.UI.WebControls.Button Button3;
		protected System.Web.UI.WebControls.TextBox Textbox10;
		protected System.Web.UI.WebControls.TextBox txtwldwid;
			utils u = new utils ();
		private void Page_Load(object sender, System.EventArgs e)
		{
			CodeSearch();
			if (!this.Page.IsPostBack)
			{
			
     			string id = this.Request.QueryString["thid"];
				if (id==null)
				{
					this.Textbox3.Text=string.Format("{0:yyyy-MM-dd}",DateTime.Now);
					rkrq.Text=this.jgmc.ToString();
					//this.Textbox4.Text=Textbox3.Text;
					this.czy.Text=this.glyname.ToString();
					Textbox2.Text= utils.Getbm("thid","退货单",this.glydh.ToString()+string.Format("{0:yyyyMM}",DateTime.Now),4);
				}
				else
				{
					Textbox2.Text=id;
					string sql="select [thid], [退货单号], [销售单号], [店名], [退还金额], [客户名称], [退货日期], [客户电话], [备注], [经办人], [电话], [主管审核], [地区], [总会计审核], [操作员], [单据状态], [xsid], [状态], [wldwid] from 退货单 where thid='"+id+"'";     
					SqlDataReader dr1 = DBBase.ExecuteSqlReader (sql);
					if (dr1.Read ())
					{
//						rkrq.Text=dr1["退货日期"].ToString();
						Textbox1.Text=dr1["客户名称"].ToString();
						Textbox3.Text=dr1["退货日期"].ToString();
						Textbox8.Text=dr1["退还金额"].ToString();
						Textbox5.Text=dr1["客户电话"].ToString();
						Textbox6.Text=dr1["备注"].ToString();
						Textbox10.Text=dr1["销售单号"].ToString();
						czy.Text=dr1["经办人"].ToString();
//						Textbox7.Text=dr1["电话"].ToString();
					}
					dr1.Close();

				}
				Button2.Attributes.Add("onclick","return confirm('您真的要删除吗？')");
				Button3.Attributes.Add("onclick","return confirm('您真的要生成退货单吗?确认生成后数据不能修改!')");
				BindData ();
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
			this.save.Click += new System.EventHandler(this.save_Click);
			this.Button3.Click += new System.EventHandler(this.Button3_Click);
			this.Unload += new System.EventHandler(this.thrk_edit_Unload);
			this.Load += new System.EventHandler(this.Page_Load);
			this.PreRender += new System.EventHandler(this.thrk_edit_PreRender);

		}
		#endregion

		private void BindData ()
		{
			string cmd = "select *,[单价]*[退货数量] as 金额 from 退货单明细 where 1=1 and thid='"+Textbox2.Text+"'";
			DataSet ds = DBBase.ExecuteSql4Ds (cmd,"cksh");
			this.Datagrid1.DataSource = ds.Tables["cksh"].DefaultView;
			this.Datagrid1.DataBind ();
			cmd="select isnull(sum([单价]*[退货数量]),0) as 总金额 from 退货单明细 where 1=1 and thid='"+Textbox2.Text+"'";
			SqlDataReader dr = DBBase.ExecuteSqlReader (cmd);
			if (dr.HasRows)
			{
				if (dr.Read())
					if (dr["总金额"]!=null)
						Textbox8.Text=Convert.ToDouble(dr["总金额"].ToString()).ToString();
					else
						Textbox8.Text="0";
			}
			else
				Textbox8.Text="0";
			
			dr.Close();
			//Textbox8.Text=Convert.ToString(Convert.ToDouble(this.Textbox9.Text)*Convert.ToDouble(this.Textbox5.Text)/10);

		}

		private void save_Click(object sender, System.EventArgs e)
		{
			//string id = this.Request.QueryString["cpid"];
			if (this.Textbox1.Text=="") 
			{
				utils.Alert (this,"客户名称不能为空");
				return;
			}
			if (this.roleid.ToString()!="6")//总会计
			if (Convert.ToDouble(this.Textbox8.Text)<0) 
			{
				utils.Alert (this,"金额小于0!");
				return;
			}
			string id = this.Request.QueryString["thid"];
			  string strcmd="";
			if (id==null)
			{
				strcmd="insert into 退货单 ([thid],[店名], [退还金额], [客户名称], [退货日期],[客户电话], [备注], [经办人], [电话], [主管审核], [地区],总会计审核,销售单号,状态,wldwid) values('";
				strcmd+=Textbox2.Text+"','"+this.jgmc.ToString()+"',";
				strcmd+=this.Textbox8.Text.Trim()+",'";
				strcmd+= this.Textbox1.Text.ToString()+"','";
				strcmd+=Textbox3.Text+"','";
			//	strcmd+=this.Textbox4.Text.ToString()+"','";
				strcmd+=this.Textbox5.Text.ToString()+"','";
				strcmd+=this.Textbox6.Text.ToString()+"','";
				strcmd+=this.czy.Text.ToString()+"','";
				strcmd+=this.Textbox7.Text.ToString()+"','";
				strcmd+="否','";
				strcmd+=this.zjgmc.ToString()+"','否','"+this.Textbox10.Text.ToString()+"','1','"+txtwldwid.Text+"')";
			}
			else//更新的话
			{
				strcmd="update 退货单 set 退还金额="+Textbox8.Text+" where thid='"+id+"'";
			}
			try
			{
				DBBase.ExecuteSql (strcmd);//保存退货单
				utils.Alert (this,"保存成功!");
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
			Session["thmxid"]=null;
			string id = utils.FindFirstCheckedItem(this.Datagrid1);
			Session.Add("thmxid",id);
			u.OpenIEWindowRight(this,"thrk_addmx.aspx?thid="+Textbox2.Text,600,350);
		}

		private void Button2_Click(object sender, System.EventArgs e)
		{
			string id = utils.FindFirstCheckedItem(this.Datagrid1);
			string cmd="delete 退货单明细  where thmxid='"+id+"'";
			DBBase.ExecuteSql (cmd);
			BindData ();
		}
		private string Checksl ()
		{
			SqlCommand sqlCmd=new SqlCommand();
			SqlConnection sqlCon=new SqlConnection(this.Application["strconn"].ToString ());
			//string cmd="SELECT 销售单.地区, 销售单明细.产品名称, 销售单明细.销售数量,销售单.销售日期 AS 日期, 销售单明细.xsid, 销售单.店名,销售单明细.xsdmxid, 销售单明细.cpid, 销售单明细.单价,销售单明细.零售价 FROM 销售单明细 INNER JOIN 销售单 ON 销售单明细.xsid = 销售单.xsid and ";
			string cmd="SELECT 地区,店名,cpid,产品名称,sum(退货数量)as 退货数量 FROM [V退货明细] where 1=1 ";
			cmd+=" and thid='"+this.Textbox2.Text+"' group by 地区,店名,cpid,产品名称";
			sqlCmd.Connection=sqlCon;
			sqlCon.Open();
			sqlCmd.CommandText=cmd;
			double i=0;
			string s="";
			SqlDataReader dr =sqlCmd.ExecuteReader();
			while (dr.Read ())
			{
				i=Convert.ToDouble(dr["退货数量"].ToString ());
				cmd="select 店名,cpid,产品名称,sum(入库数量-剩余数量) as 总数量 from 入库单 where (入库数量-供退)>(剩余数量-供退+客退) and (单据标志='正常' or 单据标志='结转') and 店名='"+dr["店名"].ToString()+"' and cpid='"+dr["cpid"].ToString()+"' group by 店名,cpid,产品名称";
				SqlDataReader dr1 =DBBase.ExecuteSqlReader(cmd);
				dr1.Read();
				s=dr["产品名称"].ToString();
				if (dr1.HasRows)
				{
					if (i>Convert.ToDouble(dr1["总数量"].ToString()))//库存数量不足
					{
						dr1.Close();
						sqlCon.Close();
						return s;
					}
				}
				else
				{
					dr1.Close();
					sqlCon.Close();
					return s;//没有库存
				}
			}
			dr.Close();
			sqlCon.Close();
			return "0";
		}
		private void Button3_Click(object sender, System.EventArgs e)
		{
		    string sqlstr="select  单据状态 from 退货单 where thid='"+this.Request.QueryString["thid"].ToString()+"'";
			SqlDataReader dr1 = DBBase.ExecuteSqlReader (sqlstr);
			dr1.Read ();
			sqlstr=dr1["单据状态"].ToString();
			if (sqlstr=="完成")
			{
				dr1.Close();
				utils.Alert (this,"该单据已经生成退货单!");
				return;
			}
			dr1.Close();
			try
			{
     			string dqrq1=string.Format("{0:yyyy-MM-dd}",DateTime.Now);
				string dqrq2=string.Format("{0:yyyy-MM-01}",DateTime.Now);

				string err=Checksl();
				if (err.ToString()!="0")
				{
					utils.Alert (this,err+"数量不足,或无可退商品!");
					return;
				}
				SqlConnection sqlCon=new SqlConnection(this.Application["strconn"].ToString ());
				SqlConnection sqlCon1=new SqlConnection(this.Application["strconn"].ToString ());
				SqlConnection sqlCon2=new SqlConnection(this.Application["strconn"].ToString ());
				SqlCommand sqlCmd=new SqlCommand();
				SqlCommand sqlCmd1=new SqlCommand();
				SqlCommand sqlCmd2=new SqlCommand();
				sqlCmd1.Connection=sqlCon1;
				sqlCmd2.Connection=sqlCon2;
				sqlCmd.Connection=sqlCon;
				sqlCon.Open();
				sqlCon1.Open();
				sqlCon2.Open();
				//string cmd="SELECT 销售单.地区, 销售单明细.产品名称, 销售单明细.销售数量,销售单.销售日期 AS 日期, 销售单明细.xsid, 销售单.店名,销售单明细.xsdmxid, 销售单明细.cpid, 销售单明细.单价,销售单明细.零售价 FROM 销售单明细 INNER JOIN 销售单 ON 销售单明细.xsid = 销售单.xsid and ";
				//cmd+=" 销售单明细.xsid='"+this.Textbox2.Text+"'";
				string cmd="select * from V退货明细 where thid='"+this.Textbox2.Text+"'";
				sqlCmd.CommandText=cmd;
				SqlDataReader dr =sqlCmd.ExecuteReader();//退货数量
				sqlCmd1.CommandText="select * from 销售单 where 1<>1";//无用的链接
				dr1=sqlCmd1.ExecuteReader();
				string s="";
				while (dr.Read ())
				{
					double thsl=Convert.ToDouble(dr["退货数量"].ToString ());
					////产品数量小于库存继续，按照批次减掉产品数量
					dr1.Close();
					cmd="select *,(剩余数量-供退+客退) as 剩余数量1,(入库数量-供退) as 实际数量 from 入库单 where 单据标志='正常' and (剩余数量-供退+客退)<(入库数量-供退) and 店名='"+dr["店名"].ToString()+"' and cpid='"+dr["cpid"].ToString()+"' order by 入库日期 desc,rkid desc";
					sqlCmd1.CommandText=cmd;
					dr1 = sqlCmd1.ExecuteReader();
					while (dr1.Read () || (thsl!=0))
					{
						double sysl=Convert.ToDouble(dr1["剩余数量1"].ToString());
						double rksl=Convert.ToDouble(dr1["实际数量"].ToString());
						if (thsl!=0)
						if ((rksl-sysl)>=thsl) //实际数量-剩余数量>退货数量
						{
							//string str="update 销售明细批次 set 剩余数量=剩余数量+"+thsl.ToString()+" where zdbm ="+dr1["zdbm"].ToString();
							
							//	string 	str="update 入库单 set 剩余数量=剩余数量+"+thsl.ToString()+" where rkid ='"+dr1["rkid"].ToString()+"'";
								string 	str="update 入库单 set 客退=客退+"+thsl.ToString()+" where rkid ='"+dr1["rkid"].ToString()+"'";
								sqlCmd2.CommandText=str;
								sqlCmd2.ExecuteNonQuery();
								cmd="INSERT INTO [销售明细批次]([xsdmxid], [cpid], [出库数量], [零售价], [rkid], [进货价], [出库日期], [可退数量],thid)";
								cmd+="VALUES('','"+dr1["cpid"].ToString()+"',";
								cmd+="-"+thsl.ToString()+","+dr["单价"].ToString()+",'"+dr1["rkid"].ToString()+"',";
								cmd+=dr1["进货价"].ToString()+",'"+dqrq1.Trim()+"',-"+thsl.ToString()+",'"+this.Textbox2.Text+"')";
								sqlCmd2.CommandText=cmd;
								sqlCmd2.ExecuteNonQuery();
								thsl=0;
						}
						else
						{
							string 	str="update 入库单 set 客退=客退+"+(rksl-sysl).ToString()+" where rkid ='"+dr1["rkid"].ToString()+"'";
							sqlCmd2.CommandText=str;
							sqlCmd2.ExecuteNonQuery();
							cmd="INSERT INTO [销售明细批次]([xsdmxid], [cpid], [出库数量], [零售价], [rkid], [进货价], [出库日期], [可退数量],thid)";
							cmd+="VALUES('','"+dr1["cpid"].ToString()+"',";
							cmd+="-"+(rksl-sysl).ToString()+","+dr["单价"].ToString()+",'"+dr1["rkid"].ToString()+"',";
							cmd+=dr1["进货价"].ToString()+",'"+dqrq1.Trim()+"',"+"-"+(rksl-sysl).ToString()+",'"+this.Textbox2.Text+"')";
							sqlCmd2.CommandText=cmd;
							sqlCmd2.ExecuteNonQuery();
							thsl=thsl-(rksl-sysl);
						}
					}
				}
				
				dr.Close ();
				sqlCon.Close();
				sqlCon1.Close();
				sqlCon2.Close();
				//----------------------------------------------------------
				dr.Close();
				string cmd2 = "select isnull(sum(出库数量*进货价),0) as chengben from 销售明细批次 where 出库数量<0 and  thid='" + Textbox2.Text + "'";
				double chengben=0;
				dr = DBBase.ExecuteSqlReader (cmd2);
				while (dr.Read ())
				{
					chengben=chengben+Convert.ToDouble(dr["chengben"].ToString ());
				}
				dr.Close();
				string[] cmdma=new string[4];
				string id = utils.Getbm("cwid","地区财务",string.Format("{0:yyyyMMdd}",DateTime.Now),4);
				cmdma[0]="insert into 地区财务( [cwid], [店名], [地区], [thid], [客户], [经办人], [时间1], [时间2], [总金额], [预收定金], [退货成本], [其他], [日期1], [日期2], [是否结算])values('";
				cmdma[0]+=id+"','";
				cmdma[0]+=this.jgmc.ToString()+"','";
				cmdma[0]+=this.zjgmc.ToString()+"','";
				cmdma[0]+=Textbox2.Text+"','";
				cmdma[0]+=Textbox1.Text+"','";
				cmdma[0]+=this.czy.Text.ToString()+"','";
				cmdma[0]+=Textbox3.Text+"','";
				cmdma[0]+=dqrq1.ToString()+"',0-";//////////
				cmdma[0]+=this.Textbox8.Text.Trim()+",";
				//cmdma[0]+=this.Textbox8.Text+",";
				cmdma[0]+="0,";
				cmdma[0]+=chengben.ToString()+",'";
				cmdma[0]+="退货收入"+"','";
				cmdma[0]+=dqrq1.ToString()+"','";
				cmdma[0]+=dqrq2.ToString()+"','否')";
				id = utils.Getbm("cnzid","地区出纳",string.Format("{0:yyyyMMdd}",DateTime.Now),4);
				cmdma[1]="insert into 地区出纳( [cnzid], [日期], [地区], [摘要], [借方], [贷方], [余额], [其他])values('";
				cmdma[1]+=id+"','";
				cmdma[1]+=dqrq1.ToString()+"','";
				cmdma[1]+=this.zjgmc.ToString()+"','";
				cmdma[1]+="退货产品预收款"+"',";
				cmdma[1]+="0,";
				cmdma[1]+=this.Textbox8.Text+",0-";
				cmdma[1]+=Textbox8.Text+",'";
				cmdma[1]+="退货店"+this.jgmc.ToString()+"退货单号:"+Textbox2.Text+"')";
				id = utils.Getbm("kjid","地区会计",string.Format("{0:yyyyMMdd}",DateTime.Now),4);
				cmdma[2]="insert into 地区会计([kjid], [日期], [地区], [摘要], [借方], [贷方], [余额], [其他])values('";
				cmdma[2]+=id+"','";
				cmdma[2]+=dqrq1.ToString()+"','";
				cmdma[2]+=this.zjgmc.ToString()+"','";
				cmdma[2]+="退货总计金额"+"',";
				cmdma[2]+="0,";
				cmdma[2]+=this.Textbox8.Text+",0-";
				cmdma[2]+=Textbox8.Text+",'";
				cmdma[2]+="退货店"+this.jgmc.ToString()+"退货单号:"+Textbox2.Text+"')";
				cmdma[3]="update 退货单 set 单据状态='完成' where thid='"+this.Request.QueryString["thid"].ToString()+"'";
				DBBase.ExecuteSqls (cmdma);
				utils.Alert (this,"保存成功!");
				JSUtil.Close(this);
			}
			catch
			{
				utils.Alert (this,"数据保存失败");
				return;
			}
		}

		private void thrk_edit_Unload(object sender, System.EventArgs e)
		{
		
		}

		private void thrk_edit_PreRender(object sender, System.EventArgs e)
		{
			this.RegisterHiddenField("HiddenCommon",Request["HiddenCommon"]);
		}
	}
}
