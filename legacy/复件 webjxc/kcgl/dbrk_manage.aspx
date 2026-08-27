<%@ Register TagPrefix="uc1" TagName="dgNavigation" Src="../../ascx/dgNavigation.ascx" %>
<%@ Page language="c#" Codebehind="dbrk_manage.aspx.cs" AutoEventWireup="false" Inherits="jxc.webjxc.query.dbrk_manage" %>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN" >
<HTML>
	<HEAD>
		<title>消息管理</title>
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
								<td><font face="隶书" size="5">调拨入库</font></td>
							</tr>
						</table>
					</td>
					<td width="250"></td>
				</tr>
			</table>
			<table class="title3" cellSpacing="0" cellPadding="0" width="100%" border="0">
				<tr>
					<td>&nbsp;<FONT face="宋体">请选择</FONT>
					</td>
					<td><asp:dropdownlist id="DropDownList1" runat="server"></asp:dropdownlist>&nbsp;入库状态
						<asp:DropDownList id="DropDownList2" runat="server">
							<asp:ListItem Value="未入库">未入库</asp:ListItem>
							<asp:ListItem Value="已入库">已入库</asp:ListItem>
							<asp:ListItem Value="所有记录" Selected="True">所有记录</asp:ListItem>
						</asp:DropDownList>产品名称
						<asp:textbox id="rkrq" runat="server" Width="122px" CssClass="inputcss"></asp:textbox>
					</td>
					<td align="right"><asp:button id="query" runat="server" Text="查询" CssClass="buttoncss" Width="72px"></asp:button>
						<asp:button id="Button1" runat="server" Width="72px" CssClass="buttoncss" Text="确认到货"></asp:button>&nbsp;</td>
				</tr>
			</table>
			<br>
			<table cellSpacing="0" cellPadding="0" width="100%" border="0">
				<TR>
					<TD><asp:datagrid id="Datagrid1" runat="server" BorderColor="#000066" AllowPaging="True" CssClass="title3"
							DataKeyField="dbid" AutoGenerateColumns="False" Height="80px" Width="100%" PageSize="12">
							<SelectedItemStyle BorderColor="#FFC0C0" BackColor="White"></SelectedItemStyle>
							<ItemStyle HorizontalAlign="Center"></ItemStyle>
							<HeaderStyle HorizontalAlign="Center"></HeaderStyle>
							<Columns>
								<asp:TemplateColumn HeaderText="选择">
									<HeaderStyle Width="40px"></HeaderStyle>
									<ItemTemplate>
										<asp:CheckBox id="selectcheck" runat="server" Height="8px" AutoPostBack="false"></asp:CheckBox>
									</ItemTemplate>
								</asp:TemplateColumn>
								<asp:BoundColumn DataField="xsid" HeaderText="销售单号"></asp:BoundColumn>
								<asp:BoundColumn DataField="产品名称" HeaderText="产品名称"></asp:BoundColumn>
								<asp:BoundColumn DataField="调拨仓库" HeaderText="调拨库房"></asp:BoundColumn>
								<asp:BoundColumn DataField="原仓库" HeaderText="原库房"></asp:BoundColumn>
								<asp:BoundColumn DataField="操作员" HeaderText="操作员"></asp:BoundColumn>
								<asp:BoundColumn DataField="调拨数量" HeaderText="调拨数量" DataFormatString="{0:F2}">
									<ItemStyle HorizontalAlign="Right"></ItemStyle>
								</asp:BoundColumn>
								<asp:BoundColumn Visible="False" DataField="调拨说明" HeaderText="调拨说明"></asp:BoundColumn>
								<asp:BoundColumn Visible="False" DataField="加工状态" HeaderText="加工状态"></asp:BoundColumn>
								<asp:BoundColumn DataField="调拨日期" HeaderText="调拨日期"></asp:BoundColumn>
								<asp:BoundColumn DataField="dbid" HeaderText="调拨编号"></asp:BoundColumn>
								<asp:BoundColumn DataField="确认到货" HeaderText="入库状态"></asp:BoundColumn>
							</Columns>
							<PagerStyle Visible="False"></PagerStyle>
						</asp:datagrid></TD>
				</TR>
				<tr>
					<td align="left"><uc1:dgnavigation id="DgNavigation1" runat="server"></uc1:dgnavigation></td>
				</tr>
			</table>
		</form>
	</body>
</HTML>
