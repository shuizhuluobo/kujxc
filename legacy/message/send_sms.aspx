<%@ Page language="c#" Codebehind="send_sms.aspx.cs" AutoEventWireup="false" Inherits="jxc.message.send_sms" %>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN" >
<HTML>
	<HEAD>
		<title>发送公文</title>
		<meta content="Microsoft Visual Studio .NET 7.1" name="GENERATOR">
		<meta content="C#" name="CODE_LANGUAGE">
		<meta content="JavaScript" name="vs_defaultClientScript">
		<meta content="http://schemas.microsoft.com/intellisense/ie5" name="vs_targetSchema">
		<LINK href="/css/BasicLayout.css" type="text/css" rel="stylesheet">
	</HEAD>
	<body MS_POSITIONING="GridLayout">
		<form id="Form1" method="post" runat="server">
			<table cellpadding="0" cellspacing="0" border="0" width="100%">
				<tr>
					<td align="right" class="title3">
						发送内容
						<asp:TextBox id="sms" runat="server" Width="100%"></asp:TextBox>
						<asp:Button id="send" runat="server" Width="62px" Text="发送" CssClass="buttoncss"></asp:Button>&nbsp;&nbsp;&nbsp;<INPUT type="button" value="关闭" class="buttoncss" onclick="window.close()" style="WIDTH: 64px; HEIGHT: 20px">
					</td>
				</tr>
			</table>
			<table cellSpacing="0" cellPadding="0" width="100%" border="0">
				<tr>
					<td valign="top">
						<asp:DataList id="DataList1" runat="server" Width="100%" RepeatColumns="4" RepeatDirection="Horizontal">
							<SelectedItemStyle VerticalAlign="Top"></SelectedItemStyle>
							<EditItemStyle VerticalAlign="Top"></EditItemStyle>
							<AlternatingItemStyle VerticalAlign="Top"></AlternatingItemStyle>
							<ItemStyle VerticalAlign="Top"></ItemStyle>
							<ItemTemplate>
								<TABLE class="title3" cellSpacing="0" cellPadding="0" width="100%" border="0">
									<TR vAlign="top">
										<TD vAlign="top">
											<asp:CheckBox id=prename runat="server" Width="200" CssClass='<%#(Container.ItemIndex).ToString() + "," + DataBinder.Eval(Container, "DataItem.glyname") %>' Text='<%# DataBinder.Eval(Container, "DataItem.glyname") %>'  ForeColor="red" AutoPostBack="false">
											</asp:CheckBox>
											<asp:Label id=lbjgbhs runat="server" Width="99px" Text='<%# DataBinder.Eval(Container, "DataItem.glydh") %>' Visible="False">
											</asp:Label></TD>
									</TR>
								</TABLE>
							</ItemTemplate>
						</asp:DataList>
					</td>
				</tr>
			</table>
		</form>
	</body>
</HTML>
                                
                                 
