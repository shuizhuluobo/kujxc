<%@ Register TagPrefix="uc1" TagName="dgNavigation" Src="../../ascx/dgNavigation.ascx" %>
<%@ Page language="c#" Codebehind="thrkmx_manage.aspx.cs" AutoEventWireup="false" Inherits="jxc.admin.bases.thrkmx_manage" %>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN" >
<HTML>
	<HEAD>
		<title>销售出库</title>
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
								<td><font face="隶书" size="5">客户产品退货入库</font></td>
							</tr>
						</table>
					</td>
					<td width="250"><FONT face="宋体"></FONT></td>
				</tr>
			</table>
			<table class="title3" cellSpacing="0" cellPadding="0" width="100%" border="0">
				<TR>
					<TD style="WIDTH: 79px; HEIGHT: 24px">销售单号</TD>
					<TD style="WIDTH: 125px; HEIGHT: 24px"><FONT face="宋体"><asp:textbox id="Textbox1" runat="server" CssClass="inputcss"></asp:textbox></FONT></TD>
					<TD style="HEIGHT: 24px" align="left"><FONT face="宋体">产品名称
							<asp:textbox id="Textbox2" runat="server" CssClass="inputcss"></asp:textbox></FONT></TD>
				</TR>
				<TR>
					<TD style="WIDTH: 79px; HEIGHT: 24px">客户名称</TD>
					<TD style="WIDTH: 125px; HEIGHT: 24px"><FONT face="宋体"><asp:textbox id="cpname" runat="server" CssClass="inputcss"></asp:textbox></FONT></TD>
					<TD style="HEIGHT: 24px" align="right"><FONT face="宋体">&nbsp;
							<asp:button id="Button1" runat="server" CssClass="buttoncss" Height="24px" Text="退货单模式" Width="72px"
								Visible="False"></asp:button><asp:dropdownlist id="DropDownListlx" runat="server" CssClass="inputcss" Width="128px" Visible="False"></asp:dropdownlist></FONT></TD>
				</TR>
				<tr>
					<td style="WIDTH: 79px"><FONT face="宋体">审核状态</FONT></td>
					<td style="WIDTH: 125px"><FONT face="宋体"><asp:dropdownlist id="Dropdownlist1" runat="server" CssClass="inputcss" Width="128px">
								<asp:ListItem Value="已通过">已通过</asp:ListItem>
								<asp:ListItem Value="未通过">未通过</asp:ListItem>
								<asp:ListItem Value="所有记录" Selected="True">所有记录</asp:ListItem>
							</asp:dropdownlist></FONT></td>
					<TD align="right"><asp:button id="query" runat="server" CssClass="buttoncss" Height="24px" Text="查询" Width="72px"></asp:button><asp:button id="add" runat="server" CssClass="buttoncss" Height="24px" Text="录入退货单" Width="72px"></asp:button><asp:button id="Button2" runat="server" CssClass="buttoncss" Height="24px" Text="修改退货单" Width="72px"></asp:button><asp:button id="change" runat="server" CssClass="buttoncss" Height="24" Text="确认到货" Width="80px"
							Visible="False"></asp:button><asp:button id="send" runat="server" CssClass="buttoncss" Height="24px" Text="发送" Width="72px"
							Visible="False"></asp:button>&nbsp;</TD>
				</tr>
			</table>
			<TABLE class="title3" cellSpacing="0" cellPadding="0" width="100%" border="0">
				<TR>
					<TD><asp:datagrid id="Datagrid1" runat="server" CssClass="title3" Height="0px" Width="100%" BorderColor="#000066"
							AllowPaging="True" DataKeyField="thid" AutoGenerateColumns="False" PageSize="50">
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
								<asp:BoundColumn DataField="thid" HeaderText="退货单号">
									<ItemStyle HorizontalAlign="Center"></ItemStyle>
								</asp:BoundColumn>
								<asp:BoundColumn DataField="销售单号" HeaderText="销售单号"></asp:BoundColumn>
								<asp:BoundColumn DataField="产品名称" HeaderText="产品名称">
									<ItemStyle HorizontalAlign="Center"></ItemStyle>
								</asp:BoundColumn>
								<asp:BoundColumn DataField="退货数量" HeaderText="退货数量" DataFormatString="{0:F2}">
									<ItemStyle HorizontalAlign="Right"></ItemStyle>
								</asp:BoundColumn>
								<asp:BoundColumn DataField="退货日期" HeaderText="退货日期" DataFormatString="{0:d}">
									<ItemStyle HorizontalAlign="Center"></ItemStyle>
								</asp:BoundColumn>
								<asp:BoundColumn DataField="客户名称" HeaderText="客户名称">
									<ItemStyle HorizontalAlign="Center"></ItemStyle>
								</asp:BoundColumn>
								<asp:BoundColumn DataField="店名" HeaderText="销售店">
									<FooterStyle HorizontalAlign="Center"></FooterStyle>
								</asp:BoundColumn>
								<asp:BoundColumn DataField="经办人" HeaderText="经办人">
									<ItemStyle HorizontalAlign="Center"></ItemStyle>
								</asp:BoundColumn>
								<asp:BoundColumn Visible="False" DataField="主管审核" HeaderText="主管审核">
									<ItemStyle HorizontalAlign="Center"></ItemStyle>
								</asp:BoundColumn>
								<asp:BoundColumn Visible="False" DataField="总会计审核" HeaderText="会计审核"></asp:BoundColumn>
								<asp:BoundColumn DataField="单据状态" HeaderText="单据状态"></asp:BoundColumn>
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
