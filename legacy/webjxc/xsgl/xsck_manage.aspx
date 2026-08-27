<%@ Page language="c#" Codebehind="xsck_manage.aspx.cs" AutoEventWireup="false" Inherits="jxc.admin.bases.xsck_manage" %>
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
								<td><font face="隶书" size="5">销售出库</font></td>
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
					<TD style="HEIGHT: 24px" align="left"><FONT face="宋体">
							<asp:checkbox id="CheckBox1" runat="server" Text="按日期" Checked="True"></asp:checkbox></FONT>
						<asp:textbox id="Textbox1" runat="server" CssClass="inputcss" Width="104px"></asp:textbox>
						<asp:Label id="Label1" runat="server">到</asp:Label>
						<asp:textbox id="Textbox2" runat="server" CssClass="inputcss" Width="104px"></asp:textbox></FONT></TD>
				</TR>
				<tr>
					<td style="WIDTH: 79px"><FONT face="宋体">销售地区</FONT></td>
					<td style="WIDTH: 125px">
						<asp:dropdownlist id="DropDownListlx" runat="server" CssClass="inputcss" Width="128px"></asp:dropdownlist></td>
					<td align="right"><asp:button id="query" runat="server" CssClass="buttoncss" Text="查询" Width="72px" Height="24px"></asp:button>
						<asp:button id="add" runat="server" CssClass="buttoncss" Text="录入销售单" Width="72px" Height="24px"></asp:button>
						<asp:button id="change" runat="server" CssClass="buttoncss" Text="确认到货" Width="80px" Height="24"></asp:button>
						<asp:button id="delete" runat="server" CssClass="buttoncss" Text="打印" Width="72px" Height="24px"></asp:button>&nbsp;</td>
				</tr>
			</table>
			<TABLE class="title3" cellSpacing="0" cellPadding="0" width="100%" border="0">
				<TR>
					<TD>
						<asp:datagrid id="Datagrid1" runat="server" CssClass="title3" Height="0px" Width="100%" PageSize="50"
							AutoGenerateColumns="False" DataKeyField="xsid" AllowPaging="True" BorderColor="#000066">
							<SelectedItemStyle BorderColor="#FFC0C0" BackColor="White"></SelectedItemStyle>
							<HeaderStyle Font-Names="宋体" ForeColor="Purple"></HeaderStyle>
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
