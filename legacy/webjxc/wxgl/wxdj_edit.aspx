<%@ Page language="c#" Codebehind="wxdj_edit.aspx.cs" AutoEventWireup="false" Inherits="jxc.admin.bases.wxdj_edit" %>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN" >
<HTML>
	<HEAD>
		<title>维修记录单</title>
		<meta name="GENERATOR" content="Microsoft Visual Studio .NET 7.1">
		<meta name="CODE_LANGUAGE" content="C#">
		<meta name="vs_defaultClientScript" content="JavaScript">
		<meta name="vs_targetSchema" content="http://schemas.microsoft.com/intellisense/ie5">
		<LINK rel="stylesheet" type="text/css" href="/css/BasicLayout.css">
		<script language="javascript">
		function closes()
		{
			opener.location.href=opener.location.href;
			opener = null;
			window.close ();
		}
		
		</script>
		<meta content="text/html; charset=gb2312" http-equiv="Content-Type">
	</HEAD>
	<body MS_POSITIONING="GridLayout">
		<form id="Form1" method="post" runat="server">
			<table height="50" cellSpacing="0" cellPadding="0" width="100%" align="center" border="0">
				<tr>
					<td background="/image/title.gif" width="556">
						<table cellSpacing="0" cellPadding="0" width="100%" border="0">
							<tr>
								<td height="1"></td>
							</tr>
							<tr>
								<td width="80"></td>
								<td><font size="5" face="隶书">维修记录单登记</font></td>
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
					<td style="HEIGHT: 30px; WIDTH: 103px" height="30" width="103" align="right">维修编号
					</td>
					<td style="HEIGHT: 30px; WIDTH: 174px"><FONT face="宋体"><asp:textbox id="Textbox2" runat="server" CssClass="inputcss" Width="96px" BackColor="#E0E0E0"
								ReadOnly="True"></asp:textbox></FONT></td>
					<td style="HEIGHT: 30px; WIDTH: 68px" colSpan="2"></td>
					<td style="HEIGHT: 30px" colSpan="2"></td>
				</tr>
				<tr>
					<td style="HEIGHT: 5px; WIDTH: 103px" align="right"><FONT face="宋体">用户单位</FONT></td>
					<td style="HEIGHT: 5px; WIDTH: 174px"><asp:textbox id="Textbox5" runat="server" CssClass="inputcss" Width="224px" Height="21px" AutoPostBack="True"
							tabIndex="1"></asp:textbox></td>
					<TD style="HEIGHT: 5px; WIDTH: 70px"><FONT face="宋体">&nbsp; </FONT>
					</TD>
					<TD style="HEIGHT: 5px; WIDTH: 109px" colSpan="3"></TD>
				</tr>
				<TR>
					<TD style="HEIGHT: 5px; WIDTH: 103px" borderColor="#b0c0a0" align="right"><FONT face="宋体">联系人</FONT></TD>
					<TD style="HEIGHT: 5px; WIDTH: 174px" borderColor="#b0c0a0"><FONT face="宋体"><asp:textbox id="Textbox4" style="Z-INDEX: 0" runat="server" CssClass="inputcss" Width="216px"
								AutoPostBack="True" tabIndex="2"></asp:textbox></FONT></TD>
					<TD style="HEIGHT: 5px; WIDTH: 70px" borderColor="#b0c0a0"><FONT style="Z-INDEX: 0" face="宋体">联系电话</FONT></TD>
					<TD style="HEIGHT: 5px; WIDTH: 109px" borderColor="#c00000"><asp:textbox id="Textbox1" style="Z-INDEX: 0" runat="server" CssClass="inputcss" Width="160px"
							AutoPostBack="True" tabIndex="3"></asp:textbox></TD>
				</TR>
				<TR>
					<TD style="HEIGHT: 199px; WIDTH: 103px" borderColor="#b0c0a0" align="right"><FONT face="宋体">故障信息</FONT></TD>
					<TD style="HEIGHT: 199px; WIDTH: 174px" borderColor="#b0c0a0"><FONT face="宋体"><asp:textbox id="Textbox6" style="Z-INDEX: 0" runat="server" CssClass="inputcss" Width="232px"
								Height="179px" AutoPostBack="True" TextMode="MultiLine" tabIndex="4"></asp:textbox></FONT></TD>
					<TD style="HEIGHT: 199px; WIDTH: 70px" borderColor="#b0c0a0"><FONT face="宋体">地址及备注</FONT></TD>
					<TD style="HEIGHT: 199px; WIDTH: 109px" borderColor="#c00000"><asp:textbox id="Textbox7" style="Z-INDEX: 0" runat="server" CssClass="inputcss" Width="248"
							Height="179px" AutoPostBack="True" TextMode="MultiLine" tabIndex="5"></asp:textbox></TD>
				</TR>
				<TR>
					<TD style="HEIGHT: 4px; WIDTH: 103px" borderColor="#000010" borderColorDark="#a00000"><FONT face="宋体">所属区域</FONT></TD>
					<TD style="HEIGHT: 4px; WIDTH: 174px" borderColor="#b0c0a0"><asp:dropdownlist id="DropDownList1" style="Z-INDEX: 0" runat="server" tabIndex="6" Width="104px"
							Height="24px">
							<asp:ListItem Selected="True"></asp:ListItem>
							<asp:ListItem Value="中心">中心</asp:ListItem>
							<asp:ListItem Value="西线">西线</asp:ListItem>
							<asp:ListItem Value="南线">南线</asp:ListItem>
						</asp:dropdownlist></TD>
					<TD style="HEIGHT: 4px; WIDTH: 70px" borderColor="#b0c0a0"></TD>
					<TD style="HEIGHT: 4px" borderColor="#c00000"></TD>
				</TR>
				<TR>
					<TD style="HEIGHT: 4px; WIDTH: 103px" width="103" align="right"><FONT face="宋体">登记时间</FONT></TD>
					<TD style="HEIGHT: 4px; WIDTH: 174px"><FONT face="宋体"><asp:textbox id="Textbox3" runat="server" CssClass="inputcss" Width="96px" BackColor="#E0E0E0"
								ReadOnly="True"></asp:textbox></FONT></TD>
					<TD style="HEIGHT: 4px; WIDTH: 70px"><FONT face="宋体">登记人</FONT></TD>
					<TD style="HEIGHT: 4px" colSpan="3"><FONT face="宋体"><asp:textbox id="czy" runat="server" CssClass="inputcss" Width="96px" BackColor="White" ReadOnly="True"></asp:textbox></FONT></TD>
				</TR>
			</table>
			<TABLE cellSpacing="0" cellPadding="0" width="100%" border="0">
				<TR>
					<TD style="HEIGHT: 37px" align="center"><asp:button id="save" runat="server" CssClass="buttoncss" Width="80px" Text="保存" Height="37px"></asp:button>&nbsp;&nbsp;
						<asp:button id="Button3" runat="server" CssClass="buttoncss" Width="63px" Text="打印" Visible="False"></asp:button>&nbsp;&nbsp;&nbsp;<INPUT onclick="closes()" class="buttoncss" style="HEIGHT: 36px; WIDTH: 64px" type="button"
							value="返回">
					</TD>
				</TR>
			</TABLE>
		</form>
	</body>
</HTML>
