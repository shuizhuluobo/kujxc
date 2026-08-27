<%@ Register TagPrefix="uc1" TagName="dgNavigation" Src="../../ascx/dgNavigation.ascx" %>
<%@ Page language="c#" Codebehind="kccx_kcjequery.aspx.cs" AutoEventWireup="false" Inherits="jxc.webjxc.query.kccx_kcjequery" %>
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
								<td><font face="隶书" size="5">库存查询</font></td>
							</tr>
						</table>
					</td>
					<td width="250"></td>
				</tr>
			</table>
			<table class="title3" cellSpacing="0" cellPadding="0" width="100%" border="0">
				<tr>
					<td>地区
						<asp:dropdownlist id="DropDownList1" runat="server" AutoPostBack="True"></asp:dropdownlist>&nbsp;
						<asp:dropdownlist id="Dropdownlist2" runat="server" AutoPostBack="True" Visible="False"></asp:dropdownlist>产品类别
						<asp:dropdownlist id="Dropdownlist3" runat="server"></asp:dropdownlist>
						<asp:textbox id="Textbox6" runat="server" CssClass="inputcss" Width="72px" Visible="False"></asp:textbox>产品名称
						<asp:textbox id="rkrq" runat="server" Width="96px" CssClass="inputcss"></asp:textbox>店名
						<asp:textbox id="Textbox5" runat="server" CssClass="inputcss" Width="72px"></asp:textbox>
						<asp:CheckBox id="CheckBox1" runat="server" Width="88px" Text="库存数量>0" Checked="True"></asp:CheckBox>
					</td>
					<td>&nbsp;
					</td>
					<TD align="right"><asp:button id="query" runat="server" Text="查询" CssClass="buttoncss" Width="72px"></asp:button>
						<asp:button id="Button1" runat="server" CssClass="buttoncss" Width="72px" Text="查看批次"></asp:button>&nbsp;</TD>
				</tr>
			</table>
			<br>
			<table cellSpacing="0" cellPadding="0" width="100%" border="0">
				<TR>
					<TD align="right" vAlign="top"><asp:datagrid id="Datagrid1" runat="server" BorderColor="#000066" CssClass="title3" AutoGenerateColumns="False"
							Height="80px" Width="100%" PageSize="12" ShowFooter="True" DataKeyField="cpid">
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
								<asp:BoundColumn DataField="仓库名称" HeaderText="仓库名称"></asp:BoundColumn>
								<asp:BoundColumn DataField="店名" HeaderText="店名"></asp:BoundColumn>
								<asp:BoundColumn DataField="cpid" HeaderText="产品编号"></asp:BoundColumn>
								<asp:BoundColumn DataField="产品类别" HeaderText="产品类别"></asp:BoundColumn>
								<asp:BoundColumn DataField="产品名称" HeaderText="产品名称"></asp:BoundColumn>
								<asp:BoundColumn DataField="库存数量" HeaderText="库存数量" DataFormatString="{0:F2}">
									<HeaderStyle HorizontalAlign="Right"></HeaderStyle>
									<ItemStyle HorizontalAlign="Right"></ItemStyle>
									<FooterStyle HorizontalAlign="Right"></FooterStyle>
								</asp:BoundColumn>
								<asp:BoundColumn DataField="金额" HeaderText="金额" DataFormatString="{0:F2}">
									<ItemStyle HorizontalAlign="Right"></ItemStyle>
								</asp:BoundColumn>
							</Columns>
							<PagerStyle Visible="False"></PagerStyle>
						</asp:datagrid>
						<asp:Label id="Label1" runat="server" Visible="False"></asp:Label></TD>
				</TR>
				<tr>
					<td align="left"><uc1:dgnavigation id="DgNavigation1" runat="server" Visible="False"></uc1:dgnavigation></td>
				</tr>
			</table>
		</form>
	</body>
</HTML>
