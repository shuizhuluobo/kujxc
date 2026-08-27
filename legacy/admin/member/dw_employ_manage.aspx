<%@ Page language="c#" Codebehind="dw_employ_manage.aspx.cs" AutoEventWireup="false" Inherits="health.admin.member.dw_employ_manage" %>
<%@ Register TagPrefix="uc1" TagName="dgNavigation" Src="../../ascx/dgNavigation.ascx" %>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN" >
<HTML>
	<HEAD>
		<title>个人网员管理</title>
		<meta content="Microsoft Visual Studio .NET 7.1" name="GENERATOR">
		<meta content="C#" name="CODE_LANGUAGE">
		<meta content="JavaScript" name="vs_defaultClientScript">
		<meta content="http://schemas.microsoft.com/intellisense/ie5" name="vs_targetSchema">
		<LINK href="/css/BasicLayout.css" type="text/css" rel="stylesheet">
	</HEAD>
	<body MS_POSITIONING="GridLayout">
		<form id="Form1" method="post" runat="server">
			<table class="title3" cellSpacing="0" cellPadding="0" width="100%" border="0">
				<TR>
					<TD align="left">姓&nbsp;&nbsp;名：<asp:textbox id="xm" runat="server" CssClass="inputcss" Width="80px"></asp:textbox>&nbsp;&nbsp; 
						身份证号：<asp:textbox id="sfzh" runat="server" CssClass="inputcss" MaxLength="18"></asp:textbox>&nbsp;&nbsp;&nbsp; 
						性别：
						<asp:radiobutton id="xb1" runat="server" Text="男" GroupName="xb"></asp:radiobutton><asp:radiobutton id="xb2" runat="server" Text="女" GroupName="xb"></asp:radiobutton>&nbsp;</TD>
				</TR>
				<TR>
					<TD align="left"><FONT face="宋体">学&nbsp; 历：
							<asp:radiobutton id="xl1" runat="server" Text="小学" GroupName="xl"></asp:radiobutton><asp:radiobutton id="xl2" runat="server" Text="初中" GroupName="xl"></asp:radiobutton><asp:radiobutton id="xl3" runat="server" Text="高中" GroupName="xl"></asp:radiobutton><asp:radiobutton id="xl4" runat="server" Text="专科" GroupName="xl"></asp:radiobutton><asp:radiobutton id="xl5" runat="server" Text="本科" GroupName="xl"></asp:radiobutton><asp:radiobutton id="xl6" runat="server" Text="研究生" GroupName="xl"></asp:radiobutton><asp:radiobutton id="xl7" runat="server" Text="其他" GroupName="xl"></asp:radiobutton>&nbsp;&nbsp;年龄组：
							<asp:radiobutton id="nlz1" runat="server" Text="成年A组" GroupName="nlz"></asp:radiobutton><asp:radiobutton id="nlz2" runat="server" Text="成年B组" GroupName="nlz"></asp:radiobutton><asp:radiobutton id="nlz3" runat="server" Text="老年组" GroupName="nlz"></asp:radiobutton>&nbsp;</FONT></TD>
				</TR>
				<TR>
					<TD align="left"><FONT face="宋体">成年组年龄段：
							<asp:radiobutton id="nld1" runat="server" Text="20～24" GroupName="nld"></asp:radiobutton><asp:radiobutton id="nld2" runat="server" Text="25～29" GroupName="nld"></asp:radiobutton><asp:radiobutton id="nld3" runat="server" Text="30～34" GroupName="nld"></asp:radiobutton><asp:radiobutton id="nld4" runat="server" Text="35～39" GroupName="nld"></asp:radiobutton><asp:radiobutton id="nld5" runat="server" Text="40～44" GroupName="nld"></asp:radiobutton><asp:radiobutton id="nld6" runat="server" Text="45～49" GroupName="nld"></asp:radiobutton><asp:radiobutton id="nld7" runat="server" Text="50～54" GroupName="nld"></asp:radiobutton><asp:radiobutton id="nld8" runat="server" Text="55～59" GroupName="nld"></asp:radiobutton>&nbsp;&nbsp;&nbsp;</FONT></TD>
				</TR>
				<tr>
					<td align="center"><asp:button id="query" runat="server" CssClass="buttoncss" Width="80px" Text="查询"></asp:button>&nbsp;&nbsp;
						<asp:button id="change" runat="server" CssClass="buttoncss" Width="80px" Text="体质检查数据" Height="20px"></asp:button>&nbsp;
						<asp:button id="reset" runat="server" CssClass="buttoncss" Width="80px" Text="清空查询条件"></asp:button></td>
				</tr>
			</table>
			<table cellSpacing="0" cellPadding="0" width="100%" border="0">
				<TR>
					<TD><asp:datagrid id="Datagrid1" runat="server" CssClass="title3" Width="100%" Height="80px" PageSize="20"
							AutoGenerateColumns="False" DataKeyField="sfzh" AllowPaging="True" BorderColor="#000066">
							<SelectedItemStyle BorderColor="#FFC0C0" BackColor="White"></SelectedItemStyle>
							<Columns>
								<asp:TemplateColumn HeaderText="选择">
									<HeaderStyle Width="40px"></HeaderStyle>
									<ItemTemplate>
										<asp:CheckBox id="selectcheck" runat="server" Height="8px" AutoPostBack="false"></asp:CheckBox>
									</ItemTemplate>
								</asp:TemplateColumn>
								<asp:BoundColumn DataField="xm" HeaderText="姓名"></asp:BoundColumn>
								<asp:BoundColumn DataField="sfzh" HeaderText="身份证号"></asp:BoundColumn>
								<asp:BoundColumn DataField="xb" HeaderText="姓别"></asp:BoundColumn>
								<asp:BoundColumn DataField="YWJB" HeaderText="有无疾病" Visible="False"></asp:BoundColumn>
								<asp:BoundColumn DataField="nl" HeaderText="年龄"></asp:BoundColumn>
								<asp:BoundColumn DataField="xl" HeaderText="学历"></asp:BoundColumn>
								<asp:BoundColumn DataField="SFJC" HeaderText="是否检测" Visible="False"></asp:BoundColumn>
								<asp:BoundColumn DataField="JCRQ" HeaderText="检查日期"></asp:BoundColumn>
								<asp:BoundColumn DataField="NLZ" HeaderText="年龄组"></asp:BoundColumn>
							</Columns>
							<PagerStyle Visible="False"></PagerStyle>
						</asp:datagrid></TD>
				</TR>
				<tr>
					<td align="left"><uc1:dgnavigation id="DgNavigation1" runat="server"></uc1:dgnavigation></td>
				</tr>
			</table>
		</form>
	</body>
</HTML>
