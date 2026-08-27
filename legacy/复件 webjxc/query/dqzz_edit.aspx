<%@ Page language="c#" Codebehind="dqzz_edit.aspx.cs" AutoEventWireup="false" Inherits="jxc.admin.bases.dqzz_edit" %>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN" >
<HTML>
	<HEAD>
		<title>总帐维护</title>
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
		<form id="dqzz_edit" method="post" runat="server">
			<table height="50" cellSpacing="0" cellPadding="0" width="100%" align="center" border="0">
				<tr>
					<td width="556" background="/image/title.gif">
						<table cellSpacing="0" cellPadding="0" width="100%" border="0">
							<tr>
								<td height="1"></td>
							</tr>
							<tr>
								<td width="80"></td>
								<td><font face="隶书" size="5">地区总帐</font></td>
							</tr>
						</table>
					</td>
					<td width="250"></td>
				</tr>
			</table>
			<br>
			<table class="title3" cellSpacing="5" cellPadding="0" width="90%" align="center" border="0">
				<tr>
					<td align="right" width="100">记帐凭单号&nbsp;
					</td>
					<td><FONT face="宋体"><asp:textbox id="czy" runat="server" BackColor="#E0E0E0" Width="96px" CssClass="inputcss" Enabled="False"></asp:textbox></FONT></td>
				</tr>
				<TR>
					<TD align="right" width="100">记帐日期</TD>
					<TD><FONT face="宋体"><asp:textbox id="Textbox1" runat="server" BackColor="White" Width="96px" CssClass="inputcss"></asp:textbox></FONT></TD>
				</TR>
				<tr>
					<td align="right" width="100">地区
					</td>
					<td><asp:textbox id="Textbox2" runat="server" BackColor="White" Width="96px" CssClass="inputcss"></asp:textbox>
						<asp:dropdownlist id="Dropdownlist2" runat="server" Width="72px" AutoPostBack="True"></asp:dropdownlist></td>
				</tr>
				<TR>
					<TD align="right" width="100">摘要</TD>
					<TD><asp:textbox id="zhaiyao" runat="server" BackColor="White" Width="96px" CssClass="inputcss">回款</asp:textbox><FONT face="宋体">类别</FONT>
						<asp:dropdownlist id="DropDownList1" runat="server" Width="72px">
							<asp:ListItem Value="回款">回款</asp:ListItem>
							<asp:ListItem Value="调拨回款">调拨回款</asp:ListItem>
							<asp:ListItem Value="调拨">调拨</asp:ListItem>
							<asp:ListItem Value="公司进货">公司进货</asp:ListItem>
							<asp:ListItem Value="其他">其他</asp:ListItem>
						</asp:dropdownlist></TD>
				</TR>
				<TR>
					<TD style="HEIGHT: 23px" align="right" width="100"><FONT face="宋体">借方</FONT>
					</TD>
					<TD style="HEIGHT: 23px"><FONT face="宋体"><asp:textbox id="Textbox4" runat="server" BackColor="White" Width="96px" CssClass="inputcss">0</asp:textbox><SPAN class="STYLE3">(没有填0)</SPAN></FONT></TD>
				</TR>
				<TR>
					<TD style="HEIGHT: 21px" align="right" width="100"><FONT face="宋体">贷方</FONT></TD>
					<TD style="HEIGHT: 21px"><FONT face="宋体"><asp:textbox id="Textbox3" runat="server" BackColor="White" Width="96px" CssClass="inputcss">0</asp:textbox><SPAN class="STYLE3">(没有填0)</SPAN></FONT></TD>
				</TR>
				<TR>
					<TD style="HEIGHT: 21px" align="right" width="100"><FONT face="宋体">余额</FONT></TD>
					<TD style="HEIGHT: 21px"><asp:textbox id="Textbox6" runat="server" BackColor="White" Width="96px" CssClass="inputcss">0</asp:textbox><SPAN class="STYLE3">(没有填0)</SPAN></TD>
				</TR>
				<TR>
					<TD style="HEIGHT: 21px" align="right" width="100"><FONT face="宋体">备注</FONT></TD>
					<TD style="HEIGHT: 21px"><FONT face="宋体">
							<asp:textbox id="Textbox5" runat="server" CssClass="inputcss" Width="96px"></asp:textbox></FONT></TD>
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
