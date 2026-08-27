<%@ Page language="c#" Codebehind="fhd_query.aspx.cs" AutoEventWireup="false" Inherits="jxc.webjxc.query.fhd_query" %>
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
								<td><font face="隶书" size="5">发货单查询</font></td>
							</tr>
						</table>
					</td>
					<td width="250"></td>
				</tr>
			</table>
			<table class="title3" cellSpacing="0" cellPadding="0" width="100%" border="0">
				<tr>
					<td>请选择&nbsp;
					</td>
					<td><asp:dropdownlist id="DropDownList1" runat="server"></asp:dropdownlist>&nbsp; <FONT face="宋体">
							产品名称
							<asp:textbox id="Textbox1" runat="server" Width="104px" CssClass="inputcss"></asp:textbox>到货状态
							<asp:dropdownlist id="Dropdownlist2" runat="server">
								<asp:ListItem Value="未到货">未到货</asp:ListItem>
								<asp:ListItem Value="已到货">已到货</asp:ListItem>
								<asp:ListItem Value="所有记录" Selected="True">所有记录</asp:ListItem>
							</asp:dropdownlist></FONT>
					</td>
					<td align="right"><asp:button id="query" runat="server" Text="查询" CssClass="buttoncss" Width="72px"></asp:button>
						<asp:button id="Button1" runat="server" Width="72px" CssClass="buttoncss" Text="到货确认"></asp:button>&nbsp;</td>
				</tr>
			</table>
			<br>
			<table cellSpacing="0" cellPadding="0" width="100%" border="0">
				<TR>
					<TD><asp:datagrid id="Datagrid1" runat="server" BorderColor="#000066" AllowPaging="True" CssClass="title3"
							DataKeyField="fhid" AutoGenerateColumns="False" Height="80px" Width="100%" PageSize="12">
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
								<asp:BoundColumn DataField="fhid" HeaderText="发货单号"></asp:BoundColumn>
								<asp:BoundColumn DataField="产品名称" HeaderText="产品名称"></asp:BoundColumn>
								<asp:BoundColumn DataField="发货数量" HeaderText="发货数量" DataFormatString="{0:F2}">
									<ItemStyle HorizontalAlign="Right"></ItemStyle>
								</asp:BoundColumn>
								<asp:BoundColumn DataField="发货时间" HeaderText="发货时间" DataFormatString="{0:d}"></asp:BoundColumn>
								<asp:BoundColumn DataField="收到时间" HeaderText="预计收到时间" DataFormatString="{0:d} "></asp:BoundColumn>
								<asp:BoundColumn DataField="说明" HeaderText="说明"></asp:BoundColumn>
								<asp:BoundColumn DataField="发货仓库" HeaderText="发货仓库"></asp:BoundColumn>
								<asp:BoundColumn DataField="收货仓库" HeaderText="收货仓库"></asp:BoundColumn>
								<asp:BoundColumn DataField="确认到货" HeaderText="确认到货"></asp:BoundColumn>
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
