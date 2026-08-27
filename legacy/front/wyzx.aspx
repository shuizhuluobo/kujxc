<%@ Page language="c#" AutoEventWireup="false" %>
<%@ Register TagPrefix="uc1" TagName="footer" Src="ascx/footer.ascx" %>
<%@ Register TagPrefix="uc2" TagName="wyzx" Src="../zxwd/wyzx.ascx" %>
<%@ Register TagPrefix="uc1" TagName="menus" Src="ascx/menus.ascx" %>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<HTML>
	<HEAD>
		<title>咨询问答</title>
		<meta name="GENERATOR" Content="Microsoft Visual Studio .NET 7.1">
		<meta name="CODE_LANGUAGE" Content="C#">
		<meta name="vs_defaultClientScript" content="JavaScript">
		<meta name="vs_targetSchema" content="http://schemas.microsoft.com/intellisense/ie5">
		<link href="sakura.css" rel="stylesheet" type="text/css">
		<LINK href="../css/sakura.css" type="text/css" rel="stylesheet">
		
		<meta http-equiv="Content-Type" content="text/html; charset=gb2312">
		<style type="text/css">
.style1 { COLOR: #cc3300 }
BODY { BACKGROUND-IMAGE: none }
		</style>
	</HEAD>
	<body MS_POSITIONING="GridLayout">
		<form id="Form1" method="post" runat="server">
			<table cellSpacing="0" cellPadding="0" width="770" align="center" border="0">
				<tr>
					<td vAlign="top" width="185" height="249">
						<table cellSpacing="0" cellPadding="0" width="100%" border="0">
							<tr>
								<td><IMG src="zhu/1.jpg" border="0"></td>
							</tr>
						</table>
					</td>
					<td vAlign="top" width="543">
						<table cellSpacing="0" cellPadding="0" width="100%" border="0">
							<tr>
								<td><IMG src="zhu/2.jpg" border="0"></td>
							</tr>
						</table>
						<table cellSpacing="0" cellPadding="0" width="100%" border="0">
							<tr>
								<td><uc1:menus id="Menus2" runat="server"></uc1:menus></td>
							</tr>
						</table>
						<table cellSpacing="0" cellPadding="0" width="100%" border="0">
							<tr>
								<td height="5"></td>
							</tr>
						</table>
						<table width="100%" border="0" cellspacing="0" cellpadding="0">
							<tr>
								<td height="10"></td>
							</tr>
							<tr>
								<td>
									<span class="style1">您的位置：</span> <a href="default.aspx">首页</a> &gt;&gt; 我要咨询
									<hr size="1" color="#ff5f55">
									<uc2:wyzx id="Wyzx1" runat="server"></uc2:wyzx>
								</td>
							</tr>
							<tr>
								<td>
								</td>
							</tr>
						</table>
					</td>
					<td width="42" valign="top">
						<table cellpadding="0" cellspacing="0" border="0" width="100%">
							<tr>
								<td><img src="zhu/4.jpg"></td>
							</tr>
						</table>
					</td>
				</tr>
			</table>
			<uc1:footer id="Footer1" runat="server"></uc1:footer>
		</form>
	</body>
</HTML>
