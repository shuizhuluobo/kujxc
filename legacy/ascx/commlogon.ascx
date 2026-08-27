<%@ Control Language="c#" AutoEventWireup="false" Codebehind="commlogon.ascx.cs" Inherits="jxc.ascx.commlogon" TargetSchema="http://schemas.microsoft.com/intellisense/ie5" %>
<asp:panel id="divPanel" Visible="true" runat="server" HorizontalAlign="Right" CssClass="title3"
	ForeColor="Blue">
	<TABLE class="title3" id="Table1" height="49" cellSpacing="0" cellPadding="0" border="0">
		<TR>
			<TD><FONT color="#ffcc66">用户名</FONT>&nbsp;</TD>
			<TD><IMG src="/image/login_user.gif">&nbsp;</TD>
			<TD>
				<asp:TextBox id="name" runat="server" BorderStyle="Groove" Width="88px"></asp:TextBox></TD>
			<TD>&nbsp;<FONT color="#ffcc66">密码</FONT>&nbsp;
			</TD>
			<TD><IMG src="/image/login_pass.gif">&nbsp;</TD>
			<TD>
				<asp:TextBox id="password" runat="server" BorderStyle="Groove" Width="88px" TextMode="Password"></asp:TextBox></TD>
			<TD>&nbsp;帐套名&nbsp;</TD>
			<TD><IMG src="/image/login_user.gif">&nbsp;</TD>
			<TD>
				<asp:DropDownList id="DropDownList1" runat="server"></asp:DropDownList></TD>
			<TD>
				<asp:ImageButton id="logonin" runat="server" Width="69px" ImageUrl="/image/btn_login.gif" Height="24px"></asp:ImageButton></FONT></TD>
		</TR>
	</TABLE>
</asp:panel>
