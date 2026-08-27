<%@ Page language="c#" Codebehind="dqzz_query.aspx.cs" AutoEventWireup="false" Inherits="jxc.webjxc.query.dqzz_query" %>
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
								<td><font face="隶书" size="5">地区总帐查询</font></td>
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
					<td><asp:dropdownlist id="DropDownList1" runat="server" Width="97px"></asp:dropdownlist>&nbsp;
						<FONT face="宋体">分类
							<asp:dropdownlist id="Dropdownlist2" runat="server">
								<asp:ListItem Value="所有">所有</asp:ListItem>
								<asp:ListItem Value="调拨">调拨</asp:ListItem>
								<asp:ListItem Value="调拨回款">调拨回款</asp:ListItem>
								<asp:ListItem Value="公司进货">公司进货</asp:ListItem>
								<asp:ListItem Value="回款">回款</asp:ListItem>
								<asp:ListItem Value="其他">其他</asp:ListItem>
							</asp:dropdownlist>
							<asp:CheckBox id="CheckBox1" runat="server" Text="按日期" Checked="True"></asp:CheckBox>
							<asp:textbox id="Textbox1" runat="server" Width="104px" CssClass="inputcss"></asp:textbox>到
							<asp:textbox id="Textbox2" runat="server" Width="104px" CssClass="inputcss"></asp:textbox></FONT>
					</td>
					<td align="right"><asp:button id="query" runat="server" Text="查询" CssClass="buttoncss" Width="72px"></asp:button>
						<asp:button id="Button1" runat="server" Width="72px" CssClass="buttoncss" Text="新增" Enabled="False"></asp:button>&nbsp;</td>
				</tr>
			</table>
			<br>
			<table cellSpacing="0" cellPadding="0" width="100%" border="0">
				<TR>
					<TD align="right"><asp:datagrid id="Datagrid1" runat="server" BorderColor="#000066" AllowPaging="True" CssClass="title3"
							DataKeyField="zzid" AutoGenerateColumns="False" Height="80px" Width="100%" PageSize="12">
							<SelectedItemStyle BorderColor="#FFC0C0" BackColor="White"></SelectedItemStyle>
							<ItemStyle HorizontalAlign="Center"></ItemStyle>
							<HeaderStyle HorizontalAlign="Center"></HeaderStyle>
							<Columns>
								<asp:BoundColumn DataField="凭证号" HeaderText="凭证号"></asp:BoundColumn>
								<asp:BoundColumn DataField="地区" HeaderText="地区">
									<ItemStyle Wrap="False"></ItemStyle>
								</asp:BoundColumn>
								<asp:BoundColumn DataField="日期" HeaderText="日期" DataFormatString="{0:d}"></asp:BoundColumn>
								<asp:BoundColumn DataField="摘要" HeaderText="摘要"></asp:BoundColumn>
								<asp:BoundColumn DataField="借方" HeaderText="借方" DataFormatString="{0:F2}">
									<ItemStyle HorizontalAlign="Right"></ItemStyle>
								</asp:BoundColumn>
								<asp:BoundColumn DataField="贷方" HeaderText="贷方" DataFormatString="{0:F2}">
									<ItemStyle HorizontalAlign="Right" ForeColor="Red"></ItemStyle>
								</asp:BoundColumn>
								<asp:BoundColumn HeaderText="借或贷"></asp:BoundColumn>
								<asp:BoundColumn DataField="余额" HeaderText="余额" DataFormatString="{0:F2}">
									<ItemStyle HorizontalAlign="Right"></ItemStyle>
								</asp:BoundColumn>
								<asp:BoundColumn DataField="其他" HeaderText="备注"></asp:BoundColumn>
								<asp:BoundColumn DataField="分类" HeaderText="分类"></asp:BoundColumn>
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
