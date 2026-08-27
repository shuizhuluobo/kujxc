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
using jxc.ascx;

namespace jxc.admin.bases
{
	/// <summary>
	/// sprd_add 的摘要说明。
	/// </summary>
	public class sprd_edit :jxc.UsrControl.UserPage//System.Web.UI.Page// System.Web.UI.Page//
	{
		protected System.Web.UI.WebControls.DropDownList DropDownListlx;
		protected System.Web.UI.WebControls.TextBox rkrq;
		protected System.Web.UI.WebControls.TextBox cpname;
		protected System.Web.UI.WebControls.TextBox cpid;
		protected System.Web.UI.WebControls.TextBox czy;
		protected System.Web.UI.WebControls.TextBox rksl;
		protected System.Web.UI.WebControls.TextBox Textbox2;
		protected System.Web.UI.WebControls.Button Button1;
		protected System.Web.UI.WebControls.TextBox Textbox4;
		protected System.Web.UI.WebControls.Button save;
		protected System.Web.UI.WebControls.Button Button2;
		protected System.Web.UI.WebControls.TextBox Textbox6;
		protected System.Web.UI.WebControls.Button Button3;
		protected System.Web.UI.WebControls.TextBox Textbox7;
		protected System.Web.UI.WebControls.TextBox Textbox8;
		protected System.Web.UI.WebControls.DataGrid Datagrid2;
		protected System.Web.UI.WebControls.TextBox Textbox1;
		protected System.Web.UI.WebControls.DataGrid Datagrid1;
		protected System.Web.UI.WebControls.TextBox Textbox3;
		protected System.Web.UI.WebControls.TextBox Textbox5;
		protected System.Web.UI.WebControls.TextBox Textbox9;
		protected System.Web.UI.WebControls.TextBox Textbox10;
		protected System.Web.UI.WebControls.Label Label2;
		protected System.Web.UI.WebControls.Label Label1;
		protected System.Web.UI.WebControls.TextBox Textbox11;
		protected System.Web.UI.WebControls.TextBox Textbox12;
		utils u = new utils ();
		private void Page_Load(object sender, System.EventArgs e)
		{
			//	CodeSearch();
			if (!this.Page.IsPostBack)
			{
				u.SetGridStyle(this.Datagrid1);
				u.SetGridStyle(this.Datagrid2);
//				DgNavigation1.SetTarget(Datagrid1,null,new BindDataDelegate(BindData));//BindData是你的数据邦定事件
//				DgNavigation1.SetStyle(20, false);//10表示每页分10行，true表示无分页时自动隐藏
				utils.BindDropDownList("select jgmc,jgmc from cnc_jgglb where jgmc<>'公司商务部' and jgmc='星通库房' and parent1='"+this.jgbh.ToString()+"'",this.DropDownListlx);
				rkrq.Text=string.Format("{0:yyyy-MM-dd}",DateTime.Now);
				this.czy.Text=this.glyname.ToString();
				Textbox4.Text =  this.Request.QueryString["rkid"];
				Textbox1.Text = utils.Getbm("入库单编号","入库单",this.glydh.ToString()+string.Format("{0:yyyyMMdd}",DateTime.Now),4);
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
			this.Button3.Click += new System.EventHandler(this.Button3_Click);
			this.Datagrid1.ItemDataBound += new System.Web.UI.WebControls.DataGridItemEventHandler(this.Datagrid1_ItemDataBound);
			this.Datagrid1.SelectedIndexChanged += new System.EventHandler(this.h);
			this.Button2.Click += new System.EventHandler(this.Button2_Click);
			this.Button1.Click += new System.EventHandler(this.Button1_Click);
			this.Datagrid2.ItemDataBound += new System.Web.UI.WebControls.DataGridItemEventHandler(this.Datagrid2_ItemDataBound);
			this.Datagrid2.SelectedIndexChanged += new System.EventHandler(this.h1);
			this.save.Click += new System.EventHandler(this.save_Click);
			this.Load += new System.EventHandler(this.Page_Load);
			this.PreRender += new System.EventHandler(this.sprd_edit_PreRender);

		}
		#endregion

		private void save_Click(object sender, System.EventArgs e)
		{
			if (DropDownListlx.SelectedIndex==0) 
			{
				utils.Alert (this,"仓库不能为空");
				return;
			}
		    string str="select sum(入库数量) as 总数量,sum(入库数量*进货价) as 总金额 from 入库单 where 入库单编号='"+Textbox4.Text+"'";
			string cmd="";
			SqlDataReader dr = DBBase.ExecuteSqlReader (str);
			if (dr.Read ())
			{
				string zzid = utils.Getbm("zzid","地区总账",string.Format("{0:yyyyMM}",DateTime.Now),6);
				cmd="insert into 地区总账(zzid,日期,地区,摘要,借方,贷方,余额,其他,分类,单据号)values('"+zzid+"','"+DateTime.Now.ToString("yyyy-MM-dd")+"','";
				cmd+=this.DropDownListlx.SelectedValue.ToString()+"','从总公司进货(产品总数量："+dr["总数量"].ToString().Trim () +")',"+dr["总金额"].ToString().Trim () +",0,"+dr["总金额"].ToString().Trim ()+",'总库保下拨','公司进货','"+Textbox4.Text+"')";
			}
			dr.Close();
//				string[] cmd=new string[2];
//				string rkid = utils.Getbm("rkid","入库单",string.Format("{0:yyyyMMdd}",DateTime.Now),4);
//				cmd[0] = "INSERT INTO [入库单]([rkid], [产品名称], [cpid], [仓库名称], [操作员], [入库数量],[剩余数量], [入库单价],[入库日期], [到货确认], [库保确认],颜色,款号,折扣率) VALUES(";
//				cmd[0] += "'" + rkid + "','" + this.cpname.Text.Trim () + "','" + this.cpid.Text.Trim () + "','" + this.DropDownListlx.SelectedItem.Text + "',";
//				cmd[0] += "'" + this.glyname.ToString() + "'," + this.rksl.Text.Trim() + ","+ this.rksl.Text.Trim() + "," + this.Textbox1.Text.Trim()  + ",'"+rkrq.Text+"','否','是','"+this.Dropdownlist2.SelectedValue.ToString()+"','"+Textbox2.Text+"','"+Textbox3.Text+"')";
//string zzid = utils.Getbm("zzid","地区总账",string.Format("{0:yyyyMM}",DateTime.Now),6);
//  cmd[1]="insert into 地区总账(zzid,日期,地区,摘要,借方,贷方,余额,其他,分类,单据号)values('"+zzid+"','"+DateTime.Now.ToString("yyyy-MM-dd")+"','"+this.DropDownListlx.SelectedValue.ToString()+"','从总公司进货(产品名称："+this.cpname.Text.Trim () +")',"+Convert.ToDouble(this.rksl.Text)*Convert.ToDouble(this.Textbox1.Text)+",0,"+Convert.ToDouble(this.rksl.Text)*Convert.ToDouble(this.Textbox1.Text)+",'总库保下拨','公司进货','"+rkid+"')";
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
		/// <summary>
		/// 画面中code的检索画面启动返回等处理
		/// </summary>
		private void CodeSearch()
		{
			string[] strs;
			if(!Page.IsPostBack)
			{
				string strScript;

				strScript = JSUtil.GetOpenDialogScript("产品选择","../CommonSearch/spselect.aspx",380,400,"sprd_edit");

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
								this.Textbox1.Text=strs[2];
							}
							else
							{
								this.cpname.Text =strs[1];
								this.cpid.Text =strs[0];
								this.Textbox1.Text=strs[2];

							}
							this.ViewState["KindCommon"]=null;
							Session["Ret_Search_Value"]=null;
							break;
					}
				}
			}
			JSUtil.ExecuteBlock(this,"parent.frames[\"sprd_edit\"].sprd_edit.HiddenCommon.value=\"\"");

		}

		private void sprd_edit_PreRender(object sender, System.EventArgs e)
		{
			//this.RegisterHiddenField("HiddenCommon",Request["HiddenCommon"]);
		}

		private void cpname_TextChanged(object sender, System.EventArgs e)
		{
		
		}

		private void Button1_Click(object sender, System.EventArgs e)
		{
			if (Convert.ToDouble(this.rksl.Text)<=0) 
			{
				utils.Alert (this,"入库数量不能为0");
				return;
			}
			if (DropDownListlx.SelectedIndex==0) 
			{
				utils.Alert (this,"入库店铺不能为空");
				return;
			}
			DropDownListlx.Enabled=false;
			if (Convert.ToDouble(this.Textbox7.Text)<=0) 
			{
				utils.Alert (this,"零售价格不能为0");
				return;
			}
			
			DropDownListlx.Enabled=false;
			rkrq.Enabled=false;
			string[] cmd=new string[2];
			string rkid = utils.Getbm("rkid","入库单",string.Format("{0:yyyyMMdd}",DateTime.Now),4);
			cmd[0] = "INSERT INTO [入库单]([rkid], [产品名称], [cpid], [仓库名称],店名, [操作员], [入库数量],[剩余数量],";
			cmd[0]+="[入库单价],[入库日期], [到货确认], [库保确认],产品类别,型号,折扣率,入库单编号,规格,进货价,rkidold,下拨单编号,wldwid,供应商,可退) VALUES(";
			cmd[0]+= "'" + rkid + "','" + this.cpname.Text.Trim () + "','";
			cmd[0]+=this.cpid.Text.Trim () + "','" +this.Textbox5.Text+"','"+ this.DropDownListlx.SelectedItem.Text + "',";
			cmd[0]+= "'" + this.glyname.ToString() + "',";
			cmd[0]+=this.rksl.Text.Trim() + ","+ this.rksl.Text.Trim() + "," + this.Textbox7.Text.Trim()  + ",'"+rkrq.Text+"','否','是','"+this.Textbox8.Text+"','"+this.Textbox2.Text+"',10,'"+Textbox1.Text+"','"+Textbox6.Text+"',"+Textbox3.Text.Trim()+",'"+Textbox9.Text.Trim()+"','"+Textbox4.Text+"','"+Textbox12.Text+"','"+this.Textbox11.Text+"',"+rksl.Text+")";
			cmd[1]="update 下拨单 set 剩余数量 =剩余数量-"+this.rksl.Text+" where rkid='"+Textbox9.Text.ToString()+"'";
	//	string zzid = utils.Getbm("zzid","地区总账",string.Format("{0:yyyyMM}",DateTime.Now),6);
		//	cmd[1]="insert into 地区总账(zzid,日期,地区,摘要,借方,贷方,余额,其他,分类,单据号)values('"+zzid+"','"+DateTime.Now.ToString("yyyy-MM-dd")+"','"+this.DropDownListlx.SelectedValue.ToString()+"','从总公司进货(产品名称："+this.cpname.Text.Trim () +")',"+Convert.ToDouble(this.rksl.Text)*Convert.ToDouble(this.Textbox1.Text)+",0,"+Convert.ToDouble(this.rksl.Text)*Convert.ToDouble(this.Textbox1.Text)+",'总库保下拨','公司进货','"+rkid+"')";
			try
			{
				DBBase.ExecuteSqls (cmd);
				Button1.Enabled=false;
				BindData ();
				//utils.Alert (this,"保存成功");
				//JSUtil.Close(this);
			}
			catch
			{
				utils.Alert (this,"保存失败");
			}
		}
		private void BindData ()
		{
			string cmd = "select * from 下拨单 where 标志='是' and 入库单编号='"+this.Textbox4.Text+"' ";
			DataSet ds = DBBase.ExecuteSql4Ds (cmd+" order by cpid,型号,颜色","sprd");
			this.Datagrid1.DataSource = ds.Tables[0].DefaultView;
			this.Datagrid1.DataBind ();
			cmd = "select * from 入库单 where 入库单编号='"+this.Textbox1.Text.Trim()+"' ";
			ds = DBBase.ExecuteSql4Ds (cmd+" order by 产品类别","xbd");
			this.Datagrid2.DataSource = ds.Tables["xbd"].DefaultView;
			this.Datagrid2.DataBind ();
		}
		private void BindData1 ()
		{
         
			string cmd = "select * from 下拨单 where 标志='是' and 入库单编号='"+this.Textbox4.Text+"' ";
						if (cpid.Text.Trim()!="")
										 {
							cmd+=" and cpid='"+this.cpid.Text.Trim()+"'";

										 }
			DataSet ds = DBBase.ExecuteSql4Ds (cmd+" order by cpid,型号,颜色","sprd");
			this.Datagrid1.DataSource = ds.Tables[0].DefaultView;
			this.Datagrid1.DataBind ();
		}

		private void Button2_Click(object sender, System.EventArgs e)
		{
//			string cmd = "select * from 产品信息 where cpid='" + cpid.Text + "'";
//			SqlDataReader dr = DBBase.ExecuteSqlReader (cmd);
//								if (dr.Read ())
//								{
//									this.cpname.Text = dr["产品名称"].ToString ();
//									//this.cpid.Text = dr["cpid"].ToString ();
//									//this.Textbox4.Text = dr["仓库名称"].ToString ();
//									this.Textbox2.Text = dr["型号"].ToString (); 
//									//this.Textbox5.Text = dr["零售价"].ToString ();
//									this.Textbox1.Text = dr["价格"].ToString ();
//									Textbox5.Text=Convert.ToString(Convert.ToDouble(this.Textbox1.Text)*Convert.ToDouble(this.Textbox3.Text)/10);
//									//this.Textbox1.Text = dr["剩余数量"].ToString (); 
//								}
//								dr.Close ();
			BindData1();
		}

		private void Textbox5_TextChanged(object sender, System.EventArgs e)
		{
		
		}

		private void Datagrid1_ItemDataBound(object sender, System.Web.UI.WebControls.DataGridItemEventArgs e)
		{
//			for(int i=0;i<Datagrid1.Items.Count-1;i++)
//			{   
//				int colnum=1;
//				int j;
//				for( j=i+1;j<Datagrid1.Items.Count;j++)
//				{
//					if(Datagrid1.Items[i].Cells[0].Text==Datagrid1.Items[j].Cells[0].Text)      
//					{
//						colnum++;
//						Datagrid1.Items[i].Cells[1].RowSpan=colnum;
//						Datagrid1.Items[j].Cells[1].Visible=false;     
//						Datagrid1.Items[i].Cells[0].RowSpan=colnum;
//						Datagrid1.Items[j].Cells[0].Visible=false; 
//						Datagrid1.Items[i].Cells[2].RowSpan=colnum;
//						Datagrid1.Items[j].Cells[2].Visible=false;
////						Datagrid1.Items[i].Cells[3].RowSpan=colnum;
////						Datagrid1.Items[j].Cells[3].Visible=false;
////						Datagrid1.Items[i].Cells[8].RowSpan=colnum;
////						Datagrid1.Items[j].Cells[8].Visible=false;
////						Datagrid1.Items[i].Cells[5].RowSpan=colnum;
////						Datagrid1.Items[j].Cells[5].Visible=false;
//					
//					}     
//					else
//						break;
//				}
//				i=j-1;
//				if   (e.Item.ItemType   !=   ListItemType.Header)   
//				{   
//					e.Item.Cells[0].Text   =   (e.Item.DataSetIndex   +   1).ToString();   
//				}
				if   (e.Item.ItemIndex   >=   0)   
				{   
					e.Item.Attributes["onMouseOver"]   =   "javascript:this.bgColor='#C6D7E7';";   
					e.Item.Attributes["onMouseOut"]   =   "javascript:this.bgColor='#ffffff';";   
				} 
//			}
		}

		private void Textbox3_TextChanged(object sender, System.EventArgs e)
		{
		////Textbox5.Text=Convert.ToString(Convert.ToDouble(this.Textbox1.Text)*Convert.ToDouble(this.Textbox3.Text)/10);
		}

		private void Datagrid2_ItemDataBound(object sender, System.Web.UI.WebControls.DataGridItemEventArgs e)
		{
			for(int i=0;i<Datagrid2.Items.Count-1;i++)
			{   
				int colnum=1;
				int j;
				for( j=i+1;j<Datagrid2.Items.Count;j++)
				{
					if(Datagrid2.Items[i].Cells[0].Text==Datagrid2.Items[j].Cells[0].Text)      
					{
						colnum++;
						Datagrid2.Items[i].Cells[1].RowSpan=colnum;
						Datagrid2.Items[j].Cells[1].Visible=false;     
						Datagrid1.Items[i].Cells[0].RowSpan=colnum;
						Datagrid1.Items[j].Cells[0].Visible=false; 
						Datagrid2.Items[i].Cells[2].RowSpan=colnum;
						Datagrid2.Items[j].Cells[2].Visible=false;
//						Datagrid2.Items[i].Cells[3].RowSpan=colnum;
//						Datagrid2.Items[j].Cells[3].Visible=false;
						//						Datagrid1.Items[i].Cells[8].RowSpan=colnum;
						//						Datagrid1.Items[j].Cells[8].Visible=false;
						//						Datagrid1.Items[i].Cells[5].RowSpan=colnum;
						//						Datagrid1.Items[j].Cells[5].Visible=false;
					
					}     
					else
						break;
				}
				i=j-1;
			}
		}

		private void h(object sender, System.EventArgs e)
		{

			string id = Datagrid1.SelectedItem.Cells[10].Text;;
			if (id!=null)
			{
				string cmd = "select * from 下拨单 where 1=1 and rkid='"+id+"'";
				SqlDataReader dr = DBBase.ExecuteSqlReader (cmd);
				if (dr.Read ())
				{
					if (dr["到货确认"].ToString()=="否")
					{
						Button1.Enabled=false;
						utils.Alert (this,"该商品未到货,不能入库！");   
					}
					else
					{
						if (Convert.ToDouble(dr["剩余数量"].ToString()) >0)
						{
							this.cpname.Text = dr["产品名称"].ToString ();
							this.cpid.Text = dr["cpid"].ToString ();
							this.Textbox5.Text = dr["仓库名称"].ToString ();
							this.Textbox2.Text = dr["型号"].ToString (); 
							this.Textbox8.Text = dr["类别"].ToString ();
							this.Textbox6.Text = dr["进货价"].ToString ();
							this.Textbox7.Text = dr["入库单价"].ToString ();
							this.Textbox3.Text = dr["进货价"].ToString ();
							this.Textbox9.Text=id;//条码Textbox9
							this.rksl.Text = dr["剩余数量"].ToString ();
							Textbox11.Text=dr["供应商"].ToString();
							Textbox12.Text=dr["wldwid"].ToString();
							Button1.Enabled=true;
						}
						else
						{
							this.cpname.Text = "";
							this.cpid.Text =  "";
							this.Textbox5.Text =  "";
							this.Textbox2.Text = ""; 
							this.Textbox8.Text =  "";
							this.Textbox6.Text =  "";
							this.Textbox7.Text =  "";
							this.Textbox3.Text =  "";
							Textbox9.Text= "";//条码Textbox9
							this.rksl.Text =  "";
							Textbox11.Text="";
							Textbox12.Text="";
							Button1.Enabled=false;
							utils.Alert (this,"该商品剩余数量<=0");
						}
					}
				}
				dr.Close();
			}
		}

		private void Button3_Click(object sender, System.EventArgs e)
		{
		
		}

		private void h1(object sender, System.EventArgs e)
		{
			string id = Datagrid2.SelectedItem.Cells[8].Text;
			string id1 = Datagrid2.SelectedItem.Cells[9].Text;
			
			if (id!=null)
			{

				string cmd = "select * from 入库单  where 1=1 and rkid='"+id1+"'";
				SqlDataReader dr = DBBase.ExecuteSqlReader (cmd);
				if (dr.Read ())
				{
					string[] cmd1=new string[2];
					cmd1[0] = "update 下拨单 set 剩余数量=剩余数量+"+dr["剩余数量"].ToString ()+" where 1=1 and rkid='"+id+"'";
					cmd1[1] = "delete 入库单 where rkid='"+id1+"'";
                    DBBase.ExecuteSqls(cmd1);
				}
				dr.Close();
				BindData ();
			}

		   
		}
	}
}
