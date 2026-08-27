<%@ Page language="c#" Codebehind="spr_view_judge.aspx.cs" AutoEventWireup="false" Inherits="jxc.admin.spr_view_judge" %>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN" >
<HTML>
	<HEAD>
		<title>审批过程查看</title>
		<meta name="GENERATOR" Content="Microsoft Visual Studio .NET 7.1">
		<meta name="CODE_LANGUAGE" Content="C#">
		<meta name="vs_defaultClientScript" content="JavaScript">
		<meta name="vs_targetSchema" content="http://schemas.microsoft.com/intellisense/ie5">
		<link href="/css/BasicLayout.css" rel="stylesheet" type="text/css">
	</HEAD>
	<body MS_POSITIONING="GridLayout">
		<form id="Form1" method="post" runat="server">
			<table cellpadding="0" cellspacing="0" border="0" width="100%" height="50" align="center">
				<tr>
					<td width="556" background="/image/title.gif">
						<table cellpadding="0" cellspacing="0" border="0" width="100%" class="title3">
							<tr>
								<td height="1"></td>
							</tr>
							<tr>
								<td width="80"></td>
								<td><font face="隶书" size="5">审批过程详细细节</font></td>
							</tr>
						</table>
					</td>
					<td width="250" align="center"><a href="#" onclick="window.close();">关闭窗口</a></td>
				</tr>
			</table>
			<table cellpadding="0" cellspacing="4" border="0" width="100%" class="title3">
				<tr>
					<td width="70">日期</td>
					<td>
						<asp:Label id="fbsj" runat="server"></asp:Label></td>
				</tr>
				<tr>
					<td width="70">主题</td>
					<td>
						<asp:Label id="bt" runat="server"></asp:Label></td>
				</tr>
				<tr>
					<td width="70">语音</td>
					<td>
						<div id="yy" runat="server"></div>
					</td>
				</tr>
				<tr>
				<tr>
					<td width="70">正文</td>
					<td>
						<asp:Label id="nr" runat="server">Label</asp:Label>
					</td>
				</tr>
				<tr>
					<td colspan="2" bgcolor="#cccccc" height="20" class="title3">以下是详细审批过程
					</td>
				</tr>
				<tr>
					<td colspan="2">
						<div id="splb" runat="server" class="title3"></div>
					</td>
				</tr>
			</table>
		</form>
	</body>
</HTML>
                                
                                 
