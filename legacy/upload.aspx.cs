using System;
using System.Collections;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Web;
using System.Web.SessionState;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Web.UI.HtmlControls;
using System.IO;

namespace jxc
{
	/// <summary>
	/// upload 的摘要说明。
	/// </summary>
	public class upload : System.Web.UI.Page
	{
		protected System.Web.UI.WebControls.Button Button1;
		protected System.Web.UI.HtmlControls.HtmlInputFile upload_file;
		protected System.Web.UI.HtmlControls.HtmlGenericControl Info;
	
		private void Page_Load(object sender, System.EventArgs e)
		{
			// 在此处放置用户代码以初始化页面
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
			this.Button1.Click += new System.EventHandler(this.Button1_Click);
			this.Load += new System.EventHandler(this.Page_Load);

		}
		#endregion

		private void Button1_Click(object sender, System.EventArgs e)
		{
			string fileEXT="";
			int errorno=0;
			if(upload_file.PostedFile==null || upload_file.PostedFile.FileName.Length<3)
			{
				Info.InnerHtml="请先选择一个文件再点上传。";
				errorno=1;
			}
			else
			{
				fileEXT=upload_file.PostedFile.FileName.Substring(upload_file.PostedFile.FileName.Length-3).ToLower();
				if(fileEXT!="gif" && fileEXT!="jpg" && fileEXT!="zip" && fileEXT!="rar" && fileEXT!="doc" && fileEXT!="xls" && fileEXT!="bmp" && fileEXT!="swf" )
				{
					Info.InnerHtml="只接受 jpg,gif,zip,rar,doc,xls,bmp,swf 格式。";
					errorno=1;
				}
				else if(upload_file.PostedFile.ContentLength==0)
				{
					Info.InnerHtml="请先选择一个文件再点上传。";
					errorno=1;
				}
				else if((fileEXT=="gif" || fileEXT=="jpg") && upload_file.PostedFile.ContentLength>600000)
				{
					/*
					Info.InnerHtml="图片大小超过600K,请改变文件大小后重试。";
					errorno=1;
					*/
				}
			}
			if(errorno==0)
			{
				string path=Server.MapPath("/UpImage");
				//string filename=System.Guid.NewGuid ().ToString ();
				string sname=upload_file.PostedFile.FileName;
				char chra='\\';

				string filename = "";
				filename = filename+upload_file.PostedFile.FileName.Substring(sname.LastIndexOf(chra)+1);
				string FN = "/UpImage/"+filename;
			//	string fn1=filename;
			//	string fn2="UpImage/"+filename;
				filename = path+"/"+filename;
				if (File.Exists(filename))
				{
					Info.InnerHtml="服务器上同名文件<a href="+ FN +" target=_blank>"+ sname +"</a>已存在，请换名后重新上传。";
					return;
				}
				upload_file.PostedFile.SaveAs(filename);

				Response.Write("<"+"script>parent.Post.sBody.value='"+FN+"'</"+"script>");
				/*
				if (fileEXT=="gif")
				{
					Response.Write("<"+"script>parent.Post.sBody.value+='[gif]"+FN+"[/gif]'</"+"script>");
				}
				else if(fileEXT=="jpg")
				{
					Response.Write("<"+"script>parent.Post.sBody.value+='[jpg]"+FN+"[/jpg]'</"+"script>");

				}
					
				else if(fileEXT=="zip")
				{
					Response.Write("<"+"script>parent.Post.sBody.value+='[zip]"+FN+"[/zip]'</"+"script>");
				} 
				
				else if(fileEXT=="rar" || fileEXT=="doc" || fileEXT=="xls" || fileEXT=="zip")
				{
					Response.Write("<"+"script>parent.Post.sBody.value+='[url="+FN + "]" +"[/url]'</"+"script>");
				}
				*/
				
				Info.InnerHtml="已成功上传一个文件：<a href="+ FN +" target=_blank>"+ sname +"</a>";
				Info.Visible=true;
			}
			else
			{
				Info.Visible=true;
			}
		}
	}
}
