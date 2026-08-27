<%@ Page language="c#" Codebehind="upload.aspx.cs" AutoEventWireup="false" Inherits="jxc.upload" %>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN" >
<HTML>
	<HEAD>
		<title>upload</title>
		<meta name="GENERATOR" Content="Microsoft Visual Studio .NET 7.1">
		<meta name="CODE_LANGUAGE" Content="C#">
		<meta name="vs_defaultClientScript" content="JavaScript">
		<meta name="vs_targetSchema" content="http://schemas.microsoft.com/intellisense/ie5">
		<LINK href="css/global.css" type="text/css" rel="stylesheet">
	</HEAD>
	<body MS_POSITIONING="GridLayout" topmargin="3">
		<FORM id="sBody_Up" method="post" encType="multipart/form-data" runat="server">
			<table cellpadding="0" cellspacing="0" border="0" width="100%">
				<tr>
					<td align="left">
						<INPUT id="upload_file" type="file" size="36" name="upload_file" runat="server" style="WIDTH: 336px; HEIGHT: 22px">
					</td>
					<td align="left">
						<asp:Button id="Button1" runat="server" Text="上传" CssClass="title3"></asp:Button>
					</td>
					<td align="left">
						<SPAN id="Info" runat="server" style="COLOR: red" class="title3">类型：gif,jpg,zip,rar,doc,xls 
							600K</SPAN>
					</td>
				</tr>
			</table>
		</FORM>
	</body>
</HTML>
                                
                                 
