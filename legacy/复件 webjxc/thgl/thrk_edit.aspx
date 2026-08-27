<%@ Page language="c#" Codebehind="thrk_edit.aspx.cs" AutoEventWireup="false" Inherits="jxc.admin.bases.thrk_edit" %>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN" >
<HTML>
	<HEAD>
		<title>产品销售单</title>
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
								<td><font face="隶书" size="5">客户产品退货单</font></td>
							</tr>
						</table>
					</td>
					<td width="250"></td>
				</tr>
			</table>
			<br>
			<table class="title3" style="WIDTH: 657px; HEIGHT: 340px" borderColor="#003300" cellSpacing="2"
				cellPadding="0" width="657" align="center" border="1">
				<tr>
					<td style="HEIGHT: 4px" align="right" width="100" height="4">退货单编号
					</td>
					<td style="HEIGHT: 4px"><FONT face="宋体"><asp:textbox id="Textbox2" runat="server" ReadOnly="True" BackColor="#E0E0E0" Width="96px" CssClass="inputcss"></asp:textbox></FONT></td>
					<td colSpan="2">退货店名</td>
					<td style="HEIGHT: 4px" colSpan="2"><asp:textbox id="rkrq" runat="server" ReadOnly="True" Width="112px" CssClass="inputcss"></asp:textbox></td>
				</tr>
				<tr>
					<td style="HEIGHT: 22px" align="right" colSpan="6">
						<div align="center"><FONT face="宋体">退货产品明细</FONT>
						</div>
					</td>
				</tr>
				<tr>
					<td align="left" colSpan="6"><FONT face="宋体"></FONT><FONT face="宋体"><asp:datagrid id="Datagrid1" runat="server" Width="100%" CssClass="title3" Height="0px" PageSize="50"
								AutoGenerateColumns="False" DataKeyField="thmxid" BorderColor="#000066">
								<SelectedItemStyle BorderColor="#FFC0C0" BackColor="White"></SelectedItemStyle>
								<HeaderStyle Font-Names="宋体" ForeColor="Purple"></HeaderStyle>
								<Columns>
									<asp:TemplateColumn HeaderText="选择">
										<HeaderStyle Width="40px"></HeaderStyle>
										<ItemTemplate>
											<asp:CheckBox id="selectcheck" runat="server" Height="8px" AutoPostBack="false"></asp:CheckBox>
										</ItemTemplate>
									</asp:TemplateColumn>
									<asp:BoundColumn DataField="cpid" HeaderText="产品编码"></asp:BoundColumn>
									<asp:BoundColumn DataField="产品名称" HeaderText="产品名称"></asp:BoundColumn>
									<asp:BoundColumn DataField="退货数量" HeaderText="退货数量" DataFormatString="{0:F0}"></asp:BoundColumn>
									<asp:BoundColumn DataField="单价" HeaderText="单价" DataFormatString="{0:F2}">
										<ItemStyle HorizontalAlign="Right"></ItemStyle>
									</asp:BoundColumn>
									<asp:BoundColumn DataField="金额" HeaderText="金额" DataFormatString="{0:F2}">
										<ItemStyle HorizontalAlign="Right"></ItemStyle>
									</asp:BoundColumn>
								</Columns>
								<PagerStyle Visible="False"></PagerStyle>
							</asp:datagrid></FONT><asp:button id="Button1" runat="server" Width="62px" CssClass="buttoncss" Text="新增"></asp:button><asp:button id="Button2" runat="server" Width="62px" CssClass="buttoncss" Text="删除"></asp:button></td>
				</tr>
				<tr>
					<td style="HEIGHT: 23px" align="right"><FONT face="宋体">总计金额</FONT></td>
					<td style="HEIGHT: 23px"><asp:textbox id="Textbox8" runat="server" Width="96px" CssClass="inputcss">0</asp:textbox></td>
					<td style="WIDTH: 59px; HEIGHT: 23px"><FONT face="宋体">销售单号</FONT></td>
					<td style="WIDTH: 109px; HEIGHT: 23px" colSpan="3"><asp:textbox id="Textbox10" runat="server" Width="112px" CssClass="inputcss"></asp:textbox></td>
				</tr>
				<tr>
					<td style="HEIGHT: 23px" align="right" width="100"><FONT face="宋体">客户名称</FONT>
					</td>
					<td style="HEIGHT: 23px"><FONT face="宋体"><asp:textbox id="Textbox1" runat="server" BackColor="#C0FFC0" Width="96px" CssClass="inputcss"></asp:textbox></FONT></td>
					<td style="WIDTH: 59px; HEIGHT: 23px"><FONT face="宋体">退货日期</FONT></td>
					<td style="WIDTH: 109px; HEIGHT: 23px"><asp:textbox id="Textbox3" runat="server" ReadOnly="True" BackColor="#E0E0E0" Width="96px" CssClass="inputcss"></asp:textbox></td>
					<td style="WIDTH: 54px; HEIGHT: 23px"><FONT face="宋体">
							<asp:textbox id="txtwldwid" runat="server" BackColor="#C0FFC0" Width="96px" CssClass="inputcss"
								Visible="False"></asp:textbox></FONT></td>
					<td style="HEIGHT: 23px"></td>
				</tr>
				<TR>
					<TD style="HEIGHT: 21px" align="right" width="100"><FONT face="宋体">客户电话</FONT></TD>
					<TD style="HEIGHT: 21px"><FONT face="宋体"><asp:textbox id="Textbox5" runat="server" Width="96px" CssClass="inputcss"></asp:textbox></FONT></TD>
					<TD style="WIDTH: 59px; HEIGHT: 21px"><FONT face="宋体">备注</FONT></TD>
					<TD style="HEIGHT: 21px" colSpan="3"><FONT face="宋体"><asp:textbox id="Textbox6" runat="server" Width="318px" CssClass="inputcss"></asp:textbox></FONT></TD>
				</TR>
				<tr>
					<td style="HEIGHT: 21px" align="right" width="100">经办人 &nbsp;
					</td>
					<td style="HEIGHT: 21px"><asp:textbox id="czy" runat="server" BackColor="White" Width="96px" CssClass="inputcss"></asp:textbox></td>
					<td style="WIDTH: 59px; HEIGHT: 21px"><FONT face="宋体">电话</FONT></td>
					<td style="HEIGHT: 21px" colSpan="3"><asp:textbox id="Textbox7" runat="server" Width="96px" CssClass="inputcss"></asp:textbox></td>
				</tr>
			</table>
			<TABLE cellSpacing="0" cellPadding="0" width="100%" border="0">
				<TR>
					<TD style="HEIGHT: 37px" align="center"><asp:button id="save" runat="server" Width="62px" CssClass="buttoncss" Text="保存退货单"></asp:button>&nbsp;<INPUT class="buttoncss" style="WIDTH: 64px; HEIGHT: 20px" onclick="closes()" type="button"
							value="返回">
						<asp:button id="Button3" runat="server" Width="62px" CssClass="buttoncss" Text="生成退货单"></asp:button></TD>
				</TR>
			</TABLE>
		</form>
	</body>
</HTML>
