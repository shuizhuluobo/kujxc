<%@ Page language="c#" Codebehind="sp_manage.aspx.cs" AutoEventWireup="false" Inherits="jxc.admin.sp_manage" %>
<%@ Register TagPrefix="uc1" TagName="dgNavigation" Src="../ascx/dgNavigation.ascx" %>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN" >
<HTML>
	<HEAD>
		<title>审批文件管理</title>
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
								<td><font face="隶书" size="5">我的审批申请</font></td>
							</tr>
						</table>
					</td>
					<td width="250"></td>
				</tr>
			</table>
			<table cellSpacing="0" cellPadding="0" width="100%" border="0">
				<TR>
					<TD><asp:datagrid id="Datagrid1" runat="server" BorderColor="#000066" AllowPaging="True" DataKeyField="bh"
							CssClass="title3" AutoGenerateColumns="False" Height="80px" Width="100%" PageSize="12">
							<SelectedItemStyle BorderColor="#FFC0C0" BackColor="White"></SelectedItemStyle>
							<Columns>
								<asp:TemplateColumn HeaderText="选择">
									<HeaderStyle Width="40px"></HeaderStyle>
									<ItemTemplate>
										<asp:CheckBox id="selectcheck" runat="server" Height="8px" AutoPostBack="false"></asp:CheckBox>
									</ItemTemplate>
								</asp:TemplateColumn>
								<asp:BoundColumn DataField="bh" HeaderText="编号"></asp:BoundColumn>
								<asp:BoundColumn DataField="type" HeaderText="审批类型"></asp:BoundColumn>
								<asp:BoundColumn DataField="bt" HeaderText="标题"></asp:BoundColumn>
								<asp:BoundColumn DataField="fbsj" HeaderText="申请时间"></asp:BoundColumn>
								<asp:BoundColumn DataField="judge" HeaderText="流程状态"></asp:BoundColumn>
								<asp:BoundColumn DataField="status" HeaderText="审批状态"></asp:BoundColumn>
								<asp:BoundColumn DataField="finishdate" HeaderText="完成时间"></asp:BoundColumn>
							</Columns>
							<PagerStyle Visible="False"></PagerStyle>
						</asp:datagrid></TD>
				</TR>
				<tr>
					<td align="left"><uc1:dgnavigation id="DgNavigation1" runat="server"></uc1:dgnavigation></td>
				</tr>
				<tr>
					<td align="center">&nbsp;&nbsp;&nbsp;
						<asp:button id="add" runat="server" CssClass="buttoncss" Height="24px" Width="72px" Text="增加"></asp:button>&nbsp;&nbsp;&nbsp;
						<asp:button id="delete" runat="server" CssClass="buttoncss" Height="24px" Width="72px" Text="删除"></asp:button>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
						<asp:button id="changesort" runat="server" CssClass="buttoncss" Height="24" Width="92px" Text="审批过程查看"></asp:button></td>
				</tr>
			</table>
		</form>
	</body>
</HTML>
                                
                                 
