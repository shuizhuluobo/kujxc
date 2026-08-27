<%@ Page language="c#" Codebehind="dqyyyhzb_query.aspx.cs" AutoEventWireup="false" Inherits="jxc.webjxc.query.dqyyyhzb_query" %>
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
								<td><font face="隶书" size="5">(地区)月营业汇总表</font></td>
							</tr>
						</table>
					</td>
					<td width="250"></td>
				</tr>
			</table>
			<table class="title3" cellSpacing="0" cellPadding="0" width="100%" border="0">
				<tr>
					<td>地区
					</td>
					<td>&nbsp;
						<asp:TextBox id="dqmc" runat="server"></asp:TextBox>
					</td>
					<td align="right"><asp:button id="query" runat="server" Text="查询" CssClass="buttoncss" Width="72px"></asp:button>&nbsp;</td>
				</tr>
			</table>
			<br>
			<table cellSpacing="0" cellPadding="0" width="100%" border="0">
				<TR>
					<TD><asp:datagrid id="Datagrid1" runat="server" BorderColor="#000066" AllowPaging="True" CssClass="title3"
							AutoGenerateColumns="False" Height="80px" Width="100%" PageSize="12">
							<SelectedItemStyle BorderColor="#FFC0C0" BackColor="White"></SelectedItemStyle>
							<ItemStyle HorizontalAlign="Center"></ItemStyle>
							<HeaderStyle HorizontalAlign="Center"></HeaderStyle>
							<Columns>
								<asp:TemplateColumn Visible="False" HeaderText="选择">
									<HeaderStyle Width="40px"></HeaderStyle>
									<ItemTemplate>
										<asp:CheckBox id="selectcheck" runat="server" Height="8px" AutoPostBack="false"></asp:CheckBox>
									</ItemTemplate>
								</asp:TemplateColumn>
								<asp:BoundColumn DataField="日期2" HeaderText="日期" DataFormatString="{0:d}"></asp:BoundColumn>
								<asp:BoundColumn DataField="地区" HeaderText="地区"></asp:BoundColumn>
								<asp:BoundColumn DataField="总金额" HeaderText="营业额" DataFormatString="{0:F2}">
									<ItemStyle HorizontalAlign="Right"></ItemStyle>
								</asp:BoundColumn>
								<asp:BoundColumn DataField="销售成本" HeaderText="成本" DataFormatString="{0:F2}">
									<ItemStyle HorizontalAlign="Right"></ItemStyle>
								</asp:BoundColumn>
								<asp:BoundColumn DataField="毛利润" HeaderText="毛利润" DataFormatString="{0:F2}">
									<ItemStyle HorizontalAlign="Right"></ItemStyle>
								</asp:BoundColumn>
								<asp:BoundColumn DataField="毛利率" HeaderText="毛利率" DataFormatString="{0:F2}">
									<ItemStyle HorizontalAlign="Center"></ItemStyle>
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
