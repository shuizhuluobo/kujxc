<%@ Page language="c#" Codebehind="top2.aspx.cs" AutoEventWireup="false" Inherits="jxc.admin.top2" %>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN" >
<HTML>
	<HEAD>
		<title>top2</title>
		<meta name="GENERATOR" Content="Microsoft Visual Studio .NET 7.1">
		<meta name="CODE_LANGUAGE" Content="C#">
		<meta name="vs_defaultClientScript" content="JavaScript">
		<meta name="vs_targetSchema" content="http://schemas.microsoft.com/intellisense/ie5">
		<link href="../css/style.css" rel="stylesheet" type="text/css">
		<script language="javascript">
			function reload()
			{
			//	parent.frames("fraDeeptree").location.reload();
				parent.frames("right").location.reload();
			//	parent.location.reload ();
			}
			function relogin()
			{
				parent.parent.location='/login.aspx';
			}
		</script>
	</HEAD>
	<body MS_POSITIONING="GridLayout" topmargin="0" leftmargin="0">
		<form id="Form1" method="post" runat="server">
			<table cellpadding="0" cellspacing="0" border="0" width="100%" background=/image/line.jpg>
				<tr>
					<td height="30"  valign="middle"><font color="white" size="2"><b>&nbsp;&nbsp;管理员代码：<%=regname%>
								管理员姓名：<%=realname%>&nbsp;&nbsp;机构名称：<%=memname%></b></font></td>
					<td  align="right">
						<a href="#" onclick="relogin();"><font color="white">重新登录</font></a>&nbsp;&nbsp;
						</td>
				</tr>
			</table>
		</form>
	</body>
</HTML>
                                
                                 
