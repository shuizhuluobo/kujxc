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

namespace jxc.admin
{
	/// <summary>
	/// desktop 的摘要说明。
	/// </summary>
	public class desktop : jxc.UsrControl.UserPage
	{
		protected System.Web.UI.WebControls.ImageButton ImageButton1;
		protected System.Web.UI.WebControls.ImageButton ImageButton2;
		protected System.Web.UI.WebControls.ImageButton ImageButton3;
		protected System.Web.UI.WebControls.ImageButton ImageButton4;
		protected System.Web.UI.WebControls.ImageButton ImageButton5;
		protected System.Web.UI.WebControls.ImageButton ImageButton6;
		protected System.Web.UI.WebControls.ImageButton ImageButton7;
		protected System.Web.UI.WebControls.ImageButton ImageButton8;
		utils u = new utils ();
		private void Page_Load(object sender, System.EventArgs e)
		{
			if (!this.Page.IsPostBack)
			{
//				BindData ();
//				BindData2 ();
			}
		}

//		private void BindData ()
//		{
//			string cmd = "select top 10 bh,bt,fbsj,(select judgename from rs_corsub where listid=judgeczy) as judge,(case iffinish when 0 then '<font color=red>审批中</font>' when '1' then '审批通过' when '2' then '待定' else '不通过' end) as status,finishdate,(select des from b_streamtype where b_streamtype.id=type) as type from t_master where zz='" + this.glydh + "' order by fbsj desc";
//			
//			DataSet ds = DBBase.ExecuteSql4Ds (cmd,"cnc_qxcdb");
//			this.Datagrid1.DataSource = ds.Tables["cnc_qxcdb"].DefaultView;
//			this.Datagrid1.DataBind ();
//		}
//
//		private void BindData2 ()
//		{
//			dboper oper = new dboper ();
//			SqlParameter[] prams = {
//									   oper.MakeInParam("@czy" , SqlDbType.NVarChar, 20,this.judger),
//									   oper.MakeInParam("@jgbh" , SqlDbType.NVarChar, 20,this.jgbh)
//								   };
//
//			SqlDataReader dr = null;
//			DataTable dt =null;
//			try 
//			{
//				oper.RunProc("p_getjudge",prams,out dr);
//				dt = u.ConvertDataReaderToDataTable(dr);
//				dr.Close ();
//			}
//			catch(Exception ex)
//			{
//				oper.shutdown ();
//				oper.Dispose ();
//				utils.Alert (this," 获取审批信息失败！" + ex.Message);
//				return;
//			}
//			
//			finally
//			{
//				oper.shutdown ();
//				oper.Dispose ();
//			}
//
//			//取得属于直接审批的数据
//			string cmd = "select bh,bt,fbsj,(select glyname from cnc_glyb where glydh=zz) as glyname,(select glyname from cnc_glyb where glydh=judgeczy)  as judge,(case iffinish when 0 then '<font color=red>审批中</font>' when '1' then '审批通过' when '2' then '待定' else '不通过' end) as status,finishdate  from t_master where sptype=1 and judgeczy='" + this.glydh + "'";
//			dr = DBBase.ExecuteSqlReader (cmd);
//			
//			//动态添加列
//			if (dr.HasRows)
//			{
//				DataTable schemaTable = dr.GetSchemaTable();
//
//				while(dr.Read())
//				{
//					DataRow myDataRow = dt.NewRow();
//					for(int i=0;i<schemaTable.Rows.Count;i++)
//					{
//						myDataRow[i] = dr[i].ToString();
//					}
//					dt.Rows.Add(myDataRow);
//					myDataRow = null;
//				}
//				schemaTable = null;
//			}
//			dr.Close ();
//
//			//管理员特殊对待
//			if (this.glydh == "admin")
//			{
//				cmd = "select bh,bt,fbsj,(select glyname from cnc_glyb where glydh=zz) as glyname,(select glyname from cnc_glyb where glydh=judgeczy)  as judge,(case iffinish when 0 then '审批中' when 1 then  '审批通过' when 2 then '待定' else '不通过'  end) as status,finishdate  from t_master where sptype=0 and iffinish=2";
//				dr = DBBase.ExecuteSqlReader (cmd);
//			
//				//动态添加列
//				if (dr.HasRows)
//				{
//					DataTable schemaTable = dr.GetSchemaTable();
//
//					while(dr.Read())
//					{
//						DataRow myDataRow = dt.NewRow();
//						for(int i=0;i<schemaTable.Rows.Count;i++)
//						{
//							myDataRow[i] = dr[i].ToString();
//						}
//						dt.Rows.Add(myDataRow);
//						myDataRow = null;
//					}
//					schemaTable = null;
//				}
//				dr.Close ();
//			}
//			
//			this.Datagrid2.DataSource = dt;
//			this.Datagrid2.DataBind ();
//		}

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
			this.ImageButton1.Click += new System.Web.UI.ImageClickEventHandler(this.ImageButton1_Click);
			this.ImageButton2.Click += new System.Web.UI.ImageClickEventHandler(this.ImageButton2_Click);
			this.ImageButton3.Click += new System.Web.UI.ImageClickEventHandler(this.ImageButton3_Click);
			this.ImageButton4.Click += new System.Web.UI.ImageClickEventHandler(this.ImageButton4_Click);
			this.ImageButton5.Click += new System.Web.UI.ImageClickEventHandler(this.ImageButton5_Click);
			this.ImageButton6.Click += new System.Web.UI.ImageClickEventHandler(this.ImageButton6_Click);
			this.ImageButton7.Click += new System.Web.UI.ImageClickEventHandler(this.ImageButton7_Click);
			this.ImageButton8.Click += new System.Web.UI.ImageClickEventHandler(this.ImageButton8_Click);
			this.Load += new System.EventHandler(this.Page_Load);

		}
		#endregion
//		1 总库保 
//			  2 地区管理员 
//					3 地区财务 
//						  4 销售员 
//								5 调货办 
//									  6 总会计 
//											7 总公司办公室 
//												  8 系统管理员 
//														9 仓管办 
//															  10 物流 


		private void ImageButton1_Click(object sender, System.Web.UI.ImageClickEventArgs e)
		{
			//商品下拨1
			if (this.roleid.ToString()!="1")
				utils.Alert (this,"你没有权限操作!");
			else
				this.Response.Redirect ("/webjxc/kcgl/spxb_manage.aspx");

		}

		private void ImageButton2_Click(object sender, System.Web.UI.ImageClickEventArgs e)
		{
			//销售4
			if (this.roleid.ToString()!="4")
				utils.Alert (this,"你没有权限操作!");
			else
				this.Response.Redirect ("/webjxc/xsgl/xsckmx_manage.aspx");
		}

		private void ImageButton3_Click(object sender, System.Web.UI.ImageClickEventArgs e)
		{
			//出库审核2
			if ((this.roleid.ToString()!="2")&(this.roleid.ToString()!="6"))
				utils.Alert (this,"你没有权限操作!");
			else
				this.Response.Redirect ("/webjxc/xsgl/ckshmx_manage.aspx");
		}

		private void ImageButton4_Click(object sender, System.Web.UI.ImageClickEventArgs e)
		{
//			//查看库存
//			if (this.roleid.ToString()!="2")
//				utils.Alert (this,"你没有权限操作!");
//			else
				this.Response.Redirect ("/webjxc/kcgl/kccx_query.aspx");
		}

		private void ImageButton5_Click(object sender, System.Web.UI.ImageClickEventArgs e)
		{
			//销售调拨
			if (this.roleid.ToString()!="2")
				utils.Alert (this,"你没有权限操作!");
			else
				this.Response.Redirect ("/webjxc/xsgl/xsdb/xsdbmx_manage.aspx");
		}

		private void ImageButton6_Click(object sender, System.Web.UI.ImageClickEventArgs e)
		{
			//消息管理
//			if (this.roleid.ToString()!="1")
//				utils.Alert (this,"你没有权限操作!");
//			else
				this.Response.Redirect ("/message/message_manage.aspx");
		}

		private void ImageButton7_Click(object sender, System.Web.UI.ImageClickEventArgs e)
		{
			//销售收入
			if ((this.roleid.ToString().Trim()!="3")&(this.roleid.ToString().Trim()!="4")&(this.roleid.ToString().Trim()!="6"))
				utils.Alert (this,"你没有权限操作!");
			else
				this.Response.Redirect ("/webjxc/query/dqcw_query.aspx");
		}

		private void ImageButton8_Click(object sender, System.Web.UI.ImageClickEventArgs e)
		{
			//样品查询
//			if (this.roleid.ToString()!="3")
//				utils.Alert (this,"你没有权限操作!");
//			else
				this.Response.Redirect ("/webjxc/kcgl/ypbglcx_manage.aspx");
		}
	}
}
