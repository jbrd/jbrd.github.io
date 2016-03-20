---
layout: post
title: Visual Studio 2005 Hidden Tricks
date: '2008-02-12 14:39:24 +0000'
---

I use Visual Studio a lot. Sometimes I use it and discover a new little trick that makes my life so much easier. I've learnt a couple of neat Visual Studio 2005 tricks now and I thought I'd post them here so other people could use them too. As I find more of them, I'll add them here.

**Sorting a Multithreaded Build Log (new)**

On a multi-core machine, Visual Studio can use multiple cores to build a solution. Each core will be assigned a different project to build but because many cores run simultaneously, the Build log can become very tangled with lines from one project getting mangled with lines from another project. There is however, a fix for this. In the Output pane, there is a drop down list of different logs to view. One of them is "Build Order" - select this and it will sort the build output by project.

**Opening the Containing Folder of an open file**

Just right click on the tab of the file you are currently editing, and select 'Open Containing Folder'

**Copying The File Path of an open file to the clipboard**

As with the previous tip, right click on the file's tab, and select 'Copy Full Path'

**Converting Tabs to Spaces and Spaces to Tabs**

This one was particularly useful when I had to shift some code between different teams at work. The teams had different coding standards - one team used tabs, the other team used spaces. There are commands in visual studio to automatically convert tabs in a selection to spaces and vice-versa. To access it, right click on any of your toolbars and select 'Customize'. Goto the 'Commands' tab - you will find the 'Convert Spaces To Tabs' and 'Convert Tabs To Spaces' commands under the 'Edit' category.
