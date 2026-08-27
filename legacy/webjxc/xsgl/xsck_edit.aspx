<%@ Page language="c#" Codebehind="xsck_edit.aspx.cs" AutoEventWireup="false" Inherits="jxc.admin.bases.ckmx_edit" %>
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
								<td><font face="隶书" size="5">产品销售单</font></td>
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
					<td style="HEIGHT: 4px; WIDTH: 102px" align="right" width="102" height="4">销售单编号
					</td>
					<td style="HEIGHT: 4px"><FONT face="宋体"><asp:textbox id="Textbox2" runat="server" ReadOnly="True" BackColor="#E0E0E0" Width="96px" CssClass="inputcss"></asp:textbox></FONT></td>
					<td colSpan="2">销售店名</td>
					<td style="HEIGHT: 4px" colSpan="2"><asp:textbox id="rkrq" runat="server" ReadOnly="True" Width="112px" CssClass="inputcss"></asp:textbox></td>
				</tr>
				<tr>
					<td style="HEIGHT: 22px" align="right" colSpan="6">
						<div align="center"><FONT face="宋体">销售产品明细</FONT>
						</div>
					</td>
				</tr>
				<tr>
					<td style="HEIGHT: 162px" align="left" colSpan="6"><FONT face="宋体"></FONT><FONT face="宋体"><asp:datagrid id="Datagrid1" runat="server" Width="100%" CssClass="title3" Height="0px" PageSize="50"
								AutoGenerateColumns="False" DataKeyField="test" BorderColor="#000066">
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
									<asp:BoundColumn DataField="产品类别" HeaderText="产品类别"></asp:BoundColumn>
									<asp:BoundColumn DataField="产品名称" HeaderText="产品名称"></asp:BoundColumn>
									<asp:BoundColumn Visible="False" DataField="规格" HeaderText="尺码"></asp:BoundColumn>
									<asp:BoundColumn DataField="销售数量" HeaderText="销售数量"></asp:BoundColumn>
									<asp:BoundColumn DataField="零售价" HeaderText="单价"></asp:BoundColumn>
									<asp:BoundColumn DataField="总金额" HeaderText="金额"></asp:BoundColumn>
								</Columns>
								<PagerStyle Visible="False"></PagerStyle>
							</asp:datagrid></FONT><asp:button id="Button1" runat="server" Width="62px" CssClass="buttoncss" Text="新增"></asp:button><asp:button id="Button2" runat="server" Width="62px" CssClass="buttoncss" Text="删除"></asp:button></td>
				</tr>
				<tr>
					<td style="HEIGHT: 26px; WIDTH: 102px" align="right"><FONT face="宋体">应付金额</FONT></td>
					<td style="HEIGHT: 26px"><asp:textbox id="Textbox5" runat="server" Width="96px" CssClass="inputcss" AutoPostBack="True">0</asp:textbox></td>
					<TD style="HEIGHT: 26px; WIDTH: 59px"><FONT face="宋体">客户名称 </FONT>
					</TD>
					<TD style="HEIGHT: 26px; WIDTH: 109px" colSpan="3"><asp:textbox id="Textbox1" runat="server" BackColor="#C0FFFF" Width="168px" CssClass="inputcss"
							ForeColor="Black"></asp:textbox><asp:textbox id="Textbox9" runat="server" Width="24px" CssClass="inputcss" AutoPostBack="True"
							Visible="False">10</asp:textbox><asp:label id="Label1" runat="server" Visible="False">折扣率</asp:label>
						<asp:textbox id="Textbox7" runat="server" CssClass="inputcss" Width="40px" Visible="False">0</asp:textbox>
						<asp:textbox id="Textbox4" runat="server" CssClass="inputcss" Width="56px" AutoPostBack="True"
							Visible="False">0</asp:textbox>
						<asp:textbox id="Textbox8" runat="server" CssClass="inputcss" Width="24px" AutoPostBack="True"
							Visible="False">0</asp:textbox></TD>
				</tr>
				<TR>
					<TD style="HEIGHT: 23px; WIDTH: 102px" align="right" width="102"></TD>
					<TD style="HEIGHT: 23px"><FONT face="宋体"></FONT></TD>
					<TD style="HEIGHT: 23px; WIDTH: 59px"><FONT face="宋体">备注</FONT></TD>
					<TD style="HEIGHT: 23px; WIDTH: 109px">
						<asp:textbox id="Textbox6" runat="server" CssClass="inputcss" Width="137px"></asp:textbox></TD>
					<TD style="HEIGHT: 23px; WIDTH: 54px"><FONT face="宋体"></FONT></TD>
					<TD style="HEIGHT: 23px"></TD>
				</TR>
				<TR>
					<TD style="HEIGHT: 4px; WIDTH: 102px" align="right" width="102"><FONT face="宋体">销售日期</FONT></TD>
					<TD style="HEIGHT: 4px"><FONT face="宋体">
							<asp:textbox id="Textbox3" runat="server" CssClass="inputcss" Width="96px" BackColor="#E0E0E0"
								ReadOnly="True"></asp:textbox></FONT></TD>
					<TD style="HEIGHT: 4px; WIDTH: 59px"><FONT face="宋体">经办人</FONT></TD>
					<TD style="HEIGHT: 4px" colSpan="3"><FONT face="宋体">
							<asp:textbox id="czy" runat="server" CssClass="inputcss" Width="96px" BackColor="White"></asp:textbox>
							<asp:textbox id="txtwldwid" runat="server" CssClass="inputcss" Width="24px" Visible="False"></asp:textbox></FONT></TD>
				</TR>
			</table>
			<TABLE cellSpacing="0" cellPadding="0" width="100%" border="0">
				<TR>
					<TD style="HEIGHT: 37px" align="center"><asp:button id="save" runat="server" Width="62px" CssClass="buttoncss" Text="保存"></asp:button>&nbsp;&nbsp;
						<asp:button id="Button3" runat="server" Width="63px" CssClass="buttoncss" Text="打印" Visible="False"></asp:button>&nbsp;&nbsp;&nbsp;<INPUT class="buttoncss" style="HEIGHT: 20px; WIDTH: 64px" onclick="closes()" type="button"
							value="返回">
					</TD>
				</TR>
			</TABLE>
		</form>
	</body>
</HTML>
