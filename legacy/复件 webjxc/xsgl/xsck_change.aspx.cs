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
	public class xsck_change :jxc.UsrControl.UserPage// System.Web.UI.Page
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
		protected System.Web.UI.WebControls.Button save;
		protected System.Web.UI.WebControls.TextBox Textbox10;
		protected System.Web.UI.WebControls.TextBox Textbox9;
		protected System.Web.UI.WebControls.TextBox Textbox11;
		protected System.Web.UI.WebControls.TextBox txtwldwid;
			utils u = new utils ();
		private void Page_Load(object sender, System.EventArgs e)
		{
			CodeSearch();
			if (!IsPostBack)
			{
			
				Textbox2.Text= this.Request.QueryString["rkid"];
				string cmd = "SELECT [xsid], [销售单号], [店名], [总计金额], [预付定金], [客户名称], [销售日期], [取货日期], [客户电话], [备注], [经办人], [电话], [审核通过], [地区] FROM [销售单] where xsid='" + Textbox2.Text + "'";
				SqlDataReader dr = DBBase.ExecuteSqlReader (cmd);
				if (dr.Read ())
				{
					Textbox10.Text=dr["审核通过"].ToString();
					if (Textbox10.Text=="是")
                     save.Enabled=false;
					//Textbox2.Text=dr["xsid"].ToString();
					this.rkrq.Text = dr["店名"].ToString ();
					float   b=float.Parse(dr["预付定金"].ToString ());   
					Textbox9.Text=b.ToString("f2",System.Globalization.NumberFormatInfo.InvariantInfo);   
					b=float.Parse(dr["总计金额"].ToString ());   
					Textbox8.Text=b.ToString("f2",System.Globalization.NumberFormatInfo.InvariantInfo);   
					if (dr["销售日期"].ToString ()!="")
					{
						DateTime dt1 =Convert.ToDateTime(dr["销售日期"].ToString ());
						Textbox3.Text=string.Format("{0:yyyy-MM-dd}",dt1);
					}
					if (dr["取货日期"].ToString ()!="")
					{
						DateTime dt =Convert.ToDateTime(dr["取货日期"].ToString ());
						Textbox4.Text=string.Format("{0:yyyy年MM月dd日}",dt);
					}
						
					this.Textbox5.Text = dr["客户电话"].ToString ();
					this.Textbox6.Text = dr["备注"].ToString ();
					this.Textbox1.Text = dr["客户名称"].ToString (); 
					this.Textbox7.Text = dr["电话"].ToString (); 
					this.czy.Text = dr["经办人"].ToString (); 
				}

				//utils.Getbm("xsid","销售单",this.glydh.ToString()+string.Format("{0:yyyyMM}",DateTime.Now),4);
				BindData ();
				//save.Attributes.Add("onclick","return confirm('您确认保存？')");
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
			this.Datagrid1.ItemDataBound += new System.Web.UI.WebControls.DataGridItemEventHandler(this.Datagrid1_ItemDataBound);
			this.Datagrid1.SelectedIndexChanged += new System.EventHandler(this.Datagrid1_SelectedIndexChanged);
			this.Button1.Click += new System.EventHandler(this.Button1_Click);
			this.Button2.Click += new System.EventHandler(this.Button2_Click);
			this.Textbox11.TextChanged += new System.EventHandler(this.Textbox11_TextChanged);
			this.save.Click += new System.EventHandler(this.save_Click);
			this.Load += new System.EventHandler(this.Page_Load);
			this.PreRender += new System.EventHandler(this.xsck_change_PreRender);

		}
		#endregion

		private void BindData ()
		{
			string cmd = "select *,销售数量*零售价 as 总金额 from 销售单明细 where 1=1 and xsid='"+Textbox2.Text+"' order by 产品名称,xsdmxid desc";

			DataSet ds = DBBase.ExecuteSql4Ds (cmd,"cksh");
			this.Datagrid1.DataSource = ds.Tables["cksh"].DefaultView;
			this.Datagrid1.DataBind ();
			cmd="select isnull(sum([零售价]*[销售数量]),0) as 总金额 from 销售单明细 where 1=1 and xsid='"+Textbox2.Text+"'";
			SqlDataReader dr = DBBase.ExecuteSqlReader (cmd);
			if (dr.HasRows)
			{
				if (dr.Read())
					if (dr["总金额"]!=null)
						Textbox8.Text=Convert.ToDouble(dr["总金额"].ToString()).ToString();
					else
						Textbox8.Text="0";
			}
			else
				Textbox5.Text="0";
			
			dr.Close();
		}
		private string Checksl ()
		{
			SqlCommand sqlCmd=new SqlCommand();
			SqlConnection sqlCon=new SqlConnection(this.Application["strconn"].ToString ());
			//string cmd="SELECT 销售单.地区,sum(销售单明细.销售数量), 销售单明细.产品名称, 销售单明细.销售数量,销售单.销售日期 AS 日期,销售单明细.xsid, 销售单.店名,销售单明细.xsdmxid, 销售单明细.cpid, 销售单明细.单价,销售单明细.零售价 FROM 销售单明细 INNER JOIN 销售单 ON 销售单明细.xsid = 销售单.xsid ";
          //string cmd="select 地区,店名,cpid,产品名称,sum(销售数量)as 销售数量 from V销售明细 where 1=1 ";
			string cmd="SELECT 地区,店名,cpid,产品名称,sum(销售数量) as 总数量 FROM V销售明细 where 1=1 ";
			cmd+=" and xsid='"+this.Textbox2.Text+"' group by 地区,店名,cpid,产品名称";
			sqlCmd.Connection=sqlCon;
			sqlCon.Open();
			sqlCmd.CommandText=cmd;
			double i=0;
			string s="";
			SqlDataReader dr =sqlCmd.ExecuteReader();
			while (dr.Read ())
			{
				i=Convert.ToDouble(dr["总数量"].ToString ());
				cmd="select cpid,sum(剩余数量-供退+客退) as 总数量 from 入库单 where (单据标志='正常' or 单据标志='结转') and (剩余数量-供退+客退)>0 and 店名='"+dr["店名"].ToString()+"' and cpid='"+dr["cpid"].ToString()+"' group by cpid ";
				SqlDataReader dr1 =DBBase.ExecuteSqlReader(cmd);
				dr1.Read();
				s=dr["产品名称"].ToString();
				if (dr1.HasRows)
				{
					if (i>Convert.ToDouble(dr1["总数量"].ToString()))//库存数量不足
					{
						dr1.Close();
						sqlCon.Close();
						return s;
					}
				}
				else
				{
					dr1.Close();
					sqlCon.Close();
					return s;//没有库存
				}
			}
			dr.Close();
			sqlCon.Close();
            return "0";
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
//			if (Convert.ToDouble(this.Textbox7.Text)<0) 
//			{
//				utils.Alert (this,"找回金额不能小于0!");
//				return;
//			}
			// [预付定金], [客户名称], [销售日期], [付款金额], [折扣率], [备注], [经办人], [找回], [审核通过], [地区],应付金额,wldwid) values('";

			string strcmd="update 销售单  set [总计金额]=";
			strcmd+=Textbox8.Text+",预付定金="+this.Textbox9.Text.ToString()+",客户名称='";
			strcmd+=this.Textbox1.Text.Trim()+"',备注='"+Textbox6.Text+"' where xsid='";
			strcmd+=Textbox2.Text+"'";
			try
			{
				DBBase.ExecuteSql (strcmd);//保存销售单
				utils.Alert (this,"保存成功!");
				JSUtil.Close(this);
			}
			catch
			{
				utils.Alert (this,"保存失败");
				return;
			}
		}

		private void Datagrid1_SelectedIndexChanged(object sender, System.EventArgs e)
		{
			//string Selection="";
//			string id = Datagrid1.SelectedItem.Cells[1].Text;
//			if (id!=null)
//			{
//				u.OpenIEWindowPrint(this,"cksh_zzxp.aspx?xsdmxid="+id,750,550);
//				//id = utils.FindFirstCheckedItem(this.Datagrid1);
//				string cmd="update 销售单明细 set 打印状态='已打印' where xsdmxid='"+id+"'";
//				DBBase.ExecuteSql (cmd);
//			}	
//			BindData ();
		}

		private void Button1_Click(object sender, System.EventArgs e)
		{
			u.OpenIEWindowRight(this,"xsck_addmx.aspx?rkid="+Textbox2.Text,600,350);
			BindData ();
		}

		private void Button2_Click(object sender, System.EventArgs e)
		{
			string id = utils.FindFirstCheckedItem(this.Datagrid1);
			string cmd="delete 销售单明细  where test="+id;
			DBBase.ExecuteSql (cmd);
			BindData ();
		}

		private void Datagrid1_ItemDataBound(object sender, System.Web.UI.WebControls.DataGridItemEventArgs e)
		{
//			if (e.Item.ItemType == ListItemType.Item || e.Item.ItemType == ListItemType.AlternatingItem)
//			{
//				//  取得 manager 字段的值
//				string isManager =(string)DataBinder.Eval(e.Item.DataItem, "打印状态");
//
//				if (isManager == "已打印")
//				{
//					//  设置文本及背景颜色.
//					e.Item.Cells[6].Text = "已打";
//					e.Item.Cells[6].ForeColor=System.Drawing.Color.Blue;
//				}
//				else
//				{
//					//  仅设置文本.
//					//e.Item.Cells[2].Text = "";
//					e.Item.Cells[6].Text = "未打";
//					e.Item.Cells[6].ForeColor=System.Drawing.Color.Red;
//				}
//			}
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
								this.Textbox1.Text = strs[1];
								this.txtwldwid.Text = strs[0];
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
		private void Textbox11_TextChanged(object sender, System.EventArgs e)
		{
		
		}

		private void xsck_change_PreRender(object sender, System.EventArgs e)
		{
			this.RegisterHiddenField("HiddenCommon",Request["HiddenCommon"]);
		}

		private void Datagrid1_CancelCommand(object source, System.Web.UI.WebControls.DataGridCommandEventArgs e)
		{
			Datagrid1.EditItemIndex = -1;
			BindData();
		}

		private void Datagrid1_EditCommand(object source, System.Web.UI.WebControls.DataGridCommandEventArgs e)
		{
			Datagrid1.EditItemIndex = e.Item.ItemIndex;
			BindData();
		}

		private void Datagrid1_UpdateCommand(object source, System.Web.UI.WebControls.DataGridCommandEventArgs e)
		{
			//string code = ((TextBox)e.Item.Cells[1].Controls[0]).Text;
			string name = ((TextBox)e.Item.Cells[4].Controls[0]).Text;
			string name2 = ((TextBox)e.Item.Cells[5].Controls[0]).Text;
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
