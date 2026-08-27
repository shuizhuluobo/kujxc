<%@ Page language="c#" Codebehind="Menu_Photo.aspx.cs" AutoEventWireup="false" Inherits="jxc.admin.Menu_Photo" %>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN" >
<HTML>
	<HEAD>
		<title>Menu_Photo</title>
		<meta name="GENERATOR" Content="Microsoft Visual Studio .NET 7.1">
		<meta name="CODE_LANGUAGE" Content="C#">
		<meta name="vs_defaultClientScript" content="JavaScript">
		<meta name="vs_targetSchema" content="http://schemas.microsoft.com/intellisense/ie5">
		<link href="/css/BasicLayout.css" rel="stylesheet" type="text/css">
		
	</HEAD>
	<body MS_POSITIONING="GridLayout">
		<form id="Form1" method="post" runat="server">
			<TABLE cellSpacing="0" cellPadding="3" width="575" border="0" style="BORDER-COLLAPSE: collapse"
				bordercolor="#111111" align="center">
				<tr>
					<td>
						<asp:datalist id="Datalist" runat="server" ShowHeader="False" Width="100%" ShowFooter="False"
							RepeatColumns="2" CssClass=title3>
							<SeparatorStyle BorderWidth="2px" BorderStyle="Groove"></SeparatorStyle>
							<ItemTemplate>
								<table cellspacing="0" cellpadding="5" width="100%" border="0" class=title3>
									<tr>
									
										<td align="center" width="90"><a href=# onclick='var udswin=window.open("<%# DataBinder.Eval(Container.DataItem, "qxcd") %>","","toolbar=no,status=yes,resizable=yes");udswin.moveTo(0,0);udswin.resizeTo(window.screen.availWidth,window.screen.availHeight);'><img 
		src='<%# DataBinder.Eval(Container.DataItem, "imgpath") %>' 
		border=0 width="20" ></a></td>
									</tr>
								
								
								<tr><td width=90 align=center>
									<a href=# onclick='var udswin=window.open("<%# DataBinder.Eval(Container.DataItem, "qxcd") %>","","toolbar=no,status=yes,resizable=yes");udswin.moveTo(0,0);udswin.resizeTo(window.screen.availWidth,window.screen.availHeight);'>
									<%# DataBinder.Eval(Container.DataItem, "des") %></a>
								</td></tr>
								
								</table>
							</ItemTemplate>
						</asp:datalist>
					</td>
				</tr>
			</TABLE>
		</form>
	</body>
</HTML>
                                
                                 
