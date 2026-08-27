<%@ Page language="c#" Codebehind="gly_change.aspx.cs" AutoEventWireup="false" Inherits="jxc.admin.gly_change" %>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN" >
<HTML>
	<HEAD>
		<title>gly_change</title>
		<meta name="GENERATOR" Content="Microsoft Visual Studio .NET 7.1">
		<meta name="CODE_LANGUAGE" Content="C#">
		<meta name="vs_defaultClientScript" content="JavaScript">
		<meta name="vs_targetSchema" content="http://schemas.microsoft.com/intellisense/ie5">
		<link href="../../css/style.css" rel="stylesheet" type="text/css">
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
			<table cellpadding="0" cellspacing="0" border="0" width="100%" align="center">
				<tr>
					<td width="80">管理员代号</td>
					<td>
						<asp:TextBox id="tglydh" Enabled="False" runat="server" Width="136px" CssClass="inputcss"></asp:TextBox></td>
				</tr>
				<tr>
					<td width="80">管理员姓名</td>
					<td>
						<asp:TextBox id="tglyname" runat="server" Width="136px" CssClass="inputcss"></asp:TextBox></td>
				</tr>
				<tr>
					<td width="80">角色</td>
					<td>
						<asp:DropDownList id="DropDownList1" runat="server"></asp:DropDownList></td>
				</tr>
				<tr>
					<td width="80"></td>
					<td>
						<asp:Button id="add" runat="server" Width="96px" CssClass="buttoncss" Text="修改"></asp:Button>&nbsp;&nbsp;&nbsp;<a href="#" onclick="window.closes()">[关闭窗口]</a>
					</td>
				</tr>
			</table>
		</form>
	</body>
</HTML>
                                
                                 
