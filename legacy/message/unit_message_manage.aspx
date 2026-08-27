<%@ Page language="c#" Codebehind="unit_message_manage.aspx.cs" AutoEventWireup="false" Inherits="jxc.message.unit_message_manage" %>
<%@ Register TagPrefix="uc1" TagName="dgNavigation" Src="../ascx/dgNavigation.ascx" %>
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
								<td><font face="隶书" size="5">消息管理</font></td>
							</tr>
						</table>
					</td>
					<td width="250"></td>
				</tr>
			</table>
			<table cellSpacing="0" cellPadding="0" width="100%" border="0">
				<TR>
					<TD><asp:datagrid id="Datagrid1" runat="server" BorderColor="#000066" AllowPaging="True" DataKeyField="id"
							CssClass="title3" AutoGenerateColumns="False" Height="80px" Width="100%" PageSize="12">
							<SelectedItemStyle BorderColor="#FFC0C0" BackColor="White"></SelectedItemStyle>
							<Columns>
								<asp:TemplateColumn HeaderText="选择">
									<HeaderStyle Width="40px"></HeaderStyle>
									<ItemTemplate>
										<asp:CheckBox id="selectcheck" runat="server" Height="8px" AutoPostBack="false"></asp:CheckBox>
									</ItemTemplate>
								</asp:TemplateColumn>
								<asp:BoundColumn DataField="sender" HeaderText="发送者"></asp:BoundColumn>
								<asp:BoundColumn DataField="receiver" HeaderText="接收者"></asp:BoundColumn>
								<asp:BoundColumn DataField="content" HeaderText="内容"></asp:BoundColumn>
								<asp:BoundColumn DataField="sendsj" HeaderText="发送时间"></asp:BoundColumn>
								<asp:BoundColumn DataField="ifread" HeaderText="是否接收"></asp:BoundColumn>
							</Columns>
							<PagerStyle Visible="False"></PagerStyle>
						</asp:datagrid></TD>
				</TR>
				<tr>
					<td align="left"><uc1:dgnavigation id="DgNavigation1" runat="server"></uc1:dgnavigation></td>
				</tr>
				<tr>
					<td align="center">
						&nbsp;&nbsp;&nbsp;
						<asp:CheckBox id="selectall" runat="server" CssClass="title3" Height="22px" Width="56px" Text="全选"
							AutoPostBack="true"></asp:CheckBox>
						<asp:Button id="add" runat="server" Height="24px" Width="72px" Text="增加" CssClass="buttoncss"></asp:Button>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
						<asp:Button id="delete" runat="server" Width="72px" Height="24px" CssClass="buttoncss" Text="删除"></asp:Button>&nbsp;
					</td>
				</tr>
			</table>
		</form>
	</body>
</HTML>
                                
                                 
