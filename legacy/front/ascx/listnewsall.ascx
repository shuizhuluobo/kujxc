<%@ Register TagPrefix="uc1" TagName="dgNavigation" Src="/ascx/dgNavigation.ascx" %>
<%@ Control Language="c#" AutoEventWireup="false" Codebehind="listnewsall.ascx.cs" Inherits="health.front.ascx.listnewsall" TargetSchema="http://schemas.microsoft.com/intellisense/ie5" %>
<table cellpadding="0" cellspacing="0" border="0" width="100%">
	<tr>
		<td>
			<asp:datagrid id="dgfiList" runat="server" cellpadding="4" CellSpacing="1" Width="100%" BorderWidth="0px"
				AllowPaging="True" AutoGenerateColumns="False" HorizontalAlign="Center" ShowHeader="False"
				PageSize="15">
				<Columns>
					<asp:TemplateColumn HeaderText="卫生动态">
						<HeaderStyle HorizontalAlign="Center"></HeaderStyle>
						<ItemStyle VerticalAlign="Top"></ItemStyle>
						<HeaderTemplate>
							<FONT face="宋体"></FONT>
						</HeaderTemplate>
						<ItemTemplate>
							<asp:label id=IsRed runat="server" Visible="False" Text='<%# DataBinder.Eval(Container, "DataItem.IsRed") %>'>
							</asp:label><IMG alt="" src="/image/dian.gif"><A title='更新日期：<%# DataBinder.Eval(Container, "DataItem.fbsj") %>'  href=newsnr.aspx?newsid='<%# DataBinder.Eval(Container, "DataItem.bh")%>'>
								<asp:label id="CRed" runat="server">
									<%# DataBinder.Eval(Container, "DataItem.bt") %>
								</asp:label></A>(<%# DataBinder.Eval(Container,"DataItem.fbsj").ToString()%>)
						</ItemTemplate>
						<FooterStyle HorizontalAlign="Right"></FooterStyle>
						<EditItemTemplate>
							<FONT face="宋体"></FONT>
						</EditItemTemplate>
					</asp:TemplateColumn>
				</Columns>
				<PagerStyle Visible="False"></PagerStyle>
			</asp:datagrid>
		</td>
	</tr>
	<tr>
		<td>
			<uc1:dgNavigation id="DgNavigation1" runat="server"></uc1:dgNavigation>
		</td>
	</tr>
</table>
