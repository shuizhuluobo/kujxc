<%@ Register TagPrefix="uc1" TagName="dgNavigation" Src="../../ascx/dgNavigation.ascx" %>
<%@ Page language="c#" Codebehind="kh_manage.aspx.cs" AutoEventWireup="false" Inherits="jxc.admin.bases.kh_manage" %>
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
								<td><font face="隶书" size="5">客户信息</font></td>
							</tr>
						</table>
					</td>
					<td width="250"></td>
				</tr>
			</table>
			<table class="title3" cellSpacing="0" cellPadding="0" width="100%" border="0">
				<tr>
					<td style="WIDTH: 203px">&nbsp;客户名称
						<asp:textbox id="cpname" runat="server" CssClass="inputcss" Width="84px"></asp:textbox>
						<asp:DropDownList id="DropDownList1" runat="server">
							<asp:ListItem Value="未删除">未删除</asp:ListItem>
							<asp:ListItem Value="已删除">已删除</asp:ListItem>
						</asp:DropDownList></td>
					<td style="WIDTH: 69px"><FONT face="宋体"></FONT></td>
					<TD align="right">
						<asp:button id="query" runat="server" CssClass="buttoncss" Height="24px" Width="64px" Text="查询"></asp:button>&nbsp;
						<asp:button id="add" runat="server" CssClass="buttoncss" Height="24px" Width="64px" Text="增加"></asp:button>&nbsp;
						<asp:button id="delete" runat="server" CssClass="buttoncss" Height="24px" Width="64px" Text="删除"></asp:button>&nbsp;
						<asp:button id="change" runat="server" CssClass="buttoncss" Text="修改" Width="72px" Height="24"></asp:button>&nbsp;
						<asp:button id="Button1" runat="server" Width="72px" CssClass="buttoncss" Text="数据删除" Height="24px"></asp:button></TD>
				</tr>
			</table>
			<table class="title3" cellSpacing="0" cellPadding="0" width="100%" border="0">
				<TR>
					<TD><asp:datagrid id="Datagrid1" runat="server" CssClass="title3" Width="100%" Height="80px" BorderColor="#000066"
							AllowPaging="True" DataKeyField="客户ID" AutoGenerateColumns="False" PageSize="50" CellPadding="0">
							<SelectedItemStyle BorderColor="#FFC0C0" BackColor="White"></SelectedItemStyle>
							<ItemStyle HorizontalAlign="Center" Height="30px"></ItemStyle>
							<HeaderStyle HorizontalAlign="Center"></HeaderStyle>
							<Columns>
								<asp:TemplateColumn HeaderText="选择">
									<HeaderStyle Width="40px"></HeaderStyle>
									<ItemTemplate>
										<asp:CheckBox id="selectcheck" runat="server" Height="8px" AutoPostBack="false"></asp:CheckBox>
									</ItemTemplate>
								</asp:TemplateColumn>
								<asp:BoundColumn DataField="客户ID" HeaderText="客户ID"></asp:BoundColumn>
								<asp:BoundColumn DataField="地区" HeaderText="地区"></asp:BoundColumn>
								<asp:BoundColumn DataField="客户名称" HeaderText="客户名称"></asp:BoundColumn>
								<asp:BoundColumn DataField="联系人" HeaderText="联系人"></asp:BoundColumn>
								<asp:BoundColumn DataField="电话" HeaderText="电话" DataFormatString="{0:F2}">
									<ItemStyle HorizontalAlign="Right"></ItemStyle>
								</asp:BoundColumn>
								<asp:BoundColumn DataField="传真" HeaderText="传真"></asp:BoundColumn>
								<asp:BoundColumn DataField="开户银行" HeaderText="开户银行"></asp:BoundColumn>
								<asp:BoundColumn DataField="单位地址" HeaderText="单位地址"></asp:BoundColumn>
								<asp:BoundColumn DataField="银行帐号" HeaderText="银行帐号"></asp:BoundColumn>
								<asp:BoundColumn DataField="助记码" HeaderText="助记码"></asp:BoundColumn>
							</Columns>
							<PagerStyle Visible="False"></PagerStyle>
						</asp:datagrid></TD>
				</TR>
				<tr>
					<td align="left"><uc1:dgnavigation id="DgNavigation1" runat="server"></uc1:dgnavigation></td>
				</tr>
				<tr>
					<td align="center">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
					</td>
				</tr>
			</table>
		</form>
	</body>
</HTML>
