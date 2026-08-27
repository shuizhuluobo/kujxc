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
	/// change_judge 的摘要说明。
	/// </summary>
	public class change_judge : jxc.UsrControl.UserPage
	{
		protected System.Web.UI.WebControls.Label sqr;
		protected System.Web.UI.WebControls.Label fbsj;
		protected System.Web.UI.WebControls.Label bt;
		protected System.Web.UI.WebControls.Label nr;
		protected System.Web.UI.WebControls.RadioButtonList RadioButtonList1;
		protected System.Web.UI.WebControls.TextBox spnr;
		protected System.Web.UI.WebControls.Button Button1;
		protected System.Web.UI.WebControls.DataGrid DataGrid1;
		protected System.Web.UI.WebControls.Button savesp;
		protected System.Web.UI.HtmlControls.HtmlGenericControl yy;
		protected System.Web.UI.HtmlControls.HtmlGenericControl splb;
		protected System.Web.UI.WebControls.Label judgeczy;
		protected System.Web.UI.WebControls.Label iffinish;
		protected System.Web.UI.WebControls.Label judgedate;
		protected System.Web.UI.HtmlControls.HtmlInputFile upload_file;
	
		private void Page_Load(object sender, System.EventArgs e)
		{
			if (!this.Page.IsPostBack)
			{
				string cmd = "select bh,bt,(select glyname from cnc_glyb where glydh=zz) as sqr,nr,fbsj,(select jgmc from cnc_jgglb where cnc_jgglb.jgbh=t_master.jgbh) as jgmc,judgeczy,iffinish from t_master where bh=" + this.Request.QueryString["id"];
				SqlDataReader dr = DBBase.ExecuteSqlReader (cmd);
				if (dr.Read ())
				{
					this.sqr.Text = dr["sqr"].ToString ();
					this.fbsj.Text = dr["fbsj"].ToString ();
					this.bt.Text = dr["bt"].ToString ();
					this.nr.Text = dr["nr"].ToString ();
					this.judgeczy.Text = dr["judgeczy"].ToString ();
					this.iffinish.Text = dr["iffinish"].ToString ();
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

				//获取个人审批意见
				cmd = "select result,judgedate from t_master_child where bh=" + this.Request.QueryString["id"] + " and glydh='" + this.glydh + "'";
				dr = DBBase.ExecuteSqlReader (cmd);
				if (dr.HasRows)
				{
					if (dr.Read ())
					{
						if (dr["result"].ToString () == "同意")
							this.RadioButtonList1.SelectedIndex = 0;
						else
							this.RadioButtonList1.SelectedIndex = 1;

						this.judgedate.Text = dr[1].ToString();
					}
				}
				else
				{
					utils.Alert (this,"你没有参与该申请单的申批，不能修改");

					dr.Close ();
					return;
				}
				dr.Close ();

				//获取个人的审批语音，加入到session中

				this.Session["spwav"] = null;
				ArrayList listwav = new ArrayList();

				cmd = "select yyname,spyy from t_master_child a,t_master_child_yy b where a.id=b.parentid and a.bh=" + this.Request.QueryString["id"] + " and glydh='" + this.glydh + "'";
				dr = DBBase.ExecuteSqlReader (cmd);

				while (dr.Read ())
				{
					ListItem li = new ListItem ();
					li.Value = dr[0].ToString ();
					li.Text = dr[1].ToString ();
					listwav.Add (li);
					
				}
				dr.Close ();

				if (listwav.Count != 0)
				{
					this.Session.Add("spwav",listwav);
					this.DataGrid1.DataSource = ArrayToTable(listwav);
					this.DataGrid1.DataBind ();
				}

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

		private void savesp_Click(object sender, System.EventArgs e)
		{
			/*
			if (this.judgeczy.Text != this.judger)
			{
				utils.Alert (this,"审批已经进入下一流程，不能修改审批意见");
				return;
			}
			else
			{
				if (this.iffinish.Text == "1")
				{
					utils.Alert (this,"该审批已经完成，不能修改审批意见");
					return;
				}
			}
			*/

			//判断审批时间是否超过10分钟

			TimeSpan ts= Convert.ToDateTime(this.judgedate.Text.Trim ()) - System.DateTime.Now;
			if (ts.Minutes > 10)
			{
				utils.Alert (this,"审批时间已经超过10分钟，不能修改");
				this.savesp.Enabled = false;
				return;
			}
			if (this.spnr.Text.Length > 300)
			{
				utils.Alert (this,"申请细节超长");
				return;
			}
			int count = 3;

			ArrayList listwav;
			if (this.Session["spwav"] != null)
			{
				listwav = (ArrayList) this.Session["spwav"];
				count += listwav.Count;
			}

			//判断该操作员是否是最末一级审批者
			string cmd = "";
			string sortid1,sortid2;
			cmd = "select sortid from cnc_stream where type in (select type from t_master where bh=" + this.Request.QueryString["id"]  + ") and judger='" + this.judger + "'";
			SqlDataReader dr = DBBase.ExecuteSqlReader (cmd);
			dr.Read ();
			sortid1 = dr[0].ToString ();
			dr.Close ();
			cmd = " select max(sortid) from cnc_stream where type in (select type from t_master where bh=" + this.Request.QueryString["id"] + ")";
			dr = DBBase.ExecuteSqlReader (cmd);
			dr.Read ();
			sortid2 = dr[0].ToString ();
			dr.Close ();

			string iffinish;
			if (sortid1 == sortid2)
				iffinish = "1";
			else
				iffinish = "0";
			string [] cmds = new string[count];
			cmds[0] = "delete from t_master_child where bh=" + this.Request.QueryString["id"] + " and glydh='" + this.glydh + "'";
			cmds[1]="insert into t_master_child(bh,glydh,result,judgenr,yjudgeczy,yjudgeman,yjudgejgbh) select " + this.Request.QueryString["id"] + ",'" + this.glydh + "','" + this.RadioButtonList1.SelectedItem.Text + "','" + this.spnr.Text.Trim () + "',judgeczy,judgeman,judgejgbh from t_master where bh=" + this.Request.QueryString["id"];
			cmds[2]="update t_master set judgeczy='" + this.judger + "',iffinish=" + iffinish + ",judgeman='" + this.glydh + "',judgejgbh='" + this.jgbh + "'";
			if (sortid1 == sortid2)
				cmds[2] += ",finishdate=getdate()";
			cmds[2] += " where bh=" + this.Request.QueryString["id"];

			if (this.Session["spwav"] != null)
			{
				listwav = (ArrayList) this.Session["spwav"];

				for  (int i=0;i<listwav.Count;i++)
				{
					cmds[3+i] = "insert into t_master_child_yy (parentid,yyname,spyy) select top 1 id,'" + ((ListItem)listwav[i]).Value + "','" + ((ListItem)listwav[i]).Text + "' from t_master_child order by id desc";
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
				return;
			}
		}

		private void DataGrid1_ItemCommand(object source, System.Web.UI.WebControls.DataGridCommandEventArgs e)
		{
			if (this.judgeczy.Text != this.judger)
			{
				utils.Alert (this,"审批已经进入下一流程，语音不能删除");
				return;
			}
			else
			{
				if (this.iffinish.Text == "1")
				{
					utils.Alert (this,"该审批已经完成，语音不能删除");
					return;
				}
			}
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
	}
}
