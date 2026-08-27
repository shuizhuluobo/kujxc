<%@ Page language="c#" Codebehind="qx_manage.aspx.cs" AutoEventWireup="false" Inherits="jxc.admin.qx_manage" %>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN" >
<HTML>
	<HEAD>
		<title>权限管理主页面</title>
		<meta content="Microsoft Visual Studio .NET 7.1" name="GENERATOR">
		<meta content="C#" name="CODE_LANGUAGE">
		<meta content="JavaScript" name="vs_defaultClientScript">
		<meta content="http://schemas.microsoft.com/intellisense/ie5" name="vs_targetSchema">
		<LINK href="../css/style.css" type="text/css" rel="stylesheet">
	</HEAD>
	<body MS_POSITIONING="GridLayout">
		<form id="Form1" method="post" runat="server">
			<FONT face="宋体"></FONT><FONT face="宋体"></FONT>
			<table cellpadding="0" cellspacing="0" border="0" width="100%" height="50" align="center">
				<tr>
					<td width="556" background="/image/title.gif">
						<table cellpadding="0" cellspacing="0" border="0" width="100%">
							<tr>
								<td height="1"></td>
							</tr>
							<tr>
								<td width="80"></td>
								<td><font face="隶书" size="5">操作权限管理</font></td>
							</tr>
						</table>
					</td>
					<td width="250"></td>
				</tr>
			</table>
			<br>
			<table cellSpacing="0" cellPadding="0" width="100%" border="0">
				<tr>
					<td align="center">
						选择管理员:<asp:DropDownList id="DropDownList1" runat="server" AutoPostBack="True"></asp:DropDownList>
						<asp:Button id="Button1" runat="server" CssClass="buttoncss" Text="保存权限"></asp:Button>
					</td>
				</tr>
				<tr>
					<td align="center">
						<asp:datagrid id="Datagrid1" runat="server" BorderWidth="0" ShowHeader="False" AllowPaging="True"
							DataKeyField="id" CssClass="title3" AutoGenerateColumns="False" Width="400" PageSize="40">
							<SelectedItemStyle BorderColor="#FFC0C0" BackColor="White"></SelectedItemStyle>
							<Columns>
								<asp:TemplateColumn HeaderText="选择">
									<HeaderStyle Width="40px"></HeaderStyle>
									<ItemTemplate>
										<asp:CheckBox id=selectcheck runat="server" AutoPostBack="false" Text='<%# DataBinder.Eval(Container, "DataItem.des") %>' ForeColor="red" Height="8px">
										</asp:CheckBox>
										<asp:Label id=Labelid runat="server" Text='<%# DataBinder.Eval(Container, "DataItem.id") %>' Visible="False">
										</asp:Label>
										<asp:Label id="qxcds" runat="server" Text='<%# DataBinder.Eval(Container, "DataItem.qxcd") %>' Visible=False>
										</asp:Label>
										<asp:Label id="imgpaths" runat="server" Text='<%# DataBinder.Eval(Container, "DataItem.imgpath") %>' Visible="False">
										</asp:Label>
										<asp:Label id="sortids" runat="server" Text='<%# DataBinder.Eval(Container, "DataItem.sortid") %>' Visible="False">
										</asp:Label>
										<asp:datagrid id="Datagrid2" runat="server" Width="100%" PageSize="40" AutoGenerateColumns="False"
											CssClass="title3" DataKeyField="id" AllowPaging="True" ShowHeader="False" BorderWidth="0">
											<SelectedItemStyle BorderColor="#FFC0C0" BackColor="White"></SelectedItemStyle>
											<Columns>
												<asp:TemplateColumn HeaderText="选择">
													<HeaderStyle Width="40px"></HeaderStyle>
													<ItemTemplate>
														<asp:CheckBox id="Checkbox1" runat="server" Height="8px" AutoPostBack="false" Text='<%# DataBinder.Eval(Container, "DataItem.des") %>'>
														</asp:CheckBox>
														<asp:Label id="Labelid2" runat="server" Text='<%# DataBinder.Eval(Container, "DataItem.id") %>' Visible=False>
														</asp:Label>
														<asp:Label id="qxcd" runat="server" Text='<%# DataBinder.Eval(Container, "DataItem.qxcd") %>' Visible=False>
														</asp:Label>
														<asp:Label id="imgpath" runat="server" Text='<%# DataBinder.Eval(Container, "DataItem.imgpath") %>' Visible=False>
														</asp:Label>
														<asp:Label id="sortid" runat="server" Text='<%# DataBinder.Eval(Container, "DataItem.sortid") %>' Visible="False">
														</asp:Label>
													</ItemTemplate>
												</asp:TemplateColumn>
											</Columns>
											<PagerStyle Visible="False"></PagerStyle>
										</asp:datagrid>
									</ItemTemplate>
								</asp:TemplateColumn>
							</Columns>
							<PagerStyle Visible="False"></PagerStyle>
						</asp:datagrid></td>
				</tr>
				<tr>
					<td align="center">
					</td>
				</tr>
			</table>
		</form>
	</body>
</HTML>
                                
                                 
