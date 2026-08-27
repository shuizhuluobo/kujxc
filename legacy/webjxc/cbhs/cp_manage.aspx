<%@ Register TagPrefix="uc1" TagName="dgNavigation" Src="../../ascx/dgNavigation.ascx" %>
<%@ Page language="c#" Codebehind="cp_manage.aspx.cs" AutoEventWireup="false" Inherits="jxc.webjxc.query.cp_manage" %>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN" >
<HTML>
  <HEAD>
		<title>产品管理</title>
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
								<td><font face="隶书" size="5">库存商品查询</font></td>
							</tr>
						</table>
					</td>
					<td width="250"></td>
				</tr>
			</table>
			<table cellpadding="0" cellspacing="0" border="0" width="100%" class="title3">
				<tr>
					<td>单位
					</td>
					<td><asp:dropdownlist id="DropDownList1" runat="server"></asp:dropdownlist>&nbsp;
					</td>
					<td>产品名称&nbsp;&nbsp;
						<asp:TextBox id="cpmc" runat="server"></asp:TextBox>&nbsp;库存数
						<asp:TextBox id="min" runat="server" Width="80px">0</asp:TextBox>至
						<asp:TextBox id="max" runat="server" Width="80px">100000</asp:TextBox>
						&nbsp;
						<asp:Button id="query" runat="server" Width="72px" CssClass="buttoncss" Text="查询"></asp:Button>&nbsp;
						<asp:Button id="Button1" runat="server" Width="72px" Text="全部排除" CssClass="buttoncss"></asp:Button></td>
				</tr>
			</table>
			<table cellSpacing="0" cellPadding="0" width="100%" border="0">
				<TR>
					<TD><asp:datagrid id="Datagrid1" runat="server" BorderColor="#000066" AllowPaging="True" CssClass="title3"
							DataKeyField="cpid" AutoGenerateColumns="False" Height="80px" Width="100%" PageSize="12">
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
								<asp:BoundColumn DataField="cpid" HeaderText="编号"></asp:BoundColumn>
								<asp:BoundColumn DataField="产品名称" HeaderText="产品名称"></asp:BoundColumn>
								<asp:BoundColumn DataField="价格" HeaderText="价格" DataFormatString="{0:F2}">
									<ItemStyle HorizontalAlign="Right"></ItemStyle>
								</asp:BoundColumn>
								<asp:BoundColumn DataField="kcs" HeaderText="总库存数" DataFormatString="{0:F2}">
									<ItemStyle HorizontalAlign="Right"></ItemStyle>
								</asp:BoundColumn>
								<asp:ButtonColumn Text="排除" HeaderText="成本设置" CommandName="pc"></asp:ButtonColumn>
							</Columns>
							<PagerStyle Visible="False"></PagerStyle>
						</asp:datagrid></TD>
				</TR>
				<tr>
					<td align="left"><uc1:dgnavigation id="DgNavigation1" runat="server"></uc1:dgnavigation></td>
				</tr>
				<tr>
					<td align="center">&nbsp;&nbsp;&nbsp;
						<asp:Button id="add" runat="server" Height="24px" Width="72px" Text="成本核算" CssClass="buttoncss"></asp:Button>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
					</td>
				</tr>
			</table>
		</form>
	</body>
</HTML>
