<%@ Page language="c#" Codebehind="SmallClass_add.aspx.cs" AutoEventWireup="false" Inherits="CNC.admin.bases.SmallClass_add" %>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN" >
<HTML>
	<HEAD>
		<title>业务大类增加</title>
		<meta name="GENERATOR" Content="Microsoft Visual Studio .NET 7.1">
		<meta name="CODE_LANGUAGE" Content="C#">
		<meta name="vs_defaultClientScript" content="JavaScript">
		<meta name="vs_targetSchema" content="http://schemas.microsoft.com/intellisense/ie5">
		<link href="/css/BasicLayout.css" rel="stylesheet" type="text/css">
		<script language="JavaScript" src="/js/calendar.js"></script>
		<script language="javascript">
		function closes()
		{
			opener.location.href=opener.location.href;
			opener = null;
			window.close ();
		}
		
		</script>
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
								<td><font face="隶书" size="5">业务小类设置</font></td>
							</tr>
						</table>
					</td>
					<td width="250"></td>
				</tr>
			</table>
			<br>
			<table cellpadding="0" cellspacing="5" border="0" width="100%" class="title3">
				<tr>
					<td width="80" style="WIDTH: 80px" align="right">
						大类编号
					</td>
					<td>
						<asp:textbox id="big" Enabled="False" runat="server" Width="80" CssClass="inputcss" onfocus="calendar()"></asp:textbox>
					</td>
				</tr>
				<tr>
					<td width="80" style="WIDTH: 80px" align="right">
						小类编号
					</td>
					<td>
						<asp:textbox id="small" runat="server" CssClass="inputcss" Width="80" onfocus="calendar()" Enabled="False"></asp:textbox>
					</td>
				</tr>
				<tr>
					<td align="right" width="80">
						业务名称
					</td>
					<td>
						<asp:TextBox id="name" runat="server" CssClass="inputcss" Width="344px"></asp:TextBox></td>
				</tr>
			</table>
			<table cellpadding="0" cellspacing="0" border="0" width="100%">
				<tr>
					<td align="center">
						<asp:Button id="save" runat="server" Width="62px" Text="保存" CssClass="buttoncss"></asp:Button>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<INPUT type="button" value="返回" class="buttoncss" onclick="closes()" style="WIDTH: 64px; HEIGHT: 20px">
					</td>
				</tr>
			</table>
		</form>
	</body>
</HTML>
