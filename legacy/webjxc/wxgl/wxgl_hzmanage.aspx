<%@ Page language="c#" Codebehind="wxgl_hzmanage.aspx.cs" AutoEventWireup="false" Inherits="jxc.admin.bases.wxgl_hzmanage" %>
<%@ Register TagPrefix="uc1" TagName="dgNavigation" Src="../../ascx/dgNavigation.ascx" %>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN" >
<HTML>
	<HEAD>
		<title>维修记录汇总</title>
		<meta name="GENERATOR" content="Microsoft Visual Studio .NET 7.1">
		<meta name="CODE_LANGUAGE" content="C#">
		<meta name="vs_defaultClientScript" content="JavaScript">
		<meta name="vs_targetSchema" content="http://schemas.microsoft.com/intellisense/ie5">
		<LINK rel="stylesheet" type="text/css" href="/css/BasicLayout.css">
	</HEAD>
	<body MS_POSITIONING="GridLayout">
		<form id="Form1" method="post" runat="server">
			<table height="50" cellSpacing="0" cellPadding="0" width="100%" align="center" border="0">
				<tr>
					<td background="/image/title.gif" width="556">
						<table cellSpacing="0" cellPadding="0" width="100%" border="0">
							<tr>
								<td height="1"></td>
							</tr>
							<tr>
								<td width="80"></td>
								<td><font size="5" face="隶书">维修记录查询</font></td>
							</tr>
						</table>
					</td>
					<td width="250"><FONT face="宋体"></FONT></td>
				</tr>
			</table>
			<table class="title3" cellSpacing="0" cellPadding="0" width="100%" border="0">
				<TR>
					<TD style="HEIGHT: 25px; WIDTH: 97px"><FONT style="Z-INDEX: 0" face="宋体">记录状态</FONT></TD>
					<TD style="HEIGHT: 25px; WIDTH: 139px"><FONT face="宋体"><asp:dropdownlist id="DropDownList2" style="Z-INDEX: 0" runat="server" Width="96px" Height="21px">
								<asp:ListItem Value="所有记录" Selected="True">所有记录</asp:ListItem>
								<asp:ListItem Value="未接收">未接收</asp:ListItem>
								<asp:ListItem Value="已接收">已接收</asp:ListItem>
								<asp:ListItem Value="已完成">已完成</asp:ListItem>
							</asp:dropdownlist></FONT></TD>
					<TD style="HEIGHT: 25px" align="left"><FONT face="宋体"><asp:checkbox id="Checkbox3" runat="server" Text="按难易程度"></asp:checkbox>
							<asp:dropdownlist id="Dropdownlist3" style="Z-INDEX: 0" runat="server" Width="96px" Height="21px">
								<asp:ListItem Value="简易">简易</asp:ListItem>
								<asp:ListItem Value="一般">一般</asp:ListItem>
								<asp:ListItem Value="复杂">复杂</asp:ListItem>
							</asp:dropdownlist>
							<asp:checkbox id="Checkbox4" runat="server" Text="未转销售" Visible="False"></asp:checkbox><asp:checkbox id="Checkbox2" style="Z-INDEX: 0" runat="server" Text="按用户单位"></asp:checkbox><asp:textbox id="txtdw" style="Z-INDEX: 0" runat="server" CssClass="inputcss"></asp:textbox></FONT></TD>
				</TR>
				<TR>
					<TD style="HEIGHT: 14px; WIDTH: 97px"><FONT style="Z-INDEX: 0" face="宋体">记录分组</FONT></TD>
					<TD style="HEIGHT: 14px; WIDTH: 139px"><asp:dropdownlist id="DropDownList1" runat="server" Width="96px" Height="21px">
							<asp:ListItem Value="中心">中心</asp:ListItem>
							<asp:ListItem Value="西线">西线</asp:ListItem>
							<asp:ListItem Value="南线">南线</asp:ListItem>
							<asp:ListItem Value="所有记录" Selected="True">所有记录</asp:ListItem>
						</asp:dropdownlist></TD>
					<TD style="HEIGHT: 14px" align="left"><FONT face="宋体"><asp:checkbox id="CheckBox1" runat="server" Text="按完结日期" Checked="True"></asp:checkbox><asp:textbox id="Textbox1" runat="server" CssClass="inputcss" Width="104px"></asp:textbox>到
							<asp:textbox id="Textbox2" runat="server" CssClass="inputcss" Width="104px"></asp:textbox></FONT></TD>
				</TR>
				<TR>
					<TD style="WIDTH: 97px">完结人</TD>
					<TD style="WIDTH: 139px"><asp:textbox id="cpname" runat="server" CssClass="inputcss"></asp:textbox></TD>
					<TD align="left"><asp:button id="query" runat="server" Text="查询" CssClass="buttoncss" Width="72px" Height="24px"></asp:button>&nbsp;
						<asp:button id="add" runat="server" Text="登记维修记录" CssClass="buttoncss" Width="88px" Height="24px"></asp:button>&nbsp;
						<asp:button id="change" runat="server" Text="到货确认" CssClass="buttoncss" Visible="False" Width="64px"
							Height="24"></asp:button>&nbsp;
						<asp:button id="Button1" runat="server" Text="付款确认" CssClass="buttoncss" Visible="False" Width="52px"
							Height="24"></asp:button>&nbsp;
						<asp:button id="Button2" runat="server" Text="导出excel" CssClass="buttoncss" Width="72px" Height="24"></asp:button>&nbsp;
						<asp:button id="delete" runat="server" Text="删除" CssClass="buttoncss" Visible="False" Width="56px"
							Height="24px" Enabled="False"></asp:button>&nbsp;</TD>
				</TR>
			</table>
			<TABLE class="title3" cellSpacing="0" cellPadding="0" width="100%" border="0" runat="server">
				<TR>
					<TD><asp:datagrid id="Datagrid1" runat="server" CssClass="title3" Width="90%" Height="0px" BorderColor="#000066"
							DataKeyField="wxid" AutoGenerateColumns="False" PageSize="50">
							<SelectedItemStyle BorderColor="#FFC0C0" BackColor="White"></SelectedItemStyle>
							<ItemStyle HorizontalAlign="Center"></ItemStyle>
							<HeaderStyle Font-Names="宋体" HorizontalAlign="Center" ForeColor="Purple"></HeaderStyle>
							<Columns>
								<asp:TemplateColumn Visible="False" HeaderText="选择">
									<HeaderStyle Width="40px"></HeaderStyle>
									<ItemTemplate>
										<asp:CheckBox id="selectcheck" runat="server" Height="8px" AutoPostBack="false"></asp:CheckBox>
									</ItemTemplate>
								</asp:TemplateColumn>
								<asp:TemplateColumn HeaderText="难易程度">
									<EditItemTemplate>
										<asp:DropDownList ID="dropId" Runat="server" AutoPostBack="True">
											<asp:ListItem Value="简易">简易</asp:ListItem>
											<asp:ListItem Value="一般">一般</asp:ListItem>
											<asp:ListItem Value="复杂">复杂</asp:ListItem>
										</asp:DropDownList>
									</EditItemTemplate>
								</asp:TemplateColumn>
								<asp:BoundColumn DataField="参与人员" ReadOnly="True" HeaderText="参与人员"></asp:BoundColumn>
								<asp:BoundColumn Visible="False" DataField="wxid" HeaderText="编号"></asp:BoundColumn>
								<asp:TemplateColumn HeaderText=" 记录分组">
									<ItemTemplate>
										<asp:Label runat="server" Text='<%# DataBinder.Eval(Container, "DataItem.记录分组") %>'>
										</asp:Label>
									</ItemTemplate>
									<EditItemTemplate>
										<asp:DropDownList ID="jlfz" Runat="server" AutoPostBack="True">
											<asp:ListItem Value="中心">中心</asp:ListItem>
											<asp:ListItem Value="西线">西线</asp:ListItem>
											<asp:ListItem Value="南线">南线</asp:ListItem>
										</asp:DropDownList>
									</EditItemTemplate>
								</asp:TemplateColumn>
								<asp:BoundColumn DataField="用户单位" ReadOnly="True" HeaderText="用户单位"></asp:BoundColumn>
								<asp:BoundColumn DataField="联系人" ReadOnly="True" HeaderText="联系人">
									<HeaderStyle Wrap="False"></HeaderStyle>
								</asp:BoundColumn>
								<asp:BoundColumn DataField="联系电话" HeaderText="联系电话"></asp:BoundColumn>
								<asp:BoundColumn DataField="故障信息" HeaderText="故障信息">
									<ItemStyle HorizontalAlign="Left"></ItemStyle>
								</asp:BoundColumn>
								<asp:BoundColumn DataField="备注" ReadOnly="True" HeaderText="地址及备注">
									<ItemStyle HorizontalAlign="Left"></ItemStyle>
								</asp:BoundColumn>
								<asp:BoundColumn DataField="接收人" ReadOnly="True" HeaderText="接收人"></asp:BoundColumn>
								<asp:BoundColumn Visible="False" DataField="解决问题" ReadOnly="True" HeaderText="解决问题"></asp:BoundColumn>
								<asp:BoundColumn DataField="登记日期" ReadOnly="True" HeaderText="登记日期" DataFormatString="{0:d}"></asp:BoundColumn>
								<asp:BoundColumn DataField="接货时间" ReadOnly="True" HeaderText="接收时间"></asp:BoundColumn>
								<asp:BoundColumn Visible="False" DataField="维修类别" ReadOnly="True" HeaderText="维修类别"></asp:BoundColumn>
								<asp:BoundColumn Visible="False" DataField="登记人" ReadOnly="True" HeaderText="登记人"></asp:BoundColumn>
								<asp:BoundColumn DataField="完结人" ReadOnly="True" HeaderText="完结人"></asp:BoundColumn>
								<asp:BoundColumn Visible="False" HeaderText="分值" DataFormatString="{0:F2}"></asp:BoundColumn>
								<asp:BoundColumn DataField="完结日期" ReadOnly="True" HeaderText="完结日期" DataFormatString="{0:d}"></asp:BoundColumn>
								<asp:BoundColumn DataField="记录状态" HeaderText="记录状态"></asp:BoundColumn>
								<asp:ButtonColumn Visible="False" Text="取消" ButtonType="PushButton" CommandName="Delete"></asp:ButtonColumn>
								<asp:EditCommandColumn ButtonType="LinkButton" UpdateText="确认" CancelText="取消" EditText="编辑"></asp:EditCommandColumn>
							</Columns>
							<PagerStyle Visible="False"></PagerStyle>
						</asp:datagrid></TD>
				</TR>
				<TR>
					<TD align="left"><uc1:dgnavigation id="DgNavigation1" runat="server"></uc1:dgnavigation>
						<asp:datagrid id="Datagrid2" style="Z-INDEX: 0" runat="server" Height="0px" Width="90%" CssClass="title3"
							PageSize="50" AutoGenerateColumns="False" DataKeyField="wxid" BorderColor="#000066">
							<SelectedItemStyle BorderColor="#FFC0C0" BackColor="White"></SelectedItemStyle>
							<ItemStyle HorizontalAlign="Center"></ItemStyle>
							<HeaderStyle Font-Names="宋体" HorizontalAlign="Center" ForeColor="Purple"></HeaderStyle>
							<Columns>
								<asp:BoundColumn DataField="参与人员" ReadOnly="True" HeaderText="参与人员"></asp:BoundColumn>
								<asp:BoundColumn Visible="False" DataField="wxid" HeaderText="编号"></asp:BoundColumn>
								<asp:TemplateColumn HeaderText=" 记录分组">
									<ItemTemplate>
										<asp:Label runat="server" Text='<%# DataBinder.Eval(Container, "DataItem.记录分组") %>'>
										</asp:Label>
									</ItemTemplate>
									<EditItemTemplate>
										<asp:DropDownList ID="jlfz" Runat="server" AutoPostBack="True">
											<asp:ListItem Value="中心">中心</asp:ListItem>
											<asp:ListItem Value="西线">西线</asp:ListItem>
											<asp:ListItem Value="南线">南线</asp:ListItem>
										</asp:DropDownList>
									</EditItemTemplate>
								</asp:TemplateColumn>
								<asp:BoundColumn DataField="用户单位" ReadOnly="True" HeaderText="用户单位"></asp:BoundColumn>
								<asp:BoundColumn DataField="联系人" ReadOnly="True" HeaderText="联系人">
									<HeaderStyle Wrap="False"></HeaderStyle>
								</asp:BoundColumn>
								<asp:BoundColumn DataField="联系电话" HeaderText="联系电话"></asp:BoundColumn>
								<asp:BoundColumn DataField="故障信息" HeaderText="故障信息">
									<ItemStyle HorizontalAlign="Left"></ItemStyle>
								</asp:BoundColumn>
								<asp:BoundColumn DataField="备注" ReadOnly="True" HeaderText="地址及备注">
									<ItemStyle HorizontalAlign="Left"></ItemStyle>
								</asp:BoundColumn>
								<asp:BoundColumn DataField="接收人" ReadOnly="True" HeaderText="接收人"></asp:BoundColumn>
								<asp:BoundColumn Visible="False" DataField="解决问题" ReadOnly="True" HeaderText="解决问题"></asp:BoundColumn>
								<asp:BoundColumn DataField="登记日期" ReadOnly="True" HeaderText="登记日期" DataFormatString="{0:d}"></asp:BoundColumn>
								<asp:BoundColumn DataField="接货时间" ReadOnly="True" HeaderText="接收时间"></asp:BoundColumn>
								<asp:BoundColumn DataField="维修类别" ReadOnly="True" HeaderText="维修类别"></asp:BoundColumn>
								<asp:BoundColumn Visible="False" DataField="登记人" ReadOnly="True" HeaderText="登记人"></asp:BoundColumn>
								<asp:BoundColumn DataField="完结人" ReadOnly="True" HeaderText="完结人"></asp:BoundColumn>
								<asp:BoundColumn Visible="False" HeaderText="分值" DataFormatString="{0:F2}"></asp:BoundColumn>
								<asp:BoundColumn DataField="完结日期" ReadOnly="True" HeaderText="完结日期" DataFormatString="{0:d}"></asp:BoundColumn>
								<asp:BoundColumn DataField="记录状态" HeaderText="记录状态"></asp:BoundColumn>
							</Columns>
							<PagerStyle Visible="False"></PagerStyle>
						</asp:datagrid></TD>
				</TR>
				<TR>
					<TD align="center">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
					</TD>
				</TR>
			</TABLE>
		</form>
	</body>
</HTML>
