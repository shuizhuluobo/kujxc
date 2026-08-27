using System;

namespace jxc
{
	/// <summary>
	/// JavaScrip Utility。
	/// 方便用户在服务器端注册客户端的JavaScript脚本；
	/// 通过在服务器端注册客户端脚本来执行一些客户端的脚本操作；
	/// 如关闭窗口、弹出网页对话框、提交表单等等。
	/// </summary>
	public class JSUtil
	{

		public static void ReturnUrl(System.Web.UI.Page page,string url)
		{
			string strScript;
			string strKey;
			int i;
			//脚本块的内容
			strScript="<script language=javascript>\n";
			strScript+="	top.main.location = \"" + url + "\";\n";
			strScript+="</script>";
			//注册脚本块的Key
			strKey=System.DateTime.Now.ToString();
			//循环，直至找到某个没被注册过的Key
			for (i=0;i<10000;i++)
				if (!page.IsClientScriptBlockRegistered(strKey+i.ToString()))
					break;
			page.RegisterClientScriptBlock(strKey+i.ToString(),strScript);

		}

		/// <summary>
		/// 功能：关闭一个网页窗口。
		/// 输入：page，网页中的Page对象。
		/// 输出：无。
		/// </summary>
		public static void CloseWindow(System.Web.UI.Page page)
		{
			string strScript;
			string strKey;
			int i;
			//脚本块的内容
			strScript="<script language=javascript>\n";
			strScript+="	top.close();\n";
			strScript+="</script>";
			//注册脚本块的Key
			strKey=System.DateTime.Now.ToString();
			//循环，直至找到某个没被注册过的Key
			for (i=0;i<10000;i++)
				if (!page.IsClientScriptBlockRegistered(strKey+i.ToString()))
					break;
			page.RegisterClientScriptBlock(strKey+i.ToString(),strScript);
		}
		/// <summary>
		/// 功能：关闭一个网页窗口。
		/// 输入：page，网页中的Page对象。
		/// 输出：无。
		/// </summary>
		public static void Close(System.Web.UI.Page page)
		{
			string strScript;
			string strKey;
			int i;
			//脚本块的内容
			strScript="<script language=javascript>\n";
			strScript+="	opener.location.href=opener.location.href;\n";
			strScript+="	opener = null;";
			strScript+="	window.close ();";
			strScript+="</script>";
			//注册脚本块的Key
			strKey=System.DateTime.Now.ToString();
			//循环，直至找到某个没被注册过的Key
			for (i=0;i<10000;i++)
				if (!page.IsClientScriptBlockRegistered(strKey+i.ToString()))
					break;
			page.RegisterClientScriptBlock(strKey+i.ToString(),strScript);
		}

		/// <summary>
		/// 功能：关闭一个网页的父窗口，例如一个frame关闭其父窗口。
		/// 输入：page，网页中的Page对象。
		/// 输出：无。
		/// </summary>
		public static void CloseParent(System.Web.UI.Page page)
		{
			string strScript;
			string strKey;
			int i;
			//脚本块的内容
			strScript="<script language=javascript>\n";
			strScript+="	window.parent.close();\n";
			strScript+="</script>";
			//注册脚本块的Key
			strKey=System.DateTime.Now.ToString();
			//循环，直至找到某个没被注册过的Key
			for (i=0;i<10000;i++)
				if (!page.IsClientScriptBlockRegistered(strKey+i.ToString()))
					break;
			page.RegisterClientScriptBlock(strKey+i.ToString(),strScript);
		}
	
		/// <summary>
		/// 功能：打开一个网页对话框。
		/// 输入：page   网页中的Page对象
		///       URL    欲打开对话框中的网页地址
		///       Width  打开的对话框的宽
		///       Height 打开的对话框的高。
		/// 输出：无。
		/// </summary>
		public static void OpenDialog(System.Web.UI.Page page,string URL, int Width, int Height)
		{
			string strScript;
			string strKey;
			int i;
			//脚本块的内容
			strScript="<script language=javascript>\n";
			strScript+="	window.showModalDialog(\"" + URL + "\",null,\""+string.Format("dialogWidth:{0}px;dialogHeight:{1}px;help:no;unadorned:yes;resizable:yes;status:yes",Width,Height)+"\");\n";
			strScript+="</script>";
			//注册脚本块的Key
			strKey=System.DateTime.Now.ToString();
			//循环，直至找到某个没被注册过的Key
			for (i=0;i<10000;i++)
				if (!page.IsStartupScriptRegistered(strKey+i.ToString()))
					break;
			page.RegisterStartupScript(strKey+i.ToString(),strScript);
		}
		/// <summary>
		/// 功能：打开一个网页对话框。
		/// 输入：page   网页中的Page对象
		///       URL    欲打开对话框中的网页地址
		///       Width  打开的对话框的宽
		///       Height 打开的对话框的高。
		/// 输出：无。
		/// </summary>
		public static void OpenDialog1(System.Web.UI.Page page,string URL, int Width, int Height)
		{
			string strScript;
			string strKey;
			int i;
			//脚本块的内容
			strScript="<script language=javascript>\n";
			strScript+="	window.showModalDialog(\"" + URL + "\",null,\""+string.Format("dialogWidth:{0}px;dialogHeight:{1}px;help:no;unadorned:yes;resizable:yes;status:no",Width,Height)+"\");\n";
			strScript+="</script>";
			//注册脚本块的Key
			strKey=System.DateTime.Now.ToString();
			//循环，直至找到某个没被注册过的Key
			for (i=0;i<10000;i++)
				if (!page.IsStartupScriptRegistered(strKey+i.ToString()))
					break;
			page.RegisterStartupScript(strKey+i.ToString(),strScript);
		}

		/// <summary>
		/// 功能：打开一个网页对话框，
		///       如果对话框返回值为"SubmitForm"，
		///       则提交打开此对话框的网页中的表单（由参数FormName指定其名称）。
		/// 输入：page     网页中的Page对象
		///       URL      欲打开对话框中的网页地址
		///       Width    打开的对话框的宽
		///       Height   打开的对话框的高
		///       FormName 欲提交表单的名字。
		/// 输出：无。
		/// </summary>
		public static void OpenDialog(System.Web.UI.Page page,string URL, int Width, int Height,string FormName)
		{
			string strScript;
			string strKey;
			int i;
			//脚本块的内容
			strScript="<script language=javascript>\n";
			strScript+="	retValue=window.showModalDialog(\"" + URL + "\",null,\""+string.Format("dialogWidth:{0}px;dialogHeight:{1}px;help:no;unadorned:yes;resizable:yes;status:no",Width,Height)+"\");\n";
			strScript+="	if (retValue!=null)\n";
			strScript+="	{\n";
			strScript+="		if (retValue==\"SubmitForm\")\n";
			strScript+="			"+FormName+".submit();\n";
			strScript+="	}\n";
			strScript+="</script>";
			//注册脚本块的Key
			strKey=System.DateTime.Now.ToString();
			//循环，直至找到某个没被注册过的Key
			for (i=0;i<10000;i++)
				if (!page.IsStartupScriptRegistered(strKey+i.ToString()))
					break;
			page.RegisterStartupScript(strKey+i.ToString(),strScript);
		}
		/// <summary>
		/// 功能：返回打开一个网页对话框的javascript字符串
		/// 输入：URL      欲打开对话框中的网页地址
		///       Width    打开的对话框的宽
		///       Height   打开的对话框的高
		///       FormName 欲提交表单的名字。
		/// 输出：字符串。
		/// </summary>
		public static string GetOpenDialogScript(string name,string URL, int Width, int Height,string FormName)
		{
			string strScript;
			//脚本块的内容
			strScript="	document.all.HiddenCommon.value='"+name +"';";
			strScript+="	retValue=window.showModalDialog(\"" + URL + "\",null,\""+string.Format("dialogWidth:{0}px;dialogHeight:{1}px;help:no;unadorned:yes;resizable:yes;status:no",Width,Height)+"\");\n";
			strScript+="	if (retValue!=null)\n";
			strScript+="	{\n";
			strScript+="		if (retValue==\"SubmitForm\")\n";
			strScript+="			"+FormName+".submit();\n";
			strScript+="	}\n";
			return strScript;
		}
		/// <summary>
		/// 功能：打开一个网页对话框，
		///       如果对话框返回值为"SubmitForm"，
		///       则提交打开此对话框的网页中的表单（由参数FormName指定其名称）至指定的action。
		/// 输入：page     网页中的Page对象
		///       URL      欲打开对话框中的网页地址
		///       Width    打开的对话框的宽
		///       Height   打开的对话框的高
		///       FormName 欲提交表单的名字
		///       action   欲提交表单的目的网页
		/// 输出：无。
		/// </summary>
		public static void OpenDialog(System.Web.UI.Page page,string URL, int Width, int Height,string FormName,string action)
		{
			string strScript;
			string strKey;
			int i;
			//脚本块的内容
			strScript="<script language=javascript>\n";
			strScript+="	retValue=window.showModalDialog(\"" + URL + "\",null,\""+string.Format("dialogWidth:{0}px;dialogHeight:{1}px;help:no;unadorned:yes;resizable:yes;status:no",Width,Height)+"\");\n";
			strScript+="	if (retValue!=null)\n";
			strScript+="	{\n";
			strScript+="		if (retValue==\"SubmitForm\")\n";
			strScript+="		{\n";
			strScript+="			"+FormName+".action=\""+action+"\";\n";
			strScript+="			"+FormName+".submit();\n";
			strScript+="		}\n";
			strScript+="	}\n";
			strScript+="</script>";
			//注册脚本块的Key
			strKey=System.DateTime.Now.ToString();
			//循环，直至找到某个没被注册过的Key
			for (i=0;i<10000;i++)
				if (!page.IsStartupScriptRegistered(strKey+i.ToString()))
					break;
			page.RegisterStartupScript(strKey+i.ToString(),strScript);
		}

		/// <summary>
		/// 功能：打开一个无模式网页对话框。
		/// 输入：page   网页中的Page对象
		///       URL    欲打开对话框中的网页地址
		///       Width  打开的对话框的宽
		///       Height 打开的对话框的高。
		/// 输出：无。
		/// </summary>
		public static void OpenModelessDialog(System.Web.UI.Page page,string URL, int Width, int Height)
		{
			string strScript;
			string strKey;
			int i;
			//脚本块的内容
			strScript="<script language=javascript>\n";
			strScript+="	window.showModelessDialog(\"" + URL + "\",null,\""+string.Format("dialogWidth:{0}px;dialogHeight:{1}px;help:no;unadorned:yes;resizable:yes;status:no",Width,Height)+"\");\n";
			strScript+="</script>";
			//注册脚本块的Key
			strKey=System.DateTime.Now.ToString();
			//循环，直至找到某个没被注册过的Key
			for (i=0;i<10000;i++)
				if (!page.IsStartupScriptRegistered(strKey+i.ToString()))
					break;
			page.RegisterStartupScript(strKey+i.ToString(),strScript);
		}
		/// <summary>
		/// 功能：打开一个IE窗口(有工具栏）。
		/// 输入：page   网页中的Page对象
		///       URL    欲打开对话框中的网页地址
		///       Width  打开的对话框的宽
		///       Height 打开的对话框的高。
		///       Left   打开的对话框的位置之左端
		///       Top    打开的对话框的位置之上端
		/// 输出：无。
		/// </summary>
		public static void OpenIEWindow1(System.Web.UI.Page page,string URL, int Width, int Height)
		{
			string strScript;
			string strKey;
			int i;
			//脚本块的内容
			strKey=string.Format("width={0},height={1},directories=no,scrollbars=yes,location=no,menubar=yes,status=no,toolbar=no,resizable=yes",Width,Height);
			strScript="<script language=javascript>\n";
			strScript+="	var sFeatures=\""+strKey+"\";\n";
			strScript+="	sFeatures+=\",left=\"+(screen.availWidth-12-"+Width.ToString()+")/2;\n";
			strScript+="	sFeatures+=\",top=\"+(screen.availHeight-"+Height.ToString()+")/2;\n";
			strScript+="	window.open(\"" + URL + "\",\"_blank\",sFeatures);\n";
			strScript+="</script>";
			//注册脚本块的Key
			strKey=System.DateTime.Now.ToString();
			//循环，直至找到某个没被注册过的Key
			for (i=0;i<10000;i++)
				if (!page.IsStartupScriptRegistered(strKey+i.ToString()))
					break;
			page.RegisterStartupScript(strKey+i.ToString(),strScript);
		}

		/// <summary>
		/// 功能：打开一个IE窗口(无标题栏、工具栏、地址栏等）。
		/// 输入：page   网页中的Page对象
		///       URL    欲打开对话框中的网页地址
		///       Width  打开的对话框的宽
		///       Height 打开的对话框的高。
		///       Left   打开的对话框的位置之左端
		///       Top    打开的对话框的位置之上端
		/// 输出：无。
		/// </summary>
		public static void OpenIEWindow(System.Web.UI.Page page,string URL, int Width, int Height,int Left,int Top)
		{
			string strScript;
			string strKey;
			int i;
			//脚本块的内容
			strKey=string.Format("width={0},height={1},left={2},top={3},directories=no,location=no,menubar=no,status=no,toolbar=no,resizable=yes",Width,Height,Left,Top);
			strScript="<script language=javascript>\n";
			strScript+="	window.open(\"" + URL + "\",null,\""+strKey+"\");\n";
			strScript+="</script>";
			//注册脚本块的Key
			strKey=System.DateTime.Now.ToString();
			//循环，直至找到某个没被注册过的Key
			for (i=0;i<10000;i++)
				if (!page.IsStartupScriptRegistered(strKey+i.ToString()))
					break;
			page.RegisterStartupScript(strKey+i.ToString(),strScript);
		}

		/// <summary>
		/// 功能：打开一个IE窗口(无标题栏、工具栏、地址栏等），在屏幕的最右边，上下位置在中间。
		/// 输入：page   网页中的Page对象
		///       URL    欲打开对话框中的网页地址
		///       Width  打开的对话框的宽
		///       Height 打开的对话框的高。
		/// 输出：无。
		/// </summary>
		public static void OpenIEWindowRight(System.Web.UI.Page page,string URL, int Width, int Height)
		{
			string strScript;
			string strKey;
			int i;
			//脚本块的内容
			strKey=string.Format("width={0},height={1},directories=no,scrollbars=yes,location=no,menubar=no,status=no,toolbar=no,resizable=yes",Width,Height);
			strScript="<script language=javascript>\n";
			strScript+="	var sFeatures=\""+strKey+"\";\n";
			strScript+="	sFeatures+=\",left=\"+(screen.availWidth-12-"+Width.ToString()+");\n";
			strScript+="	sFeatures+=\",top=\"+(screen.availHeight-"+Height.ToString()+")/2;\n";
			strScript+="	window.open(\"" + URL + "\",\"_blank\",sFeatures);\n";
			strScript+="</script>";
			//注册脚本块的Key
			strKey=System.DateTime.Now.ToString();
			//循环，直至找到某个没被注册过的Key
			for (i=0;i<10000;i++)
				if (!page.IsStartupScriptRegistered(strKey+i.ToString()))
					break;
			page.RegisterStartupScript(strKey+i.ToString(),strScript);
		}

		/// <summary>
		/// 功能：打开一个IE窗口(无标题栏、工具栏、地址栏等），在屏幕的最右边，上下满屏，宽度由参数指定。
		/// 输入：page   网页中的Page对象
		///       URL    欲打开对话框中的网页地址
		///       Width  打开的对话框的宽
		/// 输出：无。
		/// </summary>
		public static void OpenIEWindowRight(System.Web.UI.Page page,string URL, int Width)
		{
			string strScript;
			string strKey;
			int i;
			//脚本块的内容
			strKey=string.Format("width={0},directories=no,scrollbars=yes,location=no,menubar=no,status=no,toolbar=no,resizable=yes",Width);
			strScript="<script language=javascript>\n";
			strScript+="	var sFeatures=\""+strKey+"\";\n";
			strScript+="	sFeatures+=\",left=\"+(screen.availWidth-12-"+Width.ToString()+");\n";
			strScript+="	sFeatures+=\",top=0\";\n";
			strScript+="	sFeatures+=\",height=\";\n";
			strScript+="	sFeatures+=(screen.availHeight-30);\n";
			strScript+="	sFeatures+=\";\";\n";
			strScript+="	window.open(\"" + URL + "\",\"_blank\",sFeatures);\n";
			strScript+="</script>";
			//注册脚本块的Key
			strKey=System.DateTime.Now.ToString();
			//循环，直至找到某个没被注册过的Key
			for (i=0;i<10000;i++)
				if (!page.IsStartupScriptRegistered(strKey+i.ToString()))
					break;
			page.RegisterStartupScript(strKey+i.ToString(),strScript);
		}

		/// <summary>
		/// 功能：打开一个IE窗口(无标题栏、工具栏、地址栏等），在屏幕的中间。
		/// 输入：page   网页中的Page对象
		///       URL    欲打开对话框中的网页地址
		///       Width  打开的对话框的宽
		///       Height 打开的对话框的高。
		/// 输出：无。
		/// </summary>
		public static void OpenIEWindowCenter(System.Web.UI.Page page,string URL, int Width, int Height)
		{
			string strScript;
			string strKey;
			int i;
			//脚本块的内容
			strKey=string.Format("width={0},height={1},directories=no,scrollbars=yes,location=no,menubar=no,status=no,toolbar=no,resizable=yes",Width,Height);
			strScript="<script language=javascript>\n";
			strScript+="	var sFeatures=\""+strKey+"\";\n";
			strScript+="	sFeatures+=\",left=\"+(screen.availWidth-12-"+Width.ToString()+")/2;\n";
			strScript+="	sFeatures+=\",top=\"+(screen.availHeight-"+Height.ToString()+")/2;\n";
			strScript+="	window.open(\"" + URL + "\",\"_blank\",sFeatures);\n";
			strScript+="</script>";
			//注册脚本块的Key
			strKey=System.DateTime.Now.ToString();
			//循环，直至找到某个没被注册过的Key
			for (i=0;i<10000;i++)
				if (!page.IsStartupScriptRegistered(strKey+i.ToString()))
					break;
			page.RegisterStartupScript(strKey+i.ToString(),strScript);
		}
		/// <summary>
		/// 功能：打开一个IE窗口(无标题栏、工具栏、地址栏等），在屏幕的中间。
		/// 输入：page   网页中的Page对象
		///       URL    欲打开对话框中的网页地址
		///       Width  打开的对话框的宽
		///       Height 打开的对话框的高。
		/// 输出：无。
		/// </summary>
		public static void OpenIEWindowCenter1(System.Web.UI.Page page,string URL, int Width, int Height)
		{
			string strScript;
			string strKey;
			int i;
			//脚本块的内容
			strKey=string.Format("width={0},height={1},directories=no,scrollbars=yes,location=no,menubar=yes,status=no,toolbar=no,resizable=yes",Width,Height);
			strScript="<script language=javascript>\n";
			strScript+="	var sFeatures=\""+strKey+"\";\n";
			strScript+="	sFeatures+=\",left=\"+(screen.availWidth-12-"+Width.ToString()+")/2;\n";
			strScript+="	sFeatures+=\",top=\"+(screen.availHeight-"+Height.ToString()+")/2;\n";
			strScript+="	window.open(\"" + URL + "\",\"_blank\",sFeatures);\n";
			strScript+="</script>";
			//注册脚本块的Key
			strKey=System.DateTime.Now.ToString();
			//循环，直至找到某个没被注册过的Key
			for (i=0;i<10000;i++)
				if (!page.IsStartupScriptRegistered(strKey+i.ToString()))
					break;
			page.RegisterStartupScript(strKey+i.ToString(),strScript);
		}

		/// <summary>
		/// 功能：打开一个IE窗口(无标题栏、工具栏、地址栏等），在屏幕的中间。
		/// 输入：page   网页中的Page对象
		///       URL    欲打开对话框中的网页地址
		///       Width  打开的对话框的宽
		///       Height 打开的对话框的高。
		/// 输出：无。
		/// </summary>
		public static void OpenIEWindowCenter2(System.Web.UI.Page page,string URL, int Width, int Height)
		{
			string strScript;
			string strKey;
			int i;
			//脚本块的内容
			strKey=string.Format("width={0},height={1},directories=no,scrollbars=yes,location=no,menubar=yes,status=no,toolbar=no,resizable=yes",Width,Height);
			strScript="<script language=javascript>\n";
			strScript+="	var sFeatures=\""+strKey+"\";\n";
			strScript+="	sFeatures+=\",left=\"+(screen.availWidth-12-"+Width.ToString()+")/2;\n";
			strScript+="	sFeatures+=\",top=\"+(screen.availHeight-"+Height.ToString()+")/2;\n";
			strScript+="	window.open(\"" + URL + "\",\"_parent\",sFeatures);\n";
			strScript+="</script>";
			//注册脚本块的Key
			strKey=System.DateTime.Now.ToString();
			//循环，直至找到某个没被注册过的Key
			for (i=0;i<10000;i++)
				if (!page.IsStartupScriptRegistered(strKey+i.ToString()))
					break;
			page.RegisterStartupScript(strKey+i.ToString(),strScript);
		}
		/// <summary>
		/// 功能：弹出一信息框。
		/// 输入：page         网页中的Page对象
		///       Description  信息框中描述的内容。
		/// 输出：无。
		/// </summary>
		public static void Alert(System.Web.UI.Page page,string description)
		{
			string strScript,strDescription;
			string strKey;
			int i;
			//脚本块的内容
			//先将提示信息中的某些字符做转换，否则会影响脚本的执行
			strDescription=description.Replace("\"","\\\"");
			strDescription=description.Replace("\\","\\\\");
			strDescription=strDescription.Replace("\r","\\r");
			strDescription=strDescription.Replace("\n","\\n");
			strScript="<script language=javascript>\n";
			strScript+="	window.alert(\"" +strDescription+"\")\n";
			strScript+="</script>";
			//注册脚本块的Key
			strKey=System.DateTime.Now.ToString();
			//循环，直至找到某个没被注册过的Key
			for (i=0;i<10000;i++)
				if (!page.IsClientScriptBlockRegistered(strKey+i.ToString()))
					break;
			page.RegisterClientScriptBlock(strKey+i.ToString(),strScript);
		}

		/// <summary>
		/// 功能：提交网页中的第一个表单forms[0]
		/// 输入：page   网页中的Page对象
		/// 输出：无。
		/// </summary>
		public static void SubmitForm(System.Web.UI.Page page)
		{
			string strScript;
			string strKey;
			int i;
			//脚本块的内容
			strScript="<script language=javascript>\n";
			strScript+="	document.forms[0].submit();\n";
			strScript+="</script>";
			//注册脚本块的Key
			strKey=System.DateTime.Now.ToString();
			//循环，直至找到某个没被注册过的Key
			for (i=0;i<10000;i++)
				if (!page.IsStartupScriptRegistered(strKey+i.ToString()))
					break;
			page.RegisterStartupScript(strKey+i.ToString(),strScript);
		}

		/// <summary>
		/// 功能：提交网页中的某个表单
		/// 输入：page     网页中的Page对象
		///       FormName 欲提交表单的名字
		/// 输出：无。
		/// </summary>
		public static void SubmitForm(System.Web.UI.Page page,string FormName)
		{
			string strScript;
			string strKey;
			int i;
			//脚本块的内容
			strScript="<script language=javascript>\n";
			//strScript+="	try{\n";
			strScript+="	"+FormName+".submit();\n";
			//strScript+="	}catch(e) {}\n";
			strScript+="</script>";
			//注册脚本块的Key
			strKey=System.DateTime.Now.ToString();
			//循环，直至找到某个没被注册过的Key
			for (i=0;i<10000;i++)
				if (!page.IsStartupScriptRegistered(strKey+i.ToString()))
					break;
			page.RegisterStartupScript(strKey+i.ToString(),strScript);
		}

		/// <summary>
		/// 功能：提交网页中的某个表单至指定的网页
		/// 输入：page     网页中的Page对象
		///       FormName 欲提交表单的名字
		///       action   表单提交的目的网页
		/// 输出：无。
		/// </summary>
		public static void SubmitForm(System.Web.UI.Page page,string FormName,string action)
		{
			string strScript;
			string strKey;
			int i;
			//脚本块的内容
			strScript="<script language=javascript>\n";
			//strScript+="	try{\n";
			strScript+="	"+FormName+".action=\""+action+"\";\n";
			strScript+="	"+FormName+".submit();\n";
			//strScript+="	}catch(e) {}\n";
			strScript+="</script>";
			//注册脚本块的Key
			strKey=System.DateTime.Now.ToString();
			//循环，直至找到某个没被注册过的Key
			for (i=0;i<10000;i++)
				if (!page.IsStartupScriptRegistered(strKey+i.ToString()))
					break;
			page.RegisterStartupScript(strKey+i.ToString(),strScript);
		}

		/// <summary>
		/// 功能：弹出一个确认框，用户点确认则提交指定表单至指定的网页；用户点取消则返回，不做其他操作
		/// 输入：page     网页中的Page对象
		///       FormName 欲提交表单的名字
		///       action   表单提交的目的网页
		/// 输出：无。
		/// </summary>
		public static void Confirm(System.Web.UI.Page page,string description,string FormName,string action)
		{
			string strScript,strDescription;
			string strKey;
			int i;
			//脚本块的内容
			//先将提示信息中的某些字符做转换，否则会影响脚本的执行
			strDescription=description.Replace("\"","\\\"");
			strDescription=strDescription.Replace("\\","\\\\");
			strDescription=strDescription.Replace("\r","\\r");
			strDescription=strDescription.Replace("\n","\\n");
			strScript="<script language=javascript>\n";
			strScript+="	if (window.confirm(\"" +strDescription+"\")==true)\n";
			strScript+="	{\n";
			strScript+="		"+FormName+".action=\""+action+"\";\n";
			strScript+="		"+FormName+".submit();\n";
			strScript+="	}\n";
			strScript+="</script>";
			//注册脚本块的Key
			strKey=System.DateTime.Now.ToString();
			//循环，直至找到某个没被注册过的Key
			for (i=0;i<10000;i++)
				if (!page.IsStartupScriptRegistered(strKey+i.ToString()))
					break;
			page.RegisterStartupScript(strKey+i.ToString(),strScript);
		}

		/// <summary>
		/// 功能：执行客户端一小块脚本语言,在Page对象的<form runat= server>元素的结束标记之前发出该脚本
		/// 输入：page   网页中的Page对象
		///       script 欲执行的JavaScript脚本
		/// 输出：无。
		/// </summary>
		public static void ExecuteStartup(System.Web.UI.Page page,string script)
		{
			string strScript;
			string strKey;
			int i;
			//脚本块的内容
			strScript="<script language=javascript>\n";
			strScript+="	"+script+";";
			strScript+="</script>";
			//注册脚本块的Key
			strKey=System.DateTime.Now.ToString();
			//循环，直至找到某个没被注册过的Key
			for (i=0;i<10000;i++)
				if (!page.IsStartupScriptRegistered(strKey+i.ToString()))
					break;
			page.RegisterStartupScript(strKey+i.ToString(),strScript);
		}

		/// <summary>
		/// 功能：在客户端注册一块脚本语言,在Page对象的<form runat= server>元素的结束标记之前发出该脚本
		/// 输入：page   网页中的Page对象
		///       script 欲注册的JavaScript脚本，需要包括<script language=javascript>等标签
		/// 输出：无。
		/// </summary>
		public static void RegisterStartupScript(System.Web.UI.Page page,string script)
		{
			string strKey;
			int i;
			//注册脚本块的Key
			strKey=System.DateTime.Now.ToString();
			//循环，直至找到某个没被注册过的Key
			for (i=0;i<10000;i++)
				if (!page.IsStartupScriptRegistered(strKey+i.ToString()))
					break;
			page.RegisterStartupScript(strKey+i.ToString(),script);
		}

		/// <summary>
		/// 功能：在客户端注册一块脚本语言,在Page对象的<form runat= server>元素的开始标记后立即发出该脚本
		/// 输入：page   网页中的Page对象
		///       script 欲注册的JavaScript脚本，需要包括<script language=javascript>等标签
		/// 输出：无。
		/// </summary>
		public static void RegisterClientScriptBlock(System.Web.UI.Page page,string script)
		{
			string strKey;
			int i;
			//注册脚本块的Key
			strKey=System.DateTime.Now.ToString();
			//循环，直至找到某个没被注册过的Key
			for (i=0;i<10000;i++)
				if (!page.IsClientScriptBlockRegistered(strKey+i.ToString()))
					break;
			page.RegisterClientScriptBlock(strKey+i.ToString(),script);
		}

		/// <summary>
		/// 功能：执行客户端一小块脚本语言,在Page对象的<form runat= server>元素的开始标记后立即发出该脚本
		/// 输入：page   网页中的Page对象
		///       script 欲执行的JavaScript脚本
		/// 输出：无。
		/// </summary>
		public static void ExecuteBlock(System.Web.UI.Page page,string script)
		{
			string strScript;
			string strKey;
			int i;
			//脚本块的内容
			strScript="<script language=javascript>\n";
			strScript+="	"+script+";";
			strScript+="</script>";
			//注册脚本块的Key
			strKey=System.DateTime.Now.ToString();
			//循环，直至找到某个没被注册过的Key
			for (i=0;i<10000;i++)
				if (!page.IsClientScriptBlockRegistered(strKey+i.ToString()))
					break;
			page.RegisterClientScriptBlock(strKey+i.ToString(),strScript);
		}

		/// <summary>
		/// 执行客户端一小块脚本语言,在window的onload事件后发出该脚本
		/// </summary>
		/// <param name="page">网页中的Page对象</param>
		/// <param name="script">欲执行的JavaScript脚本</param>
		public static void ExecuteClientScriptOnWindowLoad(System.Web.UI.Page page,string script)
		{
			string strScript;
			string strKey;
			int i;
			//脚本块的内容
			strScript="<script for=window event=onload language=javascript>\n";
			strScript+="	"+script+";";
			strScript+="</script>";
			//注册脚本块的Key
			strKey=System.DateTime.Now.ToString();
			//循环，直至找到某个没被注册过的Key
			for (i=0;i<10000;i++)
				if (!page.IsClientScriptBlockRegistered(strKey+i.ToString()))
					break;
			page.RegisterClientScriptBlock(strKey+i.ToString(),strScript);
		}

		/// <summary>
		/// 功能：执行客户端脚本，设置输入焦点
		/// 输入：page     网页中的Page对象
		///       ObjectID 欲设置输入焦点的客户端对象（网页元素）的ID
		/// 输出：无。
		/// </summary>
		public static void Focus(System.Web.UI.Page page,string ObjectID)
		{
			string strScript;
			string strKey;
			int i;
			//脚本块的内容
			strScript="<script language=javascript>\n";
			strScript+="	"+ObjectID+".focus()\n";
			strScript+="</script>";
			//注册脚本块的Key
			strKey=System.DateTime.Now.ToString();
			//循环，直至找到某个没被注册过的Key
			for (i=0;i<10000;i++)
				if (!page.IsStartupScriptRegistered(strKey+i.ToString()))
					break;
			page.RegisterStartupScript(strKey+i.ToString(),strScript);
		}

		/// <summary>
		/// 生成SQL Server返回的出错信息
		/// </summary>
		/// <param name="e">SQL Server给出的出错异常</param>
		/// <returns>生成的出错信息</returns>
		/// Written by Michael
//		public static string GetSqlErrMsg(Microsoft.Data.Odbc.OdbcException e)
//		{
////			string t="\r\n";
////			string sMessage=e.Message.Replace(t,"\\n");
////			string ret=String.Format("数据库操作错误！ \\n错误信息:{0}\\n", sMessage);
////			ret+=String.Format("错误来源:{0}\\n", e.Source);		
////			return ret;
//		}
	}
}
