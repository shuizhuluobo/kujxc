<%@ Page language="c#" Codebehind="dqcw_query.aspx.cs" AutoEventWireup="false" Inherits="jxc.webjxc.query.dqcw_query" %>
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
								<td><font face="隶书" size="5">销售收入查询</font></td>
							</tr>
						</table>
					</td>
					<td width="250"></td>
				</tr>
			</table>
			<table class="title3" cellSpacing="0" cellPadding="0" width="100%" border="0">
				<tr>
					<td>&nbsp;
					</td>
					<td>&nbsp;
						<asp:CheckBox id="CheckBox1" runat="server" Text="按销售日期"></asp:CheckBox>
						<asp:textbox id="Textbox1" runat="server" Width="104px" CssClass="inputcss"></asp:textbox>单据类型
						<asp:dropdownlist id="Dropdownlist2" runat="server">
							<asp:ListItem Value="所有">所有</asp:ListItem>
							<asp:ListItem Value="已结算">已结算</asp:ListItem>
							<asp:ListItem Value="未结算">未结算</asp:ListItem>
						</asp:dropdownlist>
						<asp:dropdownlist id="DropDownList1" runat="server" Width="72px"></asp:dropdownlist>店名
						<asp:textbox id="Textbox2" runat="server" CssClass="inputcss" Width="104px"></asp:textbox>
					</td>
					<td align="right"><asp:button id="query" runat="server" Text="查询" CssClass="buttoncss" Width="72px"></asp:button>
						<asp:button id="Button1" runat="server" Text="结算" CssClass="buttoncss" Width="72px" Enabled="False"></asp:button>&nbsp;</td>
				</tr>
			</table>
			<br>
			<table cellSpacing="0" cellPadding="0" width="100%" border="0">
				<TR>
					<TD align="right"><asp:datagrid id="Datagrid1" runat="server" BorderColor="#000066" AllowPaging="True" CssClass="title3"
							DataKeyField="cwid" AutoGenerateColumns="False" Height="80px" Width="100%" PageSize="12">
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
								<asp:BoundColumn DataField="xsid" HeaderText="销售单号"></asp:BoundColumn>
								<asp:BoundColumn Visible="False" DataField="地区" HeaderText="地区"></asp:BoundColumn>
								<asp:BoundColumn DataField="店名" HeaderText="店名"></asp:BoundColumn>
								<asp:BoundColumn DataField="客户" HeaderText="客户"></asp:BoundColumn>
								<asp:BoundColumn DataField="经办人" HeaderText="经办人"></asp:BoundColumn>
								<asp:BoundColumn DataField="时间1" HeaderText="销售日期" DataFormatString="{0:d}"></asp:BoundColumn>
								<asp:BoundColumn DataField="时间2" HeaderText="取货日期" DataFormatString="{0:d}"></asp:BoundColumn>
								<asp:BoundColumn DataField="预收定金" HeaderText="预收定金" DataFormatString="{0:F2}">
									<HeaderStyle ForeColor="Red"></HeaderStyle>
									<ItemStyle HorizontalAlign="Right" ForeColor="Red"></ItemStyle>
								</asp:BoundColumn>
								<asp:BoundColumn DataField="尚未收回款" HeaderText="尚未收回款" DataFormatString="{0:F2}">
									<ItemStyle HorizontalAlign="Right"></ItemStyle>
								</asp:BoundColumn>
								<asp:BoundColumn Visible="False" DataField="销售成本" HeaderText="销售成本" DataFormatString="{0:F2}"></asp:BoundColumn>
								<asp:BoundColumn Visible="False" DataField="其他" HeaderText="其他"></asp:BoundColumn>
								<asp:BoundColumn DataField="是否结算" HeaderText="是否结算"></asp:BoundColumn>
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
