---
layout: post
title: Prefer D3DX10Compile... over D3D10Compile...
date: '2008-04-07 12:21:04 +0100'
---

I was looking over some slides from the DirectX 10 SIGGRAPH '07 course the other day, and one of the slides caught my attention. It contained some interesting information about the Direct3D 10 shader compilation routines. You will notice that the DirectX SDK provides two versions of its shader compilation function:

* `D3D10CompileShader`
* `D3DX10Compile...`

My original opinion was to use the D3D10 function - afterall, why use D3DX when you can just use D3D? However, in this case I was actually quite wrong. Here's why:

`D3D10CompileShader` calls the compiler that is shipped with the operating system. In contrast, the `D3DX10Compile...` functions call the compiler that is shipped with the SDK which is often more up to date than the operating system's version of the compiler. Therefore, one should always prefer `D3DX10Compile...` over `D3D10Compile...`
