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
	/// sjsc_add 的摘要说明。
	/// </summary>
	public class sjsc_edit :jxc.UsrControl.UserPage//System.Web.UI.Page// 
	{
		protected System.Web.UI.WebControls.CheckBox CheckBox2;
		protected System.Web.UI.WebControls.CheckBox CheckBox3;
		protected System.Web.UI.WebControls.CheckBox CheckBox1;
		protected System.Web.UI.WebControls.TextBox txt_xsrq;
		protected System.Web.UI.WebControls.TextBox txt_dbrq;

		protected System.Web.UI.WebControls.Button save;
	
		private void Page_Load(object sender, System.EventArgs e)
		{
			if (!this.Page.IsPostBack)
			{
				this.txt_dbrq.Text=string.Format("{0:yyyy-MM-dd}",DateTime.Now.AddDays(-120));
				this.txt_xsrq.Text=this.txt_dbrq.Text.ToString();


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
			this.ID = "sjsc_edit";
			this.Load += new System.EventHandler(this.Page_Load);
			this.PreRender += new System.EventHandler(this.sjsc_edit_PreRender);

		}
		#endregion

		private void save_Click(object sender, System.EventArgs e)
		{
			string cmd="";
			if (this.CheckBox1.Checked)
			{
				cmd="delete 调拨单 where 调拨日期<'"+this.txt_dbrq.Text+"'";
				try
				{
					DBBase.ExecuteSql (cmd);
					utils.Alert (this,"调拨单删除成功");
				}
				catch
				{
					utils.Alert (this,"调拨单删除失败");
				}
			}
			if (this.CheckBox2.Checked)
			{
				cmd="select * from 销售单 where 销售日期<'"+this.txt_xsrq.Text+"'";
				string cmd1="delete 销售单 where 销售日期<'"+this.txt_xsrq.Text+"'";
				SqlDataReader dr = DBBase.ExecuteSqlReader (cmd);
				while (dr.Read ())
				{
                      cmd = "delete 销售单明细 where xsid='" + dr["xsid"].ToString() + "'";
					  DBBase.ExecuteSql (cmd);
				}
				try
				{
					DBBase.ExecuteSql (cmd1);
					utils.Alert (this,"销售单删除成功");
				}
				catch
				{
					utils.Alert (this,"销售单删除失败");
				}
				dr.Close();
			}
			if (this.CheckBox3.Checked)
			{
				cmd="delete 入库单 where 剩余数量=0";
				try
				{
					DBBase.ExecuteSql (cmd);
					utils.Alert (this,"入库单删除成功");
				}
				catch
				{
					utils.Alert (this,"入库单删除失败");
				}
			}
			//
			//			string[] cmd=new string[5];
			//			string rkid = utils.Getbm("dbid","调拨单",string.Format("{0:yyyyMMdd}",DateTime.Now),4);
			//            cmd[0]="insert into 调拨单 ([dbid], [cpid], [产品名称], [调拨仓库], [原仓库], [操作员], [调拨数量], [调拨说明],  [确认到货],[rkid]) values('";
			//			cmd[0]+=rkid+"','"+this.cpid.Text.Trim()+"','";
			//			cmd[0]+=this.cpname.Text.Trim()+"','";
			//			cmd[0]+= this.DropDownListlx.SelectedItem.Text+"','";
			//			cmd[0]+= this.Textbox4.Text.ToString()+"','";
			//			cmd[0]+=this.czy.Text.ToString()+"',";
			//			cmd[0]+=this.Textbox6.Text.ToString()+",'";
			//			cmd[0]+=this.Textbox7.Text.ToString()+"','否','"+this.Request.QueryString["rkid"]+"')";
			//            rkid = utils.Getbm("rkid","入库单",string.Format("{0:yyyyMMdd}",DateTime.Now),4);
			//			cmd[1] = "INSERT INTO [入库单]([rkid], [产品名称], [cpid], [仓库名称], [操作员], [入库数量],[剩余数量], [入库单价],[入库日期], [到货确认], [库保确认]) VALUES(";
			//			cmd[1] += "'" + rkid + "','" + this.cpname.Text.Trim () + "','" + this.cpid.Text.Trim () + "','" + this.DropDownListlx.SelectedItem.Text + "',";
			//			cmd[1] += "'总库保(调拨)'," + this.Textbox6.Text.Trim() + ","+ this.Textbox6.Text.Trim() + "," + this.Textbox5.Text.Trim()  + ",'"+rkrq.Text+"','否','是')";
			//            cmd[2]="update [入库单] set [剩余数量]=[剩余数量]-"+Textbox6.Text.Trim()+" where rkid='"+Textbox2.Text.Trim()+"'";
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
		private void sjsc_edit_PreRender(object sender, System.EventArgs e)
		{

		}
	}
}
