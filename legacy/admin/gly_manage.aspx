<%@ Page language="c#" Codebehind="gly_manage.aspx.cs" AutoEventWireup="false" Inherits="jxc.admin.gly_manage" %>
<%@ Register TagPrefix="uc1" TagName="dgNavigation" Src="../ascx/dgNavigation.ascx" %>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN" >
<HTML>
  <HEAD>
		<title>操作员管理</title>
		<meta name="GENERATOR" Content="Microsoft Visual Studio .NET 7.1">
		<meta name="CODE_LANGUAGE" Content="C#">
		<meta name="vs_defaultClientScript" content="JavaScript">
		<meta name="vs_targetSchema" content="http://schemas.microsoft.com/intellisense/ie5">
		<link href="../../css/style.css" rel="stylesheet" type="text/css">
  </HEAD>
	<body MS_POSITIONING="GridLayout">
		<form id="Form1" method="post" runat="server">
			<FONT face="宋体"></FONT><FONT face="宋体"></FONT>
			<table cellpadding="0" cellspacing="0" border="0" width="100%" height="50" align="center">
				<tr>
					<td width="556" background="/image/title.gif">
						<table cellpadding="0" cellspacing="0" border="0" width="100%">
							<tr>
								<td height="1"></td>
							</tr>
							<tr>
								<td width="80"></td>
								<td><font face="隶书" size="5">操作员管理</font></td>
							</tr>
						</table>
					</td>
					<td width="250"></td>
				</tr>
			</table>
			<br>
			<table cellSpacing="0" cellPadding="0" width="100%" border="0">
				<TBODY>
					<tr>
						<td>
							<asp:DataGrid id="DataGrid1" runat="server" AutoGenerateColumns="False" Width="100%" CssClass="title3"
								DataKeyField="glydh" AllowPaging="True">
<Columns>
<asp:TemplateColumn HeaderText="选择">
<HeaderStyle Width="40px">
</HeaderStyle>

<ItemTemplate>
											<asp:CheckBox id="selectcheck" runat="server" Height="8px" AutoPostBack="false"></asp:CheckBox>
										
</ItemTemplate>
</asp:TemplateColumn>
<asp:BoundColumn DataField="glydh" HeaderText="管理员代号"></asp:BoundColumn>
<asp:BoundColumn DataField="glyname" HeaderText="管理员姓名"></asp:BoundColumn>
<asp:BoundColumn DataField="ssjg" HeaderText="所属机构"></asp:BoundColumn>
<asp:BoundColumn DataField="zw" HeaderText="职务"></asp:BoundColumn>
<asp:BoundColumn DataField="role" HeaderText="角色"></asp:BoundColumn>
</Columns>

<PagerStyle Visible="False">
</PagerStyle>
							</asp:DataGrid></td>
					</tr>
					<tr>
						<td align="right">
							<uc1:dgNavigation id="DgNavigation1" runat="server"></uc1:dgNavigation></td>
					</tr>
					<tr>
						<td align="center">
							<asp:Button id="detail" runat="server" Text="增加" CssClass="buttoncss" Width="73px"></asp:Button>&nbsp;&nbsp;
							<asp:Button id="change" runat="server" CssClass="buttoncss" Width="73px" Text="修改"></asp:Button>&nbsp;&nbsp;
							<asp:Button id="delete" runat="server" CssClass="buttoncss" Width="73px" Text="删除"></asp:Button>&nbsp;&nbsp;
							<asp:Button id="Button2" runat="server" CssClass="buttoncss" Text="重置口令"></asp:Button>
						</td>
					</tr>
				</TBODY>
			</table>
		</form>
	</body>
</HTML>
