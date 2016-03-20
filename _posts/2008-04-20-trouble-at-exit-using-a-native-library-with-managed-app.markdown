---
layout: post
title: Trouble ‘atexit’ using a native library with managed app
date: '2008-04-20 15:42:03 +0100'
---

I have recently been working on a game engine that resides in a single static library, which is written in native C++. Alongside the development of this engine I am also developing an editor that uses this engine, which is written in managed C++.

The other day I stumbled on a problem that had me rather confused. Inside my library, I have a function which contains a static object. The static object is constructed the first time the function is entered. When my managed application entered the function, an exception was being thrown during the construction of the object (but after the constructor was being called).

After a bit of investigation, the exception was actually being thrown inside a function called `atexit`. This function registers a function so that it can be called when the application is about to exit. In my case, the compiler injected a call to ‘atexit’, passing in a pointer to my object’s destructor. This is something that shouldn’t fail – it is a feature of the language that should be handled correctly by the compiler. However, for some reason it wasn’t being handled correctly...

I spent quite a while looking into this. Once I was convinced that it wasn’t a silly error I had made, I decided to prepare an example that I could post onto some forums to see if anyone else could figure it out. To do this, I created a simple Visual Studio solution with a static library and a managed application, and tried to reproduce the error. But for some reason, I couldn’t - it was working in the simple case but not in my editor.

I suspected that my project settings were different, and so I compared them. I spotted that the following linker settings were different:

* Editor (not working)
	* Target Platform: Windows
	* Entry Point: main

* Test (working)
	* Target Platform: None
	* Entry Point: None

So, I tried applying the Editor’s settings to ‘Test’. Having doing this, I successfully got ‘Test’ to break.

After a bit more research, I found out the reason behind this problem. The ‘Entry Point’ setting causes the CRT to skip some important initialisation (including the initialisation of the function list maintained by ‘atexit’). Therefore, setting an entry point on a managed project is potentially unsafe. However, the Windows Forms Wizard in Visual Studio 2005 sets this by default! So be warned - if using a native library inside a managed application, make sure the entry point isn't set!
