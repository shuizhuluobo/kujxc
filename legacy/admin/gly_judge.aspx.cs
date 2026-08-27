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
	/// gly_judge 的摘要说明。
	/// </summary>
	public class gly_judge : jxc.UsrControl.UserPage
	{
		protected System.Web.UI.WebControls.Label report;
		protected System.Web.UI.WebControls.Label sqr;
		protected System.Web.UI.WebControls.Label fbsj;
		protected System.Web.UI.WebControls.Label bt;
		protected System.Web.UI.WebControls.Label nr;
		protected System.Web.UI.WebControls.RadioButtonList RadioButtonList1;
		protected System.Web.UI.WebControls.TextBox spnr;
		protected System.Web.UI.WebControls.Button Button1;
		protected System.Web.UI.WebControls.DataGrid DataGrid1;
		protected System.Web.UI.WebControls.Button savesp;
		protected System.Web.UI.WebControls.Label cptype;
		protected System.Web.UI.WebControls.Label hidfinishczy;
		protected System.Web.UI.WebControls.Label judgeczy;
		protected System.Web.UI.WebControls.Label hidtype;
		protected System.Web.UI.HtmlControls.HtmlGenericControl yy;
		protected System.Web.UI.HtmlControls.HtmlGenericControl splb;
		protected System.Web.UI.HtmlControls.HtmlInputFile upload_file;
	
		private void Page_Load(object sender, System.EventArgs e)
		{
			if (!this.Page.IsPostBack)
			{
				string cmd = "select bh,bt,(select glyname from cnc_glyb where glydh=zz) as sqr,nr,fbsj,(select jgmc from cnc_jgglb where cnc_jgglb.jgbh=t_master.jgbh) as jgmc,sptype,finishczy,judgeczy,type from t_master where bh=" + this.Request.QueryString["id"];
				SqlDataReader dr = DBBase.ExecuteSqlReader (cmd);
				if (dr.Read ())
				{
					this.sqr.Text = dr["sqr"].ToString ();
					this.fbsj.Text = dr["fbsj"].ToString ();
					this.bt.Text = dr["bt"].ToString ();
					this.nr.Text = dr["nr"].ToString ();
					this.cptype.Text = dr["sptype"].ToString ();

					if (!dr.IsDBNull(7))
						this.hidfinishczy.Text = dr["finishczy"].ToString();
					else
						this.hidfinishczy.Text = "";

					this.judgeczy.Text = dr["judgeczy"].ToString ();
					this.hidtype.Text = dr["type"].ToString ();
					
				}
				dr.Close ();


				

				//获取语音列表
				cmd = "select yyname,sqyy from t_master_yy where bh=" + this.Request.QueryString["id"];
				dr = DBBase.ExecuteSqlReader (cmd);
				while (dr.Read ())
				{
					this.yy.InnerHtml += "<a href=" + dr[1].ToString () + " target=_blank>" + dr[0].ToString () + "</a>  ";
				}
				dr.Close ();
				//获取审批意见列表
				string table = "<table cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"100%\" class=title3>";
				cmd = "select id,bh,(select listname from cnc_glyb,rs_corsub where cnc_glyb.glydh=t_master_child.glydh and cnc_glyb.rank=rs_corsub.listid) + '审批' as spr,result from t_master_child where bh=" + this.Request.QueryString["id"];
				dr = DBBase.ExecuteSqlReader (cmd);
				while (dr.Read ())
				{
					table += "<tr><td>" + dr["spr"].ToString () + "</td><td>" + dr["result"].ToString () + "</td><td><a href=sp_detail.aspx?id=" + dr["id"].ToString () + " target=_blank>审批内容浏览</a></td><td>";
					string cmd2 = "select yyname,spyy from t_master_child_yy where parentid=" + dr["id"].ToString ();
					SqlDataReader dr2 = DBBase.ExecuteSqlReader (cmd2);
					string href = "";
					while (dr2.Read())
					{
						href += "<a href=" + dr2["spyy"].ToString () + " target=_blank>" + dr2["yyname"].ToString () + "</a> ";
					}
					dr2.Close ();
					table += href + "</td></tr>";
				}

				table += "</table>";
				dr.Close ();

				this.splb.InnerHtml = table;
				this.RadioButtonList1.SelectedIndex = 0;
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
			this.Button1.Click += new System.EventHandler(this.Button1_Click);
			this.DataGrid1.ItemCommand += new System.Web.UI.WebControls.DataGridCommandEventHandler(this.DataGrid1_ItemCommand);
			this.savesp.Click += new System.EventHandler(this.savesp_Click);
			this.Load += new System.EventHandler(this.Page_Load);

		}
		#endregion

		private void savesp_Click(object sender, System.EventArgs e)
		{
			string iffinish = "";

			int count = 2;

			ArrayList listwav;
			if (this.Session["spwav"] != null)
			{
				listwav = (ArrayList) this.Session["spwav"];
				count += listwav.Count;
			}

			if (this.RadioButtonList1.SelectedIndex == 0)
				iffinish = "1";
			else
				iffinish = "3";
			string [] cmds = new string[count];
			cmds[0]="insert into t_master_child(bh,glydh,result,judgenr,yjudgeczy,yjudgeman,yjudgejgbh) select " + this.Request.QueryString["id"] + ",'" + this.glydh + "','" + this.RadioButtonList1.SelectedItem.Text + "','" + this.spnr.Text.Trim () + "',judgeczy,judgeman,judgejgbh from t_master where bh=" + this.Request.QueryString["id"];
			cmds[1]="update t_master set iffinish=" + iffinish + ",judgeman='" + this.glydh + "',judgejgbh='" + this.jgbh + "',finishdate=getdate()";
			if (this.cptype.Text == "0")
			{
				cmds[1] += ",judgeczy='" + this.judger + "'";
			}
			
			cmds[1] += " where bh=" + this.Request.QueryString["id"];

			if (this.Session["spwav"] != null)
			{
				listwav = (ArrayList) this.Session["spwav"];

				for  (int i=0;i<listwav.Count;i++)
				{
					cmds[2+i] = "insert into t_master_child_yy (parentid,yyname,spyy) select top 1 id,'" + ((ListItem)listwav[i]).Value + "','" + ((ListItem)listwav[i]).Text + "' from t_master_child order by id desc";
				}
			}
			
			try
			{
				DBBase.ExecuteSqls (cmds);
				utils.Alert (this,"审批成功");
				this.Session["spwav"] = null;
			}
			catch
			{
				utils.Alert (this,"审批失败，请与管理员联系");
				this.Session["spwav"] = null;

				return;
			}
		}

		private void DataGrid1_ItemCommand(object source, System.Web.UI.WebControls.DataGridCommandEventArgs e)
		{
			if (this.Session["spwav"] != null)
			{
				ArrayList listwav = (ArrayList)this.Session["spwav"];
				string id = DataGrid1.DataKeys[e.Item.ItemIndex].ToString ();
				for (int i=0;i<listwav.Count;i++)
				{
					if (((ListItem) listwav[i]).Value == id)
					{
						File.Delete (Server.MapPath(((ListItem) listwav[i]).Text));
						listwav.RemoveAt(i);
						this.DataGrid1.DataSource =  ArrayToTable(listwav);
						this.DataGrid1.DataBind ();
						this.Session.Add("spwav",listwav);
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
			//filename = System.Guid.NewGuid().ToString () + "." + fileEXT;

			DateTime dt = System.DateTime.Now;
			filename = this.glydh + dt.Year.ToString () + dt.Month.ToString() + dt.Day.ToString () + dt.Hour.ToString() + dt.Minute.ToString () + dt.Second.ToString () + "." + fileEXT;
		
			string FN = "/record/"+filename;
			filename = path+"/"+filename;

			char chra='\\';
			string disname = "";
			disname = upload_file.PostedFile.FileName.Substring(upload_file.PostedFile.FileName.LastIndexOf(chra)+1);

			//判断文件名在缓存中是否已经存在
			ArrayList listwav;
			if (this.Session["spwav"] != null)
				listwav = (ArrayList)this.Session["spwav"];
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

			this.Session.Add("spwav",listwav);

			//绑定到datagrid
			
			this.DataGrid1.DataSource = ArrayToTable(listwav);
			this.DataGrid1.DataBind ();
		}
	}
}
