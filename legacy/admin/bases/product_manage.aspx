<%@ Register TagPrefix="uc1" TagName="dgNavigation" Src="../../ascx/dgNavigation.ascx" %>
<%@ Page language="c#" Codebehind="product_manage.aspx.cs" AutoEventWireup="false" Inherits="jxc.admin.bases.product_manage" %>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN" >
<HTML>
	<HEAD>
		<title>产品基础信息</title>
		<meta content="Microsoft Visual Studio .NET 7.1" name="GENERATOR">
		<meta content="C#" name="CODE_LANGUAGE">
		<meta content="JavaScript" name="vs_defaultClientScript">
		<meta content="http://schemas.microsoft.com/intellisense/ie5" name="vs_targetSchema">
		<LINK href="/css/BasicLayout.css" type="text/css" rel="stylesheet">
	</HEAD>
	<body MS_POSITIONING="GridLayout">
		<form id="Form1" method="post" runat="server">
			<table height="50" cellSpacing="0" cellPadding="0" width="100%" align="center" border="0">
				<tr>
					<td width="556" background="/image/title.gif">
						<table cellSpacing="0" cellPadding="0" width="100%" border="0">
							<tr>
								<td height="1"></td>
							</tr>
							<tr>
								<td width="80"></td>
								<td><font face="隶书" size="5">产品基础信息</font></td>
							</tr>
						</table>
					</td>
					<td width="250"></td>
				</tr>
			</table>
			<table class="title3" cellSpacing="0" cellPadding="0" width="100%" border="0">
				<tr>
					<td style="WIDTH: 223px">产品名称
						<asp:textbox id="cpname" runat="server" CssClass="inputcss" Width="84px"></asp:textbox>
						<asp:DropDownList id="DropDownList1" runat="server">
							<asp:ListItem Value="未删除">未删除</asp:ListItem>
							<asp:ListItem Value="已删除">已删除</asp:ListItem>
						</asp:DropDownList></td>
					<td style="WIDTH: 272px"><FONT face="宋体">
							<asp:checkbox id="CheckBox1" runat="server" Text="按类别" Checked="True"></asp:checkbox>
							<asp:textbox id="Textbox1" runat="server" Width="84px" CssClass="inputcss"></asp:textbox>
							<asp:dropdownlist id="Dropdownlist3" runat="server" AutoPostBack="True"></asp:dropdownlist></FONT></td>
					<TD align="right">
						<asp:button id="query" runat="server" CssClass="buttoncss" Height="24px" Width="56px" Text="查询"></asp:button>&nbsp;
						<asp:button id="add" runat="server" CssClass="buttoncss" Height="24px" Width="48px" Text="增加"></asp:button>
						<asp:button id="delete" runat="server" CssClass="buttoncss" Height="24px" Width="48px" Text="删除"
							Enabled="False"></asp:button>
						<asp:button id="change" runat="server" CssClass="buttoncss" Text="修改" Width="56px" Height="24"></asp:button>
						<asp:button id="Button1" runat="server" Width="72px" CssClass="buttoncss" Text="数据删除" Height="24px"
							Enabled="False"></asp:button></TD>
				</tr>
			</table>
			<table class="title3" cellSpacing="0" cellPadding="0" width="100%" border="0">
				<TR>
					<TD><asp:datagrid id="Datagrid1" runat="server" CssClass="title3" Width="100%" Height="80px" BorderColor="#000066"
							AllowPaging="True" DataKeyField="cpid" AutoGenerateColumns="False" PageSize="50" CellPadding="0">
							<SelectedItemStyle BorderColor="#FFC0C0" BackColor="White"></SelectedItemStyle>
							<ItemStyle HorizontalAlign="Center" Height="30px"></ItemStyle>
							<HeaderStyle HorizontalAlign="Center"></HeaderStyle>
							<Columns>
								<asp:TemplateColumn HeaderText="选择">
									<HeaderStyle Width="40px"></HeaderStyle>
									<ItemTemplate>
										<asp:CheckBox id="selectcheck" runat="server" Height="8px" AutoPostBack="false"></asp:CheckBox>
									</ItemTemplate>
								</asp:TemplateColumn>
								<asp:BoundColumn DataField="cpid" HeaderText="产品编码"></asp:BoundColumn>
								<asp:BoundColumn DataField="类别" HeaderText="主类别"></asp:BoundColumn>
								<asp:BoundColumn DataField="型号" HeaderText="二级类别"></asp:BoundColumn>
								<asp:BoundColumn DataField="产品名称" HeaderText="产品名称"></asp:BoundColumn>
								<asp:BoundColumn DataField="价格" HeaderText="价格" DataFormatString="{0:F2}">
									<ItemStyle HorizontalAlign="Right"></ItemStyle>
								</asp:BoundColumn>
								<asp:BoundColumn DataField="经办人" HeaderText="经办人"></asp:BoundColumn>
								<asp:BoundColumn DataField="是否下柜" HeaderText="是否下柜"></asp:BoundColumn>
								<asp:BoundColumn DataField="条码" HeaderText="条码"></asp:BoundColumn>
								<asp:BoundColumn DataField="修改日期" HeaderText="修改日期"></asp:BoundColumn>
							</Columns>
							<PagerStyle Visible="False"></PagerStyle>
						</asp:datagrid></TD>
				</TR>
				<tr>
					<td align="left"><uc1:dgnavigation id="DgNavigation1" runat="server"></uc1:dgnavigation></td>
				</tr>
				<tr>
					<td align="center">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
					</td>
				</tr>
			</table>
		</form>
	</body>
</HTML>
