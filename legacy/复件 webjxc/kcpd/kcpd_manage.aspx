<%@ Register TagPrefix="uc1" TagName="dgNavigation" Src="../../ascx/dgNavigation.ascx" %>
<%@ Page language="c#" Codebehind="kcpd_manage.aspx.cs" AutoEventWireup="false" Inherits="jxc.admin.bases.kcpd_manage" %>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN" >
<HTML>
	<HEAD>
		<title>产品基础信息</title>
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
								<td><font face="隶书" size="5">地区库存盘点</font></td>
							</tr>
						</table>
					</td>
					<td width="250"><FONT face="宋体"></FONT></td>
				</tr>
			</table>
			<table class="title3" cellSpacing="0" cellPadding="0" width="100%" border="0">
				<TR>
					<TD style="WIDTH: 79px; HEIGHT: 25px"></TD>
					<TD style="WIDTH: 125px; HEIGHT: 25px"></TD>
					<TD style="HEIGHT: 25px" align="right"><FONT face="宋体"></FONT></TD>
				</TR>
				<tr>
					<td style="WIDTH: 79px">产品名称</td>
					<td style="WIDTH: 125px"><asp:textbox id="cpname" runat="server" CssClass="inputcss"></asp:textbox></td>
					<td align="right"><asp:button id="query" runat="server" CssClass="buttoncss" Height="24px" Width="72px" Text="查询"></asp:button>&nbsp;
						<asp:button id="add" runat="server" CssClass="buttoncss" Height="24px" Width="72px" Text="新建盘点"></asp:button>&nbsp;
						<asp:button id="Button1" runat="server" CssClass="buttoncss" Height="24px" Width="72px" Text="样品出库"
							Visible="False"></asp:button>&nbsp;&nbsp;&nbsp;</td>
				</tr>
			</table>
			<TABLE class="title3" cellSpacing="0" cellPadding="0" width="100%" border="0">
				<TR>
					<TD><asp:datagrid id="Datagrid1" runat="server" CssClass="title3" Height="0px" Width="100%" BorderColor="#000066"
							DataKeyField="pdid" AutoGenerateColumns="False" PageSize="1">
							<SelectedItemStyle BorderColor="#FFC0C0" BackColor="White"></SelectedItemStyle>
							<EditItemStyle Font-Size="9pt"></EditItemStyle>
							<ItemStyle HorizontalAlign="Center"></ItemStyle>
							<HeaderStyle Font-Names="宋体" HorizontalAlign="Center" ForeColor="Purple"></HeaderStyle>
							<Columns>
								<asp:EditCommandColumn ButtonType="PushButton" UpdateText="更新" CancelText="取消" EditText="编辑"></asp:EditCommandColumn>
								<asp:BoundColumn Visible="False" DataField="pdid" ReadOnly="True" HeaderText="编码"></asp:BoundColumn>
								<asp:BoundColumn DataField="店名" ReadOnly="True" HeaderText="店名"></asp:BoundColumn>
								<asp:BoundColumn DataField="产品名称" ReadOnly="True" HeaderText="产品名称">
									<ItemStyle Wrap="False"></ItemStyle>
								</asp:BoundColumn>
								<asp:BoundColumn DataField="颜色" ReadOnly="True" HeaderText="色号"></asp:BoundColumn>
								<asp:BoundColumn DataField="规格" ReadOnly="True" HeaderText="规格"></asp:BoundColumn>
								<asp:BoundColumn DataField="实际库存" HeaderText="实际库存" DataFormatString="{0:F2}">
									<ItemStyle Wrap="False"></ItemStyle>
								</asp:BoundColumn>
								<asp:BoundColumn DataField="剩余数量" ReadOnly="True" HeaderText="电脑库存" DataFormatString="{0:F2}">
									<ItemStyle Wrap="False" HorizontalAlign="Right"></ItemStyle>
								</asp:BoundColumn>
								<asp:BoundColumn DataField="库存差" ReadOnly="True" HeaderText="库存差" DataFormatString="{0:F2}">
									<ItemStyle HorizontalAlign="Right"></ItemStyle>
								</asp:BoundColumn>
							</Columns>
							<PagerStyle Visible="False"></PagerStyle>
						</asp:datagrid></TD>
				</TR>
				<TR>
					<TD align="left"><uc1:dgnavigation id="DgNavigation1" runat="server" Visible="False"></uc1:dgnavigation></TD>
				</TR>
				<TR>
					<TD align="center">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
					</TD>
				</TR>
			</TABLE>
		</form>
	</body>
</HTML>
