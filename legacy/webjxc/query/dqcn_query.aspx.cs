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
using jxc.ascx;

namespace jxc.webjxc.query
{
	/// <summary>
	/// dqcn_query 的摘要说明。
	/// </summary>
	public class dqcn_query :jxc.UsrControl.UserPage//System.Web.UI.Page//  
	{
		protected System.Web.UI.WebControls.Button query;
		protected System.Web.UI.WebControls.DataGrid Datagrid1;
	
		protected dgNavigation DgNavigation1;
		protected System.Web.UI.WebControls.DropDownList DropDownList1;
		protected System.Web.UI.WebControls.TextBox Textbox1;
		protected System.Web.UI.WebControls.CheckBox CheckBox1;
		protected System.Web.UI.WebControls.Button Button1;
		protected System.Web.UI.WebControls.Label Label1;
		protected System.Web.UI.WebControls.TextBox Textbox2;
		protected System.Web.UI.WebControls.DropDownList Dropdownlist2;
		utils u = new utils ();
		private void Page_Load(object sender, System.EventArgs e)
		{
			u.JudgePower(this,this.roleid,this.Request.ServerVariables["SCRIPT_NAME"]); 
			u.SetGridStyle(this.Datagrid1);
			DgNavigation1.SetTarget(Datagrid1,null,new BindDataDelegate(BindData));//BindData是你的数据邦定事件
			DgNavigation1.SetStyle(20, false);//10表示每页分10行，true表示无分页时自动隐藏
			
			if (!this.Page.IsPostBack)
			{
				Textbox1.Text=string.Format("{0:yyyy-MM-dd}",DateTime.Now);
				Textbox2.Text=string.Format("{0:yyyy-MM-dd}",DateTime.Now);
				utils.BindDropDownList("select jgmc,jgmc from cnc_jgglb where parent1='01'",this.DropDownList1);
				BindData ();
			}
		}
		private void BindData ()
		{
			string cmd = "SELECT [cnzid], [日期], [地区], [摘要], [借方], [贷方], [余额], [其他],[凭证号] FROM [地区出纳] where 1=1 ";
			string cmd1="";

			if (this.DropDownList1.SelectedIndex!=0)
				cmd1+=" and 地区='"+this.DropDownList1.SelectedValue.ToString()+"'";
//			if (CheckBox1.Checked)
//				cmd1+=" and 日期='"+this.Textbox1.Text.ToString()+"'";
			if (CheckBox1.Checked)
				cmd1+=" and 日期 between '"+this.Textbox1.Text.ToString()+"' and '"+this.Textbox2.Text.ToString()+"' ";
			if (this.Dropdownlist2.SelectedIndex!=0)
				cmd1+=" and "+Dropdownlist2.SelectedValue.ToString()+"<>0 ";
			if (this.groupname.ToString()!="0")
			{
				cmd1+=" and 地区='"+this.zjgmc.ToString()+"'";
				DropDownList1.Enabled=false;
			}
			if (this.groupname.ToString()=="3") 
				Button1.Enabled=true;
			DataSet ds = DBBase.ExecuteSql4Ds (cmd+cmd1+" order by 凭证号 desc","dbd");
			this.Datagrid1.DataSource = ds.Tables[0].DefaultView;
			this.Datagrid1.DataBind ();
			cmd = "select sum(借方)as 借方,sum(贷方)as 贷方,sum(借方)-sum(贷方) as 余额 from 地区出纳 where 1=1 ";
			SqlDataReader dr = DBBase.ExecuteSqlReader (cmd+cmd1);
			if (dr.Read ())
			{
				if (dr["借方"].ToString()!="")
				{
					Label1.Text="合计 借方:"+dr["借方"].ToString();
					Label1.Text+=" 贷方:"+dr["贷方"].ToString();
					Label1.Text+=" 余额:"+dr["余额"].ToString();

//					Label1.Text="合计 借方:"+dr["借方"].ToString().Substring(0,dr["借方"].ToString().Length-2);
//					Label1.Text+=" 贷方:"+dr["贷方"].ToString().Substring(0,dr["贷方"].ToString().Length-2);
//					Label1.Text+=" 余额:"+dr["余额"].ToString().Substring(0,dr["余额"].ToString().Length-2);

//					float   b=float.Parse(dr["借方"].ToString());   
//					Label1.Text="合计 借方:"+b.ToString("f2",System.Globalization.NumberFormatInfo.InvariantInfo);
//					b=float.Parse(dr["贷方"].ToString()); 
//					Label1.Text+=" 贷方:"+b.ToString("f2",System.Globalization.NumberFormatInfo.InvariantInfo);
//					b=float.Parse(dr["余额"].ToString()); 
//					Label1.Text+=" 余额:"+b.ToString("f2",System.Globalization.NumberFormatInfo.InvariantInfo);
				}
				else
					Label1.Text="";
//				float   b=float.Parse(dr["借方"].ToString());   
//				Label1.Text="合计 借方:"+b.ToString("f2",System.Globalization.NumberFormatInfo.InvariantInfo);
//				b=float.Parse(dr["贷方"].ToString()); 
//				Label1.Text+=" 贷方:"+b.ToString("f2",System.Globalization.NumberFormatInfo.InvariantInfo);
//				b=float.Parse(dr["余额"].ToString()); 
//				Label1.Text+=" 余额:"+b.ToString("f2",System.Globalization.NumberFormatInfo.InvariantInfo);
			}
			dr.Close ();
//			string cmd = "SELECT [cnzid], [日期], [地区], [摘要], [借方], [贷方], [余额], [其他] FROM [地区出纳]";
//			DataSet ds = DBBase.ExecuteSql4Ds (cmd,"dbd");
//			this.Datagrid1.DataSource = ds.Tables[0].DefaultView;
//			this.Datagrid1.DataBind ();
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
			this.Button1.Click += new System.EventHandler(this.Button1_Click);
			this.Datagrid1.ItemDataBound += new System.Web.UI.WebControls.DataGridItemEventHandler(this.Datagrid1_ItemDataBound);
			this.Load += new System.EventHandler(this.Page_Load);

		}
		#endregion

		private void query_Click(object sender, System.EventArgs e)
		{
			BindData ();
		}

		private void Button1_Click(object sender, System.EventArgs e)
		{
			u.OpenIEWindowRight(this,"dqcn_edit.aspx",550,450);
		}

		private void Datagrid1_ItemDataBound(object sender, System.Web.UI.WebControls.DataGridItemEventArgs e)
		{
			//  确定是数据行而非页首或页尾
			if (e.Item.ItemType == ListItemType.Item || e.Item.ItemType == ListItemType.AlternatingItem)
			{
				//  取得 manager 字段的值
				string isManager =Convert.ToString(DataBinder.Eval(e.Item.DataItem, "借方"));
				if (Convert.ToDouble(isManager)!=0) 
				{
					e.Item.Cells[7].Text="借";
				}
				isManager =Convert.ToString(DataBinder.Eval(e.Item.DataItem, "贷方"));
				if (Convert.ToDouble(isManager)!=0) 
				{
					e.Item.Cells[7].Text="贷";
				}
			}
		}
	}
}
