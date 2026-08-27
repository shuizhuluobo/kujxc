<%@ Page language="c#" Codebehind="page_button_set.aspx.cs" AutoEventWireup="false" Inherits="jxc.admin.bases.page_button_set" %>
<%@ Register TagPrefix="uc1" TagName="dgNavigation" Src="../../ascx/dgNavigation.ascx" %>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN" >
<HTML>
	<HEAD>
		<title>页面功能按钮设置</title>
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
						<table cellpadding="0" cellspacing="0" border="0" width="100%">
							<tr>
								<td height="1"></td>
							</tr>
							<tr>
								<td width="80"></td>
								<td><font face="隶书" size="5">页面功能按钮设置</font></td>
							</tr>
						</table>
					</td>
					<td width="250"></td>
				</tr>
			</table>
			<table cellpadding="0" cellspacing="0" border="0" width="100%" class="title3">
				<tr>
					<td align="left">选择菜单
						<asp:dropdownlist id="Dropdownlist1" runat="server" AutoPostBack="True"></asp:dropdownlist>&nbsp;&nbsp;<asp:dropdownlist id="gn" runat="server"></asp:dropdownlist>&nbsp;&nbsp;
						<asp:Button id="query" runat="server" CssClass="buttoncss" Text="查询" Width="72px" Height="24px"></asp:Button>
						&nbsp;&nbsp;
						<asp:Button id="add" runat="server" Height="24px" Width="72px" Text="设置" CssClass="buttoncss"></asp:Button>
					</td>
				</tr>
				<TR>
					<TD>
						<asp:datagrid id="Datagrid1" runat="server" PageSize="50" Width="100%" Height="80px" AutoGenerateColumns="False"
							CssClass="title3" DataKeyField="id" AllowPaging="True" BorderColor="#000066">
							<SelectedItemStyle BorderColor="#FFC0C0" BackColor="White"></SelectedItemStyle>
							<Columns>
								<asp:TemplateColumn HeaderText="选择">
									<HeaderStyle Width="40px"></HeaderStyle>
									<ItemTemplate>
										<asp:CheckBox id="selectcheck" runat="server" Height="8px" AutoPostBack="false"></asp:CheckBox>
									</ItemTemplate>
								</asp:TemplateColumn>
								<asp:BoundColumn DataField="des" HeaderText="页面名称"></asp:BoundColumn>
								<asp:BoundColumn DataField="ids" HeaderText="按钮标识"></asp:BoundColumn>
								<asp:BoundColumn DataField="idname" HeaderText="按钮名称"></asp:BoundColumn>
							</Columns>
							<PagerStyle Visible="False"></PagerStyle>
						</asp:datagrid>
					</TD>
				</TR>
				<tr>
					<td align="left">
						<uc1:dgNavigation id="DgNavigation1" runat="server"></uc1:dgNavigation></td>
				</tr>
			</table>
		</form>
	</body>
</HTML>
