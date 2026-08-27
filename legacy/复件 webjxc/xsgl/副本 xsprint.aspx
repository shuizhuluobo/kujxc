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
	</HEAD>
	<body MS_POSITIONING="GridLayout">
		<form id="Form1" method="post" runat="server">
			<div class="biaoti" align="center">
				<p>- - -出 &nbsp;&nbsp;库 &nbsp;&nbsp;单- - -</p>
				<table cellSpacing="0" cellPadding="0" width="600" border="0">
					<tr>
						<td class="daziti">单据编号:
							<asp:label id="Label11" runat="server">Label</asp:label></td>
						<td>&nbsp;</td>
						<td height="25">
							<div align="right"><span class="daziti">销 售 店 名:
									<asp:label id="Label12" runat="server">Label</asp:label></span></div>
						</td>
						<td>&nbsp;</td>
					</tr>
				</table>
				<table borderColor="#000000" cellSpacing="0" cellPadding="0" width="600" border="1">
					<tr>
						<td>
							<table cellSpacing="0" cellPadding="0" width="100%" align="center" border="0">
								<tr>
									<td colSpan="13"><FONT face="宋体"></FONT></td>
								</tr>
								<tr>
									<td class="daziti" colSpan="13"><asp:datagrid id="Datagrid1" runat="server" CssClass="title3" Width="500px" Height="0px" BorderColor="#000066"
											AutoGenerateColumns="False">
											<SelectedItemStyle BorderColor="#FFC0C0" BackColor="White"></SelectedItemStyle>
											<ItemStyle HorizontalAlign="Center"></ItemStyle>
											<HeaderStyle Font-Names="宋体" HorizontalAlign="Center" ForeColor="Purple"></HeaderStyle>
											<Columns>
												<asp:BoundColumn HeaderText="序号">
													<HeaderStyle Width="40px"></HeaderStyle>
												</asp:BoundColumn>
												<asp:BoundColumn DataField="cpid" HeaderText="产品编号">
													<HeaderStyle Wrap="False" HorizontalAlign="Center"></HeaderStyle>
												</asp:BoundColumn>
												<asp:BoundColumn DataField="产品名称" HeaderText="产品名称">
													<HeaderStyle Wrap="False" HorizontalAlign="Center" Width="200px"></HeaderStyle>
												</asp:BoundColumn>
												<asp:BoundColumn DataField="销售数量" HeaderText="数量" DataFormatString="{0:F2}">
													<ItemStyle HorizontalAlign="Center"></ItemStyle>
												</asp:BoundColumn>
												<asp:BoundColumn DataField="零售价" HeaderText="单价"></asp:BoundColumn>
												<asp:BoundColumn DataField="金额" HeaderText="金额" DataFormatString="{0:F2}"></asp:BoundColumn>
											</Columns>
											<PagerStyle Visible="False"></PagerStyle>
										</asp:datagrid></td>
								</tr>
							</table>
							<table cellSpacing="1" cellPadding="3" width="600" border="0">
								<tr class="biaoti" bgColor="#ffffff">
									<td class="daziti" colSpan="2"></td>
								</tr>
								<tr class="biaoti" bgColor="#ffffff">
									<td class="daziti" style="HEIGHT: 18px" height="18">&nbsp;&nbsp;已付定金:<FONT face="宋体">
											<asp:label id="Label1" runat="server">Label</asp:label></FONT>元
									</td>
									<td class="daziti" style="HEIGHT: 18px">&nbsp;&nbsp;总计金额：
										<asp:label id="Label2" runat="server">Label</asp:label>元</td>
								</tr>
								<tr class="biaoti" bgColor="#ffffff">
									<td class="daziti" style="HEIGHT: 28px" noWrap>
										<table cellSpacing="0" cellPadding="0" width="100%" border="0">
											<tr>
												<td class="daziti" noWrap>&nbsp;&nbsp;客户签字：</td>
												<td vAlign="bottom" align="left">
													<hr width="120" SIZE="1">
												</td>
											</tr>
										</table>
									</td>
									<td class="daziti" style="HEIGHT: 28px" noWrap>&nbsp;&nbsp;销售日期：
										<asp:label id="Label3" runat="server">Label</asp:label><asp:label id="Label5" runat="server" Visible="False">Label</asp:label></td>
								</tr>
								<tr class="biaoti" bgColor="#ffffff">
									<td class="daziti" height="25">&nbsp;&nbsp;电话:
										<asp:label id="Label8" runat="server" Visible="False">Label</asp:label></td>
									<td class="daziti">&nbsp; 备注:
										<asp:label id="Label7" runat="server">Label</asp:label></td>
								</tr>
								<tr class="biaoti" bgColor="#ffffff">
									<td class="daziti" colSpan="2" height="25">&nbsp;&nbsp;尊敬的客户：请您仔细核对此单内容，并签字确认，我们将严守承诺。</td>
								</tr>
							</table>
						</td>
					</tr>
				</table>
				<table cellSpacing="0" cellPadding="0" width="600" align="center" border="0">
					<tr>
						<td class="daziti" style="WIDTH: 380px" height="30">经 办 人:
							<asp:label id="Label9" runat="server">Label</asp:label></td>
						<td><span class="daziti">电话:
								<asp:label id="Label10" runat="server">Label</asp:label></span></td>
						<td>&nbsp;</td>
						<td>&nbsp;</td>
					</tr>
				</table>
			</div>
		</form>
	</body>
</HTML>
