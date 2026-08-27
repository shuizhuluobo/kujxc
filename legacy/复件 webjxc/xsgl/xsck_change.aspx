<%@ Page language="c#" Codebehind="xsck_change.aspx.cs" AutoEventWireup="false" Inherits="jxc.admin.bases.xsck_change" %>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN" >
<HTML>
	<HEAD>
		<title>出库单据修改</title>
		<meta content="Microsoft Visual Studio .NET 7.1" name="GENERATOR">
		<meta content="C#" name="CODE_LANGUAGE">
		<meta content="JavaScript" name="vs_defaultClientScript">
		<meta content="http://schemas.microsoft.com/intellisense/ie5" name="vs_targetSchema">
		<LINK href="/css/BasicLayout.css" type="text/css" rel="stylesheet">
		<script language="javascript">
		function closes()
		{
			opener.location.href=opener.location.href;
			opener = null;
			window.close ();
		}
		
		</script>
		<meta http-equiv="Content-Type" content="text/html; charset=gb2312">
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
								<td><font face="隶书" size="5">产品销售<FONT face="隶书" size="5">审核</FONT>单</font></td>
							</tr>
						</table>
					</td>
					<td width="250"></td>
				</tr>
			</table>
			<br>
			<table class="title3" cellSpacing="2" cellPadding="0" width="657" align="center" border="1"
				borderColor="#003300" style="WIDTH: 657px; HEIGHT: 340px">
				<tr>
					<td width="100" height="4" align="right" style="HEIGHT: 4px">销售单编号
					</td>
					<td style="HEIGHT: 4px"><FONT face="宋体"><asp:textbox id="Textbox2" runat="server" BackColor="#E0E0E0" Width="96px" CssClass="inputcss"></asp:textbox></FONT></td>
					<td colspan="2">销售店名</td>
					<td colspan="2" style="HEIGHT: 4px">
						<asp:textbox id="rkrq" runat="server" Width="96px" CssClass="inputcss"></asp:textbox></td>
				</tr>
				<tr>
					<td colspan="6" align="right" style="HEIGHT: 22px">
						<div align="center"><FONT face="宋体">销售产品明细</FONT>
						</div>
					</td>
				</tr>
				<tr>
					<td colspan="6" align="left" style="HEIGHT: 159px"><FONT face="宋体"></FONT> <FONT face="宋体">
							<asp:datagrid id="Datagrid1" runat="server" CssClass="title3" Width="100%" Height="0px" AutoGenerateColumns="False"
								DataKeyField="test" BorderColor="#000066">
								<SelectedItemStyle BorderColor="#FFC0C0" BackColor="White"></SelectedItemStyle>
								<HeaderStyle Font-Names="宋体" ForeColor="Purple"></HeaderStyle>
								<Columns>
									<asp:TemplateColumn HeaderText="选择">
										<HeaderStyle Width="40px"></HeaderStyle>
										<ItemTemplate>
											<asp:CheckBox id="selectcheck" runat="server" Height="8px" AutoPostBack="false"></asp:CheckBox>
										</ItemTemplate>
									</asp:TemplateColumn>
									<asp:BoundColumn Visible="False" DataField="xsdmxid" ReadOnly="True" HeaderText="xsdmxid"></asp:BoundColumn>
									<asp:BoundColumn DataField="产品名称" ReadOnly="True" HeaderText="产品名称"></asp:BoundColumn>
									<asp:BoundColumn DataField="产品型号" ReadOnly="True" HeaderText="产品型号"></asp:BoundColumn>
									<asp:BoundColumn DataField="销售数量" HeaderText="销售数量"></asp:BoundColumn>
									<asp:BoundColumn DataField="零售价" HeaderText="单价"></asp:BoundColumn>
									<asp:BoundColumn DataField="总金额" ReadOnly="True" HeaderText="总金额"></asp:BoundColumn>
									<asp:BoundColumn Visible="False" DataField="test" HeaderText="test"></asp:BoundColumn>
									<asp:EditCommandColumn ButtonType="LinkButton" UpdateText="更新" CancelText="取消" EditText="编辑"></asp:EditCommandColumn>
								</Columns>
								<PagerStyle Visible="False"></PagerStyle>
							</asp:datagrid></FONT>
						<asp:button id="Button1" runat="server" CssClass="buttoncss" Width="62px" Text="新增"></asp:button>
						<asp:button id="Button2" runat="server" CssClass="buttoncss" Width="62px" Text="删除"></asp:button></td>
				</tr>
				<tr>
					<td style="HEIGHT: 23px" align="right"><FONT face="宋体">总计金额</FONT></td>
					<td style="HEIGHT: 23px">
						<asp:textbox id="Textbox8" runat="server" CssClass="inputcss" Width="96px" BackColor="Transparent">0</asp:textbox></td>
					<td style="WIDTH: 59px; HEIGHT: 23px"><FONT face="宋体">预付定金</FONT></td>
					<td colspan="3">
						<asp:textbox id="Textbox9" runat="server" CssClass="inputcss" Width="64px" BackColor="Transparent">0</asp:textbox>电话
						<asp:textbox id="Textbox7" runat="server" CssClass="inputcss" Width="96px"></asp:textbox>
						<asp:textbox id="Textbox10" runat="server" CssClass="inputcss" Width="17px" Visible="False"></asp:textbox>
						<asp:textbox id="Textbox4" runat="server" CssClass="inputcss" Width="24px" BackColor="Transparent"
							Visible="False"></asp:textbox>
						<asp:textbox id="Textbox5" runat="server" CssClass="inputcss" Width="32px" BackColor="Transparent"
							Visible="False"></asp:textbox>
						<asp:textbox id="Textbox11" runat="server" CssClass="inputcss" Width="20px" BackColor="#C0FFC0"
							Visible="False"></asp:textbox>
						<asp:textbox id="txtwldwid" runat="server" CssClass="inputcss" Width="30px" BackColor="Transparent"
							Visible="False"></asp:textbox></td>
				</tr>
				<tr>
					<td style="HEIGHT: 23px" align="right" width="100"><FONT face="宋体">客户名称</FONT>
					</td>
					<td style="HEIGHT: 23px"><FONT face="宋体">
							<asp:textbox id="Textbox1" runat="server" CssClass="inputcss" Width="96px" BackColor="SkyBlue"
								ReadOnly="True"></asp:textbox></FONT></td>
					<td style="WIDTH: 59px; HEIGHT: 23px"><FONT face="宋体">销售日期</FONT></td>
					<td style="WIDTH: 109px; HEIGHT: 23px">
						<asp:textbox id="Textbox3" runat="server" CssClass="inputcss" Width="96px" BackColor="Transparent"></asp:textbox></td>
					<td style="WIDTH: 54px; HEIGHT: 23px"><FONT face="宋体"></FONT></td>
					<td style="HEIGHT: 23px"></td>
				</tr>
				<TR>
					<TD style="HEIGHT: 21px" align="right" width="100"><FONT face="宋体">经办人</FONT></TD>
					<TD style="HEIGHT: 21px"><FONT face="宋体">
							<asp:textbox id="czy" runat="server" CssClass="inputcss" Width="96px" BackColor="Transparent"></asp:textbox></FONT></TD>
					<TD style="WIDTH: 59px; HEIGHT: 21px"><FONT face="宋体">备注</FONT></TD>
					<TD colspan="3" style="HEIGHT: 21px"><FONT face="宋体">
							<asp:textbox id="Textbox6" runat="server" CssClass="inputcss" Width="318px" BackColor="Transparent"></asp:textbox></FONT></TD>
				</TR>
			</table>
			<TABLE cellSpacing="0" cellPadding="0" width="100%" border="0">
				<TR>
					<TD style="HEIGHT: 37px" align="center">
						<asp:button id="save" runat="server" CssClass="buttoncss" Width="62px" Text="保存"></asp:button>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<INPUT class="buttoncss" style="WIDTH: 64px; HEIGHT: 20px" onclick="closes()" type="button"
							value="返回">
					</TD>
				</TR>
			</TABLE>
		</form>
	</body>
</HTML>
