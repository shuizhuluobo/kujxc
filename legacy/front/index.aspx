<%@ Register TagPrefix="uc1" TagName="qlogon" Src="ascx/qlogon.ascx" %>
<%@ Register TagPrefix="uc1" TagName="footer" Src="ascx/footer.ascx" %>
<%@ Register TagPrefix="uc1" TagName="listgonggao" Src="../zxwd/listgonggao.ascx" %>
<%@ Register TagPrefix="uc1" TagName="listzxt" Src="../zxwd/listzxt.ascx" %>
<%@ Register TagPrefix="uc1" TagName="gwytz" Src="../zxwd/gwytz.ascx" %>
<%@ Register TagPrefix="uc1" TagName="kykt" Src="../zxwd/kykt.ascx" %>
<%@ Page language="c#" Codebehind="index.aspx.cs" AutoEventWireup="false" Inherits="health.front.index" %>
<%@ Register TagPrefix="uc1" TagName="top" Src="ascx/top.ascx" %>
<%@ Register TagPrefix="uc1" TagName="ssff" Src="../zxwd/ssff.ascx" %>
<%@ Register TagPrefix="uc1" TagName="listlink" Src="../zxwd/listlink.ascx" %>
<%@ Register TagPrefix="uc1" TagName="menus" Src="ascx/menus.ascx" %>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN" >
<HTML>
	<HEAD>
		<title>欢迎访问西城区体科所网站</title>
		<meta content="Microsoft Visual Studio .NET 7.1" name="GENERATOR">
		<meta content="C#" name="CODE_LANGUAGE">
		<meta content="JavaScript" name="vs_defaultClientScript">
		<meta content="http://schemas.microsoft.com/intellisense/ie5" name="vs_targetSchema">
		<LINK href="../css/sakura.css" type="text/css" rel="stylesheet">
	</HEAD>
	<body MS_POSITIONING="GridLayout" topmargin="0">
		<form id="Form1" method="post" runat="server">
			<uc1:top id="Top1" runat="server"></uc1:top>
			<table cellSpacing="0" cellPadding="0" width="770" align="center" border="0">
				<tr>
					<td vAlign="top" width="185" height="249">
						<table cellSpacing="0" cellPadding="0" width="100%" border="0">
							<tr>
								<td><IMG src="zhu/1.jpg" border="0"></td>
							</tr>
						</table>
						<table cellSpacing="0" cellPadding="0" width="100%" border="0">
							<tr>
								<td><IMG src="zhu/huiyuandenglu.jpg" border="0"></td>
							</tr>
						</table>
						<table cellSpacing="0" cellPadding="0" width="100%" border="0">
							<tr>
								<td><uc1:qlogon id="Qlogon1" runat="server"></uc1:qlogon></td>
							</tr>
						</table>
						<table cellSpacing="0" cellPadding="0" width="100%" border="0">
							<tr>
								<td><IMG src="zhu/zhanneigonggao.jpg"></td>
							</tr>
						</table>
						<table height="136" cellSpacing="0" cellPadding="0" width="100%" bgColor="#f2efe6" border="0">
							<tr>
								<td vAlign="top" height="120">
									<marquee onmouseover="if (document.all!=null){this.stop()}" onmouseout="if (document.all!=null){this.start()}"
										scrollAmount="1" scrollDelay="5" direction="up" height="120"><uc1:listgonggao id="Listgonggao1" runat="server"></uc1:listgonggao></marquee>
								</td>
							</tr>
							<tr>
								<td align="right"><A href="machine.aspx?id=32&amp;ifend=0" target="_blank">更多</A></td>
							</tr>
						</table>
						<table cellSpacing="0" cellPadding="0" width="100%" border="0">
							<tr>
								<td><IMG src="zhu/youqinglianjie.jpg"></td>
							</tr>
						</table>
						<table cellSpacing="0" cellPadding="0" width="100%" bgColor="#f5eee2" border="0">
							<tr>
								<td height="2"></td>
							</tr>
							<tr>
								<td vAlign="top" colSpan="1" height="150" rowSpan="1"><uc1:listlink id="Listlink1" runat="server"></uc1:listlink></td>
							</tr>
							<tr>
								<td align="right"><A href="listlinkall.aspx" target="_blank">更多</A></td>
							</tr>
						</table>
					</td>
					<td vAlign="top" width="543">
						<table cellSpacing="0" cellPadding="0" width="100%" border="0">
							<tr>
								<td><IMG src="zhu/2.jpg" border="0"></td>
							</tr>
						</table>
						<table cellSpacing="0" cellPadding="0" width="100%" border="0">
							<tr>
								<td><uc1:menus id="Menus1" runat="server"></uc1:menus></td>
							</tr>
						</table>
						<table cellSpacing="0" cellPadding="0" width="100%" border="0">
							<tr>
								<td height="5"></td>
							</tr>
						</table>
						<table cellSpacing="0" cellPadding="0" width="100%" border="0">
							<tr>
								<td width="10"></td>
								<td vAlign="top" align="right" background="zhu/jieshao.jpg" height="22"><A href="machine.aspx?id=5&amp;ifend=0&amp;des=体科所介绍"><IMG src="zhu/more.gif" border="0"></A>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
								</td>
							</tr>
						</table>
						<table height="136" cellSpacing="0" cellPadding="0" width="100%" border="0">
							<tr>
								<td width="10">
								<td>
									<table cellSpacing="0" cellPadding="0" width="100%" border="0">
										<tr>
											<td colSpan="3" height="6"></td>
										</tr>
										<tr>
											<td vAlign="middle" align="center" width="200"><IMG height="100" src="images/first.jpg" width="190"></td>
											<td width="10"></td>
											<td style="LINE-HEIGHT: 18px"><A href="two.aspx?id=5&amp;actid=57&amp;name=体科所介绍&amp;des=体科所介绍" target="_self">西城区体育科研所成立于1992年3月10日，经过十几年的发展，规模壮大，设备先进，一直保持在北京市先列。现在它已从原有的“一所”发展为“一所、两中心”，即：西城区体育科研所、西城区国民体质检测中心、青少年运动员选材测试中心，并承担着竞技体育、群众体育、课题研究这三大方面、多项内容的体育研究工作，为西城区体育事业的发展努力奋斗着。
												</A>
											</td>
										</tr>
									</table>
								</td>
							</tr>
						</table>
						<table style="WIDTH: 543px; HEIGHT: 15px" cellSpacing="0" cellPadding="0" width="543" border="0">
							<tr>
								<td height="5"></td>
							</tr>
						</table>
						<table cellSpacing="0" cellPadding="0" width="100%" border="0">
							<tr>
								<td width="10"></td>
								<td vAlign="top" width="257" background="zhu/gongwuyuantizhi.jpg" height="169">
									<table cellSpacing="0" cellPadding="0" width="100%" border="0">
										<tr>
											<td align="right" colSpan="2" height="35"><A href="machine.aspx?id=11&amp;ifend=0&amp;des=公务员体质"><IMG src="zhu/more.gif" border="0"></A>&nbsp;</td>
										</tr>
										<tr>
											<td width="5"></td>
											<td><uc1:gwytz id="Gwytz1" runat="server"></uc1:gwytz></td>
										</tr>
									</table>
								</td>
								<td width="10"></td>
								<td vAlign="top" width="257" background="zhu/gongzuodongtai.jpg" height="169">
									<table cellSpacing="0" cellPadding="0" width="100%" border="0">
										<tr>
											<td align="right" colSpan="2" height="35"><A href="machine.aspx?id=18&amp;ifend=0&amp;des=工作动态"><IMG src="zhu/more.gif" border="0"></A>&nbsp;
											</td>
										</tr>
										<tr>
											<td width="5"></td>
											<td><uc1:ssff id="Ssff1" runat="server"></uc1:ssff></td>
										</tr>
									</table>
								</td>
								<td width="9"></td>
							</tr>
						</table>
						<table cellSpacing="0" cellPadding="0" width="100%" border="0">
							<tr>
								<td height="5"></td>
							</tr>
						</table>
						<table cellSpacing="0" cellPadding="0" width="100%" border="0">
							<tr>
								<td width="10"></td>
								<td vAlign="top" width="257" background="zhu/keyanketi.jpg" height="169">
									<table cellSpacing="0" cellPadding="0" width="100%" border="0">
										<tr>
											<td align="right" colSpan="2" height="35"><A href="machine.aspx?id=43&amp;ifend=0&amp;des=科研课题"><IMG src="zhu/more.gif" border="0"></A>&nbsp;
											</td>
										</tr>
										<tr>
											<td width="92"></td>
											<td><uc1:kykt id="Kykt1" runat="server"></uc1:kykt></td>
										</tr>
									</table>
								</td>
								<td width="10"></td>
								<td vAlign="top" width="257" background="zhu/zixunwenda.jpg" height="169">
									<table cellSpacing="0" cellPadding="0" width="100%" border="0">
										<tr>
											<td align="right" colSpan="2" height="40"><A href="wyzx.aspx" target="_blank">我要咨询</A>&nbsp;<A href="listzxtall.aspx?des=咨询问答" target="_blank"><IMG src="zhu/more.gif" border="0"></A>&nbsp;
											</td>
										</tr>
										<tr>
											<td width="5"></td>
											<td><uc1:listzxt id="Listzxt1" runat="server"></uc1:listzxt></td>
										</tr>
									</table>
								</td>
								<td width="9"></td>
							</tr>
						</table>
					</td>
					<td vAlign="top" width="42">
						<table cellSpacing="0" cellPadding="0" width="100%" border="0">
							<tr>
								<td><IMG src="zhu/4.jpg"></td>
							</tr>
						</table>
					</td>
				</tr>
			</table>
			<uc1:footer id="Footer1" runat="server"></uc1:footer></form>
	</body>
</HTML>
