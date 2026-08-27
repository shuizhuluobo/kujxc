<%@ Language=VBScript %>
<%  OPTION EXPLICIT %>
<!--
[]=================================================================[]
	Logon.htm

	Copyright (C) 2006 Feitian Tech. Co. Ltd. All rights reserved.
	by Feitian

	Comment : Demonstration how to use ET99 Active Control
			  in ASP
[]=================================================================[]
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
<TITLE>Logon - ET99 SDK Test [ASP]</TITLE>
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=iso-8859-1">
<STYLE TYPE="text/css">
<!--
@import "test.css";
-->
</STYLE>
							
<script language=VBScript>
Dim FirstDigest
Dim Digest 
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
	If Len(TheForm.UserPIN.Value) <> 16  Then
		MsgBox "PIN empty or user pin length is not 16!"	 
		Validate = FALSE
		Exit Function
	End If
	If Len(TheForm.TokenPid.Value) <> 8  Then
		MsgBox "Input pid is wrong!"	 
		Validate = FALSE
		Exit Function
	End If

	bErr = false

	chPid =TheForm.TokenPid.Value
	'Let detecte whether the ET99 Safe Active Control loaded.
	'If we call any method and the Err.number be se13:19 2006-5-22t to &H1B6, it 
	'means the ET99 Safe Active Control had not be loaded.
	tokencount = ET99.FindToken ( chPid )
	'tokencount = ET99.FindToken (TheForm.TokenPid.Value)
	If Err Then

		ShowErr "Not found ET99"
		'scanf(message,%lx,Err.code)
		ShowErr Digest
		Validate = false
		Exit function
	Else
		ET99.OpenToken chPid,1
		'ET99.OpenToken TheForm.TokenPid.Value,1
		
		If Err then
			ShowErr "Open ET99 failed."
			Validate = false
			Exit function
		End if
		
		
        'ET99.VerifyPIN CInt(TheForm.Identity.Value), CStr(TheForm.UserPIN.Value)
		ET99.VerifyPIN 0, TheForm.UserPIN.Value
		If Err Then
			ShowErr "Verify User PIN Failure!!!"
			Validate = false
			ET99.CloseToken
			Exit function
		End If
		
		'you can use this function to get SN
		'GetSN
		dim results
		results = "01234567890123456"
		results = ET99.GetSN
		If Err Then
			ShowErr "Get SN fail!"
			ET99.CloseToken
			Exit function
		End If

		'Do HASH-MD5-HMAC compute.
		If Not bErr Then
			Digest = ET99.MD5HMAC (1, <%
							Response.Write Chr(34)
							Response.Write RndData
							Response.Write Chr(34)
							%>, 20)
			If Err Then 
				ShowErr "HashToken compute"
				Validate = false
				ET99.CloseToken
				Exit function
			End If
			
		
			DigestID.innerHTML = "<input type='hidden' name='Digest' Value='" & Digest & "'>"
			snID.innerHTML = "<input type='hidden' name='SN_SERAL' Value='" & results & "'>"
		End If
	End If
	ET99.CloseToken
End function
</script>

</HEAD>
<BODY>
     
<OBJECT classid=clsid:e6bd6993-164f-4277-ae97-5eb4bab56443 id=ET99 name = ET99 STYLE="LEFT: 0px; TOP: 0px" width=0 height=0></OBJECT>

<H1 ALIGN="center">ET99 Active Control<BR>Demo Program for ASP</H1>
<TABLE WIDTH="600" BORDER="0" ALIGN="center">
  <TR>
    <TD>
      <P ALIGN="CENTER">Welcome to ET99 Active Control demonstration program for ASP.</P>


<SCRIPT id=clientEventHandlersVBS language=vbscript>
<!--
		'Now you had get the result of HASH compute and the random data
		' use to HASH compute. You should post these data to server and
		' do verify operation.
		Document.Writeln "<P>&nbsp;</P><P ALIGN='CENTER'>To logon, you must input Token Pid and your PIN.</P>"
		Document.Writeln "<P>&nbsp;</P><P>&nbsp;</P></TD></TR><TR><TD>"
		Document.Writeln "<FORM id=ValidForm METHOD='post' ACTION='verify.asp' onsubmit='return Validate();' language='jscript'>"

		'Post the result of HASH compute by ET99 can use by server.

		Document.Writeln "<span id=DigestID></span>"
		Document.Writeln "<span id=snID></span>"
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
		
		Document.Writeln "<TR><TD ALIGN='right'>Token Pid:</TD><TD><INPUT NAME='TokenPid' CLASS='inputtext'></TD></TR>"
		Document.Writeln "<TR><TD ALIGN='right'>User PIN:</TD><TD><INPUT TYPE='password' NAME='UserPIN' CLASS='inputtext'></TD></TR>"


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
<P ALIGN="center">Create by FeiTian, 2006-5-18</P>
<P ALIGN="center">Copyright&copy; 2006,Feitian Tech. Co. Ltd.</P>
</BODY>
</HTML>