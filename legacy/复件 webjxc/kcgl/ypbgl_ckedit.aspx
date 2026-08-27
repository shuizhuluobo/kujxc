<%@ Page language="c#" Codebehind="ypbgl_ckedit.aspx.cs" AutoEventWireup="false" Inherits="jxc.admin.bases.ypbgl_ckedit" %>
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
		<form id="ypbgl_ckedit" method="post" runat="server">
			<table height="50" cellSpacing="0" cellPadding="0" width="100%" align="center" border="0">
				<tr>
					<td width="556" background="/image/title.gif">
						<table cellSpacing="0" cellPadding="0" width="100%" border="0">
							<tr>
								<td height="1"></td>
							</tr>
							<tr>
								<td width="80"></td>
								<td><font face="隶书" size="5">样品出库</font></td>
							</tr>
						</table>
					</td>
					<td width="250"></td>
				</tr>
			</table>
			<br>
			<table class="title3" cellSpacing="5" cellPadding="0" width="90%" align="center" border="0">
				<tr>
					<td align="right" width="100">编号
					</td>
					<td><FONT face="宋体"><asp:textbox id="Textbox2" runat="server" CssClass="inputcss" Width="96px" BackColor="#E0E0E0"
								ReadOnly="True"></asp:textbox></FONT></td>
				</tr>
				<TR>
					<TD align="right" width="100"><FONT face="宋体">出库日期</FONT></TD>
					<TD><FONT face="宋体">
							<asp:textbox id="Textbox3" runat="server" Width="96px" CssClass="inputcss"></asp:textbox></FONT></TD>
				</TR>
				<TR>
					<TD align="right" width="100"><FONT face="宋体">&nbsp;产品名称</FONT></TD>
					<td><asp:textbox id="cpname" runat="server" CssClass="inputcss" Width="121px" BackColor="#C0FFC0"
							ReadOnly="True"></asp:textbox><asp:textbox id="rkid" runat="server" CssClass="inputcss" Width="38px" BackColor="#E0E0E0" Visible="False"></asp:textbox><asp:textbox id="danjia" runat="server" CssClass="inputcss" Width="38px" BackColor="#E0E0E0"
							Visible="False"></asp:textbox></td>
				</TR>
				<TR>
					<TD align="right" width="100"><FONT face="宋体">产品编码</FONT></TD>
					<TD><FONT face="宋体"><asp:textbox id="cpbm" runat="server" CssClass="inputcss" Width="96px" BackColor="#E0E0E0" ReadOnly="True"></asp:textbox></FONT></TD>
				</TR>
				<TR>
					<TD align="right" width="100">产品类别
					</TD>
					<TD><asp:dropdownlist id="DropDownList1" runat="server"></asp:dropdownlist><asp:textbox id="Textbox5" runat="server" CssClass="inputcss" Width="38px" BackColor="#E0E0E0"
							Visible="False"></asp:textbox><asp:textbox id="Textbox1" runat="server" CssClass="inputcss" Width="38px" BackColor="#E0E0E0"
							Visible="False"></asp:textbox></TD>
				</TR>
				<TR>
					<TD style="HEIGHT: 22px" align="right" width="100">&nbsp;店名
					</TD>
					<TD style="HEIGHT: 21px">
<asp:textbox id=Textbox4 runat="server" BackColor="#E0E0E0" Width="96px" CssClass="inputcss"></asp:textbox></TD>
				</TR>
				<TR>
					<TD style="HEIGHT: 21px" align="right" width="100"><FONT face="宋体">出库米数</FONT></TD>
					<TD style="HEIGHT: 21px"><asp:textbox id="Textbox6" runat="server" CssClass="inputcss" Width="96px">0</asp:textbox></TD>
				</TR>
				<TR>
					<TD style="HEIGHT: 21px" align="right" width="100">备注</TD>
					<TD style="HEIGHT: 21px"><asp:textbox id="Textbox7" runat="server" CssClass="inputcss" Width="328px" TextMode="MultiLine"
							Height="32px"></asp:textbox></TD>
				</TR>
			</table>
			<TABLE cellSpacing="0" cellPadding="0" width="100%" border="0">
				<TR>
					<TD style="HEIGHT: 37px" align="center"><asp:button id="save" runat="server" CssClass="buttoncss" Width="62px" Text="保存"></asp:button>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<INPUT class="buttoncss" style="WIDTH: 64px; HEIGHT: 20px" onclick="closes()" type="button"
							value="返回">
					</TD>
				</TR>
			</TABLE>
		</form>
	</body>
</HTML>
