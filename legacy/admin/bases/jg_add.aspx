<%@ Page language="c#" Codebehind="jg_add.aspx.cs" AutoEventWireup="false" Inherits="jxc.admin.bases.jg_add" %>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN" >
<HTML>
	<HEAD>
		<title>机构增加</title>
		<meta name="GENERATOR" Content="Microsoft Visual Studio .NET 7.1">
		<meta name="CODE_LANGUAGE" Content="C#">
		<meta name="vs_defaultClientScript" content="JavaScript">
		<meta name="vs_targetSchema" content="http://schemas.microsoft.com/intellisense/ie5">
		<link href="/css/BasicLayout.css" rel="stylesheet" type="text/css">
		<script language="javascript">
		function closes()
		{
			opener.location.href=opener.location.href;
			opener = null;
			window.close ();
		}
		
		</script>
	</HEAD>
	<body MS_POSITIONING="GridLayout">
		<form id="Form1" method="post" runat="server">
			<table cellpadding="0" cellspacing="0" border="0" width="100%" height="50" align="center">
				<tr>
					<td width="556" background="/image/title.gif">
						<table cellpadding="0" cellspacing="0" border="0" width="100%">
							<tr>
								<td height="1"></td>
							</tr>
							<tr>
								<td width="80"></td>
								<td><font face="隶书" size="5">机构设置</font></td>
							</tr>
						</table>
					</td>
					<td width="250"></td>
				</tr>
			</table>
			<br>
			<table cellpadding="0" cellspacing="5" border="0" width="90%" align="center" class="title3">
				<tr>
					<td align="right" width="100">
						机构编号
					</td>
					<td>
						<asp:TextBox id="jgbhs" runat="server" Width="112px" CssClass="inputcss"></asp:TextBox>
					</td>
				</tr>
				<tr>
					<td align="right" width="100">
						机构名称
					</td>
					<td>
						<asp:TextBox id="jgmcs" runat="server" Width="328px" CssClass="inputcss"></asp:TextBox>
					</td>
				</tr>
				<tr>
					<td align="right" width="100">
						父编号
					</td>
					<td>
						<asp:TextBox id="parent1" Enabled="False" runat="server" Width="112px" CssClass="inputcss"></asp:TextBox>
					</td>
				</tr>
				<tr>
					<td align="right" width="100" style="HEIGHT: 3px">
						机构级别
					</td>
					<td style="HEIGHT: 3px">
						<asp:DropDownList id="DropDownListlx" runat="server" CssClass="inputcss"></asp:DropDownList>
					</td>
				</tr>
				<tr>
					<td align="right" width="100">
						地址
					</td>
					<td>
						<asp:TextBox id="addr" runat="server" Width="200px" CssClass="inputcss"></asp:TextBox></td>
				</tr>
				<tr>
					<td align="right" width="100">
						联系人
					</td>
					<td>
						<asp:TextBox id="lxr" runat="server" Width="112px" CssClass="inputcss"></asp:TextBox></td>
				</tr>
				<tr>
					<td align="right" width="100">
						联系电话
					</td>
					<td>
						<asp:TextBox id="lxdh" runat="server" Width="112px" CssClass="inputcss"></asp:TextBox></td>
				</tr>
				<tr>
					<td align="right" width="100">
						简 称
					</td>
					<td>
						<asp:TextBox id="jc" runat="server" Width="160px" CssClass="inputcss"></asp:TextBox></td>
				</tr>
				<tr>
					<td align="right" width="100">
						是否末枝
					</td>
					<td>
						<asp:RadioButtonList id="RadioButtonList1" runat="server" RepeatDirection="Horizontal">
							<asp:ListItem Value="1" Selected="True">是</asp:ListItem>
							<asp:ListItem Value="0">否</asp:ListItem>
						</asp:RadioButtonList>
					</td>
				</tr>
			</table>
			<table cellpadding="0" cellspacing="0" border="0" width="100%">
				<tr>
					<td align="center">
						<asp:Button id="save" runat="server" Width="62px" Text="保存" CssClass="buttoncss"></asp:Button>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<INPUT type="button" value="返回" class="buttoncss" onclick="closes()" style="WIDTH: 64px; HEIGHT: 20px">
					</td>
				</tr>
			</table>
		</form>
	</body>
</HTML>
