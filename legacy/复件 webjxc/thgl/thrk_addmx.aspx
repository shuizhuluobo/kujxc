<%@ Page language="c#" Codebehind="thrk_addmx.aspx.cs" AutoEventWireup="false" Inherits="jxc.admin.bases.thrk_addmx" %>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN" >
<HTML>
  <HEAD>
		<title>产品明细</title>
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
		<form id="thrk_addmx" method="post" runat="server">
			<table height="50" cellSpacing="0" cellPadding="0" width="100%" align="center" border="0">
				<tr>
					<td width="556" background="/image/title.gif">
						<table cellSpacing="0" cellPadding="0" width="100%" border="0">
							<tr>
								<td height="1"></td>
							</tr>
							<tr>
								<td width="80"></td>
								<td><font face="隶书" size="5">产品明细</font></td>
							</tr>
						</table>
					</td>
					<td width="250"></td>
				</tr>
			</table>
			<br>
			<table class="title3" cellSpacing="5" cellPadding="0" width="90%" align="center" border="0">
				<tr>
					<td align="right" width="100">退货单编号
					</td>
					<td><FONT face="宋体"><asp:textbox id="Textbox2" runat="server" BackColor="#E0E0E0" Width="96px" CssClass="inputcss"
								ReadOnly="True"></asp:textbox></FONT></td>
				</tr>
				<TR>
					<TD align="right" width="100"><FONT face="宋体">&nbsp;产品名称</FONT></TD>
					<td><asp:textbox id="cpname" runat="server" BackColor="#C0FFC0" Width="121px" CssClass="inputcss"
							ReadOnly="True"></asp:textbox><asp:textbox id="xsid" runat="server" BackColor="#E0E0E0" Width="38px" CssClass="inputcss" ></asp:textbox><asp:textbox id="danjia" runat="server" BackColor="#E0E0E0" Width="38px" CssClass="inputcss"
							Visible="False"></asp:textbox></td>
				</TR>
				<TR>
					<TD align="right" width="100">产品编码
					</TD>
					<TD><asp:textbox id="cpbm" runat="server" BackColor="#E0E0E0" Width="96px" CssClass="inputcss" ReadOnly="True"></asp:textbox><asp:textbox id="Textbox5" runat="server" BackColor="#E0E0E0" Width="38px" CssClass="inputcss"
							Visible="False"></asp:textbox><asp:textbox id="Textbox1" runat="server" BackColor="#E0E0E0" Width="38px" CssClass="inputcss"
							Visible="False"></asp:textbox></TD>
				</TR>
				<TR>
					<TD style="HEIGHT: 22px" align="right" width="100"><FONT face="宋体">规格</FONT>&nbsp;
					</TD>
					<TD style="HEIGHT: 21px">
						<asp:textbox id="txtgg" runat="server" CssClass="inputcss" Width="64px" BackColor="#E0E0E0"></asp:textbox>
						<asp:textbox id="txtzdbm" runat="server" CssClass="inputcss" Width="64px" BackColor="#E0E0E0"></asp:textbox></TD>
				</TR>
				<TR>
					<TD style="HEIGHT: 21px" align="right" width="100"><FONT face="宋体">折口率</FONT></TD>
					<TD style="HEIGHT: 21px">
						<asp:textbox id="txtzkl" runat="server" CssClass="inputcss" Width="64px" BackColor="#E0E0E0"></asp:textbox><FONT face="宋体"></FONT></TD>
				</TR>
				<TR>
					<TD style="HEIGHT: 21px" align="right" width="100"><FONT face="宋体">&nbsp;退货数量</FONT></TD>
					<TD style="HEIGHT: 21px">
						<asp:textbox id="Textbox6" runat="server" CssClass="inputcss" Width="64px">0</asp:textbox></TD>
				</TR>
			</table>
			<TABLE cellSpacing="0" cellPadding="0" width="100%" border="0">
				<TR>
					<TD style="HEIGHT: 37px" align="center"><asp:button id="save" runat="server" Width="62px" CssClass="buttoncss" Text="保存"></asp:button>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<INPUT class="buttoncss" style="WIDTH: 64px; HEIGHT: 20px" onclick="closes()" type="button"
							value="返回">
					</TD>
				</TR>
			</TABLE>
		</form>
	</body>
</HTML>
