<%@ Page language="c#" Codebehind="details.aspx.cs" AutoEventWireup="false" Inherits="health.front.details" %>
<%@ Register TagPrefix="uc1" TagName="footer" Src="ascx/footer.ascx" %>
<%@ Register TagPrefix="uc1" TagName="listmenu" Src="ascx/listmenu.ascx" %>
<%@ Register TagPrefix="uc1" TagName="menus" Src="ascx/menus.ascx" %>
<%@ Register TagPrefix="uc1" TagName="listnewsall" Src="ascx/listnewsall.ascx" %>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN" >
<HTML>
	<HEAD>
		<title><%=bt%></title>
		<meta name="GENERATOR" Content="Microsoft Visual Studio .NET 7.1">
		<meta name="CODE_LANGUAGE" Content="C#">
		<meta name="vs_defaultClientScript" content="JavaScript">
		<meta name="vs_targetSchema" content="http://schemas.microsoft.com/intellisense/ie5">
		<link href="../css/sakura.css" rel="stylesheet" type="text/css">
		<meta http-equiv="Content-Type" content="text/html; charset=gb2312">
		<style type="text/css"> .style1 { COLOR: #cc3300 } BODY { BACKGROUND-IMAGE: none } </style>
	</HEAD>
	<body MS_POSITIONING="GridLayout">
		<form id="Form1" method="post" runat="server">
			<table cellSpacing="0" cellPadding="0" width="770" align="center" border="0">
				<tr>
					<td vAlign="top" width="185" height="249">
						<table cellSpacing="0" cellPadding="0" width="100%" border="0">
							<tr>
								<td><IMG src="zhu/1.jpg" border="0"></td>
							</tr>
						</table>
						<table cellpadding="0" cellspacing="0" border="0" width="100%">
							<tr>
								<td>
									<P>&nbsp;相关信息</P>
									<P>
										<uc1:listmenu id="Listmenu1" runat="server"></uc1:listmenu></P>
								</td>
							</tr>
						</table>
					</td>
					<td vAlign="top" width="543">
						<table cellSpacing="0" cellPadding="0" width="100%" border="0">
							<tr>
								<td><IMG src="zhu/2.jpg" border="0"></td>
							</tr>
						</table>
						<table cellSpacing="0" cellPadding="0" width="100%" border="0">
							<tr>
								<td><uc1:menus id="Menus2" runat="server"></uc1:menus></td>
							</tr>
						</table>
						<table cellSpacing="0" cellPadding="0" width="100%" border="0">
							<tr>
								<td height="5"></td>
							</tr>
						</table>
						<table width="100%" border="0" cellspacing="0" cellpadding="0">
							<tr>
								<td height="10"></td>
							</tr>
							<tr>
								<td>
									<span class="style1">您的位置：</span> <a href="index.aspx">首页</a> &gt;&gt;
									<%=des%>
									&gt;&gt;<%=name%>
									<hr size="1" color="#ff5f55">
								</td>
							</tr>
							<tr>
								<td align="center" style="FONT-SIZE: 18pt"><%=bt%></td>
							</tr>
							<tr>
								<td height="10"></td>
							</tr>
							<tr>
								<td style="LINE-HEIGHT:24px"><%=nr%></td>
							</tr>
						</table>
					</td>
					<td width="42" valign="top">
						<table cellpadding="0" cellspacing="0" border="0" width="100%">
							<tr>
								<td><img src="zhu/4.jpg"></td>
							</tr>
						</table>
					</td>
				</tr>
			</table>
			<uc1:footer id="Footer1" runat="server"></uc1:footer>
		</form>
	</body>
</HTML>
