<%@ Control Language="c#" AutoEventWireup="false" Codebehind="qlogon.ascx.cs" Inherits="health.front.qlogon" TargetSchema="http://schemas.microsoft.com/intellisense/ie5" %>
<table cellSpacing="0" cellPadding="0" border="0" bgcolor="#676767">
	<tr>
		<td>
			<table class="title3" id="table1" borderColor="#cdcdcd" cellSpacing="3" cellPadding="0"
				border="0" runat="server">
				<tr>
					<td height="4"></td>
				</tr>
				<TR>
					<TD align="center" width="28">
						<P align="right"><font color="white">帐号</font></P>
					</TD>
					<TD><asp:textbox id="sfzh" runat="server" Width="104px" CssClass="inputcss"></asp:textbox></TD>
				</TR>
				<TR>
					<TD align="right" height="28"><font color="white">密码</font></TD>
					<TD><asp:textbox id="pwd" runat="server" Width="70" CssClass="inputcss" TextMode="Password"></asp:textbox></TD>
				</TR>
				<TR>
					<TD height="28">
						<div align="right"><font color="white">类型</font></div>
					</TD>
					<TD colSpan="3">
						<asp:RadioButton id="RadioButton1" runat="server" CssClass="title3" Text="个人" GroupName="types" Checked="True"></asp:RadioButton>
						<asp:RadioButton id="RadioButton2" runat="server" CssClass="title3" Text="单位" GroupName="types"></asp:RadioButton></TD>
				</TR>
			</table>
		</td>
		<td vAlign="middle"><asp:imagebutton id="ImageButton1" runat="server" Width="42" Height="42" ImageUrl="/front/zhu/denglu.jpg"></asp:imagebutton></td>
	</tr>
</table>
<table class="title3" id="Table2" style="BORDER-COLLAPSE: collapse" borderColor="#cdcdcd"
	cellSpacing="3" cellPadding="0" width="100%" border="0" runat="server">
	<tr>
		<td align="center">姓名: <font color="red">
				<%=xm%>
			</font>
		</td>
	</tr>
	<tr>
		<td align="center"><A href="/admin/member/health_detail.aspx?sfzh=<%=memcode%>" target=_blank >查询测试数据</A></td>
	</tr>
	<tr>
		<td align="center"><A href="change_pwd.aspx" target="_blank">修改个人口令</A></td>
	</tr>
	<tr>
		<td align="center"><asp:linkbutton id="LinkButton1" runat="server">退出登录</asp:linkbutton></td>
	</tr>
</table>
<table class="title3" id="tb1" style="BORDER-COLLAPSE: collapse" borderColor="#cdcdcd"
	cellSpacing="0" cellPadding="0" width="100%" border="0" runat="server">
	<tr>
		<td height="6"></td>
	</tr>
	<tr>
		<td vAlign="top" colSpan="2"><asp:panel id="Panel1" runat="server"></asp:panel></SPAN></td>
	</tr>
</table>
<asp:label id="checkvalue" runat="server" Visible="False"></asp:label>
