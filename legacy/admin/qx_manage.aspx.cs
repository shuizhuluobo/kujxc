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

namespace jxc.admin
{
	/// <summary>
	/// qx_manage 的摘要说明。
	/// </summary>
	public class qx_manage : jxc.UsrControl.UserPage
	{
		protected System.Web.UI.WebControls.Label Labelid;
		protected System.Web.UI.WebControls.DropDownList DropDownList1;
		protected System.Web.UI.WebControls.DataGrid Datagrid1;
		protected System.Web.UI.WebControls.Button Button1;
	
		utils u  = new utils ();
		private void Page_Load(object sender, System.EventArgs e)
		{
			if (!this.Page.IsPostBack)
			{
				if (this.Session["GLYNAME"] == null || this.Session["GLYNAME"] == null)
				{
					string str = "<script language=\"javascript\"> parent.parent.location='report.aspx' </script>";
					this.Response.Write (str);
					return;
				}
				string glydh = this.Session["GLYDH"].ToString ();
				string glmemcode = this.Session["GLMEMCODE"].ToString ();

				utils.BindDropDownList ("select glydh,glyname + '---' + b.jgmc as glyname from cnc_glyb a,cnc_jgglb b where a.jgbh=b.jgbh and b.jgbh='" + this.Request.QueryString["id"] + "'",this.DropDownList1);
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
			this.DropDownList1.SelectedIndexChanged += new System.EventHandler(this.DropDownList1_SelectedIndexChanged);
			this.Button1.Click += new System.EventHandler(this.Button1_Click);
			this.Load += new System.EventHandler(this.Page_Load);

		}
		#endregion

		private void Button1_Click(object sender, System.EventArgs e)
		{
			if (this.Page.IsPostBack)
			{
				if (this.DropDownList1.SelectedIndex <= 0)
				{
					utils.Alert (this,"请选择管理员再进行权限操作！");
					return;
				}
				string glydh = this.DropDownList1.SelectedItem.Value;

				ArrayList array = new ArrayList ();
				array.Add ("delete from cnc_glyb_child where glydh='" + glydh  +"'");
				for (int i=0;i<Datagrid1.Items.Count;i++)
				{
					//选中权限的项
					Label id =(Label)Datagrid1.Items[i].FindControl("Labelid");
					DataGrid dg = (DataGrid) Datagrid1.Items[i].FindControl("Datagrid2");
					CheckBox box = (CheckBox) Datagrid1.Items[i].Cells[0].FindControl("selectcheck");
					Label imgpaths =(Label)Datagrid1.Items[i].FindControl("imgpaths");
					Label sortids = (Label)Datagrid1.Items[i].FindControl("sortids");
					Label qxcds = (Label)Datagrid1.Items[i].FindControl("qxcds");

					if (box.Checked)
					{
						array.Add ("insert into cnc_glyb_child (glydh,id,des,parentid,qxcd,rank,imgpath,sortid) values ('" + glydh.Trim () + "'," + id.Text.Trim () + ",'" + box.Text.Trim () + "',0,'"+ qxcds.Text.Trim () + "',0,'" + imgpaths.Text.Trim () + "'," + sortids.Text.Trim () + ")"); 
						for (int j=0;j<dg.Items.Count;j++)
						{
							Label id2 =(Label)dg.Items[j].FindControl("Labelid2");
							Label qxcd = (Label)dg.Items[j].FindControl("qxcd");
							CheckBox box2 = (CheckBox) dg.Items[j].Cells[0].FindControl("Checkbox1");
							Label imgpath = (Label)dg.Items[j].FindControl("imgpath");
							Label sortid = (Label)dg.Items[j].FindControl("sortid");

							if (box2.Checked)
								array.Add ("insert into cnc_glyb_child (glydh,id,des,parentid,qxcd,rank,imgpath,sortid) values ('" + glydh.Trim () + "'," + id2.Text.Trim () + ",'" + box2.Text.Trim () + "'," + id.Text + ",'" + qxcd.Text.Trim () + "',1,'" + imgpath.Text.Trim () + "'," + sortid.Text + ")"); 
						}
					}
					else
					{
						array.Add ("delete from cnc_glyb_child where parentid=" + id.Text + " and glydh='" + glydh + "'");
					}
				}

				string [] cmds = new string[array.Count];
				for (int i=0;i<array.Count;i++)
					cmds[i] = array[i].ToString ();
				try
				{
					DBBase.ExecuteSqls (cmds);
					utils.Alert (this,"保存用户权限成功！");
				}
				catch (Exception ee)
				{
					utils.Alert (this,"系统忙,请稍后再试！" + ee.Message);
				}
				array.Clear ();
				array = null;
			}
		}

		private void DropDownList1_SelectedIndexChanged(object sender, System.EventArgs e)
		{
			if(this.Page.IsPostBack)
			{

				if (this.Session["GLYNAME"] == null || this.Session["GLYNAME"] == null)
				{
					string str = "<script language=\"javascript\"> parent.parent.location='report.aspx' </script>";
					this.Response.Write (str);
					return;
				}
				string glmemcode = this.Session["GLMEMCODE"].ToString ();
				string glydh = this.DropDownList1.SelectedItem.Value.Trim ();

				if (this.DropDownList1.SelectedIndex <= 0)
					return;

				string groupid = "";
				string cmd = "select groupid from cnc_glyb where  glydh='" + glydh  + "'";
				SqlDataReader dr = DBBase.ExecuteSqlReader (cmd);
				dr.Read ();
				groupid = dr["groupid"].ToString ();
				dr.Close ();

				cmd = "select a.id,des,b.qxcd,b.imgpath,b.sortid from cnc_qxgroup_child a,cnc_qxcdb b where a.id=b.id and a.groupid=" + groupid + " and a.rank = 0";
				
				DataSet ds = DBBase.ExecuteSql4Ds (cmd,"cnc_qxcdb");
				this.Datagrid1.DataSource = ds.Tables["cnc_qxcdb"].DefaultView;
				this.Datagrid1.DataBind ();

				string judgecmd = "";
				for (int i=0;i<Datagrid1.Items.Count;i++)
				{
					//选中权限的项
					Label id =(Label)Datagrid1.Items[i].FindControl("Labelid");
					DataGrid dg = (DataGrid) Datagrid1.Items[i].FindControl("Datagrid2");
					
					judgecmd = "select 1 from cnc_glyb_child where rank=0 and glydh='" + glydh + "'" + " and id=" + id.Text;
					if (DBBase.IsValuesExists (judgecmd))
					{
						CheckBox box = (CheckBox) Datagrid1.Items[i].Cells[0].FindControl("selectcheck");
						box.Checked = true;
					}

					cmd = "select a.id,des,qxcd,b.imgpath,b.sortid from cnc_qxgroup_child a,cnc_qxcdb b where a.id=b.id and a.groupid=" + groupid + " and a.rank=1 and a.parentid=" + id.Text.Trim ();
					DataSet ds2 = DBBase.ExecuteSql4Ds (cmd,"childqxb");
					dg.DataSource = ds2.Tables["childqxb"].DefaultView;
					dg.DataBind ();
					for (int j=0;j<dg.Items.Count;j++)
					{
						Label id2 =(Label)dg.Items[j].FindControl("Labelid2");
						judgecmd = "select 1 from cnc_glyb_child where rank=1 and glydh='" + glydh + "'" + " and parentid=" + id.Text + " and id=" + id2.Text;
						if (DBBase.IsValuesExists (judgecmd))
						{
							CheckBox box2 = (CheckBox) dg.Items[j].Cells[0].FindControl("Checkbox1");
							box2.Checked = true;
						}
					}
				}
			}
		}
	}
}
