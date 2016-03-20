---
layout: post
title: 'HLSL: ''discard'' doesn''t ''return''!'
date: '2008-02-14 20:24:20 +0000'
---

I have recently been trying to track down an issue with one of my GPGPU pixel shaders. The shader will perform a ray intersection with a collection of triangles, partitioned into a uniform grid structure (a la Purcell et al) in a single pass. The pixel shader runs on a screen aligned quad, where each pixel on the quad represents an intersection test. Sometimes, the number of intersection tests is less than the number of pixels on the render target, and therefore some of the pixels are merely padding at the bottom of the render target (they never contain the result of an intersection).

Attempting to run the intersection code on the "padding" pixels is potentially dangerous, because the shader contains some loops that potentially could never terminate if invalid data is passed into them. There is therefore an "early-out" test that is implemented as follows:

{% highlight cpp %}
if ( rayId <= NumRays )
{
	discard;
}
{% endhighlight %}

With the code as-is, I was getting one or more pixels that were getting caught inside the loops that follow this "early out" test. I couldn't figure out what was wrong with the code (everything looked fine, including the generated assembly), so I e-mailed the DirectX support address (I was beginning to think it was a bug in DirectX). They responded within a couple of days, with a fix. The problem was caused by the fact that `discard` doesn't actually exit the shader (the shader will continue to execute). It merely instructs the output merger stage not to output the result of the pixel (which must still be returned by the shader). I assumed that if one discards the pixel, one shouldn't need to output the result, but this is not the case. So be warned! Adding a `return` statement after the `discard` statement fixed the problem.
