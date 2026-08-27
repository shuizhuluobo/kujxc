<%@ Page language="c#" Codebehind="gly_changepwd.aspx.cs" AutoEventWireup="false" Inherits="jxc.admin.gly_changepwd" %>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN" >
<HTML>
	<HEAD>
		<title>修改操作员密码</title>
		<meta name="GENERATOR" Content="Microsoft Visual Studio .NET 7.1">
		<meta name="CODE_LANGUAGE" Content="C#">
		<meta name="vs_defaultClientScript" content="JavaScript">
		<meta name="vs_targetSchema" content="http://schemas.microsoft.com/intellisense/ie5">
		<link href="../../css/style.css" rel="stylesheet" type="text/css">
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
			<table cellpadding="0" cellspacing="4" border="0" width="80%" align="center">
				<tr>
					<td width="40"></td>
					<td width="80">管理员代号</td>
					<td>
						<asp:TextBox id="tglydh" runat="server" Width="152px" CssClass="inputcss" Enabled="False" ReadOnly="True"></asp:TextBox>
					</td>
				</tr>
				<tr>
					<td width="40"></td>
					<td>原密码</td>
					<td>
						<asp:TextBox id="ymm" runat="server" CssClass="inputcss" TextMode="Password"></asp:TextBox></td>
				</tr>
				<tr>
					<td width="40"></td>
					<td>新密码</td>
					<td>
						<asp:TextBox id="pwd1" runat="server" CssClass="inputcss" TextMode="Password"></asp:TextBox></td>
				</tr>
				<tr>
					<td width="40"></td>
					<td>确认新密码</td>
					<td>
						<asp:TextBox id="pwd2" runat="server" CssClass="inputcss" TextMode="Password"></asp:TextBox></td>
				</tr>
				<tr>
					<td width="40"></td>
					<td></td>
					<td>
						<asp:Button id="Button1" runat="server" Width="64px" Text="提交" CssClass="buttoncss"></asp:Button>
					</td>
				</tr>
			</table>
		</form>
	</body>
</HTML>
