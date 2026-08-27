<%@ Page language="c#" Codebehind="goods_details.aspx.cs" AutoEventWireup="false" validateRequest="false" Inherits="jxc.admin.goods_details" %>
<%@ Register TagPrefix="ftb" Namespace="FreeTextBoxControls" Assembly="FreeTextBox" %>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN" >
<HTML>
	<HEAD>
		<title>修改商品属性</title>
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
		<div align="left">
			<form id="Post" method="post" runat="server">
				<FONT face="宋体">
					<TABLE class="title3" id="Table1" cellSpacing="0" cellPadding="0" width="100%" border="0">
						<TR>
							<TD style="WIDTH: 91px; HEIGHT: 17px">
							审核
							<TD style="HEIGHT: 17px">
								<asp:DropDownList id="pass" runat="server">
									<asp:ListItem Value="-1">请选择</asp:ListItem>
									<asp:ListItem Value="0">未审核</asp:ListItem>
									<asp:ListItem Value="100">已审核</asp:ListItem>
								</asp:DropDownList></TD>
							<td style="WIDTH: 134px"></td>
							</TD></TR>
						<TR>
							<TD style="WIDTH: 91px; HEIGHT: 17px">
							商品名称
							<TD style="HEIGHT: 17px"><asp:textbox id="name" runat="server" BorderStyle="Groove" Height="21px" Width="224px"></asp:textbox></TD>
							<td style="WIDTH: 134px"></td>
							</TD></TR>
						<TR>
							<TD style="WIDTH: 91px">规格型号</TD>
							<TD><asp:textbox id="gdgg" runat="server" BorderStyle="Groove" Height="21px" Width="128px"></asp:textbox></TD>
							</TD>
							<TD style="WIDTH: 134px"></TD>
						</TR>
						<TR>
							<TD style="WIDTH: 91px">品牌</TD>
							<TD><asp:textbox id="market" runat="server" BorderStyle="Groove" Height="21px" Width="224px"></asp:textbox></TD>
							</TD>
							<TD style="WIDTH: 134px"></TD>
						</TR>
						<TR>
							<TD style="WIDTH: 91px">生产厂家</TD>
							<TD><asp:textbox id="factory" runat="server" BorderStyle="Groove" Height="21px" Width="224px">文登苘山塑料厂</asp:textbox></TD>
							</TD>
							<TD style="WIDTH: 134px"></TD>
						</TR>
						<TR>
							<TD style="WIDTH: 91px">单元名称</TD>
							<TD><asp:textbox id="unitname" runat="server" BorderStyle="Groove" Height="21px" Width="59px">个</asp:textbox></TD>
							</TD>
							<TD style="WIDTH: 134px"></TD>
						</TR>
						<tr>
							<td>图片</td>
							<td><img src='<%=gdimg%>' width=60 border=0 ></td>
							<td></td>
						</tr>
						<TR>
							<TD style="WIDTH: 91px">详细介绍</TD>
							<TD>
								<asp:textbox id="introduce" runat="server" Width="448px" Height="120px" BorderStyle="Groove"
									TextMode="MultiLine"></asp:textbox></TD>
							<TD style="WIDTH: 134px"></TD>
						</TR>
						<tr>
							<td style="WIDTH: 91px"></td>
							<td align="center"><asp:button id="Add" runat="server" Width="72px" CssClass="buttoncss" Text="审核商品"></asp:button>&nbsp;&nbsp;<INPUT class="buttoncss" style="WIDTH: 64px; HEIGHT: 20px" onclick="closes()" type="button"
									value="返回">
							</td>
							<td style="WIDTH: 134px"></td>
						</tr>
					</TABLE>
				</FONT>
			</form>
		</div>
		<asp:label id="lbl_Error" style="Z-INDEX: 101; LEFT: 288px; POSITION: absolute; TOP: 736px"
			runat="server" Width="64px" Height="24px" Visible="False">Label</asp:label>
		<asp:label id="lbl_type" style="Z-INDEX: 102; LEFT: 360px; POSITION: absolute; TOP: 744px"
			runat="server" Width="80px" Height="24px" Visible="False">Label</asp:label>
		<asp:Label id="lbl_array" style="Z-INDEX: 103; LEFT: 232px; POSITION: absolute; TOP: 728px"
			runat="server" Width="64px" Height="24px" Visible="False">Label</asp:Label>
	</body>
</HTML>
                                
                                 
