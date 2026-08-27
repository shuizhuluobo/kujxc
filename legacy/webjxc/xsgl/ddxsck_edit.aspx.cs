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
	/// cksh_add 的摘要说明。
	/// </summary>
	public class ddxsck_edit :jxc.UsrControl.UserPage//System.Web.UI.Page// 
	{
		protected System.Web.UI.WebControls.TextBox rkrq;
		protected System.Web.UI.WebControls.TextBox czy;
		protected System.Web.UI.WebControls.TextBox Textbox2;
		protected System.Web.UI.WebControls.TextBox Textbox1;
		protected System.Web.UI.WebControls.TextBox Textbox3;
		protected System.Web.UI.WebControls.TextBox Textbox4;
		protected System.Web.UI.WebControls.DataGrid Datagrid1;
		protected System.Web.UI.WebControls.TextBox Textbox5;
		protected System.Web.UI.WebControls.TextBox Textbox6;
		protected System.Web.UI.WebControls.TextBox Textbox7;
		protected System.Web.UI.WebControls.Button Button1;
		protected System.Web.UI.WebControls.Button Button2;
		protected System.Web.UI.WebControls.TextBox Textbox8;
		protected System.Web.UI.WebControls.TextBox Textbox9;
		protected System.Web.UI.WebControls.Button save;
		protected System.Web.UI.WebControls.Label Label1;
		protected System.Web.UI.WebControls.Label Label2;
		protected System.Web.UI.WebControls.Button Button3;
		protected System.Web.UI.WebControls.TextBox txtwldwid;
				protected System.Web.UI.WebControls.TextBox txttmp;
			utils u = new utils ();
		private void Page_Load(object sender, System.EventArgs e)
		{
			CodeSearch();
			if (!IsPostBack)
			{
				Textbox2.Text= utils.Getbm("xsid","销售单",this.glydh.ToString()+string.Format("{0:yyyyMM}",DateTime.Now),4);

				if (this.txttmp.Text=="")
				{
					this.txttmp.Text=Session["tmpid"].ToString();
					
					string cmd ="INSERT INTO [销售单明细]([xsdmxid], [xsid], [产品名称], [cpid], [产品型号], [销售数量], [销售日期],[单价], [产品类别], [零售价])";
  
					//               select [xsdmxid], [xsid], [产品名称], [cpid], [产品型号], [销售数量], [销售日期],[单价], [产品类别], [零售价] from 销售单明细
					//               select '' as xsdmxid,'' as xsid,[产品名称], [cpid],型号 as 产品型号,入库数量 as 销售数量,入库日期 as 销售日期,进货价 as 单价,类别 as 产品类别,入库单价 as 零售价 from 下拨单
					cmd+="select '' as xsdmxid,'"+Textbox2.Text+"' as xsid,[产品名称], [cpid],型号 as 产品型号,入库数量 as 销售数量,入库日期 as 销售日期,进货价 as 单价,类别 as 产品类别,入库单价 as 零售价 from 下拨单 where rkid in ("+txttmp.Text+")";
					DBBase.ExecuteSql(cmd);
					cmd="update 下拨单 set 销售标志='是' where rkid in ("+txttmp.Text+")";
					DBBase.ExecuteSql(cmd);
				}
				this.Textbox3.Text=string.Format("{0:yyyy-MM-dd}",DateTime.Now);
				rkrq.Text=this.jgmc.ToString();
			    //this.Textbox4.Text=Textbox3.Text;
				this.czy.Text=this.glyname.ToString();
				//txttmp.Text = this.Request.QueryString["id"];
				Button2.Attributes.Add("onclick","return confirm('您真的要删除吗？')");
				Textbox1.Text=this.Request.QueryString["khmc"];
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
			this.Datagrid1.CancelCommand += new System.Web.UI.WebControls.DataGridCommandEventHandler(this.Datagrid1_CancelCommand);
			this.Datagrid1.EditCommand += new System.Web.UI.WebControls.DataGridCommandEventHandler(this.Datagrid1_EditCommand);
			this.Datagrid1.UpdateCommand += new System.Web.UI.WebControls.DataGridCommandEventHandler(this.Datagrid1_UpdateCommand);
			this.Datagrid1.SelectedIndexChanged += new System.EventHandler(this.Datagrid1_SelectedIndexChanged);
			this.Button1.Click += new System.EventHandler(this.Button1_Click);
			this.Button2.Click += new System.EventHandler(this.Button2_Click);
			this.Textbox5.TextChanged += new System.EventHandler(this.Textbox9_TextChanged);
			this.Textbox9.TextChanged += new System.EventHandler(this.Textbox9_TextChanged);
			this.Textbox8.TextChanged += new System.EventHandler(this.Textbox8_TextChanged);
			this.Textbox4.TextChanged += new System.EventHandler(this.Textbox8_TextChanged);
			this.save.Click += new System.EventHandler(this.save_Click);
			this.Button3.Click += new System.EventHandler(this.Button3_Click);
			this.Load += new System.EventHandler(this.Page_Load);
			this.PreRender += new System.EventHandler(this.ddxsck_edit_PreRender);

		}
		#endregion

		private void BindData ()
		{
			string cmd = "select *,isnull([零售价]*[销售数量],0) as 总金额 from 销售单明细 where 1=1 and xsid='"+Textbox2.Text+"'";
			DataSet ds = DBBase.ExecuteSql4Ds (cmd,"cksh");
			this.Datagrid1.DataSource = ds.Tables["cksh"].DefaultView;
			this.Datagrid1.DataBind ();
			cmd="select isnull(sum([零售价]*[销售数量]),0) as 总金额 from 销售单明细 where 1=1 and xsid='"+Textbox2.Text+"'";
			SqlDataReader dr = DBBase.ExecuteSqlReader (cmd);
			if (dr.HasRows)
			{
				if (dr.Read())
					if (dr["总金额"]!=null)
					Textbox5.Text=Convert.ToDouble(dr["总金额"].ToString()).ToString();
				    else
						Textbox5.Text="0";
			}
			else
				Textbox5.Text="0";
			
			dr.Close();
			Textbox8.Text=Convert.ToString(Convert.ToDouble(this.Textbox9.Text)*Convert.ToDouble(this.Textbox5.Text)/10);
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

				strScript = JSUtil.GetOpenDialogScript("客户选择","../CommonSearch/khSelect.aspx",550,650,"Form1");

				this.Textbox1.Attributes.Add("OnDblClick",strScript);

			}
			if(Session["Ret_Search_Value"]!=null)
			{
				if (Request["HiddenCommon"]!=null && Request["HiddenCommon"]!="")
				{
					switch(Request["HiddenCommon"].ToString())
					{
						case"客户选择":
							strs = Session["Ret_Search_Value"].ToString().Split(',');
							if (this.Textbox1.Text.ToString()!="")
							{
								this.Textbox1.Text=strs[1];
								this.txtwldwid.Text=strs[0];
							}
							else
							{
								this.Textbox1.Text =strs[1];
								this.txtwldwid.Text =strs[0];
							}
							this.ViewState["KindCommon"]=null;
							Session["Ret_Search_Value"]=null;
							break;
					}
				}
			}
			JSUtil.ExecuteBlock(this,"parent.frames[\"Form1\"].Form1.HiddenCommon.value=\"\"");

		}
		private void save_Click(object sender, System.EventArgs e)
		{
			if (Textbox1.Text=="")
			{
				utils.Alert (this,"客户名称不能为空!");
				return;
			}
			if (Convert.ToDouble(this.Textbox8.Text)<0) 
			{
				utils.Alert (this,"实付金额不能小于0!");
				return;
			}
			if (Convert.ToDouble(this.Textbox7.Text)<0) 
			{
				utils.Alert (this,"找回金额不能小于0!");
				return;
			}
//			string cmd="select [xsdmxid], [xsid], [产品名称], [cpid], [产品型号], [销售数量], [制作明细], [已调拨], [到货确认], [销售日期], [rkid], [单价], [是否审核], [产品类别], [test], [rkidlod], [零售价], [颜色], [规格], [标志], [是否回单]  from 销售单明细 where xsid='"+this.Textbox2.Text+"'";
//            SqlDataReader dr = DBBase.ExecuteSqlReader (cmd);
//			while (dr.Read ())
//			{
//				double i=Convert.ToDouble(dr["销售数量"].ToString ());
//				cmd="select * from 入库单 where 剩余数量>0 and rkidold in ("+txttmp.Text.Trim()+")  order by 入库日期";
//			    SqlDataReader dr1 = DBBase.ExecuteSqlReader (cmd);
//				while (dr1.Read ())
//				{
//					if (i>Convert.ToDouble(dr["剩余数量"].ToString()))
//					{
//						cmd="update 入库单 set 剩余数量=剩余数量-"+dr["剩余数量"].ToString()+" where rkid='"+dr["rkid"].ToString()+"'";
//
//					}
//				}
//				
//                
//			}

			//cmd="select * from 入库单 where 剩余数量>0 and rkidold in ("+txttmp.Text.Trim()+")  order by 入库日期";
            save.Enabled=false;
            string strcmd="insert into 销售单 ([xsid],[店名], [总计金额], [预付定金], [客户名称], [销售日期], [付款金额], [折扣率], [备注], [经办人], [找回], [审核通过], [地区],应付金额,wldwid) values('";
			strcmd+=Textbox2.Text+"','"+this.jgmc.ToString()+"',";
			strcmd+=this.Textbox8.Text.Trim()+",";
			strcmd+= this.Textbox8.Text+",'";
			strcmd+= this.Textbox1.Text.ToString()+"','";
			strcmd+=Textbox3.Text.ToString()+"','";
			strcmd+=this.Textbox4.Text.ToString()+"',";
			strcmd+=this.Textbox9.Text.ToString()+",'";
			strcmd+=this.Textbox6.Text.ToString()+"','";
			strcmd+=this.czy.Text.ToString()+"','";
			strcmd+=this.Textbox7.Text.ToString()+"','";
			strcmd+="否','";
			strcmd+=this.zjgmc.ToString()+"',"+this.Textbox5.Text+",'"+this.txtwldwid.Text+"')";
			try
			{
				DBBase.ExecuteSql (strcmd);//保存销售单
				utils.Alert (this,"保存成功");
				//JSUtil.Close(this);
			}
			catch
			{
				utils.Alert (this,"保存失败");
			}
		}

		private void Datagrid1_SelectedIndexChanged(object sender, System.EventArgs e)
		{
		
		}

		private void Button1_Click(object sender, System.EventArgs e)
		{
			//string id = ;//utils.FindFirstCheckedItem(this.Datagrid1);
			//u.OpenIEWindowRight(this,"xsck_addmx.aspx?rkid="+Textbox2.Text,600,350);
			u.OpenIEWindowRight(this,"xsck_addmx.aspx?rkid="+Textbox2.Text,600,350);

		}

		private void Button2_Click(object sender, System.EventArgs e)
		{
			string id = utils.FindFirstCheckedItem(this.Datagrid1);
			string cmd="delete 销售单明细  where test="+id;
			DBBase.ExecuteSql (cmd);
			BindData ();
		}

		private void Textbox9_TextChanged(object sender, System.EventArgs e)
		{
			Textbox8.Text=Convert.ToString(Convert.ToDouble(this.Textbox9.Text)*Convert.ToDouble(this.Textbox5.Text)/10);
		}

		private void Button3_Click(object sender, System.EventArgs e)
		{
			string id =Textbox2.Text;
			if (id!=null)
			{
				u.OpenIEWindowPrint(this,"xsprint.aspx?id="+Textbox2.Text,250,550);
//				//id = utils.FindFirstCheckedItem(this.Datagrid1);
//				string cmd="update 销售单明细 set 打印状态='已打印' where xsdmxid='"+id+"'";
//				DBBase.ExecuteSql (cmd);
			}	
			//u.CloseWindow(this);
		}

		private void Textbox8_TextChanged(object sender, System.EventArgs e)
		{
			Textbox7.Text=Convert.ToString(Convert.ToDouble(this.Textbox4.Text)-Convert.ToDouble(this.Textbox8.Text));
		}

		private void ddxsck_edit_PreRender(object sender, System.EventArgs e)
		{
			this.RegisterHiddenField("HiddenCommon",Request["HiddenCommon"]);
		}

		private void Datagrid1_EditCommand(object source, System.Web.UI.WebControls.DataGridCommandEventArgs e)
		{
			Datagrid1.EditItemIndex = e.Item.ItemIndex;
			BindData();
		}

		private void Datagrid1_CancelCommand(object source, System.Web.UI.WebControls.DataGridCommandEventArgs e)
		{
			Datagrid1.EditItemIndex = -1;
			BindData();
		}

		private void Datagrid1_UpdateCommand(object source, System.Web.UI.WebControls.DataGridCommandEventArgs e)
		{
			//string code = ((TextBox)e.Item.Cells[1].Controls[0]).Text;
			string name = ((TextBox)e.Item.Cells[5].Controls[0]).Text;
			string name2 = ((TextBox)e.Item.Cells[6].Controls[0]).Text;
			//Datagrid1.DataKeys [item.ItemIndex].ToString ();
			//string id = ((TextBox)e.Item.Cells[1].Controls[0]).Text;
			string id=Datagrid1.DataKeys [e.Item.ItemIndex].ToString ();//e.Item.Cells[1].Text;
			if (id!="")
			{
				string cmd="update 销售单明细 set 销售数量="+name+",零售价="+name2+" where test="+id;
				DBBase.ExecuteSql (cmd);
				//myClass.upDateArea(id,code,name);
				Datagrid1.EditItemIndex = -1;
				//	DG1.DataSource = myClass.bindGrid();
				BindData();
			}
		}
	}
}
