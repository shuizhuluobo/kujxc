<%@ Page language="c#" Codebehind="spxbmccx_manage.aspx.cs" AutoEventWireup="false" Inherits="jxc.admin.bases.spxbmccx_manage" %>
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
								<td><font face="隶书" size="5">商品订货</font></td>
							</tr>
						</table>
					</td>
					<td width="250"><FONT face="宋体"></FONT></td>
				</tr>
			</table>
			<table class="title3" cellSpacing="0" cellPadding="0" width="100%" border="0">
				<TR>
					<TD style="WIDTH: 75px; HEIGHT: 25px"><FONT face="宋体"><asp:checkbox id="Checkbox2" runat="server" Text="按供应商"></asp:checkbox></FONT></TD>
					<TD style="WIDTH: 223px; HEIGHT: 25px"><FONT face="宋体"><asp:textbox id="txtgys" runat="server" CssClass="inputcss"></asp:textbox></FONT></TD>
					<TD style="HEIGHT: 25px" align="left"><FONT face="宋体"><asp:checkbox id="Checkbox3" runat="server" Text="按经办人"></asp:checkbox><asp:textbox id="Textbox3" runat="server" CssClass="inputcss"></asp:textbox></FONT></TD>
				</TR>
				<TR>
					<TD style="WIDTH: 75px; HEIGHT: 14px"><FONT face="宋体">发票标志</FONT></TD>
					<TD style="WIDTH: 223px; HEIGHT: 14px"><asp:dropdownlist id="DropDownList1" runat="server">
							<asp:ListItem Value="未开">未开</asp:ListItem>
							<asp:ListItem Value="已开">已开</asp:ListItem>
							<asp:ListItem Value="所有记录" Selected="True">所有记录</asp:ListItem>
						</asp:dropdownlist><FONT face="宋体">到货状态
							<asp:dropdownlist id="DropDownList2" runat="server">
								<asp:ListItem Value="未到货">未到货</asp:ListItem>
								<asp:ListItem Value="已到货">已到货</asp:ListItem>
								<asp:ListItem Value="所有记录" Selected="True">所有记录</asp:ListItem>
							</asp:dropdownlist></FONT></TD>
					<TD style="HEIGHT: 14px" align="left"><FONT face="宋体"><asp:checkbox id="CheckBox1" runat="server" Text="按日期" Checked="True"></asp:checkbox><asp:textbox id="Textbox1" runat="server" CssClass="inputcss" Width="104px"></asp:textbox>到
							<asp:textbox id="Textbox2" runat="server" CssClass="inputcss" Width="104px"></asp:textbox></FONT></TD>
				</TR>
				<TR>
					<TD style="WIDTH: 75px">产品名称</TD>
					<TD style="WIDTH: 223px"><asp:textbox id="cpname" runat="server" CssClass="inputcss"></asp:textbox></TD>
					<TD align="right"><asp:button id="query" runat="server" Text="查询" CssClass="buttoncss" Width="40px" Height="24px"></asp:button><asp:button id="add" runat="server" Text="产品订货" CssClass="buttoncss" Width="52px" Height="24px"
							Enabled="False" Visible="False"></asp:button><asp:button id="delete" runat="server" Text="单据作废" CssClass="buttoncss" Width="57px" Height="24px"
							Visible="False"></asp:button><asp:button id="btnedit" runat="server" Text="修改单据" CssClass="buttoncss" Width="56px" Height="24px"
							Visible="False"></asp:button><asp:button id="Button3" runat="server" Text="打印订单" CssClass="buttoncss" Width="56px" Height="24px"
							Visible="False"></asp:button></TD>
				</TR>
				<TR>
					<TD style="WIDTH: 75px"></TD>
					<TD style="WIDTH: 223px"><FONT face="宋体"></FONT></TD>
					<TD align="right"><asp:button id="change" runat="server" Text="到货确认" CssClass="buttoncss" Width="56px" Height="24"
							Enabled="False" Visible="False"></asp:button><asp:button id="Button2" runat="server" Text="发票确认" CssClass="buttoncss" Width="56px" Height="24"
							Enabled="False" Visible="False"></asp:button><asp:button id="Button1" runat="server" Text="付款确认" CssClass="buttoncss" Width="56px" Height="24"
							Enabled="False" Visible="False"></asp:button></TD>
				</TR>
			</table>
			<TABLE class="title3" cellSpacing="0" cellPadding="0" width="100%" border="0">
				<TR>
					<TD><asp:datagrid id="Datagrid1" runat="server" CssClass="title3" Width="100%" Height="0px" BorderColor="#000066"
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
								<asp:BoundColumn DataField="入库单编号" HeaderText="订货单编号"></asp:BoundColumn>
								<asp:BoundColumn DataField="类别" HeaderText="主类别">
									<HeaderStyle Wrap="False"></HeaderStyle>
								</asp:BoundColumn><asp:BoundColumn  DataField="型号" HeaderText="二级类别"></asp:BoundColumn>
								<asp:BoundColumn DataField="产品名称" HeaderText="产品名称"></asp:BoundColumn>
								<asp:BoundColumn DataField="规格" HeaderText="单位"></asp:BoundColumn>
								<asp:BoundColumn Visible="False" DataField="入库数量" HeaderText="订货数量" DataFormatString="{0:F2}">
									<ItemStyle HorizontalAlign="Right"></ItemStyle>
								</asp:BoundColumn>
								<asp:BoundColumn Visible="False" DataField="进货价" HeaderText="进货价" DataFormatString="{0:F2}">
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
						</asp:datagrid></TD>
				</TR>
				<TR>
					<TD align="left"><uc1:dgnavigation id="DgNavigation1" runat="server"></uc1:dgnavigation></TD>
				</TR>
				<TR>
					<TD align="center">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
					</TD>
				</TR>
			</TABLE>
		</form>
	</body>
</HTML>
