<%@ Page language="c#" Codebehind="dw_pj.aspx.cs" AutoEventWireup="false" Inherits="health.admin.member.dw_pj" %>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN" >
<HTML>
	<HEAD>
		<title>center_pj</title>
		<meta content="Microsoft Visual Studio .NET 7.1" name="GENERATOR">
		<meta content="C#" name="CODE_LANGUAGE">
		<meta content="JavaScript" name="vs_defaultClientScript">
		<meta content="http://schemas.microsoft.com/intellisense/ie5" name="vs_targetSchema">
		<LINK href="/css/BasicLayout.css" type="text/css" rel="stylesheet">
	</HEAD>
	<body MS_POSITIONING="GridLayout">
		<form id="Form1" method="post" runat="server">
			<table class="title3" cellSpacing="0" cellPadding="0" width="100%" border="0">
				<TR>
					<TD align="left">
						性&nbsp;&nbsp; 别：
						<asp:radiobutton id="xb1" runat="server" GroupName="xb" Text="男"></asp:radiobutton><asp:radiobutton id="xb2" runat="server" GroupName="xb" Text="女"></asp:radiobutton>&nbsp;</TD>
				</TR>
				<TR>
					<TD align="left"><FONT face="宋体">学&nbsp;&nbsp; 历：
							<asp:radiobutton id="xl1" runat="server" GroupName="xl" Text="小学"></asp:radiobutton><asp:radiobutton id="xl2" runat="server" GroupName="xl" Text="初中"></asp:radiobutton><asp:radiobutton id="xl3" runat="server" GroupName="xl" Text="高中"></asp:radiobutton><asp:radiobutton id="xl4" runat="server" GroupName="xl" Text="专科"></asp:radiobutton><asp:radiobutton id="xl5" runat="server" GroupName="xl" Text="本科"></asp:radiobutton><asp:radiobutton id="xl6" runat="server" GroupName="xl" Text="研究生"></asp:radiobutton><asp:radiobutton id="xl7" runat="server" GroupName="xl" Text="其他"></asp:radiobutton>&nbsp;&nbsp;&nbsp; 
							年龄组：
							<asp:radiobutton id="nlz1" runat="server" GroupName="nlz" Text="成年A组"></asp:radiobutton><asp:radiobutton id="nlz2" runat="server" GroupName="nlz" Text="成年B组"></asp:radiobutton><asp:radiobutton id="nlz3" runat="server" GroupName="nlz" Text="老年组"></asp:radiobutton></FONT></TD>
				</TR>
				<TR>
					<TD align="left"><FONT face="宋体">成年组年龄段：
							<asp:radiobutton id="nld1" runat="server" GroupName="nld" Text="20～24"></asp:radiobutton><asp:radiobutton id="nld2" runat="server" GroupName="nld" Text="25～29"></asp:radiobutton><asp:radiobutton id="nld3" runat="server" GroupName="nld" Text="30～34"></asp:radiobutton><asp:radiobutton id="nld4" runat="server" GroupName="nld" Text="35～39"></asp:radiobutton><asp:radiobutton id="nld5" runat="server" GroupName="nld" Text="40～44"></asp:radiobutton><asp:radiobutton id="nld6" runat="server" GroupName="nld" Text="45～49"></asp:radiobutton><asp:radiobutton id="nld7" runat="server" GroupName="nld" Text="50～54"></asp:radiobutton><asp:radiobutton id="nld8" runat="server" GroupName="nld" Text="55～59"></asp:radiobutton>&nbsp;&nbsp;</FONT></TD>
				</TR>
				<tr>
					<td align="center"><asp:button id="query" runat="server" Width="80px" CssClass="buttoncss" Text="查询"></asp:button>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
						<asp:button id="reset" runat="server" Width="80px" CssClass="buttoncss" Text="清空查询条件"></asp:button></td>
				</tr>
			</table>
			<table cellSpacing="0" cellPadding="0" width="100%" border="0">
				<tr>
					<td>
						<div id="outvalue" runat="server"></div>
					</td>
				</tr>
			</table>
		</form>
	</body>
</HTML>
