<%@ Register TagPrefix="uc1" TagName="dgNavigation" Src="../ascx/dgNavigation.ascx" %>
<%@ Page language="c#" Codebehind="cjlj_manage.aspx.cs" AutoEventWireup="false" Inherits="jxc.admin.cjlj_manage" %>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN" >
<HTML>
	<HEAD>
		<title>cjlj_manage</title>
		<meta name="GENERATOR" Content="Microsoft Visual Studio .NET 7.1">
		<meta name="CODE_LANGUAGE" Content="C#">
		<meta name="vs_defaultClientScript" content="JavaScript">
		<meta name="vs_targetSchema" content="http://schemas.microsoft.com/intellisense/ie5">
		<link href="../css/global.css" rel="stylesheet" type="text/css">
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
								<td><font face="隶书" size="5">友情链接维护</font></td>
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
							CssClass="title3" DataKeyField="linkid" AllowPaging="True">
							<SelectedItemStyle BorderColor="#FFC0C0" BackColor="White"></SelectedItemStyle>
							<Columns>
								<asp:TemplateColumn HeaderText="选择">
									<HeaderStyle Width="40px"></HeaderStyle>
									<ItemTemplate>
										<asp:CheckBox id="selectcheck" runat="server" Height="8px" AutoPostBack="false"></asp:CheckBox>
									</ItemTemplate>
								</asp:TemplateColumn>
								<asp:BoundColumn DataField="xsmc" HeaderText="链接名称"></asp:BoundColumn>
								<asp:BoundColumn DataField="ljdz" HeaderText="链接地址"></asp:BoundColumn>
								<asp:TemplateColumn HeaderText="排序">
									<ItemTemplate>
										<asp:TextBox id=orderid runat="server" Width="74px" Text='<%#DataBinder.Eval(Container.DataItem, "xh") %>' BorderStyle="Groove">
										</asp:TextBox>
									</ItemTemplate>
								</asp:TemplateColumn>
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
					<td align="center">
						<asp:CheckBox id="selectall" runat="server" CssClass="title3" Height="22px" Width="56px" Text="全选"
							AutoPostBack="true"></asp:CheckBox>
						&nbsp;&nbsp;&nbsp;
						<asp:Button id="add" runat="server" Height="24px" Width="72px" Text="增加"></asp:Button>&nbsp;&nbsp;&nbsp;
						<asp:Button id="delete" runat="server" Height="24px" Width="72px" Text="删除"></asp:Button>&nbsp;&nbsp;
						<asp:Button id="Button1" runat="server" Height="24" Width="80px" Text="修改排序"></asp:Button>
					</td>
				</tr>
			</table>
		</form>
	</body>
</HTML>
                                
                                 
