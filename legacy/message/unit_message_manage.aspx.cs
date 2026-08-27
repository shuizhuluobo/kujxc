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
using jxc.ascx;

namespace jxc.message
{
	/// <summary>
	/// unit_message_manage 的摘要说明。
	/// </summary>
	public class unit_message_manage : jxc.UsrControl.UserPage
	{
		protected System.Web.UI.WebControls.DataGrid Datagrid1;
	
		protected dgNavigation DgNavigation1;
		protected System.Web.UI.WebControls.CheckBox selectall;
		protected System.Web.UI.WebControls.Button add;
		protected System.Web.UI.WebControls.Button delete;
		utils u = new utils ();
	
		private void Page_Load(object sender, System.EventArgs e)
		{
			u.SetGridStyle(this.Datagrid1);
			DgNavigation1.SetTarget(Datagrid1,null,new BindDataDelegate(BindData));//BindData是你的数据邦定事件
			DgNavigation1.SetStyle(20, false);//10表示每页分10行，true表示无分页时自动隐藏
			if (!this.Page.IsPostBack)
			{
				BindData ();
				//delete.Attributes.Add("onclick","return confirm('您真的要删除吗？')");
			}
		}

		private void BindData ()
		{
			string cmd = "select id,(select glyname from cnc_glyb where glydh=sender) as sender,(select glyname from cnc_glyb where glydh=receiver) as receiver,content,sendsj,(case ifread when 1 then '已读' else '未读' end) as ifread from icme_sms where sender='" + this.glydh + "' or receiver='" + this.glydh + "' order by sendsj desc" ;
			DataSet ds = DBBase.ExecuteSql4Ds (cmd,"icme_sms");
			this.Datagrid1.DataSource = ds.Tables["icme_sms"].DefaultView;
			this.Datagrid1.DataBind ();
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
			this.add.Click += new System.EventHandler(this.add_Click);
			this.delete.Click += new System.EventHandler(this.delete_Click);
			this.Load += new System.EventHandler(this.Page_Load);

		}
		#endregion

		private void add_Click(object sender, System.EventArgs e)
		{
			u.OpenIEWindowRight (this,"send_sms.aspx",800,600);
		}

		private void delete_Click(object sender, System.EventArgs e)
		{
			string id = utils.FindFirstCheckedItem(this.Datagrid1);
			if (id == "")
			{
				utils.Alert (this,"请选择一项");
				return;
			}
			try
			{
				DBBase.ExecuteSql ("delete from icme_sms where id=" + id);
				utils.Alert (this,"删除成功");
				BindData ();
			}
			catch
			{
				utils.Alert (this,"删除失败");
			}
		}
	}
}
