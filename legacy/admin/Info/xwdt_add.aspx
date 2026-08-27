<%@ Page language="c#" Codebehind="xwdt_add.aspx.cs" AutoEventWireup="false" validateRequest="false" Inherits="jxc.admin.info.xwdt_add" %>
<%@ Register TagPrefix="ftb" Namespace="FreeTextBoxControls" Assembly="FreeTextBox" %>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN" >
<HTML>
	<HEAD>
		<title>咨询内容增加</title>
		<meta name="GENERATOR" Content="Microsoft Visual Studio .NET 7.1">
		<meta name="CODE_LANGUAGE" Content="C#">
		<meta name="vs_defaultClientScript" content="JavaScript">
		<meta name="vs_targetSchema" content="http://schemas.microsoft.com/intellisense/ie5">
		<LINK href="/css/BasicLayout.css" type="text/css" rel="stylesheet">
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
		<form id="Post" method="post" runat="server">
			<table cellpadding="0" cellspacing="0" border="0" width="100%" class="title3">
				<tr>
					<td align="center" colspan="2">咨询内容增加</td>
				</tr>
			</table>
			<table cellpadding="0" cellspacing="0" border="0" width="100%" class="title3">
				<TR>
					<td align="center">标题</td>
					<td>
						<asp:TextBox id="title" runat="server" Width="336px" CssClass="inputcss"></asp:TextBox>
					</td>
				</TR>
				<TR>
					<td align="center">发布者</td>
					<td>
						<asp:TextBox id="zz" runat="server" Width="120px" CssClass="inputcss"></asp:TextBox>
					</td>
				</TR>
				<TR>
					<td align="center">作者</td>
					<td>
						<asp:TextBox id="writer" runat="server" Width="120px" CssClass="inputcss"></asp:TextBox>
					</td>
				</TR>
				<TR>
					<td align="center">时间</td>
					<td>
						<asp:TextBox id="inputdate" runat="server" Width="112px" CssClass="inputcss"></asp:TextBox></td>
				</TR>
				<tr>
					<td align="center" colspan="2">详细信息
					</td>
				</tr>
				<tr>
					<td align="center">详细信息</td>
					<td align="left">
						<FTB:FreeTextBox id="FreeTextBox1" runat="server" Width="580px" ButtonPath="\images\ftb\office2000\"
							Height="500px" />
					</td>
				</tr>
				<tr>
					<td></td>
					<td align="left">&nbsp;
						<asp:Button id="Button2" runat="server" Width="64px" Text="保存" Height="24px" CssClass="buttoncss"></asp:Button>&nbsp;<INPUT style="WIDTH: 64px; HEIGHT: 24px" type="button" value="返回" onclick="closes()" class="buttoncss">
					</td>
				</tr>
			</table>
		</form>
	</body>
</HTML>
                                
                                 
