<%@ Page language="c#" Codebehind="test.aspx.cs" AutoEventWireup="false" Inherits="health.front.test" %>
<%@ Register TagPrefix="uc1" TagName="menus" Src="ascx/menus.ascx" %>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN" >
<HTML>
	<HEAD>
		<title>test</title>
		<meta name="GENERATOR" Content="Microsoft Visual Studio .NET 7.1">
		<meta name="CODE_LANGUAGE" Content="C#">
		<meta name="vs_defaultClientScript" content="JavaScript">
		<meta name="vs_targetSchema" content="http://schemas.microsoft.com/intellisense/ie5">
	</HEAD>
	<body MS_POSITIONING="GridLayout">
		<form id="Form1" method="post" runat="server">
			<uc1:menus id="Menus1" runat="server"></uc1:menus>
		</form>
	</body>
</HTML>
