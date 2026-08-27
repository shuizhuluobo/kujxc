<%@ Register TagPrefix="uc1" TagName="dgNavigation" Src="../../ascx/dgNavigation.ascx" %>
<%@ Page language="c#" Codebehind="act_manage.aspx.cs" AutoEventWireup="false" Inherits="jxc.admin.bases.act_manage" %>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN" >
<HTML>
	<HEAD>
		<title>基础设置</title>
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
								<td><font face="隶书" size="5">会员级别栏目对照表</font></td>
							</tr>
						</table>
					</td>
					<td width="250"></td>
				</tr>
			</table>
			<table cellpadding="0" cellspacing="0" border="0" width="100%" class="title3">
				<TR>
					<TD>
						<asp:datagrid id="Datagrid1" runat="server" PageSize="50" Width="100%" Height="80px" AutoGenerateColumns="False"
							CssClass="title3" DataKeyField="id" AllowPaging="True" BorderColor="#000066">
							<SelectedItemStyle BorderColor="#FFC0C0" BackColor="White"></SelectedItemStyle>
							<Columns>
								<asp:TemplateColumn HeaderText="选择">
									<HeaderStyle Width="40px"></HeaderStyle>
									<ItemTemplate>
										<asp:CheckBox id="selectcheck" runat="server" Height="8px" AutoPostBack="false"></asp:CheckBox>
									</ItemTemplate>
								</asp:TemplateColumn>
								<asp:BoundColumn DataField="memtype" HeaderText="会员类型"></asp:BoundColumn>
								<asp:BoundColumn DataField="rank" HeaderText="会员级别"></asp:BoundColumn>
								<asp:BoundColumn DataField="actname" HeaderText="栏目名称"></asp:BoundColumn>
								<asp:BoundColumn DataField="nofee" HeaderText="免费条数"></asp:BoundColumn>
								<asp:BoundColumn DataField="count" HeaderText="查询条数"></asp:BoundColumn>
								<asp:BoundColumn DataField="feeone" HeaderText="每条费用"></asp:BoundColumn>
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
					<td align="center">&nbsp;&nbsp;&nbsp;
						<asp:Button id="add" runat="server" Height="24px" Width="72px" Text="增加" CssClass="buttoncss"></asp:Button>&nbsp;&nbsp;&nbsp;
						<asp:Button id="delete" runat="server" Height="24px" Width="72px" Text="删除" CssClass="buttoncss"></asp:Button>&nbsp;&nbsp;
						<asp:Button id="change" runat="server" Height="24" Width="80px" Text="修改" CssClass="buttoncss"></asp:Button>
					</td>
				</tr>
			</table>
		</form>
	</body>
</HTML>
                                
                                 
