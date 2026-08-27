<%@ Page language="c#" Codebehind="gys_edit.aspx.cs" AutoEventWireup="false" Inherits="jxc.admin.bases.gys_edit" %>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN" >
<HTML>
	<HEAD>
		<title>供应商维护</title>
		<meta name="GENERATOR" Content="Microsoft Visual Studio .NET 7.1">
		<meta name="CODE_LANGUAGE" Content="C#">
		<meta name="vs_defaultClientScript" content="JavaScript">
		<meta name="vs_targetSchema" content="http://schemas.microsoft.com/intellisense/ie5">
		<link href="/css/BasicLayout.css" rel="stylesheet" type="text/css">
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
		<form id="Form1" method="post" runat="server">
			<table cellpadding="0" cellspacing="0" border="0" width="100%" height="50" align="center">
				<tr>
					<td width="556" background="/image/title.gif">
						<table cellpadding="0" cellspacing="0" border="0" width="100%">
							<tr>
								<td height="1"></td>
							</tr>
							<tr>
								<td width="80"></td>
								<td><font face="隶书" size="5">产品设置</font></td>
							</tr>
						</table>
					</td>
					<td width="250"></td>
				</tr>
			</table>
			<br>
			<table cellpadding="0" cellspacing="5" border="0" width="90%" align="center" class="title3">
				<TR>
					<TD align="right" width="100"><FONT face="宋体">供应商编码</FONT></TD>
					<TD><FONT face="宋体">
							<asp:TextBox id="gysid" runat="server" CssClass="inputcss" Width="280px"></asp:TextBox>
							<asp:Label id="Label3" runat="server" ForeColor="Red">*</asp:Label></FONT></TD>
				</TR>
				<tr>
					<td align="right" width="100">
						&nbsp;供应商名称
					</td>
					<td>
						<asp:TextBox id="cpname" runat="server" Width="280px" CssClass="inputcss"></asp:TextBox>
						<asp:Label id="Label2" runat="server" ForeColor="Red">*</asp:Label>
					</td>
				</tr>
				<tr>
					<td align="right" width="100">
						&nbsp;联系人
					</td>
					<td>
						<asp:TextBox id="lxrtxt" runat="server" Width="112px" CssClass="inputcss"></asp:TextBox>
					</td>
				</tr>
				<TR>
					<TD style="HEIGHT: 3px" align="right" width="100"><FONT face="宋体">电话</FONT></TD>
					<TD style="HEIGHT: 3px"><FONT face="宋体">
							<asp:TextBox id="txtdh" runat="server" Width="112px" CssClass="inputcss"></asp:TextBox></FONT></TD>
				</TR>
				<tr>
					<td align="right" width="100" style="HEIGHT: 3px">
						传真&nbsp;
					</td>
					<td style="HEIGHT: 3px">
						<asp:TextBox id="txtcz" runat="server" Width="112px" CssClass="inputcss"></asp:TextBox>
						<asp:DropDownList id="DropDownListlx" runat="server" CssClass="inputcss" AutoPostBack="True" Visible="False"></asp:DropDownList>
					</td>
				</tr>
				<tr>
					<td align="right" width="100">
						地区&nbsp;
					</td>
					<td>
						<asp:TextBox id="txtdq" runat="server" Width="112px" CssClass="inputcss"></asp:TextBox>
						<asp:Label id="Label4" runat="server" ForeColor="Red">*</asp:Label></td>
				</tr>
				<TR>
					<TD align="right" width="100">开户银行</TD>
					<TD>
						<asp:TextBox id="txtkhyh" runat="server" Width="160px" CssClass="inputcss"></asp:TextBox></TD>
				</TR>
				<TR>
					<TD align="right" width="100"><FONT face="宋体">银行帐号</FONT></TD>
					<TD><FONT face="宋体">
							<asp:TextBox id="txtyhzh" runat="server" Width="160px" CssClass="inputcss"></asp:TextBox></FONT></TD>
				</TR>
				<TR>
					<TD align="right" width="100">单位地址</TD>
					<TD><FONT face="宋体">
							<asp:TextBox id="txtdwdz" runat="server" Width="280px" CssClass="inputcss"></asp:TextBox></FONT></TD>
				</TR>
				<TR>
					<TD align="right" width="100"><FONT face="宋体">备注</FONT></TD>
					<TD>
						<asp:TextBox id="txtzjm" runat="server" Width="160px" CssClass="inputcss"></asp:TextBox></TD>
				</TR>
				<tr>
					<td align="right" width="100">
						状态&nbsp;
					</td>
					<td>
						<asp:DropDownList id="sfxg" runat="server" CssClass="inputcss">
							<asp:ListItem Value="正常">正常</asp:ListItem>
							<asp:ListItem Value="停用" Selected="True">停用</asp:ListItem>
						</asp:DropDownList></td>
				</tr>
			</table>
			<table cellpadding="0" cellspacing="0" border="0" width="100%">
				<tr>
					<td align="center">
						<asp:Button id="save" runat="server" Width="62px" Text="保存" CssClass="buttoncss"></asp:Button>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<INPUT type="button" value="返回" class="buttoncss" onclick="closes()" style="WIDTH: 64px; HEIGHT: 20px">
					</td>
				</tr>
			</table>
		</form>
	</body>
</HTML>
