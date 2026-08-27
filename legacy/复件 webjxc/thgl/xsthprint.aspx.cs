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
using System.Data.SqlClient;

namespace jxc.webjxc.xsgl
{
	/// <summary>
	/// xsprint 的摘要说明。
	/// </summary>
	public class xsthprint : System.Web.UI.Page
	{
		protected System.Web.UI.WebControls.Label Label1;
		protected System.Web.UI.WebControls.Label Label2;
		protected System.Web.UI.WebControls.Label Label3;
		protected System.Web.UI.WebControls.Label Label5;
		protected System.Web.UI.WebControls.Label Label7;
		protected System.Web.UI.WebControls.Label Label8;
		protected System.Web.UI.WebControls.Label Label9;
		protected System.Web.UI.WebControls.Label Label10;
		protected System.Web.UI.WebControls.Label Label11;
		protected System.Web.UI.WebControls.Label Label12;
		protected System.Web.UI.WebControls.DataGrid Datagrid1;
		private double runningTotal = 0;
		private double runningTotal1 = 0;
		protected System.Web.UI.WebControls.Label Label4;
		utils u = new utils ();
		private void Page_Load(object sender, System.EventArgs e)
		{
			// 在此处放置用户代码以初始化页面
			u.SetGridStyle1(this.Datagrid1);
			//u.SetGridStyle1(this.Datagrid2);
			if (!this.Page.IsPostBack)
			{
				//Label11.Text=string.Format("{0:yyyy-MM-dd}",DateTime.Now);
				string id = this.Request.QueryString["id"];
				if (id != string.Empty && id != null)
				{
					string cmd = "SELECT [xsid], [销售单号], [店名], 操作员,[总计金额], [预付定金], [客户名称], [销售日期], [取货日期], [客户电话], [备注], [经办人], [电话], [审核通过], [地区] FROM [销售单] where xsid='" + id + "'";
					SqlDataReader dr = DBBase.ExecuteSqlReader (cmd);
					if (dr.Read ())
					{
						Label11.Text=dr["xsid"].ToString();
						this.Label12.Text = dr["店名"].ToString ();
						//this.Label1.Text = dr["预付定金"].ToString ();
						float   b=float.Parse(dr["预付定金"].ToString ());   
						Label1.Text=b.ToString("f2",System.Globalization.NumberFormatInfo.InvariantInfo);   
						b=float.Parse(dr["总计金额"].ToString ());   
						Label2.Text=b.ToString("f2",System.Globalization.NumberFormatInfo.InvariantInfo);   
					//	dr["销售日期"].ToString ();
						if (dr["销售日期"].ToString ()!="")
						{
							DateTime dt1 =Convert.ToDateTime(dr["销售日期"].ToString ());
							Label3.Text=string.Format("{0:yyyy-MM-dd}",dt1);
						}
						if (dr["取货日期"].ToString ()!="")
						{
							DateTime dt =Convert.ToDateTime(dr["取货日期"].ToString ());
							Label5.Text=string.Format("{0:yyyy年MM月dd日}",dt);
						}
						
							this.Label4.Text = dr["客户名称"].ToString ();
						this.Label8.Text = dr["客户电话"].ToString ();
						this.Label7.Text = dr["备注"].ToString ();
						this.Label9.Text = dr["经办人"].ToString (); 
						this.Label10.Text = dr["操作员"].ToString (); 
					}
					dr.Close ();

				}
				BindData ();
			}	

		}
		private void BindData ()
		{
			string cmd = "select *,isnull([零售价]*[销售数量],0) as 金额 from 销售单明细 where 1=1 and xsid='"+this.Request.QueryString["id"].ToString()+"'";
			DataSet ds = DBBase.ExecuteSql4Ds (cmd,"cksh");
			this.Datagrid1.DataSource = ds.Tables["cksh"].DefaultView;
			this.Datagrid1.DataBind ();
//			this.Datagrid2.DataSource = ds.Tables["cksh"].DefaultView;
//			this.Datagrid2.DataBind ();
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
			this.Datagrid1.ItemDataBound += new System.Web.UI.WebControls.DataGridItemEventHandler(this.Datagrid1_ItemDataBound);
			this.Load += new System.EventHandler(this.Page_Load);

		}
		#endregion

		private void Datagrid1_SelectedIndexChanged(object sender, System.EventArgs e)
		{
		
		}

		private void Datagrid1_ItemDataBound(object sender, System.Web.UI.WebControls.DataGridItemEventArgs e)
		{
			if   (e.Item.ItemType   !=   ListItemType.Header)   
			{   
				e.Item.Cells[0].Text   =   (e.Item.DataSetIndex   +   1).ToString();   
			}
			if (e.Item.ItemType == ListItemType.Item || e.Item.ItemType == ListItemType.AlternatingItem)
				　
			{
				runningTotal=runningTotal+Convert.ToDouble(e.Item.Cells[3].Text);
				runningTotal1=runningTotal1+Convert.ToDouble(e.Item.Cells[5].Text);

			}
			else
				if(e.Item.ItemType == ListItemType.Footer )
			{
				e.Item.Cells[0].Text="合计:";
　　           e.Item.Cells[3].Text = string.Format("{0:F0}", runningTotal);
				e.Item.Cells[5].Text = string.Format("{0:F0}", runningTotal1);
			}

		}

		private void Datagrid2_ItemDataBound(object sender, System.Web.UI.WebControls.DataGridItemEventArgs e)
		{
			if   (e.Item.ItemType   !=   ListItemType.Header)   
			{   
				e.Item.Cells[0].Text   =   (e.Item.DataSetIndex   +   1).ToString();   
			}
		}
//		protected   string   test(float   i)   
//		{   
//  
//			//	return   i.ToString("f2",System.Globalization.NumberFormatInfo.InvariantInfo); 
//		}   

	}
}
