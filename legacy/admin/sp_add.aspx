<%@ Page language="c#" Codebehind="sp_add.aspx.cs" AutoEventWireup="false" validateRequest="false" Inherits="jxc.admin.sp_add" %>
<%@ Register TagPrefix="ftb" Namespace="FreeTextBoxControls" Assembly="FreeTextBox" %>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN" >
<HTML>
	<HEAD>
		<title>审批申请增加</title>
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
		<form id="Post" method="post" runat="server">
			<table class="title3" cellSpacing="4" cellPadding="0" width="100%" border="0">
				<tr>
					<td align="center" colSpan="2">审批申请增加</td>
				</tr>
			</table>
			<table class="title3" cellSpacing="4" cellPadding="0" width="100%" border="0">
				<TR>
					<td align="center">标题</td>
					<td><asp:textbox id="title" runat="server" CssClass="inputcss" Width="336px"></asp:textbox></td>
				</TR>
				<TR>
					<td align="center">申请人</td>
					<td><asp:textbox id="zz" runat="server" CssClass="inputcss" Width="120px"></asp:textbox></td>
				</TR>
				<TR>
					<td align="center">时间</td>
					<td><asp:textbox id="inputdate" runat="server" CssClass="inputcss" Width="144px"></asp:textbox><A onclick="window.open('/popup.aspx?textbox=inputdate','cal','width=400,height=400,left=270,top=180,scrollbars=1,fullscreen=0')"
							href="javascript:;"><IMG src="/image/SmallCalendar.gif" border="0"></A>
					</td>
				</TR>
				<TR>
					<td align="center">审批类型</td>
					<td><asp:radiobuttonlist id="RadioButtonList1" runat="server" CssClass="title3" Width="248px" AutoPostBack="True"></asp:radiobuttonlist></td>
				</TR>
				<tr id="spd" runat="server" bgcolor="red">
					<td align="center">审批终点</td>
					<td>
						<asp:DropDownList id="DropDownListspd" runat="server"></asp:DropDownList>
					</td>
				</tr>
				<tr id="spr" runat="server" bgcolor="red">
					<td align="center">审批人</td>
					<td><asp:textbox id="sprs" runat="server" CssClass="inputcss" Width="120px"></asp:textbox>&nbsp;<A onclick="window.open('spr.aspx?textbox=sprs&amp;hidtextbox=hidsprs','cal','width=800,height=600,left=100,top=100,scrollbars=1,fullscreen=0')"
							href="javascript:;"><IMG src="/image/SmallCalendar.gif" border="0"></A> <input id="hidsprs" type="hidden" name="hidsprs" runat="server">
					</td>
				</tr>
				<tr>
					<td align="center">上传语音</td>
					<td align="left"><INPUT id="upload_file" style="WIDTH: 400px; HEIGHT: 22px" type="file" size="36" name="upload_file"
							runat="server">
						<asp:button id="Button1" runat="server" CssClass="title3" Text="上传"></asp:button></td>
				</tr>
				<tr>
					<td></td>
					<td align="left"><asp:datagrid id="DataGrid1" runat="server" CssClass="title3" Width="90%" ForeColor="Black" GridLines="None"
							CellPadding="2" BackColor="LightGoldenrodYellow" BorderWidth="1px" BorderColor="Tan" DataKeyField="filename"
							AutoGenerateColumns="False">
							<SelectedItemStyle ForeColor="GhostWhite" BackColor="DarkSlateBlue"></SelectedItemStyle>
							<AlternatingItemStyle BackColor="PaleGoldenrod"></AlternatingItemStyle>
							<HeaderStyle Font-Bold="True" BackColor="Tan"></HeaderStyle>
							<FooterStyle BackColor="Tan"></FooterStyle>
							<Columns>
								<asp:BoundColumn DataField="filename" HeaderText="文件名"></asp:BoundColumn>
								<asp:TemplateColumn HeaderText="试听">
									<HeaderStyle Width="40px"></HeaderStyle>
									<ItemTemplate>
										<a href='<%#DataBinder.Eval(Container.DataItem, "viewfile") %>' target=_blank>点击试听</a>
									</ItemTemplate>
								</asp:TemplateColumn>
								<asp:ButtonColumn Text="删除" HeaderText="删除" CommandName="delete"></asp:ButtonColumn>
							</Columns>
							<PagerStyle HorizontalAlign="Center" ForeColor="DarkSlateBlue" BackColor="PaleGoldenrod"></PagerStyle>
						</asp:datagrid></td>
				</tr>
				<tr>
					<td colSpan="2" height="16"></td>
				</tr>
				<tr>
					<td align="center" colSpan="2">请求审批详细信息
					</td>
				</tr>
				<tr>
					<td align="center" colSpan="2"><FTB:FREETEXTBOX id="FreeTextBox1" runat="server" Height="200" ButtonPath="\images\ftb\office2000\"
							width="90%"></FTB:FREETEXTBOX></td>
				</tr>
				<tr>
					<td colSpan="2" height="6"></td>
				</tr>
				<tr>
					<td></td>
					<td align="left">&nbsp;
						<asp:button id="Button2" runat="server" CssClass="buttoncss" Width="64px" Text="保存" Height="24px"></asp:button>&nbsp;<INPUT class="buttoncss" style="WIDTH: 64px; HEIGHT: 24px" onclick="closes()" type="button"
							value="返回">
					</td>
				</tr>
			</table>
		</form>
	</body>
</HTML>
                                
                                 
