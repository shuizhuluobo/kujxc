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
	/// product_add 的摘要说明。
	/// </summary>
	public class product_edit : jxc.UsrControl.UserPage//System.Web.UI.Page//
	{
		protected System.Web.UI.WebControls.DropDownList DropDownListlx;
		protected System.Web.UI.WebControls.TextBox cpname;
		protected System.Web.UI.WebControls.TextBox xh;
		protected System.Web.UI.WebControls.TextBox gg;
		protected System.Web.UI.WebControls.DropDownList sfxg;
		protected System.Web.UI.WebControls.TextBox price;
		protected System.Web.UI.WebControls.TextBox TextBox1;
		protected System.Web.UI.WebControls.Label Label2;
		protected System.Web.UI.WebControls.Label Label3;
		protected System.Web.UI.WebControls.Label Label4;
		protected System.Web.UI.WebControls.TextBox TextBox2;
		protected System.Web.UI.WebControls.DropDownList DropDownList1;
		protected System.Web.UI.WebControls.TextBox TextBox3;
		protected System.Web.UI.WebControls.Label Label1;
		protected System.Web.UI.WebControls.Label Label5;
		protected System.Web.UI.WebControls.Label Label6;
		protected System.Web.UI.WebControls.Button save;
	
		private void Page_Load(object sender, System.EventArgs e)
		{
			if (!this.Page.IsPostBack)
			{
				utils.BindDropDownList("select listname,listname from 产品类别 where orderid=0",this.DropDownListlx);
				string id = this.Request.QueryString["cpid"];
				if (id != string.Empty && id != null)
				{
					TextBox1.Text=id;
					string cmd = "select * from 产品信息 where cpid='" + id + "'";
					SqlDataReader dr = DBBase.ExecuteSqlReader (cmd);
					if (dr.Read ())
					{
						this.cpname.Text = dr["产品名称"].ToString ();
						this.xh.Text = dr["型号"].ToString ();
						this.gg.Text = dr["规格"].ToString ();
						this.TextBox2.Text = dr["类别"].ToString ();
						//this.sfxg.SelectedItem.Text = dr["是否下柜"].ToString ();
						for (int i=0;i<this.sfxg.Items.Count;i++)
						{
							if (this.sfxg.Items[i].Text == dr["是否下柜"].ToString ())
							{
								this.sfxg.SelectedIndex = i;
								break;
							}
						}
						this.price.Text = dr["价格"].ToString ();
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
			this.DropDownList1.SelectedIndexChanged += new System.EventHandler(this.DropDownList1_SelectedIndexChanged);
			this.save.Click += new System.EventHandler(this.save_Click);
			this.Load += new System.EventHandler(this.Page_Load);

		}
		#endregion

		private void save_Click(object sender, System.EventArgs e)
		{
			string id = this.Request.QueryString["cpid"];
			//string cmd = "";
			if (cpname.Text.Trim()=="")
			{
               utils.Alert (this,"商品名称不能为空");
				return;
			}
//			if (TextBox1.Text.Trim()=="")
//			{
//				utils.Alert (this,"编码不能为空");
//				return;
//			}
			if (price.Text.Trim()=="")
			{
				utils.Alert (this,"价格不能为空");
				return;
			}
			if (TextBox2.Text.Trim()=="")
			{
				utils.Alert (this,"主类别不能为空");
				return;
			}
			if (TextBox3.Text.Trim()=="")
			{
				utils.Alert (this,"二级类别不能为空");
				return;
			}
			if (gg.Text.Trim()=="")
			{
				utils.Alert (this,"数量单位不能为空");
				return;
			}
			if (id != string.Empty && id != null)
			{
				string[] cmd=new string[1];
				cmd[0] = "update 产品信息 set 产品名称='" + this.cpname.Text.Trim () + "',";
				cmd[0] += " 型号='" + this.TextBox3.Text.Trim () + "',";
				cmd[0] += " 条码='" + this.TextBox1.Text.Trim () + "',";
				cmd[0] += " 类别='" + this.TextBox2.Text + "',";
				cmd[0] += " 规格='" + this.gg.Text.Trim () + "',";
				cmd[0] += " 是否下柜='" + this.sfxg.SelectedItem.Text + "',";
				cmd[0] += " 经办人='" + this.glydh + "',";
				//cmd += " 修改日期=getdate(),";
				cmd[0] += " 价格=" + this.price.Text.Trim ();
				cmd[0] += " where cpid='" + id + "'";
               // cmd[1] = "update 入库单 set 产品名称='" + this.cpname.Text.Trim () + "' where cpid='" + id + "'";;
				//cmd[2] = "update 发货单 set 产品名称='" + this.cpname.Text.Trim () + "' where cpid='" + id + "'";;
				//cmd[3] = "update 样品入库单 set 产品名称='" + this.cpname.Text.Trim () + "' where cpid='" + id + "'";;
				//cmd[4] = "update 调拨单 set 产品名称='" + this.cpname.Text.Trim () + "' where cpid='" + id + "'";;
				//cmd[5] = "update 销售单明细 set 产品名称='" + this.cpname.Text.Trim () + "' where cpid='" + id + "'";;

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
				string cmd="select * from 产品信息 where  产品名称='"+cpname.Text.ToString()+"'";
			if (DBBase.IsValuesExists(cmd)==true)
			{
                utils.Alert (this,"该产品名称已经存在!");
				return;
			}
				if (TextBox1.Text.ToString()!="")
				{
					cmd="select * from 产品信息 where  cpid='"+TextBox1.Text.ToString()+"'";
					if (DBBase.IsValuesExists(cmd)==true)
					{
						utils.Alert (this,"该条码已经存在!");
						return;
					}
				}
				string cpid = utils.Getbm("cpid","产品信息",string.Format("{0:yyyyMM}",DateTime.Now),4);//update by lln 2011-01-30
				cmd = "INSERT INTO [产品信息]([cpid], [产品名称], [型号], [类别], [规格], [经办人], [是否下柜], [修改日期],[价格],[条码]) VALUES(";
				//cmd += "'" + TextBox1.Text.Trim() + "','" + this.cpname.Text.Trim () + "','" + this.TextBox3.Text.Trim () + "','" + this.TextBox2.Text + "',";
				cmd += "'" + cpid.ToString().Trim() + "','" + this.cpname.Text.Trim () + "','" + this.TextBox3.Text.Trim () + "','" + this.TextBox2.Text + "',";
				cmd += "'" + this.gg.Text + "','" + this.glydh + "','" + this.sfxg.SelectedItem.Text + "',getdate()," + this.price.Text.Trim () +",'"+TextBox1.Text.Trim()+ "')";
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
			this.TextBox2.Text=this.DropDownListlx.SelectedItem.Text.ToString();
			utils.BindDropDownList("select judgename,judgename from 产品类别 where  orderid=1 and listname='"+this.DropDownListlx.SelectedItem.Text.ToString()+"'",this.DropDownList1);
	this.TextBox3.Text="";
		}

		private void DropDownList1_SelectedIndexChanged(object sender, System.EventArgs e)
		{
			this.TextBox3.Text=this.DropDownList1.SelectedItem.Text.ToString();
		}
	}
}
