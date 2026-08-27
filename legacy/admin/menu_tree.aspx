<%@ Register TagPrefix="iewc" Namespace="Microsoft.Web.UI.WebControls" Assembly="Microsoft.Web.UI.WebControls" %>
<%@ Page language="c#" Codebehind="menu_tree.aspx.cs" AutoEventWireup="false" Inherits="jxc.admin.menu_tree" %>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN" >
<HTML>
	<HEAD>
		<title>操作菜单管理</title>
		<meta name="GENERATOR" Content="Microsoft Visual Studio .NET 7.1">
		<meta name="CODE_LANGUAGE" Content="C#">
		<meta name="vs_defaultClientScript" content="JavaScript">
		<meta name="vs_targetSchema" content="http://schemas.microsoft.com/intellisense/ie5">
	</HEAD>
	<body MS_POSITIONING="GridLayout">
		<form id="Form1" method="post" runat="server">
			<table cellpadding="0" cellspacing="0" border="0" width="100%">
				<tr>
					<td valign="top">
						<table cellSpacing="0" cellPadding="0" width="100%" border="0">
							<tr>
								<td height="2"></td>
							</tr>
							<tr>
								<td><iewc:treeview id="Treeview1" runat="server" ImageUrl="/image/man.gif">
										<iewc:TreeNode NavigateUrl="Menu_Manage.aspx?id=0" Text="菜单维护" Target="menuright"></iewc:TreeNode>
									</iewc:treeview></td>
							</tr>
						</table>
					</td>
				</tr>
			</table>
		</form>
	</body>
</HTML>
                                
                                 
