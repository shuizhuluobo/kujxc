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

namespace jxc.admin.bases
{
	/// <summary>
	/// kh_add 的摘要说明。
	/// </summary>
	public class kh_edit : jxc.UsrControl.UserPage//System.Web.UI.Page//
	{
		protected System.Web.UI.WebControls.DropDownList DropDownListlx;
		protected System.Web.UI.WebControls.TextBox cpname;
		protected System.Web.UI.WebControls.DropDownList sfxg;
		protected System.Web.UI.WebControls.Label Label2;
		protected System.Web.UI.WebControls.Label Label3;
		protected System.Web.UI.WebControls.Label Label4;
		protected System.Web.UI.WebControls.TextBox khid;
		protected System.Web.UI.WebControls.TextBox lxrtxt;
		protected System.Web.UI.WebControls.TextBox txtdh;
		protected System.Web.UI.WebControls.TextBox txtcz;
		protected System.Web.UI.WebControls.TextBox txtdq;
		protected System.Web.UI.WebControls.TextBox txtkhyh;
		protected System.Web.UI.WebControls.TextBox txtyhzh;
		protected System.Web.UI.WebControls.TextBox txtdwdz;
		protected System.Web.UI.WebControls.TextBox txtzjm;
		protected System.Web.UI.WebControls.Button save;
	
		private void Page_Load(object sender, System.EventArgs e)
		{
			if (!this.Page.IsPostBack)
			{
				//utils.BindDropDownList("select listid,listname from rs_corsub where sortid=7",this.DropDownListlx);
				string id = this.Request.QueryString["khid"];
				if (id != string.Empty && id != null)
				{
					string cmd = "select * from 基础信息_客户档案 where 客户ID='" + id + "'";
					SqlDataReader dr = DBBase.ExecuteSqlReader (cmd);
					if (dr.Read ())
					{
						this.cpname.Text = dr["客户名称"].ToString ();
						this.khid.Text = dr["客户ID"].ToString ();
						this.txtdh.Text = dr["电话"].ToString ();
						this.txtcz.Text = dr["传真"].ToString ();
						this.lxrtxt.Text = dr["联系人"].ToString ();
						this.txtdwdz.Text = dr["单位地址"].ToString ();
						this.txtkhyh.Text = dr["开户银行"].ToString ();
						this.txtyhzh.Text = dr["银行帐号"].ToString ();
						this.txtdq.Text = dr["地区"].ToString ();	
						txtzjm.Text=dr["助记码"].ToString();
								
//						//this.sfxg.SelectedItem.Text = dr["是否下柜"].ToString ();
//						for (int i=0;i<this.sfxg.Items.Count;i++)
//						{
//							if (this.sfxg.Items[i].Text == dr["是否下柜"].ToString ())
//							{
//								this.sfxg.SelectedIndex = i;
//								break;
//							}
//						}
						
					}
					dr.Close ();

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
			this.DropDownListlx.SelectedIndexChanged += new System.EventHandler(this.DropDownListlx_SelectedIndexChanged);
			this.save.Click += new System.EventHandler(this.save_Click);
			this.Load += new System.EventHandler(this.Page_Load);

		}
		#endregion

		private void save_Click(object sender, System.EventArgs e)
		{
			string id = this.Request.QueryString["khid"];
			//string cmd = "";
			if (cpname.Text.Trim()=="")
			{
               utils.Alert (this," 客户名称不能为空");
				return;
			}
			if (lxrtxt.Text.Trim()=="")
			{
				utils.Alert (this,"联系人不能为空");
				return;
			}

			if (id != string.Empty && id != null)
			{
				string[] cmd=new string[1];
				//				this.cpname.Text = dr["客户名称"].ToString ();
				//				this.khid.Text = dr["客户ID"].ToString ();
				//				this.txtdh.Text = dr["电话"].ToString ();
				//				this.txtcz.Text = dr["传真"].ToString ();
				//				this.lxrtxt.Text = dr["联系人"].ToString ();
				//				this.txtdwdz.Text = dr["单位地址"].ToString ();
				//				this.txtkhyh.Text = dr["开户银行"].ToString ();
				//				this.txtyhzh.Text = dr["银行帐号"].ToString ();
				//				this.txtdq.Text = dr["地区"].ToString ();
				cmd[0] = "update 基础信息_客户档案 set 客户名称='" + this.cpname.Text.Trim () + "',";
				cmd[0] += " 电话='" + this.txtdh.Text.Trim () + "',";
				cmd[0] += " 传真='" + this.txtcz.Text.Trim () + "',";
				cmd[0] += " 联系人='" + this.lxrtxt.Text + "',";
				cmd[0] += " 单位地址='" + this.txtdwdz.Text.Trim () + "',";
				cmd[0] += " 银行帐号='" + this.txtyhzh.Text + "',";
				cmd[0] += " 开户银行='" + this.txtkhyh.Text + "',";
				cmd[0] += " 地区='" + this.txtdq.Text + "',";
				cmd[0] += " 助记码='" + this.txtzjm.Text + "'";				
				cmd[0] += " where 客户ID='" + id + "'";
				try
				{
					DBBase.ExecuteSqls (cmd);
					utils.Alert (this,"保存成功");
					JSUtil.Close(this);
				}
				catch
				{
					utils.Alert (this,"保存失败");
				}
			}
			else
			{			
				string cmd="select * from 基础信息_客户档案 where   客户名称='"+cpname.Text.ToString()+"'";
			if (DBBase.IsValuesExists(cmd)==true)
			{
                utils.Alert (this,"该客户名称已经存在!");
				return;
			}
				string cpid = utils.Getbm("客户ID","基础信息_客户档案",string.Format("{0:yyyyMM}",DateTime.Now),3);
    this.khid.Text=cpid;
//				this.cpname.Text = dr["客户名称"].ToString ();
//				this.khid.Text = dr["客户ID"].ToString ();
//				this.txtdh.Text = dr["电话"].ToString ();
//				this.txtcz.Text = dr["传真"].ToString ();
//				this.lxrtxt.Text = dr["联系人"].ToString ();
//				this.txtdwdz.Text = dr["单位地址"].ToString ();
//				this.txtkhyh.Text = dr["开户银行"].ToString ();
//				this.txtyhzh.Text = dr["银行帐号"].ToString ();
//				this.txtdq.Text = dr["地区"].ToString ();	
				cmd = "INSERT INTO [基础信息_客户档案](客户名称,客户ID,电话,传真,联系人,单位地址,开户银行,银行帐号,地区,助记码) VALUES(";
				cmd += "'" + cpname.Text.Trim() + "','" + this.khid.Text.Trim () + "','" + this.txtdh.Text.Trim () + "','" + this.txtcz.Text + "',";
				cmd += "'" + this.lxrtxt.Text + "','" + this.txtdwdz.Text + "','" + this.txtkhyh.Text + "','" + this.txtyhzh.Text.Trim () +"','"+txtdq.Text.Trim()+ "','"+this.txtzjm.Text+"')";
				try
				{
					DBBase.ExecuteSql (cmd);
					utils.Alert (this,"保存成功");
					JSUtil.Close(this);
				}
				catch
				{
					utils.Alert (this,"保存失败");
				}
			}
			
		}

		private void DropDownListlx_SelectedIndexChanged(object sender, System.EventArgs e)
		{
			
		}
	}
}
