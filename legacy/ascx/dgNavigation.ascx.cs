namespace jxc.ascx
{
	using System;
	using System.Data;
	using System.Drawing;
	using System.Web;
	using System.Web.UI.WebControls;
	using System.Web.UI.HtmlControls;

	public delegate void BindDataDelegate();
	/// <summary>
	///		dgNavigation 的摘要说明。
	///		将dgNavigation.ascx控件拖入网页，比如命名为：DgNavigation1
	///		在服务器代码中加入对控件命名空间的引用：
	///			using Tianyu.WebControl;
	///		在服务器代码中加入对它的声明：
	///			protected dgNavigation DgNavigation1;
	///		
	///		在网页的Page_Load事件中加入(下面代码每次都要执行，所以不要加在!IsPostBack中)：
	///		DgNavigation1.SetTarget(DataGrid1, new BindDataDelegate(BindData));//BindData是你的数据邦定事件
	///		DgNavigation1.SetStyle(10, true);//10表示每页分10行，true表示无分页时自动隐藏
	///		
	/// </summary>
	public abstract class dgNavigation : System.Web.UI.UserControl
	{
		public BindDataDelegate BindData1;

		private DataGrid _dg;//目标Grid
		private CheckBox _cb;
		private bool _autohidden = true;//自动隐藏
		private int _pagesize = 10;//缺省分页数
		protected System.Web.UI.WebControls.Label LabelMsg;
		protected System.Web.UI.WebControls.Button btnNavLast;
		protected System.Web.UI.WebControls.Button btnNavNext;
		protected System.Web.UI.WebControls.Button btnNavPrevious;
		protected System.Web.UI.WebControls.Button btnNavFirst;
		protected System.Web.UI.WebControls.TextBox tbPage;
		protected System.Web.UI.WebControls.Button btnNavGo;
		protected System.Web.UI.WebControls.Label LabelMsg2;
		protected System.Web.UI.WebControls.Panel divPanel;//每页显示行数
		private int _itemcount = 0;
		protected System.Web.UI.WebControls.Label Label1;//数据总数
		private int _dispStyle = 1;//显示风格

		public DataGrid Target 
		{
			get { return _dg; }
			set { _dg = value;}
		}

		public CheckBox cb
		{
			set {_cb = value;}
			get {return _cb;}
		}

		public bool AutoHidden 
		{
			get { return _autohidden; }
			set { _autohidden = value;}
		}

		public int PageSize 
		{
			get { return _pagesize; }
			set { _pagesize = value;}
		}

		public int ItemCount 
		{
			get { return _itemcount; }
			set { _itemcount = value;}
		}

		private void Page_Load(object sender, System.EventArgs e)
		{

		}

		/// <summary>
		/// 设置导航对象的目标DataGrid以及针对DataGrid的数据邦定事件
		/// </summary>
		/// <param name="adg">DataGrid对象</param>
		/// <param name="aBindData1">数据邦定事件</param>
		public void SetTarget(DataGrid adg,CheckBox checkbox, BindDataDelegate aBindData1)
		{
			_dg = adg;
			_cb = checkbox;
			//BindData1 = new BindDataDelegate(aBindData1);
			BindData1 = aBindData1;

			btnNavFirst.Click += new System.EventHandler(this.NavigationButtonClick);
			btnNavPrevious.Click += new System.EventHandler(this.NavigationButtonClick);
			btnNavNext.Click += new System.EventHandler(this.NavigationButtonClick);
			btnNavLast.Click += new System.EventHandler(this.NavigationButtonClick);
			btnNavGo.Click += new System.EventHandler(this.NavigationButtonClick);
			_dg.DataBinding += new System.EventHandler(this.zxDataBinding);
		}

		/// <summary>
		/// 设置DataGrid样式
		/// </summary>
		/// <param name="aPageSize">每页显示行数</param>
		/// <param name="aAutoHidden">是否自动隐藏</param>
		/// <param name="aDispStyle">显示风格，1：标准型，2：精简型</param>
		public void SetStyle(int aPageSize, bool aAutoHidden, int aDispStyle)
		{
			_pagesize = aPageSize;
			_autohidden = aAutoHidden;//aAutoHidden;所有DataGrid都设置成自动隐藏
			_dispStyle = aDispStyle;

			divPanel.Visible = !aAutoHidden;

			_dg.AllowPaging = true;
			_dg.AllowCustomPaging = false;
			_dg.PagerStyle.Visible = false;
			_dg.PageSize = _pagesize;
			_dg.PagerStyle.Mode = PagerMode.NumericPages;
			_dg.PagerStyle.HorizontalAlign = HorizontalAlign.Right;
		}

		public void SetStyle(int aPageSize, bool aAutoHidden)
		{
			SetStyle(aPageSize, aAutoHidden, 1);
		}

		public void SetStyle(int aPageSize)
		{
			SetStyle(aPageSize, true);
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

		}
		#endregion

		/// <summary>
		/// 导航按钮点击事件
		/// </summary>
		/// <param name="sender"></param>
		/// <param name="e"></param>
		private void NavigationButtonClick(object sender, System.EventArgs e)
		{
			string direction = ((Button)sender).CommandName;

			switch (direction.ToUpper())
			{
				case "FIRST" :
					_dg.CurrentPageIndex = 0;
					break;
				case "PREVIOUS" :
					_dg.CurrentPageIndex = 
						Math.Max(_dg.CurrentPageIndex -1, 0);
					break;
				case "NEXT" :
					_dg.CurrentPageIndex = 
						Math.Min(_dg.CurrentPageIndex + 1, _dg.PageCount - 1);
					break;
				case "LAST" :
					_dg.CurrentPageIndex = Math.Max(_dg.PageCount - 1, 0);
					break;
				case "GO" :
					try
					{
						_dg.CurrentPageIndex = Math.Min(_dg.PageCount - 1, int.Parse(tbPage.Text) - 1);
						tbPage.Text = "";
					}
					catch
					{
						tbPage.Text = "";
					}
					break;
				default :
					break;
			}

			BindData1();			
		}

		/// <summary>
		/// DataGrid数据邦定前，设置导航条
		/// </summary>
		/// <param name="sender"></param>
		/// <param name="e"></param>
		private void zxDataBinding(object sender, System.EventArgs e)
		{
			int newCount = 0;
			int PageCount = 0;

			if (_dg.DataSource == null)
			{
				SetButtonState(0);
				return;
			}

			if (_dg.DataSource.GetType().ToString().ToLower() == "system.data.datatable") 
			{
				newCount = ((DataTable)_dg.DataSource).Rows.Count;
			}
			else if(_dg.DataSource.GetType().ToString().ToLower() == "system.data.dataview") 
			{
				newCount = ((DataView)_dg.DataSource).Count;
			}
			else if(_dg.DataSource.GetType().ToString().ToLower() == "system.data.dataset") 
			{
				newCount = ((DataSet)_dg.DataSource).Tables[0].Rows.Count;
			}

			if(newCount > 0)
			{
				PageCount = (int)((newCount - 1) / _pagesize + 1);
				if(_dg.CurrentPageIndex > PageCount - 1)_dg.CurrentPageIndex = PageCount - 1;
			}
			else
			{
				PageCount = 0;
				_dg.CurrentPageIndex = 0;
			}
			
			switch (_dispStyle)
			{
				case 1:
					LabelMsg.Text = "共" + PageCount.ToString() + "页 第" + (_dg.CurrentPageIndex + 1).ToString() + "页";
					LabelMsg.Text += " 总记录数：" + newCount.ToString() + "";
					break;
				case 2:
					LabelMsg.Text = (_dg.CurrentPageIndex + 1).ToString() + "/" + PageCount.ToString() + "页";
					LabelMsg.Text += " 总数：" + newCount.ToString();
					break;
			}

			if (_autohidden) 
			{
				divPanel.Visible = ((newCount - 1) / _pagesize > 0);
			}
			else
			{
				divPanel.Visible = true;
			}

			SetButtonState(PageCount);
			if (_cb != null)
				((CheckBox) _cb).Checked = false;
		}

		/// <summary>
		/// 设置导航按钮是否可用的状态
		/// </summary>
		/// <param name="_PageCount">总页数</param>
		private void SetButtonState(int _PageCount)
		{
			btnNavFirst.Enabled = (_dg.CurrentPageIndex > 0);
			btnNavPrevious.Enabled = (_dg.CurrentPageIndex > 0);
			btnNavNext.Enabled = (_dg.CurrentPageIndex < _PageCount - 1);
			btnNavLast.Enabled = (_dg.CurrentPageIndex < _PageCount - 1);
		}
	}
}
