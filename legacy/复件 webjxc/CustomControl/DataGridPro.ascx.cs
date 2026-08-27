namespace jxc.CustomControl
{
	using System;
	using System.Collections;
	using System.Data;
	using Microsoft.Data.Odbc;
	using System.Drawing;
	using System.Web;
	using System.Web.UI.WebControls;
	using System.Web.UI.HtmlControls;
	using System.ComponentModel;
	using System.Text.RegularExpressions;
	using System.Web.Caching;
	
	/// <summary>
	///		DataGridPro 的摘要说明。
	/// </summary>

	//****************************
	//使用中注意事项（重要）
	//
	//1.对于绑定列，当某个单元的文本过长，会自动截断掉，把所有内容放在ToolTip中，
	//  此时通过单元的Text属性得不到所有内容。
	//  可以使用DataGridPro中的GetCellValue方法得到绑定列某个单元的所有内容。
	//2.绑定数据时常犯的错误是直接在theDataGrid上绑定
	//****************************


	public abstract class DataGridPro : System.Web.UI.UserControl
	{
		public System.Web.UI.WebControls.DataGrid theDataGrid;
		protected System.Web.UI.HtmlControls.HtmlGenericControl theDiv;
		protected System.Web.UI.HtmlControls.HtmlGenericControl dvDataGrid;
		
		protected	bool										bControl;
	
		protected	bool[]										arr_bSelection; 

		protected	int											iMouseClickedRowIndex = -1; 

		protected	int											iMouseDblClickedRowIndex = -1; 

		protected	int											iMouseDblClickedColumnIndex = -1;
		protected	int											iCursor = -1; 

		protected	string										szClientScript = "";

		public		delegate void	delegateSaveColumnsWidth(String szColumnsWidth);
		public		event			delegateSaveColumnsWidth functionsSaveColumnsWidth = null;

		
		public		delegate void	delegateSelectedIndexChangedEventHandler(ref System.Web.UI.WebControls.DataGrid theDataGrid, bool[] arr_bSelection, int iMouseClickedRowIndex); 
		public		event			delegateSelectedIndexChangedEventHandler functionSelectedIndexChangedEventHandler = null;

		public		delegate void	dlgtDblClickEventHandler(ref System.Web.UI.WebControls.DataGrid theDataGrid,int iMouseDblClickedRowIndex,int iMouseDblClickedColumnIndex);
		public		event			dlgtDblClickEventHandler OnDblClick=null;

		
		protected	String										_ColorForeGroundMouseOut = "WindowText";
		protected	String										_ColorBackGroundMouseOut = "Window";

		protected	string										_ColorAlternatingItemBackGround = "InfoBackground";

		protected	String										_ColorForeGroundMouseOver = "ActiveCaption";
		protected	String										_ColorBackGroundMouseOver = "ActiveBorder";
		
		protected	String										_ColorSelectedForeGround = "HighlightText";
		protected	String										_ColorSelectedBackGround = "Highlight";
	
		protected	String										_ColorUnSelectedForeGround = "WindowText";		
		protected	String										_ColorUnSelectedBackGround = "Window";

		protected	String										_ColorBackGroundTableHeader = "ThreeDFace";
		protected	String										_ColorBorderTableHeader = "DarkGray";

		protected	bool										m_bAllowSelection = true;

		protected	bool										_bAllowMultiSelection = true;

		protected	bool										m_bAllowResizing = true;

		protected	String										_szColumnsWidth = "";

		protected	int											_nPageSize=100;
		
		protected	int											_nCurrentPage=0;
		
		protected	int											_nReservedScrollSpace=10;

		protected	bool										m_bDisplayArrowMark=false;

		/// <summary>
		/// 是否在第一列显示箭头以便于选中行
		/// </summary>
		public bool DisplayArrowMark
		{
			get
			{
				return m_bDisplayArrowMark;
			}
			set
			{
				dvDataGrid.Attributes["displayArrowMark"]=value.ToString();
				m_bDisplayArrowMark=value;
			}
		}

		
		protected   int _nTruncateLength = 30;

		protected   Hashtable _htColumnTruncate=new Hashtable();

		private int[] _arrColumnTruncateLength;
		
		public int TruncateLength
		{
			set
			{
				_nTruncateLength=value;
			}
			get
			{
				return _nTruncateLength;
			}
		}
		
		/// <summary>
		/// 给定某列的序号，设置其截断长度。
		/// </summary>
		/// <param name="ColumnIndex">给定的列的序号，从0开始编号。</param>
		/// <param name="TruncateLength">欲设置的截断长度。</param>
		/// <returns>无。</returns>
		public void SetColumnTruncate(int ColumnIndex,int TruncateLength)
		{
			_htColumnTruncate[ColumnIndex]=TruncateLength;
		}

		/// <summary>
		/// 给定某列的头部文本（HeaderText），设置其截断长度。
		/// </summary>
		/// <param name="ColumnIndex">给定的列的头部文本（HeaderText）。</param>
		/// <param name="TruncateLength">欲设置的截断长度。</param>
		/// <returns>无。</returns>
		public void SetColumnTruncate(string HeadText,int TruncateLength)
		{
			_htColumnTruncate[HeadText]=TruncateLength;
		}

		/// <summary>
		/// 清除所有单独设定的列截断长度。注意：此时属性TruncateLength对所有列有效。
		/// </summary>
		/// <returns>无。</returns>
		public void ClearColumnTruncate()
		{
			_htColumnTruncate.Clear();
		}



		public string GetCellValue(TableCell cell)
		{
			if (TruncateLength>0 && cell.ToolTip!=null && cell.ToolTip!="")
				return cell.ToolTip;
			else
				return Server.HtmlDecode(cell.Text);
		}

		///枚举类型，控制表格在网页中的排列位置
		
		///Full为满网页显示
		///当网页窗口大小变化时，调整表格，使其仍排列为满窗口
		///此时Height,Width无效
		
		///Left占满网页左端
		///此时Height无效
		
		///Right占满网页右端
		///这种对齐方式下，仅有Top始终有效，Height始终无效
		///如果用户设置的表格宽度大于0，则当窗口大小变化时，表格宽度保持不变，表格左端位置随宽度而定
		///此时Left无效
		///如果用户设置的表格宽度小于等于0，则当窗口大小变化时，表格左端位置保持不变，表格宽度随左端位置而定
		//此时Width无效

		///Top占满网页上端，高由属性Height指定
		///此时Width无效
		
		///Buttom占满网页下端
		///这种对齐方式下，仅有Left始终有效，Width始终无效	
		//如果用户设置的表格高度大于0，则当窗口大小变化时，表格高度保持不变，表格上端位置随高度而定
		//此时Top无效
		//如果用户设置的表格高度小于等于0，则当窗口大小变化时，表格尚端位置保持不变，表格高度随上端位置而定
		//此时Height无效

		///None为不指定表格的排列方式，为表格属性Align的缺省值
		public enum GridAlign {Full,Left,Top,Right,Bottom,None};

		private GridAlign _Align=GridAlign.None;
		public  int AlignBottomMargin=1;
		public  int AlignRightMargin=1;

		public int Left
		{
			get
			{
				if (dvDataGrid.Attributes["gridLeft"]!=null)
					return int.Parse(dvDataGrid.Attributes["gridLeft"]);
				return 0;
			}
			set
			{
				dvDataGrid.Attributes["gridLeft"]=value.ToString();
			}
		}

		public int Top
		{
			get
			{
				if (dvDataGrid.Attributes["gridTop"]!=null)
					return int.Parse(dvDataGrid.Attributes["gridTop"]);
				return 0;
			}
			set
			{
				dvDataGrid.Attributes["gridTop"]=value.ToString();
			}
		}

		public int Width
		{
			get
			{
				if (dvDataGrid.Attributes["gridWidth"]!=null)
					return int.Parse(dvDataGrid.Attributes["gridWidth"]);
				return 0;
			}
			set
			{
				dvDataGrid.Attributes["gridWidth"]=value.ToString();
			}
		}

		public int Height
		{
			get
			{
				if (dvDataGrid.Attributes["gridHeight"]!=null)
					return int.Parse(dvDataGrid.Attributes["gridHeight"]);
				return 0;
			}
			set
			{
				dvDataGrid.Attributes["gridHeight"]=value.ToString();	
			}
		}
		
		public GridAlign Align
		{
			get
			{
				return _Align;
			}
			set
			{
				_Align=value;
			}
		}

		private void ViewState_SaveLayout()
		{
			ViewState.Add("Left",Left);
			ViewState.Add("Top",Top);
			ViewState.Add("Width",Width);
			ViewState.Add("Height",Height);

			ViewState.Add("AlignRightMargin",AlignRightMargin);
			ViewState.Add("AlignBottomMargin",AlignBottomMargin);

			ViewState.Add("Align",_Align);

			ViewState.Add("TruncateLength",this._nTruncateLength);
			ViewState.Add("ColumnTruncate",this._htColumnTruncate);
		}

		private void ViewState_RetrieveLayout()
		{
			Left=(int)ViewState["Left"];
			Top=(int)ViewState["Top"];
			Width=(int)ViewState["Width"];
			Height=(int)ViewState["Height"];
			
			AlignRightMargin=(int)ViewState["AlignRightMargin"];
			AlignBottomMargin=(int)ViewState["AlignBottomMargin"];

			_Align=(GridAlign)ViewState["Align"];

			_nTruncateLength=(int)ViewState["TruncateLength"];
			_htColumnTruncate=(Hashtable)ViewState["ColumnTruncate"];
		}

		private void ViewState_RetrieveDataSource()
		{
			if (ViewState["DataSourceType"]!=null)
				_DataSourceType=(string)ViewState["DataSourceType"];
			if (ViewState["DataMember"]!=null)
				_DataMember=(string)ViewState["DataMember"];
		}

		private void ViewState_SaveDataSource()
		{
				ViewState["DataSourceType"]=_DataSourceType;
				ViewState["DataMember"]=_DataMember;
		}

		private DataTable GenDataTable(OdbcDataReader SourceReader)
		{
			DataTable retTable;
			int i;
			object[] objects;

			if (SourceReader.IsClosed)
				return null;
			
			retTable=new DataTable();
			for (i=0;i<SourceReader.FieldCount;i++)
			{
				retTable.Columns.Add(SourceReader.GetName(i),SourceReader.GetFieldType(i));
			}
			objects=new object[SourceReader.FieldCount];
			while (SourceReader.Read())
			{
				SourceReader.GetValues(objects);
				retTable.Rows.Add(objects);
			}

			return retTable;
		}

		private DataTable GenDataTable(OdbcDataReader SourceReader,string TableName)
		{
			DataTable retTable;
			int i;
			object[] objects;

			if (SourceReader.IsClosed)
				return null;
			
			retTable=new DataTable(TableName);
			for (i=0;i<SourceReader.FieldCount;i++)
			{
				retTable.Columns.Add(SourceReader.GetName(i),SourceReader.GetFieldType(i));
			}
			objects=new object[SourceReader.FieldCount];
			while (SourceReader.Read())
			{
				SourceReader.GetValues(objects);
				retTable.Rows.Add(objects);
			}

			return retTable;
		}

		private DataTable GenDataTable(OdbcCommand SqlCmd)
		{
			DataTable retTable;
			Regex regex;
			Match regMatch;
			bool conOpened;
			OdbcDataReader dreader;

			regex=new Regex("\\s*select\\s+",RegexOptions.IgnoreCase);
			regMatch=regex.Match(SqlCmd.CommandText);
			if (!regMatch.Success)
				return null;
			
			conOpened=(SqlCmd.Connection.State==ConnectionState.Open);

			if (!conOpened)
				SqlCmd.Connection.Open();

			dreader=SqlCmd.ExecuteReader();
			retTable=GenDataTable(dreader);

			if (!conOpened)
				SqlCmd.Connection.Close();

			return retTable;
		}

		private DataTable GenDataTable(OdbcCommand SqlCmd,string TableName)
		{
			DataTable retTable;
			Regex regex;
			Match regMatch;
			bool conOpened;
			OdbcDataReader dreader;

			regex=new Regex("\\s*select\\s+",RegexOptions.IgnoreCase);
			regMatch=regex.Match(SqlCmd.CommandText);
			if (!regMatch.Success)
				return null;
			
			conOpened=(SqlCmd.Connection.State==ConnectionState.Open);

			if (!conOpened)
				SqlCmd.Connection.Open();

			dreader=SqlCmd.ExecuteReader();
			retTable=GenDataTable(dreader,TableName);

			if (!conOpened)
				SqlCmd.Connection.Close();

			return retTable;
		}

		/// <summary>
		/// 功能：生成一个DataTable，填入表格的DataSource中的所有数据。
		/// 输出：返回填入数据的DataTable；如果表格的DataSource为空，则返回空null。
		/// </summary>
		public DataTable GenSourceTable()
		{
			DataTable retTable;

			DataView dv;
			DataTable dt;
			DataSet ds;

			

			switch (this.DataSourceType)
			{
				case "DataSet":
					ds=(DataSet)Cache[ViewState["CacheItemKey_DataSource"].ToString()];
					if (ds.Tables.Count==0)
					{
						return null;
					}
					if (ds.Tables.Count==1)
					{
						dt=ds.Tables[0];
					}
					else if (ds.Tables[this.DataMember]!=null)
					{
						dt=ds.Tables[this.DataMember];
					}
					else 
					{
						return null;
					}
					retTable=dt.Clone();
					foreach (DataRow dr in dt.Rows)
					{
						retTable.Rows.Add(dr.ItemArray);
					}
					return retTable;
				case "DataTable":
					dt=(DataTable)Cache[ViewState["CacheItemKey_DataSource"].ToString()];
					retTable=dt.Clone();
					foreach (DataRow dr in dt.Rows)
					{
						retTable.Rows.Add(dr.ItemArray);
					}
					return retTable;
				case "DataView":
					dv=(DataView)Cache[ViewState["CacheItemKey_DataSource"].ToString()];
					retTable=new DataTable(dv.Table.TableName);
					retTable=dv.Table.Clone();
					foreach (DataRowView drv in dv)
					{
						retTable.Rows.Add(drv.Row.ItemArray);
					}
					return retTable;
				case "OdbcDataReader":
					dt=(DataTable)Cache[ViewState["CacheItemKey_DataSource"].ToString()];
					retTable=dt.Clone();
					foreach (DataRow dr in dt.Rows)
					{
						retTable.Rows.Add(dr.ItemArray);
					}
					return retTable;
				case "OdbcCommand":
					dt=(DataTable)Cache[ViewState["CacheItemKey_DataSource"].ToString()];
					retTable=dt.Clone();
					foreach (DataRow dr in dt.Rows)
					{
						retTable.Rows.Add(dr.ItemArray);
					}
					return retTable;
			}
			return null;
		}

		/// <summary>
		/// 生成与表格相关联的数据视图
		/// </summary>
		/// <returns>与表格相关联的数据视图</returns>
		public DataView GenSourceView()
		{
			DataView retView;

			
			switch (this.DataSourceType)
			{
				case "DataView":
					retView=(DataView)Cache[ViewState["CacheItemKey_DataSource"].ToString()];
					return retView;
				default:
					return this.GenSourceTable().DefaultView;				
			}			
		}
		
		//以下开始为与界面有关的属性
		public virtual String ColorForeGroundMouseOver
		{
			get
			{
				return _ColorForeGroundMouseOver;
			}
			set
			{
				_ColorForeGroundMouseOver = value;
				this.Attributes["mouseoverFontColor"]=value.ToString();
			}
		}
		public String ColorForeGroundMouseOut
		{
			get
			{
				return _ColorForeGroundMouseOut;
			}
			set
			{
				_ColorForeGroundMouseOut = value;
				this.Attributes["mouseoutFontColor"]=value.ToString();
			}
		}

		public String ColorUnSelectedBackGround
		{
			get
			{
				return _ColorUnSelectedBackGround;
			}
			set
			{
				_ColorUnSelectedBackGround = value;
			}
		}
		public String ColorSelectedBackGround
		{
			get
			{
				return _ColorSelectedBackGround;
			}
			set
			{
				_ColorSelectedBackGround = value;
				this.Attributes["selectedBackgroundColor"]=value.ToString();
			}
		}

		public String ColorBackGroundTableHeader
		{
			get
			{
				return _ColorBackGroundTableHeader;
			}
			set
			{
				_ColorBackGroundTableHeader = value;
			}
		}
		public String ColorBorderTableHeader
		{
			get
			{
				return _ColorBorderTableHeader;
			}
			set
			{
				_ColorBorderTableHeader = value;
			}
		}

	
		private object _DataSource;

		public System.Object DataSource
		{
			set
			{
				_DataSource=value;
				_DataSourceType=value.GetType().Name;
			}
			get
			{
				return _DataSource;
			}
		}

		private string _DataSourceType;
		private string _DataMember;

		private string DataSourceType
		{
			get
			{
				return _DataSourceType;
			}
		}

		public string DataMember
		{
			set
			{
				theDataGrid.DataMember=value;
				_DataMember=value;
			}
			get
			{
				return _DataMember;
			}
		}

		

		public int SelectedItemCount
		{
			get
			{
				if(m_bAllowSelection)
				{
					return (int)(ViewState["iSelectionCount"]);
				}
				else
				{
					return -1;
				}
			}
		}

		public bool bAutoGenerateColumns
		{
			set
			{
				theDataGrid.AutoGenerateColumns = value;
			}
			get
			{
				return theDataGrid.AutoGenerateColumns;
			}
		}

		public bool bAllowSelection
		{
			set
			{
				m_bAllowSelection = value;
				dvDataGrid.Attributes["allowSelection"]=value.ToString();
			}
			get
			{
				return m_bAllowSelection;
			}
		}

		public bool bAllowMultiSelection
		{
			set
			{
				_bAllowMultiSelection = value;
			}
			get
			{
				return _bAllowMultiSelection;
			}
		}

		public bool bAllowResizing
		{
			set
			{
				m_bAllowResizing = value;
				dvDataGrid.Attributes["allowResizing"]=value.ToString();
			}
			get
			{
				return m_bAllowResizing;
			}
		}
		
		public String	szColumnsWidth
		{
			get
			{
				return _szColumnsWidth;
			}
			set
			{
				_szColumnsWidth = value;
			}
		}

		public int PageSize
		{
			set 
			{
				_nPageSize=value;
			}
			get
			{
				return _nPageSize;
			}
		}

		public int CurrentPage
		{
			set
			{
				_nCurrentPage=value;
			}
			get
			{
				return _nCurrentPage;
			}
		}

		public int ReservedScrollSpace
		{
			set
			{
				_nReservedScrollSpace=value;
				dvDataGrid.Attributes["reservedScrollSpace"]=value.ToString();
			}
			get
			{
				return _nReservedScrollSpace;
			}
		}


		public DataGridPro()
		{
		}

		private void Page_Load(object sender, System.EventArgs e)
		{
			theDataGrid.Attributes.Add("style", "border-collapse:seperate");
//			dvDataGrid.Style.Add("behavior","url("+this.Request.ApplicationPath+"/CustomControl/DataGridPro.htc)") ;
			dvDataGrid.Style.Add("behavior","url(/CustomControl/DataGridPro.htc)") ;//update by lln 20040824

			if (Request[this.ClientID+"_bLoadNextPage"]=="true")
			{
				LoadNextPage();
			}

			if(m_bAllowResizing)
			{
				theDataGrid.Attributes.Add("width", "");
			}
			
			if (this.OnDblClick!=null)
			{
				dvDataGrid.Attributes["allowDblClick"]="true";
			}
			
			if(m_bAllowSelection)
			{
				UpdateSelection();
				if (iMouseClickedRowIndex!=-1)
					OnSelectedIndexChanged();
				SetColorForSelectedItems();
			}
		
			if (!IsPostBack)
				theDataGrid.AlternatingItemStyle.BackColor=System.Drawing.Color.FromName(this._ColorAlternatingItemBackGround);
		
			if (Request[this.ClientID+"_iMouseDblClickedRowIndex"]!=null && Request[this.ClientID+"_iMouseDblClickedRowIndex"]!="")
			{
				this.iMouseDblClickedRowIndex=int.Parse(Request[this.ClientID+"_iMouseDblClickedRowIndex"]);
				this.iMouseDblClickedColumnIndex=int.Parse(Request[this.ClientID + "_iMouseDblClickedColumnIndex"]);
			}
			if (this.iMouseDblClickedRowIndex!=-1 && this.OnDblClick!=null)
				this.OnDblClick(ref this.theDataGrid,iMouseDblClickedRowIndex,iMouseDblClickedColumnIndex);

			if(IsPostBack) 
			{
				if(m_bAllowResizing)
				{
					_szColumnsWidth = Request[this.ClientID + "_szColumnsWidth"];
				}
			}
		}

		protected void OnSelectedIndexChanged()
		{
			if(functionSelectedIndexChangedEventHandler != null)
			{
				functionSelectedIndexChangedEventHandler(ref theDataGrid, arr_bSelection, iMouseClickedRowIndex);
			}
		}

		private void DefaultSelectedIndexChangedEventHandler(ref System.Web.UI.WebControls.DataGrid theDataGrid, bool[] arr_bSelection, int iMouseClickedRowIndex)
		{
			if(arr_bSelection == null)
			{
				return;
			}
			for (int i = 0; i < theDataGrid.Items.Count; i++)
			{
				if (arr_bSelection[i] == true)
				{
					theDataGrid.Items[i].BackColor = System.Drawing.Color.FromName(_ColorSelectedBackGround);
					theDataGrid.Items[i].ForeColor = System.Drawing.Color.FromName(_ColorSelectedForeGround);
				}
				else
				{
					theDataGrid.Items[i].BackColor = System.Drawing.Color.FromName(_ColorUnSelectedBackGround);
					theDataGrid.Items[i].ForeColor = System.Drawing.Color.FromName(_ColorUnSelectedForeGround);
				}
			}
		}

		private void SetColorForSelectedItems()
		{
			if(arr_bSelection == null)
			{
				return;
			}
			for (int i = 0; i < theDataGrid.Items.Count; i++)
			{
				if (arr_bSelection[i] == true)
				{
					theDataGrid.Items[i].BackColor = System.Drawing.Color.FromName(_ColorSelectedBackGround);
					theDataGrid.Items[i].ForeColor = System.Drawing.Color.FromName(_ColorSelectedForeGround);
				}
				else
				{
					if (i % 2 == 1)
						theDataGrid.Items[i].BackColor = System.Drawing.Color.FromName(_ColorAlternatingItemBackGround);
					else
						theDataGrid.Items[i].BackColor = System.Drawing.Color.FromName(_ColorUnSelectedBackGround);
					theDataGrid.Items[i].ForeColor = System.Drawing.Color.FromName(_ColorUnSelectedForeGround);
				}
			}
		}

		protected void RegisterHiddenField()
		{
			if(m_bAllowSelection)
			{
				Page.RegisterHiddenField(this.ClientID + "_bCtrl", "false"); 
				Page.RegisterHiddenField(this.ClientID + "_bShift","false"); 
				Page.RegisterHiddenField(this.ClientID + "_iMouseClickedRowIndex", ""); 
			}

			if(m_bAllowResizing)
			{
				Page.RegisterHiddenField(this.ClientID + "_bMouseButtonDown", ""); 
				Page.RegisterHiddenField(this.ClientID + "_iCellIndex", ""); 
				Page.RegisterHiddenField(this.ClientID + "_iMousePos", ""); 
				Page.RegisterHiddenField(this.ClientID + "_szColumnsWidth", _szColumnsWidth);
			}

			if(m_bAllowSelection || m_bAllowResizing)
			{
				Page.RegisterHiddenField(this.ClientID + "_bDrag", "0"); 
			}
			if (ViewState["_bLastPage"]==null) ViewState["_bLastPage"]=true;
			Page.RegisterHiddenField(this.ClientID+"_bLastPage",ViewState["_bLastPage"].ToString());
			Page.RegisterHiddenField(this.ClientID+"_bLoadNextPage","false");
			Page.RegisterHiddenField(this.ClientID+"_nCurrentScrollTop",Request[this.ClientID+"_nCurrentScrollTop"]);
			Page.RegisterHiddenField(this.ClientID+"_nCurrentScrollLeft",Request[this.ClientID+"_nCurrentScrollLeft"]);
			Page.RegisterHiddenField(this.ClientID + "_iMouseDblClickedRowIndex", ""); 
			Page.RegisterHiddenField(this.ClientID + "_iMouseDblClickedColumnIndex", ""); 
		}

		public int GetFirstSelectedItemIndex()
		{
			if(!m_bAllowSelection)
			{
				iCursor = -1;
				return -1;
			}
			for(iCursor = 0; iCursor < theDataGrid.Items.Count; iCursor++)
			{
				if(arr_bSelection[iCursor] == true)
				{
					return iCursor;
				}
			}
			iCursor = -1;
			return -1;
		}

		public int GetNextSelectedItemIndex()
		{
			if(iCursor == -1)
			{
				return -1;
			}
			for(iCursor = iCursor + 1; iCursor < theDataGrid.Items.Count; iCursor++)
			{
				if(arr_bSelection[iCursor] == true)
				{
					return iCursor;
				}
			}
			iCursor = -1;
			return -1;
		}

		public int GetLastSelectedItemIndex()
		{
			if(!m_bAllowSelection)
			{
				iCursor = -1;
				return -1;
			}
			for(iCursor = theDataGrid.Items.Count - 1; iCursor >= 0; iCursor--)
			{
				if(arr_bSelection[iCursor] == true)
				{
					return iCursor;
				}
			}
			iCursor = -1;
			return -1;
		}

		public int GetPreviousSelectedItemIndex()
		{
			if(iCursor == -1)
			{
				return -1;
			}
			for(iCursor = iCursor - 1; iCursor >= 0; iCursor--)
			{
				if(arr_bSelection[iCursor] == true)
				{
					return iCursor;
				}
			}
			iCursor = -1;
			return -1;
		}

		public bool IsSelected(int iIndex)
		{
			if(!m_bAllowSelection)
			{
				return false;
			}
			return arr_bSelection[iIndex];
		}

		protected void UpdateSelection()
		{
			if(!m_bAllowSelection)
			{
				return;
			}
			if (Request[this.ClientID + "_iMouseClickedRowIndex"] != null && Request[this.ClientID + "_iMouseClickedRowIndex"] != "")
			{
				iMouseClickedRowIndex = System.Int32.Parse(Request[this.ClientID+"_iMouseClickedRowIndex"]);
				bool bCtrl=System.Boolean.Parse(Request[this.ClientID+"_bCtrl"]);
				
				bool bShift = System.Boolean.Parse(Request[this.ClientID+"_bShift"]);
				
				if(!_bAllowMultiSelection) 
				{
					if(bCtrl && GetFirstSelectedItemIndex() == iMouseClickedRowIndex)
					{
						arr_bSelection[iMouseClickedRowIndex] = false;
						ViewState["iSelectionCount"] = 0;
						ViewState["iLastMouseClickedRowIndex"] = iMouseClickedRowIndex;
						return;
					}
					for(int i = 0; i < theDataGrid.Items.Count; i++)
					{
						arr_bSelection[i] = false;
					}
					arr_bSelection[iMouseClickedRowIndex] = true;
					ViewState["iSelectionCount"] = 1;
					ViewState["iLastMouseClickedRowIndex"] = iMouseClickedRowIndex;
					return;
				}

				if (!bShift && !bCtrl)
				{
					for(int i = 0; i < theDataGrid.Items.Count; i++)
					{
						arr_bSelection[i] = false;
					}
					arr_bSelection[iMouseClickedRowIndex] = true;
					ViewState["iSelectionCount"] = 1;
					ViewState["iLastMouseClickedRowIndex"] = iMouseClickedRowIndex;
				}
				else if (bShift)
				{
					int iLastMouseClickedRowIndex = (int)(ViewState["iLastMouseClickedRowIndex"]);
					int iStart = iLastMouseClickedRowIndex < iMouseClickedRowIndex ? iLastMouseClickedRowIndex : iMouseClickedRowIndex;
					int iEnd = iLastMouseClickedRowIndex > iMouseClickedRowIndex ? iLastMouseClickedRowIndex : iMouseClickedRowIndex;
					ViewState["iSelectionCount"] = iEnd - iStart + 1;
					for(int i = 0; i < theDataGrid.Items.Count; i++)
					{
						arr_bSelection[i] = false;
					}
					for (int i = iStart; i <= iEnd; i++)
					{
						arr_bSelection[i] = true;
					}
					ViewState["iLastMouseClickedRowIndex"] = iMouseClickedRowIndex;
				}
				else if (bCtrl)
				{
					arr_bSelection[iMouseClickedRowIndex] = !arr_bSelection[iMouseClickedRowIndex];
					ViewState["iSelectionCount"] = (arr_bSelection[iMouseClickedRowIndex] == false) ? (int)ViewState["iSelectionCount"] - 1 : (int)ViewState["iSelectionCount"] + 1;
					ViewState["iLastMouseClickedRowIndex"] = iMouseClickedRowIndex;
				}
			}
		}

		protected void RetrieveSelection()
		{
			if(!m_bAllowSelection)
			{
				return;
			}
			arr_bSelection = (bool[])ViewState["iSelectionArray"]; 
		}
		
		private bool IsStartWithHtmlTag(string str)
		{
			string theStr,strOneChar;
			int i,iLength;
			if (str==null)
				return false;
			theStr=str.Trim();
			if (theStr=="")
				return false;
			if (theStr.Substring(0,1)!="<")
				return false;
			iLength=theStr.Length;
			for (i=1;i<iLength;i++)
			{
				strOneChar=theStr.Substring(i,1);
				if (strOneChar=="<")
					return false;
				else if (strOneChar==">")
					return true;
			}
			return false;
		}

		private void theDataGrid_ItemDataBound(object sender, System.Web.UI.WebControls.DataGridItemEventArgs e)
		{
			int i;
			TableCell cell;
			string str;
			
			if (!this.IsTrackingViewState)
				this.TrackViewState();
			ListItemType itemType = (ListItemType)e.Item.ItemType;

			if(itemType == ListItemType.Header)
			{

				_arrColumnTruncateLength=new int[e.Item.Cells.Count];
				for (i=0;i<=_arrColumnTruncateLength.GetUpperBound(0);i++)
				{
					if (_htColumnTruncate[i]!=null)
						_arrColumnTruncateLength[i]=(int)_htColumnTruncate[i];
					else if (_htColumnTruncate[e.Item.Cells[i].Text]!=null)
						_arrColumnTruncateLength[i]=(int)_htColumnTruncate[e.Item.Cells[i].Text];
					else
						_arrColumnTruncateLength[i]=_nTruncateLength;
				}

				e.Item.Attributes.Add("id", this.ClientID + "_TableHeader");
				e.Item.Attributes.Add("bgcolor", _ColorBackGroundTableHeader);
				e.Item.Attributes.Add("style", "POSITION: relative");
				e.Item.Attributes.Add("bordercolorlight","black");
				e.Item.Attributes.Add("bordercolordark","white");
				int	iCellIndex = 0;
				string strCssClass;
				foreach (TableCell theTableCell in e.Item.Cells)
				{
					strCssClass = null;
					theTableCell.Wrap = false;
					
						theTableCell.Attributes.Add("id", this.ClientID + "_theDataGrid_Cell_" + iCellIndex.ToString());
						theTableCell.ToolTip=theTableCell.Text;
						if(theDataGrid.Columns.Count > 0)
							strCssClass=theDataGrid.Columns[iCellIndex].HeaderStyle.CssClass;
						if (strCssClass!=null && strCssClass!="")
						{
							theTableCell.Text="<INPUT class='"+strCssClass+"' style=\"WIDTH:100%;CURSOR:default;BACKGROUND-COLOR:transparent;FONT-SIZE:8pt;BORDER:none\" type=\"text\" value=\""+theTableCell.Text+"\" readOnly>";
						}
						else 
							theTableCell.Text="<INPUT  style=\"WIDTH:100%;CURSOR:default;BACKGROUND-COLOR:transparent;FONT-SIZE:8pt;BORDER:none\" type=\"text\" value=\""+theTableCell.Text+"\" readOnly>";
						iCellIndex++;
					
				}
			}
			else
			{
				for (i=0;i<e.Item.Cells.Count;i++)
				{
					
					if (theDataGrid.Columns.Count>i)
						if (theDataGrid.Columns[i].GetType().Name!="BoundColumn")
							continue;
					if (_arrColumnTruncateLength[i]<=0)
						continue;
					cell=e.Item.Cells[i];
					str=Server.HtmlDecode(cell.Text).Trim();
					if ((!IsStartWithHtmlTag(cell.Text)) && str.Length>_arrColumnTruncateLength[i])
					{
						cell.ToolTip=str;
						cell.Text=Server.HtmlEncode(str.Substring(0,_arrColumnTruncateLength[i]))+"...";
					}
				}	
			}
		}

		public void ClearSelection()
		{
			if(!m_bAllowSelection||arr_bSelection==null)
			{
				return;
			}
			
			for(int i = 0; i < arr_bSelection.Length; i++)
			{
				arr_bSelection[i] = false;
			}
			ViewState.Remove("iSelectionCount");
			ViewState.Remove("iSelectionArray");
			ViewState.Remove("iLastMouseClickedRowIndex");
		}

		protected override void OnPreRender(System.EventArgs e) 
		{
			base.OnPreRender(e);
			RegisterHiddenField();
//			this.dvDataGrid.Attributes["behaviorPath"]=this.Request.ApplicationPath+"/CustomControl";
			this.dvDataGrid.Attributes["behaviorPath"]="/CustomControl";

		}

		// 在使用该控件的父类中显式调用该函数来保存列宽信息
		public void SaveColumnsWidth()
		{
			if(!m_bAllowResizing)
			{
				return;
			}
			_szColumnsWidth = Request[this.ClientID + "_szColumnsWidth"];

			if(functionsSaveColumnsWidth != null)
			{
				functionsSaveColumnsWidth(_szColumnsWidth);
			}
		}


		protected override void LoadViewState(object savedState) 
		{
			if (savedState != null)
				base.LoadViewState(savedState);

			if (ViewState["iSelectionArray"]!=null)
				arr_bSelection = (bool[])ViewState["iSelectionArray"]; 

			ViewState_RetrieveLayout();
			ViewState_RetrieveDataSource();
		}



		protected override object SaveViewState()
		{
			ViewState_SaveLayout();
			ViewState_SaveDataSource();

			return base.SaveViewState();
		}


		public virtual bool LoadPostData(string postDataKey, 
			System.Collections.Specialized.NameValueCollection values) 
		{
			return false;
		}
            
		public virtual void RaisePostDataChangedEvent() 
		{
		}
		
		/// <summary>
		/// 功能：绑定时根据不同的数据源类型,生成对应的DataView并保存在Cache中
		/// </summary>
		public override void DataBind()
		{
			string sCacheItemKey;
			DataTable dt;
			DataView dv;
			DataSet ds;
			Exception theException;

			ViewState["CurrentPageIndex"]=0;
			if (ViewState["CacheItemKey_DataSource"]!=null)
				ViewState.Remove("CacheItemKey_DataSource");
			sCacheItemKey=Guid.NewGuid().ToString();
			ViewState["CacheItemKey_DataSource"]=sCacheItemKey;
			
			theDataGrid.PageSize=this._nPageSize;
			theDataGrid.CurrentPageIndex=0;
					
			switch (_DataSource.GetType().Name)
			{
				case "DataSet":
					ds=(DataSet)_DataSource;					
					Cache.Insert(sCacheItemKey,ds,null,Cache.NoAbsoluteExpiration,Cache.NoSlidingExpiration);
					
					if (ds.Tables.Count==0)
					{
						ViewState["_bLastPage"]=true;
						break;
					}
					else if (ds.Tables.Count==1)
					{
						if (this._nPageSize>=ds.Tables[0].Rows.Count) 
							ViewState["_bLastPage"]=true;
						else 
							ViewState["_bLastPage"]=false;

						theDataGrid.DataSource=this.DataSource;
						theDataGrid.DataBind();
						
						this.GenerateSelectionArray(ds.Tables[0].Rows.Count);
					}
					else if (ds.Tables[this.DataMember]!=null)
					{
						if (this._nPageSize>=ds.Tables[this.DataMember].Rows.Count) 
							ViewState["_bLastPage"]=true;
						else 
							ViewState["_bLastPage"]=false;	
			
						theDataGrid.DataSource=this.DataSource;
						theDataGrid.DataBind();

						this.GenerateSelectionArray(ds.Tables[this.DataMember].Rows.Count);						
					}
					else
					{
						ViewState["_bLastPage"]=true;
						theException=new Exception("作为数据源的数据集中有多个表，但是没有设定DataMember!");
						theException.Source=this.ToString();
						throw theException;
					}
					break;
				case "DataTable":
					dt=(DataTable)_DataSource;
					Cache.Insert(sCacheItemKey,dt,null,Cache.NoAbsoluteExpiration,Cache.NoSlidingExpiration);
					
					if (this._nPageSize>=dt.Rows.Count) 
						ViewState["_bLastPage"]=true;
					else 
						ViewState["_bLastPage"]=false;
				
					theDataGrid.DataSource=this.DataSource;
					theDataGrid.DataBind();

					this.GenerateSelectionArray(dt.Rows.Count);
					break;
				case "DataView":
					dv=(DataView)_DataSource;
					Cache.Insert(sCacheItemKey,dv,null,Cache.NoAbsoluteExpiration,Cache.NoSlidingExpiration);
					
					if (this._nPageSize>=dv.Count) 
						ViewState["_bLastPage"]=true;
					else 
						ViewState["_bLastPage"]=false;
				
					theDataGrid.DataSource=this.DataSource;
					theDataGrid.DataBind();

					this.GenerateSelectionArray(dv.Count);
					break;
				case "OdbcDataReader":
					dt=GenDataTable((OdbcDataReader)_DataSource);
					Cache.Insert(sCacheItemKey,dt,null,Cache.NoAbsoluteExpiration,Cache.NoSlidingExpiration);
					
					if (this._nPageSize>=dt.Rows.Count) 
						ViewState["_bLastPage"]=true;
					else 
						ViewState["_bLastPage"]=false;
				
					theDataGrid.DataSource=dt;
					theDataGrid.DataBind();

					this.GenerateSelectionArray(dt.Rows.Count);
					break;
				case "OdbcCommand":
					dt=GenDataTable((OdbcCommand)_DataSource);
					Cache.Insert(sCacheItemKey,dt,null,Cache.NoAbsoluteExpiration,Cache.NoSlidingExpiration);
					

					if (this._nPageSize>=dt.Rows.Count) 
						ViewState["_bLastPage"]=true;
					else 
						ViewState["_bLastPage"]=false;
				
					theDataGrid.DataSource=dt;
					theDataGrid.DataBind();

					this.GenerateSelectionArray(dt.Rows.Count);
					break;
			}
		}

		protected void LoadNextPage()
		{
			DataTable dt;
			DataView dv;
			DataSet ds;

			this._nCurrentPage=(int)ViewState["CurrentPageIndex"];
			this._nCurrentPage++;
			ViewState["CurrentPageIndex"]=this._nCurrentPage;

			ViewState_RetrieveDataSource();

			switch (this.DataSourceType)
			{
				case "DataSet":
					ds=(DataSet)Cache[ViewState["CacheItemKey_DataSource"].ToString()];
					this.theDataGrid.DataSource=ds;
					this.theDataGrid.DataMember=this.DataMember;
					if (ds.Tables.Count==0)
					{
						ViewState["_bLastPage"]=true;
						break;
					}
					if (ds.Tables.Count==1)
					{
						theDataGrid.PageSize=this._nPageSize*(this._nCurrentPage+1);
						if (ds.Tables[0].Rows.Count<=theDataGrid.PageSize)
							ViewState["_bLastPage"]=true;
						else ViewState["_bLastPage"]=false;
						theDataGrid.DataBind();
					}
					else if (ds.Tables[this.DataMember]!=null)
					{
						theDataGrid.PageSize=this._nPageSize*(this._nCurrentPage+1);
						if (ds.Tables[this.DataMember].Rows.Count<=theDataGrid.PageSize)
							ViewState["_bLastPage"]=true;
						else ViewState["_bLastPage"]=false;
						theDataGrid.DataBind();
					}
					break;
				case "DataTable":
					dt=(DataTable)Cache[ViewState["CacheItemKey_DataSource"].ToString()];
					this.theDataGrid.DataSource=dt;
					theDataGrid.PageSize=this._nPageSize*(this._nCurrentPage+1);
					if (dt.Rows.Count<=theDataGrid.PageSize)
						ViewState["_bLastPage"]=true;
					else ViewState["_bLastPage"]=false;
					theDataGrid.DataBind();
					break;
				case "DataView":
					dv=(DataView)Cache[ViewState["CacheItemKey_DataSource"].ToString()];
					this.theDataGrid.DataSource=dv;
					theDataGrid.PageSize=this._nPageSize*(this._nCurrentPage+1);
					if (dv.Count<=theDataGrid.PageSize)
						ViewState["_bLastPage"]=true;
					else ViewState["_bLastPage"]=false;
					theDataGrid.DataBind();
					break;
				case "OdbcDataReader":
					dt=(DataTable)Cache[ViewState["CacheItemKey_DataSource"].ToString()];
					this.theDataGrid.DataSource=dt;
					theDataGrid.PageSize=this._nPageSize*(this._nCurrentPage+1);
					if (dt.Rows.Count<=theDataGrid.PageSize)
						ViewState["_bLastPage"]=true;
					else ViewState["_bLastPage"]=false;
					theDataGrid.DataBind();
					break;
				case "OdbcCommand":
					dt=(DataTable)Cache[ViewState["CacheItemKey_DataSource"].ToString()];
					this.theDataGrid.DataSource=dt;
					theDataGrid.PageSize=this._nPageSize*(this._nCurrentPage+1);
					if (dt.Rows.Count<=theDataGrid.PageSize)
						ViewState["_bLastPage"]=true;
					else ViewState["_bLastPage"]=false;
					theDataGrid.DataBind();
					break;
			}

			return;
		}

		private void DataGridPro_Init(object sender, System.EventArgs e)
		{
			theDataGrid.EnableViewState=true;
			theDataGrid.AllowPaging=true;
			theDataGrid.CurrentPageIndex=0;
			theDataGrid.PagerStyle.Visible=false;
		}

		//得到包含当前用户控件的表单ID
		public string FormID
		{
			get
			{
				System.Web.UI.Control ctrlCurrent=this.Parent;
				while (ctrlCurrent.GetType().Name!="HtmlForm") ctrlCurrent=ctrlCurrent.Parent;
				return ctrlCurrent.ID;
			}
		}
		
		private void GenerateSelectionArray(int nArrayLength)
		{
			if(m_bAllowSelection)
			{
				int oldSelectedItemCount;
				if (ViewState["iSelectionCount"]!=null)
					oldSelectedItemCount=this.SelectedItemCount;
				else
					oldSelectedItemCount=0;
				
				arr_bSelection = new bool[nArrayLength];
				for(int i = 0; i <= arr_bSelection.GetUpperBound(0); i++)
				{
					arr_bSelection[i] = false;
				}
				ViewState.Add("iSelectionArray", arr_bSelection);
				ViewState.Add("iSelectionCount", 0);
				ViewState.Add("iLastMouseClickedRowIndex", 0);
				if (oldSelectedItemCount>0)
					OnSelectedIndexChanged();
			}
		}

		#region Web Form Designer generated code
		override protected void OnInit(EventArgs e)
		{
			//
			// CODEGEN：该调用是 ASP.NET Web 窗体设计器所必需的。
			//
			InitializeComponent();
			base.OnInit(e);
		}
		
		///		设计器支持所需的方法 - 不要使用
		///		代码编辑器修改此方法的内容。
		/// </summary>
		private void InitializeComponent()
		{
			this.Load += new System.EventHandler(this.Page_Load);
			this.Init += new System.EventHandler(this.DataGridPro_Init);
			this.PreRender += new System.EventHandler(this.DataGridPro_PreRender);
			this.theDataGrid.ItemDataBound += new System.Web.UI.WebControls.DataGridItemEventHandler(this.theDataGrid_ItemDataBound);

		}
		#endregion

		//在客户端注册脚本，调整表格的大小，位置，滚动条的位置，列宽等等，最后将其设为可见
		public void RenderLayout()
		{
			switch (_Align)
			{
				case GridAlign.Left:
					dvDataGrid.Attributes["gridAlign"]="left";
					break;
				case GridAlign.Top:
					dvDataGrid.Attributes["gridAlign"]="top";
					break;
				case GridAlign.Right:
					dvDataGrid.Attributes["gridAlign"]="right";
					break;
				case GridAlign.Bottom:
					dvDataGrid.Attributes["gridAlign"]="bottom";
					break;
				case GridAlign.Full:
					dvDataGrid.Attributes["gridAlign"]="full";
					break;
			}
		}

		private void DataGridPro_PreRender(object sender, System.EventArgs e)
		{
			RenderLayout();
		}

		/// <summary>
		/// 选中某行，在DataBind()之后调用
		/// </summary>
		/// <param name="iSelectedRow">欲选中的行号</param>
		public void SetSelectedRow(int iSelectedRow)
		{
			SetSelectedRow(iSelectedRow,true);
		}

		/// <summary>
		/// 选中或取消选中某行，在DataBind()之后调用
		/// </summary>
		/// <param name="iSelectedRow">选中行号，以0为起始编号</param>
		/// <param name="bSelect">是否选中</param>
		public void SetSelectedRow(int iSelectedRow,bool bSelect)
		{
			arr_bSelection[iSelectedRow]=bSelect;
		}
	}
}
