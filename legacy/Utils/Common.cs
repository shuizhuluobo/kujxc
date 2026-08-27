using System;
using System.Collections;
using System.ComponentModel;
using System.Data;
using System.Data.OleDb;
using System.Drawing;
using System.Web;
using System.Web.SessionState;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Web.UI.HtmlControls;
using System.IO;
using System.Configuration;

namespace jxc
{
	/// <summary>
	/// Common 的摘要说明。
	/// </summary>
	public class Common : System.Web.UI.Page
	{
		public char [] splitchar;
		public string ErrString;
		public Common()
		{
			splitchar = new char[2];
			splitchar[0] = '\r';
			splitchar[1] = '\n';
			ErrString = "";
		}
		
		public  bool chk_regname(string regname,DataSet setup)
		{
			string badstr = setup.Tables["oblog_setup"].Rows[0][51].ToString ();
			string [] array = badstr.Split (splitchar);
			for (int i=0;i<array.Length;i++)
			{
				if (array[i].Trim () != "")
				{
					if (regname.Trim () == array[i].Trim ())
						return true;
				}
			}
			return false;
		}
		public int chk_badword(string regname,DataSet setup)
		{
			int n = 0;
			string badstr = setup.Tables["oblog_setup"].Rows[0][50].ToString ();
			string [] array = badstr.Split (splitchar);
			for (int i=0;i<array.Length;i++)
			{
				if (array[i].Trim () != "")
				{
					if (regname.LastIndexOf (array[i].Trim ()) >= 0)
						n += 1;
				}
			}
			return n;
		}
		public void filt_badword(ref string str,DataSet setup)
		{
			string badstr = setup.Tables["oblog_setup"].Rows[0][50].ToString ();
			string [] array = badstr.Split (splitchar);
			for (int i=0;i<array.Length;i++)
			{
				if (array[i].Trim () != "")
					str = str.Replace(array[i].Trim (),"***");
			}
		}
		public void MakeErrString (string str,bool endflag)
		{
			ErrString += str;
			if (!endflag)
				ErrString += "_";
		}
		public bool chkdomain(string domain)
		{
			if (domain.Trim ().Length <= 0)
				return false;
			for (int i=0;i<domain.Length;i++)
			{
				char a = domain[i];
				string tmp = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_-";
				if (tmp.IndexOf (a) < 0)
					return false;
			}
			return true;
		}
		public bool ChkPost(System.Web.UI.Page page)
		{
			string server_v1 = "";
			string server_v2 = "";
			server_v1 = page.Request.ServerVariables["HTTP_REFERER"];
			server_v2 = page.Request.ServerVariables["SERVER_NAME"];
			if (server_v1.Substring (7,server_v2.Length) == server_v2)
				return true;
			else return false;

		}

		public bool ChkPost(System.Web.UI.UserControl page)
		{
			string server_v1 = "";
			string server_v2 = "";
			server_v1 = page.Request.ServerVariables["HTTP_REFERER"];
			server_v2 = page.Request.ServerVariables["SERVER_NAME"];
			if (server_v1.Substring (7,server_v2.Length) == server_v2)
				return true;
			else return false;
		}

		public bool chkiplock(DataSet setup)
		{
			string locklist = setup.Tables["oblog_setup"].Rows[0][52].ToString ().Trim ();
			if (locklist == "")
				return false;
			bool IPlock = false;
			IPlock = false;
			string [] StrUserIPs; string [] StrKillIPs;string [] locklists;
			string StrUserIP = "";

			locklists = locklist.Split(splitchar,2);

			StrUserIP = Request.UserHostAddress;

			if (StrUserIP =="" || StrUserIP == null)
				return false;

			StrUserIPs = StrUserIP.Split('.');

			if (StrUserIPs.Length != 4)
				return false;
			for (int i= 0 ;i < locklists.Length;i++)
			{
				string tmp = locklists[i];
				if (tmp.Trim () != "" && tmp != null)
				{
					StrKillIPs = tmp.Split ('.');
					if (StrKillIPs.Length != 4)
						return false;

					IPlock = true;
					if (StrUserIPs[0] != StrKillIPs[0])
						return false;
					if (StrUserIPs[1] != StrKillIPs[1])
						return false;
					if (StrUserIPs[2] != StrKillIPs[2])
						return false;
					if (StrUserIPs[3] != StrKillIPs[3]) 
						return false;
				}
			}
			return true;
		}

		public void showerr (System.Web.UI.UserControl page)
		{
			if (ErrString != "")
				page.Response.Redirect ("err.aspx?err=" + ErrString);
		}
		public void showerr (System.Web.UI.Page page)
		{
			if (ErrString != "")
				page.Response.Redirect ("err.aspx?err=" + ErrString);
		}

		public void BlogWriteFile (string filename,string content)
		{
			FileStream fso = new FileStream (filename,FileMode.Create);
			StreamWriter wr = new StreamWriter (fso,System.Text.Encoding.Default);
			//wr.Write (firstpage);
			
			HtmlTextWriter o = new HtmlTextWriter((TextWriter)wr);
			o.Write (content);
			o.Flush ();
			o.Close ();
			fso.Close ();
			wr = null;
			fso = null;
		}
		public void SaveCookie(string username,string password,string CookieDate,string userurl,System.Web.UI.Page page)
		{
			page.Response.Cookies[page.Application["cookies_name"].ToString ()].Domain = page.Application["cookies_domain"].ToString ();
			page.Response.Cookies[page.Application["cookies_name"].ToString ()]["username"]=CodeCookie(username,page);
			page.Response.Cookies[page.Application["cookies_name"].ToString ()]["password"] = CodeCookie(password,page);
			if (userurl=="" || userurl==".")
				userurl=" ";
			page.Response.Cookies[page.Application["cookies_name"].ToString ()]["userurl"] = CodeCookie(userurl,page);
		
			if (CookieDate == "1")		
				page.Response.Cookies[page.Application["cookies_name"].ToString ()].Expires = System.DateTime.Now.AddDays (1);
			if (CookieDate == "2")
				page.Response.Cookies[page.Application["cookies_name"].ToString ()].Expires = System.DateTime.Now.AddDays (31);
			if (CookieDate == "3")
				page.Response.Cookies[page.Application["cookies_name"].ToString ()].Expires = System.DateTime.Now.AddDays (31);
		}

		public string filt_badstr(string str)
		{
			if (str == null)
				return "";
			else
			{
				string tmp = str.Replace('\0',' ');
				string tmp2 = tmp.Trim (' ');
				return tmp2.Replace ("'","''");
			}
									   
		}

		public bool IsNum(String str) 
		{ 
			for(int i=0;i<str.Length;i++) 
			{ 
				if(str[i]<'0' || str[i]>'9') 
					return false; 
			} 
			return true; 
		} 

		public string CodeCookie(string str,System.Web.UI.UserControl page)
		{
			string StrRtn = "";
			if (page.Application["is_password_cookies"].ToString () == "1")
			{
				for (int i=str.Length;i>=0;i--)
				{
					StrRtn = StrRtn + str.Substring (i,1);
					if (i != 0)
						StrRtn = StrRtn + "a";
				}
				return StrRtn;
			}
			else
				return str;
		}
		public string CodeCookie(string str,System.Web.UI.Page page)
		{
			string StrRtn = "";
			if (page.Application["is_password_cookies"].ToString () == "1")
			{
				for (int i=str.Length;i>=0;i--)
				{
					StrRtn = StrRtn + str.Substring (i,1);
					if (i != 0)
						StrRtn = StrRtn + "a";
				}
				return StrRtn;
			}
			else
				return str;
		}

		public string  DecodeCookie(string Str,System.Web.UI.UserControl page)
		{
			if (page.Application["is_password_cookies"].ToString () == "1")
			{
				string [] StrArr;
				string StrRtn = "";
				StrArr = Str.Split ('a');
				for (int i=0;i< StrArr.Length;i++)
				{
					if (IsNum(StrArr[i]))
						StrRtn = StrRtn + StrArr[i];
					else
						return Str;
				}
				return StrRtn;
			}
			else
				return Str;
		}
		public string  DecodeCookie(string Str,System.Web.UI.Page page)
		{
			if (page.Application["is_password_cookies"].ToString () == "1")
			{
				string [] StrArr;
				string StrRtn = "";
				StrArr = Str.Split ('a');
				for (int i=0;i< StrArr.Length;i++)
				{
					if (IsNum(StrArr[i]))
						StrRtn = StrRtn + StrArr[i];
					else
						return Str;
				}
				return StrRtn;
			}
			else
				return Str;
		}

		//检查验证码是否正确
		public bool codepass()
		{
			string CodeStr;
			CodeStr = Request["CodeStr"];
			if (CodeStr == "" || CodeStr == null)
			{
				Session["GetCode"] = "";
				return false;
			}
			if (Session["GetCode"].ToString () == CodeStr)
			{
				Session["GetCode"] = "";
				return true;
			}
			else
			{
				Session["GetCode"] = "";
				return false;
			}
		}

		public string filt_html (string str)
		{
		
			if (str == "")  return str;
			str = str.Replace(">", "&gt;");
			str = str.Replace("<", "&lt;");
		//	str = str.Replace(CHR(32), "&nbsp;");
		//	str = str.Replace(CHR(9), "&nbsp;");
		//	str = str.Replace(CHR(34), "&quot;");
		//	str = str.Replace(CHR(39), "&#39;");
		//	str = str.Replace(CHR(13), "");
		//	str = str.Replace(CHR(10) + CHR(10), "&nbsp; ");
		//	str = str.Replace(CHR(10), "&nbsp; ");
			return str;
		}
		public bool chknumeric(string str)
		{
			if (str.Trim ().Length <= 0)
				return false;
			for (int i=0;i<str.Length;i++)
			{
				char a = str[i];
				string tmp = "0123456789";
				if (tmp.IndexOf (a) < 0)
					return false;
			}
			return true;
		}

		public bool IsNumAndDot (String str) 
		{ 
			for(int i=0;i<str.Length;i++) 
			{ 
				if(str[i]<'0' || str[i]>'9')
				{
					if (str[i] != '.')
						return false; 
				}
			} 
			return true; 
		} 
	}
}
