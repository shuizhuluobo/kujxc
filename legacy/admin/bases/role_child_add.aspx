<%@ Page language="c#" Codebehind="role_child_add.aspx.cs" AutoEventWireup="false" Inherits="jxc.admin.bases.role_child_add" %>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN" >
<HTML>
	<HEAD>
		<title>role_add</title>
		<meta content="Microsoft Visual Studio .NET 7.1" name="GENERATOR">
		<meta content="C#" name="CODE_LANGUAGE">
		<meta content="JavaScript" name="vs_defaultClientScript">
		<meta content="http://schemas.microsoft.com/intellisense/ie5" name="vs_targetSchema">
		<LINK href="/css/BasicLayout.css" type="text/css" rel="stylesheet">
		<script language="javascript">
		function closes()
		{
			opener.location.href=opener.location.href;
			opener = null;
			window.close ();
		}
		
		</script>
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
								<td><font face="隶书" size="5">角色设置</font></td>
							</tr>
						</table>
					</td>
					<td width="250"></td>
				</tr>
			</table>
			<table class="title3" cellSpacing="5" cellPadding="0" width="100%" border="0">
				<tr>
					<td align="right" width="100">角色名
					</td>
					<td><asp:dropdownlist id="role" runat="server"></asp:dropdownlist><FONT face="宋体">&nbsp;
							<asp:Button id="view" runat="server" Width="96px" CssClass="buttoncss" Text="权限查看"></asp:Button></FONT></td>
				</tr>
				<tr>
					<td align="right" width="100">功能
					</td>
					<td>
						<asp:dropdownlist id="Dropdownlist1" runat="server" AutoPostBack="True"></asp:dropdownlist>&nbsp;&nbsp;<asp:dropdownlist id="gn" runat="server" AutoPostBack="True"></asp:dropdownlist></td>
				</tr>
				<tr>
					<td align="right" width="100">&nbsp;
					</td>
					<td><asp:datagrid id="Datagrid1" runat="server" CssClass="title3" Width="400" PageSize="40" AutoGenerateColumns="False"
							AllowPaging="True" ShowHeader="False" BorderWidth="0">
							<SelectedItemStyle BorderColor="#FFC0C0" BackColor="White"></SelectedItemStyle>
							<Columns>
								<asp:TemplateColumn HeaderText="选择">
									<HeaderStyle Width="40px"></HeaderStyle>
									<ItemTemplate>
										<asp:CheckBox id="checkid" runat="server" Height="8px" AutoPostBack="false" Text='<%# DataBinder.Eval(Container, "DataItem.idname") %>'>
										</asp:CheckBox>
										<asp:Label id="labelid" runat="server" Text='<%# DataBinder.Eval(Container, "DataItem.ids") %>' Visible=False>
										</asp:Label>
									</ItemTemplate>
								</asp:TemplateColumn>
							</Columns>
							<PagerStyle Visible="False"></PagerStyle>
						</asp:datagrid></td>
				</tr>
				<tr>
					<td align="right" width="100">&nbsp;
					</td>
					<td></td>
				</tr>
			</table>
			<table cellSpacing="0" cellPadding="0" width="100%" border="0">
				<tr>
					<td align="center"><asp:button id="save" runat="server" CssClass="buttoncss" Width="62px" Text="保存"></asp:button>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<INPUT class="buttoncss" style="WIDTH: 64px; HEIGHT: 20px" onclick="closes()" type="button"
							value="返回">
					</td>
				</tr>
			</table>
		</form>
	</body>
</HTML>
