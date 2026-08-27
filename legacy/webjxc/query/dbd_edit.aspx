<%@ Page language="c#" Codebehind="dbd_edit.aspx.cs" AutoEventWireup="false" Inherits="jxc.admin.bases.dbd_edit" %>
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
		<form id="dbd_edit" method="post" runat="server">
			<table height="50" cellSpacing="0" cellPadding="0" width="100%" align="center" border="0">
				<tr>
					<td width="556" background="/image/title.gif">
						<table cellSpacing="0" cellPadding="0" width="100%" border="0">
							<tr>
								<td height="1"></td>
							</tr>
							<tr>
								<td width="80"></td>
								<td><font face="隶书" size="5">库房发货单</font></td>
							</tr>
						</table>
					</td>
					<td width="250"></td>
				</tr>
			</table>
			<br>
			<table class="title3" cellSpacing="5" cellPadding="0" width="90%" align="center" border="0">
				<tr>
					<td align="right" width="100">经办人&nbsp;
					</td>
					<td><FONT face="宋体">
							<asp:textbox id="czy" runat="server" CssClass="inputcss" Width="96px" BackColor="#E0E0E0" ReadOnly="True"></asp:textbox></FONT></td>
					<td style="WIDTH: 66px">发货日期</td>
					<td>
						<asp:textbox id="rkrq" runat="server" Width="96px" CssClass="inputcss"></asp:textbox></td>
				</tr>
				<tr>
					<td align="right" width="100">调拨单号&nbsp;
					</td>
					<td>
						<asp:textbox id="Textbox2" runat="server" CssClass="inputcss" Width="96px" BackColor="#E0E0E0"
							ReadOnly="True"></asp:textbox></td>
					<td style="WIDTH: 66px">销售单号</td>
					<td>
						<asp:textbox id="Textbox3" runat="server" CssClass="inputcss" Width="96px" BackColor="#E0E0E0"
							ReadOnly="True"></asp:textbox></td>
				</tr>
				<TR>
					<TD align="right" width="100">入库产品&nbsp;</TD>
					<TD>
						<asp:textbox id="cpname" runat="server" BackColor="#E0E0E0" Width="121px" CssClass="inputcss"
							ReadOnly="True"></asp:textbox><asp:textbox id="cpid" runat="server" Width="25px" CssClass="inputcss"></asp:textbox></TD>
					<TD style="WIDTH: 66px"><FONT face="宋体">发货米数</FONT></TD>
					<TD>
						<asp:textbox id="Textbox1" runat="server" CssClass="inputcss" Width="96px" BackColor="#E0E0E0"
							ReadOnly="True"></asp:textbox></TD>
				</TR>
				<TR>
					<TD style="HEIGHT: 23px" align="right" width="100">&nbsp;发货地区&nbsp;
					</TD>
					<TD style="HEIGHT: 23px"><FONT face="宋体">
							<asp:textbox id="Textbox4" runat="server" CssClass="inputcss" Width="96px" BackColor="#E0E0E0"
								ReadOnly="True"></asp:textbox></FONT></TD>
					<TD style="WIDTH: 66px; HEIGHT: 23px"><FONT face="宋体">发货单号</FONT></TD>
					<TD style="HEIGHT: 23px">
						<asp:textbox id="Textbox6" runat="server" CssClass="inputcss" Width="96px"></asp:textbox></TD>
				</TR>
				<TR>
					<TD style="HEIGHT: 21px" align="right" width="100"><FONT face="宋体">预计到货日期</FONT></TD>
					<TD style="HEIGHT: 21px"><FONT face="宋体">
							<asp:textbox id="Textbox5" runat="server" CssClass="inputcss" Width="104px"></asp:textbox></FONT></TD>
					<TD style="WIDTH: 66px; HEIGHT: 21px"></TD>
					<TD style="HEIGHT: 21px">&nbsp;
					</TD>
				</TR>
				<TR>
					<TD style="HEIGHT: 21px" align="right" width="100"><FONT face="宋体">备注</FONT></TD>
					<TD style="HEIGHT: 21px" colSpan="3"><FONT face="宋体"></FONT><FONT face="宋体">
							<asp:textbox id="Textbox7" runat="server" CssClass="inputcss" Width="409px" Height="32px" TextMode="MultiLine"></asp:textbox></FONT></TD>
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
