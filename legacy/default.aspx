<%@ Page language="c#" Codebehind="default.aspx.cs" AutoEventWireup="false" Inherits="jxc._default" %>
<%@ Register TagPrefix="uc1" TagName="commlogon2" Src="ascx/commlogon2.ascx" %>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN" >
<HTML>
	<HEAD>
		<title>default</title>
		<meta name="GENERATOR" Content="Microsoft Visual Studio .NET 7.1">
		<meta name="CODE_LANGUAGE" Content="C#">
		<meta name="vs_defaultClientScript" content="JavaScript">
		<meta name="vs_targetSchema" content="http://schemas.microsoft.com/intellisense/ie5">
		<LINK href="/css/BasicLayout.css" type="text/css" rel="stylesheet">
	</HEAD>
	<body background="image/bg.gif" style="FILTER:Gray">
		<form id="Form1" method="post" runat="server">
			<TABLE width="100%" height="100%" border="0" align="center" cellPadding="0" cellSpacing="0">
				<TBODY>
					<TR>
						<TD vAlign="middle" align="center">
							<TABLE cellSpacing="0" cellPadding="0" width="100%" border="0">
								<TBODY>
									<TR>
										<TD><table width="100%" height="70" border="0" cellpadding="0" cellspacing="0">
												<tr>
													<td width="27%">&nbsp;</td>
													<td width="52%"><p><FONT face="ËÎÌו"></FONT>&nbsp;</p>
														<p>&nbsp;</p>
													</td>
													<td width="7%"></td>
													<td width="7%"></td>
													<td width="7%"></td>
												</tr>
											</table>
										</TD>
									</TR>
									<TR>
										<TD background="image/login_3.gif" height="269">
											<TABLE cellSpacing="0" cellPadding="0" align="right" border="0">
												<TBODY>
													<TR>
														<TD width="57%" rowSpan="3"><IMG height="269" src="image/login_3.gif" width="129"></TD>
														<TD width="43%"></TD>
													</TR>
													<TR>
														<TD height="80">
															<uc1:commlogon2 id="Commlogon1" runat="server"></uc1:commlogon2>
														</TD>
													</TR>
													<TR>
														<TD vAlign="bottom" height="73"><IMG height="73" src="image/login_8.gif" width="574"></TD>
													</TR>
												</TBODY>
											</TABLE>
										</TD>
									</TR>
								</TBODY>
							</TABLE>
						</TD>
					</TR>
					<TR>
						<TD vAlign="middle" align="center" height="138">&nbsp;</TD>
					</TR>
				</TBODY>
			</TABLE>
		</form>
	</body>
</HTML>
