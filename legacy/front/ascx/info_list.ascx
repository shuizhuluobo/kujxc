<%@ Register TagPrefix="uc1" TagName="dgNavigation" Src="../../ascx/dgNavigation.ascx" %>
<%@ Control Language="c#" AutoEventWireup="false" Codebehind="info_list.ascx.cs" Inherits="health.front.ascx.info_list" TargetSchema="http://schemas.microsoft.com/intellisense/ie5"%>
<asp:datagrid id="dgfiList" runat="server" cellpadding="2" CellSpacing="0" Width="100%" BorderWidth="0px"
	AllowPaging="True" AutoGenerateColumns="False" HorizontalAlign="Center" ShowHeader="False"
	PageSize="15">
	<Columns>
		<asp:TemplateColumn HeaderText="">
			<HeaderStyle HorizontalAlign="Center"></HeaderStyle>
			<ItemStyle VerticalAlign="Top"></ItemStyle>
			<HeaderTemplate>
			</HeaderTemplate>
			<ItemTemplate>
				<table cellpadding="0" cellspacing="0" border="0" width="100%" align="center">
					<tr>
						<td height="20" valign="middle" align="center">
							<A  href='details.aspx?id=<%# DataBinder.Eval(Container, "DataItem.bh")%>&pid=<%# DataBinder.Eval(Container, "DataItem.lbbh")%>&des=<%# DataBinder.Eval(Container, "DataItem.dess")%>&name=<%# DataBinder.Eval(Container, "DataItem.names")%>' target=_blank>
								<asp:label id="CRed" runat="server">
									<%# DataBinder.Eval(Container, "DataItem.bt") %>
								</asp:label></A>
						</td>
					</tr>
				</table>
			</ItemTemplate>
			<FooterStyle HorizontalAlign="Right"></FooterStyle>
			<EditItemTemplate>
			</EditItemTemplate>
		</asp:TemplateColumn>
	</Columns>
	<PagerStyle Visible="False"></PagerStyle>
</asp:datagrid>
<uc1:dgNavigation id="DgNavigation1" runat="server"></uc1:dgNavigation>
