<%@ Page language="c#" Codebehind="sprhelp.aspx.cs" AutoEventWireup="false" Inherits="jxc.admin.sprhelp" %>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN" >
<HTML>
	<HEAD>
		<title>sprhelp</title>
		<meta name="GENERATOR" Content="Microsoft Visual Studio .NET 7.1">
		<meta name="CODE_LANGUAGE" Content="C#">
		<meta name="vs_defaultClientScript" content="JavaScript">
		<meta name="vs_targetSchema" content="http://schemas.microsoft.com/intellisense/ie5">
		<LINK href="/css/BasicLayout.css" type="text/css" rel="stylesheet">
	</HEAD>
	<body MS_POSITIONING="GridLayout">
		<form id="Form1" method="post" runat="server">
			<INPUT id="control" style="Z-INDEX: 101; LEFT: 16px; POSITION: absolute; TOP: 384px" type="hidden"
				name="control" runat="server"><INPUT id="Hidden1" style="Z-INDEX: 102; LEFT: 184px; POSITION: absolute; TOP: 384px" type="hidden"
				name="control" runat="server">
			<table cellSpacing="0" cellPadding="0" width="100%" border="0">
				<tr>
					<td>
						<asp:DataGrid id="DataGrid1" runat="server" AutoGenerateColumns="False" Width="100%" CssClass="title3"
							DataKeyField="glydh" AllowPaging="True">
							<Columns>
								<asp:TemplateColumn HeaderText="选择" Visible="False">
									<HeaderStyle Width="40px"></HeaderStyle>
									<ItemTemplate>
										<asp:CheckBox id="selectcheck" runat="server" Height="8px" AutoPostBack="false"></asp:CheckBox>
									</ItemTemplate>
								</asp:TemplateColumn>
								<asp:BoundColumn DataField="glydh" HeaderText="管理员代号"></asp:BoundColumn>
								<asp:BoundColumn DataField="glyname" HeaderText="管理员姓名"></asp:BoundColumn>
								<asp:BoundColumn DataField="ssjg" HeaderText="所属机构"></asp:BoundColumn>
								<asp:BoundColumn DataField="zw" HeaderText="职务"></asp:BoundColumn>
								<asp:ButtonColumn Text="选中" HeaderText="选择" CommandName="commond"></asp:ButtonColumn>
							</Columns>
							<PagerStyle Visible="False"></PagerStyle>
						</asp:DataGrid></td>
				</tr>
			</table>
		</form>
	</body>
</HTML>
                                
                                 
