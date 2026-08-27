<%@ Page language="c#" Codebehind="zxdy_add.aspx.cs" AutoEventWireup="false" Inherits="jxc.admin.info.zxdy_add" %>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN" >
<HTML>
	<HEAD>
		<title>在线咨询内容回复</title>
		<meta content="Microsoft Visual Studio .NET 7.1" name="GENERATOR">
		<meta content="C#" name="CODE_LANGUAGE">
		<meta content="JavaScript" name="vs_defaultClientScript">
		<meta content="http://schemas.microsoft.com/intellisense/ie5" name="vs_targetSchema">
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
		<form runat="server">
			<table cellpadding="0" cellspacing="0" border="0" width="100%" height="50" align="center">
				<tr>
					<td width="556" background="/image/title.gif">
						<table cellpadding="0" cellspacing="0" border="0" width="100%">
							<tr>
								<td height="1"></td>
							</tr>
							<tr>
								<td width="80"></td>
								<td><font face="隶书" size="5">在线咨询内容回复</font></td>
							</tr>
						</table>
					</td>
					<td width="250"></td>
				</tr>
			</table>
			<table cellSpacing="5" cellPadding="0" width="100%" border="0" class="title3">
				<tr>
					<td width="12%">
						<div align="center">姓名
						</div>
					</td>
					<td width="23%"><asp:label id="twxm" runat="server"></asp:label></td>
					<td width="17%">
						<div align="center">邮政编码</div>
					</td>
					<td width="48%"><asp:label id="yb" runat="server"></asp:label></td>
				</tr>
				<tr>
					<td>
						<div align="center">联系电话</div>
					</td>
					<td><asp:label id="lldh" runat="server"></asp:label></td>
					<td>
						<div align="center">电子邮件</div>
					</td>
					<td><asp:label id="email" runat="server"></asp:label></td>
				</tr>
				<tr>
					<td>
						<div align="center">联系地址</div>
					</td>
					<td colSpan="3"><asp:label id="txdz" runat="server"></asp:label></td>
				</tr>
				<tr>
					<td>
						<div align="center">发表时间
						</div>
					</td>
					<td colSpan="3"><asp:label id="fbsj" runat="server"></asp:label></td>
				</tr>
				<tr>
					<td>
						<div align="center">标题</div>
					</td>
					<td colSpan="3"><asp:label id="twbt" runat="server"></asp:label></td>
				</tr>
				<tr>
					<td height="18">
						<div align="center">内容</div>
					</td>
					<td colSpan="3"><asp:textbox id="tenr" runat="server" Width="100%" TextMode="MultiLine"></asp:textbox></td>
				</tr>
			</table>
			<div align="center">
				<table width="100%" border="0" cellpadding="0" cellspacing="0">
					<tr>
						<td width="12%">
							<div align="center">回复人</div>
						</td>
						<td width="23%"><asp:textbox id="hfr" runat="server"></asp:textbox></td>
						<td width="17%">
							<div align="center">回复时间</div>
						</td>
						<td width="48%"><asp:textbox id="hfsj" runat="server"></asp:textbox></td>
					</tr>
					<tr>
						<td>
							<div align="center">回复内容</div>
						</td>
						<td colSpan="3"><asp:textbox id="hfnr" runat="server" Width="100%" TextMode="MultiLine" Rows="20"></asp:textbox></td>
					</tr>
				</table>
			</div>
			<table width="100%" border="0" cellpadding="0" cellspacing="0">
				<tr>
					<td align="center"><asp:button id="save" runat="server" Width="65px" Text="保存" CssClass="title3"></asp:button>&nbsp;&nbsp;<INPUT id="ret" style="WIDTH: 56px; HEIGHT: 24px" onclick="closes()" type="button" value="返回"
							class="title3">
					</td>
				</tr>
			</table>
		</form>
	</body>
</HTML>
                                
                                 
