<%@ Page language="c#" Codebehind="Class_Tree.aspx.cs" AutoEventWireup="false" Inherits="jxc.admin.info.info_Tree" %>
<%@ Register TagPrefix="iewc" Namespace="Microsoft.Web.UI.WebControls" Assembly="Microsoft.Web.UI.WebControls" %>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN" >
<HTML>
	<HEAD>
		<title>Class_Tree</title>
		<meta content="Microsoft Visual Studio .NET 7.1" name="GENERATOR">
		<meta content="C#" name="CODE_LANGUAGE">
		<meta content="JavaScript" name="vs_defaultClientScript">
		<meta content="http://schemas.microsoft.com/intellisense/ie5" name="vs_targetSchema">
	</HEAD>
	<body MS_POSITIONING="GridLayout">
		<form id="Form1" method="post" runat="server">
			<table cellSpacing="0" cellPadding="0" width="100%" border="0">
				<tr>
					<td><iewc:treeview id="Treeview1" runat="server" AutoPostBack="false">
							<iewc:TreeNode NavigateUrl="Class_Manage.aspx?id=0" Text="信息发布管理" Target="classright"></iewc:TreeNode>
						</iewc:treeview></td>
				</tr>
			</table>
		</form>
	</body>
</HTML>
                                
                                 
