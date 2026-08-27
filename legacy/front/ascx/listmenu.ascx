<%@ Control Language="c#" AutoEventWireup="false" Codebehind="listmenu.ascx.cs" Inherits="health.front.ascx.listmenu" TargetSchema="http://schemas.microsoft.com/intellisense/ie5"%>
<asp:DataList id="Datalist1" RepeatColumns="1" runat="server" Width="100%">
	<ItemTemplate>
		<table cellpadding="0" cellspacing="0" border="0" width="100%" align="left">
			<tr>
				<td height="20" valign="middle" align="left">
					<A  href='details.aspx?id=<%# DataBinder.Eval(Container, "DataItem.bh")%>&pid=<%# DataBinder.Eval(Container, "DataItem.lbbh")%>&des=<%=des%>&name=<%=name%>'>
						<asp:label id="CRed" runat="server">
							<%# DataBinder.Eval(Container, "DataItem.bt") %>
						</asp:label></A>
				</td>
			</tr>
		</table>
	</ItemTemplate>
</asp:DataList>
