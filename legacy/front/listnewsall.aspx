<%@ Register TagPrefix="uc1" TagName="menus" Src="ascx/menus.ascx" %>
<%@ Register TagPrefix="uc1" TagName="listnewsall" Src="ascx/listnewsall.ascx" %>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN" >
<HTML>
	<HEAD>
		<title>listnewsall</title>
		<meta name="GENERATOR" Content="Microsoft Visual Studio .NET 7.1">
		<meta name="CODE_LANGUAGE" Content="C#">
		<meta name="vs_defaultClientScript" content="JavaScript">
		<meta name="vs_targetSchema" content="http://schemas.microsoft.com/intellisense/ie5">
		<link href="../css/sakura.css" rel="stylesheet" type="text/css">
		<meta http-equiv="Content-Type" content="text/html; charset=gb2312">
		<style type="text/css"> .style1 { COLOR: #cc3300 } BODY { BACKGROUND-IMAGE: none } </style>
	</HEAD>
	<body MS_POSITIONING="GridLayout">
		<form id="Form1" method="post" runat="server">
			<TABLE width="780" border="0" align="center" cellPadding="0" cellSpacing="0">
				<TR>
					<TD align="left" valign="top"></TD>
				</TR>
				<TR>
					<TD height="2" align="left" valign="top"></TD>
				</TR>
			</TABLE>
			<table width="780" height="19" border="0" align="center" cellpadding="0" cellspacing="0"
				class="wite">
				<tr valign="bottom" class="hm">
					<td>
						<uc1:menus id="Menus1" runat="server"></uc1:menus></td>
				</tr>
				<tr valign="bottom">
					<td valign="top">
					</td>
				</tr>
			</table>
			<table width="780" border="0" align="center" cellpadding="0" cellspacing="0" bgcolor="#ffffff">
				<tr>
					<td width="186" height="365" valign="top" bgcolor="#dae9fe"><img src="image/left.jpg" width="186">
					</td>
					<td colspan="2" align="left" valign="top"><table width="100%" border="0" cellspacing="0" cellpadding="0">
							<tr>
								<td height="10"></td>
							</tr>
							<tr>
								<td>
									<span class="style1">您的位置：</span> <a href="default.aspx">首页</a> &gt;&gt; 工作动态
									<hr size="1" color="#ff5f55">
								</td>
							</tr>
							<tr>
								<td>
									<uc1:listnewsall id="Listnewsall1" runat="server"></uc1:listnewsall></td>
							</tr>
						</table>
					</td>
				</tr>
			</table>
			<table cellSpacing="0" cellPadding="3" width="779" align="center" bgColor="#ffffff" border="0">
				<tr>
					<td align="center" height="3">&nbsp;</td>
				</tr>
				<tr>
					<td noWrap align="center" colSpan="3">&nbsp;</td>
				</tr>
			</table>
		</form>
	</body>
</HTML>
