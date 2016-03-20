---
layout: post
title: Improving the Missing DirectX DLL Experience
date: '2011-04-10 08:59:42 +0100'
---

Have you ever sent someone a DirectX executable, only for them to be presented with the following dialog box?

![Missing DirectX DLL Error]({{ site.baseurl }}/images/DirectXDLLError.png)

It has happened to me many times. I usually build and link against the latest version of the DirectX SDK. The problem is that there is no guarantee that your end user will have this version of the DirectX Runtime Libraries installed on their machine. When they don't, it is the operating system that displays this error message, because it cannot find one or more dependant DLLs that are required to launch the executable.

This isn't so much a problem for commercial games - they just bundle the correct version of the DirectX Runtime Libraries with their installer. But what if your application isn't large enough to warrant an installer? When prototyping or working on something in my spare time, I'll create little demo applications and distribute them in .zip files. I want my users to have the easiest experience possible - they should be able to unzip and launch my executable without doing anything else. This is especially important when sending demos to potential employers - the last thing you want is for them to be hit with a "missing DLL" dialog box.

Another possible solution is just to bundle the DirectX DLLs with my application - however, this is not good practise as it is not safe to assume that the DirectX DLLs can just be copied onto another computer without proper installation.

So here is solution that has worked well for me so far. Move your DirectX application into a DLL and write a bootstrapper executable that performs the following tasks:

* Check whether the correct version of the DirectX Runtime is installed

	* If it is, then dynamically load your application DLL and execute an entry point function inside that DLL

	* Otherwise, display a nicer-to-read message asking the user to download the latest version of the DirectX Runtimes

Here is how I check for the correct DirectX 10 runtime in my bootstrapper:

{% highlight cpp %}
// Somewhere at the top of the file...
#include <d3dx10.h>

// Check whether the required D3DX library is available by trying to load it
HMODULE d3dxLib = LoadLibrary( D3DX10_DLL );
if ( d3dxLib == NULL )
{
	// Display human-friendly 'Update DirectX' message.
	ShowD3DXMissingDialog( );
	return -1;
}

FreeLibrary( d3dxLib );
d3dxLib = NULL;

// If we get this far, then it is safe to load our demo DLL and launch it
LaunchDemo( );
{% endhighlight %}

This code takes advantage of the fact that when you #include the D3DX10 library, it will actually #define `D3DX10_DLL` to the filename of the D3DX10 DLL that you will be dependant on, which is very handy. Note that it is important to use `LoadLibrary` rather than trying to search the end user's machine yourself, because `LoadLibrary` follows the operating system's standard conventions for searching for DLLs. Also note that your bootstrapper shouldn't actually link to any DirectX libraries - just #include the D3DX library so that it defines D3DX10_DLL.

If my bootstrapper fails to load the D3DX library, then it displays the following dialog box:

![DirectX Bootstrapper Dialog]({{ site.baseurl }}/images/DirectXBootstrapper.png)

The link points the user directly to the Microsoft DirectX website. This is a lot nicer than the standard 'missing DLL' message box.
