<%@ Page language="c#" Codebehind="xsprint.aspx.cs" AutoEventWireup="false" Inherits="jxc.webjxc.xsgl.xsprint" %>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN" >
<HTML>
	<HEAD>
		<title>销售单打印</title>
		<meta content="Microsoft Visual Studio .NET 7.1" name="GENERATOR">
		<meta content="C#" name="CODE_LANGUAGE">
		<meta content="JavaScript" name="vs_defaultClientScript">
		<meta content="http://schemas.microsoft.com/intellisense/ie5" name="vs_targetSchema">
		<meta http-equiv="Content-Type" content="text/html; charset=gb2312">
		<LINK href="/css/global.css" type="text/css" rel="stylesheet">
		<style>
    p1 { PAGE-BREAK-AFTER: always }
		</style>
	</HEAD>
	<body MS_POSITIONING="GridLayout">
		<form id="Form1" method="post" runat="server">
			<p1>
				<div class="biaoti" align="center">
					<table cellSpacing="0" cellPadding="0" width="650" border="0">
						<TR>
							<TD height="20" colspan="4" class="daziti">
								<p align="center">- - -威海星通电子出库单- - -
									<asp:label id="Label12" runat="server" Visible="False"></asp:label></p>
							</TD>
						</TR>
						<tr>
							<td class="daziti">客户名称:
								<asp:label id="Label4" runat="server"></asp:label></td>
							<td>&nbsp;</td>
							<td height="20" colspan="2" nowrap>
								<div align="right"><span class="daziti">
										<asp:label id="Label2" runat="server" Visible="False"></asp:label>出库日期:
										<asp:label id="Label3" runat="server"></asp:label><asp:label id="Label5" runat="server" Visible="False"></asp:label><asp:label id="Label1" runat="server" Visible="False"></asp:label></span></div>
							</td>
						</tr>
						<TR>
							<TD height="20" colspan="3" class="daziti">单据编号:
								<asp:label id="Label11" runat="server"></asp:label></TD>
							<TD align="right" nowrap><span class="daziti">单位：元</span></TD>
						</TR>
					</table>
					<table borderColor="#000000" cellSpacing="0" cellPadding="0" width="650" border="0">
						<tr>
							<td>
								<table cellSpacing="0" cellPadding="0" width="100%" align="center" border="0">
									<tr>
										<td class="daziti" colSpan="13"><asp:datagrid id="Datagrid1" runat="server" CssClass="title3" Width="650px" Height="0px" BorderColor="#000066"
												AutoGenerateColumns="False" ShowFooter="True">
												<SelectedItemStyle BorderColor="#FFC0C0" BackColor="White"></SelectedItemStyle>
												<ItemStyle HorizontalAlign="Center"></ItemStyle>
												<HeaderStyle Font-Names="宋体" HorizontalAlign="Center" ForeColor="Purple"></HeaderStyle>
												<FooterStyle Font-Size="12pt" Wrap="False"></FooterStyle>
												<Columns>
													<asp:BoundColumn HeaderText="序号">
														<HeaderStyle Width="40px"></HeaderStyle>
														<FooterStyle Wrap="False"></FooterStyle>
													</asp:BoundColumn>
													<asp:BoundColumn DataField="cpid" HeaderText="产品编号">
														<HeaderStyle Wrap="False" HorizontalAlign="Center"></HeaderStyle>
													</asp:BoundColumn>
													<asp:BoundColumn DataField="产品名称" HeaderText="产品名称">
														<HeaderStyle Wrap="False" HorizontalAlign="Center" Width="200px"></HeaderStyle>
													</asp:BoundColumn>
													<asp:BoundColumn DataField="销售数量" HeaderText="数量" DataFormatString="{0:F0}">
														<HeaderStyle Wrap="False"></HeaderStyle>
														<ItemStyle Wrap="False" HorizontalAlign="Center"></ItemStyle>
														<FooterStyle Wrap="False" HorizontalAlign="Center" VerticalAlign="Middle"></FooterStyle>
													</asp:BoundColumn>
													<asp:BoundColumn DataField="零售价" HeaderText="单价" DataFormatString="{0:F2}">
														<HeaderStyle Wrap="False"></HeaderStyle>
														<ItemStyle Wrap="False"></ItemStyle>
														<FooterStyle Wrap="False" HorizontalAlign="Center" VerticalAlign="Middle"></FooterStyle>
													</asp:BoundColumn>
													<asp:BoundColumn DataField="金额" HeaderText="金额" DataFormatString="{0:F2}">
														<HeaderStyle Wrap="False"></HeaderStyle>
														<ItemStyle Wrap="False"></ItemStyle>
														<FooterStyle Wrap="False" HorizontalAlign="Center" VerticalAlign="Middle"></FooterStyle>
													</asp:BoundColumn>
												</Columns>
												<PagerStyle Visible="False"></PagerStyle>
											</asp:datagrid></td>
									</tr>
								</table>
								<table cellSpacing="0" cellPadding="0" width="650" border="0">
									<TR valign="middle" bgColor="#ffffff" class="biaoti">
										<td noWrap class="daziti" style="HEIGHT: 22px"><div align="left">制单人:
												<asp:Label ID="Label9" runat="server"></asp:Label>&nbsp;&nbsp;
											</div>
										</td>
										<td noWrap class="daziti" style="HEIGHT: 20px"><div align="center">送货人:
												<asp:Label ID="Label10" runat="server"></asp:Label>
												&nbsp;&nbsp;</div>
										</td>
										<td noWrap class="daziti" style="HEIGHT: 20px"><div align="right">
												客户签字：&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
											</div>
										</td>
									</TR>
									<tr class="biaoti" bgColor="#ffffff">
										<td class="daziti" height="20"><div align="left">备注:
												<asp:label id="Label7" runat="server"></asp:label>
											</div>
										</td>
										<td colspan="2" class="daziti">&nbsp;&nbsp;
											<asp:Label ID="Label8" runat="server" Visible="False"></asp:Label>
										</td>
									</tr>
									<tr class="biaoti" bgColor="#ffffff">
										<td class="daziti" colSpan="3" height="20">请您仔细核对此单内容，并签字确认，谢谢您的合作！服务电话:0631-5213686</td>
									</tr>
								</table>
							</td>
						</tr>
					</table>
				</div>
			</p1>
		</form>
	</body>
</HTML>
