---
layout: post
title: Running Windows Executables from P4Win
date: '2009-07-23 17:18:19 +0100'
---

Today, I thought I'd share a problem I ran into at work. We check builds of our artist tools into Perforce so that the artists can quickly sync up and run them. I made some changes to one of these tools, and committed a new build. Soon after, I received a few reports of the tool crashing on startup.

So, the first thing I tried was a force-sync of the tool and tried to run it on my machine. It worked. At this point, I must express my hate for these kind of bugs because 9 out of 10 times they are caused by one of the following:

* Inconsistent running environment - due to software, or environment variables not being setup properly
* Tools that are sensitive to working directory - i.e. tool expects to load "Foo.txt" but can't because the working directory is not set to the directory the tool expects (usually the working directory)

And the rest of the time, are caused by:

* Platform-specific nonsense that requires time and effort to fix, which is at a premium when someone is blocked waiting on a fix for the tool

Luckily it was not the later. I asked the particular user to show me the crash on their machine. It didn't take me long to realise that the crash wasn't actually happenning inside the tool. It was happenning while Windows was trying to load one of its dependant dlls. At this stage, I was really starting to suspect a working directory issue and noticed that the user was running the tool by double-clicking it from P4Win.

So, I went back to my desk, downloaded P4Win (it is deprecated), and gave it a go. And behold, it finally crashed! I used Process Explorer from SysInternals to peek into the environment of the process, and finally tracked down the problem - P4Win had copied the executable to a temporary folder, and launched it from there. Of course, it didn't copy all of the program's dependencies and other files it requires to run. Problem solved.

There is an easy solution to this problem. For certain file extensions, you can prevent P4Win from copying the file to a temporary location and instead, run it from its original location. The 'Files ---> View/Edit' page of the Options dialog has three options at the bottom of the page:

* Never use a temp file when viewing a synced unopened edit
* Always use a temp file when viewing an unopened deopt file
* Don't use temp for these extensions: [textbox]

Checking the bottom option, and making sure "exe" is in [textbox] fixes the problem.
