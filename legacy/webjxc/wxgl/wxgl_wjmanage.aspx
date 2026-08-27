<%@ Page language="c#" Codebehind="wxgl_wjmanage.aspx.cs" AutoEventWireup="false" Inherits="jxc.admin.bases.wxgl_wjmanage" %>
<%@ Register TagPrefix="uc1" TagName="dgNavigation" Src="../../ascx/dgNavigation.ascx" %>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN" >
<HTML>
	<HEAD>
		<title>维修记录完结信息</title>
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
								<td><font face="隶书" size="5">维修记录完结</font></td>
							</tr>
						</table>
					</td>
					<td width="250"><FONT face="宋体"></FONT></td>
				</tr>
			</table>
			<table class="title3" cellSpacing="0" cellPadding="0" width="100%" border="0">
				<TR>
					<TD style="HEIGHT: 25px; WIDTH: 97px"><FONT face="宋体" style="Z-INDEX: 0"> 记录状态</FONT></TD>
					<TD style="HEIGHT: 25px; WIDTH: 139px"><FONT face="宋体">
							<asp:DropDownList id="DropDownList2" style="Z-INDEX: 0" runat="server">
								<asp:ListItem Value="已接收" Selected="True">已接收</asp:ListItem>
								<asp:ListItem Value="已完成">已完成</asp:ListItem>
							</asp:DropDownList></FONT></TD>
					<TD style="HEIGHT: 25px" align="left"><FONT face="宋体">
							<asp:checkbox id="Checkbox4" runat="server" Text="未转销售" Visible="False"></asp:checkbox>
							<asp:checkbox id="Checkbox2" style="Z-INDEX: 0" runat="server" Text="按用户单位"></asp:checkbox>
							<asp:textbox id="txtdw" style="Z-INDEX: 0" runat="server" CssClass="inputcss"></asp:textbox>
							<asp:checkbox id="Checkbox3" runat="server" Text="按客户" style="Z-INDEX: 0" Visible="False"></asp:checkbox>
							<asp:textbox id="Textbox3" runat="server" CssClass="inputcss" style="Z-INDEX: 0" Visible="False"></asp:textbox></FONT></TD>
				</TR>
				<TR>
					<TD style="HEIGHT: 14px; WIDTH: 97px"><FONT face="宋体" style="Z-INDEX: 0">记录分组</FONT></TD>
					<TD style="HEIGHT: 14px; WIDTH: 139px">
						<asp:DropDownList id="DropDownList1" runat="server">
							<asp:ListItem Value="中心">中心</asp:ListItem>
							<asp:ListItem Value="西线">西线</asp:ListItem>
							<asp:ListItem Value="南线">南线</asp:ListItem>
							<asp:ListItem Value="所有记录" Selected="True">所有记录</asp:ListItem>
						</asp:DropDownList></TD>
					<TD style="HEIGHT: 14px" align="left"><FONT face="宋体">
							<asp:checkbox id="CheckBox1" runat="server" Text="按日期" Checked="True"></asp:checkbox>
							<asp:textbox id="Textbox1" runat="server" CssClass="inputcss" Width="104px"></asp:textbox>到
							<asp:textbox id="Textbox2" runat="server" CssClass="inputcss" Width="104px"></asp:textbox></FONT></TD>
				</TR>
				<TR>
					<TD style="WIDTH: 97px">接收人</TD>
					<TD style="WIDTH: 139px">
						<asp:textbox id="cpname" runat="server" CssClass="inputcss"></asp:textbox></TD>
					<TD align="left"><asp:button id="query" runat="server" CssClass="buttoncss" Text="查询" Width="72px" Height="24px"></asp:button>&nbsp;
						<asp:button id="add" runat="server" CssClass="buttoncss" Text="登记维修记录" Width="88px" Height="24px"
							Visible="False"></asp:button>&nbsp;
						<asp:button id="change" runat="server" CssClass="buttoncss" Text="到货确认" Width="64px" Height="24"
							Visible="False"></asp:button>&nbsp;
						<asp:button id="Button1" runat="server" Text="付款确认" CssClass="buttoncss" Width="52px" Height="24"
							Visible="False"></asp:button>&nbsp;
						<asp:button id="Button2" runat="server" Text="发票确认" CssClass="buttoncss" Width="56px" Height="24"
							Visible="False"></asp:button>&nbsp;
						<asp:button id="delete" runat="server" CssClass="buttoncss" Text="删除" Width="56px" Height="24px"
							Enabled="False" Visible="False"></asp:button>快速导航-&gt;<a href="\webjxc\wxgl\wxgl_manage.aspx"><font color="blue" style="FONT-SIZE: 12pt; FONT-WEIGHT: bold">维修接收</font></a>-&gt;<a href="\webjxc\wxgl\wxgl_cxmanage.aspx"><font color="blue" style="FONT-SIZE: 12pt; FONT-WEIGHT: bold">维修查询</font></a></TD>
				</TR>
			</table>
			<TABLE class="title3" cellSpacing="0" cellPadding="0" width="100%" border="0">
				<TR>
					<TD>
						<asp:datagrid id="Datagrid1" runat="server" CssClass="title3" Height="0px" Width="90%" PageSize="50"
							AutoGenerateColumns="False" DataKeyField="wxid" AllowPaging="True" BorderColor="#000066">
							<SelectedItemStyle BorderColor="#FFC0C0" BackColor="White"></SelectedItemStyle>
							<ItemStyle HorizontalAlign="Center"></ItemStyle>
							<HeaderStyle Font-Names="宋体" HorizontalAlign="Center" ForeColor="Purple"></HeaderStyle>
							<Columns>
								<asp:EditCommandColumn ButtonType="PushButton" UpdateText="确认" CancelText="取消" EditText="完结"></asp:EditCommandColumn>
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
											<asp:ListItem Value="待施工">待施工</asp:ListItem>
											<asp:ListItem Value="看现场">看现场</asp:ListItem>
										</asp:DropDownList>
									</EditItemTemplate>
								</asp:TemplateColumn>
								<asp:BoundColumn Visible="False" DataField="wxid" HeaderText="编号"></asp:BoundColumn>
								<asp:BoundColumn DataField="参与人员" HeaderText="参与人员"></asp:BoundColumn>
								<asp:BoundColumn DataField="故障信息" HeaderText="故障信息">
									<ItemStyle HorizontalAlign="Left"></ItemStyle>
								</asp:BoundColumn>
								<asp:BoundColumn DataField="备注" HeaderText="备注">
									<ItemStyle HorizontalAlign="Left"></ItemStyle>
								</asp:BoundColumn>
								<asp:BoundColumn DataField="记录分组" ReadOnly="True" HeaderText=" 记录分组"></asp:BoundColumn>
								<asp:BoundColumn Visible="False" DataField="用户单位" ReadOnly="True" HeaderText="用户单位"></asp:BoundColumn>
								<asp:BoundColumn DataField="联系方式" ReadOnly="True" HeaderText="联系方式">
									<HeaderStyle Wrap="False"></HeaderStyle>
								</asp:BoundColumn>
								<asp:BoundColumn Visible="False" DataField="联系电话" ReadOnly="True" HeaderText="联系电话"></asp:BoundColumn>
								<asp:BoundColumn DataField="接收人" ReadOnly="True" HeaderText="接收人"></asp:BoundColumn>
								<asp:BoundColumn Visible="False" DataField="解决问题" ReadOnly="True" HeaderText="解决问题"></asp:BoundColumn>
								<asp:BoundColumn DataField="登记日期" ReadOnly="True" HeaderText="登记日期" DataFormatString="{0:d}"></asp:BoundColumn>
								<asp:BoundColumn Visible="False" DataField="接货时间" ReadOnly="True" HeaderText="接收时间"></asp:BoundColumn>
								<asp:BoundColumn Visible="False" DataField="维修类别" ReadOnly="True" HeaderText="维修类别"></asp:BoundColumn>
								<asp:BoundColumn Visible="False" DataField="登记人" HeaderText="登记人"></asp:BoundColumn>
								<asp:BoundColumn DataField="完结人" ReadOnly="True" HeaderText="完结人"></asp:BoundColumn>
								<asp:BoundColumn Visible="False" ReadOnly="True" HeaderText="分值" DataFormatString="{0:F2}"></asp:BoundColumn>
								<asp:BoundColumn DataField="完结日期" ReadOnly="True" HeaderText="完结日期" DataFormatString="{0:d}"></asp:BoundColumn>
								<asp:BoundColumn DataField="记录状态" ReadOnly="True" HeaderText="记录状态"></asp:BoundColumn>
								<asp:ButtonColumn Text="取消" ButtonType="PushButton" CommandName="Delete"></asp:ButtonColumn>
							</Columns>
							<PagerStyle Visible="False"></PagerStyle>
						</asp:datagrid></TD>
				</TR>
				<TR>
					<TD align="left">
						<uc1:dgnavigation id="DgNavigation1" runat="server"></uc1:dgnavigation></TD>
				</TR>
				<TR>
					<TD align="center">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
					</TD>
				</TR>
			</TABLE>
		</form>
	</body>
</HTML>
