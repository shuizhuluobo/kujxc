<%@ Page language="c#" Codebehind="head.aspx.cs" AutoEventWireup="false" Inherits="jxc.admin.head" %>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN" >
<html>
	<head>
		<title>head</title>
		<meta name="GENERATOR" Content="Microsoft Visual Studio .NET 7.1">
		<meta name="CODE_LANGUAGE" Content="C#">
		<meta name="vs_defaultClientScript" content="JavaScript">
		<meta name="vs_targetSchema" content="http://schemas.microsoft.com/intellisense/ie5">
		<link href="../css/style.css" rel="stylesheet" type="text/css">
		<script language="javascript">
			function reload()
			{
				//parent.frames("fraDeeptree").location.reload();
				//parent.frames("rootright").frames("right").location='/admin/desktop.aspx';
				//parent.location.reload ();
				window.open('/admin/desktop.aspx');
			}
			function relogin()
			{
				top.close ();
				window.open('/');
				//parent.parent.location='/front/index.aspx'
			}
		</script>
	</head>
	<body MS_POSITIONING="GridLayout" topmargin="0" leftmargin="0">
		<form id="Form1" method="post" runat="server">
			<table cellpadding="0" cellspacing="0" border="0" width="100%" height="40">
				<tr>
					<td width="80%"></td>
					<td align="right" valign="middle">
						<img src="/image/mytable.gif" border="0" width="16">
					<td>
					<td>
						<a href="#" onclick="reload();"><font color="blue">×ÀÃæ</font></a>&nbsp;
					</td>
					<td>
						<img src="/image/login.gif" border="0" width="16">
					</td>
					<td>
						<a href="#" onclick="relogin();"><font color="blue">×¢Ïú</font></a>&nbsp;
					</td>
					<td>
						<img src="/image/exit.gif" border="0" width="16">
					</td>
					<td>
						<a href="#" onclick="top.close();"><font color="blue">ÍË³ö</font></a>&nbsp;
					</td>
				</tr>
			</table>
		</form>
	</body>
</html>
                                
                                 
