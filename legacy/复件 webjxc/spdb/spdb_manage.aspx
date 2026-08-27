<%@ Page language="c#" Codebehind="spdb_manage.aspx.cs" AutoEventWireup="false" Inherits="jxc.admin.bases.spdb_manage" %>
<%@ Register TagPrefix="uc1" TagName="dgNavigation" Src="../../ascx/dgNavigation.ascx" %>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN" >
<HTML>
	<HEAD>
		<title>库房调拨</title>
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
								<td><font face="隶书" size="5">库房调拨</font></td>
							</tr>
						</table>
					</td>
					<td width="250"><FONT face="宋体"></FONT></td>
				</tr>
			</table>
			<table class="title3" cellSpacing="0" cellPadding="0" width="100%" border="0">
				<TR>
					<TD style="WIDTH: 79px; HEIGHT: 24px">产品名称</TD>
					<TD style="WIDTH: 125px; HEIGHT: 24px"><FONT face="宋体">
							<asp:textbox id="cpname" runat="server" CssClass="inputcss"></asp:textbox></FONT></TD>
					<TD style="HEIGHT: 24px" align="right"><FONT face="宋体"></FONT></TD>
				</TR>
				<tr>
					<td style="WIDTH: 79px"><FONT face="宋体">所在仓库</FONT></td>
					<td style="WIDTH: 125px">
						<asp:dropdownlist id="DropDownListlx" runat="server" CssClass="inputcss" Width="128px"></asp:dropdownlist></td>
					<td align="right"><asp:button id="query" runat="server" CssClass="buttoncss" Text="查询" Width="72px" Height="24px"></asp:button>
						<asp:button id="add" runat="server" CssClass="buttoncss" Text="产品调拨" Width="72px" Height="24px"></asp:button>
						<asp:button id="change" runat="server" CssClass="buttoncss" Text="确认到货" Width="80px" Height="24"
							Visible="False"></asp:button>
						<asp:button id="delete" runat="server" CssClass="buttoncss" Text="删除" Width="72px" Height="24px"
							Enabled="False" Visible="False"></asp:button>&nbsp;</td>
				</tr>
			</table>
			<TABLE class="title3" cellSpacing="0" cellPadding="0" width="100%" border="0">
				<TR>
					<TD>
						<asp:datagrid id="Datagrid1" runat="server" CssClass="title3" Height="0px" Width="100%" PageSize="50"
							AutoGenerateColumns="False" DataKeyField="rkid" AllowPaging="True" BorderColor="#000066">
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
								<asp:BoundColumn DataField="rkid" HeaderText="编号"></asp:BoundColumn>
								<asp:BoundColumn DataField="产品名称" HeaderText="产品名称"></asp:BoundColumn>
								<asp:BoundColumn DataField="入库日期" HeaderText="入库日期" DataFormatString="{0:d}"></asp:BoundColumn>
								<asp:BoundColumn DataField="仓库名称" HeaderText="所在库房"></asp:BoundColumn>
								<asp:BoundColumn DataField="操作员" HeaderText="操作员"></asp:BoundColumn>
								<asp:BoundColumn DataField="入库数量" HeaderText="入库数量" DataFormatString="{0:F2}">
									<ItemStyle HorizontalAlign="Right"></ItemStyle>
								</asp:BoundColumn>
								<asp:BoundColumn DataField="剩余数量" HeaderText="剩余数量" DataFormatString="{0:F2}">
									<ItemStyle HorizontalAlign="Right"></ItemStyle>
								</asp:BoundColumn>
								<asp:BoundColumn DataField="到货确认" HeaderText="到货确认"></asp:BoundColumn>
								<asp:BoundColumn DataField="库保确认" HeaderText="库保确认"></asp:BoundColumn>
							</Columns>
							<PagerStyle Visible="False"></PagerStyle>
						</asp:datagrid></TD>
				</TR>
				<TR>
					<TD align="left">
						<uc1:dgnavigation id="DgNavigation1" runat="server"></uc1:dgnavigation></TD>
				</TR>
				<TR>
					<TD align="center">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
					</TD>
				</TR>
			</TABLE>
		</form>
	</body>
</HTML>
