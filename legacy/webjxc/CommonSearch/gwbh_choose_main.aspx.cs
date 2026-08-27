using System;
using System.Collections;
using System.ComponentModel;
using System.Data;
using Microsoft.Data.Odbc;
using System.Drawing;
using System.Web;
using System.Web.SessionState;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Web.UI.HtmlControls;
using llnsoft.CustomControl;

namespace llnsoft.BaseInfo.CommonSearch
{
	/// <summary>
	/// gwbh_choose_main 的摘要说明。
	/// </summary>
	public class gwbh_choose_main : System.Web.UI.Page
	{

		private Microsoft.Data.Odbc.OdbcConnection OdbcConnection1=new OdbcConnection(System.Configuration.ConfigurationSettings.AppSettings["llnsoftOdbcConnectionString"]);
		protected 			string[] strs,strsName;
		protected System.Web.UI.WebControls.DataGrid Datagrid1;

		private void Page_Load(object sender, System.EventArgs e)
		{
			DataGridPro1.functionSelectedIndexChangedEventHandler+=new CustomControl.DataGridPro.delegateSelectedIndexChangedEventHandler(DataGridPro1_OnSelectionChanged);
			DataGridPro1.OnDblClick+=new CustomControl.DataGridPro.dlgtDblClickEventHandler(DataGridPro1_OnDblClick);
			if(!Page.IsPostBack)
			{
				ShowAll();	
			}

			if (Session["Event"]!=null)
			{
				switch (Session["Event"].ToString())
				{
					case "ShowAll":
						ShowAll();
						Session["Event"]=null;
						break;
					case"Search":
						ShowSearchResult();
						Session["Event"]=null;
						break;
				}
			}		
		}

		
		/// <summary>
		/// 给定一个OdbcDataReader作为数据源，将数据显示在本页中的DataGridEX1中
		/// </summary>
		private void ShowDataGrid(OdbcDataReader dreader)
		{
//			int i;
//			BoundColumn bc;
//			DataGridPro1.theDataGrid.Columns.Clear();
//			//循环，依次将dreader中的各列作为一个绑定列加入到表格中
//			for (i=0;i<dreader.FieldCount;i++)
//			{
//				bc=new BoundColumn();
//				bc.HeaderText=dreader.GetName(i);
//				bc.DataField=dreader.GetName(i);
//				bc.Visible=true;
//				DataGridPro1.theDataGrid.Columns.Add(bc);
//			}
			//设定表格的数据源并绑定数据
			DataGridPro1.DataSource=dreader;
			DataGridPro1.DataBind();
		}


		/// <summary>
		///显示所有的数据
		///要显示的字段存在Session["ShowFields"]中
		///人工构造一个SQL语句，然后通过一个OdbcCommand执行它，
		///结果放在一个OdbcDataReader中，作为数据表格的数据源
		/// </summary>
		private void ShowAll()
		{
			int i;
			OdbcDataReader dreader;
			OdbcCommand sqlCmd=new OdbcCommand();
			
			sqlCmd.CommandText="select "+strs[0] + " '" + strsName[0] + "'";		
			for (i=1;i<=strs.GetUpperBound(0);i++)
				sqlCmd.CommandText+=","+strs[i] + " '" + strsName[i] + "'";		
			sqlCmd.CommandText+=" from jcxx_gwbh";
			OdbcConnection1.Open();
			sqlCmd.Connection=OdbcConnection1;
			dreader=sqlCmd.ExecuteReader();
			ShowDataGrid(dreader);
			dreader.Close();
			OdbcConnection1.Close();
		}

		/// <summary>
		///点击搜索按钮执行搜索并显示结果
		/// </summary>
		private void ShowSearchResult()
		{
			OdbcCommand sqlCmd=new OdbcCommand();
			OdbcDataReader dreader;
			int i;
			sqlCmd.Connection=OdbcConnection1;

			sqlCmd.CommandText="select "+strs[0] + " '" + strsName[0] + "'";		
			for (i=1;i<=strs.GetUpperBound(0);i++)
				sqlCmd.CommandText+=","+strs[i] + " '" + strsName[i] + "'";	
			sqlCmd.CommandText+=" from jcxx_gwbh";
			sqlCmd.CommandText+=" where convert(varchar,"+strs[0]+") like '%"+Session["EventArg"].ToString()+"%' ";
			for (i=1;i<=strs.GetUpperBound(0);i++)
				sqlCmd.CommandText+="or convert(varchar,"+strs[i]+") like '%"+Session["EventArg"].ToString()+"%' ";

			OdbcConnection1.Open();
			try 
			{
				dreader=sqlCmd.ExecuteReader();
			}
			catch
			{
				JSUtil.Alert(this,"查询字符串格式错误！");
				return;
			}
			ShowDataGrid(dreader);
			dreader.Close();
			OdbcConnection1.Close();
		}	


		//根据显示函数提供的数据源刷新DataGridPro控件
		private void  ShowDataGrid(System.Data.SqlClient.SqlDataReader dataReader)
		{
			DataGridPro1.DataSource=dataReader;
			DataGridPro1.DataBind();
		}

	

		private void DataGridPro1_OnSelectionChanged(ref System.Web.UI.WebControls.DataGrid theDataGrid, bool[] arr_bSelection, int iMouseClickedRowIndex)
		{
			string Selection;//存放表格里选中的每行
			int i;
			//关键字的所在的列序号
			i=DataGridPro1.GetFirstSelectedItemIndex();
			if(i==-1)
			{
				JSUtil.ExecuteBlock(this,"parent.frames[\"frame_top\"].gwbh_choose_top.action=\"gwbh_choose_top.aspx?SelectionNumber={*null*}\";\n parent.frames[\"frame_top\"].gwbh_choose_top.submit()");
				return;
			}
			Selection=DataGridPro1.theDataGrid.Items[i].Cells[0].Text+","+DataGridPro1.theDataGrid.Items[i].Cells[1].Text ;
			Session.Add("Ret_Search_Value",Selection);
			JSUtil.ExecuteBlock(this,"parent.frames[\"frame_top\"].gwbh_choose_top.action=\"gwbh_choose_top.aspx?SelectionNumber="+Server.UrlEncode(Selection) +"\";\n parent.frames[\"frame_top\"].gwbh_choose_top.submit()");
			return;
		}

		//双击事件
		private void DataGridPro1_OnDblClick(ref System.Web.UI.WebControls.DataGrid theDataGrid, int iMouseDblClickedRowIndex, int iMouseDblClickedColumnIndex)
		{
			string Selection;//存放表格里选中的每行
			int i;
			//关键字的所在的列序号
			i=DataGridPro1.GetFirstSelectedItemIndex();
			Selection=DataGridPro1.theDataGrid.Items[i].Cells[0].Text+","+DataGridPro1.theDataGrid.Items[i].Cells[1].Text ;
			Session.Add("Ret_Search_Value",Selection);
			JSUtil.ExecuteBlock(this,"window.returnValue=\"SubmitForm\"");
			JSUtil.CloseWindow(this);

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
			this.Load += new System.EventHandler(this.Page_Load);
			this.Init += new System.EventHandler(this.formAccept_choose_main_Init);

		}
		#endregion

		private void formAccept_choose_main_Init(object sender, System.EventArgs e)
		{
			//加入对表格事件“选中行变化”的响应
			//只允许选单行
			this.DataGridPro1.bAllowMultiSelection=false;
			if(!Page.IsPostBack)
			{
				//对控件进行初始化
				DataGridPro1.Align=CustomControl.DataGridPro.GridAlign.Full;
			}
			strs=new String[2];
			strsName = new String[2];		
			strs[0]="gwbh";
			strs[1]="gwmc";

			strsName[0]="岗位编号";		
			strsName[1]="岗位名称";		

			BoundColumn bc;
			for (int i=0;i<=strs.GetUpperBound(0);i++)
			{
				bc=new BoundColumn();
				bc.HeaderText=strsName[i];
				bc.DataField=strsName[i];
				DataGridPro1.theDataGrid.Columns.Add(bc);
			}	
			this.DataGridPro1.szColumnsWidth="100,200";
		}
	}
}
