<%@ Control Language="c#" AutoEventWireup="false" Codebehind="commlogon2.ascx.cs" Inherits="jxc.ascx.commlogon2" TargetSchema="http://schemas.microsoft.com/intellisense/ie5" %>
<asp:panel id="divPanel" Visible="true" runat="server" HorizontalAlign="center" CssClass="title3"
	ForeColor="Blue">
	<TABLE class="title3" id="Table1" cellSpacing="0" cellPadding="0" border="0">
		<TR>
			<TD><FONT color="white">用户
					<asp:DropDownList id="DropDownList1" runat="server" Visible="False" Height="30"></asp:DropDownList>名:</FONT>&nbsp;</TD>
			<TD>
				<asp:TextBox id="name" runat="server" Height="20px" BorderStyle="Groove" Width="142px"></asp:TextBox></TD>
			<TD></TD>
		</TR>
		<TR>
			<TD><FONT color="white">密 &nbsp;码:</FONT>&nbsp;
			</TD>
			<TD>
				<asp:TextBox id="password" runat="server" Height="20" BorderStyle="Groove" Width="142px" TextMode="Password"></asp:TextBox><FONT face="宋体">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
				</FONT>
			</TD>
			<TD>
				<asp:ImageButton id="logonin" runat="server" Height="20px" Width="69px" ImageUrl="/image/btn_login.gif"></asp:ImageButton></TD>
		</TR>
	</TABLE>
</asp:panel>
