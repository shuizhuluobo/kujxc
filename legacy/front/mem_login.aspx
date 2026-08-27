<%@ Register TagPrefix="uc1" TagName="footer" Src="ascx/footer.ascx" %>
<%@ Register TagPrefix="uc1" TagName="head" Src="ascx/head.ascx" %>
<%@ Page language="c#" Codebehind="mem_login.aspx.cs" AutoEventWireup="false" Inherits="health.front.mem_login" %>
<%@ Register TagPrefix="uc1" TagName="qlogon" Src="ascx/qlogon.ascx" %>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN" >
<HTML>
	<HEAD>
		<title>mem_login</title>
		<meta name="GENERATOR" Content="Microsoft Visual Studio .NET 7.1">
		<meta name="CODE_LANGUAGE" Content="C#">
		<meta name="vs_defaultClientScript" content="JavaScript">
		<meta name="vs_targetSchema" content="http://schemas.microsoft.com/intellisense/ie5">
		<LINK href="images/style.css" type="text/css" rel="stylesheet">
		<LINK href="/css/BasicLayout.css" type="text/css" rel="stylesheet">
		<style type="text/css">.style1 {
	FONT-SIZE: 1.2em; COLOR: #660033
}
.style10 {
	FONT-SIZE: 1.6em; COLOR: #660000; FONT-FAMILY: "ºÚÌå"
}
.style12 {
	FONT-SIZE: 12px; COLOR: #000000
}
.style14 {
	COLOR: #ff9148
}
.style15 {
	COLOR: #ff00ff
}
		</style>
	</HEAD>
	<body MS_POSITIONING="GridLayout" style="text-align:center">
		<form id="Form1" method="post" runat="server">
			<table cellpadding="0" cellspacing="0" border="0" width="780" align=center>
				<tr>
					<td>
						<uc1:head id="Head1" runat="server"></uc1:head></td>
				</tr>
				<tr>
					<td>
						<div class="right">
							<div style="BACKGROUND-IMAGE:url(images/left_denglu_04.png); WIDTH:160px; HEIGHT:37px"></div>
							<div style="PADDING-RIGHT:0px; PADDING-LEFT:0px; FONT-SIZE:12px; PADDING-BOTTOM:5px; WIDTH:160px; PADDING-TOP:5px; HEIGHT:80px">
								<uc1:qlogon id="Qlogon1" runat="server"></uc1:qlogon>
							</div>
							<table width="160" border="0" cellspacing="0" cellpadding="0">
								<tr>
									<td><img src="images/left_bottom_01.png" alt="" width="160" height="44"></td>
								</tr>
							</table>
							<div style="BACKGROUND-IMAGE:url(images/02_guanli.png); WIDTH:160px; HEIGHT:56px">
							</div>
							<div style="PADDING-RIGHT:0px; PADDING-LEFT:0px; FONT-SIZE:12px; BACKGROUND-IMAGE:url(images/left_xinxifuwu01.png); PADDING-BOTTOM:5px; WIDTH:160px; PADDING-TOP:5px; HEIGHT:170px; TEXT-ALIGN:center">
								<asp:Panel id="Panel1" runat="server"></asp:Panel>
							</div>
							<table width="100%" border="0" cellspacing="0" cellpadding="0">
								<tr>
									<td><img src="images/left_xinxifuwu02.png" alt="" width="160" height="14"></td>
								</tr>
							</table>
						</div>
						<DIV></DIV>
					</td>
				</tr>
				<tr>
					<td>
						<uc1:footer id="Footer1" runat="server"></uc1:footer></td>
				</tr>
			</table>
		</form>
	</body>
</HTML>
