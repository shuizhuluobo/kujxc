<%@ Register TagPrefix="uc1" TagName="dgNavigation" Src="../../ascx/dgNavigation.ascx" %>
<%@ Page language="c#" Codebehind="jg_Set.aspx.cs" AutoEventWireup="false" Inherits="jxc.admin.bases.jg_Set" %>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN" >
<HTML>
	<HEAD>
		<title>机构管理</title>
		<meta content="Microsoft Visual Studio .NET 7.1" name="GENERATOR">
		<meta content="C#" name="CODE_LANGUAGE">
		<meta content="JavaScript" name="vs_defaultClientScript">
		<meta content="http://schemas.microsoft.com/intellisense/ie5" name="vs_targetSchema">
		<LINK href="/css/BasicLayout.css" type="text/css" rel="stylesheet">
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
								<td><font face="隶书" size="5">机构设置</font></td>
							</tr>
						</table>
					</td>
					<td width="250"></td>
				</tr>
			</table>
			<br>
			<table cellpadding="0" cellspacing="0" border="0" width="100%">
				<TR>
					<TD>
						<asp:datagrid id="Datagrid1" runat="server" PageSize="12" Width="100%" Height="80px" AutoGenerateColumns="False"
							CssClass="title3" DataKeyField="jgbh" AllowPaging="True">
							<SelectedItemStyle BorderColor="#FFC0C0" BackColor="White"></SelectedItemStyle>
							<Columns>
								<asp:TemplateColumn HeaderText="选择">
									<HeaderStyle Width="40px"></HeaderStyle>
									<ItemTemplate>
										<asp:CheckBox id="selectcheck" runat="server" Height="8px" AutoPostBack="false"></asp:CheckBox>
									</ItemTemplate>
								</asp:TemplateColumn>
								<asp:BoundColumn DataField="jgbh" HeaderText="机构编码"></asp:BoundColumn>
								<asp:BoundColumn DataField="jgmc" HeaderText="机构名称"></asp:BoundColumn>
								<asp:BoundColumn DataField="addr" HeaderText="地址"></asp:BoundColumn>
								<asp:BoundColumn DataField="lxr" HeaderText="联系人"></asp:BoundColumn>
								<asp:BoundColumn DataField="jc" HeaderText="简称"></asp:BoundColumn>
								<asp:BoundColumn DataField="lxdh" HeaderText="联系电话"></asp:BoundColumn>
								<asp:BoundColumn DataField="groups" HeaderText="组"></asp:BoundColumn>
								
								<asp:TemplateColumn HeaderText="序号">
									<ItemTemplate>
										<asp:TextBox id=sortid runat="server" Width="34px" Text='<%#DataBinder.Eval(Container.DataItem, "sortid") %>' BorderStyle="Groove">
										</asp:TextBox>
									</ItemTemplate>
								</asp:TemplateColumn>
							</Columns>
							<PagerStyle Visible="False"></PagerStyle>
						</asp:datagrid>
					</TD>
				</TR>
				<tr>
					<td align="left">
						<uc1:dgNavigation id="DgNavigation1" runat="server"></uc1:dgNavigation></td>
				</tr>
				<tr>
					<td align="center">
						&nbsp;&nbsp;&nbsp;
						<asp:Button id="add" runat="server" Height="24px" Width="72px" Text="增加" CssClass="buttoncss"></asp:Button>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
						<asp:Button id="change" runat="server" CssClass="buttoncss" Height="24px" Width="72px" Text="修改"></asp:Button>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
						<asp:Button id="delete" runat="server" Height="24px" Width="72px" Text="删除" CssClass="buttoncss"></asp:Button>&nbsp;&nbsp;&nbsp;&nbsp;
						<asp:Button id="Button1" runat="server" CssClass="buttoncss" Height="24px" Width="72px" Text="修改排序"></asp:Button>
					</td>
				</tr>
			</table>
		</form>
	</body>
</HTML>
                                
                                 
