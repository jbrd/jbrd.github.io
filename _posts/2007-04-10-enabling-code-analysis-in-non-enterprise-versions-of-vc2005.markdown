---
layout: post
title: Enabling Code Analysis In Non-Enterprise Versions of VC2005
date: '2007-04-10 21:03:28 +0100'
---

First of all, for those of you that don't know what static code analysis is, here's a description. It's an extra pass over your source code at compile time that can detect errors that the compiler won't normally detect. Unlike the standard compiler, this extra pass knows "extra things" such as how the standard library functions work, and can detect when you use them incorrectly.

Since I found out static code analysis (formally code-named preFAST) was being included in the Team System edition of Visual Studio 2005, I've been wishing for Microsoft to release preFAST for other versions of the IDE too - and now they have! (well, for the Windows platform that is). Here's what you have to do:

1. Download the latest Windows SDK (version 6.0 at the time of writing) from MSDN
2. A preFAST enabled compiler will be installed in a path like this (`...\Microsoft SDKs\Windows\v6.0\VC`). You now have to update your IDE to use this version of the compiler, instead of its in-built one. To do this:

	1. Launch the IDE
	2. Select "Tools->Options"
	3. Goto "Projects and Solutions->VC++ Directories"
	4. Make sure the "Win32" platform is selected
	5. In "Executable Files", add `...\v6.0\VC\BIN` to the top of the list
	6. In "Include Files", add `...\v6.0\VC\INCLUDE` to the top of the list
	7. In "Library Files", add `...\v6.0\VC\LIB` to the top of the list.
	
3. To enable static code analysis in a Visual C++ project:

	1. Open the Project Properties dialog
	2. Goto "Configuration Properties -> C/C++ -> Command Line" and add the `/analyze` switch

And there you have it! If everything worked correctly, next time you build your project you should notice the additional `Processing...` line in the compiler output window during compilation. If it finds any potential risks, it will list them in the compiler output window, just like any other compiler warning.
