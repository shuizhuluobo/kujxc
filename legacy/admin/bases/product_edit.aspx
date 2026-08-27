<%@ Page language="c#" Codebehind="product_edit.aspx.cs" AutoEventWireup="false" Inherits="jxc.admin.bases.product_edit" %>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN" >
<HTML>
	<HEAD>
		<title>产品维护</title>
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
								<td><font face="隶书" size="5">产品设置</font></td>
							</tr>
						</table>
					</td>
					<td width="250"></td>
				</tr>
			</table>
			<br>
			<table cellpadding="0" cellspacing="5" border="0" width="90%" align="center" class="title3">
				<TR>
					<TD align="right" width="100"><FONT face="宋体">产品编码</FONT></TD>
					<TD><FONT face="宋体">
							<asp:TextBox id="TextBox1" runat="server" CssClass="inputcss" Width="280px" Enabled="False" BackColor="#E0E0E0"
								ReadOnly="True"></asp:TextBox>
							<asp:Label id="Label3" runat="server" ForeColor="Red">*</asp:Label></FONT></TD>
				</TR>
				<tr>
					<td align="right" width="100">
						商品名称
					</td>
					<td>
						<asp:TextBox id="cpname" runat="server" Width="280px" CssClass="inputcss"></asp:TextBox>
						<asp:Label id="Label2" runat="server" ForeColor="Red">*</asp:Label>
					</td>
				</tr>
				<tr>
					<td align="right" width="100" style="HEIGHT: 3px">
						一级类别&nbsp;
					</td>
					<td style="HEIGHT: 3px">
						<asp:TextBox id="TextBox2" runat="server" Width="112px" CssClass="inputcss"></asp:TextBox>
						<asp:DropDownList id="DropDownListlx" runat="server" CssClass="inputcss" AutoPostBack="True"></asp:DropDownList>
						<asp:TextBox style="Z-INDEX: 0" id="xh" runat="server" Width="112px" CssClass="inputcss" Visible="False"></asp:TextBox>
						<asp:Label style="Z-INDEX: 0" id="Label5" runat="server" ForeColor="Red">*</asp:Label>
					</td>
				</tr>
				<TR>
					<TD style="Z-INDEX: 0" width="100" align="right">二级类别</TD>
					<TD>
						<asp:TextBox style="Z-INDEX: 0" id="TextBox3" runat="server" Width="112px" CssClass="inputcss"></asp:TextBox>
						<asp:DropDownList style="Z-INDEX: 0" id="DropDownList1" runat="server" CssClass="inputcss" AutoPostBack="True"></asp:DropDownList>
						<asp:Label style="Z-INDEX: 0" id="Label1" runat="server" ForeColor="Red">*</asp:Label></TD>
				</TR>
				<TR>
					<TD width="100" align="right">数量单位
					</TD>
					<TD>
						<asp:TextBox id="gg" runat="server" Width="112px" CssClass="inputcss"></asp:TextBox>
						<asp:Label style="Z-INDEX: 0" id="Label6" runat="server" ForeColor="Red">*</asp:Label></TD>
				</TR>
				<tr>
					<td align="right" width="100">
						价格&nbsp;
					</td>
					<td>
						<asp:TextBox id="price" runat="server" Width="112px" CssClass="inputcss"></asp:TextBox>
						<asp:Label id="Label4" runat="server" ForeColor="Red">*</asp:Label></td>
				</tr>
				<tr>
					<td align="right" width="100">
						是否下柜&nbsp;
					</td>
					<td>
						<asp:DropDownList id="sfxg" runat="server" CssClass="inputcss">
							<asp:ListItem Value="是">是</asp:ListItem>
							<asp:ListItem Value="否" Selected="True">否</asp:ListItem>
						</asp:DropDownList></td>
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
