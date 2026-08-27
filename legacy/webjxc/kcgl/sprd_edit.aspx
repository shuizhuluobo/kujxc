<%@ Register TagPrefix="uc1" TagName="dgNavigation" Src="../../ascx/dgNavigation.ascx" %>
<%@ Page language="c#" Codebehind="sprd_edit.aspx.cs" AutoEventWireup="false" Inherits="jxc.admin.bases.sprd_edit" %>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN" >
<HTML>
	<HEAD>
		<title>产品下拨</title>
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
		<form id="sprd_edit" method="post" runat="server">
			<table height="50" cellSpacing="0" cellPadding="0" width="100%" align="center" border="0">
				<tr>
					<td width="556" background="/image/title.gif">
						<table cellSpacing="0" cellPadding="0" width="100%" border="0">
							<tr>
								<td height="1"></td>
							</tr>
							<tr>
								<td width="80"><FONT face="宋体"></FONT></td>
								<td><font face="隶书" size="5">产品下拨</font></td>
							</tr>
						</table>
					</td>
					<td width="250"></td>
				</tr>
			</table>
			<br>
			<table class="title3" cellSpacing="1" cellPadding="0" width="90%" align="center" border="0">
				<tr>
					<td align="right" width="100">入库单编号
					</td>
					<td style="WIDTH: 215px"><asp:textbox id="Textbox4" runat="server" ReadOnly="True" Width="120px" CssClass="inputcss"></asp:textbox><asp:button id="Button3" tabIndex="10" runat="server" CssClass="buttoncss" Text="所有商品" Width="56px"></asp:button></td>
					<td style="WIDTH: 99px">&nbsp;入库日期</td>
					<td>&nbsp;<asp:textbox id="rkrq" runat="server" Width="80px" CssClass="inputcss"></asp:textbox></td>
					<TD style="WIDTH: 49px">&nbsp;入库店</TD>
					<TD><asp:dropdownlist id="DropDownListlx" runat="server" CssClass="inputcss"></asp:dropdownlist></TD>
				</tr>
				<TR>
					<TD align="right" colSpan="6"><FONT face="宋体"><asp:datagrid id="Datagrid1" tabIndex="-1" runat="server" Width="572px" CssClass="title3" AutoGenerateColumns="False"
								DataKeyField="rkid" BorderColor="#000066" Height="0px" PageSize="1000">
								<SelectedItemStyle BorderColor="#FFC0C0" BackColor="White"></SelectedItemStyle>
								<ItemStyle HorizontalAlign="Center"></ItemStyle>
								<HeaderStyle Font-Names="宋体" HorizontalAlign="Center" ForeColor="Purple"></HeaderStyle>
								<Columns>
									<asp:BoundColumn DataField="cpid" HeaderText="条码"></asp:BoundColumn>
									<asp:BoundColumn DataField="类别" HeaderText="类别"></asp:BoundColumn>
									<asp:BoundColumn DataField="产品名称" HeaderText="商品名称"></asp:BoundColumn>
									<asp:BoundColumn Visible="False" DataField="进货价" HeaderText="进货价"></asp:BoundColumn>
									<asp:BoundColumn DataField="入库单价" HeaderText="销售价格"></asp:BoundColumn>
									<asp:BoundColumn DataField="入库数量" HeaderText="入库数量" DataFormatString="{0:F2}">
										<ItemStyle HorizontalAlign="Right"></ItemStyle>
									</asp:BoundColumn>
									<asp:BoundColumn DataField="剩余数量" HeaderText="剩余数量" DataFormatString="{0:F2}">
										<ItemStyle HorizontalAlign="Right"></ItemStyle>
									</asp:BoundColumn>
									<asp:BoundColumn Visible="False" DataField="进货价" HeaderText="进货金额"></asp:BoundColumn>
									<asp:BoundColumn DataField="到货确认" HeaderText="到货状态"></asp:BoundColumn>
									<asp:ButtonColumn Text="选择" CommandName="Select"></asp:ButtonColumn>
									<asp:BoundColumn Visible="False" DataField="rkid" HeaderText="rkid"></asp:BoundColumn>
								</Columns>
								<PagerStyle Visible="False"></PagerStyle>
							</asp:datagrid></FONT></TD>
				</TR>
				<TR>
					<TD align="right" width="100">条码</TD>
					<TD style="WIDTH: 215px"><FONT face="宋体"><asp:textbox id="cpid" tabIndex="1" runat="server" Width="144px" CssClass="inputcss"></asp:textbox><asp:button id="Button2" tabIndex="1" runat="server" CssClass="buttoncss" Text="..."></asp:button></FONT></TD>
					<TD style="WIDTH: 99px"><FONT face="宋体">型号</FONT></TD>
					<TD><asp:textbox id="Textbox2" tabIndex="3" runat="server" Width="96px" CssClass="inputcss" BackColor="#E0E0E0"></asp:textbox></TD>
					<TD style="WIDTH: 49px"><FONT face="宋体">类别</FONT></TD>
					<TD><FONT face="宋体"><asp:textbox id="Textbox8" tabIndex="4" runat="server" Width="96px" CssClass="inputcss" BackColor="#E0E0E0"></asp:textbox></FONT></TD>
				</TR>
				<TR>
					<TD align="right" width="100">入库产品</TD>
					<TD style="WIDTH: 215px"><asp:textbox id="cpname" tabIndex="2" runat="server" ReadOnly="True" Width="143px" CssClass="inputcss"
							BackColor="#E0E0E0"></asp:textbox></TD>
					<TD style="WIDTH: 99px"><FONT face="宋体">进货价</FONT></TD>
					<TD><asp:textbox id="Textbox6" tabIndex="4" runat="server" Width="96px" CssClass="inputcss" BackColor="#E0E0E0"></asp:textbox></TD>
					<TD style="WIDTH: 49px"><FONT face="宋体"></FONT></TD>
					<TD><FONT face="宋体"><asp:textbox id="Textbox3" tabIndex="9" runat="server" Width="24px" CssClass="inputcss" Visible="False">0</asp:textbox><asp:textbox id="Textbox5" tabIndex="9" runat="server" Width="12px" CssClass="inputcss" Visible="False"></asp:textbox><asp:textbox id="Textbox9" tabIndex="9" runat="server" Width="18px" CssClass="inputcss" Visible="False"></asp:textbox><asp:textbox id="Textbox10" tabIndex="9" runat="server" Width="17px" CssClass="inputcss" Visible="False">0</asp:textbox></FONT></TD>
				</TR>
				<tr>
					<td align="right" width="100">零售价&nbsp;</td>
					<td style="WIDTH: 215px"><asp:textbox id="Textbox7" tabIndex="8" runat="server" Width="96px" CssClass="inputcss">0</asp:textbox></td>
					<TD style="WIDTH: 99px"><FONT face="宋体">数量&nbsp;</FONT></TD>
					<TD><asp:textbox id="rksl" tabIndex="9" runat="server" Width="96px" CssClass="inputcss">0</asp:textbox></TD>
					<TD style="WIDTH: 49px"><asp:button id="Button1" tabIndex="10" runat="server" CssClass="buttoncss" Text="增加"></asp:button></TD>
					<TD><FONT face="宋体">
							<asp:textbox id="Textbox11" tabIndex="9" runat="server" CssClass="inputcss" Width="18px" Visible="False"></asp:textbox>
							<asp:textbox id="Textbox12" tabIndex="9" runat="server" CssClass="inputcss" Width="18px" Visible="False"></asp:textbox></FONT></TD>
				</tr>
				<TR>
					<TD style="HEIGHT: 23px" align="right" colSpan="6"><asp:datagrid id="Datagrid2" tabIndex="-1" runat="server" Width="100%" CssClass="title3" AutoGenerateColumns="False"
							DataKeyField="rkid" BorderColor="#000066" Height="0px" PageSize="1000">
							<SelectedItemStyle BorderColor="#FFC0C0" BackColor="White"></SelectedItemStyle>
							<ItemStyle HorizontalAlign="Center"></ItemStyle>
							<HeaderStyle Font-Names="宋体" HorizontalAlign="Center" ForeColor="Purple"></HeaderStyle>
							<Columns>
								<asp:BoundColumn DataField="cpid" HeaderText="条码"></asp:BoundColumn>
								<asp:BoundColumn DataField="产品名称" HeaderText="商品名称"></asp:BoundColumn>
								<asp:BoundColumn DataField="产品类别" HeaderText="类别"></asp:BoundColumn>
								<asp:BoundColumn DataField="进货价" HeaderText="进货价"></asp:BoundColumn>
								<asp:BoundColumn DataField="入库单价" HeaderText="销售价"></asp:BoundColumn>
								<asp:BoundColumn DataField="入库数量" HeaderText="入库数量" DataFormatString="{0:F2}">
									<ItemStyle HorizontalAlign="Right"></ItemStyle>
								</asp:BoundColumn>
								<asp:BoundColumn DataField="剩余数量" HeaderText="剩余数量" DataFormatString="{0:F2}">
									<ItemStyle HorizontalAlign="Right"></ItemStyle>
								</asp:BoundColumn>
								<asp:BoundColumn Visible="False" DataField="进货价" HeaderText="进货金额"></asp:BoundColumn>
								<asp:BoundColumn Visible="False" DataField="rkidold" HeaderText="rkidold"></asp:BoundColumn>
								<asp:BoundColumn Visible="False" DataField="rkid" HeaderText="rkid"></asp:BoundColumn>
								<asp:ButtonColumn Text="删除" CommandName="Select"></asp:ButtonColumn>
							</Columns>
							<PagerStyle Visible="False"></PagerStyle>
						</asp:datagrid>&nbsp;
					</TD>
				</TR>
				<TR>
					<TD align="right" width="100"><asp:label id="Label2" runat="server" Visible="False">经办人</asp:label></TD>
					<TD style="WIDTH: 215px"><asp:textbox id="czy" runat="server" ReadOnly="True" Width="80px" CssClass="inputcss" BackColor="#E0E0E0"
							Visible="False"></asp:textbox></TD>
					<TD style="WIDTH: 99px"><FONT face="宋体"><asp:label id="Label1" runat="server" Visible="False">下拨单编号</asp:label></FONT></TD>
					<TD colSpan="3"><FONT face="宋体"><asp:textbox id="Textbox1" runat="server" ReadOnly="True" Width="160px" CssClass="inputcss" Visible="False"></asp:textbox></FONT><FONT face="宋体"></FONT></TD>
				</TR>
			</table>
			<TABLE cellSpacing="0" cellPadding="0" width="100%" border="0">
				<TR>
					<TD align="center"><asp:button id="save" runat="server" CssClass="buttoncss" Width="62px" Text="保存" Visible="False"></asp:button>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<INPUT class="buttoncss" style="WIDTH: 64px; HEIGHT: 20px" onclick="closes()" type="button"
							value="返回">
					</TD>
				</TR>
			</TABLE>
		</form>
	</body>
</HTML>
