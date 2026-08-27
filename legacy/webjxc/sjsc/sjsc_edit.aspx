<%@ Page language="c#" Codebehind="sjsc_edit.aspx.cs" AutoEventWireup="false" Inherits="jxc.admin.bases.sjsc_edit" %>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN" >
<HTML>
	<HEAD>
		<title>产品维护</title>
		<meta content="Microsoft Visual Studio .NET 7.1" name="GENERATOR">
		<meta content="C#" name="CODE_LANGUAGE">
		<meta content="JavaScript" name="vs_defaultClientScript">
		<meta content="http://schemas.microsoft.com/intellisense/ie5" name="vs_targetSchema">
		<LINK href="/css/BasicLayout.css" type="text/css" rel="stylesheet">
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
		<form id="sjsc_edit" method="post" runat="server">
			<table height="50" cellSpacing="0" cellPadding="0" width="100%" align="center" border="0">
				<tr>
					<td width="556" background="/image/title.gif">
						<table cellSpacing="0" cellPadding="0" width="100%" border="0">
							<tr>
								<td height="1"></td>
							</tr>
							<tr>
								<td width="80"></td>
								<td><font face="隶书" size="5">数据删除</font></td>
							</tr>
						</table>
					</td>
					<td width="250"></td>
				</tr>
			</table>
			<br>
			<table class="title3" cellSpacing="5" cellPadding="0" width="90%" align="center" border="0">
				<tr>
					<td colspan="4" align="left"><FONT face="宋体">
							<asp:CheckBox id="CheckBox1" runat="server" Text="调拨记录"></asp:CheckBox>
							<asp:TextBox id="txt_dbrq" runat="server"></asp:TextBox>之前的信息</FONT></td>
				</tr>
				<tr>
					<td colspan="4" align="left"><FONT face="宋体">
							<asp:CheckBox id="CheckBox2" runat="server" Text="销售记录"></asp:CheckBox>
							<asp:TextBox id="txt_xsrq" runat="server"></asp:TextBox>之前的信息</FONT></td>
				</tr>
				<tr>
					<td colspan="4" align="left">
						<asp:CheckBox id="CheckBox3" runat="server" Text="入库记录 所有剩余库存等于0的记录  "></asp:CheckBox>&nbsp;</td>
				</tr>
				<TR>
					<TD style="COLOR: red" align="left" colSpan="4">&nbsp;&nbsp;&nbsp;&nbsp;<SPAN class="style2">警告:该数据删除后不可恢复,请在删除前备份完数据!点删除后在看到提示后再进行其它操作!</SPAN></TD>
				</TR>
			</table>
			<TABLE cellSpacing="0" cellPadding="0" width="100%" border="0">
				<TR>
					<TD style="HEIGHT: 37px" align="center"><asp:button id="save" runat="server" Width="62px" CssClass="buttoncss" Text="确定"></asp:button>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<INPUT class="buttoncss" style="WIDTH: 64px; HEIGHT: 20px" onclick="closes()" type="button"
							value="返回">
					</TD>
				</TR>
			</TABLE>
		</form>
	</body>
</HTML>
