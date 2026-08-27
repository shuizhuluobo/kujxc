<%@ Register TagPrefix="uc1" TagName="dgNavigation" Src="../../ascx/dgNavigation.ascx" %>
<%@ Page language="c#" Codebehind="yplbsz_manage.aspx.cs" AutoEventWireup="false" Inherits="jxc.admin.bases.yplbsz_manage" %>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN" >
<HTML>
	<HEAD>
		<title>样品类别基础信息</title>
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
								<td><font face="隶书" size="5">样品类别信息</font></td>
							</tr>
						</table>
					</td>
					<td width="250"><FONT face="宋体"></FONT></td>
				</tr>
			</table>
			<table class="title3" cellSpacing="0" cellPadding="0" width="100%" border="0">
				<TR>
					<TD style="WIDTH: 79px; HEIGHT: 25px"><FONT face="宋体"></FONT></TD>
					<TD style="WIDTH: 177px; HEIGHT: 25px">
						<asp:DropDownList id="DropDownList1" runat="server" Visible="False">
							<asp:ListItem Value="未发货">未发货</asp:ListItem>
							<asp:ListItem Value="已发货">已发货</asp:ListItem>
							<asp:ListItem Value="所有记录" Selected="True">所有记录</asp:ListItem>
						</asp:DropDownList><FONT face="宋体">
							<asp:DropDownList id="DropDownList2" runat="server" Visible="False">
								<asp:ListItem Value="未到货">未到货</asp:ListItem>
								<asp:ListItem Value="已到货">已到货</asp:ListItem>
								<asp:ListItem Value="所有记录" Selected="True">所有记录</asp:ListItem>
							</asp:DropDownList></FONT></TD>
					<TD style="HEIGHT: 25px" align="right"><FONT face="宋体"></FONT></TD>
				</TR>
				<tr>
					<td style="WIDTH: 79px">样品类别</td>
					<td style="WIDTH: 177px"><asp:textbox id="cpname" runat="server" CssClass="inputcss"></asp:textbox></td>
					<td align="right"><asp:button id="query" runat="server" CssClass="buttoncss" Text="查询" Width="72px" Height="24px"></asp:button>&nbsp;
						<asp:button id="add" runat="server" CssClass="buttoncss" Text="修改" Width="72px" Height="24px"></asp:button>&nbsp;
						<asp:button id="change" runat="server" CssClass="buttoncss" Text="发货确认" Width="80px" Height="24"
							Visible="False"></asp:button>
						<asp:button id="delete" runat="server" CssClass="buttoncss" Text="删除" Width="72px" Height="24px"></asp:button>
						<asp:button id="post" runat="server" CssClass="buttoncss" Height="24px" Width="72px" Text="启用"></asp:button>
						<asp:button id="Button1" runat="server" CssClass="buttoncss" Height="24px" Width="72px" Text="数据删除"></asp:button>&nbsp;</td>
				</tr>
			</table>
			<TABLE class="title3" cellSpacing="0" cellPadding="0" width="100%" border="0">
				<TR>
					<TD>
						<asp:datagrid id="Datagrid1" runat="server" CssClass="title3" Height="0px" Width="100%" PageSize="50"
							AutoGenerateColumns="False" DataKeyField="yplbid" AllowPaging="True" BorderColor="#000066">
							<SelectedItemStyle BorderColor="#FFC0C0" BackColor="White"></SelectedItemStyle>
							<ItemStyle HorizontalAlign="Center"></ItemStyle>
							<HeaderStyle Font-Names="宋体" HorizontalAlign="Center" ForeColor="Purple"></HeaderStyle>
							<Columns>
								<asp:TemplateColumn HeaderText="选择">
									<HeaderStyle Width="40px"></HeaderStyle>
									<ItemTemplate>
										<asp:CheckBox id="selectcheck" runat="server" Height="8px" AutoPostBack="false"></asp:CheckBox>
									</ItemTemplate>
								</asp:TemplateColumn>
								<asp:BoundColumn Visible="False" DataField="yplbid" HeaderText="编号"></asp:BoundColumn>
								<asp:BoundColumn DataField="样品类别" HeaderText="样品类别"></asp:BoundColumn>
								<asp:BoundColumn DataField="撤柜天数" HeaderText="撤柜天数" DataFormatString="{0:F0}"></asp:BoundColumn>
								<asp:BoundColumn DataField="是否下柜" HeaderText="是否下柜"></asp:BoundColumn>
							</Columns>
							<PagerStyle Visible="False"></PagerStyle>
						</asp:datagrid></TD>
				</TR>
				<TR>
					<TD align="left">
						<uc1:dgnavigation id="DgNavigation1" runat="server"></uc1:dgnavigation></TD>
				</TR>
				<TR>
					<TD align="center">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
					</TD>
				</TR>
			</TABLE>
		</form>
	</body>
</HTML>
