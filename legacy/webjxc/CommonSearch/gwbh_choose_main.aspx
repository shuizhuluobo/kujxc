<%@ Page language="c#" Codebehind="gwbh_choose_main.aspx.cs" AutoEventWireup="false" Inherits="llnsoft.BaseInfo.CommonSearch.gwbh_choose_main" %>
<%@ Register TagPrefix="uc1" TagName="DataGridPro" Src="../../CustomControl/DataGridPro.ascx" %>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN" >
<HTML>
	<HEAD>
		<title>gwbh_choose_main</title>
		<meta name="GENERATOR" Content="Microsoft Visual Studio 7.0">
		<meta name="CODE_LANGUAGE" Content="C#">
		<meta name="vs_defaultClientScript" content="JavaScript">
		<meta name="vs_targetSchema" content="http://schemas.microsoft.com/intellisense/ie5">
	</HEAD>
	<body MS_POSITIONING="GridLayout" bgColor="menu">
		<form id="gwbh_choose_main" method="post" runat="server">
			<FONT face="宋体">
				<asp:datagrid id="Datagrid1" style="Z-INDEX: 101; LEFT: 8px; POSITION: absolute; TOP: 8px" runat="server"
					PageSize="50" AutoGenerateColumns="False" DataKeyField="rkid" AllowPaging="True" BorderColor="#000066"
					Width="100%" Height="0px" CssClass="title3">
					<SelectedItemStyle BorderColor="#FFC0C0" BackColor="White"></SelectedItemStyle>
					<HeaderStyle Font-Names="宋体" ForeColor="Purple"></HeaderStyle>
					<Columns>
						<asp:TemplateColumn HeaderText="选择">
							<HeaderStyle Width="40px"></HeaderStyle>
							<ItemTemplate>
								<asp:CheckBox id="selectcheck" runat="server" Height="8px" AutoPostBack="false"></asp:CheckBox>
							</ItemTemplate>
						</asp:TemplateColumn>
						<asp:BoundColumn DataField="rkid" HeaderText="编号"></asp:BoundColumn>
						<asp:BoundColumn DataField="产品名称" HeaderText="产品名称"></asp:BoundColumn>
						<asp:BoundColumn DataField="入库日期" HeaderText="入库日期"></asp:BoundColumn>
						<asp:BoundColumn DataField="仓库名称" HeaderText="仓库名称"></asp:BoundColumn>
						<asp:BoundColumn DataField="操作员" HeaderText="操作员"></asp:BoundColumn>
						<asp:BoundColumn DataField="入库数量" HeaderText="入库数量"></asp:BoundColumn>
						<asp:BoundColumn DataField="剩余数量" HeaderText="剩余数量"></asp:BoundColumn>
						<asp:BoundColumn DataField="到货确认" HeaderText="到货确认"></asp:BoundColumn>
						<asp:BoundColumn DataField="库保确认" HeaderText="库保确认"></asp:BoundColumn>
					</Columns>
					<PagerStyle Visible="False"></PagerStyle>
				</asp:datagrid></FONT>
		</form>
	</body>
</HTML>
