<%@ Page language="c#" Codebehind="gysdzd_manage.aspx.cs" AutoEventWireup="false" Inherits="jxc.admin.bases.gysdzd_manage" %>
<%@ Register TagPrefix="uc1" TagName="dgNavigation" Src="../../ascx/dgNavigation.ascx" %>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN" >
<HTML>
	<HEAD>
		<title>供应商对账查询</title>
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
								<td><font face="隶书" size="5">供应商对账查询</font></td>
							</tr>
						</table>
					</td>
					<td width="250"><FONT face="宋体"></FONT></td>
				</tr>
			</table>
			<table class="title3" cellSpacing="0" cellPadding="0" width="100%" border="0">
				<TR>
					<TD style="HEIGHT: 23px; WIDTH: 116px"><FONT face="宋体"><asp:checkbox id="CheckBox1" runat="server" Text="按日期" Checked="True"></asp:checkbox></FONT></TD>
					<TD style="HEIGHT: 23px; WIDTH: 263px"><FONT face="宋体"><asp:textbox id="Textbox1" runat="server" CssClass="inputcss" Width="80px"></asp:textbox>到
							<asp:textbox id="Textbox2" runat="server" CssClass="inputcss" Width="72px"></asp:textbox></FONT></TD>
					<TD style="HEIGHT: 23px" align="left"><FONT face="宋体">&nbsp;
							<asp:label id="Label1" runat="server" Visible="False">发货类型</asp:label><asp:dropdownlist id="DropDownList1" runat="server" Visible="False">
								<asp:ListItem Value="未发货">未发货</asp:ListItem>
								<asp:ListItem Value="已发货">已发货</asp:ListItem>
								<asp:ListItem Value="所有记录" Selected="True">所有记录</asp:ListItem>
							</asp:dropdownlist><asp:label id="Label2" runat="server" Visible="False">到货状态</asp:label><asp:dropdownlist id="DropDownList2" runat="server" Visible="False">
								<asp:ListItem Value="未到货">未到货</asp:ListItem>
								<asp:ListItem Value="已到货">已到货</asp:ListItem>
								<asp:ListItem Value="所有记录" Selected="True">所有记录</asp:ListItem>
							</asp:dropdownlist></FONT></TD>
				</TR>
				<TR>
					<TD style="WIDTH: 116px">
						<asp:checkbox id="Checkbox2" runat="server" Checked="True" Text="相似" Width="48px"></asp:checkbox>供应商名称</TD>
					<TD style="WIDTH: 263px"><asp:textbox id="cpname" runat="server" CssClass="inputcss" Width="96px"></asp:textbox><FONT face="宋体">产品名称
							<asp:textbox id="Textbox3" runat="server" Width="96px" CssClass="inputcss"></asp:textbox></FONT></TD>
					<TD align="right"><asp:button id="query" runat="server" Text="查询" CssClass="buttoncss" Width="56px" Height="24px"></asp:button>&nbsp;
						<asp:button id="add" runat="server" Text="产品下拨" CssClass="buttoncss" Width="56px" Height="24px"
							Visible="False"></asp:button>&nbsp;
						<asp:button id="change" runat="server" Text="对帐确认" CssClass="buttoncss" Width="64px" Height="24"></asp:button><asp:button id="delete" runat="server" Text="删除" CssClass="buttoncss" Width="40px" Visible="False"
							Height="24px" Enabled="False"></asp:button>&nbsp;</TD>
				</TR>
			</table>
			<TABLE class="title3" cellSpacing="0" cellPadding="0" width="100%" border="0">
				<TR>
					<TD><asp:datagrid id="Datagrid1" runat="server" CssClass="title3" Width="100%" Height="0px" PageSize="50"
							AutoGenerateColumns="False" DataKeyField="rkid" AllowPaging="True" BorderColor="#000066">
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
								<asp:BoundColumn Visible="False" DataField="rkid" HeaderText="入库单编号"></asp:BoundColumn>
								<asp:BoundColumn DataField="供应商" HeaderText="供应商"></asp:BoundColumn>
								<asp:BoundColumn DataField="cpid" HeaderText="产品编码"></asp:BoundColumn>
								<asp:BoundColumn DataField="产品名称" HeaderText="产品名称"></asp:BoundColumn>
								<asp:BoundColumn DataField="入库数量" HeaderText="入库数量" DataFormatString="{0:F2}">
									<ItemStyle HorizontalAlign="Right"></ItemStyle>
								</asp:BoundColumn>
								<asp:BoundColumn DataField="进货价" HeaderText="单价" DataFormatString="{0:F2}"></asp:BoundColumn>
								<asp:BoundColumn DataField="金额" HeaderText="金额" DataFormatString="{0:F2}"></asp:BoundColumn>
								<asp:BoundColumn DataField="入库日期" HeaderText="入库日期" DataFormatString="{0:d}"></asp:BoundColumn>
								<asp:BoundColumn DataField="地区" HeaderText="地区"></asp:BoundColumn>
								<asp:BoundColumn DataField="店名" HeaderText="店名"></asp:BoundColumn>
								<asp:BoundColumn DataField="标志" HeaderText="标志"></asp:BoundColumn>
								<asp:BoundColumn DataField="对帐状态" HeaderText="对帐状态"></asp:BoundColumn>
							</Columns>
							<PagerStyle Visible="False"></PagerStyle>
						</asp:datagrid>
						<asp:Label id="Label3" runat="server" ForeColor="Red"></asp:Label></TD>
				</TR>
				<TR>
					<TD align="left"><uc1:dgnavigation id="DgNavigation1" runat="server"></uc1:dgnavigation></TD>
				</TR>
				<TR>
					<TD align="center">
						<asp:datagrid style="Z-INDEX: 0" id="Datagrid2" runat="server" Width="100%" CssClass="title3"
							Height="0px" BorderColor="#000066" AllowPaging="True" DataKeyField="rkid" AutoGenerateColumns="False"
							PageSize="50">
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
								<asp:BoundColumn DataField="入库单编号" HeaderText="订货单编号"></asp:BoundColumn>
								<asp:BoundColumn Visible="False" DataField="型号" HeaderText="型号"></asp:BoundColumn>
								<asp:BoundColumn DataField="类别" HeaderText="类别">
									<HeaderStyle Wrap="False"></HeaderStyle>
								</asp:BoundColumn>
								<asp:BoundColumn DataField="产品名称" HeaderText="产品名称"></asp:BoundColumn>
								<asp:BoundColumn DataField="规格" HeaderText="单位"></asp:BoundColumn>
								<asp:BoundColumn DataField="入库数量" HeaderText="订货数量" DataFormatString="{0:F2}">
									<ItemStyle HorizontalAlign="Right"></ItemStyle>
								</asp:BoundColumn>
								<asp:BoundColumn DataField="进货价" HeaderText="进货价" DataFormatString="{0:F2}">
									<ItemStyle HorizontalAlign="Right"></ItemStyle>
								</asp:BoundColumn>
								<asp:BoundColumn DataField="备注" HeaderText="备注"></asp:BoundColumn>
								<asp:BoundColumn DataField="供应商" HeaderText="供应商"></asp:BoundColumn>
								<asp:BoundColumn DataField="操作员" HeaderText="经办人"></asp:BoundColumn>
								<asp:BoundColumn DataField="入库日期" HeaderText="入库时间" DataFormatString="{0:d}"></asp:BoundColumn>
								<asp:BoundColumn DataField="到货确认" HeaderText="到货确认"></asp:BoundColumn>
								<asp:BoundColumn DataField="付款标志" HeaderText="付款标志"></asp:BoundColumn>
								<asp:BoundColumn DataField="发票标志" HeaderText="发票标志"></asp:BoundColumn>
								<asp:BoundColumn DataField="说明" HeaderText="说明"></asp:BoundColumn>
							</Columns>
							<PagerStyle Visible="False"></PagerStyle>
						</asp:datagrid>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
					</TD>
				</TR>
			</TABLE>
		</form>
	</body>
</HTML>
