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

namespace jxc.webjxc.query
{
	/// <summary>
	/// kczjlb_query 的摘要说明。
	/// </summary>
	public class kczjlb_query :jxc.UsrControl.UserPage//System.Web.UI.Page// 
	{
		protected System.Web.UI.WebControls.DropDownList DropDownList1;
		protected System.Web.UI.WebControls.Button query;
		protected System.Web.UI.WebControls.DataGrid Datagrid1;
	
		protected dgNavigation DgNavigation1;
		protected System.Web.UI.WebControls.TextBox rkrq;
		protected System.Web.UI.WebControls.TextBox Textbox3;
		protected System.Web.UI.WebControls.TextBox Textbox4;
		protected System.Web.UI.WebControls.CheckBox CheckBox2;
		protected System.Web.UI.WebControls.Button add;
		utils u = new utils ();
		private void Page_Load(object sender, System.EventArgs e)
		{

			u.SetGridStyle(this.Datagrid1);
			DgNavigation1.SetTarget(Datagrid1,null,new BindDataDelegate(BindData));//BindData是你的数据邦定事件
			DgNavigation1.SetStyle(20, false);//10表示每页分10行，true表示无分页时自动隐藏
			if (!this.Page.IsPostBack)
			{
				utils.BindDropDownList("select jgmc,jgmc from cnc_jgglb where parent1='01'",this.DropDownList1);
				//BindData ();
				Textbox3.Text=string.Format("{0:yyyy-MM-dd}",DateTime.Now);
				this.Textbox4.Text=string.Format("{0:yyyy-MM-dd}",DateTime.Now.AddDays(1));
			}
		}
		private void BindData ()
		{
    string str ="select * from 库存增减表  where 1=1 ";
//			string cmd="SELECT [仓库名称],[产品名称],[入库数量] FROM [入库单] where 1=1 ";
//            string cmd1="SELECT [产品名称], [原仓库], [调拨数量] FROM [调拨单] where 1=1";
//			string cmd2="select 销售单.地区,产品名称,销售数量 from 销售单明细,销售单 where 销售单明细.xsid=销售单.xsid ";
//            string str="";	
//			if (this.CheckBox2.Checked)
//			{
//				str+=" between '"+this.Textbox3.Text.ToString()+"' and '"+this.Textbox4.Text+"'";
//				cmd+=" and 入库日期 "+str;
//				cmd1+=" and 调拨日期 "+str;
//				cmd2+=" and 销售单.销售日期"+str;
//			}
			if (this.groupname.ToString()!="0")
			{
				str+=" and 地区='"+this.zjgmc.ToString()+"'";
				DropDownList1.Enabled=false;
			}
			if (this.DropDownList1.ToString()!="0")
			{
				str+=" and 地区='"+this.DropDownList1.SelectedItem.ToString()+"'";
			}
			if (rkrq.Text!="")
				str+=" and 产品名称 like '%"+rkrq.Text+"%'";
//			if (this.CheckBox2.Checked)
//				str+=" and 日期 between '"+this.Textbox3.Text.ToString()+" 00:00:00' and '"+this.Textbox4.Text+" 23:59:59'";

			DataSet ds = DBBase.ExecuteSql4Ds (str,"kczjlb");
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
			this.add.Click += new System.EventHandler(this.add_Click);
			this.query.Click += new System.EventHandler(this.query_Click);
			this.Load += new System.EventHandler(this.Page_Load);

		}
		#endregion

		private void query_Click(object sender, System.EventArgs e)
		{
			BindData ();
		}

		private void add_Click(object sender, System.EventArgs e)
		{
			string[] cmd=new string[8];
			cmd[0]="delete 库存增减表";
			string str="";
			if (this.CheckBox2.Checked)
				str+=" and 日期 between '"+this.Textbox3.Text.ToString()+" 00:00:00' and '"+this.Textbox4.Text+" 23:59:59'";
			cmd[1]="insert into [库存增减表]([地区], [产品名称], [入库数量], [调拨数量])";
			cmd[1]+="select [地区], [产品名称], isnull (xx,0) as [入库数量], isnull (yy,0) as [调拨数量] ";
			cmd[1]+= " from (select a.[地区], a.[产品名称],a.xx,b.yy from (";
			cmd[1]+=" SELECT [地区], [产品名称],sum([入库数量])as xx FROM [V_入库单] where 1=1 "+str;
			cmd[1]+=" group by  [地区], [产品名称]) as a,";
			cmd[1]+=" (SELECT  [地区],[产品名称], sum([调拨数量]) as yy FROM [V_调拨单] where 1=1 "+str+" group by  [地区], [产品名称]) as b ";
			cmd[1]+=" where a.[地区]*=b.[地区] and a.[产品名称]*=b.[产品名称]) z";
			cmd[1]+=" union";
			cmd[1]+=" select * from (select b.[地区], b.[产品名称],a.xx,b.yy";
			cmd[1]+=" from ";
			cmd[1]+=" (SELECT [地区], [产品名称],sum([入库数量])as xx FROM [V_入库单] where 1=1 "+str+" group by  [地区], [产品名称]) as a,";
			cmd[1]+=" (SELECT  [地区],[产品名称], sum([调拨数量]) as yy FROM [V_调拨单] where 1=1 "+str+" group by  [地区], [产品名称]) as b";
			cmd[1]+=" where a.[地区]=*b.[地区] and a.[产品名称]=*b.[产品名称]) y";
            cmd[2]="insert into [库存增减表]([地区], [产品名称],[销售数量])";
			cmd[2]+="select a.地区,a.产品名称,a.销售数量 from ";
			cmd[2]+="(select [地区],[产品名称], sum(销售数量) as 销售数量 from v_销售单 where 1=1 "+str;
			cmd[2]+=" group by [地区],[产品名称]) as a where a.产品名称 not in (select distinct 产品名称 from 库存增减表)";
			cmd[3]="insert into [库存增减表]([地区], [产品名称],[销售数量])";
			cmd[3]+="select a.地区,a.产品名称,a.销售数量 from ";
			cmd[3]+="(select [地区],[产品名称], sum(销售数量) as 销售数量 from v_销售单 where 1=1  "+str;
			cmd[3]+=" group by [地区],[产品名称]) as a where a.地区 not in (select distinct 地区 from 库存增减表)";
            cmd[4]=" UPDATE 库存增减表 set 库存增减表.销售数量=a.销售数量";
            cmd[4]+=" from 库存增减表 b, (select a.地区,a.产品名称,a.销售数量 from ";
            cmd[4]+=" (select [地区],[产品名称], sum(销售数量) as 销售数量 from v_销售单 where 1=1 "+str+" group by [地区],[产品名称]) as a,";
            cmd[4]+=" 库存增减表 as b ";
            cmd[4]+=" where a.产品名称=b.产品名称 and a.地区=b.地区  ) as a ";
            cmd[4]+=" where (a.产品名称=b.产品名称 and a.地区=b.地区)";

			cmd[5]=" UPDATE 库存增减表 set 库存增减表.调入数量=a.调入数量";
			cmd[5]+=" from 库存增减表 b, (select a.地区,a.产品名称,a.调入数量 from ";
			cmd[5]+=" (select [地区],[产品名称], sum(调拨数量) as 调入数量 from V_调入单 where 1=1 "+str+" group by [地区],[产品名称]) as a,";
			cmd[5]+=" 库存增减表 as b ";
			cmd[5]+=" where a.产品名称=b.产品名称 and a.地区=b.地区  ) as a ";
			cmd[5]+=" where (a.产品名称=b.产品名称 and a.地区=b.地区)";
			cmd[6]=" UPDATE 库存增减表 set 入库数量=0 where 入库数量 is null";
			cmd[7]=" UPDATE 库存增减表 set 调入数量=0 where 调入数量 is null";
			try
			{
				DBBase.ExecuteSqls (cmd);
				utils.Alert (this,"新建成功");
	            BindData ();
			}
			catch
			{
				utils.Alert (this,"保存失败");
			}
		}
	}
}
