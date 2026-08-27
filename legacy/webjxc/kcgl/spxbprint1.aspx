<%@ Page language="c#" Codebehind="spxbprint.aspx.cs" AutoEventWireup="false" Inherits="jxc.webjxc.xsgl.spxbprint" %>
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
		<style type="text/css">
.style1 { FONT-WEIGHT: bold; FONT-SIZE: 24px }
.style4 {font-size: 12px}
        </style>
	</HEAD>
	<body MS_POSITIONING="GridLayout">
		<form id="Form1" method="post" runat="server">
			<div class="biaoti" align="center">
				<p class="style1">- - -
					<asp:label id="Label12" runat="server" Visible="False"></asp:label>
					产品订货合同- - -</p>
				<span class="daziti"></span>
				<table cellSpacing="0" cellPadding="0" width="600" border="0">
					<TR valign="middle">
						<TD colspan="2" class="daziti"><strong>供货单位</strong>:
							<asp:Label id="Label4" runat="server"></asp:Label></TD>
						<TD height="25" align="right"><strong>订货单号</strong>:
						</TD>
						<TD>
							<asp:label id="Label11" runat="server"></asp:label></TD>
					</TR>
					<TR valign="middle">
						<TD colspan="2" class="daziti" style="WIDTH: 143px"><strong>联系人</strong>:
					  <asp:label id="Label6" runat="server"></asp:label></TD>
						<TD height="25" align="right"><strong>联系电话</strong>:</TD>
						<TD>
							<asp:label id="Label13" runat="server"></asp:label></TD>
					</TR>
					<TR valign="middle">
						<TD class="daziti" style="WIDTH: 143px"></TD>
						<TD style="WIDTH: 164px"></TD>
						<TD height="25"></TD>
						<TD></TD>
					</TR>
					<TR valign="middle">
						<TD colspan="2" nowrap class="daziti"><strong>订货单位（乙方）</strong>:威海昌泰电子有限公司</TD>
						<TD height="31" align="right"><strong>经办人</strong>:</TD>
						<TD>
							<asp:label id="Label14" runat="server"></asp:label></TD>
					</TR>
					<TR valign="middle">
						<TD colspan="2" nowrap class="daziti"><strong>地址</strong>:
					  <asp:label id="Label16" runat="server">威海海滨北路8-3</asp:label></TD>
						<TD height="25" align="right"><strong>联系电话</strong>:</TD>
						<TD>
							<asp:label id="Label15" runat="server">0631-5213686</asp:label></TD>
					</TR>
				</table>
				<table borderColor="#000000" cellSpacing="0" cellPadding="0" width="600" border="0">
					<tr>
						<td>
							<table cellSpacing="0" cellPadding="0" width="100%" align="center" border="0">
								<tr>
									<td colSpan="13">
										<P><FONT face="宋体"></FONT>&nbsp;</P>
										<P><FONT face="宋体">今向甲方订购如下产品：</FONT></P>
									</td>
								</tr>
								<TR>
									<TD colSpan="13"><div align="right">单位：元</div>
									</TD>
								</TR>
								<tr>
									<td class="daziti" colSpan="13"><asp:datagrid id="Datagrid1" runat="server" CssClass="title3" Width="500px" Height="0px" BorderColor="#000066"
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
												<asp:BoundColumn Visible="False" DataField="cpid" HeaderText="产品编号">
													<HeaderStyle Wrap="False" HorizontalAlign="Center"></HeaderStyle>
												</asp:BoundColumn>
												<asp:BoundColumn DataField="产品名称" HeaderText="产品名称">
													<HeaderStyle Wrap="False" HorizontalAlign="Center" Width="200px"></HeaderStyle>
												</asp:BoundColumn>
												<asp:BoundColumn DataField="入库数量" HeaderText="数量" DataFormatString="{0:F0}">
													<HeaderStyle Wrap="False"></HeaderStyle>
													<ItemStyle Wrap="False" HorizontalAlign="Center"></ItemStyle>
													<FooterStyle Wrap="False" HorizontalAlign="Center" VerticalAlign="Middle"></FooterStyle>
												</asp:BoundColumn>
												<asp:BoundColumn DataField="进货价" HeaderText="商品单价" DataFormatString="{0:F2}">
													<HeaderStyle Wrap="False"></HeaderStyle>
													<ItemStyle Wrap="False" HorizontalAlign="Right"></ItemStyle>
													<FooterStyle Wrap="False" HorizontalAlign="Center" VerticalAlign="Middle"></FooterStyle>
												</asp:BoundColumn>
												<asp:BoundColumn DataField="金额" HeaderText="总金额" DataFormatString="{0:F2}">
													<HeaderStyle Wrap="False"></HeaderStyle>
													<ItemStyle Wrap="False" HorizontalAlign="Right"></ItemStyle>
													<FooterStyle Wrap="False" HorizontalAlign="Right" VerticalAlign="Middle"></FooterStyle>
												</asp:BoundColumn>
											</Columns>
											<PagerStyle Visible="False"></PagerStyle>
										</asp:datagrid></td>
								</tr>
							</table>
							<table cellSpacing="1" cellPadding="3" width="600" border="0">
								<tr class="biaoti" bgColor="#ffffff">
									<td class="daziti" height="25">补充说明:</td>
									<TD class="daziti">&nbsp;&nbsp;
									</TD>
								</tr>
								<tr valign="bottom" bgColor="#ffffff" class="biaoti">
								  <td height="200" colSpan="2" class="daziti">
										<asp:datagrid id="Datagrid2" runat="server" Visible="False" AutoGenerateColumns="False" Height="0px"
											Width="500px" CssClass="title3" ShowHeader="False">
											<SelectedItemStyle BorderColor="#FFC0C0"></SelectedItemStyle>
											<ItemStyle HorizontalAlign="Center"></ItemStyle>
											<HeaderStyle Font-Names="宋体" HorizontalAlign="Center"></HeaderStyle>
											<FooterStyle Font-Size="12pt"></FooterStyle>
											<Columns>
												<asp:BoundColumn HeaderText="序号">
													<HeaderStyle Width="40px"></HeaderStyle>
												</asp:BoundColumn>
												<asp:BoundColumn DataField="说明" HeaderText="说明">
													<HeaderStyle Wrap="False"></HeaderStyle>
													<ItemStyle HorizontalAlign="Left"></ItemStyle>
													<FooterStyle Wrap="False" HorizontalAlign="Center" VerticalAlign="Middle"></FooterStyle>
												</asp:BoundColumn>
											</Columns>
											<PagerStyle Visible="False"></PagerStyle>
								  </asp:datagrid>								  </td>
								</tr>
							</table>
						</td>
					</tr>
				</table>
				<table cellSpacing="0" cellPadding="0" width="600" align="center" border="0">
					<tr>
						<td height="25" class="daziti" style="WIDTH: 600px"><table width="100%" border="0" cellspacing="0" cellpadding="0">
								<tr align="right" valign="bottom">
								  <td height="30" colspan="3"><table width="202" border="0" cellpadding="0" cellspacing="2" bordercolor="#000000">
                                    <tr>
                                      <td nowrap><strong>增值税发票开票信息:</strong></td>
                                    </tr>
                                    <tr>
                                      <td nowrap><span class="style4">纳税人识别号：371002747839269</span></td>
                                    </tr>
                                    <tr>
                                      <td nowrap><span class="style4">地址：威海市海滨北路8-3号</span></td>
                                    </tr>
                                    <tr>
                                      <td nowrap><span class="style4">开户行：中国银行威海市环翠支行</span></td>
                                    </tr>
                                    <tr>
                                      <td nowrap><span class="style4">帐号: 223401108897</span></td>
                                    </tr>
                                    <tr>
                                      <td nowrap>&nbsp;</td>
                                    </tr>
                                  </table></td>
						  </tr>
								<tr>
									<td height="30">&nbsp;供货单位：
										<asp:Label id="Label17" runat="server"></asp:Label></td>
									<td>&nbsp;</td>
									<td><div align="right">订货单位：威海昌泰电子有限公司</div>
									</td>
								</tr>
								<tr>
									<td height="30">（公章或合同章）</td>
									<td>&nbsp;</td>
									<td><div align="right">（公章或合同章）</div>
									</td>
								</tr>
								<tr>
								  <td height="30">&nbsp;</td>
								  <td>&nbsp;</td>
								  <td align="right"><div align="right"></div></td>
						  </tr>
								<tr>
									<td height="30">&nbsp;
										<asp:Label id="Label18" runat="server"></asp:Label></td>
									<td>&nbsp;</td>
									<td><div align="right">
											<asp:Label id="Label19" runat="server"></asp:Label></div>
									</td>
								</tr>
							</table>
							<span class="daziti"></span>
						</td>
					</tr>
				</table>
			</div>
		</form>
	</body>
</HTML>
