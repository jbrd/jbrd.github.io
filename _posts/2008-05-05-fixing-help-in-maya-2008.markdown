---
layout: post
title: Fixing 'Help' in Maya 2008
date: '2008-05-05 13:37:31 +0100'
---

I have been experiencing a problem with Maya 2008 recently. Whenever I press F1 (or try to open its help), a message box appears complaining that it "cannot find the specified file". However, one can verify that the file does actually exist.

After a bit of experimentation, I managed to figure out a way of fixing this. Maya is located in the following directory on my machine:

* C:\Program Files\Autodesk\Maya2008

The problem is caused by the space in "Program Files". Luckily, Maya allows you to specify an alternate location for its documentation.

From the "Window" menu, select "Settings / Preferences" -> "Preferences". On the left hand side, select the "Help" category (under "Interface"). Scroll down to the bottom of this page to see the "Help Location" options. By default, "Local" is selected. Select "Remote" instead and enter the path to the help files in DOS 8.3 format. Here's what mine looks like:

* C:\Progra~1\Autodesk\Maya2008\docs\Maya2008\en_US

Hit "Save" and it should now be fixed. To verify this, try opening the documentation from Maya by choosing "Help" -> "Maya Help".
