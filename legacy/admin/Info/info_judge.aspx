<%@ Register TagPrefix="uc1" TagName="dgNavigation" Src="../../ascx/dgNavigation.ascx" %>
<%@ Page language="c#" Codebehind="info_judge.aspx.cs" AutoEventWireup="false" Inherits="jxc.admin.Info.info_judge" %>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN" >
<HTML>
	<HEAD>
		<title>咨询信息审核</title>
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
								<td><font face="隶书" size="5">咨询信息审核</font></td>
							</tr>
						</table>
					</td>
					<td width="250"></td>
				</tr>
			</table>
			<table class="title3" cellSpacing="0" cellPadding="0" width="100%" border="0">
				<TR>
					<TD><asp:datagrid id="Datagrid1" runat="server" BorderColor="#000066" AllowPaging="True" DataKeyField="bh"
							CssClass="title3" AutoGenerateColumns="False" Height="80px" Width="100%" PageSize="50">
							<SelectedItemStyle BorderColor="#FFC0C0" BackColor="White"></SelectedItemStyle>
							<Columns>
								<asp:TemplateColumn HeaderText="选择">
									<HeaderStyle Width="40px"></HeaderStyle>
									<ItemTemplate>
										<asp:CheckBox id="selectcheck" runat="server" Height="8px" AutoPostBack="false"></asp:CheckBox>
									</ItemTemplate>
								</asp:TemplateColumn>
								<asp:BoundColumn DataField="bh" HeaderText="编号"></asp:BoundColumn>
								<asp:BoundColumn DataField="des0" HeaderText="栏目"></asp:BoundColumn>
								<asp:BoundColumn DataField="des" HeaderText="专题"></asp:BoundColumn>
								<asp:BoundColumn DataField="bt" HeaderText="标题"></asp:BoundColumn>
								<asp:BoundColumn DataField="zz" HeaderText="发布者"></asp:BoundColumn>
								<asp:BoundColumn DataField="writer" HeaderText="作者"></asp:BoundColumn>
								<asp:BoundColumn DataField="fbsj" HeaderText="发布时间"></asp:BoundColumn>
								<asp:BoundColumn DataField="shzt" HeaderText="审核状态"></asp:BoundColumn>
							</Columns>
							<PagerStyle Visible="False"></PagerStyle>
						</asp:datagrid></TD>
				</TR>
				<tr>
					<td align="left"><uc1:dgnavigation id="DgNavigation1" runat="server"></uc1:dgnavigation></td>
				</tr>
				<tr>
					<td align="center">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
						<asp:button id="judge" runat="server" CssClass="buttoncss" Height="24" Width="80px" Text="进入审核"></asp:button></td>
					</TD></tr>
			</table>
		</form>
	</body>
</HTML>
                                
                                 
