<%@ Page language="c#" Codebehind="change_pwd.aspx.cs" AutoEventWireup="false" Inherits="health.front.change_pwd" %>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN" >
<HTML>
	<HEAD>
		<title>mem_login</title>
		<meta name="GENERATOR" Content="Microsoft Visual Studio .NET 7.1">
		<meta name="CODE_LANGUAGE" Content="C#">
		<meta name="vs_defaultClientScript" content="JavaScript">
		<meta name="vs_targetSchema" content="http://schemas.microsoft.com/intellisense/ie5">
		<LINK href="images/style.css" type="text/css" rel="stylesheet">
		<LINK href="/css/BasicLayout.css" type="text/css" rel="stylesheet">
		<style type="text/css">.style1 { FONT-SIZE: 1.2em; COLOR: #660033 }
	.style10 { FONT-SIZE: 1.6em; COLOR: #660000; FONT-FAMILY: "黑体" }
	.style12 { FONT-SIZE: 12px; COLOR: #000000 }
	.style14 { COLOR: #ff9148 }
	.style15 { COLOR: #ff00ff }
		</style>
	</HEAD>
	<body MS_POSITIONING="GridLayout">
		<form id="Form1" method="post" runat="server">
			<table cellpadding="0" cellspacing="0" border="0" width="600" align="center">
				<tr>
					<td height="20" class="title3">当前位置：用户修改个人口令</td>
				</tr>
				<tr>
					<td height="1" bgcolor="black"></td>
				</tr>
				<tr>
					<td height="10"></td>
				</tr>
				<tr>
					<td>
						<table cellpadding="0" cellspacing="4" border="0" width="80%" align="center" class="title3">
							<tr>
								<td width="40"></td>
								<td width="80">会员号</td>
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
					</td>
				</tr>
			</table>
		</form>
	</body>
</HTML>
