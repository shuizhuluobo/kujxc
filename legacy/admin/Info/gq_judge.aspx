<%@ Register TagPrefix="uc1" TagName="dgNavigation" Src="../../ascx/dgNavigation.ascx" %>
<%@ Page language="c#" Codebehind="gq_judge.aspx.cs" AutoEventWireup="false" Inherits="jxc.admin.Info.gq_judge" %>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN" >
<HTML>
	<HEAD>
		<title>供求信息审核</title>
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
								<td><font face="隶书" size="5">供求信息审核</font></td>
							</tr>
						</table>
					</td>
					<td width="250"></td>
				</tr>
			</table>
			<table class="title3" cellSpacing="0" cellPadding="0" width="100%" border="0">
				<tr>
					<td>审核状态：
						<asp:dropdownlist id="DropDownList1" runat="server">
							<asp:ListItem Value="-1">全部</asp:ListItem>
							<asp:ListItem Value="0">未审核</asp:ListItem>
							<asp:ListItem Value="100">已审核</asp:ListItem>
						</asp:dropdownlist>&nbsp;
						<asp:button id="query" runat="server" CssClass="buttoncss" Height="23px" Width="72px" Text="查询"></asp:button>&nbsp;</td>
					<td align="right"><asp:button id="Button1" runat="server" CssClass="buttoncss" Height="23px" Width="72px" Text="审核"></asp:button>&nbsp;
						<asp:button id="Button2" runat="server" CssClass="buttoncss" Height="23px" Width="72px" Text="删除"></asp:button></td>
				</tr>
			</table>
			<table class="title3" cellSpacing="0" cellPadding="0" width="100%" border="0">
				<TR>
					<TD><asp:datagrid id="Datagrid1" runat="server" AllowPaging="True" DataKeyField="id" CssClass="title3"
							AutoGenerateColumns="False" Height="80px" Width="100%" PageSize="12">
							<SelectedItemStyle BorderColor="#FFC0C0" BackColor="White"></SelectedItemStyle>
							<Columns>
								<asp:TemplateColumn HeaderText="选择">
									<HeaderStyle Width="40px"></HeaderStyle>
									<ItemTemplate>
										<asp:CheckBox id="selectcheck" runat="server" Height="8px" AutoPostBack="false"></asp:CheckBox>
									</ItemTemplate>
								</asp:TemplateColumn>
								<asp:BoundColumn DataField="title" HeaderText="标题"></asp:BoundColumn>
								<asp:BoundColumn DataField="area" HeaderText="贸易地区"></asp:BoundColumn>
								<asp:BoundColumn DataField="comid" HeaderText="会员号"></asp:BoundColumn>
								<asp:BoundColumn DataField="addtime" HeaderText="发布时间"></asp:BoundColumn>
								<asp:BoundColumn DataField="ifjudge" HeaderText="审核状态"></asp:BoundColumn>
							</Columns>
							<PagerStyle Visible="False"></PagerStyle>
						</asp:datagrid><uc1:dgnavigation id="DgNavigation1" runat="server"></uc1:dgnavigation></TD>
				</TR>
				<tr>
					<td align="left"></td>
				</tr>
				<tr>
					<td align="center">&nbsp;&nbsp;&nbsp;
						<asp:button id="judge" runat="server" CssClass="buttoncss" Height="23px" Width="72px" Text="审核"></asp:button>&nbsp;&nbsp;&nbsp;
						<asp:button id="delete" runat="server" CssClass="buttoncss" Height="23px" Width="72px" Text="删除"></asp:button>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
					</td>
				</tr>
			</table>
		</form>
	</body>
</HTML>
                                
                                 
