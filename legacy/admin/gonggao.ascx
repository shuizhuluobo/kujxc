<%@ Control Language="c#" AutoEventWireup="false" Codebehind="gonggao.ascx.cs" Inherits="jxc.admin.gonggao" TargetSchema="http://schemas.microsoft.com/intellisense/ie5"%>
<asp:datagrid id="dgfiList" runat="server" cellpadding="2" CellSpacing="0" Width="100%" BorderWidth="0px"
	AllowPaging="True" AutoGenerateColumns="False" HorizontalAlign="Center" ShowHeader="False" CssClass=title3>
	<Columns>
		<asp:TemplateColumn HeaderText="&lt;a href=news/Default.aspx target=_blank&gt;公司最新消息&lt;/a&gt;">
			<HeaderStyle HorizontalAlign="Center"></HeaderStyle>
			<ItemStyle VerticalAlign="Top"></ItemStyle>
			<ItemTemplate>
				<a href='details.aspx?id=<%# DataBinder.Eval(Container, "DataItem.bh")%>' target=_self>
					<%# DataBinder.Eval(Container, "DataItem.bt") %>
				</A>
				&nbsp;&nbsp;<%# DataBinder.Eval(Container, "DataItem.zz") %>&nbsp;&nbsp;<%# DataBinder.Eval(Container, "DataItem.fbsj") %>
			</ItemTemplate>
			<FooterStyle HorizontalAlign="Right"></FooterStyle>
		</asp:TemplateColumn>
	</Columns>
	<PagerStyle Visible="False"></PagerStyle>
</asp:datagrid>