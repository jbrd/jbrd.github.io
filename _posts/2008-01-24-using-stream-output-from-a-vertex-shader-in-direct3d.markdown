---
layout: post
title: Using "Stream Output" from a Vertex Shader in Direct3D
date: '2008-01-24 17:05:07 +0000'
---

Stream Output is a new stage of the Direct3D 10 graphics pipeline, that allows the data output by the geometry shader or vertex shader to be output directly into GPU memory, as opposed to being passed to the later stages of the pipeline. This data can then be passed back as an input to another shader (as either a vertex buffer, constant buffer, or texture buffer).

My recent work on GPU Accelerated Collision Queries has lead me to utilise the "Stream Output" feature of the API. I was however slightly confused when trying to use Stream Output from a vertex shader (as I am not currently using geometry shaders). The API documentation leads you to believe that when you wish to use Stream Output with a vertex shader, you must call `ID3D10Device::CreateGeometryShaderWithStreamOutput`, to create an 'empty' geometry shader, which you then bind to the device when wanting to enable Stream Output. The above method takes a pointer to the compiled geometry shader byte-code, and the API documentation tells you to pass `NULL` for the byte-code (which implies that you must pass in 0 for the byte-code size parameter). When doing this however, the function fails, and if you are using the Debug runtime, you will get an error message printed to your debugger's output window stating that the size of your specified bytecode is incorrect.

After a bit of research, I found out that you actually have to pass in your vertex shader's byte code (and the size of your vertex shader's byte code). When doing so, assuming the other parameters are correct, it should return a dummy geometry shader object that you can bind to the device to enable stream output.
