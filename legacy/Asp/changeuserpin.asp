<%@ Language=VBScript %>
<%  OPTION EXPLICIT %>
<!--

-->

<%
Session("RandomData") = ""

Dim RndData
Dim I, Upper, Lower

'Create some random data for HASH compute.
Randomize
RndData = ""
Upper = Asc("z")
Lower = Asc("a")
For I = 0 to 19
	RndData = RndData + Chr(Int((Upper - Lower)*Rnd + Lower))
NEXT

Session("RandomData") = RndData

%>

<HTML>
<HEAD>
<TITLE>坚石加密系统－身份认证ASP示例</TITLE>
<META HTTP-EQUIV="Content-Type" CONTENT="text/html">
<STYLE TYPE="text/css">
<!--
@import "test.css";
-->
</STYLE>
							
<script language=VBScript>
Dim FirstDigest
Dim Digest 
Dim MD5UserPIN
Dim MD5Temp
dim results
Digest= "01234567890123456"

dim bErr

sub ShowErr(Msg)
	bErr = true
'	MsgBox Msg
	Document.Writeln "<FONT COLOR='#FF0000'>"
	Document.Writeln "<P>&nbsp;</P><P>&nbsp;</P><P>&nbsp;</P><P ALIGN='CENTER'><B>ERROR:</B>"
	Document.Writeln "<P>&nbsp;</P><P ALIGN='CENTER'>"
	Document.Writeln Msg
	Document.Writeln " failed, and returns 0x" & hex(Err.number) & ".<br>"
	Document.Writeln "<P>&nbsp;</P><P>&nbsp;</P><P>&nbsp;</P>"
	Document.Writeln "</FONT>"
End Sub

function Validate()
	Digest = "01234567890123456"
	On Error Resume Next
	Dim TheForm
	Set TheForm = Document.forms("ValidForm")
	If Len(TheForm.OldUserPIN.Value) <> 16  Then
		MsgBox "PIN empty or user pin length is not 16!"	 
		Validate = FALSE
		Exit Function
	End if
	


	bErr = false

	chPid = "ffc5eb78" 

	tokencount = ET99.FindToken ( chPid )
	
	If Err Then

		ShowErr "Not found ET99"
		'scanf(message,%lx,Err.code)
		ShowErr Digest
		Validate = false
		Exit function
	Else
		ET99.OpenToken chPid,1
		
		If Err then
			ShowErr "Open ET99 failed."
			Validate = false
			Exit function
		End if
		
		
    'ET99.VerifyPIN CInt(TheForm.Identity.Value), CStr(TheForm.UserPIN.Value)
		'ET99.VerifyPIN 0, TheForm.OldUserPIN.Value
		'If Err Then
		'	ShowErr "Verify User PIN Failure!!!"
		'	Validate = false
		'	ET99.CloseToken
		'	Exit function
		'End if
		
		
		MD5UserPIN = ET99.Soft_MD5HMAC(1,TheForm.NewUserPIN.Value,"")
		If Err Then 
				ShowErr "Soft_MD5HMAC"
				Validate = false
				ET99.CloseToken
				Exit function
		End if
		
		MsgBox MD5UserPIN
		
		
		ET99.ChangeUserPIN TheForm.OldUserPIN.Value, MD5UserPIN
		If Err Then 
				ShowErr "ChangeUserPIN"
				Validate = false
				ET99.CloseToken
				Exit function
		End if
		
		'you can use this function to get SN
		'GetSN
		'results = "01234567890123456"
		'results = ET99.GetSN
		'If Err Then
		'	ShowErr "Get SN fail!"
		'	ET99.CloseToken
		'	Exit function
		'End if
		'
		'Do HASH-MD5-HMAC compute.
		'If Not bErr Then
		'	Digest = ET99.MD5HMAC (1, <%
		'					Response.Write Chr(34)
		'					Response.Write RndData
		'					Response.Write Chr(34)
		'					%>, 20)
		'	If Err Then 
		'		ShowErr "HashToken compute"
		'		Validate = false
		'		ET99.CloseToken
		'		Exit function
		'	End If
		'
		'		
		'	DigestID.innerHTML = "<input type='hidden' name='Digest' Value='" & Digest & "'>"
		'	snID.innerHTML = "<input type='hidden' name='SN_SERAL' Value='" & results & "'>"
		'End If
	End if
	
	ET99.CloseToken

	MsgBox "Sucess"
	
End function
</script>

</HEAD>
<BODY>
     
<OBJECT classid=clsid:e6bd6993-164f-4277-ae97-5eb4bab56443 id=ET99 name = ET99 STYLE="LEFT: 0px; TOP: 0px" width=0 height=0></OBJECT>

<H1 ALIGN="center">坚石加密系统<BR>身份认证ASP示例</H1>
<TABLE WIDTH="600" BORDER="0" ALIGN="center">
  <TR>
    <TD>
      <P ALIGN="CENTER"></P>


<SCRIPT id=clientEventHandlersVBS language=vbscript>
<!--
		'Now you had get the result of HASH compute and the random data
		' use to HASH compute. You should post these data to server and
		' do verify operation.
		Document.Writeln "<P>&nbsp;</P><P ALIGN='CENTER'></P>"
		Document.Writeln "<P>&nbsp;</P><P>&nbsp;</P></TD></TR><TR><TD>"
		Document.Writeln "<FORM id=ValidForm METHOD='post' ACTION='' onsubmit='return Validate();' language='jscript'>"

		'Post the result of HASH compute by ET99 can use by server.

		'Document.Writeln "<span id=DigestID></span>"
		'Document.Writeln "<span id=snID></span>"
		'Document.Writeln "<input type='hidden' name='Digest' Value='" & Digest & "'>"

		'Create a table and let user input the PIN.
		Document.Writeln "<TABLE WIDTH='250' BORDER='1' ALIGN='center' CELLSPACING='0' BORDERCOLORDARK='#E7EBFF' BORDERCOLORLIGHT='#000000'>"
		'If you add so pin verify ,you maybe add these codes as these
		'Document.Writeln "<TR><TD ALIGN='right'>Identity:</TD><TD>"
		'Document.Writeln "<select name='Identity'>"
		'Document.Writeln "<option  value='0'>User PIN</option>"
		'Document.Writeln "<option value='1'>So PIN</option>"
		'Document.Writeln "</select>"
		'Document.Writeln "</TD></TR>"
		
		Document.Writeln "<TR><TD ALIGN='right'>Old User PIN:</TD><TD><INPUT NAME='OldUserPIN' Value='ffffffffffffffff' CLASS='inputtext'></TD></TR>"
		Document.Writeln "<TR><TD ALIGN='right'>New User PIN:</TD><TD><INPUT NAME='NewUserPIN' CLASS='inputtext'></TD></TR>"


		Document.Writeln "</TABLE><P>&nbsp;</P><P ALIGN='center'>"
		Document.Writeln "<INPUT TYPE='submit' NAME='Submit' VALUE='Let me in' CLASS='inputbtn'>"
		Document.Writeln "<INPUT TYPE='reset' NAME='Reset' VALUE='Re-input' CLASS='inputbtn'></P></FORM>"
-->
</SCRIPT>

	</TD>
  </TR>
</TABLE>
<H2>&nbsp;</H2>
<P>&nbsp;</P>
<P ALIGN="center">Create by Rockey, 2007</P>
<P ALIGN="center">Copyright&copy; 2007,Rockey Tech. Co. Ltd.</P>
</BODY>
</HTML>