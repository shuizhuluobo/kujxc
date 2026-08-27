<%@ Register TagPrefix="uc1" TagName="dgNavigation" Src="../../ascx/dgNavigation.ascx" %>
<%@ Page language="c#" Codebehind="sprk_manage.aspx.cs" AutoEventWireup="false" Inherits="jxc.admin.bases.sprk_manage" %>
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
								<td><font face="隶书" size="5">商品入库</font></td>
							</tr>
						</table>
					</td>
					<td width="250"><FONT face="宋体"></FONT></td>
				</tr>
			</table>
			<table class="title3" cellSpacing="0" cellPadding="0" width="100%" border="0">
				<TR>
					<TD style="HEIGHT: 25px; WIDTH: 79px"><FONT face="宋体">发货类型</FONT></TD>
					<TD style="HEIGHT: 25px; WIDTH: 354px">
						<asp:DropDownList id="DropDownList1" runat="server">
							<asp:ListItem Value="未发货">未发货</asp:ListItem>
							<asp:ListItem Value="已发货">已发货</asp:ListItem>
							<asp:ListItem Value="所有记录" Selected="True">所有记录</asp:ListItem>
						</asp:DropDownList><FONT face="宋体">到货状态
							<asp:DropDownList id="DropDownList2" runat="server">
								<asp:ListItem Value="未到货">未到货</asp:ListItem>
								<asp:ListItem Value="已到货">已到货</asp:ListItem>
								<asp:ListItem Value="所有记录" Selected="True">所有记录</asp:ListItem>
							</asp:DropDownList></FONT></TD>
					<TD style="HEIGHT: 25px" align="left"><FONT face="宋体">
							<asp:checkbox id="CheckBox1" runat="server" Text="按日期" Checked="True"></asp:checkbox>
							<asp:textbox id="Textbox1" runat="server" CssClass="inputcss" Width="80px"></asp:textbox>
							<asp:Label id="Label1" runat="server">到</asp:Label>
							<asp:textbox id="Textbox2" runat="server" CssClass="inputcss" Width="80px"></asp:textbox>
							<asp:CheckBox id="CheckBox2" runat="server" Checked="True" Text="剩余数量>0"></asp:CheckBox></FONT></TD>
				</TR>
				<tr>
					<td style="WIDTH: 79px">产品名称</td>
					<td style="WIDTH: 354px"><asp:textbox id="cpname" runat="server" CssClass="inputcss"></asp:textbox><FONT face="宋体">订货单号
						</FONT>
						<asp:textbox id="Textbox3" runat="server" CssClass="inputcss"></asp:textbox></td>
					<td align="right"><asp:button id="query" runat="server" CssClass="buttoncss" Height="24px" Width="57px" Text="查询"></asp:button>
						<asp:button id="add" runat="server" CssClass="buttoncss" Height="24px" Width="64px" Text="申请下拨"
							Visible="False"></asp:button>
						<asp:button id="btn_xb" runat="server" Text="下拨入店" Width="56px" CssClass="buttoncss" Height="24px"></asp:button>
						<asp:button id="change" runat="server" CssClass="buttoncss" Height="24" Width="56px" Text="确认到货"
							Visible="False"></asp:button><asp:button id="delete" runat="server" CssClass="buttoncss" Height="24px" Width="56px" Text="删除"
							Enabled="False" Visible="False"></asp:button></td>
				</tr>
			</table>
			<TABLE class="title3" cellSpacing="0" cellPadding="0" width="100%" border="0">
				<TR>
					<TD>
						<asp:datagrid id="Datagrid1" runat="server" Width="100%" CssClass="title3" Height="0px" BorderColor="#000066"
							AllowPaging="True" DataKeyField="入库单编号" AutoGenerateColumns="False" PageSize="50" style="Z-INDEX: 0">
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
								<asp:BoundColumn DataField="入库单编号" HeaderText="订货单号"></asp:BoundColumn>
								<asp:BoundColumn DataField="类别" HeaderText="类别"></asp:BoundColumn>
								<asp:BoundColumn DataField="型号" HeaderText="二级类别"></asp:BoundColumn>
								<asp:BoundColumn DataField="产品名称" HeaderText="产品名称"></asp:BoundColumn>
								<asp:BoundColumn Visible="False" DataField="颜色" HeaderText="颜色"></asp:BoundColumn>
								<asp:BoundColumn DataField="规格" HeaderText="规格"></asp:BoundColumn>
								<asp:BoundColumn DataField="剩余数量" HeaderText="剩余数量" DataFormatString="{0:F2}">
									<ItemStyle HorizontalAlign="Right"></ItemStyle>
								</asp:BoundColumn>
								<asp:BoundColumn Visible="False" DataField="进货价" HeaderText="进货价" DataFormatString="{0:F2}">
									<ItemStyle HorizontalAlign="Right"></ItemStyle>
								</asp:BoundColumn>
								<asp:BoundColumn Visible="False" DataField="入库单价" HeaderText="零售价"></asp:BoundColumn>
								<asp:BoundColumn DataField="仓库名称" HeaderText="所在库房"></asp:BoundColumn>
								<asp:BoundColumn DataField="操作员" HeaderText="经办人"></asp:BoundColumn>
								<asp:BoundColumn DataField="入库日期" HeaderText="入库时间" DataFormatString="{0:d}"></asp:BoundColumn>
								<asp:BoundColumn DataField="到货确认" HeaderText="到货确认"></asp:BoundColumn>
								<asp:BoundColumn Visible="False" DataField="库保确认" HeaderText="总库保确认"></asp:BoundColumn>
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
