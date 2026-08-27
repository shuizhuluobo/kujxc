using System;
using System.Collections;
using System.ComponentModel;
using System.Data;
using System.Data.SqlClient ;
using System.Drawing;
using System.Web;
using System.Web.SessionState;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Web.UI.HtmlControls;

namespace jxc.admin
{
	/// <summary>
	/// goods_details 的摘要说明。
	/// </summary>
	public class goods_details : jxc.UsrControl.UserPage
	{
		protected System.Web.UI.WebControls.TextBox name;
		protected System.Web.UI.WebControls.RequiredFieldValidator RequiredFieldValidator2;
		protected System.Web.UI.WebControls.TextBox factory;
		protected System.Web.UI.WebControls.TextBox unitname;
		protected System.Web.UI.WebControls.Label lbl_Error;
		protected System.Web.UI.WebControls.Label lbl_type;
		protected System.Web.UI.WebControls.Label lbl_array;
		protected System.Web.UI.WebControls.TextBox market;
		public string bigpath = "";
		public string smallpath = "";
		protected System.Web.UI.WebControls.TextBox gdgg;
		protected System.Web.UI.WebControls.RequiredFieldValidator Requiredfieldvalidator6;
		protected System.Web.UI.WebControls.RequiredFieldValidator Requiredfieldvalidator7;
		protected System.Web.UI.WebControls.Button Add;
		utils u = new utils ();
		protected System.Web.UI.HtmlControls.HtmlForm Post;
		protected System.Web.UI.WebControls.TextBox introduce;
		protected System.Web.UI.WebControls.DropDownList pass;
		public string gdimg="";
		private void Page_Load(object sender, System.EventArgs e)
		{
			if (!this.Page.IsPostBack)
			{
				binddata ();
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
			this.Add.Click += new System.EventHandler(this.Add_Click);
			this.Load += new System.EventHandler(this.Page_Load);

		}
		#endregion

		
		private void binddata ()
		{
			dboper oper = new dboper ();
			string cmd = "select * from c_goodslist where gdid=" + this.Request.QueryString["id"];
			DataSet ds = new DataSet ();
			ds = oper.ReturnDt (cmd,"table");
			DataTable dt = ds.Tables ["table"];
			DataRow [] dr = dt.Select ();
			this.name.Text = dr[0]["gdname"].ToString ();
		//	this.type.Text = dr[0]["gdtype"].ToString ();
			this.gdgg.Text = dr[0]["gdgg"].ToString ();
		//	this.gdcolor.Text = dr[0]["gdcolor"].ToString ();
		//	this.outprice.Text = dr[0]["gdmktprice"].ToString();
		//	this.inprice.Text = dr[0]["gdshopprice"].ToString ();
		//	this.facprice.Text = (dr[0]["gdlowestprice"].ToString () == "0") ? "0.00" : dr[0]["gdlowestprice"].ToString () ;
			this.introduce.Text = dr[0]["gdcomment"].ToString ();
			this.market.Text = dr[0]["trademark"].ToString ();
		//	this.ranks.Text = dr[0]["gdadvancelevel"].ToString ();
			this.factory.Text = dr[0]["gdfactory"].ToString ();
			this.unitname.Text = dr[0]["unitname"].ToString ();
		//	this.sBody.Text  = dr[0]["gdimg"].ToString ();
		//	this.Freetextbox2.Text = dr[0]["gdjj"].ToString ();
			gdimg=dr[0]["gdimg"].ToString ();

			for (int i=0;i<this.pass.Items.Count;i++)
			{
				if (this.pass.Items[i].Value == dr[0]["pass"].ToString ())
				{
					this.pass.SelectedIndex = i;
					break;
				}
			}
			oper.shutdown ();
			oper.Dispose ();
		}

		private void Add_Click(object sender, System.EventArgs e)
		{
			dboper oper = new dboper ();
				
			string cmd = "update c_goodslist set pass=" + this.pass.SelectedItem.Value  
			
				+ " where gdid=" + this.Request.QueryString["id"];
			
			try
			{
				oper.Exec (cmd);
				utils.Alert (this,"审核商品成功");
			}
			catch (Exception ee)
			{
				utils.Alert (this,"审核商品失败，请与管理员联系");
			}
			finally
			{
				oper.shutdown ();
				oper.Dispose ();
			}
		}

	}
}
