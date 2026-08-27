<%@ Page language="c#" Codebehind="sprtree.aspx.cs" AutoEventWireup="false" Inherits="jxc.admin.sprtree" %>
<%@ Register TagPrefix="iewc" Namespace="Microsoft.Web.UI.WebControls" Assembly="Microsoft.Web.UI.WebControls" %>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN" >
<HTML>
	<HEAD>
		<title>sprtree</title>
		<meta name="GENERATOR" Content="Microsoft Visual Studio .NET 7.1">
		<meta name="CODE_LANGUAGE" Content="C#">
		<meta name="vs_defaultClientScript" content="JavaScript">
		<meta name="vs_targetSchema" content="http://schemas.microsoft.com/intellisense/ie5">
	</HEAD>
	<body MS_POSITIONING="GridLayout">
		<form id="Form1" method="post" runat="server">
			<table cellSpacing="0" cellPadding="0" width="100%" border="0">
				<tr>
					<td><iewc:treeview id="Treeview1" runat="server" AutoPostBack="false">
							<iewc:TreeNode Text="机构管理" Expanded="True"></iewc:TreeNode>
						</iewc:treeview></td>
				</tr>
			</table>
		</form>
	</body>
</HTML>
                                
                                 
