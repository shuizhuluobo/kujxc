<%@ Register TagPrefix="uc1" TagName="qlogon" Src="ascx/qlogon.ascx" %>
<%@ Register TagPrefix="uc1" TagName="footer" Src="ascx/footer.ascx" %>
<%@ Page language="c#" Codebehind="two.aspx.cs" AutoEventWireup="false" Inherits="health.two" %>
<%@ Register TagPrefix="uc1" TagName="menus" Src="ascx/menus.ascx" %>
<%@ Register TagPrefix="uc1" TagName="main_menu" Src="ascx/main_menu.ascx" %>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN" >
<HTML>
	<HEAD>
		<title><%=name%></title>
		<meta name="GENERATOR" Content="Microsoft Visual Studio .NET 7.1">
		<meta name="CODE_LANGUAGE" Content="C#">
		<meta name="vs_defaultClientScript" content="JavaScript">
		<meta name="vs_targetSchema" content="http://schemas.microsoft.com/intellisense/ie5">
		<link href="../css/sakura.css" rel="stylesheet" type="text/css">
	</HEAD>
	<body MS_POSITIONING="GridLayout">
		<form id="Form1" method="post" runat="server">
			<table cellSpacing="0" cellPadding="0" width="770" align="center" border="0">
				<tr>
					<td vAlign="top" width="185" height="600" background="zhu/back.jpg">
						<table cellSpacing="0" cellPadding="0" width="100%" border="0">
							<tr>
								<td><IMG src="zhu/1.jpg" border="0"></td>
							</tr>
						</table>
						<table cellpadding="0" cellspacing="0" border="0" width="100%">
							<tr>
								<td background="zhu/menu.gif" height="28" align="center">
									<font color="white"><b>
											<%=des%>
										</b></font>
								</td>
							</tr>
							<tr>
								<td>
									<uc1:main_menu id="Main_menu1" runat="server"></uc1:main_menu>
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
								<td background="zhu/intro.jpg" height="103" valign=top>
									<table cellpadding="0" cellspacing="0" border="0" width="100%">
										<tr>
											<td height="30"></td>
										</tr>
										<tr>
											<td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
											&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
											<font color=white><b><%=name%></b></font></td>
										</tr>
									</table>
								</td>
							</tr>
							<tr>
								<td bgcolor="black" height="1">
								</td>
							</tr>
							<tr>
								<td>
									<asp:Panel id="Panel1" runat="server"></asp:Panel></td>
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
