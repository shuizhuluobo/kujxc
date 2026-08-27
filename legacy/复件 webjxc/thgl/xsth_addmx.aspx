<%@ Page language="c#" Codebehind="xsth_addmx.aspx.cs" AutoEventWireup="false" Inherits="jxc.admin.bases.xsth_addmx" %>
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
		<form id="xsth_addmx" method="post" runat="server">
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
					<td align="right" width="101" style="WIDTH: 101px">销售单编号
					</td>
					<td><FONT face="宋体"><asp:textbox id="Textbox2" runat="server" ReadOnly="True" CssClass="inputcss" Width="96px" BackColor="#E0E0E0"></asp:textbox></FONT></td>
				</tr>
				<TR>
					<TD align="right" width="101" style="WIDTH: 101px"><FONT face="宋体">&nbsp;产品名称</FONT></TD>
					<td><asp:textbox id="cpname" runat="server" ReadOnly="True" CssClass="inputcss" Width="121px" BackColor="#C0FFC0"></asp:textbox><asp:textbox id="rkid" runat="server" CssClass="inputcss" Width="38px" BackColor="#E0E0E0" Visible="False"></asp:textbox><asp:textbox id="danjia" runat="server" CssClass="inputcss" Width="38px" BackColor="#E0E0E0"
							Visible="False"></asp:textbox></td>
				</TR>
				<TR>
					<TD align="right" width="101" style="WIDTH: 101px; HEIGHT: 20px">产品编码
					</TD>
					<TD style="HEIGHT: 20px"><asp:textbox id="cpbm" runat="server" ReadOnly="True" CssClass="inputcss" Width="96px" BackColor="#E0E0E0"></asp:textbox><asp:textbox id="Textbox5" runat="server" CssClass="inputcss" Width="38px" BackColor="#E0E0E0"
							Visible="False"></asp:textbox><asp:textbox id="Textbox1" runat="server" CssClass="inputcss" Width="38px" BackColor="#E0E0E0"
							Visible="False"></asp:textbox>
						<asp:textbox id="rkdrkid" runat="server" CssClass="inputcss" Width="38px" BackColor="#E0E0E0"
							Visible="False"></asp:textbox>
						<asp:textbox id="yanse" runat="server" CssClass="inputcss" Width="38px" BackColor="#E0E0E0" Visible="False"></asp:textbox>
						<asp:textbox id="xinghao" runat="server" CssClass="inputcss" Width="38px" BackColor="#E0E0E0"
							Visible="False"></asp:textbox>
						<asp:textbox id="guige" runat="server" CssClass="inputcss" Width="38px" BackColor="#E0E0E0" Visible="False"></asp:textbox>
						<asp:textbox id="sysl" runat="server" CssClass="inputcss" Width="38px" BackColor="#E0E0E0" Visible="False"></asp:textbox></TD>
				</TR>
				<TR>
					<TD style="WIDTH: 101px; HEIGHT: 22px" align="right" width="101"><FONT face="宋体">退货价格</FONT></TD>
					<TD style="HEIGHT: 21px"><FONT face="宋体">
							<asp:textbox id="Textbox3" runat="server" CssClass="inputcss" Width="96px">0</asp:textbox></FONT></TD>
				</TR>
				<TR>
					<TD style="WIDTH: 101px; HEIGHT: 22px" align="right" width="101">&nbsp;退货数量
					</TD>
					<TD style="HEIGHT: 21px"><asp:textbox id="Textbox6" runat="server" CssClass="inputcss" Width="96px">0</asp:textbox></TD>
				</TR>
				<TR>
					<TD style="WIDTH: 101px; HEIGHT: 21px" align="right" width="101">备注</TD>
					<TD style="HEIGHT: 21px"><asp:textbox id="Textbox7" runat="server" CssClass="inputcss" Width="409px" TextMode="MultiLine"
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
