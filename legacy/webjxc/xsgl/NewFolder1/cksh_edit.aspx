<%@ Page language="c#" Codebehind="cksh_edit.aspx.cs" AutoEventWireup="false" Inherits="jxc.admin.bases.cksh_edit" %>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN" >
<HTML>
	<HEAD>
		<title>出库审核</title>
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
					<td colspan="6" align="left"><FONT face="宋体"></FONT> <FONT face="宋体">
							<asp:datagrid id="Datagrid1" runat="server" CssClass="title3" Width="100%" Height="0px" AutoGenerateColumns="False"
								DataKeyField="xsdmxid" BorderColor="#000066">
								<SelectedItemStyle BorderColor="#FFC0C0" BackColor="White"></SelectedItemStyle>
								<HeaderStyle Font-Names="宋体" ForeColor="Purple"></HeaderStyle>
								<Columns>
									<asp:TemplateColumn HeaderText="选择">
										<HeaderStyle Width="40px"></HeaderStyle>
										<ItemTemplate>
											<asp:CheckBox id="selectcheck" runat="server" Height="8px" AutoPostBack="false"></asp:CheckBox>
										</ItemTemplate>
									</asp:TemplateColumn>
									<asp:BoundColumn Visible="False" DataField="xsdmxid" HeaderText="xsdmxid"></asp:BoundColumn>
									<asp:BoundColumn DataField="产品名称" HeaderText="产品名称"></asp:BoundColumn>
									<asp:BoundColumn DataField="产品型号" HeaderText="产品型号"></asp:BoundColumn>
									<asp:BoundColumn DataField="销售数量" HeaderText="销售数量"></asp:BoundColumn>
									<asp:BoundColumn DataField="制作明细" HeaderText="制作明细"></asp:BoundColumn>
								</Columns>
								<PagerStyle Visible="False"></PagerStyle>
							</asp:datagrid></FONT>
						<asp:button id="Button1" runat="server" CssClass="buttoncss" Width="62px" Text="新增" Visible="False"></asp:button>
						<asp:button id="Button2" runat="server" CssClass="buttoncss" Width="62px" Text="删除" Visible="False"></asp:button></td>
				</tr>
				<tr>
					<td style="HEIGHT: 23px" align="right"><FONT face="宋体">总计金额</FONT></td>
					<td style="HEIGHT: 23px">
						<asp:textbox id="Textbox8" runat="server" CssClass="inputcss" Width="96px">0</asp:textbox></td>
					<td style="WIDTH: 59px; HEIGHT: 23px"><FONT face="宋体">预付定金</FONT></td>
					<td colspan="3" style="WIDTH: 109px; HEIGHT: 23px">
						<asp:textbox id="Textbox9" runat="server" CssClass="inputcss" Width="96px">0</asp:textbox></td>
				</tr>
				<tr>
					<td style="HEIGHT: 23px" align="right" width="100"><FONT face="宋体">客户名称</FONT>
					</td>
					<td style="HEIGHT: 23px"><FONT face="宋体">
							<asp:textbox id="Textbox1" runat="server" CssClass="inputcss" Width="96px"></asp:textbox></FONT></td>
					<td style="WIDTH: 59px; HEIGHT: 23px"><FONT face="宋体">销售日期</FONT></td>
					<td style="WIDTH: 109px; HEIGHT: 23px">
						<asp:textbox id="Textbox3" runat="server" CssClass="inputcss" Width="96px"></asp:textbox></td>
					<td style="WIDTH: 54px; HEIGHT: 23px"><FONT face="宋体">取货日期</FONT></td>
					<td style="HEIGHT: 23px">
						<asp:textbox id="Textbox4" runat="server" CssClass="inputcss" Width="96px"></asp:textbox></td>
				</tr>
				<TR>
					<TD style="HEIGHT: 21px" align="right" width="100"><FONT face="宋体">客户电话</FONT></TD>
					<TD style="HEIGHT: 21px"><FONT face="宋体">
							<asp:textbox id="Textbox5" runat="server" CssClass="inputcss" Width="96px"></asp:textbox></FONT></TD>
					<TD style="WIDTH: 59px; HEIGHT: 21px"><FONT face="宋体">备注</FONT></TD>
					<TD colspan="3" style="HEIGHT: 21px"><FONT face="宋体">
							<asp:textbox id="Textbox6" runat="server" CssClass="inputcss" Width="318px"></asp:textbox></FONT></TD>
				</TR>
				<TR>
					<TD colspan="6" align="right" style="HEIGHT: 17px"><FONT face="宋体">尊敬的客户：请您仔细核对此单内容，参看店内购物须知，并签字确认，我们将严守承诺。祝您万事如意。</FONT></TD>
				</TR>
				<tr>
					<td style="HEIGHT: 21px" align="right" width="100">经办人 &nbsp;
					</td>
					<td style="HEIGHT: 21px">
						<asp:textbox id="czy" runat="server" CssClass="inputcss" Width="96px" BackColor="White"></asp:textbox></td>
					<td style="WIDTH: 59px; HEIGHT: 21px"><FONT face="宋体">电话</FONT></td>
					<td colspan="3" style="HEIGHT: 21px">
						<asp:textbox id="Textbox7" runat="server" CssClass="inputcss" Width="96px"></asp:textbox>
					</td>
				</tr>
			</table>
			<TABLE cellSpacing="0" cellPadding="0" width="100%" border="0">
				<TR>
					<TD style="HEIGHT: 37px" align="center"><asp:button id="save" runat="server" Width="62px" CssClass="buttoncss" Text="审核通过"></asp:button>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<INPUT class="buttoncss" style="WIDTH: 64px; HEIGHT: 20px" onclick="closes()" type="button"
							value="返回">
					</TD>
				</TR>
			</TABLE>
		</form>
	</body>
</HTML>
