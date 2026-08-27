<%@ Page language="c#" Codebehind="cksh_zzxp.aspx.cs" AutoEventWireup="false" Inherits="jxc.admin.bases.cksh_zzxp" %>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN" >
<HTML>
	<HEAD>
		<title></title>
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
			function printit() 
			{ 
				document.all("buttonGroup").style.visibility="hidden";		
				window.print();
				document.all("buttonGroup").style.visibility="visible";
			} 
		</script>
		<meta http-equiv="Content-Type" content="text/html; charset=gb2312">
	</HEAD>
	<body MS_POSITIONING="GridLayout">
		<form id="dbd_zzxp" method="post" runat="server">
			<FONT face="宋体"></FONT><FONT face="宋体"></FONT><FONT face="宋体"></FONT><FONT face="宋体">
			</FONT><FONT face="宋体"></FONT><FONT face="宋体"></FONT><FONT face="宋体"></FONT><FONT face="宋体">
			</FONT><FONT face="宋体"></FONT><FONT face="宋体"></FONT><FONT face="宋体"></FONT><FONT face="宋体">
			</FONT><FONT face="宋体"></FONT><FONT face="宋体"></FONT><FONT face="宋体"></FONT><FONT face="宋体">
			</FONT>
			<TABLE class="title3" style="Z-INDEX: 101; LEFT: 0px; POSITION: absolute; TOP: 8px; HEIGHT: 256px"
				borderColor="#000000" height="256" cellSpacing="0" cellPadding="0" align="left" border="0">
				<TR>
					<TD align="right" colSpan="4">
						<DIV align="center"><FONT face="宋体"><SPAN style="FONT-SIZE: 14pt; FONT-FAMILY: 黑体; mso-hansi-font-family: 宋体; mso-bidi-font-family: 宋体; mso-ansi-language: EN-US; mso-fareast-language: ZH-CN; mso-bidi-language: AR-SA"><SPAN lang="EN-US">
										<asp:Label id="Label16" runat="server" ForeColor="Black"></asp:Label>&nbsp; </SPAN>
								</SPAN></FONT>
						</DIV>
					</TD>
				</TR>
				<TR>
					<TD align="right"><SPAN style="FONT-SIZE: 14pt; FONT-FAMILY: 宋体; mso-bidi-font-family: 宋体; mso-ansi-language: EN-US; mso-fareast-language: ZH-CN; mso-bidi-language: AR-SA"><SPAN style="FONT-SIZE: 14pt; FONT-FAMILY: 宋体; mso-bidi-font-family: 宋体; mso-ansi-language: EN-US; mso-fareast-language: ZH-CN; mso-bidi-language: AR-SA"><asp:label id="Label5" runat="server" Font-Size="9pt" ForeColor="Black">销售单号：</asp:label></SPAN></SPAN></TD>
					<TD colSpan="3"><FONT face="宋体"><asp:label id="Label2" runat="server" Font-Size="9pt" ForeColor="Black"></asp:label></FONT><SPAN style="FONT-SIZE: 14pt; FONT-FAMILY: 宋体; mso-bidi-font-family: 宋体; mso-ansi-language: EN-US; mso-fareast-language: ZH-CN; mso-bidi-language: AR-SA"></SPAN></TD>
				</TR>
				<TR>
					<TD align="right"><asp:label id="Label8" runat="server" Font-Size="9pt" ForeColor="Black">时间：</asp:label>
					</TD>
					<TD colSpan="3"><asp:label id="Label1" runat="server" Font-Size="9pt" ForeColor="Black"></asp:label><SPAN style="FONT-SIZE: 14pt; FONT-FAMILY: 宋体; mso-bidi-font-family: 宋体; mso-ansi-language: EN-US; mso-fareast-language: ZH-CN; mso-bidi-language: AR-SA"></SPAN></TD>
				</TR>
				<TR>
					<TD align="right"><SPAN style="FONT-SIZE: 14pt; FONT-FAMILY: 宋体; mso-bidi-font-family: 宋体; mso-ansi-language: EN-US; mso-fareast-language: ZH-CN; mso-bidi-language: AR-SA"><asp:label id="Label9" runat="server" Font-Size="9pt" ForeColor="Black">经办人：</asp:label></SPAN></TD>
					<TD noWrap><asp:label id="Label3" runat="server" Font-Size="9pt" ForeColor="Black"></asp:label></TD>
					<TD><FONT face="宋体"><SPAN style="FONT-SIZE: 14pt; FONT-FAMILY: 宋体; mso-bidi-font-family: 宋体; mso-ansi-language: EN-US; mso-fareast-language: ZH-CN; mso-bidi-language: AR-SA"><asp:label id="Label10" runat="server" Font-Size="9pt" ForeColor="Black">送货人：</asp:label></SPAN></FONT></TD>
					<TD>&nbsp;
						<asp:label id="Label4" runat="server" Font-Size="9pt" ForeColor="Black"></asp:label></TD>
				</TR>
				<TR align="left">
					<TD colSpan="4"><FONT face="宋体"><asp:datagrid id="Datagrid1" runat="server" CssClass="title3" AutoGenerateColumns="False" BorderColor="#000066"
								Height="0px" Width="180px">
								<SelectedItemStyle BorderColor="#FFC0C0" BackColor="White"></SelectedItemStyle>
								<ItemStyle HorizontalAlign="Center"></ItemStyle>
								<HeaderStyle Font-Names="宋体" HorizontalAlign="Center" ForeColor="Purple"></HeaderStyle>
								<Columns>
									<asp:BoundColumn DataField="产品名称" HeaderText="产品名称">
										<HeaderStyle Wrap="False" HorizontalAlign="Center"></HeaderStyle>
										<ItemStyle Wrap="False"></ItemStyle>
									</asp:BoundColumn>
									<asp:BoundColumn DataField="产品型号" HeaderText="款号">
										<HeaderStyle Width="40px"></HeaderStyle>
									</asp:BoundColumn>
									<asp:BoundColumn DataField="颜色" HeaderText="颜色">
										<HeaderStyle Wrap="False" HorizontalAlign="Center"></HeaderStyle>
									</asp:BoundColumn>
									<asp:BoundColumn DataField="销售数量" HeaderText="销售数量" DataFormatString="{0:F2}">
										<ItemStyle HorizontalAlign="Center"></ItemStyle>
									</asp:BoundColumn>
									<asp:BoundColumn Visible="False" DataField="零售价" HeaderText="单价"></asp:BoundColumn>
									<asp:BoundColumn Visible="False" DataField="金额" HeaderText="金额"></asp:BoundColumn>
								</Columns>
								<PagerStyle Visible="False"></PagerStyle>
							</asp:datagrid>&nbsp;</FONT><FONT face="宋体"></FONT></TD>
				</TR>
				<TR>
					<TD align="right"><asp:label id="Label6" runat="server" Font-Size="9pt" ForeColor="Black">实收：</asp:label>&nbsp;</TD>
					<TD colSpan="3">&nbsp;
						<asp:Label id="Label13" runat="server" Font-Size="9pt" ForeColor="Black"></asp:Label></TD>
				</TR>
				<TR>
					<TD style="HEIGHT: 21px" noWrap align="right"><asp:label id="Label7" runat="server" Font-Size="9pt" ForeColor="Black">付款：</asp:label>&nbsp;</TD>
					<TD colSpan="3">&nbsp;
						<asp:Label id="Label14" runat="server" Font-Size="9pt" ForeColor="Black"></asp:Label></TD>
				</TR>
				<TR>
					<TD style="HEIGHT: 21px" noWrap align="right"><SPAN style="FONT-SIZE: 12pt; FONT-FAMILY: 宋体; mso-bidi-font-family: 宋体; mso-ansi-language: EN-US; mso-fareast-language: ZH-CN; mso-bidi-language: AR-SA"><asp:label id="Label11" runat="server" Font-Size="9pt" ForeColor="Black">找回：</asp:label></SPAN>&nbsp;</TD>
					<TD colSpan="3">&nbsp;
						<asp:Label id="Label15" runat="server" Font-Size="9pt" ForeColor="Black"></asp:Label></TD>
				</TR>
				<TR align="left">
					<TD noWrap colSpan="4" style="HEIGHT: 14px"><FONT face="宋体"><SPAN style="FONT-SIZE: 12pt; FONT-FAMILY: 宋体; mso-bidi-font-family: 宋体; mso-ansi-language: EN-US; mso-fareast-language: ZH-CN; mso-bidi-language: AR-SA"></SPAN></FONT><FONT face="宋体"></FONT></TD>
				</TR>
				<TR>
					<TD noWrap colSpan="4"><div id="buttonGroup" align="center"><input class="buttoncss" id="btnPrint" onclick="javascript:printit();" type="button" value=" 打  印 "
								name="btnPrint"> <input class="buttoncss" id="btnClose" onclick="window.close();" type="button" value=" 关  闭 "
								name="btnClose">
						</div>
					</TD>
				</TR>
			</TABLE>
			<br>
		</form>
	</body>
</HTML>
