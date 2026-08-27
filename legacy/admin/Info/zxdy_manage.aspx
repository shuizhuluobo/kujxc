<%@ Register TagPrefix="uc1" TagName="dgNavigation" Src="../../ascx/dgNavigation.ascx" %>
<%@ Page language="c#" Codebehind="zxdy_manage.aspx.cs" AutoEventWireup="false" Inherits="jxc.admin.info.zxdy_manage" %>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN" >
<HTML>
	<HEAD>
		<title>zxdy_manage</title>
		<meta name="GENERATOR" Content="Microsoft Visual Studio .NET 7.1">
		<meta name="CODE_LANGUAGE" Content="C#">
		<meta name="vs_defaultClientScript" content="JavaScript">
		<meta name="vs_targetSchema" content="http://schemas.microsoft.com/intellisense/ie5">
		<link href="/css/BasicLayout.css" rel="stylesheet" type="text/css">
	</HEAD>
	<body MS_POSITIONING="GridLayout">
		<form id="Form1" method="post" runat="server">
			<table cellpadding="0" cellspacing="0" border="0" width="100%" height="50" align="center">
				<tr>
					<td width="556" background="/image/title.gif">
						<table cellpadding="0" cellspacing="0" border="0" width="100%">
							<tr>
								<td height="1"></td>
							</tr>
							<tr>
								<td width="80"></td>
								<td><font face="隶书" size="5">在线互动内容</font></td>
							</tr>
						</table>
					</td>
					<td width="250"></td>
				</tr>
			</table>
			<table cellpadding="0" cellspacing="0" border="0" width="100%">
				<TR>
					<TD>
						<asp:datagrid id="Datagrid1" runat="server" PageSize="12" Width="100%" Height="80px" AutoGenerateColumns="False"
							CssClass="title3" DataKeyField="zxdyid" AllowPaging="True">
							<SelectedItemStyle BorderColor="#FFC0C0" BackColor="White"></SelectedItemStyle>
							<Columns>
								<asp:ButtonColumn Visible="False" Text="选择" HeaderText="选择" CommandName="Select"></asp:ButtonColumn>
								<asp:TemplateColumn HeaderText="选择">
									<HeaderStyle Width="40px"></HeaderStyle>
									<ItemTemplate>
										<asp:CheckBox id="selectcheck" runat="server" Height="8px" AutoPostBack="false"></asp:CheckBox>
									</ItemTemplate>
								</asp:TemplateColumn>
								<asp:BoundColumn DataField="twxm" HeaderText="提问者"></asp:BoundColumn>
								<asp:BoundColumn DataField="fasj" HeaderText="提问时间"></asp:BoundColumn>
								<asp:BoundColumn DataField="twbt" HeaderText="标题"></asp:BoundColumn>
								<asp:BoundColumn DataField="lb" HeaderText="提问类别"></asp:BoundColumn>
								<asp:BoundColumn DataField="sfhf" HeaderText="状态"></asp:BoundColumn>
							</Columns>
							<PagerStyle Visible="False"></PagerStyle>
						</asp:datagrid>
						<uc1:dgNavigation id="DgNavigation1" runat="server"></uc1:dgNavigation>
					</TD>
				</TR>
				<tr>
					<td align="left"></td>
				</tr>
				<tr>
					<td align="center">&nbsp;&nbsp;&nbsp;&nbsp;
						<asp:Button id="delete" runat="server" Height="23px" Width="72px" Text="删除" CssClass="buttoncss"></asp:Button>&nbsp;
						<asp:Button id="ret" runat="server" Height="23px" Width="72px" Text="回复" CssClass="buttoncss"></asp:Button>
					</td>
				</tr>
			</table>
		</form>
	</body>
</HTML>
                                
                                 
