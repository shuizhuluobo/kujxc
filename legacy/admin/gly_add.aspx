<%@ Page language="c#" Codebehind="gly_add.aspx.cs" AutoEventWireup="false" Inherits="jxc.admin.gly_add" %>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN" >
<HTML>
	<HEAD>
		<title>增加操作员</title>
		<meta name="GENERATOR" Content="Microsoft Visual Studio .NET 7.1">
		<meta name="CODE_LANGUAGE" Content="C#">
		<meta name="vs_defaultClientScript" content="JavaScript">
		<meta name="vs_targetSchema" content="http://schemas.microsoft.com/intellisense/ie5">
		<link href="../../css/style.css" rel="stylesheet" type="text/css">
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
								<td><font face="隶书" size="5">增加操作员</font></td>
							</tr>
						</table>
					</td>
					<td width="250"></td>
				</tr>
			</table>
			<table cellpadding="0" cellspacing="4" border="0" width="500" align="center">
				<tr>
					<td width="80">管理员代号</td>
					<td>
						<asp:TextBox id="tglydh" runat="server" Width="136px" CssClass="inputcss"></asp:TextBox></td>
				</tr>
				<tr>
					<td width="80">管理员姓名</td>
					<td>
						<asp:TextBox id="tglyname" runat="server" Width="136px" CssClass="inputcss"></asp:TextBox></td>
				</tr>
				<tr>
					<td width="80">管理员密码</td>
					<td>
						<asp:TextBox id="pwd1" runat="server" Width="112px" CssClass="inputcss" TextMode="Password"></asp:TextBox></td>
				</tr>
				<tr>
					<td width="80">重输密码</td>
					<td>
						<asp:TextBox id="pwd2" runat="server" Width="112px" CssClass="inputcss" TextMode="Password"></asp:TextBox></td>
				</tr>
				<tr>
					<td width="80">级别</td>
					<td>
						<asp:DropDownList id="rank" runat="server"></asp:DropDownList></td>
				</tr>
				<tr>
					<td width="80">职务</td>
					<td>
						<asp:DropDownList id="Dropdownlist2" runat="server"></asp:DropDownList></td>
				</tr>
				<tr>
					<td width="80"></td>
					<td>
						<asp:Button id="add" runat="server" Width="96px" CssClass="buttoncss" Text="增加管理员"></asp:Button>&nbsp;&nbsp;<INPUT type="button" value="返回" class="buttoncss" onclick="closes()" style="WIDTH: 64px; HEIGHT: 20px">
					</td>
				</tr>
			</table>
		</form>
	</body>
</HTML>
                                
                                 
