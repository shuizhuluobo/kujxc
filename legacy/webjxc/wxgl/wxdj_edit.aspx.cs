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
using   MSScriptControl; 
namespace jxc.admin.bases
{
	/// <summary>
	/// cksh_add 的摘要说明。
	/// </summary>
	public class wxdj_edit :jxc.UsrControl.UserPage//System.Web.UI.Page// 
	{
		protected System.Web.UI.WebControls.TextBox czy;
		protected System.Web.UI.WebControls.TextBox Textbox2;
		protected System.Web.UI.WebControls.TextBox Textbox3;
		protected System.Web.UI.WebControls.TextBox Textbox5;
		protected System.Web.UI.WebControls.Button save;
		protected System.Web.UI.WebControls.Button Button3;
		protected System.Web.UI.WebControls.TextBox txttmp;
		protected System.Web.UI.WebControls.TextBox Textbox4;
		protected System.Web.UI.WebControls.TextBox Textbox1;
		protected System.Web.UI.WebControls.TextBox Textbox6;
		protected System.Web.UI.WebControls.TextBox Textbox7;
		protected System.Web.UI.WebControls.DropDownList DropDownList1;

			utils u = new utils ();
		private void Page_Load(object sender, System.EventArgs e)
		{
        	Page.RegisterStartupScript("focus","<script>document.all.TextBox5.focus()</script>"); 
			//Textbox2.Text= this.Request.QueryString["wxid"];
			if (!this.Page.IsPostBack)
			{

				//string cmd1 ="INSERT INTO [入库单]([rkid], [产品名称], [cpid], [颜色], [型号], [仓库名称], [操作员], [入库数量], [入库单价], [折扣率], [剩余数量], [入库日期], [确认日期], [到货确认], [备注], [库保确认], [产品类别], [店名], [标志], [入库单编号], [规格], [进货价], [rkidold], [下拨单编号], [wldwid], [供应商])";
             //   DBBase.ExecuteSqlReader (cmd);
				this.Textbox3.Text=string.Format("{0:yyyy-MM-dd}",DateTime.Now);
//				rkrq.Text=this.jgmc.ToString();
//			    //this.Textbox4.Text=Textbox3.Text;
				this.czy.Text=this.glyname.ToString();
				//string id = this.Request.QueryString["wxid"];
				//Textbox2.Text= utils.Getbm("xsid","销售单",this.glydh.ToString()+string.Format("{0:yyyyMM}",DateTime.Now),4);
				//Button2.Attributes.Add("onclick","return confirm('您真的要删除吗？')");
				BindData ();
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
			this.Textbox5.TextChanged += new System.EventHandler(this.Textbox9_TextChanged);
			this.save.Click += new System.EventHandler(this.save_Click);
			this.Button3.Click += new System.EventHandler(this.Button3_Click);
			this.Load += new System.EventHandler(this.Page_Load);
			this.PreRender += new System.EventHandler(this.wxdj_edit_PreRender);

		}
		#endregion

		private void BindData ()
		{
		
		}
		/// <summary>
		/// 画面中code的检索画面启动返回等处理
		/// </summary>

		private void save_Click(object sender, System.EventArgs e)
		{
			if (Textbox5.Text=="")
			{
				utils.Alert (this,"客户名称不能为空!");
				return;
			}
			if (Textbox6.Text=="")
			{
				utils.Alert (this,"故障内容不能为空!");
				return;
			}
            if (DropDownList1.SelectedValue.ToString()=="")
			{
				utils.Alert (this,"所属区域不能为空!");
				return;
			}
            string strcmd="insert into 维修记录 ( 用户单位, 联系人, 联系电话, 故障信息, 备注,  登记日期,登记人,";
			       strcmd=strcmd+" 维修类别, 记录状态, 记录分组) values('";
			strcmd+=Textbox5.Text+"','";
			strcmd+=this.Textbox4.Text.Trim()+"','";
			strcmd+= this.Textbox1.Text+"','";
			strcmd+= this.Textbox6.Text.ToString()+"','";
			strcmd+=Textbox7.Text.ToString()+"','";
			strcmd+=this.Textbox3.Text.ToString()+"','";
			strcmd+=this.czy.Text.ToString()+"','";
			strcmd+="简易','未接收','"+DropDownList1.SelectedItem.Text+"')";
			try
			{
				DBBase.ExecuteSql (strcmd);//保存销售单
				utils.Alert (this,"保存成功!");
				JSUtil.Close(this);
			}
			catch
			{
				utils.Alert (this,"保存失败");
				return;
			}
		}

		private void Datagrid1_SelectedIndexChanged(object sender, System.EventArgs e)
		{
		
		}

		private void Button1_Click(object sender, System.EventArgs e)
		{

		}

		private void Button2_Click(object sender, System.EventArgs e)
		{

		}

		private void Textbox9_TextChanged(object sender, System.EventArgs e)
		{
			//Textbox8.Text=Convert.ToString(Convert.ToDouble(this.Textbox9.Text)*Convert.ToDouble(this.Textbox5.Text)/10);
		}

		private void Button3_Click(object sender, System.EventArgs e)
		{
			string id =Textbox2.Text;
			if (id!=null)
			{
				u.OpenIEWindowPrint(this,"cksh_zzxp.aspx?xsdmxid="+Textbox2.Text,250,550);
//				//id = utils.FindFirstCheckedItem(this.Datagrid1);
//				string cmd="update 销售单明细 set 打印状态='已打印' where xsdmxid='"+id+"'";
//				DBBase.ExecuteSql (cmd);
			}	
			//u.CloseWindow(this);
		}

		private void Textbox8_TextChanged(object sender, System.EventArgs e)
		{
		//	Textbox7.Text=Convert.ToString(Convert.ToDouble(this.Textbox4.Text)-Convert.ToDouble(this.Textbox8.Text));
		}

		private void wxdj_edit_PreRender(object sender, System.EventArgs e)
		{
			this.RegisterHiddenField("HiddenCommon",Request["HiddenCommon"]);
		}
	}
}
