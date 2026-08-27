<%@ Register TagPrefix="uc1" TagName="dgNavigation" Src="../../ascx/dgNavigation.ascx" %>
<%@ Page language="c#" Codebehind="spth_Search.aspx.cs" AutoEventWireup="false" Inherits="jxc.admin.bases.spth_Search" %>
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
			<table class="title3" cellSpacing="0" cellPadding="0" width="100%" border="0">
				<TR>
					<TD style="WIDTH: 99px; HEIGHT: 25px"><FONT face="宋体">销售单号</FONT></TD>
					<TD style="WIDTH: 267px; HEIGHT: 25px"><FONT face="宋体"><asp:textbox id="Textbox1" runat="server" CssClass="inputcss" Width="104px"></asp:textbox></FONT></TD>
					<TD style="WIDTH: 83px; HEIGHT: 25px" align="right"></TD>
					<TD style="HEIGHT: 25px" align="right"><FONT face="宋体"></FONT></TD>
					<TD style="HEIGHT: 25px" align="right"><FONT face="宋体"></FONT></TD>
				</TR>
				<TR>
					<TD style="WIDTH: 99px; HEIGHT: 25px">客户名称</TD>
					<TD style="WIDTH: 267px; HEIGHT: 25px"><FONT face="宋体">
							<asp:textbox id="Textbox2" runat="server" Width="104px" CssClass="inputcss"></asp:textbox></FONT></TD>
					<TD style="WIDTH: 83px; HEIGHT: 25px" align="right"></TD>
					<TD style="HEIGHT: 25px" align="right"></TD>
					<TD style="HEIGHT: 25px" align="right"></TD>
				</TR>
				<tr>
					<td style="WIDTH: 99px">产品条码或名称</td>
					<td style="WIDTH: 267px"><asp:textbox id="cpname" runat="server" CssClass="inputcss" Width="104px"></asp:textbox></td>
					<TD align="right" style="WIDTH: 83px"><FONT face="宋体"></FONT></TD>
					<TD align="right"><asp:dropdownlist id="DropDownList1" runat="server" Visible="False">
							<asp:ListItem Value="所有">所有</asp:ListItem>
							<asp:ListItem Value="正常">正常</asp:ListItem>
							<asp:ListItem Value="样品">样品</asp:ListItem>
						</asp:dropdownlist></TD>
					<td align="right"><asp:button id="query" runat="server" CssClass="buttoncss" Height="24px" Width="72px" Text="查询"></asp:button>&nbsp;
						<asp:button id="add" runat="server" CssClass="buttoncss" Visible="False" Height="24px" Width="72px"
							Text="确定"></asp:button></td>
				</tr>
			</table>
			<TABLE class="title3" cellSpacing="0" cellPadding="0" width="100%" border="0">
				<TR>
					<TD><asp:datagrid id="Datagrid1" runat="server" CssClass="title3" Height="0px" Width="100%" BorderColor="#000066"
							AllowPaging="True" DataKeyField="xsid" AutoGenerateColumns="False" PageSize="50">
							<SelectedItemStyle BorderColor="#FFC0C0" BackColor="White"></SelectedItemStyle>
							<ItemStyle HorizontalAlign="Center"></ItemStyle>
							<HeaderStyle Font-Names="宋体" HorizontalAlign="Center" ForeColor="Purple"></HeaderStyle>
							<Columns>
								<asp:TemplateColumn Visible="False" HeaderText="选择">
									<HeaderStyle Width="40px"></HeaderStyle>
									<ItemTemplate>
										<asp:CheckBox id="selectcheck" runat="server" Height="8px" AutoPostBack="false"></asp:CheckBox>
									</ItemTemplate>
								</asp:TemplateColumn>
								<asp:BoundColumn DataField="xsid" HeaderText="销售单号"></asp:BoundColumn>
								<asp:BoundColumn DataField="客户名称" HeaderText="客户名称"></asp:BoundColumn>
								<asp:BoundColumn DataField="cpid" HeaderText="产品编码"></asp:BoundColumn>
								<asp:BoundColumn DataField="产品名称" HeaderText="产品名称"></asp:BoundColumn>
								<asp:BoundColumn DataField="店名" HeaderText="所在店"></asp:BoundColumn>
								<asp:BoundColumn DataField="销售数量" HeaderText="销售数量" DataFormatString="{0:F2}">
									<ItemStyle HorizontalAlign="Right"></ItemStyle>
								</asp:BoundColumn>
								<asp:BoundColumn DataField="单价" HeaderText="单价"></asp:BoundColumn>
								<asp:ButtonColumn Text="选择" ButtonType="PushButton" CommandName="Select"></asp:ButtonColumn>
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
