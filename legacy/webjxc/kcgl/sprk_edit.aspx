<%@ Page language="c#" Codebehind="sprk_edit.aspx.cs" AutoEventWireup="false" Inherits="jxc.admin.bases.sprk_edit" %>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN" >
<HTML>
	<HEAD>
		<title>申请下拨</title>
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
		<form id="sprk_edit" method="post" runat="server">
			<table height="50" cellSpacing="0" cellPadding="0" width="100%" align="center" border="0">
				<tr>
					<td width="556" background="/image/title.gif">
						<table cellSpacing="0" cellPadding="0" width="100%" border="0">
							<tr>
								<td height="1"></td>
							</tr>
							<tr>
								<td width="80"></td>
								<td><font face="隶书" size="5">申请下拨</font></td>
							</tr>
						</table>
					</td>
					<td width="250"></td>
				</tr>
			</table>
			<br>
			<table class="title3" cellSpacing="5" cellPadding="0" width="90%" align="center" border="0">
				<tr>
					<td align="right" width="100">入库单编号
					</td>
					<td><FONT face="宋体">待生成</FONT>
					</td>
				</tr>
				<tr>
					<td align="right" width="100">入库日期
					</td>
					<td><asp:textbox id="rkrq" runat="server" CssClass="inputcss" Width="80px"></asp:textbox></td>
				</tr>
				<tr>
					<td align="right" width="100"><FONT face="宋体">经办人</FONT>&nbsp;
					</td>
					<td><asp:textbox id="czy" runat="server" CssClass="inputcss" Width="80px" BackColor="#E0E0E0" ReadOnly="True"></asp:textbox></td>
				</tr>
				<tr>
					<td style="HEIGHT: 23px" align="right" width="100">所在库房&nbsp;
					</td>
					<td style="HEIGHT: 23px"><asp:dropdownlist id="DropDownListlx" runat="server" CssClass="inputcss"></asp:dropdownlist></td>
				</tr>
				<tr>
					<td align="right" width="100" style="HEIGHT: 21px">入库产品&nbsp;
					</td>
					<td style="HEIGHT: 21px"><asp:textbox id="cpname" runat="server" CssClass="inputcss" Width="176px" BackColor="#C0FFC0"
							ReadOnly="True"></asp:textbox>
						<asp:textbox id="cpid" runat="server" Width="40px" CssClass="inputcss" Visible="False"></asp:textbox></td>
				</tr>
				<TR>
					<TD align="right" width="100"><FONT face="宋体">单价</FONT></TD>
					<TD><FONT face="宋体">
							<asp:textbox id="Textbox1" runat="server" Width="96px" CssClass="inputcss" BackColor="#E0E0E0"
								ReadOnly="True"></asp:textbox></FONT></TD>
				</TR>
				<tr>
					<td align="right" width="100">米数
					</td>
					<td><FONT face="宋体">
							<asp:textbox id="rksl" runat="server" Width="96px" CssClass="inputcss">0</asp:textbox></FONT></td>
				</tr>
			</table>
			<table cellSpacing="0" cellPadding="0" width="100%" border="0">
				<tr>
					<td align="center"><asp:button id="save" runat="server" CssClass="buttoncss" Width="62px" Text="保存"></asp:button>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<INPUT class="buttoncss" style="WIDTH: 64px; HEIGHT: 20px" onclick="closes()" type="button"
							value="返回">
					</td>
				</tr>
			</table>
		</form>
	</body>
</HTML>
