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
	/// spxb_add 的摘要说明。
	/// </summary>
	public class spxb_edit :jxc.UsrControl.UserPage//System.Web.UI.Page// 
	{
		protected System.Web.UI.WebControls.DropDownList DropDownListlx;
		protected System.Web.UI.WebControls.TextBox Textbox1;
		protected System.Web.UI.WebControls.TextBox rkrq;
		protected System.Web.UI.WebControls.TextBox cpname;
		protected System.Web.UI.WebControls.TextBox cpid;
		protected System.Web.UI.WebControls.TextBox czy;
		protected System.Web.UI.WebControls.TextBox rksl;
		protected System.Web.UI.WebControls.DataGrid Datagrid1;
		protected System.Web.UI.WebControls.DropDownList Dropdownlist2;
		protected System.Web.UI.WebControls.TextBox Textbox2;
		protected System.Web.UI.WebControls.Button Button1;
		protected System.Web.UI.WebControls.TextBox Textbox3;
		protected System.Web.UI.WebControls.TextBox Textbox4;
		protected System.Web.UI.WebControls.Button save;
		protected dgNavigation DgNavigation1;
		protected System.Web.UI.WebControls.Button Button2;
		protected System.Web.UI.WebControls.TextBox Textbox5;
		protected System.Web.UI.WebControls.TextBox Textbox6;
		protected System.Web.UI.WebControls.Button Button3;
		private double runningTotal = 0;
		private double runningTotal1 = 0;
		protected System.Web.UI.WebControls.DropDownList Dropdownlist1;
		protected System.Web.UI.WebControls.TextBox txtgys;
		protected System.Web.UI.WebControls.TextBox Textbox7;
		protected System.Web.UI.WebControls.TextBox Textbox8;
		protected System.Web.UI.WebControls.TextBox Textbox9;
		protected System.Web.UI.WebControls.TextBox txtbz;
		protected System.Web.UI.WebControls.DropDownList Dropdownlist3;
		protected System.Web.UI.WebControls.DropDownList Dropdownlist4;
		utils u = new utils ();
		private void Page_Load(object sender, System.EventArgs e)
		{
				CodeSearch();
			    CodeSearch2();
			CodeSearch1();
			if (!this.Page.IsPostBack)
			{
				u.SetGridStyle(this.Datagrid1);
				DgNavigation1.SetTarget(Datagrid1,null,new BindDataDelegate(BindData));//BindData是你的数据邦定事件
				DgNavigation1.SetStyle(20, false);//10表示每页分10行，true表示无分页时自动隐藏
				utils.BindDropDownList("select jgmc,jgmc from cnc_jgglb where parent1='01' and jgmc='星通公司' order by jgmc desc",this.DropDownListlx);
				DropDownListlx.SelectedIndex=1;
			    //DropDownListlx.Enabled=false;
				//utils.BindDropDownList("select wldwid,名称 from 往来单位档案 where 类别='供应商'",this.Dropdownlist3);
				rkrq.Text=string.Format("{0:yyyy-MM-dd}",DateTime.Now);
				this.czy.Text=this.glyname.ToString();
				string cmd="delete from 下拨单 where  标志='否' and 操作员='"+this.glyname.ToString()+"'";
				DBBase.ExecuteSql(cmd);
				Textbox4.Text = utils.Getbm("入库单编号","下拨单",this.glydh.ToString()+string.Format("{0:yyyyMMdd}",DateTime.Now),4);
			    Button3.Attributes.Add("onclick","return confirm('您真的要删除所选择的商品记录吗？')");
				BindData ();

			}
		}
		/// <summary>
		/// 画面中code的检索画面启动返回等处理
		/// </summary>
		private void CodeSearch1()
		{
			string[] strs;
			if(!Page.IsPostBack)
			{
				string strScript;

				strScript = JSUtil.GetOpenDialogScript("客户选择","../CommonSearch/khselect.aspx",380,400,"spxb_edit");

				this.txtbz.Attributes.Add("OnDblClick",strScript);

			}
			if(Session["Ret_Search_Value"]!=null)
			{
				if (Request["HiddenCommon"]!=null && Request["HiddenCommon"]!="")
				{
					switch(Request["HiddenCommon"].ToString())
					{
						case"客户选择":
							strs = Session["Ret_Search_Value"].ToString().Split(',');
							if (this.txtbz.Text.ToString()!="")
							{
								this.txtbz.Text = strs[1];
							}
							else
							{
								this.txtbz.Text =strs[1];
							}
							this.ViewState["KindCommon"]=null;
							Session["Ret_Search_Value"]=null;
							break;
					}
				}
			}
			JSUtil.ExecuteBlock(this,"parent.frames[\"spxb_edit\"].spxb_edit.HiddenCommon.value=\"\"");
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
			this.cpid.TextChanged += new System.EventHandler(this.cpid_TextChanged);
			this.Button2.Click += new System.EventHandler(this.Button2_Click);
			this.Textbox3.TextChanged += new System.EventHandler(this.Textbox3_TextChanged);
			this.Dropdownlist1.SelectedIndexChanged += new System.EventHandler(this.Dropdownlist1_SelectedIndexChanged);
			this.Textbox5.TextChanged += new System.EventHandler(this.Textbox5_TextChanged);
			this.Dropdownlist3.SelectedIndexChanged += new System.EventHandler(this.Dropdownlist3_SelectedIndexChanged);
			this.Button1.Click += new System.EventHandler(this.Button1_Click);
			this.Button3.Click += new System.EventHandler(this.Button3_Click);
			this.Datagrid1.ItemDataBound += new System.Web.UI.WebControls.DataGridItemEventHandler(this.Datagrid1_ItemDataBound);
			this.save.Click += new System.EventHandler(this.save_Click);
			this.Load += new System.EventHandler(this.Page_Load);
			this.PreRender += new System.EventHandler(this.spxb_edit_PreRender);

		}
		#endregion

		private void save_Click(object sender, System.EventArgs e)
		{
			if (DropDownListlx.SelectedIndex==0) 
			{
				utils.Alert (this,"仓库不能为空");
				return;
			}
		    string str="select sum(入库数量) as 总数量,sum(入库数量*进货价) as 总金额 from 下拨单 where 入库单编号='"+Textbox4.Text+"'";
            string[] cmd=new string[2];
			SqlDataReader dr = DBBase.ExecuteSqlReader (str);
			if (dr.Read ())
			{
				string zzid = utils.Getbm("zzid","地区总账",string.Format("{0:yyyyMM}",DateTime.Now),6);
				cmd[0]="insert into 地区总账(zzid,日期,地区,摘要,借方,贷方,余额,其他,分类,单据号)values('"+zzid+"','"+DateTime.Now.ToString("yyyy-MM-dd")+"','";
				cmd[0]+=this.DropDownListlx.SelectedValue.ToString()+"','从总公司进货(产品总数量："+dr["总数量"].ToString().Trim () +")',"+dr["总金额"].ToString().Trim () +",0,"+dr["总金额"].ToString().Trim ()+",'总库保下拨','公司进货','"+Textbox4.Text+"')";
    
			}
			dr.Close();
			cmd[1]="update 下拨单 set 标志='是' where 入库单编号='"+Textbox4.Text+"'";
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
		/// <summary>
		/// 画面中code的检索画面启动返回等处理
		/// </summary>
		private void CodeSearch()
		{
			string[] strs;
			if(!Page.IsPostBack)
			{
				string strScript;

				strScript = JSUtil.GetOpenDialogScript("产品选择","../CommonSearch/spselect.aspx",550,650,"spxb_edit");

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
								//this.Textbox1.Text=strs[2];
								this.Textbox5.Text=strs[2];
								this.Textbox8.Text=strs[3];	
								this.Textbox2.Text=strs[4];	
								Textbox6.Text=strs[5];
							}
							else
							{
								this.cpname.Text =strs[1];
								this.cpid.Text =strs[0];
								//this.Textbox1.Text=strs[2];
								this.Textbox5.Text=strs[2];
                                this.Textbox8.Text=strs[3];
								this.Textbox2.Text=strs[4];	
								Textbox6.Text=strs[5];
							}
							this.ViewState["KindCommon"]=null;
							Session["Ret_Search_Value"]=null;
							break;
					}
				}
			}
			JSUtil.ExecuteBlock(this,"parent.frames[\"spxb_edit\"].spxb_edit.HiddenCommon.value=\"\"");

		}
		/// <summary>
		/// 画面中code2的检索画面启动返回等处理
		/// </summary>
		private void CodeSearch2()
		{
			string[] strs;
			if(!Page.IsPostBack)
			{
				string strScript;

				strScript = JSUtil.GetOpenDialogScript("供应商选择","../CommonSearch/gysSelect.aspx",380,400,"spxb_edit");

				this.txtgys.Attributes.Add("OnDblClick",strScript);

			}
			if(Session["Ret_Search_Value"]!=null)
			{
				if (Request["HiddenCommon"]!=null && Request["HiddenCommon"]!="")
				{
					switch(Request["HiddenCommon"].ToString())
					{
						case"供应商选择":
							strs = Session["Ret_Search_Value"].ToString().Split(',');
							if (this.txtgys.Text.ToString()!="")
							{
								this.txtgys.Text = strs[1];
								Textbox7.Text=strs[0];
							}
							else
							{
								this.txtgys.Text =strs[1];
								Textbox7.Text=strs[0];
							}
							this.ViewState["KindCommon"]=null;
							Session["Ret_Search_Value"]=null;
							break;
					}
				}
			}
			JSUtil.ExecuteBlock(this,"parent.frames[\"spxb_edit\"].spxb_edit.HiddenCommon.value=\"\"");

		}
		private void spxb_edit_PreRender(object sender, System.EventArgs e)
		{
			this.RegisterHiddenField("HiddenCommon",Request["HiddenCommon"]);
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
				utils.Alert (this,"仓库不能为空");
				return;
			}
			if (this.txtgys.Text=="") 
			{
				utils.Alert (this,"供应商不能为空");
				return;
			}
			if (this.cpname.Text=="") 
			{
				utils.Alert (this,"产品名称不能为空");
				return;
			}
//			if (Convert.ToDouble(this.Textbox5.Text)<=0) 
//			{
//				utils.Alert (this,"进货价格不能为0");
//				return;
//			}
			
			DropDownListlx.Enabled=false;
			rkrq.Enabled=false;
			string[] cmd=new string[1];
			string rkid = utils.Getbm("rkid","下拨单",string.Format("{0:yyyyMMdd}",DateTime.Now),4);
			cmd[0] = "INSERT INTO [下拨单]([rkid], [产品名称], [cpid], [仓库名称], [操作员], [入库数量],[剩余数量], [入库单价],[入库日期], [到货确认], [库保确认],型号,折扣率,入库单编号,规格,进货价,供应商,wldwid,类别,备注,发票类型,是否含税,说明) VALUES(";
			cmd[0] += "'" + rkid + "','" + this.cpname.Text.Trim () + "','" + this.cpid.Text.Trim () + "','" + this.DropDownListlx.SelectedItem.Text + "',";
			cmd[0] += "'" + this.glyname.ToString() + "'," + this.rksl.Text.Trim() + ","+ this.rksl.Text.Trim() + "," + this.Textbox1.Text.Trim()  + ",'"+rkrq.Text+"','否','是','"+Textbox2.Text+"',"+Textbox3.Text+",'"+Textbox4.Text+"','"+Textbox6.Text+"',"+Textbox5.Text;
			cmd[0] +=",'"+this.txtgys.Text.Trim()+"','"+Textbox7.Text+"','"+this.Textbox8.Text+"','"+this.txtbz.Text+"','"+this.Dropdownlist4.SelectedItem.Value+"','"+this.Dropdownlist3.SelectedItem.Value+"','"+this.Textbox9.Text+"')";
		//	string zzid = utils.Getbm("zzid","地区总账",string.Format("{0:yyyyMM}",DateTime.Now),6);
		//	cmd[1]="insert into 地区总账(zzid,日期,地区,摘要,借方,贷方,余额,其他,分类,单据号)values('"+zzid+"','"+DateTime.Now.ToString("yyyy-MM-dd")+"','"+this.DropDownListlx.SelectedValue.ToString()+"','从总公司进货(产品名称："+this.cpname.Text.Trim () +")',"+Convert.ToDouble(this.rksl.Text)*Convert.ToDouble(this.Textbox1.Text)+",0,"+Convert.ToDouble(this.rksl.Text)*Convert.ToDouble(this.Textbox1.Text)+",'总库保下拨','公司进货','"+rkid+"')";
			try
			{
				DBBase.ExecuteSqls (cmd);
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
			string cmd = "select *,入库数量*进货价 as 总金额 from 下拨单 where 入库单编号='"+this.Textbox4.Text+"'";
			DataSet ds = DBBase.ExecuteSql4Ds (cmd+" order by cpid,型号,颜色","spxb");
			this.Datagrid1.DataSource = ds.Tables[0].DefaultView;
			this.Datagrid1.DataBind ();
		}

		private void Button2_Click(object sender, System.EventArgs e)
		{
			string cmd = "select * from 产品信息 where cpid='" + cpid.Text + "'";
			SqlDataReader dr = DBBase.ExecuteSqlReader (cmd);
								if (dr.Read ())
								{
									this.cpname.Text = dr["产品名称"].ToString ();
									
									this.Textbox2.Text = dr["型号"].ToString (); 
									
									this.Textbox1.Text = dr["价格"].ToString ();
									this.Textbox8.Text=dr["类别"].ToString();
									Textbox5.Text=Convert.ToString(Convert.ToDouble(this.Textbox1.Text)*Convert.ToDouble(this.Textbox3.Text)/10);
									
//									string[] str=dr["色号"].ToString().Split(',');
//									Dropdownlist2.Items.Clear();
//									for (int k=0;k<str.Length;k++)
//									{
//										Dropdownlist2.Items.Add(str[k].ToString());
//
//									}
									Textbox6.Text=dr["规格"].ToString();
									
								}
								dr.Close ();
		}

		private void Textbox5_TextChanged(object sender, System.EventArgs e)
		{
		
		}

		private void Datagrid1_ItemDataBound(object sender, System.Web.UI.WebControls.DataGridItemEventArgs e)
		{
			
			for(int i=0;i<Datagrid1.Items.Count-1;i++)
			{   
				int colnum=1;
				int j;
				for( j=i+1;j<Datagrid1.Items.Count;j++)
				{
					if(Datagrid1.Items[i].Cells[1].Text==Datagrid1.Items[j].Cells[1].Text)      
					{
						colnum++;
						Datagrid1.Items[i].Cells[1].RowSpan=colnum;
						Datagrid1.Items[j].Cells[1].Visible=false;     
						Datagrid1.Items[i].Cells[2].RowSpan=colnum;
						Datagrid1.Items[j].Cells[2].Visible=false;
						Datagrid1.Items[i].Cells[3].RowSpan=colnum;
						Datagrid1.Items[j].Cells[3].Visible=false;
					
					}     
					else
						break;
				}
				i=j-1;
			}
			if (e.Item.ItemType == ListItemType.Item || e.Item.ItemType == ListItemType.AlternatingItem)
				　
			{
			    runningTotal=runningTotal+Convert.ToDouble(e.Item.Cells[6].Text);
				runningTotal1=runningTotal1+Convert.ToDouble(e.Item.Cells[8].Text);

			}
			else
				if(e.Item.ItemType == ListItemType.Footer )
			{
　　           e.Item.Cells[0].Text="合计:";
　　           e.Item.Cells[6].Text = string.Format("{0:F2}", runningTotal);
				e.Item.Cells[8].Text = string.Format("{0:F2}", runningTotal1);
			}

		}

		private void Textbox3_TextChanged(object sender, System.EventArgs e)
		{
		Textbox5.Text=Convert.ToString(Convert.ToDouble(this.Textbox1.Text)*Convert.ToDouble(this.Textbox3.Text)/10);
		}

		private void Button3_Click(object sender, System.EventArgs e)
		{
			string id = utils.FindFirstCheckedItem(this.Datagrid1);
			//			u.OpenIEWindowRight(this,"spxb_edit.aspx?cpid=" + id,500,500);
			string cmd="delete from 下拨单  where rkid='"+id+"'";
			DBBase.ExecuteSql (cmd);
			BindData ();
		}
		private void CalcTotal(string _price)
		{
			try
			{
				runningTotal = Double.Parse(_price);
			}
			catch
			{
				//捕获错误
			}
		}

		private void Dropdownlist1_SelectedIndexChanged(object sender, System.EventArgs e)
		{
			Textbox6.Text=this.Dropdownlist1.SelectedItem.Value.ToString();
		}

		private void cpid_TextChanged(object sender, System.EventArgs e)
		{
		
		}

		private void Dropdownlist3_SelectedIndexChanged(object sender, System.EventArgs e)
		{
			if (this.Dropdownlist3.SelectedItem.Value=="含税")
			{
				  Dropdownlist4.Visible=true;
                  Dropdownlist4.SelectedIndex=1;
			}
			if (this.Dropdownlist3.SelectedItem.Value=="不含税")
			{
				Dropdownlist4.Visible=false;
				Dropdownlist4.SelectedIndex=0;
			}
		}
	}
}
