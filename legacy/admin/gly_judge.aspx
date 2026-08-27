<%@ Page language="c#" Codebehind="gly_judge.aspx.cs" AutoEventWireup="false" Inherits="jxc.admin.gly_judge" %>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN" >
<HTML>
	<HEAD>
		<title>申请单审批</title>
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
		<form id="Form1" method="post" runat="server">
			<table class="title3" cellSpacing="6" cellPadding="0" width="100%" border="0">
				<tr>
					<td><asp:label id="report" runat="server" ForeColor="Red"></asp:label></td>
				</tr>
			</table>
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
					<td bgColor="#cccccc" colSpan="2" height="20">汇兑领导审批意见</td>
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
					<td align="center" colSpan="2"><asp:datagrid id="DataGrid1" runat="server" ForeColor="Black" CssClass="title3" Width="90%" GridLines="None"
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
					<td colSpan="2"><asp:button id="savesp" runat="server" CssClass="buttoncss" Text="保存领导审批意见"></asp:button>&nbsp;<INPUT class="buttoncss" style="WIDTH: 64px; HEIGHT: 24px" onclick="closes()" type="button"
							value="返回">
					</td>
				</tr>
			</table>
			<asp:label id="cptype" style="Z-INDEX: 101; LEFT: 56px; POSITION: absolute; TOP: 648px" runat="server"
				Visible="False"></asp:label><asp:label id="hidfinishczy" style="Z-INDEX: 102; LEFT: 160px; POSITION: absolute; TOP: 656px"
				runat="server" Visible="False"></asp:label><asp:label id="judgeczy" style="Z-INDEX: 103; LEFT: 336px; POSITION: absolute; TOP: 648px"
				runat="server" Visible="False"></asp:label><asp:label id="hidtype" style="Z-INDEX: 104; LEFT: 488px; POSITION: absolute; TOP: 648px" runat="server"
				Visible="False"></asp:label></form>
	</body>
</HTML>
                                
                                 
