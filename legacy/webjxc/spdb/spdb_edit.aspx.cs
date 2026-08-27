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
	/// spdb_add 的摘要说明。
	/// </summary>
	public class spdb_edit :jxc.UsrControl.UserPage//System.Web.UI.Page// 
	{
		protected System.Web.UI.WebControls.DropDownList DropDownListlx;
		protected System.Web.UI.WebControls.TextBox Textbox1;
		protected System.Web.UI.WebControls.TextBox rkrq;
		protected System.Web.UI.WebControls.TextBox cpname;
		protected System.Web.UI.WebControls.TextBox cpid;
		protected System.Web.UI.WebControls.TextBox czy;
		protected System.Web.UI.WebControls.TextBox Textbox2;
		protected System.Web.UI.WebControls.TextBox Textbox3;
		protected System.Web.UI.WebControls.TextBox Textbox4;
		protected System.Web.UI.WebControls.TextBox Textbox5;
		protected System.Web.UI.WebControls.TextBox Textbox6;
		protected System.Web.UI.WebControls.TextBox Textbox7;
		protected System.Web.UI.WebControls.TextBox txtyanse;
		protected System.Web.UI.WebControls.TextBox txtkuanghao;
		protected System.Web.UI.WebControls.TextBox Textbox8;
		protected System.Web.UI.WebControls.TextBox txtzkl;
		protected System.Web.UI.WebControls.TextBox txtxh;
		protected System.Web.UI.WebControls.Button save;
	
		private void Page_Load(object sender, System.EventArgs e)
		{
			CodeSearch();
			if (!this.Page.IsPostBack)
			{
				rkrq.Text=string.Format("{0:yyyy-MM-dd}",DateTime.Now);
				this.czy.Text=this.glyname.ToString();
			//	utils.BindDropDownList("select listid,listname from rs_corsub where sortid=7",this.DropDownListlx);
				string id = this.Request.QueryString["rkid"];
				if (id != string.Empty && id != null)
				{
					string cmd = "select * from 入库单 where rkid='" + id + "'";
					SqlDataReader dr = DBBase.ExecuteSqlReader (cmd);
					if (dr.Read ())
					{
						Textbox2.Text=dr["rkid"].ToString();
						this.cpname.Text = dr["产品名称"].ToString ();
						this.cpid.Text = dr["cpid"].ToString ();
						this.Textbox4.Text = dr["仓库名称"].ToString ();
						this.Textbox3.Text = dr["入库数量"].ToString (); 
						this.czy.Text = dr["操作员"].ToString ();
						this.Textbox5.Text = dr["进货价"].ToString ();
						this.Textbox1.Text = dr["剩余数量"].ToString (); 
						this.txtyanse.Text=dr["颜色"].ToString();
						//this.txtkuanghao.Text=dr["类别"].ToString();
						Textbox8.Text = dr["入库单价"].ToString ();
						txtzkl.Text = dr["折扣率"].ToString ();
						txtxh.Text = dr["型号"].ToString ();
					}
					dr.Close ();
					utils.BindDropDownList("select jgmc,jgmc from cnc_jgglb where parent1='01' and jgmc<>'"+this.Textbox4.Text.ToString()+"'",this.DropDownListlx);
					//utils.BindDropDownList("select dept,dept from dept where d4=1 and dept<>'"+Textbox4.Text.ToString()+"'",this.DropDownListlx);

				}
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
			this.ID = "spdb_edit";
			this.Load += new System.EventHandler(this.Page_Load);
			this.PreRender += new System.EventHandler(this.spdb_edit_PreRender);

		}
		#endregion

		private void save_Click(object sender, System.EventArgs e)
		{
			//string id = this.Request.QueryString["cpid"];
			if (Convert.ToDouble(this.Textbox6.Text)<=0) 
			{
                utils.Alert (this,"调拨数量不能为0");
				return;
			}
			if (Convert.ToDouble(this.Textbox6.Text)>Convert.ToDouble(this.Textbox1.Text)) 
			{
				utils.Alert (this,"调拨数量不能大于库存数量");
				return;
			}
			if (DropDownListlx.SelectedIndex==0) 
			{
				utils.Alert (this,"仓库不能为空");
				return;
			}
			string[] cmd=new string[3];
			string rkid = utils.Getbm("dbid","调拨单",string.Format("{0:yyyyMMdd}",DateTime.Now),4);
            cmd[0]="insert into 调拨单 ([dbid], [cpid], [产品名称], [调拨仓库], [原仓库], [操作员], [调拨数量], [调拨说明],[确认到货],[rkid]) values('";
			cmd[0]+=rkid+"','"+this.cpid.Text.Trim()+"','";
			cmd[0]+=this.cpname.Text.Trim()+"','";
			cmd[0]+= this.DropDownListlx.SelectedItem.Text+"','";
			cmd[0]+= this.Textbox4.Text.ToString()+"','";
			cmd[0]+=this.czy.Text.ToString()+"',";
			cmd[0]+=this.Textbox6.Text.ToString()+",'";
			cmd[0]+=this.Textbox7.Text.ToString()+"','否','"+this.Request.QueryString["rkid"]+"')";
            rkid = utils.Getbm("rkid","下拨单",string.Format("{0:yyyyMMdd}",DateTime.Now),4);
			string rkdbh = utils.Getbm("入库单编号","下拨单",this.glydh.ToString()+string.Format("{0:yyyyMMdd}",DateTime.Now),4);
			//cmd[1] = "INSERT INTO [下拨单]([rkid], [产品名称], [cpid], [仓库名称], [操作员], [入库数量],[剩余数量], [进货价],[入库日期], [到货确认], [库保确认],入库单价,颜色,规格,标志,入库单编号,折扣率,型号) VALUES(";
			//cmd[1] += "'" + rkid + "','" + this.cpname.Text.Trim () + "','" + this.cpid.Text.Trim () + "','" + this.DropDownListlx.SelectedItem.Text + "',";
			//cmd[1] += "'"+this.czy.Text.ToString()+"'," + this.Textbox6.Text.Trim() + ","+ this.Textbox6.Text.Trim() + "," + this.Textbox5.Text.Trim()  + ",'"+rkrq.Text+"','是','是'"+","+this.Textbox8.Text.Trim()+",'"+this.txtyanse.Text+"','"+this.txtkuanghao.Text+"','是','"+rkdbh+"',10,'"+this.txtxh.Text+"')";
            cmd[1]="update [入库单] set [剩余数量]=[剩余数量]-"+Textbox6.Text.Trim()+" where rkid='"+Textbox2.Text.Trim()+"'";

			//rkid=System.Guid.NewGuid().ToString();
           // cmd[3]="insert into 地区总账(zzid,日期,地区,摘要,借方,贷方,余额,其他,分类,单据号)values('"+rkid+"','"+DateTime.Now.ToString("yyyy-MM-dd")+"','"+this.Textbox4.Text+"','调拨回款',0,"+Convert.ToDouble(this.Textbox6.Text)*Convert.ToDouble(this.Textbox5.Text)+","+Convert.ToDouble(this.Textbox6.Text)*Convert.ToDouble(this.Textbox5.Text)+",'调到"+DropDownListlx.SelectedItem.ToString()+"','调拨回款','"+Textbox2.Text.Trim()+"')";
			//rkid=System.Guid.NewGuid().ToString();
           // cmd[4]="insert into 地区总账(zzid,日期,地区,摘要,借方,贷方,余额,其他,分类,单据号)values('"+rkid+"','"+DateTime.Now.ToString("yyyy-MM-dd")+"','"+this.DropDownListlx.SelectedValue.ToString()+"','调拨',"+Convert.ToDouble(this.Textbox6.Text)*Convert.ToDouble(this.Textbox5.Text)+",0,"+Convert.ToDouble(this.Textbox6.Text)*Convert.ToDouble(this.Textbox5.Text)+",'从"+Textbox4.Text.ToString()+"调拨','调拨','"+Textbox2.Text.Trim()+"')";
			
			rkid = utils.Getbm("rkid","入库单",string.Format("{0:yyyyMMdd}",DateTime.Now),4);
			cmd[2] = "INSERT INTO [入库单]([rkid], [产品名称], [cpid], [仓库名称],店名, [操作员], [入库数量],[剩余数量],";
			cmd[2]+="[入库单价],[入库日期], [到货确认], [库保确认],产品类别,型号,折扣率,进货价,可退) VALUES(";
			cmd[2]+= "'" + rkid + "','" + this.cpname.Text.Trim () + "','";
			cmd[2]+=this.cpid.Text.Trim () + "','星通公司','"+ this.DropDownListlx.SelectedItem.Text + "','" + this.glyname.ToString() + "',";
			cmd[2]+=this.Textbox6.Text.Trim() + ","+ this.Textbox6.Text.Trim() + "," + this.Textbox5.Text.Trim()  + ",'"+rkrq.Text+"','是','是','"+this.txtkuanghao.Text+"','"+this.txtxh.Text+"',10,"+Textbox5.Text+","+Textbox6.Text+")";
			try
			{
			  // Textbox7.Text=cmd[0].ToString()+cmd[1].ToString()+cmd[2].ToString();//+cmd[3].ToString()+cmd[4].ToString()+cmd[5].ToString();
				DBBase.ExecuteSqls (cmd);
				utils.Alert (this,"保存成功");   
			}
			catch
			{
				utils.Alert (this,"保存失败");
			}
		}
		private void spdb_edit_PreRender(object sender, System.EventArgs e)
		{
			this.RegisterHiddenField("HiddenCommon",Request["HiddenCommon"]);
		}
		/// <summary>
		/// 画面中code的检索画面启动返回等处理
		/// </summary>
		private void CodeSearch()
		{
			string[] strs;
			if(!Page.IsPostBack)
			{
				string strScript;

    			strScript = JSUtil.GetOpenDialogScript("产品选择","../CommonSearch/sprk.aspx",380,400,"spdb_edit");

				this.cpname.Attributes.Add("OnDblClick",strScript);

			}
			if(Session["Ret_Search_Value"]!=null)
			{
				if (Request["HiddenCommon"]!=null && Request["HiddenCommon"]!="")
				{
					switch(Request["HiddenCommon"].ToString())
					{
						case"产品选择":
							strs = Session["Ret_Search_Value"].ToString().Split(',');
							if (this.cpname.Text.ToString()!="")
							{
								this.cpname.Text = strs[1];
								this.cpid.Text = strs[0];
							}
							else
							{
								this.cpname.Text =strs[1];
								this.cpid.Text =strs[0];

							}
							this.ViewState["KindCommon"]=null;
							Session["Ret_Search_Value"]=null;
							break;
					}
				}
			}
			JSUtil.ExecuteBlock(this,"parent.frames[\"spdb_edit\"].spdb_edit.HiddenCommon.value=\"\"");

		}
	}
	
}
