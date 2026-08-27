<%@ Page language="c#" Codebehind="spdb_edit.aspx.cs" AutoEventWireup="false" Inherits="jxc.admin.bases.spdb_edit" %>
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
		<form id="spdb_edit" method="post" runat="server">
			<table height="50" cellSpacing="0" cellPadding="0" width="100%" align="center" border="0">
				<tr>
					<td width="556" background="/image/title.gif">
						<table cellSpacing="0" cellPadding="0" width="100%" border="0">
							<tr>
								<td height="1"></td>
							</tr>
							<tr>
								<td width="80"></td>
								<td><font face="隶书" size="5">产品调拨</font></td>
							</tr>
						</table>
					</td>
					<td width="250"></td>
				</tr>
			</table>
			<br>
			<table class="title3" cellSpacing="5" cellPadding="0" width="90%" align="center" border="0">
				<tr>
					<td align="right" width="100">入库编号
					</td>
					<td><FONT face="宋体"><asp:textbox id="Textbox2" runat="server" BackColor="#E0E0E0" Width="96px" CssClass="inputcss"
								ReadOnly="True"></asp:textbox></FONT></td>
					<td>&nbsp;调拨日期</td>
					<td>&nbsp;
						<asp:textbox id="rkrq" runat="server" Width="96px" CssClass="inputcss"></asp:textbox></td>
				</tr>
				<tr>
					<td align="right" width="100">经办人&nbsp;
					</td>
					<td><asp:textbox id="czy" runat="server" BackColor="#E0E0E0" Width="96px" CssClass="inputcss" ReadOnly="True"></asp:textbox></td>
					<td>&nbsp;入库产品&nbsp;</td>
					<td>&nbsp;
						<asp:textbox id="cpname" runat="server" BackColor="#E0E0E0" Width="97px" CssClass="inputcss"
							ReadOnly="True"></asp:textbox><asp:textbox id="cpid" runat="server" Width="25px" CssClass="inputcss" Visible="False"></asp:textbox>
						<asp:textbox id="Textbox8" runat="server" CssClass="inputcss" Width="25px" Visible="False"></asp:textbox>
						<asp:textbox id="txtzkl" runat="server" CssClass="inputcss" Width="25px" Visible="False"></asp:textbox>
						<asp:textbox id="txtxh" runat="server" CssClass="inputcss" Width="25px" Visible="False"></asp:textbox></td>
				</tr>
				<tr>
					<td align="right" width="100"><FONT face="宋体">入库数量</FONT>&nbsp;
					</td>
					<td><asp:textbox id="Textbox3" runat="server" BackColor="#E0E0E0" Width="96px" CssClass="inputcss"
							ReadOnly="True"></asp:textbox></td>
					<td>&nbsp;<FONT face="宋体">库存数量</FONT></td>
					<td>&nbsp;
						<asp:textbox id="Textbox1" runat="server" BackColor="#E0E0E0" Width="96px" CssClass="inputcss"
							ReadOnly="True"></asp:textbox></td>
				</tr>
				<tr>
					<td style="HEIGHT: 23px" align="right" width="100">进货价
					</td>
					<td style="HEIGHT: 23px"><FONT face="宋体"><asp:textbox id="Textbox5" runat="server" BackColor="#E0E0E0" Width="96px" CssClass="inputcss"
								ReadOnly="True"></asp:textbox></FONT></td>
					<td style="HEIGHT: 23px">&nbsp;原仓库</td>
					<td style="HEIGHT: 23px">&nbsp;
						<asp:textbox id="Textbox4" runat="server" BackColor="#E0E0E0" Width="96px" CssClass="inputcss"
							ReadOnly="True"></asp:textbox></td>
				</tr>
				<tr>
					<td style="HEIGHT: 21px" align="right" width="100">&nbsp;调拨仓库&nbsp;
					</td>
					<td style="HEIGHT: 21px"><asp:dropdownlist id="DropDownListlx" runat="server" Width="96px" CssClass="inputcss"></asp:dropdownlist></td>
					<td style="HEIGHT: 21px">&nbsp;调拨数量</td>
					<td style="HEIGHT: 21px">&nbsp;
						<asp:textbox id="Textbox6" runat="server" Width="96px" CssClass="inputcss"></asp:textbox></td>
				</tr>
				<TR>
					<TD style="HEIGHT: 21px" align="right" width="100"><FONT face="宋体">调拨说明</FONT></TD>
					<TD style="HEIGHT: 21px" colSpan="3"><FONT face="宋体"></FONT><FONT face="宋体"><asp:textbox id="Textbox7" runat="server" Width="409px" CssClass="inputcss" TextMode="MultiLine"
								Height="32px"></asp:textbox>
							<asp:textbox id="txtyanse" runat="server" ReadOnly="True" CssClass="inputcss" Width="96px" BackColor="#E0E0E0"
								style="Z-INDEX: 0" Visible="False"></asp:textbox>
							<asp:textbox id="txtkuanghao" runat="server" ReadOnly="True" CssClass="inputcss" Width="96px"
								BackColor="#E0E0E0" style="Z-INDEX: 0" Visible="False"></asp:textbox></FONT></TD>
				</TR>
			</table>
			<TABLE cellSpacing="0" cellPadding="0" width="100%" border="0">
				<TR>
					<TD style="HEIGHT: 37px" align="center"><asp:button id="save" runat="server" Width="62px" CssClass="buttoncss" Text="保存"></asp:button>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<INPUT class="buttoncss" style="HEIGHT: 20px; WIDTH: 64px" onclick="closes()" type="button"
							value="返回">
					</TD>
				</TR>
			</TABLE>
		</form>
	</body>
</HTML>
