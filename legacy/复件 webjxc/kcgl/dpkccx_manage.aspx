<%@ Page language="c#" Codebehind="dpkccx_manage.aspx.cs" AutoEventWireup="false" Inherits="jxc.admin.bases.dpkccx_manage" %>
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
			<table height="50" cellSpacing="0" cellPadding="0" width="100%" align="center" border="0">
				<tr>
					<td width="556" background="/image/title.gif">
						<table cellSpacing="0" cellPadding="0" width="100%" border="0">
							<tr>
								<td height="1"></td>
							</tr>
							<tr>
								<td width="80"></td>
								<td><font face="隶书" size="5">地区库存查询</font></td>
							</tr>
						</table>
					</td>
					<td width="250"><FONT face="宋体"></FONT></td>
				</tr>
			</table>
			<table class="title3" cellSpacing="0" cellPadding="0" width="100%" border="0">
				<TR>
					<TD style="WIDTH: 79px; HEIGHT: 23px"><FONT face="宋体">
							<asp:checkbox id="CheckBox1" runat="server" Checked="True" Text="按日期"></asp:checkbox></FONT></TD>
					<TD style="WIDTH: 459px; HEIGHT: 23px"><FONT face="宋体">
							<asp:textbox id="Textbox1" runat="server" Width="80px" CssClass="inputcss"></asp:textbox>到
							<asp:textbox id="Textbox2" runat="server" Width="72px" CssClass="inputcss"></asp:textbox></FONT></TD>
					<TD style="HEIGHT: 23px" align="left"><FONT face="宋体">&nbsp;
							<asp:Label id="Label1" runat="server" Visible="False">发货类型</asp:Label>
							<asp:DropDownList id="DropDownList1" runat="server" Visible="False">
								<asp:ListItem Value="未发货">未发货</asp:ListItem>
								<asp:ListItem Value="已发货">已发货</asp:ListItem>
								<asp:ListItem Value="所有记录" Selected="True">所有记录</asp:ListItem>
							</asp:DropDownList>
							<asp:Label id="Label2" runat="server" Visible="False">到货状态</asp:Label>
							<asp:DropDownList id="DropDownList2" runat="server" Visible="False">
								<asp:ListItem Value="未到货">未到货</asp:ListItem>
								<asp:ListItem Value="已到货">已到货</asp:ListItem>
								<asp:ListItem Value="所有记录" Selected="True">所有记录</asp:ListItem>
							</asp:DropDownList></FONT></TD>
				</TR>
				<TR>
					<TD style="WIDTH: 79px">产品名称</TD>
					<TD style="WIDTH: 459px">
						<asp:textbox id="cpname" runat="server" CssClass="inputcss"></asp:textbox><FONT face="宋体">主类别
							<asp:dropdownlist style="Z-INDEX: 0" id="Dropdownlist3" runat="server"></asp:dropdownlist></FONT></TD>
					<TD align="right">
						<asp:button id="query" runat="server" Text="查询" Width="72px" CssClass="buttoncss" Height="24px"></asp:button>&nbsp;
						<asp:button id="add" runat="server" Text="产品下拨" Width="72px" CssClass="buttoncss" Height="24px"
							Visible="False"></asp:button>&nbsp;
						<asp:button id="change" runat="server" Text="发货确认" Width="80px" CssClass="buttoncss" Height="24"
							Visible="False"></asp:button>
						<asp:button id="delete" runat="server" Text="删除" Width="72px" CssClass="buttoncss" Height="24px"
							Visible="False" Enabled="False"></asp:button>&nbsp;</TD>
				</TR>
			</table>
			<TABLE class="title3" cellSpacing="0" cellPadding="0" width="100%" border="0">
				<TR>
					<TD><asp:datagrid id="Datagrid1" runat="server" Width="100%" CssClass="title3" Height="0px" BorderColor="#000066"
							AllowPaging="True" DataKeyField="rkid" AutoGenerateColumns="False" PageSize="50">
							<SelectedItemStyle BorderColor="#FFC0C0" BackColor="White"></SelectedItemStyle>
							<ItemStyle HorizontalAlign="Center"></ItemStyle>
							<HeaderStyle Font-Names="宋体" HorizontalAlign="Center" ForeColor="Purple"></HeaderStyle>
							<Columns>
								<asp:TemplateColumn Visible="False" HeaderText="选择">
									<HeaderStyle Width="40px"></HeaderStyle>
									<ItemTemplate>
										<asp:CheckBox id="selectcheck" runat="server" Height="8px" AutoPostBack="false"></asp:CheckBox>
									</ItemTemplate>
								</asp:TemplateColumn>
								<asp:BoundColumn DataField="入库单编号" HeaderText="入库单编号"></asp:BoundColumn>
								<asp:BoundColumn DataField="产品类别" HeaderText="主类别"></asp:BoundColumn>
								<asp:BoundColumn DataField="型号" HeaderText="二级类别"></asp:BoundColumn>
								<asp:BoundColumn DataField="产品名称" HeaderText="产品名称"></asp:BoundColumn>
								<asp:BoundColumn Visible="False" DataField="颜色" HeaderText="颜色"></asp:BoundColumn>
								<asp:BoundColumn Visible="False" DataField="规格" HeaderText="规格"></asp:BoundColumn>
								<asp:BoundColumn DataField="入库数量" HeaderText="入库数量" DataFormatString="{0:F2}">
									<ItemStyle HorizontalAlign="Right"></ItemStyle>
								</asp:BoundColumn>
								<asp:BoundColumn DataField="实际库存" HeaderText="剩余数量" DataFormatString="{0:F2}">
									<ItemStyle HorizontalAlign="Right"></ItemStyle>
								</asp:BoundColumn>
								<asp:BoundColumn DataField="入库单价" HeaderText="零售价"></asp:BoundColumn>
								<asp:BoundColumn DataField="仓库名称" HeaderText="所在库房"></asp:BoundColumn>
								<asp:BoundColumn DataField="店名" HeaderText="店名"></asp:BoundColumn>
								<asp:BoundColumn Visible="False" DataField="操作员" HeaderText="经办人"></asp:BoundColumn>
								<asp:BoundColumn DataField="入库日期" HeaderText="入库时间" DataFormatString="{0:d}"></asp:BoundColumn>
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
