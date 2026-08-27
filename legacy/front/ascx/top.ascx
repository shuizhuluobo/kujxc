<%@ Control Language="c#" AutoEventWireup="false" Codebehind="top.ascx.cs" Inherits="health.front.ascx.top" TargetSchema="http://schemas.microsoft.com/intellisense/ie5"%>
<table height="30" cellSpacing="0" cellPadding="0" width="760" align="center" border="0">
	<tr>
		<td align="left" width="160">
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
		</td>
		<td align="right" background="images/top1.jpg">
			<table style="FONT-SIZE: 12px; COLOR: #666666" height="20" cellSpacing="0" cellPadding="0"
				width="380" border="0">
				<tr>
					<td align="right">
						<span class="red">□<a class="TopDefault" href="javascript:window.external.AddFavorite('http://www.xctks.net','北京西城区体科所')">加入收藏</a>
							□<a class="TopDefault" href="#" onclick="this.style.behavior='url(#default#homepage)';this.setHomePage('http://www.xctks.net');">设为首页</a>
						</span>
					</td>
				</tr>
			</table>
		</td>
	</tr>
</table>
