using System;
using System.Collections;
using System.ComponentModel;
using System.Data;
using System.Data.SqlClient;
using System.Drawing;
using System.Drawing.Imaging;
using System.Web;
using System.Web.SessionState;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Web.UI.HtmlControls;
using System.Text.RegularExpressions;
using System.IO;
using System.Web.Mail;
using System.Text;
using System.Xml;
using Microsoft.Web.UI.WebControls;

namespace jxc
{
	public class utils : Page
	{
		public  static bool IsNum(String str) 
		{ 
			for(int i=0;i<str.Length;i++) 
			{ 
				if(str[i]<'0' || str[i]>'9') 
					return false; 
			} 
			return true; 
		} 
		public static string GenRandom (int length)
		{
			int i = 0;
			byte[] buf = new byte[length];
			
			System.Random ro = new Random (unchecked((int)DateTime.Now.Ticks));
			

			StringBuilder s = new StringBuilder ();
			ro.NextBytes (buf);

			for (i=0;i<4;i++)
				s.Append (Convert.ToString (buf[i],16));
			s.Append("-");

			for (i=4;i<6;i++)
				s.Append(Convert.ToString (buf[i],16));
			s.Append("-");

			for (i=6;i<8;i++)
				s.Append(Convert.ToString (buf[i],16));
			s.Append("-");

			for (i=8;i<16;i++)
				s.Append(Convert.ToString (buf[i],16));

			return s.ToString ();
		}
		public  void UpImgFile (HtmlInputFile fl_Name,string path,string shopid,string goodsid)
		{
			//判断文件后缀是否是 jpg bmp gif
			string rawfile = fl_Name.PostedFile.FileName;
			string suffix = getFileSuffix (rawfile).ToUpper ().Trim();
			if ((suffix == "JPG") || (suffix == "BMP") || (suffix == "GIF"))
			{
				//判断文件大小是否超标
				if (fl_Name.PostedFile.ContentLength > 1024 * 768)
				{
					throw new Exception  ("文件大小不能超过1024*768字节");
				}
				//保存小大图片
				string bigpath = Server.MapPath(path) ;
				if ( !Directory.Exists (bigpath))
					Directory.CreateDirectory (bigpath);
				bigpath +=  "\\" +  goodsid  + "." +  suffix;
				fl_Name.PostedFile.SaveAs (bigpath);

				/*
				//生成大图片的缩略图并保存
				System.Drawing.Image image = System.Drawing.Image.FromFile(fl_Name.PostedFile.FileName);

				System.Drawing.Image.GetThumbnailImageAbort myCallBack = 
					new System.Drawing.Image.GetThumbnailImageAbort(ThumbnailCallback);


				System.Drawing.Image  aNewImage = image.GetThumbnailImage(80,60,myCallBack,IntPtr.Zero);
				string smallpath = Server.MapPath(path)  + "\\" +  "small" ;
				if ( !Directory.Exists (smallpath))
					Directory.CreateDirectory (smallpath);
				smallpath += "\\" +  goodsid  + "." +  suffix;
				switch (suffix)
				{
					case "JPG":
						aNewImage.Save (smallpath,ImageFormat.Jpeg);
						break;
					case "GIF":
						aNewImage.Save (smallpath,ImageFormat.Gif);
						break;
					case "BMP":
						aNewImage.Save (smallpath,ImageFormat.Bmp);
						break;
				} */
			}
			else
			{
				throw new Exception ("文件格式错，选择的不是图像文件！");
			}
		}

		public  void UpImgFile (HtmlInputFile fl_Name,string path,string filename)
		{
			//判断文件后缀是否是 jpg bmp gif
			string rawfile = fl_Name.PostedFile.FileName;
			string suffix = getFileSuffix (rawfile).ToUpper ().Trim();
			if ((suffix == "JPG") ||  (suffix == "GIF"))
			{
				//判断文件大小是否超标
				if (fl_Name.PostedFile.ContentLength > 1024 * 768)
				{
					throw new Exception  ("文件大小不能超过1024*768字节");
				}
				//保存小大图片
				string filepath = Server.MapPath(path);
			
				if ( !Directory.Exists (filepath))
					Directory.CreateDirectory (filepath);

				if (File.Exists (filepath + "\\" + filename))
					throw new Exception ("同名文件已存在，请换名上传!");

				fl_Name.PostedFile.SaveAs (filepath + "\\" + filename);

			//	throw new Exception (path + "," + bigpath);
			
				//生成大图片的缩略图并保存
				/*
				System.Drawing.Image image = System.Drawing.Image.FromFile(fl_Name.PostedFile.FileName);

				System.Drawing.Image.GetThumbnailImageAbort myCallBack = 
					new System.Drawing.Image.GetThumbnailImageAbort(ThumbnailCallback);

				System.Drawing.Image  aNewImage = image.GetThumbnailImage(80,60,myCallBack,IntPtr.Zero);
			
				switch (suffix)
				{
					case "JPG":
						aNewImage.Save (bigpath + "\\" + smallname,ImageFormat.Jpeg);
						break;
					case "GIF":
						aNewImage.Save (bigpath + "\\" + smallname,ImageFormat.Gif);
						break;
					case "BMP":
						aNewImage.Save (bigpath + "\\" + smallname,ImageFormat.Bmp);
						break;
				}*/
			}
			else
			{
				throw new Exception ("文件格式错，选择的不是图像文件！");
			}
		}

		public  void UpMemberPhoto (HtmlInputFile fl_Name,string path,string name)
		{
			//判断文件后缀是否是 jpg bmp gif
			string rawfile = fl_Name.PostedFile.FileName;
			string suffix = getFileSuffix (rawfile).ToUpper ().Trim();
			if ((suffix == "JPG") || (suffix == "BMP") || (suffix == "GIF"))
			{
				//判断文件大小是否超标
				if (fl_Name.PostedFile.ContentLength > 1024 * 768)
				{
					throw new Exception  ("文件大小不能超过1024*768字节");
				}
				

				//生成大图片的缩略图并保存
				System.Drawing.Image image = System.Drawing.Image.FromFile(fl_Name.PostedFile.FileName);

				System.Drawing.Image.GetThumbnailImageAbort myCallBack = 
					new System.Drawing.Image.GetThumbnailImageAbort(ThumbnailCallback);


				System.Drawing.Image  aNewImage = image.GetThumbnailImage(80,60,myCallBack,IntPtr.Zero);
				string path2 = Server.MapPath(path) ;
				if ( !Directory.Exists (path2))
					Directory.CreateDirectory (path2);
				path2 += "\\" +  name  + "." +  suffix;
				switch (suffix)
				{
					case "JPG":
						aNewImage.Save (path2,ImageFormat.Jpeg);
						break;
					case "GIF":
						aNewImage.Save (path2,ImageFormat.Gif);
						break;
					case "BMP":
						aNewImage.Save (path2,ImageFormat.Bmp);
						break;
				}
			}
			else
			{
				throw new Exception ("文件格式错，选择的不是图像文件！");
			}
		}

		public bool ThumbnailCallback ()
		{
			return false;
		}
		public string getFileSuffix (string filename)
		{
			int length = filename.LastIndexOf (".");
			return filename.Substring (length + 1);
		}
		public string serial (string index)
		{
			string date =  DateTime.Now.ToString("yyyyMMdd");
			if (index.Length > 10)
				return "";
			StringBuilder a = new StringBuilder ();
			a.Append (date);
			int len = index.Length;
			for (int i = 0;i < 10 - len;i++)
				a.Append("0");
			a.Append (index);
			return a.ToString ();

		}

		public void Alert(string str_Prompt,Label lbl_Error)
		{
			lbl_Error.Text="<script language=\"javascript\">alert('"+str_Prompt+"');</"+"script>"; 
		}

		public void DeleteFile (string file)
		{
			File.Delete (Server.MapPath(file));
		}

		public  void OpenWindow(System.Web.UI.Page page,string URL, string target)
		{
			string strScript;
			string strKey;
			int i;
			//脚本块的内容
			strScript="<script language=javascript>";
			strScript+="	window.open('" + URL + "'," + "'" + target + "')";
			strScript+="</script>";
			//注册脚本块的Key
			strKey=System.DateTime.Now.ToString();
			//循环，直至找到某个没被注册过的Key
			for (i=0;i<10000;i++)
				if (!page.IsStartupScriptRegistered(strKey+i.ToString()))
					break;
			page.RegisterStartupScript(strKey+i.ToString(),strScript);
		}

		public  static void Alert(System.Web.UI.UserControl page,string description)
		{
			string strScript,strDescription;
			string strKey;
			//脚本块的内容
			//先将提示信息中的某些字符做转换，否则会影响脚本的执行
			strDescription=description.Replace("\"","\\\"");
			strDescription=description.Replace("\\","\\\\");
			strDescription=strDescription.Replace("\r","\\r");
			strDescription=strDescription.Replace("\n","\\n");
			strScript="<script language=javascript>\n";
			strScript+="	window.alert(\"" +strDescription+"\")\n";
			strScript+="</script>";
			page.Response.Write (strScript);
		}
		/// <summary>
		/// 功能：弹出一信息框。
		/// 输入：page         网页中的Page对象
		///       Description  信息框中描述的内容。
		/// 输出：无。
		/// </summary>
		public  static void Alert(System.Web.UI.Page page,string description)
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
		/// 功能：打开一个网页对话框。
		/// 输入：page   网页中的Page对象
		///       URL    欲打开对话框中的网页地址
		///       Width  打开的对话框的宽
		///       Height 打开的对话框的高。
		/// 输出：无。
		/// </summary>
		public  void OpenDialog(System.Web.UI.Page page,string URL, int Width, int Height)
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
		/// 功能：打开一个IE窗口(无标题栏、工具栏、地址栏等），在屏幕的最右边，上下位置在中间。
		/// 输入：page   网页中的Page对象
		///       URL    欲打开对话框中的网页地址
		///       Width  打开的对话框的宽
		///       Height 打开的对话框的高。
		/// 输出：无。
		/// </summary>
		public  void OpenIEWindowRight(System.Web.UI.Page page,string URL, int Width, int Height)
		{
//			string strScript;
//			string strKey;
//			int i;
//			//脚本块的内容
//			strKey=string.Format("width={0},height={1},directories=no,scrollbars=yes,location=no,menubar=no,status=no,toolbar=no,resizable=yes",Width,Height);
//			strScript="<script language=javascript>\n";
//			strScript+="	var sFeatures=\""+strKey+"\";\n";
//			strScript+="	sFeatures+=\",left=\"+(screen.availWidth-12-"+Width.ToString()+");\n";
//			strScript+="	sFeatures+=\",top=\"+(screen.availHeight-"+Height.ToString()+")/2;\n";
//			strScript+="	window.open(\"" + URL + "\",\"_blank\",sFeatures);\n";
//			strScript+="</script>";
//			//注册脚本块的Key
//			strKey=System.DateTime.Now.ToString();
//			//循环，直至找到某个没被注册过的Key
//			for (i=0;i<10000;i++)
//				if (!page.IsStartupScriptRegistered(strKey+i.ToString()))
//					break;
//			page.RegisterStartupScript(strKey+i.ToString(),strScript);
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
		/// 功能：打开一个IE窗口(无标题栏、工具栏、地址栏等），在屏幕的最右边，上下位置在中间。
		/// 输入：page   网页中的Page对象
		///       URL    欲打开对话框中的网页地址
		///       Width  打开的对话框的宽
		///       Height 打开的对话框的高。
		/// 输出：无。
		/// </summary>
		public  void OpenIEWindowPrint(System.Web.UI.Page page,string URL, int Width, int Height)
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


		public  void CloseWindow(System.Web.UI.Page page)
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

		public  void ReturnWindow(System.Web.UI.Page page)
		{
			string strScript;
			string strKey;
			int i;
			//脚本块的内容
			strScript="<script language=javascript>\n";
			strScript+="	history.go(-1);\n";
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
		/// 功能：弹出一个确认框，用户点确认则提交指定表单至指定的网页；用户点取消则返回，不做其他操作
		/// 输入：page     网页中的Page对象
		///       FormName 欲提交表单的名字
		///       action   表单提交的目的网页
		/// 输出：无。
		/// </summary>
		public  void Confirm(System.Web.UI.Page page,string description)
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
			strScript+="	return window.confirm(\"" +strDescription+"\")\n";
		
			strScript+="</script>";
			//注册脚本块的Key
			strKey=System.DateTime.Now.ToString();
			//循环，直至找到某个没被注册过的Key
			for (i=0;i<10000;i++)
				if (!page.IsStartupScriptRegistered(strKey+i.ToString()))
					break;
			page.RegisterStartupScript(strKey+i.ToString(),strScript);
		}

		public  void ReloadPage(System.Web.UI.Page page,string description)
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

			strScript+="	parent.frames(\"" + description + "\")" + ".document.location.reload();\n";
		
			strScript+="</script>";
			//注册脚本块的Key
			strKey=System.DateTime.Now.ToString();
			//循环，直至找到某个没被注册过的Key
			for (i=0;i<10000;i++)
				if (!page.IsStartupScriptRegistered(strKey+i.ToString()))
					break;
			page.RegisterStartupScript(strKey+i.ToString(),strScript);
		}

		public bool SessionNullAlert (string index)
		{
			if (Session[index] == null)
				return true;
			else
				return false;
		}

		public static string FindCheckedItem (DataGrid Datagrid1)
		{
			string output = "";
			foreach (DataGridItem item in Datagrid1.Items)
			{
				if (((CheckBox) item.Cells[1].FindControl("selectcheck")).Checked)
				{
					output += Datagrid1.DataKeys [item.ItemIndex].ToString ();
					output += ",";
				}

			}
			if (output != "")
				return output.TrimEnd(',');
			return output;
		}


		public static string FindFirstCheckedItem (DataGrid Datagrid1)
		{
			foreach (DataGridItem item in Datagrid1.Items)
			{
				if (((CheckBox) item.Cells[1].FindControl("selectcheck")).Checked)
					return Datagrid1.DataKeys [item.ItemIndex].ToString ();
			}
			return "";
		}

		public void SetCheckedItem (DropDownList list,string input)
		{
			for (int i=0;i<list.Items.Count;i++)
			{
				if (list.Items[i].Value == input)
					list.SelectedIndex = i;
			}
		}

		public string MakeString (ArrayList list)
		{
			string output = "";
			for (int i=0;i<list.Count;i++)
			{
				output += list[i];
				if (i != list.Count - 1)
					output += "|";
			}
			return output;
		}

		public  void ErrorReport (string path,string message)
		{
			string direction = path + "error.aspx?err=" + message;
			Server.Transfer (direction);
		}

		public string CheckEmail (string email)
		{
			return "";
		}

		public string GetFromSession (string id)
		{
			if (this.Session[id] == null)
				throw new Exception ("你要取的值不存在！");
			else
				return Session[id].ToString ();
		}

		public ArrayList GetDistinctId (ArrayList array)
		{
			ArrayList output = new ArrayList ();
			
			if (array.Count == 0)
				return output;
			int lastindex = array.Count - 1;
			
			string key = array[0].ToString ().Trim ();
			for (int i = 0;i <= lastindex;i++)
			{
				if (key != array[i].ToString ().Trim ())
				{
					output.Add (key);

					//	output.Add (key);
					key = array[i].ToString ().Trim ();
				}
				if (i == lastindex)
				{
					output.Add (array[i].ToString ().Trim ());
				}
			}
			return output;
		}

		/****************************************************
		概要：	查询字符串A是否包含字符串B
		参数：	strA			
				strB			
		返回：	int  1 or 0  (1:包含，0:不包含)
		创建：	lmd 2002.09.15
		****************************************************/
		private int Instr(string strA,string strB)
		{
			if(string.Compare(strA,strA.Replace(strB,""))>0)
			{
				return 1;
			}
			else
			{
				return 0;
			}
		}
		/****************************************************
		概要：	获取用户信息
		参数：	Info		:信息字符串	
				Type		:信息类别	(1:操作系统，2:浏 览 器)
		返回：	string      操作系统或浏 览 器的信息字符串
		创建：	lmd 2002.09.15
		****************************************************/
		public string GetUsersInfo(string Info,int Type)
		{

			string GetInfo="";
			switch(Type)
			{
				case 1:
					if(Instr(Info,@"NT 5.1")>0)
					{
						GetInfo = "操作系统：Windows XP";
					}
					else if(Instr(Info,@"Tel")>0)
					{
						GetInfo = "操作系统：Telport";
					}
					else if(Instr(Info,@"webzip")>0)
					{
						GetInfo = "操作系统：操作系统：webzip";
					}
					else if(Instr(Info,@"flashget")>0)
					{
						GetInfo = "操作系统：flashget";
					}
					else if(Instr(Info,@"offline")>0)
					{
						GetInfo = "操作系统：offline";
					}
					else if(Instr(Info,@"NT 5")>0)
					{
						GetInfo = "操作系统：Windows 2000";
					}
					else if(Instr(Info,@"NT 4")>0)
					{
						GetInfo = "操作系统：Windows NT4";
					}
					else if(Instr(Info,@"98")>0)
					{
						GetInfo = "操作系统：Windows 98";
					}
					else if(Instr(Info,@"95")>0)
					{
						GetInfo = "操作系统：Windows 95";
					}
					else
					{
						GetInfo = "操作系统：未知";
					}
					break;
				case 2:
					if(Instr(Info,@"NetCaptor 6.5.0")>0)
					{
						GetInfo = "浏 览 器：NetCaptor 6.5.0";
					}
					else if(Instr(Info,@"MyIe 3.1")>0)
					{
						GetInfo = "浏 览 器：MyIe 3.1";
					}
					else if(Instr(Info,@"NetCaptor 6.5.0RC1")>0)
					{
						GetInfo = "浏 览 器：NetCaptor 6.5.0RC1";
					}
					else if(Instr(Info,@"NetCaptor 6.5.PB1")>0)
					{
						GetInfo = "浏 览 器：NetCaptor 6.5.PB1";
					}
					else if(Instr(Info,@"MSIE 6.0b")>0)
					{
						GetInfo = "浏 览 器：Internet Explorer 6.0b";
					}
					else if(Instr(Info,@"MSIE 6.0")>0)
					{
						GetInfo = "浏 览 器：Internet Explorer 6.0";
					}
					else if(Instr(Info,@"MSIE 5.5")>0)
					{
						GetInfo = "浏 览 器：Internet Explorer 5.5";
					}
					else if(Instr(Info,@"MSIE 5.01")>0)
					{
						GetInfo = "浏 览 器：Internet Explorer 5.01";
					}
					else if(Instr(Info,@"MSIE 5.0")>0)
					{
						GetInfo = "浏 览 器：Internet Explorer 5.0";
					}
					else if(Instr(Info,@"MSIE 4.0")>0)
					{
						GetInfo = "浏 览 器：Internet Explorer 4.0";
					}
					else
					{
						GetInfo = "浏 览 器：未知";
					}
					break;
			}
			return GetInfo;
		}

		/****************************************************
		概要：  转换ubb语法字符为html语法字符	
		参数：  		
		返回：	
		创建：	lmd 2002.09.15
		****************************************************/
		public string Texttohtml(string sDetail)
		{
		
			/*
			if(chr==null)
				return "";
			chr=chr.Replace(" ","&nbsp;");
			chr=chr.Replace("<","&lt;");
			chr=chr.Replace(">","&gt;");
			chr=chr.Replace("\n","<br>");
			chr=chr.Replace("\t","&nbsp;&nbsp;&nbsp;");
			chr = Regex.Replace(chr,@"\[url=(?<x>[^\]]*)\](?<y>[^\]]*)\[/url\]",@"<a href=$1 target=_blank>$2</a>",RegexOptions.IgnoreCase);
			chr = Regex.Replace(chr,@"\[url\](?<x>[^\]]*)\[/url\]",@"<a href=$1 target=_blank>$1</a>",RegexOptions.IgnoreCase);
			chr = Regex.Replace(chr,@"\[email=(?<x>[^\]]*)\](?<y>[^\]]*)\[/email\]",@"<a href=$1>$2</a>",RegexOptions.IgnoreCase);
			chr = Regex.Replace(chr,@"\[email\](?<x>[^\]]*)\[/email\]",@"<a href=$1>$1</a>",RegexOptions.IgnoreCase);
			chr = Regex.Replace(chr,@"\[flash](?<x>[^\]]*)\[/flash]",@"<OBJECT codeBase=http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=4,0,2,0 classid=clsid:D27CDB6E-AE6D-11cf-96B8-444553540000 width=500 height=400><PARAM NAME=movie VALUE=""$1""><PARAM NAME=quality VALUE=high><embed src=""$1"" quality=high pluginspage='http://www.macromedia.com/shockwave/download/index.cgi?P1_Prod_Version=ShockwaveFlash' type='application/x-shockwave-flash' width=500 height=400>$1</embed></OBJECT>",RegexOptions.IgnoreCase);
			chr = Regex.Replace(chr,@"\[img](?<x>[^\]]*)\[/img]",@"<a href=""$1"" target=""_blank""><IMG SRC=""$1"" border=0></a>",RegexOptions.IgnoreCase);
			chr = Regex.Replace(chr,@"\[color=(?<x>[^\]]*)\](?<y>[^\]]*)\[/color]",@"<font color=$1>$2</font>",RegexOptions.IgnoreCase);
			chr = Regex.Replace(chr,@"\[face=(?<x>[^\]]*)\](?<y>[^\]]*)\[/face]",@"<font face=$1>$2</font>",RegexOptions.IgnoreCase);
			chr = Regex.Replace(chr,@"\[size=1\](?<x>[^\]]*)\[/size]",@"<font size=1>$1</font>",RegexOptions.IgnoreCase);
			chr = Regex.Replace(chr,@"\[size=2\](?<x>[^\]]*)\[/size]",@"<font size=2>$1</font>",RegexOptions.IgnoreCase);
			chr = Regex.Replace(chr,@"\[size=3\](?<x>[^\]]*)\[/size]",@"<font size=3>$1</font>",RegexOptions.IgnoreCase);
			chr = Regex.Replace(chr,@"\[size=4\](?<x>[^\]]*)\[/size]",@"<font size=4>$1</font>",RegexOptions.IgnoreCase);
			chr = Regex.Replace(chr,@"\[align=(?<x>[^\]]*)\](?<y>[^\]]*)\[/align\]",@"<align=$1>$2</align>",RegexOptions.IgnoreCase);
			chr = Regex.Replace(chr,@"\[fly](?<x>[^\]]*)\[/fly]",@"<marquee width=90% behavior=alternate scrollamount=3>$1</marquee>",RegexOptions.IgnoreCase);
			chr = Regex.Replace(chr,@"\[move](?<x>[^\]]*)\[/move]",@"<marquee scrollamount=3>$1</marquee>",RegexOptions.IgnoreCase);
			chr = Regex.Replace(chr,@"\[glow=(?<x>[^\]]*),(?<y>[^\]]*),(?<z>[^\]]*)\](?<w>[^\]]*)\[/glow\]",@"<table width=$1 style='filter:glow(color=$2, strength=$3)'>$4</table>",RegexOptions.IgnoreCase);
			chr = Regex.Replace(chr,@"\[shadow=(?<x>[^\]]*),(?<y>[^\]]*),(?<z>[^\]]*)\](?<w>[^\]]*)\[/shadow\]",@"<table width=$1 style='filter:shadow(color=$2, strength=$3)'>$4</table>",RegexOptions.IgnoreCase);
			chr = Regex.Replace(chr,@"\[b\](?<x>[^\]]*)\[/b]",@"<b>$1</b>",RegexOptions.IgnoreCase);
			chr = Regex.Replace(chr,@"\[center\](?<x>[^\]]*)\[/center]",@"<center>$1</center>",RegexOptions.IgnoreCase);
			chr = Regex.Replace(chr,@"\[i\](?<x>[^\]]*)\[/i]",@"<i>$1</i>",RegexOptions.IgnoreCase);
			chr = Regex.Replace(chr,@"\[u\](?<x>[^\]]*)\[/u]",@"<u>$1</u>",RegexOptions.IgnoreCase);
			chr = Regex.Replace(chr,@"\[list\](?<x>[^\]]*)\[/list]",@"<ul>$1</ul>",RegexOptions.IgnoreCase);
			chr = Regex.Replace(chr,@"\[list=1\](?<x>[^\]]*)\[/list]",@"<ol type=1>$1</ol id=1>",RegexOptions.IgnoreCase);
			chr = Regex.Replace(chr,@"\[list=a\](?<x>[^\]]*)\[/list]",@"<ol type=a>$1</ol id=a>",RegexOptions.IgnoreCase);
			chr = Regex.Replace(chr,@"\[\*\](?<x>[^\]]*)\[/\*\]",@"<li>$1</li>",RegexOptions.IgnoreCase);
			chr = Regex.Replace(chr,@"\[quote](?<x>.*)\[/quote]",@"<table border='0' width='85%' cellpadding='10' cellspacing='1'align='center'><tr><td>以下内容为引用：<hr><b>$1</b><hr></td></tr></table>",RegexOptions.IgnoreCase);
			chr = Regex.Replace(chr,@"\[gif](?<x>[^\]]*)\[/gif]",@"<IMG SRC=""$1"" border=0>",RegexOptions.IgnoreCase);
			chr = Regex.Replace(chr,@"\[jpg](?<x>[^\]]*)\[/jpg]",@"<IMG SRC=""$1"" border=0>",RegexOptions.IgnoreCase);
			chr = Regex.Replace(chr,@"\[zip](?<x>[^\]]*)\[/zip]",@"<a href=""$1"" target=""_blank""><IMG SRC='../Pic/Zip.gif' border=0>请点击此处下载</a><br>",RegexOptions.IgnoreCase);
			chr = Regex.Replace(chr,@"\[rar](?<x>[^\]]*)\[/rar]",@"<a href=""$1"" target=""_blank""><IMG SRC='../Pic/Rar.gif' border=0>请点击此处下载</a><br>",RegexOptions.IgnoreCase);
			MatchCollection mc;
			Regex r = new Regex(@"\[code\]([^\]]*)\[/code\]");
			mc = r.Matches(chr);
			
			chr = Regex.Replace(chr,@"\[code\](?<x>[^\]]*)\[/code\]",@"以下内容为程序代码：<table border='0' width='100%' cellpadding='10' cellspacing='1' bgcolor='#000000'><tr><td bgcolor='#FFFFFF'>$1</td></tr></table>",RegexOptions.IgnoreCase);

			r = new Regex(@"\[html\]([^\]]*)\[/html\]");
			mc = r.Matches(chr);

			chr = Regex.Replace(chr,@"\[html\](?<x>[^\]]*)\[/html\]",@"以下内容为页面代码：<table border='0' width='100%' cellpadding='10' cellspacing='1' bgcolor='#000000'><tr><td bgcolor='#FFFFFF'><font color='#0000FF'>$1</font></td></tr></table>",RegexOptions.IgnoreCase);

*/
			Regex r;
			Match m;
			#region 处理空格
			//sDetail = sDetail.Replace(" ","&nbsp;");
			sDetail = sDetail.Replace("\t","&nbsp;&nbsp;&nbsp;");

	//		sDetail = sDetail.Replace(((char)34).ToString(), "&quot;");
	//		sDetail = sDetail.Replace(((char)39).ToString(), "&#39;");
	//		sDetail = sDetail.Replace(((char)13).ToString(), "");

			#endregion
			#region html标记符
		//	sDetail = sDetail.Replace("<","&lt;");
		//	sDetail = sDetail.Replace(">","&gt;");
			#endregion
			#region 处[b][/b]标记
			r = new Regex(@"(\[b\])([ \S\t]*?)(\[\/b\])",RegexOptions.IgnoreCase);
			for (m = r.Match(sDetail); m.Success; m = m.NextMatch()) 
			{
				sDetail = sDetail.Replace(m.Groups[0].ToString(),"<B>" + m.Groups[2].ToString() + "</B>");
			}
			#endregion
			#region 处[i][/i]标记
			r = new Regex(@"(\[i\])([ \S\t]*?)(\[\/i\])",RegexOptions.IgnoreCase);
			for (m = r.Match(sDetail); m.Success; m = m.NextMatch()) 
			{
				sDetail = sDetail.Replace(m.Groups[0].ToString(),"<I>" + m.Groups[2].ToString() + "</I>");
			}
			#endregion
			#region 处[u][/u]标记
			r = new Regex(@"(\[U\])([ \S\t]*?)(\[\/U\])",RegexOptions.IgnoreCase);
			for (m = r.Match(sDetail); m.Success; m = m.NextMatch()) 
			{
				sDetail = sDetail.Replace(m.Groups[0].ToString(),"<U>" + m.Groups[2].ToString() + "</U>");
			}
			#endregion
			#region 处[p][/p]标记
			//处[p][/p]标记
			r = new Regex(@"((\r\n)*\[p\])(.*?)((\r\n)*\[\/p\])",RegexOptions.IgnoreCase|RegexOptions.Singleline);
			for (m = r.Match(sDetail); m.Success; m = m.NextMatch()) 
			{
				sDetail = sDetail.Replace(m.Groups[0].ToString(),"<P class=\"pstyle\">" + m.Groups[3].ToString() + "</P>");
			}
			#endregion
			#region 处[sup][/sup]标记
			//处[sup][/sup]标记
			r = new Regex(@"(\[sup\])([ \S\t]*?)(\[\/sup\])",RegexOptions.IgnoreCase);
			for (m = r.Match(sDetail); m.Success; m = m.NextMatch()) 
			{
				sDetail = sDetail.Replace(m.Groups[0].ToString(),"<SUP>" + m.Groups[2].ToString() + "</SUP>");
			}
			#endregion

			#region 处理[center][/center]标记
			//处[center][/center]标记
			r = new Regex(@"(\[center\])([ \S\t]*?)(\[\/center\])",RegexOptions.IgnoreCase);
			for (m = r.Match(sDetail); m.Success; m = m.NextMatch()) 
			{
				sDetail = sDetail.Replace(m.Groups[0].ToString(),"<center>" + m.Groups[2].ToString() + "</center>");
			}
			#endregion

			#region 处[sub][/sub]标记
			//处[sub][/sub]标记
			r = new Regex(@"(\[sub\])([ \S\t]*?)(\[\/sub\])",RegexOptions.IgnoreCase);
			for (m = r.Match(sDetail); m.Success; m = m.NextMatch()) 
			{
				sDetail = sDetail.Replace(m.Groups[0].ToString(),"<SUB>" + m.Groups[2].ToString() + "</SUB>");
			}
			#endregion
			#region 处[url][/url]标记
			//处[url][/url]标记
			r = new Regex(@"(\[url\])([ \S\t]*?)(\[\/url\])",RegexOptions.IgnoreCase);
			for (m = r.Match(sDetail); m.Success; m = m.NextMatch()) 
			{
				sDetail = sDetail.Replace(m.Groups[0].ToString(),
					"<A href=\"" + m.Groups[2].ToString() + "\" target=\"_blank\"><IMG border=0 src=\"images/url.gif\">" +
					m.Groups[2].ToString() + "</A>");
			}
			#endregion
			#region 处[url=xxx][/url]标记
			//处[url=xxx][/url]标记
			r = new Regex(@"(\[url=([ \S\t]+)\])([ \S\t]*?)(\[\/url\])",RegexOptions.IgnoreCase);
			for (m = r.Match(sDetail); m.Success; m = m.NextMatch()) 
			{
				sDetail = sDetail.Replace(m.Groups[0].ToString(),
					"<A href=\"" + m.Groups[2].ToString() + "\" target=\"_blank\"><IMG border=0 src=\"/image/down.gif\">" +
					m.Groups[3].ToString() + "下载</A>");
			}
			#endregion
			#region 处[email][/email]标记
			//处[email][/email]标记
			r = new Regex(@"(\[email\])([ \S\t]*?)(\[\/email\])",RegexOptions.IgnoreCase);
			for (m = r.Match(sDetail); m.Success; m = m.NextMatch()) 
			{
				sDetail = sDetail.Replace(m.Groups[0].ToString(),
					"<A href=\"mailto:" + m.Groups[2].ToString() + "\" target=\"_blank\"><IMG border=0 src=\"images/email.gif\">" +
					m.Groups[2].ToString() + "</A>");
			}
			#endregion
			#region 处[email=xxx][/email]标记
			//处[email=xxx][/email]标记
			r = new Regex(@"(\[email=([ \S\t]+)\])([ \S\t]*?)(\[\/email\])",RegexOptions.IgnoreCase);
			for (m = r.Match(sDetail); m.Success; m = m.NextMatch()) 
			{
				sDetail = sDetail.Replace(m.Groups[0].ToString(),
					"<A href=\"mailto:" + m.Groups[2].ToString() + "\" target=\"_blank\"><IMG border=0 src=\"images/email.gif\">" +
					m.Groups[3].ToString() + "</A>");
			}
			#endregion
			#region 处[size=x][/size]标记
			//处[size=x][/size]标记

	//		chr = Regex.Replace(chr,@"\[size=4\](?<x>[^\]]*)\[/size]",@"<font size=4>$1</font>",RegexOptions.IgnoreCase);

	//		r = new Regex(@"(\[size=([1-7])\])([ \S\t]*?)(\[/size\])",RegexOptions.IgnoreCase);

		//	r = new Regex(@"(\[size=([1-7])\])([^\]]*)(\[/size\])",RegexOptions.IgnoreCase);

			r = new Regex(@"(\[size=([1-7])\])(.*)(\[\/size\])",RegexOptions.IgnoreCase);

			for (m = r.Match(sDetail); m.Success; m = m.NextMatch()) 
			{
				sDetail = sDetail.Replace(m.Groups[0].ToString(),
					"<FONT SIZE=" + m.Groups[2].ToString() + ">" + 
					m.Groups[3].ToString() + "</FONT>");
			}
			#endregion
			#region 处[color=x][/color]标记
			//处[color=x][/color]标记
		//	r = new Regex(@"(\[color=([\S]+)\])([ \S\t]*?)(\[\/color\])",RegexOptions.IgnoreCase);

			r = new Regex(@"(\[color=([\S]+)\])(.*)(\[\/color\])",RegexOptions.IgnoreCase);

			for (m = r.Match(sDetail); m.Success; m = m.NextMatch()) 
			{
				sDetail = sDetail.Replace(m.Groups[0].ToString(),
					"<FONT COLOR=" + m.Groups[2].ToString() + ">" + 
					m.Groups[3].ToString() + "</FONT>");
			}
			#endregion
			#region 处[font=x][/font]标记
			//处[font=x][/font]标记
	//		r = new Regex(@"(\[font=([\S]+)\])([ \S\t]*?)(\[\/font\])",RegexOptions.IgnoreCase);

			r = new Regex(@"(\[font=([\S]+)\])(.*)(\[\/font\])",RegexOptions.IgnoreCase);
			for (m = r.Match(sDetail); m.Success; m = m.NextMatch()) 
			{
				sDetail = sDetail.Replace(m.Groups[0].ToString(),
					"<FONT FACE=" + m.Groups[2].ToString() + ">" + 
					m.Groups[3].ToString() + "</FONT>");
			}
			#endregion

			#region 处[face=x][/face]标记
			//处[font=x][/font]标记
	//		r = new Regex(@"(\[face=([\S]+)\])([^\]]*)(\[\/face\])",RegexOptions.IgnoreCase);
			r = new Regex(@"(\[face=([\S]+)\])(.*)(\[\/face\])",RegexOptions.IgnoreCase);

			for (m = r.Match(sDetail); m.Success; m = m.NextMatch()) 
			{
				sDetail = sDetail.Replace(m.Groups[0].ToString(),
					"<FONT FACE=" + m.Groups[2].ToString() + ">" + 
					m.Groups[3].ToString() + "</FONT>");
			}

			sDetail = Regex.Replace(sDetail,@"\[gif](?<x>[^\]]*)\[/gif]",@"<IMG SRC=""$1"" border=0 >",RegexOptions.IgnoreCase);
			sDetail = Regex.Replace(sDetail,@"\[jpg](?<x>[^\]]*)\[/jpg]",@"<IMG SRC=""$1"" border=0  height=300>",RegexOptions.IgnoreCase);
			sDetail = Regex.Replace(sDetail,@"\[zip](?<x>[^\]]*)\[/zip]",@"<a href=""$1"" target=""_blank""><IMG SRC='../Pic/Zip.gif' border=0>请点击此处下载</a><br>",RegexOptions.IgnoreCase);
			sDetail = Regex.Replace(sDetail,@"\[rar](?<x>[^\]]*)\[/rar]",@"<a href=""$1"" target=""_blank""><IMG SRC='../Pic/Rar.gif' border=0>请点击此处下载</a><br>",RegexOptions.IgnoreCase);

			#endregion

			#region 处理图片链接
			//处理图片链接
			r = new Regex("\\[picture\\](\\d+?)\\[\\/picture\\]",RegexOptions.IgnoreCase);
			for (m = r.Match(sDetail); m.Success; m = m.NextMatch()) 
			{
				sDetail = sDetail.Replace(m.Groups[0].ToString(),
					"<A href=\"ShowImage.aspx?Type=ALL&Action=forumImage&ImageID=" + m.Groups[1].ToString() +
					"\" target=\"_blank\"><IMG border=0 Title=\"点击打开新窗口查看\" src=\"ShowImage.aspx?Action=forumImage&ImageID=" + m.Groups[1].ToString() +
					"\"></A>");
			}
			#endregion
			#region 处理[align=x][/align]
			//处理[align=x][/align]
			r = new Regex(@"(\[align=([\S]+)\])([ \S\t]*?)(\[\/align\])",RegexOptions.IgnoreCase);
			for (m = r.Match(sDetail); m.Success; m = m.NextMatch()) 
			{
				sDetail = sDetail.Replace(m.Groups[0].ToString(),
					"<P align=" + m.Groups[2].ToString() + ">" + 
					m.Groups[3].ToString() + "</P>");
			}
			#endregion
			#region 处[H=x][/H]标记
			//处[H=x][/H]标记
			r = new Regex(@"(\[H=([1-6])\])([ \S\t]*?)(\[\/H\])",RegexOptions.IgnoreCase);
			for (m = r.Match(sDetail); m.Success; m = m.NextMatch()) 
			{
				sDetail = sDetail.Replace(m.Groups[0].ToString(),
					"<H" + m.Groups[2].ToString() + ">" + 
					m.Groups[3].ToString() + "</H" + m.Groups[2].ToString() + ">");
			}
			#endregion
			#region 处理[list=x][*][/list]
			//处理[list=x][*][/list]
			r = new Regex(@"(\[list(=(A|a|I|i| ))?\]([ \S\t]*)\r\n)((\[\*\]([ \S\t]*\r\n))*?)(\[\/list\])",RegexOptions.IgnoreCase);
			for (m = r.Match(sDetail); m.Success; m = m.NextMatch()) 
			{
				string strLI = m.Groups[5].ToString();
				Regex rLI = new Regex(@"\[\*\]([ \S\t]*\r\n?)",RegexOptions.IgnoreCase);
				Match mLI;
				for (mLI = rLI.Match(strLI); mLI.Success; mLI = mLI.NextMatch()) 
				{
					strLI = strLI.Replace(mLI.Groups[0].ToString(),"<LI>" + mLI.Groups[1]);
				}
				sDetail = sDetail.Replace(m.Groups[0].ToString(),
					"<UL TYPE=\"" + m.Groups[3].ToString() + "\"><B>" + m.Groups[4].ToString() + "</B>" + 
					strLI + "</UL>");
			}
			#endregion
			#region 处理换行
			//处理换行，在每个新行的前面添加两个全角空格
			r = new Regex(@"(\r\n((&nbsp;)|　)+)(?<正文>\S+)",RegexOptions.IgnoreCase);
			for (m = r.Match(sDetail); m.Success; m = m.NextMatch()) 
			{
				sDetail = sDetail.Replace(m.Groups[0].ToString(),"<BR>　　" + m.Groups["正文"].ToString());
			}
			//处理换行，在每个新行的前面添加两个全角空格
			sDetail = sDetail.Replace("\r\n","<BR>&nbsp;&nbsp;&nbsp;&nbsp;");
			sDetail = sDetail.Replace("\n","<BR>&nbsp;&nbsp;&nbsp;&nbsp;");
			
			
		//	sDetail = "&nbsp;&nbsp;&nbsp;&nbsp;" + sDetail;
			#endregion
			return sDetail;
	

		//	return(chr);	
		}

		public string GetFileName (string path,string flag)
		{
			int first = path.IndexOf ("=") + 1;
			int last = path.IndexOf (flag) - flag.Length - 3;
			string target = path.Substring (first,last);
			string target1 = target.Replace ("\"","");
			return target1.Trim ();
		}
		public int DropWebFile (string InText)
		{

			Regex r;
			Match m;

			r = new Regex(@"<IMG SRC=.*\.(jpg|gif). border",RegexOptions.IgnoreCase);
			for (m = r.Match(InText); m.Success; m = m.NextMatch()) 
			{
				File.Delete (Server.MapPath (GetFileName (m.Value,"border")));
			}

			r = new Regex(@"<A href=.*\.(doc|xls|rar). target",RegexOptions.IgnoreCase);
			for (m = r.Match(InText); m.Success; m = m.NextMatch()) 
			{
				File.Delete (Server.MapPath (GetFileName (m.Value,"target")));
			}
			return 0;
		}

		public static void BindDropDownList (string cmd,DropDownList list)
		{
			list.Items.Clear ();
			
			SqlDataReader dr = DBBase.ExecuteSqlReader(cmd);
			list.Items.Add (new ListItem("请选择","-1"));
			try
			{
				while (dr.Read())
				{
					ListItem a = new ListItem();
					a.Value = dr[0].ToString().Trim ();
					a.Text = dr[1].ToString ().Trim ();
					list.Items.Add (a);
				}
			}
			catch (Exception e)
			{
				throw new Exception (e.Message);
			}
			finally
			{
				dr.Close ();
			}
		}

		public static void BindDropDownListJxc (string cmd,DropDownList list)
		{
			list.Items.Clear ();
			
			SqlDataReader dr = DBBase3.ExecuteSqlReader(cmd);
			list.Items.Add (new ListItem("请选择","-1"));
			try
			{
				while (dr.Read())
				{
					ListItem a = new ListItem();
					a.Value = dr[0].ToString().Trim ();
					a.Text = dr[1].ToString ().Trim ();
					list.Items.Add (a);
				}
			}
			catch (Exception e)
			{
				throw new Exception (e.Message);
			}
			finally
			{
				dr.Close ();
			}
		}

		public static void BindDropDownList2 (string cmd,DropDownList list)
		{
			list.Items.Clear ();
			
			SqlDataReader dr = DBBase2.ExecuteSqlReader(cmd);
			try
			{
				while (dr.Read())
				{
					ListItem a = new ListItem();
					a.Value = dr[0].ToString().Trim ();
					a.Text = dr[1].ToString ().Trim ();
					list.Items.Add (a);
				}
			}
			catch (Exception e)
			{
				throw new Exception (e.Message);
			}
			finally
			{
				dr.Close ();
			}
		}

		public static void BindRadioList (string cmd,RadioButtonList list)
		{
			list.Items.Clear ();
			
			SqlDataReader dr = DBBase.ExecuteSqlReader(cmd);
			try
			{
				while (dr.Read())
				{
					ListItem a = new ListItem();
					a.Value = dr[0].ToString().Trim ();
					a.Text = dr[1].ToString ().Trim ();
					list.Items.Add (a);
				}
			}
			catch (Exception e)
			{
				throw new Exception (e.Message);
			}
			finally
			{
				dr.Close ();
			}
		}

		public static void BindListBox (string cmd,ListBox list)
		{
			list.Items.Clear ();
			
			SqlDataReader dr = DBBase.ExecuteSqlReader(cmd);
			try
			{
				while (dr.Read())
				{
					ListItem a = new ListItem();
					a.Value = dr[0].ToString().Trim ();
					a.Text = dr[1].ToString ().Trim ();
					list.Items.Add (a);
				}
			}
			catch (Exception e)
			{
				throw new Exception (e.Message);
			}
			finally
			{
				dr.Close ();
			}
		}

		public static bool StrVerify(string str,string reg)
		{
			Regex r = new Regex (reg,RegexOptions.IgnoreCase);
			return r.IsMatch (str);
		}

		public DataTable GetTable(string str_Sql)
		{
			DataSet ds = DBBase.ExecuteSql4Ds (str_Sql,"tree");
			return ds.Tables[0];
		}

		public void  BindTreeViewMenu(string Frame,TreeView TreeView1,string key)
		{
			//TreeView1.Nodes.Clear(); // 清空树
			TreeNode root = TreeView1.Nodes[0];

			string cmd = "select id,des,qxcd,imgpath,rank from cnc_qxcdb where rank=0";
			DataTable dt = GetTable(cmd);
			DataRow [] drs = dt.Select ();//　选出所有子节点
			foreach( DataRow r in drs )
				CreateNode0Menu(r["id"].ToString (),r["rank"].ToString (),r["des"].ToString (),Frame,"Menu_Manage.aspx",key,root,r["imgpath"].ToString());//　加入所有根结点以下的结点　												
		}

		public void CreateNode0Menu(string f_key,string f_rank,string f_text,string Frame,string Url,string key,TreeNode parentnode,string imgpath)
		{
			TreeNode tempnode = CreateOneNodeMenu (f_key,f_rank,f_text,Frame,Url,parentnode,true,imgpath);

			string cmd = "select id, des,qxcd,imgpath,rank from cnc_qxcdb where parentid=" + f_key;
			
			DataTable dt = GetTable(cmd);
			DataRow [] drs = dt.Select ();//　选出所有子节点
			foreach( DataRow r in drs )
				CreateOneNodeMenu(r["id"].ToString (),r["rank"].ToString (),r["des"].ToString (),Frame,Url,tempnode,true,imgpath);//　加入所有根结点以下的结点　
		}

		public TreeNode CreateOneNodeMenu(string f_key,string f_rank,string f_text,string Frame,string Url,TreeNode parentnode,bool ifopen,string imgpath)
		{
			TreeNode tempnode = new TreeNode();
			tempnode.Text = f_text;
			tempnode.NodeData = f_key;
			tempnode.ImageUrl=imgpath;
			parentnode.Nodes.Add(tempnode);
			tempnode.Expanded=false;
			if (Frame != "")
				tempnode.Target = Frame;
			if (Url != "")
				tempnode.NavigateUrl = Url + "?id=" + f_key;
			return tempnode;
		}

		public void  BindTreeView(string Frame,TreeView TreeView1,string key)
		{
			//TreeView1.Nodes.Clear(); // 清空树
			TreeNode root = TreeView1.Nodes[0];

			string cmd = "select id,des,qxcd,imgpath from CNC_glyb_child where rank=0 and glydh='" + key + "' order by sortid asc";
			DataTable dt = GetTable(cmd);
			DataRow [] drs = dt.Select ();//　选出所有子节点
			foreach( DataRow r in drs )
				CreateNode0(r["id"].ToString (),r["des"].ToString (),Frame,r["qxcd"].ToString (),key,root,r["imgpath"].ToString());//　加入所有根结点以下的结点　												
		}

		public void CreateNode0(string f_key,string f_text,string Frame,string Url,string key,TreeNode parentnode,string imgpath)
		{
			TreeNode tempnode = CreateOneNodeMenu (f_key,"",f_text,Frame,Url,parentnode,true,imgpath);

			string cmd = "select id, des,qxcd,imgpath from CNC_glyb_child where rank=1 and glydh='" + key + "' and parentid=" + f_key;
			
			DataTable dt = GetTable(cmd);
			DataRow [] drs = dt.Select ();//　选出所有子节点
			foreach( DataRow r in drs )
				CreateOneNode("",r["des"].ToString (),Frame,r["qxcd"].ToString (),tempnode,true,imgpath);//　加入所有根结点以下的结点　
		}

		public TreeNode CreateOneNode(string f_key,string f_text,string Frame,string Url,TreeNode parentnode,bool ifopen,string imgpath)
		{
			TreeNode tempnode = new TreeNode();
			tempnode.Text = f_text;
			tempnode.NodeData = f_key;
			tempnode.ImageUrl=imgpath;
			parentnode.Nodes.Add(tempnode);
			tempnode.Expanded=false;
			if (Frame != "")
				tempnode.Target = Frame;
			if (Url != "")
				tempnode.NavigateUrl = Url;
			return tempnode;
		}

		public  DataTable ConvertDataReaderToDataTable(SqlDataReader dataReader)
		{
			DataTable datatable = new DataTable();
			DataTable schemaTable = dataReader.GetSchemaTable();
			//动态添加列
			try
			{
			
				foreach(DataRow myRow in schemaTable.Rows)
				{
					DataColumn myDataColumn = new DataColumn();
					myDataColumn.DataType	= myRow.GetType();
					myDataColumn.ColumnName = myRow[0].ToString();
					datatable.Columns.Add(myDataColumn);
				}
				//添加数据
				while(dataReader.Read())
				{
					DataRow myDataRow = datatable.NewRow();
					for(int i=0;i<schemaTable.Rows.Count;i++)
					{
						myDataRow[i] = dataReader[i].ToString();
					}
					datatable.Rows.Add(myDataRow);
					myDataRow = null;
				}
				schemaTable = null;
				return datatable;
			}
			catch(Exception ex)
			{
				throw new Exception("转换出错出错!",ex);
			}
			
		}

		public void SetGridStyle(DataGrid Datagrid1)
		{
			Datagrid1.AutoGenerateColumns = false;
			Datagrid1.BorderWidth = Unit.Pixel(1);
			Datagrid1.Width = Unit.Percentage(100);
			Datagrid1.CellPadding = 0;
			Datagrid1.CellSpacing = 0;
			Datagrid1.BackColor = System.Drawing.ColorTranslator.FromHtml("#ededed");
			Datagrid1.HeaderStyle.HorizontalAlign = HorizontalAlign.Center;
			Datagrid1.HeaderStyle.Font.Bold = true;
			Datagrid1.HeaderStyle.Font.Size=9;
			Datagrid1.HeaderStyle.BackColor = System.Drawing.ColorTranslator.FromHtml("#f5f5f5");
			Datagrid1.ItemStyle.BackColor = System.Drawing.Color.White;
			Datagrid1.AllowPaging = true;
			Datagrid1.PagerStyle.BackColor = System.Drawing.ColorTranslator.FromHtml("#f7f7f7");
			Datagrid1.PagerStyle.Mode = PagerMode.NumericPages;
			Datagrid1.PagerStyle.HorizontalAlign = HorizontalAlign.Center;
			Datagrid1.PagerStyle.PageButtonCount = 100;
			Datagrid1.PagerStyle.Font.Size = FontUnit.Large;
			Datagrid1.BorderStyle = BorderStyle.Solid;
			Datagrid1.BorderColor= System.Drawing.ColorTranslator.FromHtml("#CCCCCC");    //"#000066";
			Datagrid1.HeaderStyle.Height=20;
			Datagrid1.ItemStyle.Height=20;
			Datagrid1.ItemStyle.Font.Size=9;
		}
		public void SetGridStyle4(DataGrid Datagrid1)
		{
			Datagrid1.AutoGenerateColumns = false;
			Datagrid1.BorderWidth = Unit.Pixel(1);
			Datagrid1.Width = Unit.Percentage(100);
			Datagrid1.CellPadding = 0;
			Datagrid1.CellSpacing = 0;
			Datagrid1.BackColor = System.Drawing.ColorTranslator.FromHtml("#ededed");
			Datagrid1.HeaderStyle.HorizontalAlign = HorizontalAlign.Center;
			Datagrid1.HeaderStyle.Font.Bold = true;
			Datagrid1.HeaderStyle.Font.Size=9;
			Datagrid1.HeaderStyle.BackColor = System.Drawing.ColorTranslator.FromHtml("#f5f5f5");
			Datagrid1.ItemStyle.BackColor = System.Drawing.Color.White;
		//	Datagrid1.AllowPaging = true;
			Datagrid1.PagerStyle.BackColor = System.Drawing.ColorTranslator.FromHtml("#f7f7f7");
			Datagrid1.PagerStyle.Mode = PagerMode.NumericPages;
			Datagrid1.PagerStyle.HorizontalAlign = HorizontalAlign.Center;
		//	Datagrid1.PagerStyle.PageButtonCount = 100;
			Datagrid1.PagerStyle.Font.Size = FontUnit.Large;
			Datagrid1.BorderStyle = BorderStyle.Solid;
			Datagrid1.BorderColor= System.Drawing.ColorTranslator.FromHtml("#CCCCCC");    //"#000066";
			Datagrid1.HeaderStyle.Height=20;
			Datagrid1.ItemStyle.Height=20;
			Datagrid1.ItemStyle.Font.Size=9;
		}
		public void SetGridStyle2(DataGrid Datagrid1)
		{
			Datagrid1.AutoGenerateColumns = false;
			Datagrid1.BorderWidth = Unit.Pixel(1);
			Datagrid1.Width = Unit.Percentage(100);
			Datagrid1.CellPadding = 0;
			Datagrid1.CellSpacing = 0;
			Datagrid1.BackColor = System.Drawing.ColorTranslator.FromHtml("#ededed");
			Datagrid1.HeaderStyle.HorizontalAlign = HorizontalAlign.Center;
			Datagrid1.HeaderStyle.Font.Bold = true;
			Datagrid1.HeaderStyle.Font.Size=10;
			Datagrid1.HeaderStyle.BackColor = System.Drawing.ColorTranslator.FromHtml("#f5f5f5");
			Datagrid1.ItemStyle.BackColor = System.Drawing.Color.White;
			//Datagrid1.AllowPaging = true;
			Datagrid1.PagerStyle.BackColor = System.Drawing.ColorTranslator.FromHtml("#f7f7f7");
			Datagrid1.PagerStyle.Mode = PagerMode.NumericPages;
			Datagrid1.PagerStyle.HorizontalAlign = HorizontalAlign.Center;
			//Datagrid1.PagerStyle.PageButtonCount = 100;
			Datagrid1.PagerStyle.Font.Size = FontUnit.Large;
			Datagrid1.BorderStyle = BorderStyle.Solid;
			Datagrid1.BorderColor= System.Drawing.ColorTranslator.FromHtml("#CCCCCC");    //"#000066";
			Datagrid1.HeaderStyle.Height=25;
			Datagrid1.ItemStyle.Height=25;
			Datagrid1.ItemStyle.Font.Size=10;
		}	
		public void SetGridStyle1(DataGrid Datagrid1)
		{
			Datagrid1.AutoGenerateColumns = false;
			Datagrid1.BorderWidth = Unit.Pixel(1);
			Datagrid1.Width = Unit.Percentage(100);
			Datagrid1.CellPadding = 0;
			Datagrid1.CellSpacing = 0;
//			Datagrid1.BackColor = System.Drawing.ColorTranslator.FromHtml("#ededed");
			Datagrid1.HeaderStyle.HorizontalAlign = HorizontalAlign.Center;
			//Datagrid1.HeaderStyle.Font.Bold = true;
			Datagrid1.HeaderStyle.Font.Size=10;
//			Datagrid1.HeaderStyle.BackColor = System.Drawing.ColorTranslator.FromHtml("#f5f5f5");
			Datagrid1.ItemStyle.BackColor = System.Drawing.Color.White;
			//Datagrid1.AllowPaging = true;
//			Datagrid1.PagerStyle.BackColor = System.Drawing.ColorTranslator.FromHtml("#f7f7f7");
			Datagrid1.PagerStyle.Mode = PagerMode.NumericPages;
			Datagrid1.PagerStyle.HorizontalAlign = HorizontalAlign.Center;
			Datagrid1.PagerStyle.PageButtonCount = 100;
			Datagrid1.PagerStyle.Font.Size = FontUnit.Large;
			Datagrid1.BorderStyle = BorderStyle.Solid;
//			Datagrid1.BorderColor= System.Drawing.ColorTranslator.FromHtml("#CCCCCC");    //"#000066";
			Datagrid1.HeaderStyle.Height=20;
			Datagrid1.ItemStyle.Height=20;
			Datagrid1.ItemStyle.Font.Size=9;
			Datagrid1.FooterStyle.Height=20;
		}
		public void SetGridStyle3(DataGrid Datagrid1)
		{
			Datagrid1.AutoGenerateColumns = false;
			Datagrid1.BorderWidth = Unit.Pixel(0);
			Datagrid1.Width = Unit.Percentage(100);
			Datagrid1.CellPadding = 0;
			Datagrid1.CellSpacing = 0;
			//			Datagrid1.BackColor = System.Drawing.ColorTranslator.FromHtml("#ededed");
			Datagrid1.HeaderStyle.HorizontalAlign = HorizontalAlign.Center;
			Datagrid1.HeaderStyle.Font.Bold = true;
			Datagrid1.HeaderStyle.Font.Size=12;
			//			Datagrid1.HeaderStyle.BackColor = System.Drawing.ColorTranslator.FromHtml("#f5f5f5");
			Datagrid1.ItemStyle.BackColor = System.Drawing.Color.White;
			//Datagrid1.AllowPaging = true;
			//			Datagrid1.PagerStyle.BackColor = System.Drawing.ColorTranslator.FromHtml("#f7f7f7");
			Datagrid1.PagerStyle.Mode = PagerMode.NumericPages;
			Datagrid1.PagerStyle.HorizontalAlign = HorizontalAlign.Center;
			Datagrid1.PagerStyle.PageButtonCount = 100;
			Datagrid1.PagerStyle.Font.Size = FontUnit.Large;
			Datagrid1.BorderStyle = BorderStyle.Solid;
			//			Datagrid1.BorderColor= System.Drawing.ColorTranslator.FromHtml("#CCCCCC");    //"#000066";
			Datagrid1.HeaderStyle.Height=30;
			Datagrid1.ItemStyle.Height=30;
			Datagrid1.ItemStyle.Font.Size=11;
			Datagrid1.FooterStyle.Height=30;
		}
		#region 获取某机构下属机构的字符串列表　机构一,机构二,机构三
		public void GetJgBunch(string parent,ref string output)
		{
			string ifend = "";
			SqlDataReader dr = DBBase.ExecuteSqlReader ("select ifend from cnc_jgglb where jgbh='" + parent + "'");
			dr.Read ();
			ifend = dr[0].ToString ();
			dr.Close ();
			if (ifend == "1")
			{
				output += parent;
				return;
			}
			DataSet ds = DBBase.ExecuteSql4Ds ("select jgbh,ifend from cnc_jgglb where parent1='" + parent + "'","cnc_jgglb");
			for (int i=0;i<ds.Tables[0].Rows.Count;i++)
			{
				output += ds.Tables[0].Rows[i][0].ToString ();
				output += ",";

				if (ds.Tables[0].Rows[i][1].ToString () != "1")
				{
					GetJgBunch(ds.Tables[0].Rows[i][0].ToString (),ref output);
				}
			}
			
		}

		public void GetJgBunchWithDot(string parent,ref string output)
		{
			string ifend = "";
			SqlDataReader dr = DBBase.ExecuteSqlReader ("select ifend from cnc_jgglb where jgbh='" + parent + "'");
			dr.Read ();
			ifend = dr[0].ToString ();
			dr.Close ();
			if (ifend == "1")
			{
				output += "'" + parent + "'";
				return;
			}
			DataSet ds = DBBase.ExecuteSql4Ds ("select jgbh,ifend from cnc_jgglb where parent1='" + parent + "'","cnc_jgglb");
			for (int i=0;i<ds.Tables[0].Rows.Count;i++)
			{
				if (ds.Tables[0].Rows[i][1].ToString () == "1")
				{
					output += "'" + ds.Tables[0].Rows[i][0].ToString () + "'";
					output += ",";
				}
				else
				{
					GetJgBunchWithDot(ds.Tables[0].Rows[i][0].ToString (),ref output);
				}
			}
		}
		#endregion
		/// <summary>
		/// 取得编码
		/// </summary>
		/// <param name="fieldname">字段名称</param>
		/// <param name="tablename">表名</param>
		/// <param name="zdybm">自定义编码</param>
		/// <param name="xhws">序列位数</param>
		/// <returns>编码</returns>
		public static string Getbm(string fieldname,string tablename,string zdybm,int xhws)//参数依次是字段名称、表名、自定义编码、序列位数.
		{
			int i;
			SqlDataReader dreader = DBBase.ExecuteSqlReader ("select max(substring("+fieldname+","+(zdybm.Length+1).ToString()+","+xhws+"))"+" from " +tablename+" where "+fieldname+" like '"+zdybm+"%'");
			string str="";
			if (dreader.Read())
			{
				if (dreader[0].ToString()!=null)
				{
					str=dreader[0].ToString();
					if (str.Trim().Equals(string.Empty))
						i = 0;
					else
						i =Convert.ToInt32(str);
					i++;
					int str1=i.ToString().Length;
					str="";
					for (int j=1;j<=(xhws-str1);j++)
					{
						str=str+"0";
					}
					str=str+i.ToString();
				}
				else
				{
					for (i=1;i<xhws;i++)
					{
						str=str+"0";
					}
					str=str+"1";
				}
			}

			dreader.Close();

			return zdybm + str;
		} 

		public void JudgePower (Page page,string roleid,string pagename)  //页面权限判断
		{
			string pageid = "";
			SqlDataReader dr = DBBase.ExecuteSqlReader ("select id from cnc_qxcdb where qxcd='" + pagename + "'");
			if (dr.HasRows)
			{
				dr.Read ();
				pageid = dr[0].ToString ();
				dr.Close ();
			}
			else
			{
				dr.Close ();
				return;
			}
			dr = DBBase.ExecuteSqlReader ("select ids,idname,ifpower from cnc_role_child where roleid=" + roleid + " and pageid=" + pageid);
			if (dr.HasRows)
			{
				while (dr.Read ())
				{
					Button tb = (Button) page.FindControl (dr["ids"].ToString ());
					if (dr["ifpower"].ToString () == "0")
						tb.Enabled = false;
				}
			}
			dr.Close ();
			

		}

	}
}