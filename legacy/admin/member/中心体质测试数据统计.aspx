<%@ Page language="c#" Codebehind="中心体质测试数据统计.aspx.cs" AutoEventWireup="false" Inherits="health.admin.member.中心体质测试数据统计" %>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN" >
<HTML>
	<HEAD>
		<title>体质测试数据统计</title>
		<meta name="GENERATOR" Content="Microsoft Visual Studio .NET 7.1">
		<meta name="CODE_LANGUAGE" Content="C#">
		<meta name="vs_defaultClientScript" content="JavaScript">
		<meta name="vs_targetSchema" content="http://schemas.microsoft.com/intellisense/ie5">
		<LINK href="/css/BasicLayout.css" type="text/css" rel="stylesheet">
	</HEAD>
	<body MS_POSITIONING="GridLayout">
		<form id="Form1" method="post" runat="server">
			<table class="title3" cellSpacing="0" cellPadding="0" width="100%" align="center" border="0">
				<tr>
					<td>单位：</td>
					<td><asp:dropdownlist id="dw" runat="server"></asp:dropdownlist></td>
					<td>测试日期：</td>
					<td>
						<asp:TextBox id="csrq" runat="server" Width="133px"></asp:TextBox><FONT face="宋体">(YYYY-MM-DD)</FONT></td>
				</tr>
				<tr>
					<td width="100" style="HEIGHT: 6px">性别：</td>
					<td style="HEIGHT: 6px">
						<asp:dropdownlist id="xb" runat="server"></asp:dropdownlist></td>
					<td width="100" style="HEIGHT: 6px">年龄段：</td>
					<td style="HEIGHT: 6px">
						<asp:dropdownlist id="nld" runat="server"></asp:dropdownlist></td>
				</tr>
				<tr>
					<td width="100">测试分组：</td>
					<td>
						<asp:dropdownlist id="chfz" runat="server"></asp:dropdownlist></td>
					<td width="100">学历：</td>
					<td>
						<asp:dropdownlist id="xl" runat="server"></asp:dropdownlist></td>
				</tr>
			</table>
			<table class="title3" cellSpacing="0" cellPadding="0" width="100%" border="0">
				<tr>
					<td align="right"><asp:button id="query" runat="server" CssClass="buttoncss" Text="查询" Width="80px"></asp:button>&nbsp;&nbsp;
						<asp:button id="change" runat="server" CssClass="buttoncss" Text="详细" Width="80px" Height="24"></asp:button>
					</td>
				</tr>
			</table>
		</form>
	</body>
</HTML>
