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
	public class thrksp_edit :jxc.UsrControl.UserPage//System.Web.UI.Page// 
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
			utils u = new utils ();
		private void Page_Load(object sender, System.EventArgs e)
		{
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
					string sql="select [thid],[店名], [退还金额], 销售单号, [客户名称], [退货日期],  [客户电话], [备注], [经办人], [电话], [主管审核], [地区] from 退货单 where thid='"+id+"'";     
					SqlDataReader dr1 = DBBase.ExecuteSqlReader (sql);
					if (dr1.Read ())
					{
						rkrq.Text=dr1[1].ToString();
						Textbox1.Text=dr1[4].ToString();
						Textbox3.Text=dr1["退货日期"].ToString();
						Textbox8.Text=dr1["退还金额"].ToString();
						Textbox5.Text=dr1["客户电话"].ToString();
						Textbox6.Text=dr1["备注"].ToString();
						Textbox10.Text=dr1["销售单号"].ToString();
						czy.Text=dr1["经办人"].ToString();
						Textbox7.Text=dr1["电话"].ToString();
					}
					dr1.Close();

				}
				Button3.Attributes.Add("onclick","return confirm('您真的确认同意退货？ 确认后将发送到下一步!')");
				save.Attributes.Add("onclick","return confirm('您确认不同意退货？确认后将退回到上一步!')");
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
			this.save.Click += new System.EventHandler(this.save_Click);
			this.Button3.Click += new System.EventHandler(this.Button3_Click);
			this.Load += new System.EventHandler(this.Page_Load);

		}
		#endregion

		private void BindData ()
		{
			string cmd = "select * from 退货单明细 where 1=1 and thid='"+Textbox2.Text+"'";
			DataSet ds = DBBase.ExecuteSql4Ds (cmd,"cksh");
			this.Datagrid1.DataSource = ds.Tables["cksh"].DefaultView;
			this.Datagrid1.DataBind ();
		}

		private void save_Click(object sender, System.EventArgs e)
		{
			string id = this.Request.QueryString["thid"];
			//u.OpenIEWindowPrint(this,"xsprint.aspx?id="+id,750,550);
			string cmd="update 退货单 set 单据状态='回退',状态=1 where thid='"+id+"'";
			DBBase.ExecuteSql (cmd);
			utils.Alert (this,"回退成功!");
			JSUtil.Close(this);
		//	BindData ();
			//string id = this.Request.QueryString["cpid"];
//			if (this.Textbox1.Text=="") 
//			{
//				utils.Alert (this,"客户名称不能为空");
//				return;
//			}
//			if (this.roleid.ToString()!="6")//总会计
//			if (Convert.ToDouble(this.Textbox8.Text)<=0) 
//			{
//				utils.Alert (this,"金额小于0!");
//				return;
//			}
//			string id = this.Request.QueryString["thid"];
//			  string strcmd="";
//			if (id==null)
//			{
//				strcmd="insert into 退货单 ([thid],[店名], [退还金额], [客户名称], [退货日期],[客户电话], [备注], [经办人], [电话], [主管审核], [地区],总会计审核,销售单号) values('";
//				strcmd+=Textbox2.Text+"','"+this.jgmc.ToString()+"',";
//				strcmd+=this.Textbox8.Text.Trim()+",'";
//				strcmd+= this.Textbox1.Text.ToString()+"','";
//				strcmd+=DateTime.Now.ToString()+"','";
//			//	strcmd+=this.Textbox4.Text.ToString()+"','";
//				strcmd+=this.Textbox5.Text.ToString()+"','";
//				strcmd+=this.Textbox6.Text.ToString()+"','";
//				strcmd+=this.czy.Text.ToString()+"','";
//				strcmd+=this.Textbox7.Text.ToString()+"','";
//				strcmd+="否','";
//				strcmd+=this.zjgmc.ToString()+"','否','"+this.Textbox10.Text.ToString()+"')";
//			}
//			else//更新的话
//			{
//				strcmd="update 退货单 set 退还金额="+Textbox8.Text+" where thid='"+id+"'";
//			}
//			try
//			{
//				DBBase.ExecuteSql (strcmd);//保存退货单
//				utils.Alert (this,"保存成功!");
//				JSUtil.Close(this);
//			}
//			catch
//			{
//				utils.Alert (this,"保存失败");
//				return;
//			}

		}

		private void Datagrid1_SelectedIndexChanged(object sender, System.EventArgs e)
		{
		
		}

		private void Button1_Click(object sender, System.EventArgs e)
		{
			Session["thmxid"]=null;
			string id = utils.FindFirstCheckedItem(this.Datagrid1);
			Session.Add("thmxid",id);
			u.OpenIEWindowRight(this,"thrksp_addmx.aspx?thid="+Textbox2.Text,600,350);
		}

		private void Button2_Click(object sender, System.EventArgs e)
		{
			string id = utils.FindFirstCheckedItem(this.Datagrid1);
			string cmd="delete 退货单明细  where thdmxid='"+id+"'";
			DBBase.ExecuteSql (cmd);
			BindData ();
		}

		private void Button3_Click(object sender, System.EventArgs e)
		{
			string cmd="update 退货单 set 单据状态='发送',状态=3,主管审核='是' where thid='"+this.Request.QueryString["thid"].ToString()+"'";
			DBBase.ExecuteSql (cmd);
			utils.Alert (this,"发送成功!");
			JSUtil.Close(this);

//		    string sqlstr="select  单据状态 from 退货单 where thid='"+this.Request.QueryString["thid"].ToString()+"'";
//			SqlDataReader dr1 = DBBase.ExecuteSqlReader (sqlstr);
//			dr1.Read ();
//			sqlstr=dr1["单据状态"].ToString();
//			if (sqlstr=="完成")
//			{
//				utils.Alert (this,"该单据已经生成退货单!");
//				return;
//			}
//			dr1.Close();
//			try
//			{
//			string dqrq1=string.Format("{0:yyyy-MM-dd}",DateTime.Now);
//			string dqrq2=string.Format("{0:yyyy-MM-01}",DateTime.Now);
//			string cmd2 = "select [xsdmxid], [thid], [产品名称], [cpid], [产品型号], [退货数量],[rkid],[单价]*[退货数量] as chengben from 退货单明细 where thid='" + Textbox2.Text + "'";
//			double chengben=0;
//			SqlDataReader dr = DBBase.ExecuteSqlReader (cmd2);
//			while (dr.Read ())
//			{
//				chengben=chengben+Convert.ToDouble(dr["chengben"].ToString ());
//				string cmd1="";
//				if (Convert.ToDouble(dr["退货数量"].ToString ())>=0) 
//				
//					cmd1="update 入库单 set 剩余数量=(剩余数量-("+dr["退货数量"].ToString ()+")) where rkid='"+dr["rkid"].ToString ()+"'";
//				else
//					cmd1="update 入库单 set 剩余数量=(剩余数量+("+dr["退货数量"].ToString ()+")) where rkid='"+dr["rkid"].ToString ()+"'";
//				DBBase.ExecuteSql (cmd1);
//				
//			}
//			dr.Close ();
//			string[] cmd=new string[4];
//			string id = utils.Getbm("cwid","地区财务",string.Format("{0:yyyyMMdd}",DateTime.Now),4);
//			cmd[0]="insert into 地区财务( [cwid], [店名], [地区], [thid], [客户], [经办人], [时间1], [时间2], [总金额], [预收定金], [退货成本], [其他], [日期1], [日期2], [是否结算])values('";
//			cmd[0]+=id+"','";
//			cmd[0]+=this.jgmc.ToString()+"','";
//			cmd[0]+=this.zjgmc.ToString()+"','";
//			cmd[0]+=Textbox2.Text+"','";
//			cmd[0]+=Textbox1.Text+"','";
//			cmd[0]+=this.czy.Text.ToString()+"','";
//			cmd[0]+=Textbox3.Text+"','";
//			cmd[0]+=Textbox4.Text+"',";
//			cmd[0]+=this.Textbox8.Text.Trim()+",";
//			cmd[0]+=this.Textbox9.Text+",";
//			cmd[0]+=chengben.ToString()+",'";
//			cmd[0]+="退货收入"+"','";
//			cmd[0]+=dqrq1.ToString()+"','";
//			cmd[0]+=dqrq2.ToString()+"','否')";
//			id = utils.Getbm("cnzid","地区出纳",string.Format("{0:yyyyMMdd}",DateTime.Now),4);
//			cmd[1]="insert into 地区出纳( [cnzid], [日期], [地区], [摘要], [借方], [贷方], [余额], [其他])values('";
//			cmd[1]+=id+"','";
//			cmd[1]+=dqrq1.ToString()+"','";
//			cmd[1]+=this.zjgmc.ToString()+"','";
//			cmd[1]+="退货产品预收款"+"',";
//			cmd[1]+=this.Textbox9.Text+",";
//			cmd[1]+="0,";
//			cmd[1]+=Textbox9.Text+",'";
//			cmd[1]+="退货店"+this.jgmc.ToString()+"退货单号:"+Textbox2.Text+"')";
//			id = utils.Getbm("kjid","地区会计",string.Format("{0:yyyyMMdd}",DateTime.Now),4);
//			cmd[2]="insert into 地区会计([kjid], [日期], [地区], [摘要], [借方], [贷方], [余额], [其他])values('";
//			cmd[2]+=id+"','";
//			cmd[2]+=dqrq1.ToString()+"','";
//			cmd[2]+=this.zjgmc.ToString()+"','";
//			cmd[2]+="退货总计金额"+"',";
//			cmd[2]+=this.Textbox8.Text+",";
//			cmd[2]+="0,";
//			cmd[2]+=Textbox8.Text+",'";
//			cmd[2]+="退货店"+this.jgmc.ToString()+"退货单号:"+Textbox2.Text+"')";
//
//			cmd[3]="update 退货单 set 单据状态='完成' where thid='"+this.Request.QueryString["thid"].ToString()+"'";
//			DBBase.ExecuteSqls (cmd);
//				utils.Alert (this,"保存成功!");
//				JSUtil.Close(this);
//			}
//			catch
//			{
//				utils.Alert (this,"保存失败");
//				return;
//			}
		}
	}
}
