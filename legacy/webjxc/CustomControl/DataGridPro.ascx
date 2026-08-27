<%@ Control Language="c#" AutoEventWireup="false" Codebehind="DataGridPro.ascx.cs" Inherits="jxc.CustomControl.DataGridPro" TargetSchema="http://schemas.microsoft.com/intellisense/ie5" %>
<FONT face="ËÎÌו">
	<div runat="server" id="dvDataGrid">
		<DIV id="theDiv" style="BORDER-RIGHT: white 1px inset; BORDER-TOP: white 1px inset; LEFT: 0px; VISIBILITY: hidden; OVERFLOW: auto; BORDER-LEFT: white 1px inset; BORDER-BOTTOM: white 1px inset; POSITION: absolute; TOP: 0px"
			ms_positioning="GridLayout" runat="server">
			<asp:datagrid id="theDataGrid" runat="server" Font-Size="9pt" AutoGenerateColumns="False">
				<SelectedItemStyle BackColor="Info"></SelectedItemStyle>
			</asp:datagrid>
		</DIV>
	</div>
</FONT>
