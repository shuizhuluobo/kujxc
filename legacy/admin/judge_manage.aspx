<%@ Page language="c#" Codebehind="judge_manage.aspx.cs" AutoEventWireup="false" Inherits="jxc.admin.judge_manage" %>
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
								<td><font face="隶书" size="5">审批管理</font></td>
							</tr>
						</table>
					</td>
					<td width="250"></td>
				</tr>
			</table>
			<br>
			<table cellSpacing="0" cellPadding="0" width="100%" border="0" class="title3">
				<tbody>
					<tr>
						<td width="90" align="center" height="30" bgcolor="#666666"><img height="20" src="/image/icon_blackdown.gif" width="20" align="absMiddle" border="0">
							<b>我的审批</b></td>
						<td width="3">&nbsp;</td>
						<td width="90" align="center" bgcolor="#cccccc"><a href="my_judge_manage.aspx" target="_self"><b>已经审批</b></a></td>
						<td>&nbsp;</td>
					</tr>
				</tbody>
			</table>
			<table cellpadding="0" cellspacing="0" border="0" width="100%">
				<tr>
					<td>
						<asp:RadioButtonList id="RadioButtonList1" runat="server" Width="296px" CssClass="title3" RepeatDirection="Horizontal"
							AutoPostBack="True">
							<asp:ListItem Value="0" Selected="True">全部</asp:ListItem>
							<asp:ListItem Value="1">直接审批</asp:ListItem>
							<asp:ListItem Value="2">全程审批/高级审批</asp:ListItem>
						</asp:RadioButtonList>
					</td>
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
								<asp:BoundColumn DataField="glyname" HeaderText="申请人"></asp:BoundColumn>
								<asp:BoundColumn DataField="bt" HeaderText="标题"></asp:BoundColumn>
								<asp:BoundColumn DataField="fbsj" HeaderText="申请时间"></asp:BoundColumn>
								<asp:BoundColumn DataField="judge" HeaderText="流程状态"></asp:BoundColumn>
								<asp:BoundColumn DataField="status" HeaderText="审批状态"></asp:BoundColumn>
							</Columns>
							<PagerStyle Visible="False"></PagerStyle>
						</asp:datagrid></TD>
				</TR>
				<tr>
					<td align="left"><uc1:dgnavigation id="DgNavigation1" runat="server"></uc1:dgnavigation></td>
				</tr>
				<tr>
					<td align="center">&nbsp;&nbsp;&nbsp;
						<asp:button id="add" runat="server" CssClass="buttoncss" Height="24px" Width="72px" Text="进入审批"></asp:button>&nbsp;&nbsp;
						<asp:button id="judge" runat="server" Width="72px" Height="24px" CssClass="buttoncss" Text="管理审批"></asp:button>&nbsp;
					</td>
				</tr>
			</table>
		</form>
	</body>
</HTML>
                                
                                 
