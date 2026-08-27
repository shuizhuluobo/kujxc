<%@ Register TagPrefix="uc1" TagName="dgNavigation" Src="../../ascx/dgNavigation.ascx" %>
<%@ Page language="c#" Codebehind="spxb_edit.aspx.cs" AutoEventWireup="false" Inherits="jxc.admin.bases.spxb_edit" %>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN" >
<HTML>
	<HEAD>
		<title>产品订货</title>
		<meta content="Microsoft Visual Studio .NET 7.1" name="GENERATOR">
		<meta content="C#" name="CODE_LANGUAGE">
		<meta content="JavaScript" name="vs_defaultClientScript">
		<meta content="http://schemas.microsoft.com/intellisense/ie5" name="vs_targetSchema">
		<LINK href="/css/BasicLayout.css" type="text/css" rel="stylesheet">
		<script language="javascript">
		function closes()
		{
			opener.location.href=opener.location.href;
			opener = null;
			window.close ();
		}
		
		</script>
	</HEAD>
	<body MS_POSITIONING="GridLayout">
		<form id="spxb_edit" method="post" runat="server">
			<table height="50" cellSpacing="0" cellPadding="0" width="100%" align="center" border="0">
				<tr>
					<td width="556" background="/image/title.gif">
						<table cellSpacing="0" cellPadding="0" width="100%" border="0">
							<tr>
								<td height="1"></td>
							</tr>
							<tr>
								<td width="80"></td>
								<td><font face="隶书" size="5">产品订货</font></td>
							</tr>
						</table>
					</td>
					<td width="250"></td>
				</tr>
			</table>
			<br>
			<table class="title3" style="WIDTH: 719px; HEIGHT: 371px" cellSpacing="0" cellPadding="0"
				width="719" align="center" border="1">
				<tr>
					<td style="WIDTH: 105px; HEIGHT: 19px" align="right" width="105">入库单编号
					</td>
					<td style="WIDTH: 236px; HEIGHT: 19px"><asp:textbox id="Textbox4" runat="server" ReadOnly="True" CssClass="inputcss" Width="144px"></asp:textbox></td>
					<td style="WIDTH: 95px; HEIGHT: 19px">入库日期</td>
					<td style="HEIGHT: 19px"><asp:textbox id="rkrq" runat="server" ReadOnly="True" CssClass="inputcss" Width="120px"></asp:textbox><asp:textbox id="Textbox7" runat="server" ReadOnly="True" CssClass="inputcss" Width="26px" Visible="False"></asp:textbox></td>
				</tr>
				<tr>
					<td style="WIDTH: 105px; HEIGHT: 17px" align="right" width="105">经办人&nbsp;
					</td>
					<td style="WIDTH: 236px; HEIGHT: 17px"><asp:textbox id="czy" runat="server" ReadOnly="True" CssClass="inputcss" Width="80px" BackColor="#E0E0E0"></asp:textbox></td>
					<td style="WIDTH: 95px; HEIGHT: 17px">入库库房</td>
					<td style="HEIGHT: 17px"><asp:dropdownlist id="DropDownListlx" runat="server" CssClass="inputcss"></asp:dropdownlist><FONT face="宋体"></FONT></td>
				</tr>
				<TR>
					<TD style="WIDTH: 105px; HEIGHT: 23px" align="right" width="105">供应商</TD>
					<TD style="WIDTH: 236px; HEIGHT: 23px"><FONT face="宋体"><asp:textbox id="txtgys" tabIndex="1" runat="server" CssClass="inputcss" Width="215px" BackColor="#C0FFFF"
								Height="19px"></asp:textbox></FONT></TD>
					<TD style="WIDTH: 95px; HEIGHT: 23px"><FONT face="宋体">客户名称</FONT></TD>
					<TD style="HEIGHT: 23px"><FONT face="宋体">
							<asp:textbox id="txtbz" runat="server" Width="261px" CssClass="inputcss" BackColor="#FFE0C0"></asp:textbox></FONT></TD>
				</TR>
				<tr>
					<td style="WIDTH: 105px; HEIGHT: 23px" align="right" width="105"><FONT face="宋体">条码</FONT>&nbsp;
					</td>
					<td style="WIDTH: 236px; HEIGHT: 23px"><asp:textbox id="cpid" tabIndex="1" runat="server" CssClass="inputcss" Width="144px" BackColor="#E0E0E0"></asp:textbox><asp:button id="Button2" tabIndex="1" runat="server" CssClass="buttoncss" Text="..."></asp:button></td>
					<td style="WIDTH: 95px; HEIGHT: 23px">入库产品</td>
					<td style="HEIGHT: 23px"><asp:textbox id="cpname" tabIndex="2" runat="server" ReadOnly="True" CssClass="inputcss" Width="160px"
							BackColor="#C0FFFF"></asp:textbox></td>
				</tr>
				<tr>
					<td style="WIDTH: 105px; HEIGHT: 21px" align="right" width="105">款号&nbsp;
					</td>
					<td style="WIDTH: 236px; HEIGHT: 21px"><FONT face="宋体"><asp:textbox id="Textbox2" tabIndex="3" runat="server" CssClass="inputcss" Width="120px" BackColor="#E0E0E0"></asp:textbox></FONT></td>
					<TD style="WIDTH: 95px; HEIGHT: 21px">折扣率</TD>
					<td style="HEIGHT: 21px"><asp:textbox id="Textbox3" tabIndex="6" runat="server" CssClass="inputcss" Width="96px" AutoPostBack="True">10</asp:textbox>(0.1-10)</td>
				</tr>
				<TR>
					<TD style="WIDTH: 105px; HEIGHT: 15px" align="right" width="105">类别&nbsp;</TD>
					<TD style="WIDTH: 236px; HEIGHT: 15px"><FONT face="宋体"><asp:textbox id="Textbox8" runat="server" ReadOnly="True" CssClass="inputcss" Width="120px" BackColor="#E0E0E0"></asp:textbox></FONT></TD>
					<TD style="WIDTH: 95px; HEIGHT: 15px"><FONT face="宋体">客户价</FONT></TD>
					<TD style="HEIGHT: 15px"><asp:textbox id="Textbox1" tabIndex="5" runat="server" CssClass="inputcss" Width="96px" BackColor="White">0</asp:textbox></TD>
				</TR>
				<TR>
					<TD style="WIDTH: 105px; HEIGHT: 19px" align="right" width="105">&nbsp;单位&nbsp;
					</TD>
					<TD style="WIDTH: 236px; HEIGHT: 19px"><FONT face="宋体"><asp:textbox id="Textbox6" tabIndex="4" runat="server" CssClass="inputcss" Width="96px"></asp:textbox><asp:dropdownlist id="Dropdownlist1" tabIndex="7" runat="server" CssClass="inputcss" AutoPostBack="True"
								Visible="False"></asp:dropdownlist></FONT></TD>
					<TD style="WIDTH: 95px; HEIGHT: 19px">进货价</TD>
					<TD style="HEIGHT: 19px"><asp:textbox id="Textbox5" tabIndex="8" runat="server" CssClass="inputcss" Width="96px">0</asp:textbox>
						<asp:dropdownlist id="Dropdownlist3" runat="server" CssClass="inputcss" AutoPostBack="True">
							<asp:ListItem Value="含税" Selected="True">含税</asp:ListItem>
							<asp:ListItem Value="不含税">不含税</asp:ListItem>
						</asp:dropdownlist>
						<asp:dropdownlist id="Dropdownlist4" runat="server" CssClass="inputcss">
							<asp:ListItem></asp:ListItem>
							<asp:ListItem Value="增值税发票" Selected="True">增值税发票</asp:ListItem>
							<asp:ListItem Value="普通发票">普通发票</asp:ListItem>
							<asp:ListItem Value="其他发票">其他发票</asp:ListItem>
						</asp:dropdownlist></TD>
				</TR>
				<TR>
					<TD style="WIDTH: 105px; HEIGHT: 22px" align="right" width="105">数量</TD>
					<TD style="WIDTH: 236px; HEIGHT: 22px"><asp:textbox id="rksl" tabIndex="9" runat="server" CssClass="inputcss" Width="96px">0</asp:textbox><asp:button id="Button1" tabIndex="10" runat="server" CssClass="buttoncss" Text="增加"></asp:button><asp:button id="Button3" tabIndex="10" runat="server" CssClass="buttoncss" Text="删除"></asp:button></TD>
					<TD style="WIDTH: 95px; HEIGHT: 22px"><FONT face="宋体">补充说明</FONT></TD>
					<TD style="HEIGHT: 22px"><FONT face="宋体">
							<asp:textbox id="Textbox9" runat="server" Width="261px" CssClass="inputcss" BackColor="White"></asp:textbox></FONT></TD>
				</TR>
				<TR>
					<TD align="top" colSpan="4"><FONT face="宋体"></FONT><FONT face="宋体"><asp:datagrid id="Datagrid1" tabIndex="-1" runat="server" CssClass="title3" Width="676px" Height="0px"
								DataKeyField="rkid" ShowFooter="True" BorderColor="#000066" AutoGenerateColumns="False">
								<SelectedItemStyle BorderColor="#FFC0C0" BackColor="White"></SelectedItemStyle>
								<ItemStyle HorizontalAlign="Center"></ItemStyle>
								<HeaderStyle Font-Names="宋体" HorizontalAlign="Center" ForeColor="Purple"></HeaderStyle>
								<FooterStyle HorizontalAlign="Right"></FooterStyle>
								<Columns>
									<asp:TemplateColumn HeaderText="选择" FooterText="合计:">
										<HeaderStyle Width="40px"></HeaderStyle>
										<ItemTemplate>
											<asp:CheckBox id="selectcheck" runat="server" Height="8px" AutoPostBack="false"></asp:CheckBox>
										</ItemTemplate>
									</asp:TemplateColumn>
									<asp:BoundColumn DataField="cpid" HeaderText="条码"></asp:BoundColumn>
									<asp:BoundColumn DataField="类别" HeaderText="类别"></asp:BoundColumn>
									<asp:BoundColumn DataField="产品名称" HeaderText="商品名称"></asp:BoundColumn>
									<asp:BoundColumn Visible="False" DataField="型号" HeaderText="型号"></asp:BoundColumn>
									<asp:BoundColumn DataField="规格" HeaderText="数量单位"></asp:BoundColumn>
									<asp:BoundColumn DataField="入库数量" HeaderText="入库数量" DataFormatString="{0:F2}">
										<ItemStyle HorizontalAlign="Right" BackColor="#CCFFFF"></ItemStyle>
										<FooterStyle HorizontalAlign="Right" BackColor="#CCFFFF"></FooterStyle>
									</asp:BoundColumn>
									<asp:BoundColumn DataField="进货价" HeaderText="进货价" DataFormatString="{0:F2}">
										<ItemStyle HorizontalAlign="Right"></ItemStyle>
									</asp:BoundColumn>
									<asp:BoundColumn DataField="总金额" HeaderText="进货金额">
										<FooterStyle HorizontalAlign="Right"></FooterStyle>
									</asp:BoundColumn>
									<asp:BoundColumn DataField="是否含税" HeaderText="是否含税"></asp:BoundColumn>
								</Columns>
								<PagerStyle Visible="False"></PagerStyle>
							</asp:datagrid></FONT><uc1:dgnavigation id="DgNavigation1" runat="server"></uc1:dgnavigation></TD>
				</TR>
			</table>
			<table cellSpacing="0" cellPadding="0" width="100%" border="0">
				<tr>
					<td align="center"><asp:button id="save" runat="server" CssClass="buttoncss" Width="62px" Text="保存"></asp:button>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<INPUT class="buttoncss" style="WIDTH: 64px; HEIGHT: 20px" onclick="closes()" type="button"
							value="返回">
					</td>
				</tr>
			</table>
		</form>
	</body>
</HTML>
