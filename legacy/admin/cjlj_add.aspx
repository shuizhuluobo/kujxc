<%@ Page language="c#" Codebehind="cjlj_add.aspx.cs" AutoEventWireup="false" Inherits="jxc.admin.cjlj_add" %>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN" >
<HTML>
	<HEAD>
		<title>cjlj_add</title>
		<meta name="GENERATOR" Content="Microsoft Visual Studio .NET 7.1">
		<meta name="CODE_LANGUAGE" Content="C#">
		<meta name="vs_defaultClientScript" content="JavaScript">
		<meta name="vs_targetSchema" content="http://schemas.microsoft.com/intellisense/ie5">
		<link href="../css/global.css" rel="stylesheet" type="text/css">
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
			<table cellpadding="0" cellspacing="0" border="0" width="100%" class="title3">
				<tr>
					<td align="center">超级链接填加</td>
				</tr>
			</table>
			<table cellpadding="0" cellspacing="0" border="0" width="100%" class="title3">
				<TR>
					<td align="center">链接名称</td>
					<td>
						<asp:TextBox id="xsmc" runat="server" Width="336px"></asp:TextBox></td>
				</TR>
				<TR>
					<td align="center">链接地址</td>
					<td>
						<asp:TextBox id="ljdz" runat="server" Width="336px">http://</asp:TextBox></td>
				</TR>
			</table>
			<table cellpadding="0" cellspacing="0" border="0" width="100%" class="title3">
				<tr>
					<td align="center">&nbsp;
						<asp:Button id="Button2" runat="server" Width="72px" Text="保存"></asp:Button><INPUT style="WIDTH: 64px; HEIGHT: 24px" type="button" value="返回" onclick="closes()">
					</td>
				</tr>
			</table>
		</form>
	</body>
</HTML>
                                
                                 
