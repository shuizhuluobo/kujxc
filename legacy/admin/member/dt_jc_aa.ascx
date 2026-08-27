<%@ Control Language="c#" AutoEventWireup="false" Codebehind="dt_jc_aa.ascx.cs" Inherits="health.admin.member.dt_jc_aa" TargetSchema="http://schemas.microsoft.com/intellisense/ie5"%>
<asp:Panel id="Panel1" runat="server">
	成年A组检查表，年龄段：20～39岁 身份证号：<%=sfzh%>
<asp:datagrid id="Datagrid1" runat="server" PageSize="20" Height="80px" AutoGenerateColumns="False"
		AllowPaging="True" BorderColor="#000066" Width="100%" CssClass="title3">
		<SelectedItemStyle BorderColor="#FFC0C0" BackColor="White"></SelectedItemStyle>
		<Columns>
			<asp:BoundColumn DataField="des" HeaderText="项目">
				<ItemStyle HorizontalAlign="Center"></ItemStyle>
			</asp:BoundColumn>
			<asp:BoundColumn DataField="CLXT_SG" HeaderText="身高">
				<ItemStyle HorizontalAlign="Center"></ItemStyle>
			</asp:BoundColumn>
			<asp:BoundColumn DataField="CLXT_TZ" HeaderText="体重">
				<ItemStyle HorizontalAlign="Center"></ItemStyle>
			</asp:BoundColumn>
			<asp:BoundColumn DataField="CLJN_FHL" HeaderText="肺活量">
				<ItemStyle HorizontalAlign="Center"></ItemStyle>
			</asp:BoundColumn>
			<asp:BoundColumn DataField="CLSZ_TJZS" HeaderText="台阶指数">
				<ItemStyle HorizontalAlign="Center"></ItemStyle>
			</asp:BoundColumn>
			<asp:BoundColumn DataField="CLXT_TQQ" HeaderText="坐位体前屈">
				<ItemStyle HorizontalAlign="Center"></ItemStyle>
			</asp:BoundColumn>
			<asp:BoundColumn DataField="CLSZ_DJZL" HeaderText="闭眼单脚站立">
				<ItemStyle HorizontalAlign="Center"></ItemStyle>
			</asp:BoundColumn>
			<asp:BoundColumn DataField="CLSZ_XZFYS1" HeaderText="选择反应时">
				<ItemStyle HorizontalAlign="Center"></ItemStyle>
			</asp:BoundColumn>
			<asp:BoundColumn DataField="CLSZ_WL" HeaderText="握力">
				<ItemStyle HorizontalAlign="Center"></ItemStyle>
			</asp:BoundColumn>
			<asp:BoundColumn DataField="CLSZ_ZT" HeaderText="纵跳">
				<ItemStyle HorizontalAlign="Center"></ItemStyle>
			</asp:BoundColumn>
			<asp:BoundColumn DataField="CLSZ_YWQZ" HeaderText="仰卧起坐/俯卧撑">
				<ItemStyle HorizontalAlign="Center"></ItemStyle>
			</asp:BoundColumn>
			<asp:BoundColumn DataField="ZF" HeaderText="评价总分">
				<ItemStyle HorizontalAlign="Center"></ItemStyle>
			</asp:BoundColumn>
			<asp:BoundColumn DataField="DJ" HeaderText="评价等级">
				<ItemStyle HorizontalAlign="Center"></ItemStyle>
			</asp:BoundColumn>
		</Columns>
		<PagerStyle Visible="False"></PagerStyle>
	</asp:datagrid></asp:Panel>
