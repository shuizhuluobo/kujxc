<%@ Page language="c#" Codebehind="change_judge.aspx.cs" AutoEventWireup="false" validateRequest="false"  Inherits="jxc.admin.change_judge" %>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN" >
<HTML>
	<HEAD>
		<title>修改审批意见</title>
		<meta name="GENERATOR" Content="Microsoft Visual Studio .NET 7.1">
		<meta name="CODE_LANGUAGE" Content="C#">
		<meta name="vs_defaultClientScript" content="JavaScript">
		<meta name="vs_targetSchema" content="http://schemas.microsoft.com/intellisense/ie5">
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
		<form id="Form1" method="post" runat="server">
			<table class="title3" cellSpacing="6" cellPadding="0" width="100%" border="0">
				<tr>
					<td width="70">申请人</td>
					<td><asp:label id="sqr" runat="server"></asp:label></td>
				</tr>
				<tr>
					<td width="70">日期</td>
					<td><asp:label id="fbsj" runat="server"></asp:label></td>
				</tr>
				<tr>
					<td width="70">主题</td>
					<td><asp:label id="bt" runat="server"></asp:label></td>
				</tr>
				<tr>
					<td width="70">正文</td>
					<td><FONT face="宋体"><asp:label id="nr" runat="server"></asp:label></FONT></td>
				</tr>
				<tr>
					<td width="70">语音</td>
					<td>
						<div id="yy" runat="server"></div>
					</td>
				</tr>
				<tr>
					<td bgColor="#cccccc" colSpan="2" height="20">审批环节列表</td>
				</tr>
				<tr>
					<td colSpan="2">
						<div id="splb" runat="server"></div>
					</td>
				</tr>
				<tr>
					<td bgColor="#cccccc" colSpan="2" height="20">您的审批意见</td>
				</tr>
				<tr>
					<td colSpan="2"><asp:radiobuttonlist id="RadioButtonList1" runat="server" CssClass="title3" Width="160px" RepeatDirection="Horizontal">
							<asp:ListItem Value="1">同意</asp:ListItem>
							<asp:ListItem Value="0">不同意</asp:ListItem>
						</asp:radiobuttonlist></td>
				</tr>
				<tr>
					<td colSpan="2">审批内容</td>
				</tr>
				<tr>
					<td colSpan="2"><asp:textbox id="spnr" runat="server" Width="520px" Height="160px" TextMode="MultiLine"></asp:textbox></td>
				</tr>
				<tr>
					<td>上传语音</td>
					<td align="left"><INPUT id="upload_file" style="WIDTH: 400px; HEIGHT: 22px" type="file" size="36" name="upload_file"
							runat="server">
						<asp:button id="Button1" runat="server" CssClass="title3" Text="上传"></asp:button></td>
				</tr>
				<tr>
					<td align="center" colSpan="2"><asp:datagrid id="DataGrid1" runat="server" CssClass="title3" Width="90%" ForeColor="Black" GridLines="None"
							CellPadding="2" BackColor="LightGoldenrodYellow" BorderWidth="1px" BorderColor="Tan" DataKeyField="filename" AutoGenerateColumns="False">
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
					<td colSpan="2"><asp:button id="savesp" runat="server" CssClass="buttoncss" Text="修改我的审批"></asp:button>
						&nbsp;<INPUT style="WIDTH: 64px; HEIGHT: 24px" type="button" value="返回" onclick="closes()" class="buttoncss">
					</td>
				</tr>
			</table>
			<asp:Label id="judgeczy" style="Z-INDEX: 101; LEFT: 96px; POSITION: absolute; TOP: 640px" runat="server"
				Width="112px" Visible="False"></asp:Label>
			<asp:Label id="iffinish" style="Z-INDEX: 102; LEFT: 200px; POSITION: absolute; TOP: 648px"
				runat="server" Visible="False"></asp:Label>
			<asp:Label id="judgedate" style="Z-INDEX: 103; LEFT: 288px; POSITION: absolute; TOP: 640px"
				runat="server" Visible="False"></asp:Label>
		</form>
	</body>
</HTML>
                                
                                 
