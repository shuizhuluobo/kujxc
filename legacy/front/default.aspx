<%@ Register TagPrefix="uc1" TagName="listzxt" Src="../zxwd/listzxt.ascx" %>
<%@ Register TagPrefix="uc1" TagName="kykt" Src="../zxwd/kykt.ascx" %>
<%@ Register TagPrefix="uc1" TagName="pjbz" Src="../zxwd/pjbz.ascx" %>
<%@ Page language="c#" Codebehind="default.aspx.cs" AutoEventWireup="false" Inherits="health.front._default" %>
<%@ Register TagPrefix="uc1" TagName="ssff" Src="../zxwd/ssff.ascx" %>
<%@ Register TagPrefix="uc1" TagName="menus" Src="ascx/menus.ascx" %>
<%@ Register TagPrefix="uc1" TagName="listlink" Src="../zxwd/listlink.ascx" %>
<%@ Register TagPrefix="uc1" TagName="listgzdt" Src="../zxwd/listgzdt.ascx" %>
<%@ Register TagPrefix="uc1" TagName="qlogon" Src="ascx/qlogon.ascx" %>
<%@ Register TagPrefix="uc1" TagName="listgonggao" Src="../zxwd/listgonggao.ascx" %>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN" >
<HTML>
	<HEAD>
		<title>西城区体育科研所</title>
		<LINK href="sakura.css" type="text/css" rel="stylesheet">
		<meta content="Microsoft Visual Studio .NET 7.1" name="GENERATOR">
		<meta content="C#" name="CODE_LANGUAGE">
		<meta content="JavaScript" name="vs_defaultClientScript">
		<meta content="http://schemas.microsoft.com/intellisense/ie5" name="vs_targetSchema">
		<style type="text/css">BODY {
	FONT-SIZE: 12px; COLOR: #333333; FONT-FAMILY: 宋体
}
TD {
	FONT-SIZE: 12px; COLOR: #333333; FONT-FAMILY: 宋体
}
TH {
	FONT-SIZE: 12px; COLOR: #333333; FONT-FAMILY: 宋体
}
A:link {
	COLOR: #0000cc
}
A:visited {
	COLOR: #0000cc
}
A:hover {
	COLOR: #cc0000
}
A:active {
	COLOR: #cc0000
}
BODY {
	MARGIN-TOP: 2px
}
.style1 {
	LINE-HEIGHT: 20px
}
.style2 {
	COLOR: #ffffff; TEXT-DECORATION: none
}
.style3 {
	COLOR: #ffffff
}
.style4 {
	FONT-FAMILY: Verdana, Arial, Helvetica, sans-serif
}
.form1 {
	BORDER-RIGHT: #99ccff 1px solid; BORDER-TOP: #99ccff 1px solid; BORDER-LEFT: #99ccff 1px solid; WIDTH: 100px; BORDER-BOTTOM: #99ccff 1px solid; HEIGHT: 15px; BACKGROUND-COLOR: #ffffff
}
.form2 {
	BORDER-RIGHT: #99ccff 1px solid; BORDER-TOP: #99ccff 1px solid; BORDER-LEFT: #99ccff 1px solid; BORDER-BOTTOM: #99ccff 1px solid
}
.style5 {
	COLOR: #990000; FONT-FAMILY: Verdana, Arial, Helvetica, sans-serif
}
.style6 {
	COLOR: #0000cc; TEXT-DECORATION: none
}
.style7 {
	COLOR: #666666
}
.style8 {
	COLOR: #cc0000
}
.style10 {
	FONT-WEIGHT: bold; PADDING-BOTTOM: 0px; COLOR: #4d4d4d; PADDING-TOP: 2px; FONT-FAMILY: "宋体"
}
.style12 {
	COLOR: #003399; TEXT-DECORATION: none
}
.form3 {
	BORDER-RIGHT: #99ccff 1px solid; BORDER-TOP: #99ccff 1px solid; BORDER-LEFT: #99ccff 1px solid; WIDTH: 400px; BORDER-BOTTOM: #99ccff 1px solid; HEIGHT: 15px
}
.ButtonCss {
	BORDER-RIGHT: #93bee2 1px solid; BORDER-TOP: #93bee2 1px solid; FONT-SIZE: 9pt; BACKGROUND-IMAGE: url(../Images/bluebuttonbg.gif); BORDER-LEFT: #93bee2 1px solid; CURSOR: hand; COLOR: #006699; BORDER-BOTTOM: #93bee2 1px solid; FONT-STYLE: normal; FONT-FAMILY: "Tahoma", "宋体"; BACKGROUND-COLOR: #e8f4ff
}
.InputCss {
	BORDER-RIGHT: #93bee2 1px solid; BORDER-TOP: #93bee2 1px solid; FONT-SIZE: 9pt; BORDER-LEFT: #93bee2 1px solid; COLOR: #003399; BORDER-BOTTOM: #93bee2 1px solid; FONT-STYLE: normal; FONT-FAMILY: "宋体"
}
		</style>
	</HEAD>
	<body MS_POSITIONING="GridLayout">
		<form id="Form1" method="post" runat="server">
			<div align="center">
				<table width="760" border="0" align="center" cellpadding="0" cellspacing="0">
	<tr>
		<td width="490" height="29" valign="middle" >
					<script language="JavaScript" type="text/JavaScript">
							var day="";
							var month="";
							var ampm="";
							var ampmhour="";
							var myweekday="";
							var year="";
							mydate=new Date();
							myweekday=mydate.getDay();
							mymonth=mydate.getMonth()+1;
							myday= mydate.getDate();
							myyear= mydate.getYear();
							year=(myyear > 200) ? myyear : 1900 + myyear;
							if(myweekday == 0)
							weekday=" 星期日 ";
							else if(myweekday == 1)
							weekday=" 星期一 ";
							else if(myweekday == 2)
							weekday=" 星期二 ";
							else if(myweekday == 3)
							weekday=" 星期三 ";
							else if(myweekday == 4)
							weekday=" 星期四 ";
							else if(myweekday == 5)
							weekday=" 星期五 ";
							else if(myweekday == 6)
							weekday=" 星期六 ";
							document.write(year+"年"+mymonth+"月"+myday+"日 "+weekday);
												</script>
		
					<MARQUEE onmouseover="this.stop()" onmouseout="this.start()" scrollAmount="3" scrollDelay="1"
												width="300" align="center">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
											<font color=red>	欢迎访问西城区体科所网站</font>	</MARQUEE>				
					
				
		</td>
		<td width="270" align="right">
			<table cellpadding="0" cellspacing="0" border="0" width="100%">
				<tr>
					<td style="WIDTH: 68px"><a href="index.aspx"><img src="images/inner_r2_c13.jpg" border="0"></a></td>
					<td><a href="javascript:window.external.AddFavorite('http://www.xctks.net', '“西城区体科所”&quot;/www.xctks.net')"><img src="images/inner_r3_c13.jpg" width="95" height="27" border="0"></a></td>
					<td style="WIDTH: 101px"><a href="http://www.xctks.net/front/two.aspx?id=5"><img src="images/inner_r4_c13.jpg" width="93" height="27" border=0></a></td>
				</tr>
			</table>
		</td>
	</tr>
</table></td></tr></table>
				<table height="70" cellSpacing="0" cellPadding="0" width="760" align="center" background="/images/top.gif"
					border="0">
					<tr>
						<td height="25"></td>
					</tr>
				</table>
				<table cellSpacing="0" cellPadding="0" width="760" border="0" align="center">
					<tr>
						<td vAlign="middle" height="30"><uc1:menus id="Menus1" runat="server"></uc1:menus></td>
					</tr>
				</table>
				<table cellSpacing="0" cellPadding="0" width="760" align="center">
					<tr>
						<td height="4"></td>
					</tr>
				</table>
				<table style="BORDER-COLLAPSE: collapse" borderColor="#003399" cellSpacing="0" cellPadding="0"
					width="760" align="center" border="0">
					<tr>
						<td vAlign="top" align="left" width="191">
							<table style="BORDER-COLLAPSE: collapse" borderColor="#0066cc" cellSpacing="0" cellPadding="1"
								width="190" border="1">
								<tr>
									<td width="274" background="/images/bg.gif" bgColor="#0066cc" height="21">&nbsp; 
										&nbsp;<span class="style3">■&nbsp; <span class="style4">&nbsp;&nbsp;</span><strong> 通 行 
												证</strong></span></td>
								</tr>
								<tr>
									<td vAlign="middle" align="center" bgColor="#eefbff" height="133"><uc1:qlogon id="Qlogon1" runat="server"></uc1:qlogon></td>
								</tr>
							</table>
							<table cellSpacing="0" cellPadding="0" width="100%" border="0">
								<tr>
									<td height="2"></td>
								</tr>
							</table>
							<table style="BORDER-COLLAPSE: collapse" borderColor="#0066cc" cellSpacing="0" cellPadding="1"
								width="190" border="1">
								<tr>
									<td width="231" background="/images/bg.gif" bgColor="#0066cc" height="20">&nbsp; 
										&nbsp;<span class="style3">■ <span class="style4">&nbsp; <strong>站 内 公 告</strong></span><strong></strong></span></td>
								</tr>
								<tr>
									<td vAlign="top" align="left" bgColor="#eefbff" height="128">
										<table cellSpacing="0" cellPadding="0" width="180" border="0">
											<tr>
												<td width="180">&nbsp;</td>
											</tr>
											<tr>
												<td height="138">
													<marquee onmouseover="if (document.all!=null){this.stop()}" onmouseout="if (document.all!=null){this.start()}"
														scrollAmount="1" scrollDelay="5" direction="up" height="135"><uc1:listgonggao id="Listgonggao1" runat="server"></uc1:listgonggao></marquee>
												</td>
											</tr>
											<tr>
												<td>&nbsp;</td>
											</tr>
										</table>
									</td>
								</tr>
							</table>
							<table cellSpacing="0" cellPadding="0" width="190" border="0">
								<tr>
									<td height="2"></td>
								</tr>
							</table>
							<table style="WIDTH: 190px; BORDER-COLLAPSE: collapse; HEIGHT: 248px" borderColor="#0066cc"
								cellSpacing="0" cellPadding="1" width="190" border="1">
								<tr>
									<td width="231" background="/images/bg.gif" bgColor="#0066cc" height="20">&nbsp; 
										&nbsp;<span class="style3">■ <span class="style4">&nbsp; <strong>友 情 链 接</strong></span><strong></strong></span></td>
								</tr>
								<tr>
									<td vAlign="top" align="left" bgColor="#eefbff" height="170"><uc1:listlink id="Listlink1" runat="server"></uc1:listlink></td>
								</tr>
							</table>
						</td>
						<td vAlign="top" align="left" width="18"></td>
						<td vAlign="top" align="left" width="551">
							<table style="BORDER-COLLAPSE: collapse" borderColor="#bfe6ff" cellSpacing="0" cellPadding="1"
								width="550" border="1">
								<tr>
									<td class="style10" vAlign="middle" align="left" width="86%" bgColor="#bfe6ff" height="21"><IMG src="image/b7.gif" border="0">&nbsp;<span class="style8"><span class="style4"><span class="style10">体科所介绍</span></span></span>
									</td>
									<td class="style10" align="left" width="14%" bgColor="#bfe6ff">
										<div align="left"><A href="listnewsall.aspx"><span class="style12">更多...</span></A></div>
									</td>
								</tr>
								<tr>
									<td vAlign="middle" colSpan="2" height="200">
										<table cellSpacing="0" cellPadding="0" width="100%" border="0">
											<tr>
												<td vAlign="middle" align="center" width="195" height="175">
													<table cellSpacing="0" cellPadding="0" width="93%" border="0">
														<tr>
															<td class="style1" vAlign="top" align="left" height="34">
																<p><A href="http://www.ws365.cn/front/newsnr.aspx?newsid=172&amp;sfgk=1" target="_blank"><IMG height="91" src="image/left.jpg" width="80" align="left" border="0">
																		工作动态工作动态工作动态工作动态工作动态工作动态工作动态工作动态工作动态工作动态工作动态工作动态工作动态工作动态工作动态工作动态工作动态工作动态</A>...</p>
															</td>
														</tr>
													</table>
												</td>
												<td width="1" bgColor="#e7e7e7"></td>
												<td vAlign="middle" align="left" width="348">
													<table cellSpacing="0" cellPadding="1" width="100%" border="0">
														<tr>
															<td width="100%"><uc1:listgzdt id="Listgzdt1" runat="server"></uc1:listgzdt></td>
														</tr>
													</table>
												</td>
											</tr>
										</table>
									</td>
								</tr>
							</table>
							<table cellSpacing="0" cellPadding="0" width="550" border="0">
								<tr>
									<td vAlign="top" width="286" height="193">
										<table style="BORDER-COLLAPSE: collapse" borderColor="#bfe6ff" height="191" cellSpacing="0"
											cellPadding="1" width="286" border="1">
											<tr>
												<td class="style10" align="left" width="207" bgColor="#bfe6ff" height="21"><IMG src="image/b7.gif" border="0">&nbsp;<span class="style10"><span class="style4">
														</span>科 研 课 题</span></td>
												<td class="style10" align="left" width="69" bgColor="#bfe6ff"><A href="two.aspx?id=5&amp;actid=8"><span class="style12">更多...</span></A></td>
											</tr>
											<tr vAlign="middle">
												<td vAlign="top" colSpan="2" height="168">
													<table cellSpacing="0" cellPadding="0" width="100%" border="0">
														<tr>
															<td height="3"></td>
														</tr>
														<tr>
															<td></td>
														</tr>
													</table>
													<uc1:kykt id="Kykt1" runat="server"></uc1:kykt></td>
											</tr>
										</table>
									</td>
									<td width="3"></td>
									<td vAlign="top" width="263">
										<table style="BORDER-COLLAPSE: collapse" borderColor="#bfe6ff" height="191" cellSpacing="0"
											cellPadding="1" width="100%" border="1">
											<tr>
												<td class="style10" align="left" width="40%" bgColor="#bfe6ff" height="21"><IMG src="image/b7.gif" border="0">&nbsp;<span class="style10"><span class="style4">咨询问答</span></span></td>
												<td class="style10" align="left" width="60%" bgColor="#bfe6ff"><A href="wyzx.aspx" target="_blank">我要咨询</A>&nbsp;<A href="listzxtall.aspx" target="_blank">更多咨询</A>...</td>
											</tr>
											<tr vAlign="middle">
												<td vAlign="top" colSpan="2" height="168"><uc1:listzxt id="Listzxt2" runat="server"></uc1:listzxt></td>
											</tr>
										</table>
									</td>
								</tr>
							</table>
							<table height="4" cellSpacing="0" cellPadding="0" width="100%" align="center" border="0">
								<tr>
									<td></td>
								</tr>
							</table>
							<table cellSpacing="0" cellPadding="0" width="550" border="0">
								<tr>
									<td vAlign="top" width="286" height="193">
										<table style="BORDER-COLLAPSE: collapse" borderColor="#bfe6ff" height="191" cellSpacing="0"
											cellPadding="1" width="286" border="1">
											<tr>
												<td class="style10" align="left" width="207" bgColor="#bfe6ff" height="21"><IMG src="image/b7.gif" border="0">&nbsp;<span class="style10"><span class="style4">
														</span>工作动态</span></td>
												<td class="style10" align="left" width="69" bgColor="#bfe6ff"></td>
											</tr>
											<tr vAlign="middle">
												<td vAlign="top" align="center" colSpan="2" height="168">
													<table cellSpacing="0" cellPadding="0" width="100%" border="0">
														<tr>
															<td height="10"></td>
														</tr>
														<tr>
															<td align="left"><uc1:ssff id="Ssff1" runat="server"></uc1:ssff></td>
														</tr>
													</table>
												</td>
											</tr>
										</table>
									</td>
									<td width="3"></td>
									<td vAlign="top" width="263">
										<table style="BORDER-COLLAPSE: collapse" borderColor="#bfe6ff" height="191" cellSpacing="0"
											cellPadding="1" width="100%" border="1">
											<tr>
												<td class="style10" align="left" width="81%" bgColor="#bfe6ff" height="21"><IMG src="image/b7.gif" border="0">&nbsp;
													<span class="style4">体质测试中心介绍 </span>
												</td>
												<td class="style10" align="left" width="29%" bgColor="#bfe6ff"><A href="#"></A></td>
											</tr>
											<tr vAlign="middle">
												<td vAlign="top" align="center" colSpan="2" height="168">
													<table cellSpacing="0" cellPadding="0" width="100%" border="0">
														<tr>
															<td colSpan="2" height="10"></td>
														</tr>
														<tr>
															<td><uc1:pjbz id="Pjbz1" runat="server"></uc1:pjbz></td>
														</tr>
													</table>
												</td>
											</tr>
										</table>
									</td>
								</tr>
							</table>
						</td>
					</tr>
				</table>
			</div>
		</form>
	</body>
</HTML>
