<%@ Page language="c#" Codebehind="kczjlb_query.aspx.cs" AutoEventWireup="false" Inherits="jxc.webjxc.query.kczjlb_query" %>
<%@ Register TagPrefix="uc1" TagName="dgNavigation" Src="../../ascx/dgNavigation.ascx" %>
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
								<td><font face="隶书" size="5">库存增减例表</font></td>
							</tr>
						</table>
					</td>
					<td width="250"></td>
				</tr>
			</table>
			<table class="title3" cellSpacing="0" cellPadding="0" width="100%" border="0">
				<TR>
					<TD>
						<asp:CheckBox id="CheckBox2" runat="server" Text="按日期"></asp:CheckBox>从
						<asp:textbox id="Textbox3" runat="server" CssClass="inputcss" Width="72px"></asp:textbox>到
						<asp:textbox id="Textbox4" runat="server" CssClass="inputcss" Width="72px"></asp:textbox>之间</TD>
					<TD><FONT face="宋体"></FONT></TD>
					<TD align="right"></TD>
				</TR>
				<TR>
					<TD style="HEIGHT: 21px"><FONT face="宋体">&nbsp;</FONT></TD>
					<TD style="HEIGHT: 21px"></TD>
					<TD style="HEIGHT: 21px" align="right"></TD>
				</TR>
				<tr>
					<td>地区
						<asp:dropdownlist id="DropDownList1" runat="server"></asp:dropdownlist>&nbsp;产品名称
						<asp:textbox id="rkrq" runat="server" Width="56px" CssClass="inputcss"></asp:textbox>
					</td>
					<td>&nbsp;
					</td>
					<TD align="right">
						<asp:button id="add" runat="server" Text="生成查询记录" Width="85px" CssClass="buttoncss"></asp:button><asp:button id="query" runat="server" Text="查询" CssClass="buttoncss" Width="72px"></asp:button>&nbsp;</TD>
				</tr>
			</table>
			<br>
			<table cellSpacing="0" cellPadding="0" width="100%" border="0">
				<TR>
					<TD><asp:datagrid id="Datagrid1" runat="server" BorderColor="#000066" AllowPaging="True" CssClass="title3"
							AutoGenerateColumns="False" Height="80px" Width="100%" PageSize="12">
							<SelectedItemStyle BorderColor="#FFC0C0" BackColor="White"></SelectedItemStyle>
							<ItemStyle HorizontalAlign="Center"></ItemStyle>
							<Columns>
								<asp:BoundColumn DataField="地区" HeaderText="地区"></asp:BoundColumn>
								<asp:BoundColumn DataField="产品名称" HeaderText="产品名称"></asp:BoundColumn>
								<asp:BoundColumn DataField="入库数量" HeaderText="入库数量" DataFormatString="{0:F2}">
									<ItemStyle HorizontalAlign="Right"></ItemStyle>
								</asp:BoundColumn>
								<asp:BoundColumn DataField="销售数量" HeaderText="销售数量" DataFormatString="{0:F2}">
									<ItemStyle HorizontalAlign="Right"></ItemStyle>
								</asp:BoundColumn>
								<asp:BoundColumn DataField="调拨数量" HeaderText="调出数量" DataFormatString="{0:F2}">
									<ItemStyle HorizontalAlign="Right"></ItemStyle>
								</asp:BoundColumn>
								<asp:BoundColumn DataField="调入数量" HeaderText="调入数量" DataFormatString="{0:F2}">
									<ItemStyle HorizontalAlign="Right"></ItemStyle>
								</asp:BoundColumn>
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
