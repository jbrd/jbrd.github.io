---
layout: post
title: 'Maya 2008 SDK: Using MLibrary when you don''t have the MFC libraries installed'
date: '2008-01-21 19:04:19 +0000'
---

I ran into this problem the other day, and thought I'd post it here in case other people have the same issue. I was upgrading a program that used an older version of the Maya SDK, to use the Maya 2008 SDK and received a linker error:

* Cannot find `mfc80.lib`

I knew why this was happening - when I installed Visual Studio 2005, I deliberately didn't install the MFC libraries because I know I would never use them! Luckily, there is a preprocessor definition you can enable that will prevent the `MLibrary` source file from adding `mfc80.lib` to the library dependencies. It is: `MLIBRARY_DONTUSE_MFC_MANIFEST`
