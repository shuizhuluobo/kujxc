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
using System.IO;

namespace jxc.admin
{
	/// <summary>
	/// sp_add 的摘要说明。
	/// </summary>
	/// 
	
	public class sp_add : jxc.UsrControl.UserPage
	{
		protected System.Web.UI.WebControls.TextBox title;
		protected System.Web.UI.WebControls.TextBox zz;
		protected System.Web.UI.WebControls.TextBox inputdate;
		protected FreeTextBoxControls.FreeTextBox FreeTextBox1;
		protected System.Web.UI.WebControls.RadioButtonList RadioButtonList1;
		protected System.Web.UI.WebControls.Button Button1;
		protected System.Web.UI.HtmlControls.HtmlInputFile upload_file;
		protected System.Web.UI.WebControls.DataGrid DataGrid1;
		protected System.Web.UI.HtmlControls.HtmlTableRow spr;
		protected System.Web.UI.WebControls.TextBox sprs;
		protected System.Web.UI.HtmlControls.HtmlInputHidden hidsprs;
		protected System.Web.UI.HtmlControls.HtmlTableRow spd;
		protected System.Web.UI.WebControls.DropDownList DropDownListspd;
		protected System.Web.UI.WebControls.Button Button2;
	

		private void Page_Load(object sender, System.EventArgs e)
		{
			if (!this.Page.IsPostBack)
			{
			//	utils.BindRadioList ("select id,des from b_streamtype",this.RadioButtonList1);
				this.RadioButtonList1.SelectedIndex = 0;
				this.zz.Text = this.glyname;
				this.zz.Enabled = false;
				this.inputdate.Text = System.DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss");
				this.spr.Visible = false;
				this.spd.Visible = false;

				string cmd = "select judger,(select listname from rs_corsub where listid=judger) as judername,sortid from cnc_stream where type=0 and sortid>(select sortid from cnc_stream where type=0 and judger='" + this.judger + "') order by sortid asc";
				utils.BindDropDownList (cmd,this.DropDownListspd);

				utils.BindRadioList ("select id,des from b_streamtype where ifstop=0",this.RadioButtonList1);

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
			this.RadioButtonList1.SelectedIndexChanged += new System.EventHandler(this.RadioButtonList1_SelectedIndexChanged);
			this.Button1.Click += new System.EventHandler(this.Button1_Click);
			this.DataGrid1.ItemCommand += new System.Web.UI.WebControls.DataGridCommandEventHandler(this.DataGrid1_ItemCommand);
			this.Button2.Click += new System.EventHandler(this.Button2_Click);
			this.Load += new System.EventHandler(this.Page_Load);

		}
		#endregion

		private void Button1_Click(object sender, System.EventArgs e)
		{
			string fileEXT="";
			int errorno=0;
		
			if(upload_file.PostedFile==null || upload_file.PostedFile.FileName.Length<3)
			{
				utils.Alert (this,"请先选择一个文件再点上传。");
				return;
			}
			else
			{
				fileEXT=upload_file.PostedFile.FileName.Substring(upload_file.PostedFile.FileName.Length-3).ToLower();
				if(fileEXT!="wav")
				{
					utils.Alert (this,"只接受 wav 格式文件。");
					return;;
				}
				else if(upload_file.PostedFile.ContentLength==0)
				{
					utils.Alert (this,"请检查语音文件再点上传。");
					return;
				}
				
			}
		
			string path=Server.MapPath("/record");

			string filename = "";
		//	filename = System.Guid.NewGuid().ToString () + "." + fileEXT;

			DateTime dt = System.DateTime.Now;
			filename = this.glydh + dt.Year.ToString () + dt.Month.ToString() + dt.Day.ToString () + dt.Hour.ToString() + dt.Minute.ToString () + dt.Second.ToString () + "." + fileEXT;
			string FN = "/record/"+filename;
			filename = path+"/"+filename;

			char chra='\\';

			string disname = "";
			disname = upload_file.PostedFile.FileName.Substring(upload_file.PostedFile.FileName.LastIndexOf(chra)+1);


			//判断文件名在缓存中是否已经存在
			ArrayList listwav;
			if (this.Session["wav"] != null)
				listwav = (ArrayList)this.Session["wav"];
			else
				listwav = new ArrayList ();
			
			for (int i=0;i<listwav.Count;i++)
			{
				ListItem li = (ListItem)listwav[i];
				if (disname == li.Value)
				{
					utils.Alert (this,li.Value + "已经上传，请不要重复上传!");
					return;
				}
			}

			upload_file.PostedFile.SaveAs(filename);

			//上传成功后记录文件
			ListItem li2 = new ListItem ();
			li2.Value = disname;
			li2.Text = FN;
			listwav.Add (li2);

			this.Session.Add("wav",listwav);

			//绑定到datagrid
			
			this.DataGrid1.DataSource = ArrayToTable(listwav);
			this.DataGrid1.DataBind ();
		}

		private void DataGrid1_ItemCommand(object source, System.Web.UI.WebControls.DataGridCommandEventArgs e)
		{
			if (this.Session["wav"] != null)
			{
				ArrayList listwav = (ArrayList)this.Session["wav"];
				string id = DataGrid1.DataKeys[e.Item.ItemIndex].ToString ();
				for (int i=0;i<listwav.Count;i++)
				{
					if (((ListItem) listwav[i]).Value == id)
					{
						File.Delete (Server.MapPath(((ListItem) listwav[i]).Text));
						listwav.RemoveAt(i);
						this.DataGrid1.DataSource =  ArrayToTable(listwav);
						this.DataGrid1.DataBind ();
						this.Session.Add("wav",listwav);
						return;
					}
				}
			}
		}

		private DataTable ArrayToTable(ArrayList listwav)
		{
			DataTable shopdt = new DataTable();
			DataRow shopdr;

			shopdt.Columns.Add(new DataColumn("filename", typeof(string)));
			shopdt.Columns.Add(new DataColumn("viewfile", typeof(string)));

			for (int i=0;i<listwav.Count ;i++)
			{
				shopdr = shopdt.NewRow();
				shopdr[0] = ((ListItem)listwav[i]).Value;
				shopdr[1] = ((ListItem)listwav[i]).Text;
				shopdt.Rows.Add (shopdr);
			}
			return shopdt;
		}

		private void Button2_Click(object sender, System.EventArgs e)
		{
			string sptype="";
			string judgeczy="";
			string finishczy="";

			if (this.title.Text.Trim () == string.Empty)
			{
				utils.Alert (this,"申请标题不能为空");
				return;
			}
			/*
			if (this.FreeTextBox1.Text.Length > 300)
			{
				utils.Alert (this,"申请细节超长");
				return;
			}*/

			if (this.RadioButtonList1.SelectedIndex == -1)
			{
				utils.Alert (this,"请选择审批类型");
				return;
			}
			if (this.RadioButtonList1.SelectedItem.Value == "3")
			{
				if (this.hidsprs.Value == "")
				{
					utils.Alert (this,"请选择审批人");
					return;
				}
				sptype="1";
				judgeczy = this.hidsprs.Value;
			}
			else if(this.RadioButtonList1.SelectedItem.Value == "0")
			{
				sptype="0";
				judgeczy=this.judger;
				if (this.DropDownListspd.SelectedIndex<=0)
				{
					utils.Alert(this,"请选择审批终点");
					return;
				}
				finishczy = this.DropDownListspd.SelectedItem.Value;
			}
			else
			{
				sptype="0";
				judgeczy="60001";
			}

			int count = 1;

			ArrayList listwav;
			if (this.Session["wav"] != null)
			{
				listwav = (ArrayList) this.Session["wav"];
				count += listwav.Count;
			}

			string [] cmds = new string[count];
			cmds[0]="insert into t_master(bt,zz,fbsj,nr,judgeczy,type,jgbh,judgeman,judgejgbh,sptype,finishczy)values('" + this.title.Text.Trim () + "','" + this.glydh + "','" + this.inputdate.Text.Trim () + "','" + this.FreeTextBox1.Text + "','" + judgeczy + "'," + this.RadioButtonList1.SelectedItem.Value + ",'" + this.jgbh + "','" + this.glydh + "','" + this.jgbh + "'," + sptype + ",'" + finishczy + "')";
			
			if (this.Session["wav"] != null)
			{
				listwav = (ArrayList) this.Session["wav"];

				for  (int i=0;i<listwav.Count;i++)
				{
					cmds[1+i] = "insert into t_master_yy (bh,yyname,sqyy) select top 1 bh,'" + ((ListItem)listwav[i]).Value + "','" + ((ListItem)listwav[i]).Text + "' from t_master order by bh desc";
				}
			}
			
			try
			{
				DBBase.ExecuteSqls (cmds);
				utils.Alert (this,"发起申请成功");
				this.Session["wav"] = null;
			}
			catch
			{
				utils.Alert (this,"发起申请失败，请与管理员联系");
				this.Session["wav"] = null;
				return;
			}
		}

		private void RadioButtonList1_SelectedIndexChanged(object sender, System.EventArgs e)
		{
			if (this.RadioButtonList1.SelectedItem.Value == "3")
			{
				this.spr.Visible = true;
				this.spd.Visible = false;
			}
			else if (this.RadioButtonList1.SelectedItem.Value == "0")
			{
				this.spr.Visible = false;
				this.spd.Visible = true;
			}
			else
			{
				this.spd.Visible = false;
				this.spr.Visible = false;
			}
				
		}
	}
}
