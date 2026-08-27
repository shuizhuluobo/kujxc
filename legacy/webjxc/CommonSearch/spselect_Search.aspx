<%@ Page language="c#" Codebehind="spselect_Search.aspx.cs" AutoEventWireup="false" Inherits="jxc.admin.bases.spselect_Search" %>
<%@ Register TagPrefix="uc1" TagName="dgNavigation" Src="../../ascx/dgNavigation.ascx" %>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN" >
<HTML>
	<HEAD>
		<title>产品选择</title>
		<meta content="Microsoft Visual Studio .NET 7.1" name="GENERATOR">
		<meta content="C#" name="CODE_LANGUAGE">
		<meta content="JavaScript" name="vs_defaultClientScript">
		<meta content="http://schemas.microsoft.com/intellisense/ie5" name="vs_targetSchema">
		<LINK href="/css/BasicLayout.css" type="text/css" rel="stylesheet">
	</HEAD>
	<body MS_POSITIONING="GridLayout">
		<form id="Form1" method="post" runat="server">
			<table class="title3" cellSpacing="0" cellPadding="0" width="100%" border="0">
				<TR>
					<TD style="WIDTH: 79px; HEIGHT: 25px"><FONT face="宋体"></FONT></TD>
					<TD style="WIDTH: 125px; HEIGHT: 25px"><FONT face="宋体"></FONT></TD>
					<TD style="HEIGHT: 25px" align="right"><FONT face="宋体"></FONT></TD>
				</TR>
				<tr>
					<td style="WIDTH: 79px">产品名称</td>
					<td style="WIDTH: 125px"><asp:textbox id="cpname" runat="server" CssClass="inputcss"></asp:textbox></td>
					<td align="right"><asp:button id="query" runat="server" CssClass="buttoncss" Text="查询" Width="72px" Height="24px"></asp:button>&nbsp;
						<asp:button id="add" runat="server" CssClass="buttoncss" Text="确定" Width="72px" Height="24px"
							Visible="False"></asp:button>&nbsp;&nbsp;&nbsp;</td>
				</tr>
			</table>
			<TABLE class="title3" cellSpacing="0" cellPadding="0" width="100%" border="0">
				<TR>
					<TD>
						<asp:datagrid id="Datagrid1" runat="server" CssClass="title3" Height="0px" Width="100%" PageSize="40"
							AutoGenerateColumns="False" DataKeyField="cpid" AllowPaging="True" BorderColor="#000066">
							<SelectedItemStyle BorderColor="#FFC0C0" BackColor="White"></SelectedItemStyle>
							<HeaderStyle Font-Names="宋体" ForeColor="Purple"></HeaderStyle>
							<Columns>
								<asp:TemplateColumn Visible="False" HeaderText="选择">
									<HeaderStyle Width="40px"></HeaderStyle>
									<ItemTemplate>
										<asp:CheckBox id="selectcheck" runat="server" Height="8px" AutoPostBack="false"></asp:CheckBox>
									</ItemTemplate>
								</asp:TemplateColumn>
								<asp:BoundColumn DataField="cpid" HeaderText="编号"></asp:BoundColumn>
								<asp:BoundColumn DataField="产品名称" HeaderText="产品名称"></asp:BoundColumn>
								<asp:BoundColumn DataField="价格" HeaderText="价格" DataFormatString="{0:c}"></asp:BoundColumn>
								<asp:ButtonColumn Text="选择" ButtonType="PushButton" CommandName="Select"></asp:ButtonColumn>
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
