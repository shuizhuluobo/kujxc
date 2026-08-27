<%@ Page CodeBehind="top3.aspx.cs" Language="c#" AutoEventWireup="false" Inherits="jxc.admin.top3" %>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN" >
<html>
	<head>
		<title>top3</title>
		<meta name="GENERATOR" Content="Microsoft Visual Studio .NET 7.1">
		<meta name="CODE_LANGUAGE" Content="C#">
		<meta name="vs_defaultClientScript" content="JavaScript">
		<meta name="vs_targetSchema" content="http://schemas.microsoft.com/intellisense/ie5">
		<link href="/css/BasicLayout.css" rel="stylesheet" type="text/css">
		<script language="javascript">
			function changeWin(){
				if(top.fstMain.cols!="10,*")
				{
					top.fstMain.cols="10,*";
					//document.all.menuSwitch.innerHTML="<font class=point>4</font>";
				}
				else
				{
					top.fstMain.cols="200,*";
					//document.all.menuSwitch.innerHTML="<font class=point>3</font>";
				}
			}
			
			function switchSysBar3(){ 
			if (document.all){ 
			top.fstMain.cols="10,*" 
			} 
			} 
			function switchSysBar2(){ 
			if (document.all){ 
			top.fstMain.cols="200,*" 
			} 
			} 
		
		</script>
	</head>
	<body MS_POSITIONING="GridLayout" background="/image/background.jpg" topmargin=0 leftmargin=0>
		<form id="Form1" method="post" runat="server">
			
			<table cellpadding=0 cellspacing=0 border=0 width=100% class=title3>
				<tr height=6><td></td><td></td></tr>
				<tr>
				<td align=left>
					<a href="javascript:switchSysBar3()"><img src=/image/3.gif width=10 height=10 border=0/></a><a href="javascript:switchSysBar2()"><img src=/image/4.gif width=10 height=10 border=0/></a>
				</td>
				<td align=right>
					<%=memnames%>-><%=gly%>
				</td></tr>
				
			</table>
		</form>
	</body>
</html>
                                
                                 
