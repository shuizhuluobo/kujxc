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
	/// xsdb_add 的摘要说明。
	/// </summary>
	public class xsdb_edit :jxc.UsrControl.UserPage//System.Web.UI.Page// 
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
			utils u = new utils ();
		private void Page_Load(object sender, System.EventArgs e)
		{
			if (!this.Page.IsPostBack)


			{
				Textbox2.Text= this.Request.QueryString["id"];

				string cmd = "SELECT [xsid], [销售单号], [店名], [总计金额], [预付定金], [客户名称], [销售日期], [取货日期], [客户电话], [备注], [经办人], [电话], [审核通过], [地区] FROM [销售单] where xsid='" + Textbox2.Text + "'";
				SqlDataReader dr = DBBase.ExecuteSqlReader (cmd);
				if (dr.Read ())
				{
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
			this.Datagrid1.DataBinding += new System.EventHandler(this.Datagrid1_DataBinding);
			this.Datagrid1.ItemDataBound += new System.Web.UI.WebControls.DataGridItemEventHandler(this.Datagrid1_ItemDataBound);
			this.Datagrid1.SelectedIndexChanged += new System.EventHandler(this.Datagrid1_SelectedIndexChanged);
			this.Button1.Click += new System.EventHandler(this.Button1_Click);
			this.Load += new System.EventHandler(this.Page_Load);

		}
		#endregion

		private void BindData ()
		{
			string cmd = "select * from 销售单明细 where 1=1 and xsid='"+Textbox2.Text+"'";
			DataSet ds = DBBase.ExecuteSql4Ds (cmd,"xsdb");
			this.Datagrid1.DataSource = ds.Tables["xsdb"].DefaultView;
			this.Datagrid1.DataBind ();
		}

		private void save_Click(object sender, System.EventArgs e)
		{
//			//string id = this.Request.QueryString["cpid"];
//			if (this.Textbox1.Text=="") 
//			{
//				utils.Alert (this,"客户名称不能为空");
//				return;
//			}
//			if (Convert.ToDouble(this.Textbox8.Text)<=0) 
//			{
//				utils.Alert (this,"总计金额不能为0");
//				return;
//			}
//            string dqrq1=string.Format("{0:yyyy-MM-dd}",DateTime.Now);
//            string dqrq2=string.Format("{0:yyyy-MM-01}",DateTime.Now);
//			string cmd2 = "select [xsdmxid], [xsid], [产品名称], [cpid], [产品型号], [销售数量],[rkid],[单价]*[销售数量] as chengben from 销售单明细 where xsid='" + Textbox2.Text + "'";
//			double chengben=0;
//			SqlDataReader dr = DBBase.ExecuteSqlReader (cmd2);
//			if (dr.Read ())
//			{
//				//									Textbox2.Text=dr["cpid"].ToString();
//				//									this.cpname.Text = dr["销售数量"].ToString ();
//									
//				chengben=chengben+Convert.ToDouble(dr["chengben"].ToString ());
//				string cmd1="update 入库单 set 剩余数量=(剩余数量-"+dr["销售数量"].ToString ()+") where rkid='"+dr["rkid"].ToString ()+"'";
//				DBBase.ExecuteSql (cmd1);
//				
//			}
//			dr.Close ();
//			string[] cmd=new string[4];
//			cmd[0]="insert into 销售单 ([xsid],[店名], [总计金额], [预付定金], [客户名称], [销售日期], [取货日期], [客户电话], [备注], [经办人], [电话], [审核通过], [地区]) values('";
//			cmd[0]+=Textbox2.Text+"','"+this.jgmc.ToString()+"',";
//			cmd[0]+=this.Textbox8.Text.Trim()+",";
//			cmd[0]+= this.Textbox9.Text+",'";
//			cmd[0]+= this.Textbox1.Text.ToString()+"','";
//			cmd[0]+=this.Textbox3.Text.ToString()+"','";
//			cmd[0]+=this.Textbox4.Text.ToString()+"','";
//			cmd[0]+=this.Textbox5.Text.ToString()+"','";
//			cmd[0]+=this.Textbox6.Text.ToString()+"','";
//			cmd[0]+=this.glyname.ToString()+"','";
//			cmd[0]+=this.Textbox7.Text.ToString()+"','";
//			cmd[0]+="否','";
//			cmd[0]+=this.zjgmc.ToString()+"')";
//
//			//cmd[3]="insert into 地区总账(zzid,日期,地区,摘要,借方,贷方,余额,其他,分类,单据号)values('"+rkid+"','"+DateTime.Now.ToString("yyyy-MM-dd")+"','"+this.jgmc.ToString()+"','调拨回款',0,"+Convert.ToDouble(this.Textbox6.Text)*Convert.ToDouble(this.Textbox5.Text)+","+Convert.ToDouble(this.Textbox6.Text)*Convert.ToDouble(this.Textbox5.Text)+",'调到"+DropDownListlx.SelectedItem.ToString()+"','调拨回款','"+Textbox2.Text.Trim()+"')";
//			//			rkid=System.Guid.NewGuid().ToString();
//			//cmd[4]="insert into 地区总账(zzid,日期,地区,摘要,借方,贷方,余额,其他,分类,单据号)values('"+rkid+"','"+DateTime.Now.ToString("yyyy-MM-dd")+"','"+this.jgmc.ToString()+"','调拨',"+Convert.ToDouble(this.Textbox6.Text)*Convert.ToDouble(this.Textbox5.Text)+",0,"+Convert.ToDouble(this.Textbox6.Text)*Convert.ToDouble(this.Textbox5.Text)+",'从"+Textbox4.Text.ToString()+"调拨','调拨','"+Textbox2.Text.Trim()+"')";
//			string id = utils.Getbm("cwid","地区财务",string.Format("{0:yyyyMMdd}",DateTime.Now),4);
//			cmd[1]="insert into 地区财务( [cwid], [店名], [地区], [xsid], [客户], [经办人], [时间1], [时间2], [总金额], [预收定金], [销售成本], [其他], [日期1], [日期2], [是否结算])values('";
//			cmd[1]+=id+"','";
//			cmd[1]+=this.jgmc.ToString()+"','";
//			cmd[1]+=this.zjgmc.ToString()+"','";
//			cmd[1]+=Textbox2.Text+"','";
//			cmd[1]+=Textbox1.Text+"','";
//			cmd[1]+=this.glyname.ToString()+"','";
//			cmd[1]+=Textbox3.Text+"','";
//			cmd[1]+=Textbox4.Text+"',";
//			cmd[1]+=this.Textbox8.Text.Trim()+",";
//			cmd[1]+=this.Textbox9.Text+",";
//			cmd[1]+=chengben.ToString()+",'";
//			cmd[1]+="销售收入"+"','";
//			cmd[1]+=dqrq1.ToString()+"','";
//			cmd[1]+=dqrq2.ToString()+"','否')";
//			id = utils.Getbm("cnzid","地区出纳",string.Format("{0:yyyyMMdd}",DateTime.Now),4);
//			cmd[2]="insert into 地区出纳( [cnzid], [日期], [地区], [摘要], [借方], [贷方], [余额], [其他])values('";
//			cmd[2]+=id+"','";
//			cmd[2]+=dqrq1.ToString()+"','";
//			cmd[2]+=this.zjgmc.ToString()+"','";
//			cmd[2]+="销售产品预收款"+"',";
//			cmd[2]+=this.Textbox9.Text+",";
//			cmd[2]+="0,";
//			cmd[2]+=Textbox9.Text+",'";
//			cmd[2]+="销售店"+this.jgmc.ToString()+"销售单号:"+Textbox2.Text+"')";
//			id = utils.Getbm("kjid","地区会计",string.Format("{0:yyyyMMdd}",DateTime.Now),4);
//			cmd[3]="insert into 地区会计([kjid], [日期], [地区], [摘要], [借方], [贷方], [余额], [其他])values('";
//			cmd[3]+=id+"','";
//			cmd[3]+=dqrq1.ToString()+"','";
//			cmd[3]+=this.zjgmc.ToString()+"','";
//			cmd[3]+="销售总计金额"+"',";
//			cmd[3]+=this.Textbox8.Text+",";
//			cmd[3]+="0,";
//			cmd[3]+=Textbox8.Text+",'";
//			cmd[3]+="销售店"+this.jgmc.ToString()+"销售单号:"+Textbox2.Text+"')";
//		
//// '添加财务信息
//// sql333="insert into 地区财务(unit,kufang,xsid,kehu,jbr,shijian,shijian2,money_tt,money_in,money_out,qt,sj,sj2)values('"&oas_userdept&"','"&unit&"','"&xsid&"','"&xs3&"','"&oas_name&"','"&xs5&"','"&qh5&"',"&s2&","&s3&","&chengben&",'销售收入','"&date()&"','"&year(date())&"年"&month(date())&"月')"
//// sqlchuna="insert into 地区出纳(sj,unit,zhaiyao,jf,df,yu,qt)values('"&date()&"','"&unit&"','销售产品预收款','"&s3&"',0,'"&s3&"','销售店:"&oas_userdept&"<br>销售单号："&xsid&"')"
//// sqlkuaiji="insert into 地区会计(sj,unit,zhaiyao,jf,df,yu,qt)values('"&date()&"','"&unit&"','销售总计金额','"&s2&"',0,'"&s2&"','销售店:"&oas_userdept&",销售单号："&xsid&"')"
//
//
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

		private void Datagrid1_SelectedIndexChanged(object sender, System.EventArgs e)
		{
		
		}

		private void Button1_Click(object sender, System.EventArgs e)
		{
			string xx="";string id="";string cpid="";
				foreach (DataGridItem item in Datagrid1.Items)
				{
					if (((CheckBox) item.Cells[1].FindControl("selectcheck")).Checked)
					{
						DropDownList list =(DropDownList)item.Cells[2].FindControl("DropDownList1");
						xx=list.SelectedItem.Value.ToString();  
						id=Datagrid1.DataKeys [item.ItemIndex].ToString ();
						cpid=item.Cells[7].Text.ToString();
						
					}
				}
			if (xx!="")
			{//1.是否需要调拨2.调拨仓库是否存在
			    string	cmd2 = "SELECT 已调拨 FROM 销售单明细 where xsdmxid='"+id.ToString()+"'";
				SqlDataReader dr = DBBase.ExecuteSqlReader (cmd2);
				if (dr.Read ())
				{
					if (dr["已调拨"].ToString()=="已")
					{
						utils.Alert (this,"该产品已经调拨,不能重复调拨!");
						return;
					}
				}
		    	 cmd2 = "SELECT 剩余数量 FROM 入库单 WHERE 仓库名称 = '"+xx.ToString()+"' and cpid='"+cpid+"'";
				if (DBBase.IsValuesExists(cmd2)==false)
				{
				    utils.Alert (this,"该仓库不存在该产品!");
					return;
				}
				dr.Close();
				/*cmd2 = "SELECT sum(剩余数量) as 剩余数量 FROM 入库单 WHERE 仓库名称 = '"+this.zjgmc.ToString()+"' and cpid='"+cpid+"'";
				SqlDataReader dr = DBBase.ExecuteSqlReader (cmd2);
				if (dr.Read ())
				{
					if (Convert.ToDouble(dr["剩余数量"].ToString())>=0)
					{
						utils.Alert (this,"该产品不需要调拨!");
						return;
					}
				}*/
				cmd2 = " select [xsdmxid], [xsid], [产品名称], [cpid], [产品型号], [销售数量],[rkid],[制作明细] from 销售单明细 where xsdmxid='"+id.ToString()+"'";
				dr = DBBase.ExecuteSqlReader (cmd2);
				dr.Read ();
				string[] cmd=new string[6];

                //入库单
				string cmd3 = " select * from 入库单 WHERE 仓库名称 = '"+xx.ToString()+"' and cpid='"+cpid+"'";
				SqlDataReader dr1 = DBBase.ExecuteSqlReader (cmd3);
				dr1.Read ();
				string dbid = utils.Getbm("rkid","入库单",string.Format("{0:yyyyMMdd}",DateTime.Now),4);
				cmd[1] = "INSERT INTO [入库单]([rkid], [产品名称], [cpid], [仓库名称], [操作员], [入库数量],[剩余数量], [入库单价],[入库日期], [到货确认], [库保确认]) VALUES(";
				cmd[1] += "'" + dbid + "','" + dr["产品名称"].ToString() + "','" + dr["cpid"].ToString() + "','" + this.zjgmc.ToString()+ "','";
				cmd[1] +=this.czy.Text.ToString() +"'," + dr["销售数量"].ToString() + ","+ dr["销售数量"].ToString() + "," +  dr1["入库单价"].ToString() + ",'"+string.Format("{0:yyyy-MM-dd}",DateTime.Now)+"','否','是')";
				cmd[2]="update [入库单] set [剩余数量]=[剩余数量]-"+dr["销售数量"].ToString()+" where rkid='"+dr1["rkid"].ToString()+"'";
				string zzid=System.Guid.NewGuid().ToString();
				cmd[3]="insert into 地区总账(zzid,日期,地区,摘要,借方,贷方,余额,其他,分类,单据号)values('"+zzid+"','"+DateTime.Now.ToString("yyyy-MM-dd")+"','"+xx.ToString()+"','调拨回款',0,"+Convert.ToDouble(dr["销售数量"].ToString())*Convert.ToDouble(dr1["入库单价"].ToString())+","+Convert.ToDouble(dr["销售数量"].ToString())*Convert.ToDouble(dr1["入库单价"].ToString())+",'调到"+this.zjgmc.ToString()+"','调拨回款','"+dbid+"')";
				zzid=System.Guid.NewGuid().ToString();
				cmd[4]="insert into 地区总账(zzid,日期,地区,摘要,借方,贷方,余额,其他,分类,单据号)values('"+zzid+"','"+DateTime.Now.ToString("yyyy-MM-dd")+"','"+this.zjgmc.ToString()+"','调拨',"+Convert.ToDouble(dr["销售数量"].ToString())*Convert.ToDouble(dr1["入库单价"].ToString())+",0,"+Convert.ToDouble(dr["销售数量"].ToString())*Convert.ToDouble(dr1["入库单价"].ToString())+",'从"+xx.ToString()+"调拨','调拨','"+dbid+"')";
				cmd[5]="update 销售单明细 set 已调拨='已' where xsdmxid='"+id.ToString()+"'";

				//调拨单
				 dbid = utils.Getbm("dbid","调拨单",string.Format("{0:yyyyMMdd}",DateTime.Now),4);
				cmd[0]="insert into 调拨单 ([dbid], [cpid], [产品名称], [调拨仓库], [原仓库], [操作员], [调拨数量], [调拨说明],  [确认到货],[xsid],[rkid]) values('";
				cmd[0]+=dbid+"','"+dr["cpid"].ToString()+"','";
				cmd[0]+=dr["产品名称"].ToString()+"','";
				cmd[0]+= this.zjgmc.ToString()+"','";
				cmd[0]+= xx.ToString()+"','";
				cmd[0]+=this.glyname.ToString()+"',";
				cmd[0]+=dr["销售数量"].ToString()+",'";
				cmd[0]+=dr["制作明细"].ToString()+"','否','"+dr["xsid"].ToString()+"','"+dr1["rkid"].ToString()+"')";
				dr1.Close();
				dr.Close();
			try
				{
					DBBase.ExecuteSqls (cmd);
					utils.Alert (this,"调拨成功");
				   BindData ();
				}
				catch
				{
					utils.Alert (this,"保存失败");
				}


//sql2="insert into zongzhang(sj,unit,zhaiyao,jf,df,yu,qt,fenlei)values('"&date()&"','"&rk4&"','调拨回款',0,"&csng(db001)*cp62&",'"&csng(db001)*cp62&"','调到"&rk4_1&"',3)"
//sql3="insert into zongzhang(sj,unit,zhaiyao,jf,df,yu,qt,fenlei)values('"&date()&"','"&rk4_1&"','调拨',"&csng(db001)*csng(cp62)&",0,'"&csng(db001)*csng(cp62)&"','从"&rk4&"调货',2)"

			}
 
		}

		private void Datagrid1_DataBinding(object sender, System.EventArgs e)
		{
		
		}

		private void Datagrid1_ItemDataBound(object sender, System.Web.UI.WebControls.DataGridItemEventArgs e)
		{
			// if(e.Item.ItemType == ListItemType.EditItem) //如果出现“未将对象引用设置到对象的实例”的错误，多半缺少这一判断或者是ListItemType选择错误。

			if ((e.Item.ItemType == ListItemType.Item)||(e.Item.ItemType == ListItemType.AlternatingItem))  
			{
				DataSet ds = DBBase.ExecuteSql4Ds ("select jgmc,jgmc from cnc_jgglb where parent1='01' and jgmc<>'"+this.jgmc.ToString()+"'","xsdb");
//				utils.BindDropDownList("select jgmc,jgmc from cnc_jgglb where parent1='01'",this.DropDownListlx);
//
				DropDownList drop = (DropDownList)e.Item.FindControl("DropDownList1");

				drop.DataTextField = "jgmc";

				drop.DataValueField ="jgmc";

				drop.DataSource = ds.Tables[0].DefaultView;

				drop.DataBind();
			}
			//  确定是数据行而非页首或页尾
			if (e.Item.ItemType == ListItemType.Item || e.Item.ItemType == ListItemType.AlternatingItem)
			{
				//  取得 manager 字段的值
				string isManager = (string)DataBinder.Eval(e.Item.DataItem, "已调拨");

				if (isManager == "否")
				{
					//  设置文本及背景颜色.
					e.Item.Cells[6].Text = "未调拨";
					e.Item.Cells[6].ForeColor=System.Drawing.Color.Red;
				}
				else
				{
					//  仅设置文本.
					//e.Item.Cells[2].Text = "";
					e.Item.Cells[6].Text = "已调拨";
					e.Item.Cells[6].ForeColor=System.Drawing.Color.Blue;
				}
			}
		}
	}
}
