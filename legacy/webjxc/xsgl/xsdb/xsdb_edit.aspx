<%@ Page language="c#" Codebehind="xsdb_edit.aspx.cs" AutoEventWireup="false" Inherits="jxc.admin.bases.xsdb_edit" %>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN" >
<HTML>
	<HEAD>
		<title>销售调拨</title>
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
								<td><font face="隶书" size="5">产品销售单-产品调拨</font></td>
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
					<td style="HEIGHT: 4px" align="right" width="100" height="4">销售单编号
					</td>
					<td style="HEIGHT: 4px"><FONT face="宋体"><asp:textbox id="Textbox2" runat="server" BackColor="#E0E0E0" Width="96px" CssClass="inputcss"></asp:textbox></FONT></td>
					<td colSpan="2">销售店名</td>
					<td style="HEIGHT: 4px" colSpan="2"><asp:textbox id="rkrq" runat="server" Width="96px" CssClass="inputcss"></asp:textbox></td>
				</tr>
				<tr>
					<td style="HEIGHT: 22px" align="right" colSpan="6">
						<div align="center"><FONT face="宋体">销售产品明细</FONT>
						</div>
					</td>
				</tr>
				<tr>
					<td align="left" colSpan="6"><FONT face="宋体"></FONT><FONT face="宋体"><asp:datagrid id="Datagrid1" runat="server" Width="100%" CssClass="title3" Height="0px" PageSize="20"
								AutoGenerateColumns="False" DataKeyField="xsdmxid" BorderColor="#000066">
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
									<asp:TemplateColumn HeaderText="仓库">
										<ItemTemplate>
											<asp:DropDownList id="DropDownList1" runat="server">
												<asp:ListItem Value="2">2</asp:ListItem>
												<asp:ListItem Value="3">3</asp:ListItem>
												<asp:ListItem></asp:ListItem>
											</asp:DropDownList>
										</ItemTemplate>
									</asp:TemplateColumn>
									<asp:BoundColumn DataField="产品名称" HeaderText="产品名称"></asp:BoundColumn>
									<asp:BoundColumn Visible="False" DataField="产品型号" HeaderText="产品型号"></asp:BoundColumn>
									<asp:BoundColumn DataField="销售数量" HeaderText="销售数量" DataFormatString="{0:F2}">
										<ItemStyle HorizontalAlign="Right"></ItemStyle>
									</asp:BoundColumn>
									<asp:BoundColumn DataField="制作明细" HeaderText="制作明细"></asp:BoundColumn>
									<asp:BoundColumn DataField="已调拨" HeaderText="是否调拨">
										<ItemStyle Wrap="False"></ItemStyle>
									</asp:BoundColumn>
									<asp:BoundColumn Visible="False" DataField="cpid" HeaderText="cpid"></asp:BoundColumn>
								</Columns>
								<PagerStyle Visible="False"></PagerStyle>
							</asp:datagrid></FONT><asp:button id="Button1" runat="server" Width="62px" CssClass="buttoncss" Text="调拨"></asp:button></td>
				</tr>
				<tr>
					<td style="HEIGHT: 23px" align="right"><FONT face="宋体">总计金额</FONT></td>
					<td style="HEIGHT: 23px"><asp:textbox id="Textbox8" runat="server" Width="96px" CssClass="inputcss">0</asp:textbox></td>
					<td style="WIDTH: 59px; HEIGHT: 23px"><FONT face="宋体">预付定金</FONT></td>
					<td style="WIDTH: 109px; HEIGHT: 23px" colSpan="3"><asp:textbox id="Textbox9" runat="server" Width="96px" CssClass="inputcss">0</asp:textbox></td>
				</tr>
				<tr>
					<td style="HEIGHT: 23px" align="right" width="100"><FONT face="宋体">客户名称</FONT>
					</td>
					<td style="HEIGHT: 23px"><FONT face="宋体"><asp:textbox id="Textbox1" runat="server" Width="96px" CssClass="inputcss"></asp:textbox></FONT></td>
					<td style="WIDTH: 59px; HEIGHT: 23px"><FONT face="宋体">销售日期</FONT></td>
					<td style="WIDTH: 109px; HEIGHT: 23px"><asp:textbox id="Textbox3" runat="server" Width="96px" CssClass="inputcss"></asp:textbox></td>
					<td style="WIDTH: 54px; HEIGHT: 23px"><FONT face="宋体">取货日期</FONT></td>
					<td style="HEIGHT: 23px"><asp:textbox id="Textbox4" runat="server" Width="96px" CssClass="inputcss"></asp:textbox></td>
				</tr>
				<TR>
					<TD style="HEIGHT: 21px" align="right" width="100"><FONT face="宋体">客户电话</FONT></TD>
					<TD style="HEIGHT: 21px"><FONT face="宋体"><asp:textbox id="Textbox5" runat="server" Width="96px" CssClass="inputcss"></asp:textbox></FONT></TD>
					<TD style="WIDTH: 59px; HEIGHT: 21px"><FONT face="宋体">备注</FONT></TD>
					<TD style="HEIGHT: 21px" colSpan="3"><FONT face="宋体"><asp:textbox id="Textbox6" runat="server" Width="318px" CssClass="inputcss"></asp:textbox></FONT></TD>
				</TR>
				<TR>
					<TD style="HEIGHT: 17px" align="right" colSpan="6"><FONT face="宋体">尊敬的客户：请您仔细核对此单内容，参看店内购物须知，并签字确认，我们将严守承诺。祝您万事如意。</FONT></TD>
				</TR>
				<tr>
					<td style="HEIGHT: 21px" align="right" width="100">经办人 &nbsp;
					</td>
					<td style="HEIGHT: 21px"><asp:textbox id="czy" runat="server" BackColor="#E0E0E0" Width="96px" CssClass="inputcss"></asp:textbox></td>
					<td style="WIDTH: 59px; HEIGHT: 21px"><FONT face="宋体">电话</FONT></td>
					<td style="HEIGHT: 21px" colSpan="3"><asp:textbox id="Textbox7" runat="server" Width="96px" CssClass="inputcss"></asp:textbox></td>
				</tr>
			</table>
			<TABLE cellSpacing="0" cellPadding="0" width="100%" border="0">
				<TR>
					<TD style="HEIGHT: 37px" align="center">&nbsp;&nbsp;<INPUT class="buttoncss" style="WIDTH: 64px; HEIGHT: 20px" onclick="closes()" type="button"
							value="返回">&nbsp;&nbsp;&nbsp;
					</TD>
				</TR>
			</TABLE>
		</form>
	</body>
</HTML>
