<%@ Control Language="c#" AutoEventWireup="false" Codebehind="dt_pj_aa.ascx.cs" Inherits="health.admin.member.dt_pj" TargetSchema="http://schemas.microsoft.com/intellisense/ie5"%>
<asp:Panel id="Panel1" runat="server">
成年A组评价表，年龄段：20～39岁 
<TABLE cellSpacing="0" cellPadding="0" width="100%" border="0">
		<TR>
			<TD>
				<asp:datagrid id="Datagrid1" runat="server" CssClass="title3" Width="100%" BorderColor="#000066"
					AllowPaging="True" DataKeyField="id" AutoGenerateColumns="False" Height="80px" PageSize="20">
					<SelectedItemStyle BorderColor="#FFC0C0" BackColor="White"></SelectedItemStyle>
					<Columns>
						<asp:BoundColumn DataField="SFZH" HeaderText="身份证号"></asp:BoundColumn>
						<asp:BoundColumn DataField="CLXT_TZ" HeaderText="体重"></asp:BoundColumn>
						<asp:BoundColumn DataField="TZTZ" HeaderText="体重特征"></asp:BoundColumn>
						<asp:BoundColumn DataField="CLJN_FHL" HeaderText="肺活量"></asp:BoundColumn>
						<asp:BoundColumn DataField="CLSZ_TJZS" HeaderText="台阶指数"></asp:BoundColumn>
						<asp:BoundColumn DataField="CLXT_TQQ" HeaderText="坐位体前屈"></asp:BoundColumn>
						<asp:BoundColumn DataField="CLSZ_DJZL" HeaderText="闭眼单脚站立"></asp:BoundColumn>
						<asp:BoundColumn DataField="CLSZ_XZFYS1" HeaderText="选择反应时"></asp:BoundColumn>
						<asp:BoundColumn DataField="CLSZ_WL" HeaderText="握力"></asp:BoundColumn>
						<asp:BoundColumn DataField="CLSZ_ZT" HeaderText="纵跳"></asp:BoundColumn>
						<asp:BoundColumn DataField="CLSZ_YWQZ" HeaderText="仰卧起坐/俯卧撑"></asp:BoundColumn>
						<asp:BoundColumn DataField="ZF" HeaderText="评价总分"></asp:BoundColumn>
						<asp:BoundColumn DataField="DJ" HeaderText="评价等级"></asp:BoundColumn>
					</Columns>
					<PagerStyle Visible="False"></PagerStyle>
				</asp:datagrid></TD>
		</TR>
	</TABLE>
</asp:Panel>
