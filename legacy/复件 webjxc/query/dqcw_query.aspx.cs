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
	/// dqcw_query 的摘要说明。
	/// </summary>
	public class dqcw_query : jxc.UsrControl.UserPage//System.Web.UI.Page//  
	{
		protected System.Web.UI.WebControls.DropDownList DropDownList1;
		protected System.Web.UI.WebControls.Button query;
		protected System.Web.UI.WebControls.DataGrid Datagrid1;
	
		protected dgNavigation DgNavigation1;
		protected System.Web.UI.WebControls.TextBox Textbox1;
		protected System.Web.UI.WebControls.CheckBox CheckBox1;
		protected System.Web.UI.WebControls.Label Label1;
		protected System.Web.UI.WebControls.Button Button1;
		protected System.Web.UI.WebControls.DropDownList Dropdownlist2;
		protected System.Web.UI.WebControls.TextBox Textbox2;
		utils u = new utils ();
		private void Page_Load(object sender, System.EventArgs e)
		{
			u.SetGridStyle(this.Datagrid1);
			DgNavigation1.SetTarget(Datagrid1,null,new BindDataDelegate(BindData));//BindData是你的数据邦定事件
			DgNavigation1.SetStyle(20, false);//10表示每页分10行，true表示无分页时自动隐藏

			if (!this.Page.IsPostBack)
			{
				Textbox1.Text=string.Format("{0:yyyy-MM-dd}",DateTime.Now);;
				utils.BindDropDownList("select jgmc,jgmc from cnc_jgglb where parent1='01'",this.DropDownList1);
				BindData ();
			}
		}
		private void BindData ()
		{
			string cmd = "SELECT  [cwid], [店名], [地区], [xsid], [客户], [经办人], [时间1], [时间2], [总金额], [凭证号],[预收定金], [总金额]-[预收定金] as 尚未收回款 , [销售成本], [其他], [日期1], [日期2], [是否结算] FROM [地区财务] where 1=1";
			string cmd1="";
			if (this.DropDownList1.SelectedIndex!=0)
				cmd1+=" and 地区='"+this.DropDownList1.SelectedValue.ToString()+"'";
			if (CheckBox1.Checked)
				cmd1+=" and 时间1='"+this.Textbox1.Text.ToString()+"'";
            if (Dropdownlist2.SelectedIndex==1)
                cmd1+=" and 是否结算='已结算'";
			if (Dropdownlist2.SelectedIndex==2)
				cmd1+=" and 是否结算='否'";		
			if (this.groupname.ToString()!="0")
			if (this.groupname.ToString()=="3")
			{
				cmd1+=" and 地区='"+this.zjgmc.ToString()+"'";
				DropDownList1.Enabled=false;
			}
	        else
			{
				//cmd1+=" and 店名='"+this.jgmc.ToString()+"'";
				DropDownList1.Enabled=false;
				if (this.groupname.ToString()!="0") 
				Button1.Enabled=true;

			}
			if (this.roleid.ToString()=="6") 
				Button1.Enabled=true;
			if (this.roleid.ToString()=="3") 
				Button1.Enabled=true;
			if (Textbox2.Text.ToString()!="")
				cmd1+=" and 店名 like '%"+Textbox2.Text+"%'";

			DataSet ds = DBBase.ExecuteSql4Ds (cmd+cmd1+" order by 凭证号 desc","dbd");
			this.Datagrid1.DataSource = ds.Tables[0].DefaultView;
			this.Datagrid1.DataBind ();
			cmd = "select sum(总金额)as 总金额,sum(预收定金)as 预收定金,sum(总金额)-sum(预收定金) as 尚未收回款 from 地区财务 where 1=1 ";
			SqlDataReader dr = DBBase.ExecuteSqlReader (cmd+cmd1);
			if (dr.Read ())
			{
				if (dr["总金额"].ToString()!="")
				{
					Label1.Text="合计 总金额:"+dr["总金额"].ToString();
					Label1.Text+=" 预收定金:"+dr["预收定金"].ToString();
					Label1.Text+=" 尚未收回款:"+dr["尚未收回款"].ToString();
//					Label1.Text="合计 总金额:"+dr["总金额"].ToString().Substring(0,dr["总金额"].ToString().Length-2);
//					Label1.Text+=" 预收定金:"+dr["预收定金"].ToString().Substring(0,dr["预收定金"].ToString().Length-2);
//					Label1.Text+=" 尚未收回款:"+dr["尚未收回款"].ToString().Substring(0,dr["尚未收回款"].ToString().Length-2);
//					float   b=float.Parse(dr["总金额"].ToString());
//					Label1.Text="合计 总金额:"+b.ToString("f2",System.Globalization.NumberFormatInfo.InvariantInfo);
//					b=float.Parse(dr["预收定金"].ToString()); 
//					Label1.Text+=" 预收定金:"+b.ToString("f2",System.Globalization.NumberFormatInfo.InvariantInfo);
//					b=float.Parse(dr["尚未收回款"].ToString()); 
//					Label1.Text+=" 尚未收回款:"+b.ToString("f2",System.Globalization.NumberFormatInfo.InvariantInfo);
				}
				else
                    Label1.Text="";
				//Label1.Text="合计 总金额:"+dr["总金额"].ToString()+" 预收定金:"+dr["预收定金"].ToString()+" 尚未收回款:"+dr["尚未收回款"].ToString();
			}
			dr.Close ();
//			string cmd = "SELECT [cwid], [店名], [地区], [xsid], [客户], [经办人], [时间1], [时间2], [总金额], [预收定金], [销售成本], [其他], [日期1], [日期2], [是否结算] FROM [webjxc].[dbo].[地区财务]";
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
			string id = utils.FindFirstCheckedItem(this.Datagrid1);

			string	cmd2 = "SELECT 是否结算 FROM 地区财务 where cwid='"+id.ToString()+"'";
			SqlDataReader dr = DBBase.ExecuteSqlReader (cmd2);
			if (dr.Read ())
			{
				if (dr["是否结算"].ToString()!="否")
				{
					utils.Alert (this,"该销售单已经结算!");
					dr.Close();
					return;
				}
			}
             dr.Close();
			u.OpenIEWindowRight(this,"dqcw_edit.aspx?id="+id,550,450);
			BindData ();
		}

		private void Datagrid1_ItemDataBound(object sender, System.Web.UI.WebControls.DataGridItemEventArgs e)
		{
			//  确定是数据行而非页首或页尾
			if (e.Item.ItemType == ListItemType.Item || e.Item.ItemType == ListItemType.AlternatingItem)
			{
				//  取得 manager 字段的值
				string isManager = (string)DataBinder.Eval(e.Item.DataItem, "是否结算");

				if (isManager == "否")
				{
					//  设置文本及背景颜色.
					e.Item.Cells[12].Text = "未结算";
					e.Item.Cells[12].ForeColor=System.Drawing.Color.Blue;
				}
				else
				{
					//  仅设置文本.
					//e.Item.Cells[2].Text = "";
					e.Item.Cells[12].Text = "已结算";
					e.Item.Cells[12].ForeColor=System.Drawing.Color.Red;
				}
			}
		}

	}
}
