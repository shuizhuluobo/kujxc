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
using jxc.ascx;

namespace jxc.admin
{
	/// <summary>
	/// judge_manage 的摘要说明。
	/// </summary>
	public class judge_manage : jxc.UsrControl.UserPage
	{
		protected System.Web.UI.WebControls.DataGrid Datagrid1;
		protected System.Web.UI.WebControls.Button add;
		
		protected dgNavigation DgNavigation1;
		protected System.Web.UI.WebControls.Button judge;
		protected System.Web.UI.WebControls.RadioButtonList RadioButtonList1;

		utils u = new utils ();
		private void Page_Load(object sender, System.EventArgs e)
		{
			u.SetGridStyle(this.Datagrid1);
			DgNavigation1.SetTarget(Datagrid1,null,new BindDataDelegate(BindData));//BindData是你的数据邦定事件
			DgNavigation1.SetStyle(16, true);//10表示每页分10行，true表示无分页时自动隐藏
			if (!this.Page.IsPostBack)
			{
				BindData ();
				
				if (this.glydh != "admin")
				{
					this.judge.Visible = false;
				}
				else
					this.add.Visible = false;
			}
		}

		private void BindData ()
		{
			if (this.RadioButtonList1.SelectedIndex == 0)
			{
				dboper oper = new dboper ();
				SqlParameter[] prams = {
										   oper.MakeInParam("@czy" , SqlDbType.NVarChar, 20,this.judger),
										   oper.MakeInParam("@jgbh" , SqlDbType.NVarChar, 20,this.jgbh)
									   };

				SqlDataReader dr = null;
				DataTable dt =null;
				try 
				{
					oper.RunProc("p_getjudge",prams,out dr);
					dt = u.ConvertDataReaderToDataTable(dr);
					dr.Close ();
				}
				catch(Exception ex)
				{
					oper.shutdown ();
					oper.Dispose ();
					utils.Alert (this," 获取审批信息失败！" + ex.Message);
					return;
				}
			
				finally
				{
					oper.shutdown ();
					oper.Dispose ();
				}

				//取得属于直接审批的数据
				string cmd = "select bh,bt,fbsj,(select glyname from cnc_glyb where glydh=zz) as glyname,(select glyname from cnc_glyb where glydh=judgeczy)  as judge,(case iffinish when 0 then '<font color=red>审批中</font>' when '1' then '审批通过' when '2' then '待定' else '不通过' end) as status,finishdate,0,(select des from b_streamtype where b_streamtype.id=type) as type  from t_master where sptype=1 and judgeczy='" + this.glydh + "' order by fbsj desc";
				dr = DBBase.ExecuteSqlReader (cmd);
			
				//动态添加列
				if (dr.HasRows)
				{
					DataTable schemaTable = dr.GetSchemaTable();

					while(dr.Read())
					{
						DataRow myDataRow = dt.NewRow();
						for(int i=0;i<schemaTable.Rows.Count;i++)
						{
							myDataRow[i] = dr[i].ToString();
						}
						dt.Rows.Add(myDataRow);
						myDataRow = null;
					}
					schemaTable = null;
				}
				dr.Close ();

				//管理员特殊对待
				if (this.glydh == "admin")
				{
					cmd = "select bh,bt,fbsj,(select glyname from cnc_glyb where glydh=zz) as glyname,(select glyname from cnc_glyb where glydh=judgeczy)  as judge,(case iffinish when 0 then '审批中' when 1 then  '审批通过' when 2 then '待定' else '不通过'  end) as status,finishdate,(select des from b_streamtype where b_streamtype.id=type) as type  from t_master where sptype=0 and iffinish=2 order by fbsj desc";
					dr = DBBase.ExecuteSqlReader (cmd);
			
					//动态添加列
					if (dr.HasRows)
					{
						DataTable schemaTable = dr.GetSchemaTable();

						while(dr.Read())
						{
							DataRow myDataRow = dt.NewRow();
							for(int i=0;i<schemaTable.Rows.Count;i++)
							{
								myDataRow[i] = dr[i].ToString();
							}
							dt.Rows.Add(myDataRow);
							myDataRow = null;
						}
						schemaTable = null;
					}
					dr.Close ();
				}

				this.Datagrid1.DataSource = dt;
				this.Datagrid1.DataBind ();
			}
			else if (this.RadioButtonList1.SelectedIndex == 1)
			{
				string cmd = "select bh,bt,fbsj,(select glyname from cnc_glyb where glydh=zz) as glyname,(select glyname from cnc_glyb where glydh=judgeczy)  as judge,(case iffinish when 0 then '<font color=red>审批中</font>' when '1' then '审批通过' when '2' then '待定' else '不通过' end) as status,(select des from b_streamtype where b_streamtype.id=type) as type  from t_master where sptype=1 and judgeczy='" + this.glydh + "' order by fbsj desc";
				SqlDataReader dr = DBBase.ExecuteSqlReader (cmd);
				DataTable dt = u.ConvertDataReaderToDataTable(dr);
				this.Datagrid1.DataSource = dt;
				this.Datagrid1.DataBind ();
				
			}
			else
			{
				dboper oper = new dboper ();
				SqlParameter[] prams = {
										   oper.MakeInParam("@czy" , SqlDbType.NVarChar, 20,this.judger),
										   oper.MakeInParam("@jgbh" , SqlDbType.NVarChar, 20,this.jgbh)
									   };

				SqlDataReader dr = null;
				DataTable dt =null;
				try 
				{
					oper.RunProc("p_getjudge",prams,out dr);
					dt = u.ConvertDataReaderToDataTable(dr);
					dr.Close ();
				}
				catch(Exception ex)
				{
					oper.shutdown ();
					oper.Dispose ();
					utils.Alert (this," 获取审批信息失败！" + ex.Message);
					return;
				}
			
				finally
				{
					oper.shutdown ();
					oper.Dispose ();
				}
				this.Datagrid1.DataSource = dt;
				this.Datagrid1.DataBind ();
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
			this.RadioButtonList1.SelectedIndexChanged += new System.EventHandler(this.RadioButtonList1_SelectedIndexChanged);
			this.add.Click += new System.EventHandler(this.add_Click);
			this.judge.Click += new System.EventHandler(this.judge_Click);
			this.Load += new System.EventHandler(this.Page_Load);

		}
		#endregion

		private void add_Click(object sender, System.EventArgs e)
		{
			string id = utils.FindFirstCheckedItem(this.Datagrid1);
			if (id == "")
			{
				utils.Alert (this,"至少选择一项");
				return;
			}
			u.OpenIEWindowRight (this,"judge.aspx?id=" + id,800,600);
		}

		private void judge_Click(object sender, System.EventArgs e)
		{
			string id = utils.FindFirstCheckedItem(this.Datagrid1);
			if (id == "")
			{
				utils.Alert (this,"至少选择一项");
				return;
			}
			u.OpenIEWindowRight (this,"gly_judge.aspx?id=" + id,800,600);
		}

		private void RadioButtonList1_SelectedIndexChanged(object sender, System.EventArgs e)
		{
			BindData ();
		}
	}
}
