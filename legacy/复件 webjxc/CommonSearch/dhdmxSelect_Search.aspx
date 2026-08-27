<%@ Page language="c#" Codebehind="dhdmxSelect_Search.aspx.cs" AutoEventWireup="false" Inherits="jxc.admin.bases.dhdmxSelect_Search" debug="False"%>
<%@ Register TagPrefix="uc1" TagName="dgNavigation" Src="../../ascx/dgNavigation.ascx" %>
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
			<table class="title3" cellSpacing="0" cellPadding="0" width="100%" border="0">
				<TR>
					<TD style="WIDTH: 99px; HEIGHT: 25px"><FONT face="宋体">供应商名称</FONT></TD>
					<TD style="WIDTH: 186px; HEIGHT: 25px"><FONT face="宋体">
							<asp:textbox id="Textbox1" runat="server" CssClass="inputcss"></asp:textbox></FONT></TD>
					<TD style="HEIGHT: 25px" align="right"></TD>
					<TD style="HEIGHT: 25px" align="right"><FONT face="宋体"></FONT></TD>
					<TD style="HEIGHT: 25px" align="right"><FONT face="宋体"></FONT></TD>
				</TR>
				<tr>
					<td style="WIDTH: 99px">产品名称</td>
					<td style="WIDTH: 186px">
						<asp:textbox id="cpname" runat="server" CssClass="inputcss"></asp:textbox></td>
					<TD align="right"><FONT face="宋体"></FONT></TD>
					<TD align="right">
						<asp:DropDownList id="DropDownList1" runat="server" Visible="False">
							<asp:ListItem Value="所有">所有</asp:ListItem>
							<asp:ListItem Value="正常">正常</asp:ListItem>
							<asp:ListItem Value="样品">样品</asp:ListItem>
						</asp:DropDownList></TD>
					<td align="right"><asp:button id="query" runat="server" CssClass="buttoncss" Text="查询" Width="72px" Height="24px"></asp:button>&nbsp;
						<asp:button id="add" runat="server" CssClass="buttoncss" Text="确定" Width="72px" Height="24px"
							Visible="False"></asp:button>&nbsp;&nbsp;&nbsp;</td>
				</tr>
			</table>
			<TABLE class="title3" cellSpacing="0" cellPadding="0" width="100%" border="0">
				<TR>
					<TD>
						<asp:datagrid id="Datagrid1" runat="server" CssClass="title3" Height="0px" Width="100%" PageSize="50"
							AutoGenerateColumns="False" AllowPaging="True" BorderColor="#000066">
							<SelectedItemStyle BorderColor="#FFC0C0" BackColor="White"></SelectedItemStyle>
							<ItemStyle HorizontalAlign="Center"></ItemStyle>
							<HeaderStyle Font-Names="宋体" HorizontalAlign="Center" ForeColor="Purple"></HeaderStyle>
							<Columns>
								<asp:BoundColumn Visible="False" DataField="仓库名称" HeaderText="仓库名称"></asp:BoundColumn>
								<asp:BoundColumn DataField="店名" HeaderText="所在店"></asp:BoundColumn>
								<asp:BoundColumn DataField="供应商" HeaderText="供应商"></asp:BoundColumn>
								<asp:BoundColumn DataField="cpid" HeaderText="产品编码"></asp:BoundColumn>
								<asp:BoundColumn DataField="产品名称" HeaderText="产品名称"></asp:BoundColumn>
								<asp:BoundColumn DataField="入库日期" HeaderText="入库日期" DataFormatString="{0:d}"></asp:BoundColumn>
								<asp:BoundColumn DataField="入库数量" HeaderText="入库数量" DataFormatString="{0:F2}">
									<ItemStyle HorizontalAlign="Right"></ItemStyle>
								</asp:BoundColumn>
								<asp:BoundColumn DataField="进货价" HeaderText="进货价" DataFormatString="{0:F2}"></asp:BoundColumn>
								<asp:ButtonColumn Text="选择" ButtonType="PushButton" CommandName="Select"></asp:ButtonColumn>
								<asp:BoundColumn DataField="入库单编号" HeaderText="入库单编号"></asp:BoundColumn>
								<asp:BoundColumn DataField="产品类别" HeaderText="产品类别"></asp:BoundColumn>
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
