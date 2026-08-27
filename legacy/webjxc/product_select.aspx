<%@ Register TagPrefix="uc1" TagName="dgNavigation" Src="/ascx/dgNavigation.ascx" %>
<%@ Page language="c#" Codebehind="product_select.aspx.cs" AutoEventWireup="false" Inherits="jxc.product_select" %>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN" >
<HTML>
	<HEAD>
		<title>product_select</title>
		<meta name="GENERATOR" Content="Microsoft Visual Studio .NET 7.1">
		<meta name="CODE_LANGUAGE" Content="C#">
		<meta name="vs_defaultClientScript" content="JavaScript">
		<meta name="vs_targetSchema" content="http://schemas.microsoft.com/intellisense/ie5">
		<LINK href="/css/BasicLayout.css" type="text/css" rel="stylesheet">
	</HEAD>
	<body MS_POSITIONING="GridLayout">
		<form id="Form1" method="post" runat="server">
			<INPUT id="control" style="Z-INDEX: 101; LEFT: 8px; POSITION: absolute; TOP: 8px" type="hidden"
				name="control" runat="server"> <INPUT id="Hidden1" style="Z-INDEX: 102; LEFT: 8px; POSITION: absolute; TOP: 8px" type="hidden"
				name="control" runat="server">
			<table class="title3" cellSpacing="0" cellPadding="0" width="100%" border="0">
				<tr>
					<td style="WIDTH: 79px">产品名称</td>
					<td style="WIDTH: 125px">
						<asp:TextBox id="cpname" runat="server" CssClass="inputcss"></asp:TextBox></td>
					<td align="right">
						<asp:Button id="query" runat="server" CssClass="buttoncss" Height="24px" Width="72px" Text="查询"></asp:Button>
						</td>
				</tr>
			</table>
			<table cellpadding="0" cellspacing="0" border="0" width="100%" class="title3">
				<TR>
					<TD>
						<asp:datagrid id="Datagrid1" runat="server" PageSize="50" Width="100%" Height="80px" AutoGenerateColumns="False"
							CssClass="title3" DataKeyField="id" AllowPaging="True" BorderColor="#000066">
							<SelectedItemStyle BorderColor="#FFC0C0" BackColor="White"></SelectedItemStyle>
							<Columns>
								<asp:TemplateColumn HeaderText="选择">
									<HeaderStyle Width="40px"></HeaderStyle>
									<ItemTemplate>
										<asp:CheckBox id="selectcheck" runat="server" Height="8px" AutoPostBack="false"></asp:CheckBox>
									</ItemTemplate>
								</asp:TemplateColumn>
								<asp:BoundColumn DataField="cpid" HeaderText="编号"></asp:BoundColumn>
								<asp:BoundColumn DataField="产品名称" HeaderText="产品名称"></asp:BoundColumn>
								<asp:BoundColumn DataField="型号" HeaderText="型号"></asp:BoundColumn>
								<asp:BoundColumn DataField="色号" HeaderText="色号"></asp:BoundColumn>
								<asp:BoundColumn DataField="规格" HeaderText="规格"></asp:BoundColumn>
								<asp:BoundColumn DataField="型号" HeaderText="型号"></asp:BoundColumn>
								<asp:BoundColumn DataField="经办人" HeaderText="经办人"></asp:BoundColumn>
								<asp:ButtonColumn Text="选中"></asp:ButtonColumn>
							</Columns>
							<PagerStyle Visible="False"></PagerStyle>
						</asp:datagrid>
					</TD>
				</TR>
				<tr>
					<td align="left">
						<uc1:dgNavigation id="DgNavigation1" runat="server"></uc1:dgNavigation></td>
				</tr>
				<tr>
					<td align="center">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
					</td>
				</tr>
			</table>
		</form>
	</body>
</HTML>
                                
                                 
