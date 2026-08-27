<%@ Page language="c#" Codebehind="cksh_edit.aspx.cs" AutoEventWireup="false" Inherits="jxc.admin.bases.cksh_edit" %>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN" >
<HTML>
	<HEAD>
		<title>出库审核</title>
		<meta name="GENERATOR" content="Microsoft Visual Studio .NET 7.1">
		<meta name="CODE_LANGUAGE" content="C#">
		<meta name="vs_defaultClientScript" content="JavaScript">
		<meta name="vs_targetSchema" content="http://schemas.microsoft.com/intellisense/ie5">
		<LINK rel="stylesheet" type="text/css" href="/css/BasicLayout.css">
		<script language="javascript">
		function closes()
		{
			opener.location.href=opener.location.href;
			opener = null;
			window.close ();
		}
		
		</script>
		<meta content="text/html; charset=gb2312" http-equiv="Content-Type">
	</HEAD>
	<body MS_POSITIONING="GridLayout">
		<form id="cksh" method="post" runat="server">
			<table height="50" cellSpacing="0" cellPadding="0" width="100%" align="center" border="0">
				<tr>
					<td background="/image/title.gif" width="556">
						<table cellSpacing="0" cellPadding="0" width="100%" border="0">
							<tr>
								<td height="1"></td>
							</tr>
							<tr>
								<td width="80"></td>
								<td><font size="5" face="隶书">产品销售<FONT size="5" face="隶书">审核</FONT>单</font></td>
							</tr>
						</table>
					</td>
					<td width="250"></td>
				</tr>
			</table>
			<br>
			<table class="title3" style="HEIGHT: 340px; WIDTH: 657px" borderColor="#003300" cellSpacing="2"
				cellPadding="0" width="657" align="center" border="1">
				<tr>
					<td style="HEIGHT: 4px" height="4" width="100" align="right">销售单编号
					</td>
					<td style="HEIGHT: 4px"><FONT face="宋体"><asp:textbox id="Textbox2" runat="server" CssClass="inputcss" Width="96px" BackColor="#E0E0E0"></asp:textbox></FONT></td>
					<td colSpan="2">销售店名</td>
					<td style="HEIGHT: 4px" colSpan="2"><asp:textbox id="rkrq" runat="server" CssClass="inputcss" Width="96px"></asp:textbox></td>
				</tr>
				<tr>
					<td style="HEIGHT: 22px" colSpan="6" align="right">
						<div align="center"><FONT face="宋体">销售产品明细</FONT>
						</div>
					</td>
				</tr>
				<tr>
					<td style="HEIGHT: 159px" colSpan="6" align="left"><FONT face="宋体"></FONT><FONT face="宋体"><asp:datagrid id="Datagrid1" runat="server" CssClass="title3" Width="100%" BorderColor="#000066"
								DataKeyField="xsdmxid" AutoGenerateColumns="False" Height="0px">
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
							</asp:datagrid></FONT><asp:button id="Button1" runat="server" CssClass="buttoncss" Width="62px" Visible="False" Text="新增"></asp:button><asp:button id="Button2" runat="server" CssClass="buttoncss" Width="62px" Text="删除"></asp:button></td>
				</tr>
				<tr>
					<td style="HEIGHT: 23px" align="right"><FONT face="宋体">总计金额</FONT></td>
					<td style="HEIGHT: 23px"><asp:textbox id="Textbox8" runat="server" CssClass="inputcss" Width="96px" BackColor="Transparent">0</asp:textbox></td>
					<td style="HEIGHT: 23px; WIDTH: 59px"><FONT face="宋体">预付定金</FONT></td>
					<td colSpan="3"><asp:textbox id="Textbox9" runat="server" CssClass="inputcss" Width="64px" BackColor="Transparent">0</asp:textbox>电话
						<asp:textbox id="Textbox7" runat="server" CssClass="inputcss" Width="96px"></asp:textbox><asp:textbox id="Textbox10" runat="server" CssClass="inputcss" Width="17px" Visible="False"></asp:textbox></td>
				</tr>
				<tr>
					<td style="HEIGHT: 23px" width="100" align="right"><FONT face="宋体">客户名称</FONT>
					</td>
					<td style="HEIGHT: 23px"><FONT face="宋体"><asp:textbox id="Textbox1" runat="server" CssClass="inputcss" Width="96px" BackColor="Transparent"></asp:textbox></FONT></td>
					<td style="HEIGHT: 23px; WIDTH: 59px"><FONT face="宋体">销售日期</FONT></td>
					<td style="HEIGHT: 23px; WIDTH: 109px"><asp:textbox id="Textbox3" runat="server" CssClass="inputcss" Width="96px" BackColor="Transparent"></asp:textbox></td>
					<td style="HEIGHT: 23px; WIDTH: 54px"><FONT face="宋体">取货日期</FONT></td>
					<td style="HEIGHT: 23px"><asp:textbox id="Textbox4" runat="server" CssClass="inputcss" Width="96px" BackColor="Transparent"></asp:textbox></td>
				</tr>
				<TR>
					<TD style="HEIGHT: 21px" width="100" align="right"><FONT face="宋体">客户电话</FONT></TD>
					<TD style="HEIGHT: 21px"><FONT face="宋体"><asp:textbox id="Textbox5" runat="server" CssClass="inputcss" Width="96px" BackColor="Transparent"></asp:textbox></FONT></TD>
					<TD style="HEIGHT: 21px; WIDTH: 59px"><FONT face="宋体">备注</FONT></TD>
					<TD style="HEIGHT: 21px" colSpan="3"><FONT face="宋体"><asp:textbox id="Textbox6" runat="server" CssClass="inputcss" Width="318px" BackColor="Transparent"></asp:textbox></FONT></TD>
				</TR>
				<tr>
					<td style="HEIGHT: 21px" width="100" align="right">经办人 &nbsp;
					</td>
					<td style="HEIGHT: 21px"><asp:textbox id="czy" runat="server" CssClass="inputcss" Width="96px" BackColor="Transparent"></asp:textbox></td>
					<td style="HEIGHT: 21px; WIDTH: 59px"><FONT face="宋体">送货人</FONT></td>
					<td style="HEIGHT: 21px" colSpan="3"><asp:textbox id="Textbox11" runat="server" CssClass="inputcss" Width="96px" BackColor="#C0FFC0"></asp:textbox></td>
				</tr>
			</table>
			<TABLE cellSpacing="0" cellPadding="0" width="100%" border="0">
				<TR>
					<TD style="HEIGHT: 37px" align="center"><asp:button id="save" runat="server" CssClass="buttoncss" Width="62px" Text="审核通过"></asp:button>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<INPUT onclick="closes()" class="buttoncss" style="HEIGHT: 20px; WIDTH: 64px" type="button"
							value="返回">
					</TD>
				</TR>
			</TABLE>
		</form>
	</body>
</HTML>
