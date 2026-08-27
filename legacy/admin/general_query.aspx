<%@ Page language="c#" Codebehind="general_query.aspx.cs" AutoEventWireup="false" Inherits="jxc.admin.general_query" %>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN" >
<HTML>
	<HEAD>
		<title>网员发展汇兑表</title>
		<meta name="GENERATOR" Content="Microsoft Visual Studio .NET 7.1">
		<meta name="CODE_LANGUAGE" Content="C#">
		<meta name="vs_defaultClientScript" content="JavaScript">
		<meta name="vs_targetSchema" content="http://schemas.microsoft.com/intellisense/ie5">
		<link href="../../css/style.css" rel="stylesheet" type="text/css">
		<SCRIPT LANGUAGE="javascript">
			//指定页面区域内容导入Excel
			function AllAreaExcel() 
			{
			var oXL = new ActiveXObject("Excel.Application"); 
			var oWB = oXL.Workbooks.Add(); 
			var oSheet = oWB.ActiveSheet;  
			var sel=document.body.createTextRange();
			sel.moveToElementText(PrintA);
			sel.select();
			sel.execCommand("Copy");
			oSheet.Paste();
			oXL.Visible = true;
			}
			//指定页面区域“单元格”内容导入Excel
			function CellAreaExcel() 
			{
			var oXL = new ActiveXObject("Excel.Application"); 
			var oWB = oXL.Workbooks.Add(); 
			var oSheet = oWB.ActiveSheet; 
			var Lenr = Datagrid1.rows.length;
			for (i=0;i<Lenr;i++) 
			{ 
			var Lenc = Datagrid1.rows(i).cells.length; 
			for (j=0;j<Lenc;j++) 
			{ 
				oSheet.Cells(i+1,j+1).value = Datagrid1.rows(i).cells(j).innerText; 
			} 
			} 
			oXL.Visible = true; 
			}

			//指定页面区域内容导入Word
			function AllAreaWord()
			{
			var oWD = new ActiveXObject("Word.Application");
			var oDC = oWD.Documents.Add("",0,1);
			var oRange =oDC.Range(0,1);
			var sel = document.body.createTextRange();
			sel.moveToElementText(PrintA);
			sel.select();
			sel.execCommand("Copy");
			oRange.Paste();
			oWD.Application.Visible = true;
			//window.close();
			}
		</SCRIPT>
	</HEAD>
	<body MS_POSITIONING="GridLayout">
		<form id="Form1" method="post" runat="server">
			<table cellpadding="0" cellspacing="0" border="0" width="100%" height="50" align="center">
				<tr>
					<td width="556" background="/image/title.gif">
						<table cellpadding="0" cellspacing="0" border="0" width="100%">
							<tr>
								<td height="1"></td>
							</tr>
							<tr>
								<td width="80"></td>
								<td><font face="隶书" size="5">网员发展查询</font></td>
							</tr>
						</table>
					</td>
					<td width="250"></td>
				</tr>
			</table>
			<table cellpadding="0" cellspacing="0" border="0" width="100%">
				<tr>
					<td width="80" style="WIDTH: 80px">
						起时间：
					</td>
					<td>
						<asp:textbox id="begin" runat="server" Width="80" CssClass="inputcss" onfocus="calendar()"></asp:textbox>
					</td>
					<td width="80" style="WIDTH: 80px">
						止时间：
					</td>
					<td>
						<asp:textbox id="enddate" runat="server" CssClass="inputcss" Width="80" onfocus="calendar()"></asp:textbox>
					</td>
					<td align="right">
						<asp:Button id="Button1" runat="server" Text="查询" CssClass="buttoncss" Width="78px"></asp:Button>
						&nbsp;<INPUT type="button" value="导EXCEL" class="buttoncss" onclick="CellAreaExcel();">
						</td>
				</tr>
			</table>
			<asp:Label id="Label1" style="Z-INDEX: 101; LEFT: 8px; POSITION: absolute; TOP: 88px" runat="server"></asp:Label>
		</form>
	</body>
</HTML>
                                
                                 
