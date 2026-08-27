<%@ Register TagPrefix="uc1" TagName="dgNavigation" Src="../ascx/dgNavigation.ascx" %>
<%@ Page language="c#" Codebehind="ggxx_manage.aspx.cs" AutoEventWireup="false" Inherits="jxc.admin.info.ggxx_manage" %>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN" >
<HTML>
	<HEAD>
		<title>公告内容管理</title>
		<meta name="GENERATOR" Content="Microsoft Visual Studio .NET 7.1">
		<meta name="CODE_LANGUAGE" Content="C#">
		<meta name="vs_defaultClientScript" content="JavaScript">
		<meta name="vs_targetSchema" content="http://schemas.microsoft.com/intellisense/ie5">
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
								<td><font face="隶书" size="5">公告浏览</font></td>
							</tr>
						</table>
					</td>
					<td width="250"></td>
				</tr>
			</table>
			<table cellpadding="0" cellspacing="0" border="0" width="100%" class="title3">
				<TR>
					<TD>
						<asp:datagrid id="Datagrid1" runat="server" PageSize="12" Width="100%" Height="80px" AutoGenerateColumns="False"
							CssClass="title3" DataKeyField="bh" AllowPaging="True">
							<SelectedItemStyle BorderColor="#FFC0C0" BackColor="White"></SelectedItemStyle>
							<Columns>
								<asp:BoundColumn DataField="bh" HeaderText="编号"></asp:BoundColumn>
								<asp:BoundColumn DataField="bt" HeaderText="标题"></asp:BoundColumn>
								<asp:BoundColumn DataField="zz" HeaderText="发布者"></asp:BoundColumn>
								<asp:BoundColumn DataField="fbsj" HeaderText="发布时间"></asp:BoundColumn>
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
							AutoPostBack="true" Visible="False"></asp:CheckBox>
						&nbsp;&nbsp;&nbsp;
						<asp:Button id="add" runat="server" Height="23px" Width="72px" Text="增加" CssClass="buttoncss"
							Visible="False"></asp:Button>&nbsp;&nbsp;&nbsp;
						<asp:Button id="delete" runat="server" Height="23px" Width="72px" Text="删除" CssClass="buttoncss"
							Visible="False"></asp:Button>&nbsp;&nbsp;&nbsp;
						<asp:Button id="change" runat="server" Height="23px" Width="72px" Text="预览修改" CssClass="buttoncss"
							Visible="False"></asp:Button>&nbsp;&nbsp;&nbsp;
					</td>
				</tr>
			</table>
		</form>
	</body>
</HTML>
