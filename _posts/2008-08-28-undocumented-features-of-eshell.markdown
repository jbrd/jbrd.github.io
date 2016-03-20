---
layout: post
title: Undocumented Features of EShell
date: '2008-08-28 20:22:44 +0100'
---

In my last post I commented on EShell - Insomniac's environment setup script. After delving into the code, I discovered some undocumented features which are really useful:

**-verbose Command Line Option**

This causes EShell to output additional error logging to the console which can be quite useful when tracking down problems

**EnvVar - Path Attribute**

When assigning a path to an environment variable, instead of using the 'value' attribute, use the 'path' attribute. As well as assigning your specified path to the environment variable, it will also clean it up (remove duplicate directory separators, etc)

**EnvVar - Process Attribute**

When defining an environment variable, instead of using the 'value' attribute to specify an absolute value to assign to the variable, you can use 'process' to compute a value using a perl expression. To make this work you need to specify `$value = your_expression_here`
