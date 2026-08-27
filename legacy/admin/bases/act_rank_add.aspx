<%@ Page language="c#" Codebehind="act_rank_add.aspx.cs" AutoEventWireup="false" Inherits="jxc.admin.bases.act_rank_add" %>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN" >
<HTML>
	<HEAD>
		<title>会员级别与查询栏目设置</title>
		<meta name="GENERATOR" Content="Microsoft Visual Studio .NET 7.1">
		<meta name="CODE_LANGUAGE" Content="C#">
		<meta name="vs_defaultClientScript" content="JavaScript">
		<meta name="vs_targetSchema" content="http://schemas.microsoft.com/intellisense/ie5">
		<link href="/css/BasicLayout.css" rel="stylesheet" type="text/css">
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
			<table cellpadding="0" cellspacing="0" border="0" width="100%" height="50" align="center">
				<tr>
					<td width="556" background="/image/title.gif">
						<table cellpadding="0" cellspacing="0" border="0" width="100%">
							<tr>
								<td height="1"></td>
							</tr>
							<tr>
								<td width="180"></td>
								<td><font face="隶书" size="5">会员级别与查询栏目设置</font></td>
							</tr>
						</table>
					</td>
					<td width="250"></td>
				</tr>
			</table>
			<table cellpadding="0" cellspacing="5" border="0" width="100%" class="title3">
				<tr>
					<td align="right" width="100">
						会员类型
					</td>
					<td>
						<asp:DropDownList id="DropDownList1" runat="server" AutoPostBack="True">
							<asp:ListItem Value="-1">请选择</asp:ListItem>
							<asp:ListItem Value="0">个人网员</asp:ListItem>
							<asp:ListItem Value="1">企业网员</asp:ListItem>
						</asp:DropDownList>
					</td>
				</tr>
				<tr>
					<td align="right" width="100">
						会员级别
					</td>
					<td>
						<asp:DropDownList id="DropDownList2" runat="server"></asp:DropDownList></td>
				</tr>
				<tr>
					<td align="right" width="100">
						查询栏目
					</td>
					<td>
						<asp:DropDownList id="Dropdownlist3" runat="server"></asp:DropDownList></td>
				</tr>
				<tr>
					<td align="right" width="100">
						免费条数
					</td>
					<td>
						<asp:TextBox id="nofee" runat="server" CssClass="inputcss" Width="112px"></asp:TextBox>
					</td>
				</tr>
				<tr>
					<td align="right" width="100" style="HEIGHT: 3px">
						查询条数
					</td>
					<td style="HEIGHT: 3px">
						<asp:TextBox id="count" runat="server" CssClass="inputcss" Width="208px"></asp:TextBox></td>
				</tr>
				<tr>
					<td align="right" width="100" style="HEIGHT: 3px">
						每条费用
					</td>
					<td style="HEIGHT: 3px">
						<asp:TextBox id="feeone" runat="server" CssClass="inputcss" Width="208px"></asp:TextBox></td>
				</tr>
			</table>
			<table cellpadding="0" cellspacing="0" border="0" width="100%">
				<tr>
					<td align="center">
						<asp:Button id="save" runat="server" Width="62px" Text="保存" CssClass="buttoncss"></asp:Button>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<INPUT type="button" value="返回" class="buttoncss" onclick="closes()" style="WIDTH: 64px; HEIGHT: 20px">
					</td>
				</tr>
			</table>
		</form>
	</body>
</HTML>
                                
                                 
