<%@ Page language="c#" Codebehind="info_auditing.aspx.cs" AutoEventWireup="false" validateRequest="false" Inherits="jxc.admin.Info.info_auditing" %>
<%@ Register TagPrefix="ftb" Namespace="FreeTextBoxControls" Assembly="FreeTextBox" %>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN" >
<HTML>
	<HEAD>
		<title>网站内容修改</title>
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
			<asp:Label id="judge" style="Z-INDEX: 102; LEFT: 24px; POSITION: absolute; TOP: 8px" runat="server"
				Visible="False"></asp:Label>
			<table cellpadding="0" cellspacing="0" border="0" width="100%" class="title3">
				<tr>
					<td align="center" colspan="2">内容审核</td>
				</tr>
			</table>
			<table cellpadding="0" cellspacing="0" border="0" width="100%" class="title3">
				<tr>
					<td></td>
					<td><%=state%></td>
				</tr>
				<TR>
					<td align="center">标题</td>
					<td>
						<asp:TextBox id="title" runat="server" Width="336px" CssClass="inputcss"></asp:TextBox></td>
				</TR>
				<TR>
					<td align="center">发布者</td>
					<td>
						<asp:TextBox id="zz" runat="server" Width="136px" CssClass="inputcss"></asp:TextBox>
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
						<asp:TextBox id="inputdate" runat="server" Width="336px" CssClass="inputcss"></asp:TextBox></td>
				</TR>
				<tr>
					<td align="center">详细信息</td>
					<td align="left">
						<FTB:FreeTextBox id="FreeTextBox1" runat="server" Width="100%" ButtonPath="\images\ftb\office2000\"
							Height="500px" />
					</td>
				</tr>
				<tr>
					<td></td>
					<td align="left">&nbsp;
						<asp:Button id="Button2" runat="server" Width="64px" Text="审核" Height="24px" CssClass="buttoncss"></asp:Button>&nbsp;<INPUT style="WIDTH: 64px; HEIGHT: 24px" type="button" value="返回" onclick="closes()"
							class="buttoncss">
					</td>
				</tr>
			</table>
		</form>
		<asp:label id="hidlabel" style="Z-INDEX: 101; LEFT: 200px; POSITION: absolute; TOP: 448px"
			runat="server" Width="200px" Height="24px" Visible="False">Label</asp:label></FORM>
	</body>
</HTML>
                                
                                 
