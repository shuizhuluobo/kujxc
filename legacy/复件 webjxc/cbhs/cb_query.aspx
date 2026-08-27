<%@ Page language="c#" Codebehind="cb_query.aspx.cs" AutoEventWireup="false" Inherits="jxc.webjxc.query.cb_query" %>
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
								<td><font face="隶书" size="5">库存成本查询</font></td>
							</tr>
						</table>
					</td>
					<td width="250"></td>
				</tr>
			</table>
			<table class="title3" cellSpacing="0" cellPadding="0" width="100%" border="0">
				<tr>
					<td>单位
					</td>
					<td><asp:dropdownlist id="DropDownList1" runat="server"></asp:dropdownlist>&nbsp;
					</td>
					<td><asp:radiobuttonlist id="RadioButtonList1" runat="server" CssClass="inputcss" Width="184px" RepeatDirection="Horizontal">
							<asp:ListItem Value="所有">所有</asp:ListItem>
							<asp:ListItem Value="有效库存" Selected="True">有效库存</asp:ListItem>
						</asp:radiobuttonlist></td>
					<td>库存数</td>
					<td><asp:textbox id="minkcs" runat="server" Width="80px">0</asp:textbox>至
						<asp:textbox id="maxkcs" runat="server" Width="80px">100000</asp:textbox></td>
					<td>成本过滤</td>
					<td><asp:textbox id="min" runat="server" Width="80px">0</asp:textbox>至
						<asp:textbox id="max" runat="server" Width="80px">100000</asp:textbox></td>
					<td align="right"><asp:button id="query" runat="server" Text="查询" CssClass="buttoncss" Width="72px"></asp:button></td>
				</tr>
			</table>
			<br>
			<table cellSpacing="0" cellPadding="0" width="100%" border="0">
				<TR>
					<TD><asp:datagrid id="Datagrid1" runat="server" CssClass="title3" Width="100%" PageSize="12" Height="80px"
							AutoGenerateColumns="False" AllowPaging="True" BorderColor="#000066">
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
								<asp:BoundColumn DataField="仓库名称" HeaderText="地区"></asp:BoundColumn>
								<asp:BoundColumn DataField="产品名称" HeaderText="产品名称"></asp:BoundColumn>
								<asp:BoundColumn DataField="kcs" HeaderText="库存数" DataFormatString="{0:F2}">
									<ItemStyle Wrap="False" HorizontalAlign="Right"></ItemStyle>
								</asp:BoundColumn>
								<asp:BoundColumn DataField="cb" HeaderText="成本" DataFormatString="{0:F2}">
									<ItemStyle Wrap="False" HorizontalAlign="Right"></ItemStyle>
								</asp:BoundColumn>
							</Columns>
							<PagerStyle Visible="False"></PagerStyle>
						</asp:datagrid></TD>
				</TR>
				<tr>
					<td class="title3">总库存数:
						<asp:Label id="zkcs" runat="server"></asp:Label>&nbsp;总成本
						<asp:Label id="zcb" runat="server"></asp:Label></td>
				</tr>
				<tr>
					<td align="left"><uc1:dgnavigation id="DgNavigation1" runat="server"></uc1:dgnavigation></td>
				</tr>
			</table>
		</form>
	</body>
</HTML>
