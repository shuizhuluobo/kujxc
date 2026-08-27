<%@ Page language="c#" Codebehind="ckshmx_manage.aspx.cs" AutoEventWireup="false" Inherits="jxc.admin.bases.ckshmx_manage" %>
<%@ Register TagPrefix="uc1" TagName="dgNavigation" Src="../../ascx/dgNavigation.ascx" %>
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
								<td><font face="隶书" size="5"><FONT face="隶书" size="5">出库审核</FONT></font></td>
							</tr>
						</table>
					</td>
					<td width="250"><FONT face="宋体"></FONT></td>
				</tr>
			</table>
			<table class="title3" cellSpacing="0" cellPadding="0" width="100%" border="0">
				<TR>
					<TD style="WIDTH: 79px; HEIGHT: 20px">客户名称</TD>
					<TD style="WIDTH: 239px; HEIGHT: 20px"><FONT face="宋体"><asp:textbox id="cpname" runat="server" CssClass="inputcss" Width="78px"></asp:textbox><FONT face="宋体">审核类型
								<asp:dropdownlist id="Dropdownlist1" runat="server" CssClass="inputcss" Width="78px">
									<asp:ListItem Value="未通过">未通过</asp:ListItem>
									<asp:ListItem Value="已通过">已通过</asp:ListItem>
									<asp:ListItem Value="所有记录" Selected="True">所有记录</asp:ListItem>
								</asp:dropdownlist></FONT></FONT></TD>
					<TD style="HEIGHT: 20px" align="left"><FONT face="宋体">是否回单
							<asp:dropdownlist id="Dropdownlist2" runat="server" Width="78px" CssClass="inputcss">
								<asp:ListItem Value="未回">未回</asp:ListItem>
								<asp:ListItem Value="已回">已回</asp:ListItem>
								<asp:ListItem Value="所有记录" Selected="True">所有记录</asp:ListItem>
							</asp:dropdownlist></FONT></TD>
					<TD style="HEIGHT: 20px" align="right"><FONT face="宋体">&nbsp;
							<asp:button id="Button1" runat="server" Width="72px" CssClass="buttoncss" Text="销售单模式" Height="24px"
								Visible="False"></asp:button></FONT></TD>
				</TR>
				<tr>
					<td style="WIDTH: 79px"><FONT face="宋体">请选择</FONT></td>
					<td style="WIDTH: 239px"><asp:dropdownlist id="DropDownListlx" runat="server" CssClass="inputcss" Width="78px"></asp:dropdownlist><FONT face="宋体">产品名称
							<asp:textbox id="Textbox1" runat="server" Width="78px" CssClass="inputcss"></asp:textbox></FONT></td>
					<TD align="left"><FONT face="宋体"> 销售单号
							<asp:textbox id="Textbox2" runat="server" Width="78px" CssClass="inputcss"></asp:textbox></FONT></TD>
					<td align="right"><asp:button id="query" runat="server" CssClass="buttoncss" Width="48px" Height="24px" Text="查询"></asp:button><asp:button id="add" runat="server" CssClass="buttoncss" Width="56px" Height="24px" Text="确认回单"
							Enabled="False"></asp:button><asp:button id="change" runat="server" CssClass="buttoncss" Width="56px" Height="24" Text="确认审核"></asp:button><asp:button id="delete" runat="server" CssClass="buttoncss" Width="40px" Height="24px" Text="打印"
							Visible="False"></asp:button>&nbsp;</td>
				</tr>
			</table>
			<TABLE class="title3" cellSpacing="0" cellPadding="0" width="100%" border="0">
				<TR>
					<TD><asp:datagrid id="Datagrid1" runat="server" CssClass="title3" Width="100%" Height="0px" BorderColor="#000066"
							AllowPaging="True" DataKeyField="xsid" AutoGenerateColumns="False" PageSize="50">
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
								<asp:BoundColumn DataField="产品名称" HeaderText="产品名称"></asp:BoundColumn>
								<asp:BoundColumn DataField="销售数量" HeaderText="数量" DataFormatString="{0:F2}">
									<ItemStyle HorizontalAlign="Right"></ItemStyle>
								</asp:BoundColumn>
								<asp:BoundColumn DataField="客户名称" HeaderText="客户名称"></asp:BoundColumn>
								<asp:BoundColumn DataField="店名" HeaderText="销售店"></asp:BoundColumn>
								<asp:BoundColumn DataField="销售日期" HeaderText="销售日期" DataFormatString="{0:d}"></asp:BoundColumn>
								<asp:BoundColumn DataField="经办人" HeaderText="经办人"></asp:BoundColumn>
								<asp:BoundColumn DataField="地区" HeaderText="库房"></asp:BoundColumn>
								<asp:BoundColumn DataField="操作员" HeaderText="送货人"></asp:BoundColumn>
								<asp:BoundColumn DataField="是否回单" HeaderText="是否回单"></asp:BoundColumn>
								<asp:BoundColumn DataField="审核通过" HeaderText="审核通过"></asp:BoundColumn>
								<asp:BoundColumn DataField="备注1" HeaderText="备注1"></asp:BoundColumn>
							</Columns>
							<PagerStyle Visible="False"></PagerStyle>
						</asp:datagrid></TD>
				</TR>
				<TR>
					<TD align="left"><uc1:dgnavigation id="DgNavigation1" runat="server"></uc1:dgnavigation></TD>
				</TR>
				<TR>
					<TD align="center">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
					</TD>
				</TR>
			</TABLE>
		</form>
	</body>
</HTML>
