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

namespace CNC.admin.bases
{
	/// <summary>
	/// BigClass_Add 的摘要说明。
	/// </summary>
	public class BigClass_Add : System.Web.UI.Page
	{
		protected System.Web.UI.WebControls.TextBox begin;
		protected System.Web.UI.WebControls.TextBox enddate;
		protected System.Web.UI.WebControls.TextBox name;
		protected FreeTextBoxControls.FreeTextBox sBody;
		protected System.Web.UI.WebControls.Button save;
	
		private void Page_Load(object sender, System.EventArgs e)
		{
			if (!this.Page.IsPostBack)
			{
				this.begin.Text = System.DateTime.Now.ToString ("yyyy-MM-dd");
				this.enddate.Text = System.DateTime.Now.ToString ("yyyy-MM-dd");
				
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
			this.save.Click += new System.EventHandler(this.save_Click);
			this.Load += new System.EventHandler(this.Page_Load);

		}
		#endregion

		private void save_Click(object sender, System.EventArgs e)
		{
			if (this.name.Text.Trim () == "")
			{
				utils.Alert (this,"业务名称不能为空");
				return;
			}
			if (this.begin.Text.Trim () == "")
			{
				utils.Alert (this,"开始时间不能为空");
				return;
			}
			if (this.enddate.Text.Trim () == "")
			{
				utils.Alert (this,"结束时间不能为空");
				return;
			}
			dboper oper = new dboper ();

			if (oper.IsExists ("select 1 from cnc_big where bigname='" + this.name.Text.Trim () + "'"))
			{
				utils.Alert (this,"该业务名称已经存在");
				oper.shutdown ();
				return;
			}

			string nnulStr = "SELECT 'RsU'+RIGHT('000'+CONVERT(VARCHAR(3),(CONVERT(int,RIGHT(MAX(bigid),3))+1)),3) FROM cnc_big ";      
			string nulStr = "SELECT 'RsU'+RIGHT('000'+CONVERT(VARCHAR(3),ISNULL(max(bigid),0)+1),3) FROM cnc_big ";                    
			string sSql = "IF EXISTS(SELECT * FROM cnc_big )" +  "SELECT Ars= (" + nnulStr + ")" + " ELSE " +  "SELECT Ars= (" + nulStr + ")";

			string [] cmds = new string[7];
			SqlDataReader dr = oper.GetData (sSql);
			if (dr.Read())
			{
				//向档案类别表存入记录
				cmds[0]="insert into cnc_big(bigid,bigname,begindate,enddate,ynstop,sortid,help)values('"
					+ dr[0].ToString ()
					+ "','" + this.name.Text.Trim ()
					+ "','" + this.begin.Text.Trim () 
					+ "','" + this.enddate.Text.Trim ()
					+ "',0,0,'" + this.sBody.Text.Trim () + "')";
				cmds[1] = "INSERT INTO Xt_Grid (System_Code,Grid_Code,ColId,ColIndex,Describe)" +  "VALUES ('Rs_User','" + dr[0].ToString () + "','0','000','" + this.name.Text.Trim () +  "')";
				cmds[2] = " INSERT INTO Xt_Grid (System_Code,Grid_Code,ColId,ColIndex,ColTitle1,FieldsName,Text_Data_type,Text_Length)" + "VALUES ('Rs_User','" + dr[0].ToString () + "','1','001','操作员','opertor',0,20)";
				cmds[3] = " INSERT INTO Xt_Grid (System_Code,Grid_Code,ColId,ColIndex,ColTitle1,FieldsName,Text_Data_type,Text_Length)" +  "VALUES ('Rs_User','" + dr[0].ToString () + "','2','002','操作时间','opertime',7,20)";
				cmds[4] = " INSERT INTO Xt_Grid (System_Code,Grid_Code,ColId,ColIndex,ColTitle1,FieldsName,Text_Data_type,Text_Length,Help_Type,CorTable,IndexCode,IndexName,correlation)" + "VALUES ('Rs_User','" + dr[0].ToString () + "','3','003','小类','smallid',5,15,'21003','cnc_small','id','smallname',0)";
				cmds[5] = " INSERT INTO Xt_Grid (System_Code,Grid_Code,ColId,ColIndex,ColTitle1,FieldsName,Text_Data_type,Text_Length)" + "VALUES ('Rs_User','" + dr[0].ToString () + "','4','004','数量','nums',5,10)";
				cmds[6] = " INSERT INTO Xt_Grid (System_Code,Grid_Code,ColId,ColIndex,ColTitle1,FieldsName,Text_Data_type,Text_Length,Text_Int_Length,Help_Type)" +  "VALUES ('Rs_User','" + dr[0].ToString () + "','5','005','时间','saletime',0,20,15,'21002')";
			}
			dr.Close ();

			try
			{
				oper.Execs (cmds);
				utils.Alert (this,"保存成功");
			}
			catch(Exception ee)
			{
				utils.Alert (this,"存盘失败,系统已恢复到保存前的状态" + ee.Message);
			}
			finally
			{
				oper.shutdown ();
				oper = null;
			}
		}
	}
}
