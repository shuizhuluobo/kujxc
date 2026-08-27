<%@ Page language="c#" Codebehind="dbd_zzxp.aspx.cs" AutoEventWireup="false" Inherits="jxc.admin.bases.dbd_zzxp" %>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN" >
<HTML>
	<HEAD>
		<title>产品维护</title>
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
	</HEAD>
	<body MS_POSITIONING="GridLayout">
		<form id="dbd_zzxp" method="post" runat="server">
			<FONT face="宋体"></FONT><FONT face="宋体"></FONT><FONT face="宋体"></FONT><FONT face="宋体">
			</FONT><FONT face="宋体"></FONT><FONT face="宋体"></FONT>
			<br>
			<table width="80%" height="200" border="1" align="center" cellPadding="0" cellSpacing="0"
				bordercolor="#000000" class="title3">
				<TR>
					<TD colspan="4" align="right"><div align="center"><FONT face="宋体"><SPAN style="FONT-SIZE: 14pt; FONT-FAMILY: 黑体; mso-hansi-font-family: 宋体; mso-bidi-font-family: 宋体; mso-ansi-language: EN-US; mso-fareast-language: ZH-CN; mso-bidi-language: AR-SA">车间加工通知单<SUB><SPAN lang="EN-US">NO:</SPAN></SUB><SPAN lang="EN-US">
									</SPAN></SPAN></FONT>
						</div>
					</TD>
				</TR>
				<tr>
					<td width="108" align="right"><SPAN style="FONT-SIZE: 14pt; FONT-FAMILY: 宋体; mso-bidi-font-family: 宋体; mso-ansi-language: EN-US; mso-fareast-language: ZH-CN; mso-bidi-language: AR-SA">地区：</SPAN></td>
					<td width="185" style="WIDTH: 171px"><FONT face="宋体">
							<asp:Label id="Label1" runat="server" Font-Size="16pt"></asp:Label></FONT></td>
					<td width="97" nowrap><SPAN style="FONT-SIZE: 14pt; FONT-FAMILY: 宋体; mso-bidi-font-family: 宋体; mso-ansi-language: EN-US; mso-fareast-language: ZH-CN; mso-bidi-language: AR-SA">销售单号：</SPAN></td>
					<td width="281">
						&nbsp;<asp:Label id="Label2" runat="server" Font-Size="16pt"></asp:Label></td>
				</tr>
				<tr>
					<td align="right">&nbsp;<SPAN style="FONT-SIZE: 14pt; FONT-FAMILY: 宋体; mso-bidi-font-family: 宋体; mso-ansi-language: EN-US; mso-fareast-language: ZH-CN; mso-bidi-language: AR-SA">下料：</SPAN>
					</td>
					<td style="WIDTH: 171px">&nbsp;</td>
					<td><SPAN style="FONT-SIZE: 14pt; FONT-FAMILY: 宋体; mso-bidi-font-family: 宋体; mso-ansi-language: EN-US; mso-fareast-language: ZH-CN; mso-bidi-language: AR-SA">裁帘：</SPAN></td>
					<td>&nbsp;</td>
				</tr>
				<TR>
					<TD align="right"><SPAN style="FONT-SIZE: 14pt; FONT-FAMILY: 宋体; mso-bidi-font-family: 宋体; mso-ansi-language: EN-US; mso-fareast-language: ZH-CN; mso-bidi-language: AR-SA">产品名称：</SPAN></TD>
					<TD nowrap>
						<asp:Label id="Label3" runat="server" Font-Size="16pt"></asp:Label></TD>
					<TD><FONT face="宋体"><SPAN style="FONT-SIZE: 14pt; FONT-FAMILY: 宋体; mso-bidi-font-family: 宋体; mso-ansi-language: EN-US; mso-fareast-language: ZH-CN; mso-bidi-language: AR-SA">销售米数：</SPAN></FONT></TD>
					<TD>
						&nbsp;<asp:Label id="Label4" runat="server" Font-Size="16pt"></asp:Label></TD>
				</TR>
				<TR>
					<TD height="52" align="right" style="HEIGHT: 23px"><SPAN style="FONT-SIZE: 14pt; FONT-FAMILY: 宋体; mso-bidi-font-family: 宋体; mso-ansi-language: EN-US; mso-fareast-language: ZH-CN; mso-bidi-language: AR-SA">制作要求：</SPAN>
					</TD>
					<TD colspan="3" style="WIDTH: 171px; HEIGHT: 156px"><FONT face="宋体"> &nbsp;<asp:Label id="Label5" runat="server" Font-Size="16pt" Width="626px"></asp:Label></FONT><FONT face="宋体"></FONT></TD>
				</TR>
				<TR>
					<TD align="right" nowrap style="HEIGHT: 21px"><FONT face="宋体"><SPAN style="FONT-SIZE: 12pt; FONT-FAMILY: 宋体; mso-bidi-font-family: 宋体; mso-ansi-language: EN-US; mso-fareast-language: ZH-CN; mso-bidi-language: AR-SA">打印票号</SPAN><SPAN lang="EN-US" style="FONT-SIZE: 12pt; FONT-FAMILY: 'Times New Roman'; mso-ansi-language: EN-US; mso-fareast-language: ZH-CN; mso-bidi-language: AR-SA; mso-fareast-font-family: 宋体">No</SPAN><SPAN style="FONT-SIZE: 12pt; FONT-FAMILY: 宋体; mso-bidi-font-family: 宋体; mso-ansi-language: EN-US; mso-fareast-language: ZH-CN; mso-bidi-language: AR-SA">：</SPAN></FONT></TD>
					<TD style="WIDTH: 171px; HEIGHT: 21px"><FONT face="宋体"> &nbsp;<asp:Label id="Label6" runat="server" Font-Size="16pt"></asp:Label></FONT></TD>
					<TD nowrap><div align="right"><SPAN style="FONT-SIZE: 14pt; FONT-FAMILY: 宋体; mso-bidi-font-family: 宋体; mso-ansi-language: EN-US; mso-fareast-language: ZH-CN; mso-bidi-language: AR-SA">出库日期：</SPAN></div>
					</TD>
					<TD nowrap>&nbsp;
						<asp:Label id="Label7" runat="server" Font-Size="16pt"></asp:Label>
						<asp:button id="save" runat="server" CssClass="buttoncss" Width="62px" Text="保存" Visible="False"></asp:button>
					</TD>
				</TR>
			</table>
		</form>
	</body>
</HTML>
