<%@ Page language="c#" Codebehind="Reset_Pwd.aspx.cs" AutoEventWireup="false" Inherits="health.admin.member.Reset_Pwd" %>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN" >
<HTML>
	<HEAD>
		<title>重置口令</title>
		<meta name="GENERATOR" Content="Microsoft Visual Studio .NET 7.1">
		<meta name="CODE_LANGUAGE" Content="C#">
		<meta name="vs_defaultClientScript" content="JavaScript">
		<meta name="vs_targetSchema" content="http://schemas.microsoft.com/intellisense/ie5">
		<link href="/css/style.css" rel="stylesheet" type="text/css">
	</HEAD>
	<body MS_POSITIONING="GridLayout">
		<form id="Form1" method="post" runat="server">
			<table cellpadding="0" cellspacing="0" border="0" width="100%" height="50" align="center">
				<tr>
					<td width="556" background="/image/title.gif">
						<table cellpadding="0" cellspacing="0" border="0" width="100%">
							<tr>
								<td height="1"></td>
							</tr>
							<tr>
								<td width="80"></td>
								<td><font face="隶书" size="5">修改口令</font></td>
							</tr>
						</table>
					</td>
					<td width="250"></td>
				</tr>
			</table>
			<br>
			<br>
			<br>
			<table cellpadding="0" cellspacing="0" border="0" width="500" align="center">
				<tr>
					<td width="90" align="center">会员类型</td>
					<td align="left">
						<asp:RadioButtonList id="RadioButtonList1" runat="server" Width="136px">
							<asp:ListItem Value="0" Selected="True">单位用户</asp:ListItem>
							<asp:ListItem Value="1">个人用户</asp:ListItem>
						</asp:RadioButtonList></td>
				</tr>
				<tr>
					<td width="90" align="center">会员号</td>
					<td align="left">
						<asp:TextBox id="mem" runat="server"></asp:TextBox></td>
				</tr>
				<tr>
					<td width="90" align="center">密码</td>
					<td align="left">
						<asp:TextBox id="pwd" runat="server">000000</asp:TextBox></td>
				</tr>
				<tr>
					<td colspan="2" align="center">
						<asp:Button id="Button1" runat="server" Text="重置口令"></asp:Button></td>
				</tr>
			</table>
		</form>
	</body>
</HTML>
