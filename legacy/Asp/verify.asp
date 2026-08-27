<%@ Language=VBScript %>
<%  OPTION EXPLICIT %>
<!--
[]=================================================================[]
	Logon.htm

	Copyright (C) 2004 Feitian Tech. Co. Ltd. All rights reserved.
	by Zhu Yangsheng

	Comment : Demonstration how to use ePass1000ND Active Control
			  in ASP
[]=================================================================[]
-->
<%
Dim RandomData, ClientDigest, ServerDigest
Dim UserName
Dim bErr, bContinue
Dim S
Dim Key1, Key2
Dim fs, userfile, userfilename
Dim UserNameInFile, PasswordInFile

bErr = 0
bContinue = true

Key1 = "01234567890123456"
Key2 = "01234567890123456"
ServerDigest = "01234567890123456"

' Get the information come from client.
UserName = Request.Form("SN_SERAL")
RandomData = Session("RandomData")
ClientDigest = Request.Form("Digest")


' If any of them are empty, means an error happened.
If UserName = "" Or RandomData = "" Or ClientDigest = "" Then
	bErr = 1 'Some unknown error.
End If

' Check whether the user had registed.
' Here we save the user name in a file named "User.txt",
' In your project, you should save the user's name and his/her password in a database.
If bErr = 0 Then
	userfilename = Server.MapPath(".") & "\user.txt"
	Set fs = Server.CreateObject("Scripting.FileSystemObject")

	If fs.FileExists(userfilename) Then
		Set userfile = fs.OpenTextFile(userfilename, 1, false)
		
		While (NOT userfile.AtEndOfStream) AND bContinue
			UserNameInFile = userfile.readline
			PasswordInFile = userfile.readline
			If UCase(UserNameInFile) = UCase(UserName) Then bContinue = false
		Wend
		If bContinue = true Then bErr = 3 'No such user.
		userfile.Close
		set userfile = Nothing
	Else
		bErr = 2 ' The file named "User.txt" do not exists. Use the initialize program to create one.
	End If
	Set fs = Nothing
End If

If bErr = 0 Then
	'Do MD5_HMAC compute at server.
	Set S = Server.CreateObject("ET99_FULL.ET99Full.1")

	ServerDigest = S.Soft_MD5HMAC ( 1, RandomData, PasswordInFile ) 
	ServerDigest = CStr(ServerDigest)
	If ServerDigest <> ClientDigest Then
		bErr = 4 'Password error.
	End If
	Set S = Nothing
End If

%>
<html>
<head>
<title>Result - ET99 SDK Test [ASP]</title>
<meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1">
<style type="text/css">
<!--
@import "test.css";
-->
</style>
</head>
<body>
<%
'If you want see the detial of error wen debug, uncomment the following lines.

If bErr <> 0 Then
	Response.Write "<P>Error : " & bErr
	Response.Write "<P>UserName : " & UserName
	Response.Write "<P>UserNameInFile : " & UserNameInFile
	Response.Write "<P>PasswordInFile : " & PasswordInFile
	Response.Write "<P>RandomData : " & RandomData
	Response.Write "<P>ClientDigest : '"&ClientDigest&"'"
	Response.Write "<P>ServerDigest : '"&ServerDigest&"'"
End If
%>
<h1 align="center">ET99 Active Control<br>Demo Program for ASP</h1>
<table width="600" border="0" align="center">
  <tr>
    <td>
      <p align="center">Welcome to ET99 Active Control demonstration program for ASP.</p>
	  <P>&nbsp;</P>
	  <P>&nbsp;</P>
<%
If bErr = 0 Then
	Response.Write "<h2 align='center'><font color='#0000FF'>Congratulation, " & UserNameInFile & " ! You can get in now.</FONT></h2>"
End If
If bErr = 1 Then
	Response.Write "<h2 align='center'><font color='#FF0000'>Error : Some unknown error occured.</FONT></h2>"
	Response.Write "<P align='center'>You'd better to try again."
End If
If bErr = 2 Then
	Response.Write "<h2 align='center'><font color='#FF0000'>Error : The file named USER.TXT can not be found.</FONT></h2>"
	Response.Write "<P align='center'>You should initialize the ET99 first."
End If
If bErr = 3 Then
	Response.Write "<h2 align='center'><font color='#FF0000'>Error : The user named '" & UserName & "' not registed yet.</FONT></h2>"
	Response.Write "<P align='center'>You should get an initialized ET99 first."
End If
If bErr = 4 Then
	Response.Write "<h2 align='center'><font color='#FF0000'>Error : Bad user</FONT></h2>"
	Response.Write "<P align='center'>Oooooooops! Did you forget your password ??"
End If
%>
	  <P>&nbsp;</P>
	  <P>&nbsp;</P>
    </td>
  </tr>
</table>
<p>&nbsp;</p>
<P ALIGN="center">Create by FeiTian, 2006-5-18</P>
<P ALIGN="center">Copyright&copy; 2006,Feitian Tech. Co. Ltd.</P>
</body>
</html>
