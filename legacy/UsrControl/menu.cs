using System;
using System.Data;
using System.Data.SqlClient;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.ComponentModel;

namespace jxc
{
	/// <summary>
	/// menu 的摘要说明。
	/// </summary>
	[DefaultProperty("Text"), 
		ToolboxData("<{0}:menu runat=server></{0}:menu>")]
	public class menu : System.Web.UI.WebControls.WebControl
	{
		/// <summary> 
		/// 将此控件呈现给指定的输出参数。
		/// </summary>
		/// <param name="output"> 要写出到的 HTML 编写器 </param>
		protected override void Render(HtmlTextWriter output)
		{
			string direction = "<TABLE id=\"Table1\" cellSpacing=\"0\" cellPadding=\"0\" width=543 border=\"0\" class=\"title3\" ><tr><td align=center valign=middle background=zhu/3.jpg height=33>";
			
			direction += "<TABLE id=\"Table1\" cellSpacing=\"0\" cellPadding=\"0\" width=100% align=center border=\"0\" class=\"title3\" ><tr><td align=center>";
			direction += "<a href=" + "index.aspx><font color=white>首页</font></a></td>";
			direction += "<td><img src=zhu/3-.jpg height=33 width=5/></td>";
			string cmd = "select id,des,ifend from cnc_info where rank=0 order by sortid asc"; 
			DataSet ds = DBBase.ExecuteSql4Ds (cmd,"menu");
			for (int i=0;i<ds.Tables[0].Rows.Count;i++)
			{
				direction += "<td align=center><a href=machine.aspx?id=" + ds.Tables[0].Rows[i]["id"].ToString () + "&ifend=" + ds.Tables[0].Rows[i]["ifend"].ToString () + "&des=" + ds.Tables[0].Rows[i]["des"].ToString () + "><font color=white>" + ds.Tables[0].Rows[i]["des"].ToString () + "</font></a></td>";
				//if (i != ds.Tables[0].Rows.Count - 1)
					direction += "<td><img src=zhu/3-.jpg border=0 height=33/></td>";
			}

			direction += "<td align=center><a href=listzxtall.aspx?des=咨询问答 target=_blank><font color=white>咨询问答</font></a></td>";
			//direction += "<td><img src=zhu/3-.jpg height=33 width=5/></td>";
		
			direction += "</tr></table>";
			direction += "</td></tr></table>";
			output.Write(direction);
		}
	}
}
