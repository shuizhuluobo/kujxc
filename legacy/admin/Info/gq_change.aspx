<%@ Register TagPrefix="ftb" Namespace="FreeTextBoxControls" Assembly="FreeTextBox" %>
<%@ Page language="c#" Codebehind="gq_change.aspx.cs" AutoEventWireup="false" Inherits="jxc.admin.Info.gq_change" validateRequest=false%>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN" >
<HTML>
  <HEAD>
		<title>供求信息审核</title>
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
								<td><font face="隶书" size="5">供求信息审核</font></td>
							</tr>
						</table>
					</td>
					<td width="250"></td>
				</tr>
			</table>
			<br>
			<table cellpadding="0" cellspacing="5" border="0" width="100%" class="title3">
				<tr>
					<td align="right" width="80">
						信息编号
					</td>
					<td>
						<asp:TextBox id="id" runat="server" CssClass="inputcss" Width="80px" Enabled="False"></asp:TextBox><FONT face="宋体">&nbsp; 
							</FONT></td>
				</tr>
				<tr>
					<td align="right" width="80">
						标题
					</td>
					<td>
						<asp:TextBox id="title" runat="server" CssClass="inputcss" Width="504px" Enabled="False"></asp:TextBox><FONT face="宋体">&nbsp; 
							</FONT></td>
				</tr>
				<tr>
					<td width="80" style="WIDTH: 80px" align="right">
						内容
					</td>
					<td>
						<asp:textbox id="content" runat="server" Width="504px" CssClass="inputcss" onfocus="calendar()" TextMode="MultiLine" Height="104px"></asp:textbox>
					</td>
				</tr>
				<tr>
					<td width="80" style="WIDTH: 80px" align="right">
						发布时间
					</td>
					<td>
						<asp:textbox id="fbsj" runat="server" Width="112px" CssClass="inputcss" ></asp:textbox>
					</td>
				</tr>
				<tr>
					<td width="80" style="WIDTH: 80px" align="right">
						审核状态
					</td>
					<td>
						<asp:RadioButtonList id="RadioButtonList1" runat="server" CssClass="title3">
							<asp:ListItem Value="0" Selected="True">否</asp:ListItem>
							<asp:ListItem Value="100">是</asp:ListItem>
						</asp:RadioButtonList>
					</td>
				</tr>
			</table>
			<table cellpadding="0" cellspacing="0" border="0" width="100%">
				<tr>
					<td align="center">
						<asp:Button id="save" runat="server" Width="62px" Text="审核" CssClass="buttoncss"></asp:Button>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<INPUT type="button" value="返回" class="buttoncss" onclick="closes()" style="WIDTH: 64px; HEIGHT: 20px">
					</td>
				</tr>
			</table>
		</form>
	</body>
</HTML>
                                
                                 
