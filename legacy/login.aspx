<%@ Register TagPrefix="uc1" TagName="commlogon" Src="ascx/commlogon.ascx" %>
<%@ Page language="c#" Codebehind="login.aspx.cs" AutoEventWireup="false" Inherits="jxc.login" %>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN" >
<HTML>
	<HEAD>
		<title>登录主页面</title>
		<meta name="GENERATOR" Content="Microsoft Visual Studio .NET 7.1">
		<meta name="CODE_LANGUAGE" Content="C#">
		<meta name="vs_defaultClientScript" content="JavaScript">
		<meta name="vs_targetSchema" content="http://schemas.microsoft.com/intellisense/ie5">
		<link href="../css/style.css" rel="stylesheet" type="text/css">
	</HEAD>
	<body MS_POSITIONING="GridLayout">
		<form id="Form1" method="post" runat="server">
			<FONT face="宋体"></FONT><FONT face="宋体"></FONT><FONT face="宋体"></FONT><FONT face="宋体">
			</FONT><FONT face="宋体"></FONT><FONT face="宋体"></FONT><FONT face="宋体"></FONT><FONT face="宋体">
			</FONT><FONT face="宋体"></FONT><FONT face="宋体"></FONT><FONT face="宋体"></FONT><FONT face="宋体">
			</FONT><FONT face="宋体"></FONT><FONT face="宋体"></FONT>
			<br>
			<br>
			<TABLE id="Table1" align="center" cellSpacing="0" cellPadding="0" width="604" height="220"
				border="0" background="/images/logo.jpg">
				<tr height="220">
					<td><FONT face="宋体"></FONT></td>
				</tr>
				<TR>
					<TD align="left">
						<uc1:commlogon id="Commlogon1" runat="server"></uc1:commlogon>
					</TD>
				</TR>
			</TABLE>
		</form>
	</body>
</HTML>
