<%@ Control Language="c#" AutoEventWireup="false" Codebehind="head.ascx.cs" Inherits="health.front.ascx.head" TargetSchema="http://schemas.microsoft.com/intellisense/ie5"%>
<link rel="stylesheet" href="images/style.css" type="text/css" />
<style type="text/css">
<!--
.style1 {
	font-size: 1.2em;
	color: #660033;
}
.style10 {
	font-size: 1.6em;
	color: #660000;
	font-family: "黑体";
}
.style12 {font-size: 12px; color: #000000; }
.style14 {color: #FF9148}
.style15 {color: #FF00FF}
-->
</style>
<div class="content" style="border-right:solid 1px #DEEEF3;border-left:solid 1px #DEEEF3">
	<div class="top_info">
		<div class="top_info_right">
			<p class="title3"><A href="#" onclick="this.style.behavior='url(#default#homepage)';this.setHomePage('www.rc315.cn');">设为首页</A>
				<a href="javascript:window.external.AddFavorite('http://www.rc315.cn', '“荣成工商局红盾信息网”&quot;/www.rc315.cn')">
					收藏本站</a>
			</p>
		</div>
		<div class="top_info_left">
			<p class="title3">
			<p class="title3">
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
			</p>
		</div>
	</div>
</div>
<div>
	<OBJECT codeBase="http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=6,0,29,0"
		height="113" width="780" classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" VIEWASTEXT>
		<PARAM NAME="_cx" VALUE="20108">
		<PARAM NAME="_cy" VALUE="3175">
		<PARAM NAME="FlashVars" VALUE="">
		<PARAM NAME="Movie" VALUE="images/hz.swf">
		<PARAM NAME="Src" VALUE="images/hz.swf">
		<PARAM NAME="WMode" VALUE="Window">
		<PARAM NAME="Play" VALUE="-1">
		<PARAM NAME="Loop" VALUE="-1">
		<PARAM NAME="Quality" VALUE="High">
		<PARAM NAME="SAlign" VALUE="">
		<PARAM NAME="Menu" VALUE="-1">
		<PARAM NAME="Base" VALUE="">
		<PARAM NAME="AllowScriptAccess" VALUE="always">
		<PARAM NAME="Scale" VALUE="ShowAll">
		<PARAM NAME="DeviceFont" VALUE="0">
		<PARAM NAME="EmbedMovie" VALUE="0">
		<PARAM NAME="BGColor" VALUE="">
		<PARAM NAME="SWRemote" VALUE="">
		<PARAM NAME="MovieData" VALUE="">
		<PARAM NAME="SeamlessTabbing" VALUE="1">
		<embed src="images/hz.swf" quality="high" pluginspage="http://www.macromedia.com/go/getflashplayer"
			type="application/x-shockwave-flash" width="780" height="113"> </embed>
	</OBJECT>
</div>
<div class="bar" style="width:780px">
	<ul>
		<li class="browse_category">
		</li>
		<li>
			<A accessKey="i" href="default.aspx">首页</A>
		</li>
		<li>
			<A accessKey="m" href="../rchdo/word/index.asp">办事指南</A>
		</li>
		<li>
			<A accessKey="m" href="../rchdo/zwgk/htm/xzcs.htm">政务公开</A>
		</li>
		<li>
			<A accessKey="p" href="default.aspx">网员专区</A>
		</li>
		<li>
			<A accessKey="s" href="../rchdo/zcfg/htm/fg.htm">法律法规</A>
		</li>
		<li>
			<A accessKey="s" href="default.aspx">信息查询</A>
		</li>
		<li>
			<A accessKey="s" href="more.aspx">供求信息</A>
		</li>
		<li>
			<A accessKey="s" href="list_good.aspx">产品信息</A>
		</li>
	</ul>
</div>
<!-- -->