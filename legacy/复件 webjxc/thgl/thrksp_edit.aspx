<%@ Page language="c#" Codebehind="thrksp_edit.aspx.cs" AutoEventWireup="false" Inherits="jxc.admin.bases.thrksp_edit" %>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN" >
<HTML>
  <HEAD>
		<title>产品退货单(主管审核)</title>
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
								<td><font face="隶书" size="5">产品退货单(主管审核)</font></td>
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
					<td style="HEIGHT: 4px"><FONT face="宋体"><asp:textbox id="Textbox2" runat="server" CssClass="inputcss" Width="96px" BackColor="#E0E0E0"
								ReadOnly="True"></asp:textbox></FONT></td>
					<td colSpan="2">退货店名</td>
					<td style="HEIGHT: 4px" colSpan="2"><asp:textbox id="rkrq" runat="server" CssClass="inputcss" Width="112px" ReadOnly="True"></asp:textbox></td>
				</tr>
				<tr>
					<td style="HEIGHT: 22px" align="right" colSpan="6">
						<div align="center"><FONT face="宋体">退货产品明细</FONT>
						</div>
					</td>
				</tr>
				<tr>
					<td align="left" colSpan="6"><FONT face="宋体"></FONT><FONT face="宋体"><asp:datagrid id="Datagrid1" runat="server" CssClass="title3" Width="100%" BorderColor="#000066"
								DataKeyField="thmxid" AutoGenerateColumns="False" PageSize="50" Height="0px">
<SelectedItemStyle BorderColor="#FFC0C0" BackColor="White">
</SelectedItemStyle>

<HeaderStyle Font-Names="宋体" ForeColor="Purple">
</HeaderStyle>

<Columns>
<asp:TemplateColumn Visible="False" HeaderText="选择">
<HeaderStyle Width="40px">
</HeaderStyle>

<ItemTemplate>
											<asp:CheckBox id="selectcheck" runat="server" Height="8px" AutoPostBack="false"></asp:CheckBox>
										
</ItemTemplate>
</asp:TemplateColumn>
<asp:BoundColumn DataField="产品名称" HeaderText="产品名称"></asp:BoundColumn>
<asp:BoundColumn DataField="产品型号" HeaderText="产品型号"></asp:BoundColumn>
<asp:BoundColumn DataField="退货数量" HeaderText="退货数量" DataFormatString="{0:F2}"></asp:BoundColumn>
<asp:BoundColumn Visible="False" DataField="产品类别" HeaderText="产品类别"></asp:BoundColumn>
<asp:BoundColumn DataField="规格" HeaderText="规格"></asp:BoundColumn>
<asp:BoundColumn DataField="颜色" HeaderText="颜色"></asp:BoundColumn>
</Columns>

<PagerStyle Visible="False">
</PagerStyle>
							</asp:datagrid></FONT><asp:button id="Button1" runat="server" CssClass="buttoncss" Width="62px" Text="新增" Visible="False"></asp:button><asp:button id="Button2" runat="server" CssClass="buttoncss" Width="62px" Text="删除" Visible="False"></asp:button></td>
				</tr>
				<tr>
					<td style="HEIGHT: 23px" align="right"><FONT face="宋体">总计金额</FONT></td>
					<td style="HEIGHT: 23px"><asp:textbox id="Textbox8" runat="server" CssClass="inputcss" Width="96px" ReadOnly="True">0</asp:textbox></td>
					<td style="WIDTH: 59px; HEIGHT: 23px"><FONT face="宋体">销售单号</FONT></td>
					<td style="WIDTH: 109px; HEIGHT: 23px" colSpan="3">
						<asp:textbox id="Textbox10" runat="server" Width="112px" CssClass="inputcss" ReadOnly="True"></asp:textbox></td>
				</tr>
				<tr>
					<td style="HEIGHT: 23px" align="right" width="100"><FONT face="宋体">客户名称</FONT>
					</td>
					<td style="HEIGHT: 23px"><FONT face="宋体"><asp:textbox id="Textbox1" runat="server" CssClass="inputcss" Width="96px" ReadOnly="True"></asp:textbox></FONT></td>
					<td style="WIDTH: 59px; HEIGHT: 23px"><FONT face="宋体">退货日期</FONT></td>
					<td style="WIDTH: 109px; HEIGHT: 23px"><asp:textbox id="Textbox3" runat="server" CssClass="inputcss" Width="96px" ReadOnly="True" BackColor="#E0E0E0"></asp:textbox></td>
					<td style="WIDTH: 54px; HEIGHT: 23px"><FONT face="宋体"></FONT></td>
					<td style="HEIGHT: 23px"></td>
				</tr>
				<TR>
					<TD style="HEIGHT: 21px" align="right" width="100"><FONT face="宋体">客户电话</FONT></TD>
					<TD style="HEIGHT: 21px"><FONT face="宋体"><asp:textbox id="Textbox5" runat="server" CssClass="inputcss" Width="96px" ReadOnly="True"></asp:textbox></FONT></TD>
					<TD style="WIDTH: 59px; HEIGHT: 21px"><FONT face="宋体">备注</FONT></TD>
					<TD style="HEIGHT: 21px" colSpan="3"><FONT face="宋体"><asp:textbox id="Textbox6" runat="server" CssClass="inputcss" Width="318px" ReadOnly="True"></asp:textbox></FONT></TD>
				</TR>
				<TR>
					<TD style="HEIGHT: 17px" align="right" colSpan="6"><FONT face="宋体">尊敬的客户：请您仔细核对此单内容，参看店内购物须知，并签字确认，我们将严守承诺。祝您万事如意。</FONT></TD>
				</TR>
				<tr>
					<td style="HEIGHT: 21px" align="right" width="100">经办人 &nbsp;
					</td>
					<td style="HEIGHT: 21px"><asp:textbox id="czy" runat="server" CssClass="inputcss" Width="96px" BackColor="White" ReadOnly="True"></asp:textbox></td>
					<td style="WIDTH: 59px; HEIGHT: 21px"><FONT face="宋体">电话</FONT></td>
					<td style="HEIGHT: 21px" colSpan="3"><asp:textbox id="Textbox7" runat="server" CssClass="inputcss" Width="96px" ReadOnly="True"></asp:textbox></td>
				</tr>
			</table>
			<TABLE cellSpacing="0" cellPadding="0" width="100%" border="0">
				<TR>
					<TD style="HEIGHT: 37px" align="center"><asp:button id="save" runat="server" CssClass="buttoncss" Width="62px" Text="退回退货单"></asp:button>&nbsp;<INPUT class="buttoncss" style="WIDTH: 64px; HEIGHT: 20px" onclick="closes()" type="button"
							value="返回">
						<asp:button id="Button3" runat="server" Width="62px" CssClass="buttoncss" Text="发送退货单"></asp:button>
					</TD>
				</TR>
			</TABLE>
		</form>
	</body>
</HTML>