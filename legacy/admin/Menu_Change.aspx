<%@ Page language="c#" Codebehind="Menu_Change.aspx.cs" AutoEventWireup="false" Inherits="jxc.admin.Menu_Change" %>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN" >
<HTML>
	<HEAD>
		<title>菜单增加</title>
		<meta name="GENERATOR" Content="Microsoft Visual Studio .NET 7.1">
		<meta name="CODE_LANGUAGE" Content="C#">
		<meta name="vs_defaultClientScript" content="JavaScript">
		<meta name="vs_targetSchema" content="http://schemas.microsoft.com/intellisense/ie5">
		<link href="/css/BasicLayout.css" rel="stylesheet" type="text/css">
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
								<td><font face="隶书" size="5">菜单管理</font></td>
							</tr>
						</table>
					</td>
					<td width="250"></td>
				</tr>
			</table>
			<br>
			<table cellpadding="0" cellspacing="5" border="0" width="100%" class="title3">
				<tr>
					<td align="right" width="100">
						描述
					</td>
					<td>
						<asp:TextBox id="des" runat="server" Width="264px" CssClass="inputcss"></asp:TextBox></td>
				</tr>
				<tr>
					<td align="right" width="100" style="HEIGHT: 3px">
						父编号
					</td>
					<td style="HEIGHT: 3px">
						<asp:TextBox id="parentid" runat="server" Width="56px" CssClass="inputcss" Enabled="False"></asp:TextBox></td>
				</tr>
				<tr>
					<td align="right" width="100">
						级别
					</td>
					<td>
						<asp:TextBox id="rank" runat="server" Width="56px" CssClass="inputcss" Enabled="False"></asp:TextBox></td>
				</tr>
				<tr>
					<td align="right" width="100">
						菜单
					</td>
					<td>
						<asp:TextBox id="qxcd" runat="server" Width="264px" CssClass="inputcss"></asp:TextBox></td>
				</tr>
				<tr>
					<td align="right" width="100">
						图标路径
					</td>
					<td>
						<asp:TextBox id="imgpath" runat="server" Width="216px" CssClass="inputcss"></asp:TextBox></td>
				</tr>
			</table>
			<table cellpadding="0" cellspacing="0" border="0" width="100%">
				<tr>
					<td align="center">
						<asp:Button id="save" runat="server" Width="62px" Text="保存" CssClass="buttoncss"></asp:Button>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<INPUT type="button" value="返回" class="buttoncss" onclick="window.close()" style="WIDTH: 64px; HEIGHT: 20px">
					</td>
				</tr>
			</table>
		</form>
	</body>
</HTML>
                                
                                 
