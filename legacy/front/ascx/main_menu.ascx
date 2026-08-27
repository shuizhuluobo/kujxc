<%@ Control Language="c#" AutoEventWireup="false" Codebehind="main_menu.ascx.cs" Inherits="health.front.ascx.enter_menu" TargetSchema="http://schemas.microsoft.com/intellisense/ie5"%>
<asp:DataList id="Datalist1" RepeatColumns="1" runat="server" Width="100%">
	<ItemTemplate>
		<table cellpadding="0" cellspacing="0" border="0" width="100%" align="center">
			<tr>
				<td height="20" valign="middle" align="center">
					<A  href='two.aspx?id=<%# Request.QueryString["id"] %>&actid=<%# DataBinder.Eval(Container, "DataItem.id")%>&name=<%# DataBinder.Eval(Container, "DataItem.des") %>&des=<%# Request.QueryString["des"] %>'>
						<%# DataBinder.Eval(Container, "DataItem.des") %>
					</A>
				</td>
			</tr>
		</table>
	</ItemTemplate>
</asp:DataList>
