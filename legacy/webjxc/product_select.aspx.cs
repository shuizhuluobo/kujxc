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
 
namespace jxc
{
	/// <summary>
	/// product_select 的摘要说明。
	/// </summary>
	public class product_select : System.Web.UI.Page
	{
		protected System.Web.UI.HtmlControls.HtmlInputHidden control;
		protected System.Web.UI.WebControls.DataGrid Datagrid1;
		protected System.Web.UI.HtmlControls.HtmlInputHidden Hidden1;
		protected dgNavigation DgNavigation1;
		protected System.Web.UI.WebControls.TextBox cpname;
		protected System.Web.UI.WebControls.Button query;

		utils u = new utils ();
		private void Page_Load(object sender, System.EventArgs e)
		{
			u.SetGridStyle (this.Datagrid1);
			DgNavigation1.SetTarget(Datagrid1,null,new BindDataDelegate(BindData));//BindData是你的数据邦定事件
			DgNavigation1.SetStyle(20, true);//10表示每页分10行，true表示无分页时自动隐藏
			if (!this.Page.IsPostBack)
			{
				control.Value = this.Request.QueryString["textbox"];
				Hidden1.Value = this.Request.QueryString["hidtextbox"];
				BindData ();
			}
		}

		private void BindData ()
		{
			string cmd = "SELECT cpid + ',' + 产品名称 as id,cpid, 产品名称, [型号], [色号], [规格], [价格], [经办人], [是否下柜], [修改日期] FROM 产品信息 where 1=1 ";
			if (this.cpname.Text != string.Empty)
				cmd += " and 产品名称 like '%" + this.cpname.Text.Trim () + "%'";
			DataSet ds = DBBase.ExecuteSql4Ds (cmd,"product");
			this.Datagrid1.DataSource = ds.Tables[0].DefaultView;
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
			this.query.Click += new System.EventHandler(this.query_Click);
			this.Datagrid1.ItemCommand += new System.Web.UI.WebControls.DataGridCommandEventHandler(this.Datagrid1_ItemCommand);
			this.Datagrid1.ItemDataBound += new System.Web.UI.WebControls.DataGridItemEventHandler(this.Datagrid1_ItemDataBound);
			this.Load += new System.EventHandler(this.Page_Load);

		}
		#endregion

		private void Datagrid1_ItemCommand(object source, System.Web.UI.WebControls.DataGridCommandEventArgs e)
		{
			string listid = this.Datagrid1.DataKeys[e.Item.ItemIndex].ToString ();
			string [] arrays=listid.Split(',');
		
			string  strScript = "<script>var txt='" +  control.Value + "'";
			strScript += ";window.opener.document.getElementById(txt).value='";
			strScript += arrays[1];
			strScript += "';window.opener.document.forms(0)." + this.Hidden1.Value + ".value='";
			strScript += arrays[0];
			strScript += "';self.close()";
			strScript += ";window.opener.__doPostBack(txt,'')";
				
			strScript += "</" + "script>";
			RegisterClientScriptBlock("anything",strScript);
		}

		private void Datagrid1_ItemDataBound(object sender, System.Web.UI.WebControls.DataGridItemEventArgs e)
		{
			if (e.Item.ItemType != ListItemType.Pager && 
				e.Item.ItemType != ListItemType.Header &&
				e.Item.ItemType != ListItemType.Footer )
			{
				e.Item.Attributes.Add("onmouseover","this.bgColor='oldlace';this.style.cursor='hand'");
				e.Item.Attributes.Add("onmouseout","this.bgColor='white'");
			}
		}

		private void query_Click(object sender, System.EventArgs e)
		{
			BindData();
		}
	}
}
