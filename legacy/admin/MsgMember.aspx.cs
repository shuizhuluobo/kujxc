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
	/// MsgMember 的摘要说明。
	/// </summary>
	public class MsgMember : System.Web.UI.Page
	{
		protected System.Web.UI.WebControls.Label lblInstruction;
		protected System.Web.UI.WebControls.Label lblSender;
		protected System.Web.UI.WebControls.TextBox txtRealName;
		protected System.Web.UI.WebControls.TextBox txtMsgID;
		protected System.Web.UI.WebControls.TextBox txtSender;
		protected System.Web.UI.WebControls.Label lblContent;
		protected System.Web.UI.WebControls.TextBox txtContent;
		protected System.Web.UI.WebControls.Label lblShortCut;
		protected System.Web.UI.WebControls.Button btnHistory;
		protected System.Web.UI.WebControls.Button btnReply;
		protected System.Web.UI.WebControls.Button btnNext;
		protected System.Web.UI.WebControls.Button btnRead;
		protected System.Web.UI.WebControls.Label Labelmemcode;
		protected System.Web.UI.WebControls.Label Label1;
	
		private void Page_Load(object sender, System.EventArgs e)
		{
			if(!Page.IsPostBack)
			{
				this.Labelmemcode.Text = this.Request.QueryString["jgbh"];;
				ReadMsg(this.Labelmemcode.Text);
				CheckNextMsg(this.Labelmemcode.Text);
				this.btnReply.CommandArgument="view";
			}
		}
		private void CheckNextMsg(string Username)
		{
			int count = 0;
			try
			{
				count = GetNewMsgCount(this.Labelmemcode.Text.Trim ());
				if(count>=2)
				{
					this.btnNext.Enabled = true;
				}
				else
				{
					this.btnNext.Enabled = false;
				}
			}
			catch
			{
				Server.Transfer("../Error.aspx");
			}

		}


		private void ReadMsg(string Username)
		{
			this.txtSender.Enabled = false;
			this.txtRealName.Enabled = false;
			this.txtContent.Enabled = false;
			this.btnReply.Enabled = true;
			this.btnHistory .Enabled = true;
			SqlDataReader dataReader = null; 
			try
			{
				string cmd = "select (select glyname from cnc_glyb where glydh=sender) as sender,receiver,content,id from icme_sms where receiver='" + this.Labelmemcode.Text.Trim () + "' and ifread=0";
				dataReader = DBBase.ExecuteSqlReader (cmd);
				if(dataReader.Read())
				{
					this.txtSender.Text  = dataReader["sender"].ToString();
					this.txtRealName.Text = dataReader["sender"].ToString();
					this.txtContent.Text = "信息为：" + dataReader["content"].ToString ();
					this.txtMsgID.Text   = dataReader["id"].ToString();
				}
				dataReader.Close ();
			}
			catch
			{
				if (dataReader!= null)
					dataReader.Close ();

				Server.Transfer("../Error.aspx");
			}
		}

		#region Web Form Designer generated code
		override protected void OnInit(EventArgs e)
		{
			//
			// CODEGEN：该调用是 ASP.NET Web 窗体设计器所必需的。
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
			this.btnNext.Click += new System.EventHandler(this.btnNext_Click);
			this.btnRead.Click += new System.EventHandler(this.btnRead_Click);
			this.Load += new System.EventHandler(this.Page_Load);

		}
		#endregion

		private void btnRead_Click(object sender, System.EventArgs e)
		{
			string Username = this.Labelmemcode.Text.Trim ();
			try
			{
				
				ReadMsg(this.txtMsgID.Text.ToString(),Username);
				Response.Write("<script language=javascript>window.opener.location.reload();window.close();</script>");
				
			}
			catch(Exception ex)
			{
				Server.Transfer("../Error.aspx");
			}

		}

		private void btnNext_Click(object sender, System.EventArgs e)
		{
			string Username = this.Labelmemcode.Text.Trim ();
			try
			{
				ReadMsg(this.txtMsgID.Text.ToString(),Username);
				Response.Redirect("MsgManage.aspx?jgbh=" + Username);
			}
			catch
			{
				Server.Transfer("../Error.aspx");
			}
		
		}

		private void btnReply_Click(object sender, System.EventArgs e)
		{
			/*
			string Username = Request.Cookies["Username"].Value.ToString();
			this.lblInstruction.Text = "回复消息";
			SMS sm = new SMS();

			#region 更新记录的已读状态
		
			try
			{
				sm.ReadMsg(this.txtMsgID.Text.ToString(),Username);
			}
			catch
			{
				Server.Transfer("../Error.aspx");
			}
			#endregion
			
			if(this.btnReply.CommandArgument=="view") //查看消息状态
			{
				btnReply.Text = "发送";
				btnReply.CommandArgument = "reply";
				btnRead.Visible = false;
				btnNext.Visible = false;
				lblSender.Text = "接收者";
				txtSender.Enabled = true;
				txtContent.Enabled = true;
				txtContent.Text = "";	
				this.lblShortCut.Text = "按Ctrl+回车键 发送消息 ";
			}
			else //发送消息状态
			{ //sender文本框变为receiver
				int Code = sm.SendMsg(Username,this.txtSender.Text,this.txtContent.Text,1,DateTime.Now,"",0,0);
				if(Code==1)
					Response.Write("<script language=javascript>alert('回复成功');window.opener.location.reload();window.close();</script>");
				else
					Response.Write("<script language=javascript>alert('回复失败');window.opener.location.reload();window.close();</script>");

			}
			*/
			
		}

		public int GetNewMsgCount (string username)
		{
			int count =0;
			SqlDataReader dr = DBBase.ExecuteSqlReader ("select count(*) from icme_sms where receiver='" +username + "' and ifread =0");
			if (dr.Read ())
			{
				count = Int32.Parse (dr[0].ToString ());
			}
			dr.Close ();
			return count;
		}

		void ReadMsg(string bh,string Username)
		{
			DBBase.ExecuteSql ("update icme_sms set ifread=1 where id=" + bh);
		}
	}
}
