<%@ Control Language="c#" AutoEventWireup="false" Codebehind="dgNavigation.ascx.cs" Inherits="jxc.ascx.dgNavigation" TargetSchema="http://schemas.microsoft.com/intellisense/ie5" %>
<LINK href="css/global.css" type="text/css" rel="stylesheet">
<asp:panel id="divPanel" ForeColor="Blue" CssClass="title3" HorizontalAlign="Right" Width="100%"
	runat="server" Visible="false">
<asp:Label id="LabelMsg" runat="server" CssClass="title3" ForeColor="Blue"></asp:Label>　 
<asp:Button id="btnNavFirst" runat="server" CssClass="title3" BorderStyle="Ridge" Text="首页"
		CommandName="FIRST" BorderWidth="1px" CausesValidation="False" BackColor="#E0E0E0" Font-Size="XX-Small"></asp:Button>
<asp:Button id="btnNavPrevious" runat="server" CssClass="title3" BorderStyle="Ridge" Text="上一页"
		CommandName="PREVIOUS" BorderWidth="1px" CausesValidation="False" BackColor="#E0E0E0"
		Font-Size="XX-Small"></asp:Button>
<asp:Button id="btnNavNext" runat="server" CssClass="title3" BorderStyle="Ridge" Text="下一页"
		CommandName="NEXT" BorderWidth="1px" CausesValidation="False" BackColor="#E0E0E0" Font-Size="XX-Small"></asp:Button>
<asp:Button id="btnNavLast" runat="server" CssClass="title3" BorderStyle="Ridge" Text="末页" CommandName="LAST"
		BorderWidth="1px" CausesValidation="False" BackColor="#E0E0E0" Font-Size="XX-Small"></asp:Button>&nbsp;&nbsp;&nbsp; 
<asp:Label id="Label1" runat="server" CssClass="title3" ForeColor="Blue">转到</asp:Label>
<asp:TextBox id="tbPage" runat="server" Width="20px" CssClass="title3" Height="14"></asp:TextBox>
<asp:Label id="LabelMsg2" runat="server" CssClass="title3" ForeColor="Blue">页</asp:Label>
<asp:Button id="btnNavGo" runat="server" CssClass="title3" BorderStyle="Ridge" Text="确定" CommandName="GO"
		BorderWidth="1px" CausesValidation="False" BackColor="#E0E0E0" Font-Size="XX-Small"></asp:Button></asp:panel>
