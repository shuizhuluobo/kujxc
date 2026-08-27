<%@ Page language="c#" Codebehind="class_change.aspx.cs" AutoEventWireup="false" Inherits="jxc.admin.Info.class_change" %>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN" >
<HTML>
	<HEAD>
		<title>咨询类修改</title>
		<meta name="GENERATOR" Content="Microsoft Visual Studio .NET 7.1">
		<meta name="CODE_LANGUAGE" Content="C#">
		<meta name="vs_defaultClientScript" content="JavaScript">
		<meta name="vs_targetSchema" content="http://schemas.microsoft.com/intellisense/ie5">
		<link href="/css/BasicLayout.css" rel="stylesheet" type="text/css">
		<script language="JavaScript" src="/js/calendar.js"></script>
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
								<td><font face="隶书" size="5">咨询类修改</font></td>
							</tr>
						</table>
					</td>
					<td width="250"></td>
				</tr>
			</table>
			<br>
			<table cellpadding="0" cellspacing="5" border="0" width="100%" class="title3">
				<tr>
					<td align="right" width="80">
						父类编号
					</td>
					<td>
						<asp:TextBox id="parentid" runat="server" CssClass="inputcss" Width="80px" Enabled="False"></asp:TextBox><FONT face="宋体">&nbsp; 
							由系统自动生成</FONT></td>
				</tr>
				<tr>
					<td align="right" width="80">
						当前级别
					</td>
					<td>
						<asp:TextBox id="ranks" runat="server" CssClass="inputcss" Width="80px" Enabled="False"></asp:TextBox><FONT face="宋体">&nbsp; 
							由系统自动生成</FONT></td>
				</tr>
				<tr>
					<td width="80" style="WIDTH: 80px" align="right">
						类别描述
					</td>
					<td>
						<asp:textbox id="des" runat="server" Width="344px" CssClass="inputcss"></asp:textbox>
					</td>
				</tr>
				<tr>
					<td width="80" style="WIDTH: 80px" align="right">
						是否末枝
					</td>
					<td>
						<asp:RadioButtonList id="ifend" runat="server" CssClass="title3">
							<asp:ListItem Value="0" Selected="True">否</asp:ListItem>
							<asp:ListItem Value="1">是</asp:ListItem>
						</asp:RadioButtonList><FONT face="宋体">&nbsp;备注：如果该栏目是一级分类则先择是，此栏目将不能再增加子栏目</FONT>
					</td>
				</tr>
				<tr>
					<td width="80" style="WIDTH: 80px" align="right">
						信息类别
					</td>
					<td>
						<asp:RadioButtonList id="ifsing" runat="server" CssClass="title3">
							<asp:ListItem Value="0" Selected="True">单条</asp:ListItem>
							<asp:ListItem Value="1">多条</asp:ListItem>
						</asp:RadioButtonList><FONT face="宋体">&nbsp;备注：如果该栏目只带一条记录则选单条，否则选多条</FONT>
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
                                
                                 
