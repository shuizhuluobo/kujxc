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
	public class cksh_edit :jxc.UsrControl.UserPage// System.Web.UI.Page
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
		protected System.Web.UI.WebControls.Button save;
		protected System.Web.UI.WebControls.TextBox Textbox10;
		protected System.Web.UI.WebControls.TextBox Textbox9;
		protected System.Web.UI.WebControls.TextBox Textbox11;
		protected System.Web.UI.WebControls.TextBox Textbox12;
			utils u = new utils ();
		private void Page_Load(object sender, System.EventArgs e)
		{
			CodeSearch();
			if (!IsPostBack)
			{
			
				Textbox2.Text= this.Request.QueryString["rkid"];
				string cmd = "SELECT [xsid], [销售单号], [店名], [总计金额], [预付定金], [客户名称], [销售日期], [取货日期], [客户电话], [备注], [经办人], [电话], [审核通过], [地区] FROM [销售单] where xsid='" + Textbox2.Text + "'";
				SqlDataReader dr = DBBase.ExecuteSqlReader (cmd);
				if (dr.Read ())
				{
					Textbox10.Text=dr["审核通过"].ToString();
					if (Textbox10.Text=="是")
                     save.Enabled=false;
					//Textbox2.Text=dr["xsid"].ToString();
					this.rkrq.Text = dr["店名"].ToString ();
					float   b=float.Parse(dr["预付定金"].ToString ());   
					Textbox9.Text=b.ToString("f2",System.Globalization.NumberFormatInfo.InvariantInfo);   
					b=float.Parse(dr["总计金额"].ToString ());   
					Textbox8.Text=b.ToString("f2",System.Globalization.NumberFormatInfo.InvariantInfo);   
					if (dr["销售日期"].ToString ()!="")
					{
						DateTime dt1 =Convert.ToDateTime(dr["销售日期"].ToString ());
						Textbox3.Text=string.Format("{0:yyyy-MM-dd}",dt1);
					}
					if (dr["取货日期"].ToString ()!="")
					{
						DateTime dt =Convert.ToDateTime(dr["取货日期"].ToString ());
						Textbox4.Text=string.Format("{0:yyyy年MM月dd日}",dt);
					}
						
					this.Textbox5.Text = dr["客户电话"].ToString ();
					this.Textbox6.Text = dr["备注"].ToString ();
					this.Textbox1.Text = dr["客户名称"].ToString (); 
					this.Textbox7.Text = dr["电话"].ToString (); 
					this.czy.Text = dr["经办人"].ToString (); 
				}

					//utils.Getbm("xsid","销售单",this.glydh.ToString()+string.Format("{0:yyyyMM}",DateTime.Now),4);
				BindData ();
				save.Attributes.Add("onclick","return confirm('您确认审核通过？')");
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
			this.Datagrid1.ItemDataBound += new System.Web.UI.WebControls.DataGridItemEventHandler(this.Datagrid1_ItemDataBound);
			this.Datagrid1.SelectedIndexChanged += new System.EventHandler(this.Datagrid1_SelectedIndexChanged);
			this.Button1.Click += new System.EventHandler(this.Button1_Click);
			this.Button2.Click += new System.EventHandler(this.Button2_Click);
			this.Textbox11.TextChanged += new System.EventHandler(this.Textbox11_TextChanged);
			this.save.Click += new System.EventHandler(this.save_Click);
			this.Load += new System.EventHandler(this.Page_Load);
			this.PreRender += new System.EventHandler(this.cksh_edit_PreRender);

		}
		#endregion

		private void BindData ()
		{
			string cmd = "select * from 销售单明细 where 1=1 and xsid='"+Textbox2.Text+"'";
			DataSet ds = DBBase.ExecuteSql4Ds (cmd,"cksh");
			this.Datagrid1.DataSource = ds.Tables["cksh"].DefaultView;
			this.Datagrid1.DataBind ();
		}
		private string Checksl ()
		{
			SqlCommand sqlCmd=new SqlCommand();
			SqlConnection sqlCon=new SqlConnection(this.Application["strconn"].ToString ());
			//string cmd="SELECT 销售单.地区,sum(销售单明细.销售数量), 销售单明细.产品名称, 销售单明细.销售数量,销售单.销售日期 AS 日期,销售单明细.xsid, 销售单.店名,销售单明细.xsdmxid, 销售单明细.cpid, 销售单明细.单价,销售单明细.零售价 FROM 销售单明细 INNER JOIN 销售单 ON 销售单明细.xsid = 销售单.xsid ";
          //string cmd="select 地区,店名,cpid,产品名称,sum(销售数量)as 销售数量 from V销售明细 where 1=1 ";
			string cmd="SELECT 地区,店名,cpid,产品名称,sum(销售数量) as 总数量 FROM V销售明细 where 1=1 ";
			cmd+=" and xsid='"+this.Textbox2.Text+"' group by 地区,店名,cpid,产品名称";
			sqlCmd.Connection=sqlCon;
			sqlCon.Open();
			sqlCmd.CommandText=cmd;
			double i=0;
			string s="";
			SqlDataReader dr =sqlCmd.ExecuteReader();
			while (dr.Read ())
			{
				i=Convert.ToDouble(dr["总数量"].ToString ());
				cmd="select cpid,sum(剩余数量-供退+客退) as 总数量 from 入库单 where (单据标志='正常' or 单据标志='结转') and (剩余数量-供退+客退)>0 and 店名='"+dr["店名"].ToString()+"' and cpid='"+dr["cpid"].ToString()+"' group by cpid ";
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
		private void save_Click(object sender, System.EventArgs e)
		{
			if (Textbox11.Text=="")
			{
				utils.Alert (this,"送货人不能为空!");
				return;
			}
			string dqrq1=string.Format("{0:yyyy-MM-dd}",DateTime.Now);
			string dqrq2=string.Format("{0:yyyy-MM-01}",DateTime.Now);
			string err=Checksl();
			if (err.ToString()!="0")
			{
              	utils.Alert (this,err+"数量不足,或已经无退货记录!");
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
//			SqlTransaction Transaction1 ;
//			SqlTransaction Transaction2 ;
//			SqlTransaction Transaction3 ;
//			Transaction1= sqlCon.BeginTransaction();
//			Transaction2= sqlCon1.BeginTransaction();
//			Transaction3= sqlCon2.BeginTransaction();
//			sqlCmd.Transaction=Transaction1;
//			sqlCmd1.Transaction=Transaction2;
//			sqlCmd2.Transaction=Transaction3;
			
			try
			{
				//string cmd="SELECT [地区], [产品名称], [销售数量], [日期], [xsid], [店名], [xsdmxid], [cpid] ,单价,零售价 from V销售明细 where xsid='"+this.Textbox2.Text+"'";
			string cmd="SELECT 销售单.地区, 销售单明细.产品名称, 销售单明细.销售数量,销售单.销售日期 AS 日期, 销售单明细.xsid, 销售单.店名,销售单明细.xsdmxid, 销售单明细.cpid, 销售单明细.单价,销售单明细.零售价 FROM 销售单明细 INNER JOIN 销售单 ON 销售单明细.xsid = 销售单.xsid and ";
			       cmd+=" 销售单明细.xsid='"+this.Textbox2.Text+"'";
				sqlCmd.CommandText=cmd;
				SqlDataReader dr =sqlCmd.ExecuteReader();
				sqlCmd1.CommandText="select * from 销售单 where 1<>1";
				SqlDataReader dr1=sqlCmd1.ExecuteReader();
			string s="";
				while (dr.Read ())
				{
					double i=Convert.ToDouble(dr["销售数量"].ToString ());
					////产品数量小于库存继续，按照批次减掉产品数量
					dr1.Close();
					cmd="select *,(剩余数量-供退+客退) as 剩余数量1 from 入库单 where (单据标志='正常' or 单据标志='结转') and (剩余数量-供退+客退)>0 and 店名='"+dr["店名"].ToString()+"' and cpid='"+dr["cpid"].ToString()+"' order by 入库日期";
					sqlCmd1.CommandText=cmd;
					dr1 = sqlCmd1.ExecuteReader();
					while (dr1.Read () || (i!=0))
					{
						//double j=Convert.ToDouble(dr1["剩余数量1"].ToString());
						if (i>Convert.ToDouble(dr1["剩余数量1"].ToString()))
						{
								cmd="INSERT INTO [销售明细批次]([xsdmxid], [cpid], [出库数量], [零售价], [rkid], [进货价], [出库日期], [可退数量],xsid)";
								cmd+="VALUES('"+dr["xsdmxid"].ToString()+"','"+dr1["cpid"].ToString()+"',";
								cmd+=dr1["剩余数量1"].ToString()+","+dr["零售价"].ToString()+",'"+dr1["rkid"].ToString()+"',";
								cmd+=dr1["进货价"].ToString()+",'"+dqrq1.Trim()+"',"+dr1["剩余数量1"].ToString()+",'"+dr["xsid"].ToString()+"')";
								sqlCmd2.CommandText=cmd;
								sqlCmd2.ExecuteNonQuery();
								cmd="update 入库单 set 剩余数量=剩余数量-"+dr1["剩余数量1"].ToString()+" where rkid='"+dr1["rkid"].ToString()+"'";
								i=i-Convert.ToDouble(dr1["剩余数量1"].ToString());
								sqlCmd2.CommandText=cmd;
								sqlCmd2.ExecuteNonQuery();
						}
						else
						{
								cmd="INSERT INTO [销售明细批次]([xsdmxid], [cpid], [出库数量], [零售价], [rkid], [进货价], [出库日期], [可退数量],xsid)";
								cmd+="VALUES('"+dr["xsdmxid"].ToString()+"','"+dr1["cpid"].ToString()+"',";
								cmd+=i.ToString()+","+dr["零售价"].ToString()+",'"+dr1["rkid"].ToString()+"',";
								cmd+=dr1["进货价"].ToString()+",'"+dqrq1.Trim()+"',"+i.ToString()+",'"+dr["xsid"].ToString()+"')";
								sqlCmd2.CommandText=cmd;
								sqlCmd2.ExecuteNonQuery();
								cmd="update 入库单 set 剩余数量=剩余数量-"+i.ToString()+" where rkid='"+dr1["rkid"].ToString()+"'";
								i=0;
								sqlCmd2.CommandText=cmd;
								sqlCmd2.ExecuteNonQuery();
							
							}
					}
				}
                dr.Close();

				//string cmd2 = "select [xsdmxid], [xsid], [产品名称], [cpid], [产品型号], [销售数量],[rkid],[单价]*[销售数量] as chengben from 销售单明细 where xsid='" + Textbox2.Text + "'";
				string cmd2 = "select sum(出库数量*进货价) as chengben from 销售明细批次 where xsid='" + Textbox2.Text + "'";
				double chengben=0;
				dr = DBBase.ExecuteSqlReader (cmd2);
				while (dr.Read ())
				{
					chengben=chengben+Convert.ToDouble(dr["chengben"].ToString ());
				}
				dr.Close ();

				string[] cmda=new string[4];
				string id = utils.Getbm("cwid","地区财务",string.Format("{0:yyyyMMdd}",DateTime.Now),4);
				cmda[0]="insert into 地区财务( [cwid], [店名], [地区], [xsid], [客户], [经办人], [时间1], [总金额], [预收定金], [销售成本], [其他], [日期1], [日期2], [是否结算])values('";
				cmda[0]+=id+"','";
				cmda[0]+=this.jgmc.ToString()+"','";
				cmda[0]+=this.zjgmc.ToString()+"','";
				cmda[0]+=Textbox2.Text+"','";
				cmda[0]+=Textbox1.Text+"','";
				cmda[0]+=this.czy.Text.ToString()+"','";
				cmda[0]+=Textbox3.Text+"',";
				//cmd[0]+=Textbox4.Text+"',";
				cmda[0]+=this.Textbox8.Text.Trim()+",";
				cmda[0]+=this.Textbox9.Text+",";
				cmda[0]+=chengben.ToString()+",'";
				cmda[0]+="销售收入"+"','";
				cmda[0]+=dqrq1.ToString()+"','";
				cmda[0]+=dqrq2.ToString()+"','否')";
				id = utils.Getbm("cnzid","地区出纳",string.Format("{0:yyyyMMdd}",DateTime.Now),4);
				cmda[1]="insert into 地区出纳( [cnzid], [日期], [地区], [摘要], [借方], [贷方], [余额], [其他])values('";
				cmda[1]+=id+"','";
				cmda[1]+=dqrq1.ToString()+"','";
				cmda[1]+=this.zjgmc.ToString()+"','";
				cmda[1]+="销售产品收款"+"',";
				cmda[1]+=this.Textbox8.Text+",";
				cmda[1]+="0,";
				cmda[1]+=Textbox8.Text+",'";
				cmda[1]+="销售店"+this.jgmc.ToString()+"销售单号:"+Textbox2.Text+"')";
				id = utils.Getbm("kjid","地区会计",string.Format("{0:yyyyMMdd}",DateTime.Now),4);
				cmda[2]="insert into 地区会计([kjid], [日期], [地区], [摘要], [借方], [贷方], [余额], [其他])values('";
				cmda[2]+=id+"','";
				cmda[2]+=dqrq1.ToString()+"','";
				cmda[2]+=this.zjgmc.ToString()+"','";
				cmda[2]+="销售总计金额"+"',";
				cmda[2]+=this.Textbox8.Text+",";
				cmda[2]+="0,";
				cmda[2]+=Textbox8.Text+",'";
				cmda[2]+="销售店"+this.jgmc.ToString()+"销售单号:"+Textbox2.Text+"')";
				cmda[3]="update 销售单 set 审核通过='是',操作员='"+this.Textbox11.Text+"' where xsid='"+ Textbox2.Text+"'";//update by 2010-01-29

				DBBase.ExecuteSqls (cmda);
//		     	Transaction1.Commit();
//				//Transaction2.Commit();
//				Transaction3.Commit();
				utils.Alert (this,"审核通过!");
				sqlCon.Close();
				sqlCon1.Close();
				sqlCon2.Close();
				//u.OpenIEWindowRight(this,"cksh_zzxp.aspx?xsid="+Textbox2.Text,600,350);
				JSUtil.Close(this);
			}
			catch
			{
//				Transaction1.Rollback();
//			   // Transaction2.Rollback();
//				Transaction3.Rollback();
				sqlCon.Close();
				sqlCon1.Close();
				sqlCon2.Close();
				utils.Alert (this,"保存失败");
			}
		}

		private void Datagrid1_SelectedIndexChanged(object sender, System.EventArgs e)
		{
			//string Selection="";
//			string id = Datagrid1.SelectedItem.Cells[1].Text;
//			if (id!=null)
//			{
//				u.OpenIEWindowPrint(this,"cksh_zzxp.aspx?xsdmxid="+id,750,550);
//				//id = utils.FindFirstCheckedItem(this.Datagrid1);
//				string cmd="update 销售单明细 set 打印状态='已打印' where xsdmxid='"+id+"'";
//				DBBase.ExecuteSql (cmd);
//			}	
//			BindData ();
		}

		private void Button1_Click(object sender, System.EventArgs e)
		{
		}

		private void Button2_Click(object sender, System.EventArgs e)
		{
			string id = utils.FindFirstCheckedItem(this.Datagrid1);
			string cmd="delete 销售单明细  where test="+id;
			DBBase.ExecuteSql (cmd);
			BindData ();
		}

		private void Datagrid1_ItemDataBound(object sender, System.Web.UI.WebControls.DataGridItemEventArgs e)
		{
//			if (e.Item.ItemType == ListItemType.Item || e.Item.ItemType == ListItemType.AlternatingItem)
//			{
//				//  取得 manager 字段的值
//				string isManager =(string)DataBinder.Eval(e.Item.DataItem, "打印状态");
//
//				if (isManager == "已打印")
//				{
//					//  设置文本及背景颜色.
//					e.Item.Cells[6].Text = "已打";
//					e.Item.Cells[6].ForeColor=System.Drawing.Color.Blue;
//				}
//				else
//				{
//					//  仅设置文本.
//					//e.Item.Cells[2].Text = "";
//					e.Item.Cells[6].Text = "未打";
//					e.Item.Cells[6].ForeColor=System.Drawing.Color.Red;
//				}
//			}
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

				strScript = JSUtil.GetOpenDialogScript("人员选择","../CommonSearch/rySelect.aspx",550,650,"cksh");

				this.Textbox11.Attributes.Add("OnDblClick",strScript);

			}
			if(Session["Ret_Search_Value"]!=null)
			{
				if (Request["HiddenCommon"]!=null && Request["HiddenCommon"]!="")
				{
					switch(Request["HiddenCommon"].ToString())
					{
						case"人员选择":
							strs = Session["Ret_Search_Value"].ToString().Split(',');
							if (this.Textbox11.Text.ToString()!="")
							{
								this.Textbox11.Text = strs[0];
								//this.txtwldwid.Text = strs[0];
							}
							else
							{
								this.Textbox11.Text =strs[0];
								//this.txtwldwid.Text =strs[0];
							}
							this.ViewState["KindCommon"]=null;
							Session["Ret_Search_Value"]=null;
							break;
					}
				}
			}
			JSUtil.ExecuteBlock(this,"parent.frames[\"cksh\"].cksh.HiddenCommon.value=\"\"");

		}
		private void Textbox11_TextChanged(object sender, System.EventArgs e)
		{
		
		}

		private void cksh_edit_PreRender(object sender, System.EventArgs e)
		{
			this.RegisterHiddenField("HiddenCommon",Request["HiddenCommon"]);
		}
	}
}
