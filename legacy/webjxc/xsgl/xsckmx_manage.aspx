<%@ Register TagPrefix="uc1" TagName="dgNavigation" Src="../../ascx/dgNavigation.ascx" %>
<%@ Page language="c#" Codebehind="xsckmx_manage.aspx.cs" AutoEventWireup="false" Inherits="jxc.admin.bases.xsckmx_manage" %>
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
								<td><font face="隶书" size="5">销售出库</font></td>
							</tr>
						</table>
					</td>
					<td width="250"><FONT face="宋体"><asp:dropdownlist id="DropDownListlx" runat="server" CssClass="inputcss" Visible="False" Width="96px"></asp:dropdownlist><asp:button id="Button1" runat="server" CssClass="buttoncss" Visible="False" Width="72px" Text="销售单模式"
								Height="24px"></asp:button></FONT></td>
				</tr>
			</table>
			<table class="title3" cellSpacing="0" cellPadding="0" width="100%" border="0">
				<TR>
					<TD style="HEIGHT: 24px; WIDTH: 79px"><asp:label id="Label2" runat="server">商品名称</asp:label></TD>
					<TD style="HEIGHT: 24px; WIDTH: 138px"><FONT face="宋体"><asp:textbox id="cpname" runat="server" CssClass="inputcss"></asp:textbox></FONT></TD>
					<TD style="HEIGHT: 24px; WIDTH: 196px" align="left">客户名称
						<asp:textbox id="Textbox1" runat="server" CssClass="inputcss"></asp:textbox></TD>
					<TD style="HEIGHT: 24px" align="left"><FONT face="宋体">&nbsp;
							<asp:checkbox id="CheckBox1" runat="server" Text="按日期" Checked="True"></asp:checkbox></FONT>
						<asp:textbox id="Textbox3" runat="server" CssClass="inputcss" Width="72px">2001-01-01</asp:textbox>
						<asp:Label id="Label3" runat="server">到</asp:Label>
						<asp:textbox id="Textbox2" runat="server" CssClass="inputcss" Width="72px">2010-01-01</asp:textbox>备注
						<asp:textbox id="txtbz" runat="server" Width="104px" CssClass="inputcss"></asp:textbox></FONT></TD>
				</TR>
				<tr>
					<td style="WIDTH: 79px"><asp:label id="Label1" runat="server">审核状态</asp:label></td>
					<td style="WIDTH: 138px"><FONT face="宋体"><asp:dropdownlist id="Dropdownlist1" runat="server" CssClass="inputcss" Width="128px">
								<asp:ListItem Value="已通过">已通过</asp:ListItem>
								<asp:ListItem Value="未通过">未通过</asp:ListItem>
								<asp:ListItem Value="所有记录" Selected="True">所有记录</asp:ListItem>
							</asp:dropdownlist></FONT></td>
					<TD style="WIDTH: 196px" align="left"><FONT face="宋体">销售单号
							<asp:textbox id="Textbox4" runat="server" CssClass="inputcss"></asp:textbox></FONT></TD>
					<TD align="right"><asp:button id="query" runat="server" CssClass="buttoncss" Width="72px" Text="查询" Height="24px"></asp:button><asp:button id="add" runat="server" CssClass="buttoncss" Width="72px" Text="录入销售单" Height="24px"></asp:button>
						<asp:button id="Button2" runat="server" Width="80px" CssClass="buttoncss" Height="24" Text="修改单据"></asp:button><asp:button id="change" runat="server" CssClass="buttoncss" Width="80px" Text="作废单据" Height="24"></asp:button><asp:button id="delete" runat="server" CssClass="buttoncss" Width="72px" Text="打印" Height="24px"></asp:button>
						<asp:button id="Button3" style="Z-INDEX: 0" runat="server" Width="72px" CssClass="buttoncss"
							Height="24px" Text="收款状态"></asp:button>&nbsp;</TD>
				</tr>
			</table>
			<TABLE class="title3" cellSpacing="0" cellPadding="0" width="100%" border="0">
				<TR>
					<TD><asp:datagrid id="Datagrid1" runat="server" CssClass="title3" Width="100%" Height="0px" PageSize="50"
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
								<asp:BoundColumn DataField="xsid" HeaderText="销售单号">
									<ItemStyle HorizontalAlign="Center"></ItemStyle>
								</asp:BoundColumn>
								<asp:BoundColumn DataField="客户名称" HeaderText="客户名称"></asp:BoundColumn>
								<asp:BoundColumn DataField="产品名称" HeaderText="产品名称">
									<ItemStyle HorizontalAlign="Center"></ItemStyle>
								</asp:BoundColumn>
								<asp:BoundColumn DataField="销售数量" HeaderText="销售数量" DataFormatString="{0:F2}">
									<ItemStyle HorizontalAlign="Right"></ItemStyle>
								</asp:BoundColumn>
								<asp:BoundColumn DataField="零售价" HeaderText="零售价">
									<ItemStyle HorizontalAlign="Center"></ItemStyle>
								</asp:BoundColumn>
								<asp:BoundColumn DataField="销售日期" HeaderText="销售日期" DataFormatString="{0:d}">
									<ItemStyle HorizontalAlign="Center"></ItemStyle>
								</asp:BoundColumn>
								<asp:BoundColumn DataField="店名" HeaderText="销售店">
									<FooterStyle HorizontalAlign="Center"></FooterStyle>
								</asp:BoundColumn>
								<asp:BoundColumn DataField="经办人" HeaderText="经办人">
									<ItemStyle HorizontalAlign="Center"></ItemStyle>
								</asp:BoundColumn>
								<asp:BoundColumn DataField="收款状态" HeaderText="收款状态">
									<ItemStyle HorizontalAlign="Center"></ItemStyle>
								</asp:BoundColumn>
								<asp:BoundColumn DataField="审核通过" HeaderText="审核通过"></asp:BoundColumn>
								<asp:BoundColumn DataField="发票状态" HeaderText="发票状态"></asp:BoundColumn>
								<asp:BoundColumn DataField="备注" HeaderText="备注"></asp:BoundColumn>
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
