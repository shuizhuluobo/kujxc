<%@ Page language="c#" Codebehind="khdzd_ysmanage.aspx.cs" AutoEventWireup="false" Inherits="jxc.admin.bases.khdzd_ysmanage" %>
<%@ Register TagPrefix="uc1" TagName="dgNavigation" Src="../../ascx/dgNavigation.ascx" %>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN" >
<HTML>
	<HEAD>
		<title>客户对账查询</title>
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
								<td><font face="隶书" size="5">客户对账查询</font></td>
							</tr>
						</table>
					</td>
					<td width="250"><FONT face="宋体"></FONT></td>
				</tr>
			</table>
			<table class="title3" cellSpacing="0" cellPadding="0" width="100%" border="0">
				<TR>
					<TD style="HEIGHT: 23px; WIDTH: 104px"><FONT face="宋体"><asp:checkbox id="CheckBox1" runat="server" Checked="True" Text="按日期"></asp:checkbox></FONT></TD>
					<TD style="HEIGHT: 23px; WIDTH: 343px"><FONT face="宋体"><asp:textbox id="Textbox1" runat="server" Width="80px" CssClass="inputcss"></asp:textbox>到
							<asp:textbox id="Textbox2" runat="server" Width="72px" CssClass="inputcss"></asp:textbox>
							<asp:label id="Label1" runat="server" style="Z-INDEX: 0">对帐状态</asp:label><asp:dropdownlist id="DropDownList1" runat="server" style="Z-INDEX: 0">
								<asp:ListItem Value="否">否</asp:ListItem>
								<asp:ListItem Value="是">是</asp:ListItem>
								<asp:ListItem Value="所有记录" Selected="True">所有记录</asp:ListItem>
							</asp:dropdownlist></FONT></TD>
					<TD style="HEIGHT: 23px" align="left"><FONT face="宋体">&nbsp;<asp:label id="Label2" runat="server" Visible="False">到货状态</asp:label><asp:dropdownlist id="DropDownList2" runat="server" Visible="False">
								<asp:ListItem Value="未到货">未到货</asp:ListItem>
								<asp:ListItem Value="已到货">已到货</asp:ListItem>
								<asp:ListItem Value="所有记录" Selected="True">所有记录</asp:ListItem>
							</asp:dropdownlist></FONT></TD>
				</TR>
				<TR>
					<TD style="WIDTH: 104px">
						<asp:checkbox id="Checkbox2" runat="server" Text="相似" Checked="True" Width="48px"></asp:checkbox>客户名称</TD>
					<TD style="WIDTH: 343px"><asp:textbox id="cpname" runat="server" Width="96px" CssClass="inputcss"></asp:textbox><FONT face="宋体">产品名称
							<asp:textbox id="Textbox3" runat="server" Width="96px" CssClass="inputcss"></asp:textbox></FONT></TD>
					<TD align="right"><asp:button id="query" runat="server" Text="查询" Width="56px" CssClass="buttoncss" Height="24px"></asp:button>&nbsp;
						<asp:button id="add" runat="server" Text="产品下拨" Width="56px" CssClass="buttoncss" Visible="False"
							Height="24px"></asp:button>&nbsp;
						<asp:button id="change" runat="server" Text="对帐确认" Width="64px" CssClass="buttoncss" Height="24"
							Enabled="False"></asp:button>&nbsp;<asp:button id="delete" runat="server" Text="打印明细" Width="80px" CssClass="buttoncss" Height="24px"></asp:button>&nbsp;</TD>
				</TR>
			</table>
			<TABLE class="title3" cellSpacing="0" cellPadding="0" width="100%" border="0">
				<TR>
					<TD><asp:datagrid id="Datagrid1" runat="server" Width="100%" CssClass="title3" Height="0px" BorderColor="#000066"
							AutoGenerateColumns="False" PageSize="50">
							<SelectedItemStyle BorderColor="#FFC0C0" BackColor="White"></SelectedItemStyle>
							<ItemStyle HorizontalAlign="Center"></ItemStyle>
							<HeaderStyle Font-Names="宋体" HorizontalAlign="Center" ForeColor="Purple"></HeaderStyle>
							<Columns>
								<asp:TemplateColumn HeaderText="选择">
									<HeaderStyle Width="40px"></HeaderStyle>
									<ItemTemplate>
										<asp:CheckBox id="selectcheck" runat="server" Height="8px" AutoPostBack="false"></asp:CheckBox>
									</ItemTemplate>
								</asp:TemplateColumn>
								<asp:BoundColumn DataField="客户名称" HeaderText="客户名称"></asp:BoundColumn>
								<asp:BoundColumn DataField="金额" HeaderText="金额" DataFormatString="{0:F2}"></asp:BoundColumn>
							</Columns>
							<PagerStyle Visible="False"></PagerStyle>
						</asp:datagrid>
						<asp:Label id="Label3" runat="server" ForeColor="Red"></asp:Label></TD>
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
