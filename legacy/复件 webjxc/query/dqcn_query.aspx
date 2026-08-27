<%@ Page language="c#" Codebehind="dqcn_query.aspx.cs" AutoEventWireup="false" Inherits="jxc.webjxc.query.dqcn_query" %>
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
								<td><font face="隶书" size="5">地区出纳帐查询</font></td>
							</tr>
						</table>
					</td>
					<td width="250"><FONT face="宋体"></FONT></td>
				</tr>
			</table>
			<table class="title3" cellSpacing="0" cellPadding="0" width="100%" border="0">
				<tr>
					<td><FONT face="宋体">地区</FONT>
					</td>
					<td>&nbsp;
						<asp:dropdownlist id="DropDownList1" runat="server" Width="97px"></asp:dropdownlist>
						<asp:CheckBox id="CheckBox1" runat="server" Text="按日期"></asp:CheckBox>
						<asp:textbox id="Textbox1" runat="server" Width="104px" CssClass="inputcss"></asp:textbox>到
						<asp:textbox id="Textbox2" runat="server" Width="104px" CssClass="inputcss"></asp:textbox>
						<asp:dropdownlist id="Dropdownlist2" runat="server">
							<asp:ListItem Value="所有">所有</asp:ListItem>
							<asp:ListItem Value="借方">借方</asp:ListItem>
							<asp:ListItem Value="贷方">贷方</asp:ListItem>
						</asp:dropdownlist>
					</td>
					<td align="right"><asp:button id="query" runat="server" Text="查询" CssClass="buttoncss" Width="72px"></asp:button>
						<asp:button id="Button1" runat="server" Width="72px" CssClass="buttoncss" Text="新增" Enabled="False"></asp:button>&nbsp;</td>
				</tr>
			</table>
			<br>
			<table cellSpacing="0" cellPadding="0" width="100%" border="0">
				<TR>
					<TD align="right"><asp:datagrid id="Datagrid1" runat="server" BorderColor="#000066" AllowPaging="True" CssClass="title3"
							DataKeyField="cnzid" AutoGenerateColumns="False" Height="80px" Width="100%" PageSize="12">
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
								<asp:BoundColumn DataField="凭证号" HeaderText="凭证号"></asp:BoundColumn>
								<asp:BoundColumn DataField="地区" HeaderText="地区">
									<ItemStyle Wrap="False"></ItemStyle>
								</asp:BoundColumn>
								<asp:BoundColumn DataField="日期" HeaderText="日期" DataFormatString="{0:d}"></asp:BoundColumn>
								<asp:BoundColumn DataField="摘要" HeaderText="摘要"></asp:BoundColumn>
								<asp:BoundColumn DataField="借方" HeaderText="借方" DataFormatString="{0:F2}">
									<ItemStyle Wrap="False" HorizontalAlign="Right"></ItemStyle>
								</asp:BoundColumn>
								<asp:BoundColumn DataField="贷方" HeaderText="贷方" DataFormatString="{0:F2}">
									<ItemStyle Wrap="False" HorizontalAlign="Right" ForeColor="Red"></ItemStyle>
								</asp:BoundColumn>
								<asp:BoundColumn HeaderText="借或贷"></asp:BoundColumn>
								<asp:BoundColumn DataField="余额" HeaderText="余额" DataFormatString="{0:F2}">
									<ItemStyle Wrap="False" HorizontalAlign="Right"></ItemStyle>
								</asp:BoundColumn>
								<asp:BoundColumn DataField="其他" HeaderText="备注"></asp:BoundColumn>
							</Columns>
							<PagerStyle Visible="False"></PagerStyle>
						</asp:datagrid>
						<asp:Label id="Label1" runat="server" Font-Size="12pt" ForeColor="Red"></asp:Label></TD>
				</TR>
				<tr>
					<td align="left"><uc1:dgnavigation id="DgNavigation1" runat="server"></uc1:dgnavigation></td>
				</tr>
			</table>
		</form>
	</body>
</HTML>
