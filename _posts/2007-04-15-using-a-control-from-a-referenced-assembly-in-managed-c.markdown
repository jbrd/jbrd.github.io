---
layout: post
title: Using A Control from a Referenced Assembly in Managed C++
date: '2007-04-15 17:06:53 +0100'
---

This is more of a tip than an article - I thought I'd post it here, incase other people were having the same problem. I have a Windows Forms control in a referenced assembly that I want to use in my Managed C++ project. I add the assembly to the project's references, and I am now at a stage where I want to use the control in one of my forms. I open the form, and look in the toolbox to see if the IDE was clever enough to put the control inside the toolbox - it wasn't. Oh well, I know that the Windows Forms control derrives from Panel so I create a Panel in the Windows Forms Designer, and then change the control's type manually in the code. Hit build, everything compiles, everything runs.

I now open up the Windows Forms Designer again, but an error appears with the following message:

*"Could not find type 'CustomControl'. Please make sure that the assembly that contains this type is referenced. If this type is a part of your development project, make sure that the project has been successfully built."*

Well that's strange because I added the assembly to the references file, and successfully built the project. I finally tracked this down to the way I added the code to the form's header file. It appears that the Windows Forms Designer doesn't like the `using` keyword. Because the custom control is underneath three nested namespaces, I added a `using` declaration at the top of the header file, and then just used `CustomControl` everywhere (instead of `Namespace1::Namespace2::Namespace3::CustomControl`). To make it work I simply removed the using declaration at the top of the file, and used fully qualified names whenever refering to the type. Problem solved!
