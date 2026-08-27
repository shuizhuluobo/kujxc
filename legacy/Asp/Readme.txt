ET99 安全Active控件ASP演示程序

1. 概述
	下面的步骤介绍如何运行该演示程序：
	1、运行前的准备工作；
	2、首先初始化一个ET99；
	3、演示网页中身份认证过程。
	在这个文档中，"%SDKDIR%"意指你安装的ET99的SDK目录，如：C:\Feitian\ET99。

2. 运行前的准备工作
(这个工作在服务器端进行，当然服务器端和客户端可以是在同一台机器上)

	为了运行该演示程序，你首先必须有一台支持ASP的web服务器，如：PWS4.0,IIS5.0,等等，在服务器端建立一个指向该演示程序文件的虚拟目录。
	在下面的解析中，我们假定你能够访问web服务器，如方式："http://www.myhost.net"。
	你能够找到这个演示程序的文件在%SDKDIR%\Samples\ASP目录下，把你在PWS(或者IIS)建立的虚拟目录，如“asptest”指向这个目录。
	现在，你能够访问：http://www.myhost.net/asptest/index.htm.如果你能够在web浏览器中看到这个文件的英文版，就意味着你构建你的web服务器成功。

3. 初始化一个ET99
(这个工作在服务器端进行)

	在运行这个演示程序之前，你必须首先初始化一个ET99。
	我们提供一个一个初始化工具（ET99AspInit.exe），你能够在目录 %SDKDIR%\Samples\ASP中找到它，并且你能在目录%SDKDIR%\Samples\VC\ET99AspInit中找到它的源代码。
	在USB接口中插入一个ET99，运行ET99AspInit.exe，输入PID，PIN码和密钥，然后点击“OK”按钮，这个工具保存MD5算法需要的Key到ET99中，并且在相同的目录下创建文件user.txt，用来保存密钥。

4. 演示网页中身份认证过程
(这个工作在客户端进行)

	如果你已经把上面两步都已经准备完毕，那么就可以运行该演示程序了。
	访问：http://www.myhost.net/asptest/index.htm，根据提示一步一步进行下去，直至最后运行成功。

5. 由于UserPIN为16个字符，最终用户输入比较麻烦，因此可以先处理一下。即最终用户可以输入任意值作为自己的UserPIN，而ET99真实的UserPIN是用户的输入经过散列后结果的前16个字符。

changeuserpin.asp：将UserPIN默认的16个F更改为任意输入的散列结果的前16个字符。asp页面中将PID赋值了，开发商需要根据自己手中的ET99的PID更改。

logonmd5pin.asp：用户输入自己的UserPIN，网页程序将用户的输入进行散列计算，再将散列计算结果的前16字节使用UserPIN验证接口进行验证。

	

