<%@ Register TagPrefix="uc1" TagName="dgNavigation" Src="../../ascx/dgNavigation.ascx" %>
<%@ Page language="c#" Codebehind="dbddc_query.aspx.cs" AutoEventWireup="false" Inherits="jxc.webjxc.query.dbddc_query" %>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN" >
<HTML>
  <HEAD>
		<title></title>
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
								<td><font face="隶书" size="5">调入查询</font></td>
							</tr>
						</table>
					</td>
					<td width="250"></td>
				</tr>
			</table>
			<table class="title3" cellSpacing="0" cellPadding="0" width="100%" border="0">
				<tr>
					<td>&nbsp;
						<asp:dropdownlist id="Dropdownlist2" runat="server" Enabled="False" Visible="False">
<asp:ListItem Value="调入记录">调入记录</asp:ListItem>
<asp:ListItem Value="调出记录">调出记录</asp:ListItem>
						</asp:dropdownlist><FONT face="宋体">地区</FONT>
						<asp:dropdownlist id="DropDownList1" runat="server"></asp:dropdownlist><FONT face="宋体">产品名称
							<asp:textbox id="Textbox2" runat="server" Width="96px" CssClass="inputcss" BackColor="White"></asp:textbox></FONT>
					</td>
					<td>&nbsp;
					</td>
					<TD align="right">
						<asp:button id="query" runat="server" Width="72px" CssClass="buttoncss" Text="查询"></asp:button>
						<asp:button id="Button1" runat="server" Width="72px" CssClass="buttoncss" Text="已裁完" Visible="False"></asp:button>
						<asp:button id="Button2" runat="server" Width="72px" CssClass="buttoncss" Text="填写发货单" Visible="False"></asp:button>&nbsp;</TD>
				</tr>
			</table>
			<br>
			<table cellSpacing="0" cellPadding="0" width="100%" border="0">
				<TR>
					<TD><asp:datagrid id="Datagrid1" runat="server" BorderColor="#000066" AllowPaging="True" CssClass="title3"
							DataKeyField="dbid" AutoGenerateColumns="False" Height="0px" Width="100%" PageSize="12">
							<SelectedItemStyle BorderColor="#FFC0C0" BackColor="White"></SelectedItemStyle>
							<ItemStyle HorizontalAlign="Center"></ItemStyle>
							<HeaderStyle HorizontalAlign="Center"></HeaderStyle>
							<Columns>
								<asp:TemplateColumn HeaderText="选择">
									<HeaderStyle Width="10px"></HeaderStyle>
									<ItemTemplate>
										<asp:CheckBox id="selectcheck" runat="server" Height="8px" AutoPostBack="false"></asp:CheckBox>
									</ItemTemplate>
								</asp:TemplateColumn>
								<asp:BoundColumn DataField="dbid" HeaderText="调拨编号"></asp:BoundColumn>
								<asp:BoundColumn DataField="产品名称" HeaderText="产品名称">
									<ItemStyle Wrap="False"></ItemStyle>
								</asp:BoundColumn>
								<asp:BoundColumn DataField="调拨日期" HeaderText="调拨日期" DataFormatString="{0:d}">
									<ItemStyle Wrap="False"></ItemStyle>
								</asp:BoundColumn>
								<asp:BoundColumn DataField="调拨仓库" HeaderText="调入仓库">
									<ItemStyle Wrap="False"></ItemStyle>
								</asp:BoundColumn>
								<asp:BoundColumn DataField="原仓库" HeaderText="原仓库">
									<ItemStyle Wrap="False"></ItemStyle>
								</asp:BoundColumn>
								<asp:BoundColumn DataField="操作员" HeaderText="操作员">
									<ItemStyle Wrap="False"></ItemStyle>
								</asp:BoundColumn>
								<asp:BoundColumn DataField="调拨数量" HeaderText="调拨数量" DataFormatString="{0:F2}">
									<ItemStyle Wrap="False" HorizontalAlign="Right"></ItemStyle>
								</asp:BoundColumn>
								<asp:BoundColumn DataField="调拨说明" HeaderText="制作明细">
									<ItemStyle HorizontalAlign="Left"></ItemStyle>
								</asp:BoundColumn>
								<asp:BoundColumn DataField="xsid" HeaderText="销售单号"></asp:BoundColumn>
								<asp:BoundColumn DataField="确认到货" HeaderText="到货状态">
									<ItemStyle Wrap="False"></ItemStyle>
								</asp:BoundColumn>
								<asp:BoundColumn DataField="加工状态" HeaderText="加工状态">
									<ItemStyle Wrap="False"></ItemStyle>
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
