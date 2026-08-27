using System;
using System.Collections;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Web;
using System.Web.SessionState;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Web.UI.HtmlControls;

namespace jxc.message
{
	/// <summary>
	/// send_sms 的摘要说明。
	/// </summary>
	public class send_sms : jxc.UsrControl.UserPage
	{
		protected System.Web.UI.WebControls.Button send;
		protected System.Web.UI.WebControls.TextBox sms;
		protected System.Web.UI.WebControls.DataList DataList1;
	
		private void Page_Load(object sender, System.EventArgs e)
		{
			if (!this.Page.IsPostBack)
			{
				
				string cmd = "select glydh,glyname from cnc_glyb";
				DataSet ds = DBBase.ExecuteSql4Ds (cmd,"rs_jgglb");
				this.DataList1.DataSource = ds.Tables["rs_jgglb"].DefaultView;
				this.DataList1.DataBind ();

				
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
			this.send.Click += new System.EventHandler(this.send_Click);
			this.Load += new System.EventHandler(this.Page_Load);

		}
		#endregion

		private void send_Click(object sender, System.EventArgs e)
		{
			ArrayList al = new ArrayList ();
			for (int i=0;i<this.DataList1.Items.Count;i++)
			{
				CheckBox cb = (CheckBox) this.DataList1.Items[i].FindControl("prename");
				if (cb.Checked)
				{
					Label lbjbghs = (Label) this.DataList1.Items[i].FindControl("lbjgbhs");
					al.Add (lbjbghs.Text.Trim ());
				}
			}
			if (al.Count == 0)
			{
				utils.Alert (this,"你没有选择任何人");
				return;
			}
			string [] cmds = new string[al.Count];
			for (int i=0;i<al.Count;i++)
			{
				string jgbhs = al[i].ToString ();
				cmds[i] = "insert into icme_sms (sender,receiver,content,sendsj,ifread) values('" + this.glydh + "','" + jgbhs + "','" + this.sms.Text.Trim () + "',getdate(),0)";
			}
			
			try
			{
				DBBase.ExecuteSqls (cmds);
				utils.Alert (this,"发送成功");
				JSUtil.Close(this);
			}
			catch(Exception ee)
			{
				utils.Alert (this,"存盘失败,系统已恢复到保存前的状态" + ee.Message);
			}

		}
	}
}
