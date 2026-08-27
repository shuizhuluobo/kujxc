<%@ Register TagPrefix="uc1" TagName="dgNavigation" Src="../../ascx/dgNavigation.ascx" %>
<%@ Page language="c#" Codebehind="cksh_manage.aspx.cs" AutoEventWireup="false" Inherits="jxc.admin.bases.cksh_manage" %>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN" >
<HTML>
	<HEAD>
		<title>产品基础信息</title>
		<meta content="Microsoft Visual Studio .NET 7.1" name="GENERATOR">
		<meta content="C#" name="CODE_LANGUAGE">
		<meta content="JavaScript" name="vs_defaultClientScript">
		<meta content="http://schemas.microsoft.com/intellisense/ie5" name="vs_targetSchema">
		<LINK href="/css/BasicLayout.css" type="text/css" rel="stylesheet">
	</HEAD>
	<body MS_POSITIONING="GridLayout">
		<form id="Form1" method="post" runat="server">
			<table height="50" cellSpacing="0" cellPadding="0" width="100%" align="center" border="0">
				<tr>
					<td width="556" background="/image/title.gif">
						<table cellSpacing="0" cellPadding="0" width="100%" border="0">
							<tr>
								<td height="1"></td>
							</tr>
							<tr>
								<td width="80"></td>
								<td><font face="隶书" size="5">出库审核</font></td>
							</tr>
						</table>
					</td>
					<td width="250"><FONT face="宋体"></FONT></td>
				</tr>
			</table>
			<table class="title3" cellSpacing="0" cellPadding="0" width="100%" border="0">
				<TR>
					<TD style="WIDTH: 79px; HEIGHT: 24px">客户名称</TD>
					<TD style="WIDTH: 125px; HEIGHT: 24px"><FONT face="宋体">
							<asp:textbox id="cpname" runat="server" CssClass="inputcss"></asp:textbox></FONT></TD>
					<TD style="HEIGHT: 24px" align="left"><FONT face="宋体">审核确认
							<asp:dropdownlist id="Dropdownlist1" runat="server" CssClass="inputcss" Width="72px">
								<asp:ListItem Value="所有">所有</asp:ListItem>
								<asp:ListItem Value="是">已经审核</asp:ListItem>
								<asp:ListItem Value="否">未审核</asp:ListItem>
							</asp:dropdownlist></FONT></TD>
				</TR>
				<tr>
					<td style="WIDTH: 79px"><FONT face="宋体">销售地区</FONT></td>
					<td style="WIDTH: 125px">
						<asp:dropdownlist id="DropDownListlx" runat="server" CssClass="inputcss" Width="128px"></asp:dropdownlist></td>
					<td align="right"><asp:button id="query" runat="server" CssClass="buttoncss" Text="查询" Width="72px" Height="24px"></asp:button>
						<asp:button id="add" runat="server" CssClass="buttoncss" Text="审核" Width="72px" Height="24px"></asp:button>&nbsp;</td>
				</tr>
			</table>
			<TABLE class="title3" cellSpacing="0" cellPadding="0" width="100%" border="0">
				<TR>
					<TD>
						<asp:datagrid id="Datagrid1" runat="server" CssClass="title3" Height="0px" Width="100%" PageSize="50"
							AutoGenerateColumns="False" DataKeyField="xsid" AllowPaging="True" BorderColor="#000066">
							<SelectedItemStyle BorderColor="#FFC0C0" BackColor="White"></SelectedItemStyle>
							<ItemStyle HorizontalAlign="Center"></ItemStyle>
							<HeaderStyle Font-Names="宋体" HorizontalAlign="Center" ForeColor="Purple"></HeaderStyle>
							<Columns>
								<asp:TemplateColumn HeaderText="选择">
									<HeaderStyle Width="40px"></HeaderStyle>
									<ItemTemplate>
										<asp:CheckBox id="selectcheck" runat="server" Height="8px" AutoPostBack="false"></asp:CheckBox>
									</ItemTemplate>
								</asp:TemplateColumn>
								<asp:BoundColumn DataField="xsid" HeaderText="销售单号"></asp:BoundColumn>
								<asp:BoundColumn DataField="客户名称" HeaderText="客户名称"></asp:BoundColumn>
								<asp:BoundColumn DataField="销售日期" HeaderText="销售日期" DataFormatString="{0:d}"></asp:BoundColumn>
								<asp:BoundColumn DataField="店名" HeaderText="店名"></asp:BoundColumn>
								<asp:BoundColumn DataField="经办人" HeaderText="经办人"></asp:BoundColumn>
								<asp:BoundColumn DataField="取货日期" HeaderText="取货日期" DataFormatString="{0:d}"></asp:BoundColumn>
								<asp:BoundColumn DataField="审核通过" HeaderText="审核确认"></asp:BoundColumn>
								<asp:BoundColumn DataField="操作员" HeaderText="送货人"></asp:BoundColumn>
								<asp:BoundColumn DataField="备注1" HeaderText="备注"></asp:BoundColumn>
							</Columns>
							<PagerStyle Visible="False"></PagerStyle>
						</asp:datagrid></TD>
				</TR>
				<TR>
					<TD align="left">
						<uc1:dgnavigation id="DgNavigation1" runat="server"></uc1:dgnavigation></TD>
				</TR>
				<TR>
					<TD align="center">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
					</TD>
				</TR>
			</TABLE>
		</form>
	</body>
</HTML>
