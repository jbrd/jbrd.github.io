---
layout: post
title: Very Cheap Fake Cloud Shadows
date: '2009-10-18 13:27:30 +0100'
---

![Very Cheap Cloud Shadows]({{ site.baseurl }}/images/VeryCheapCloudShadows.png)

In outdoor scenes, you can often get a lot of mileage out of casting fake cloud shadows onto the ground. It adds a bit of movement to your scene and makes your objects look less flat. When integrating this kind of effect into a scene, you can either do it as a separate pass (which has obvious performance penalties) or integrate the effect directly into your current shaders. If these shaders are already quite expensive, you’re often faced with limitations. Adding to these limitations on the PC are the restrictions imposed by your minimum target spec (minimum shader model for example).

Here’s a really simple, cheap and nasty fake cloud shadow effect that can be evaluated in the vertex shader in 10 instructions, and doesn’t rely on vertex texture fetch. The effect is only driven by world-space position, so if you can afford it, you can avoid vertex interpolation artefacts by interpolating the world space position into the pixel shader and evaluating the effect per-pixel instead.

The idea behind this effect is to pass a 2x2 gray-scale image (four scalars) into the vertex shader via a shader constant. You then use the X and Z components of your world-space position to sample this image in the shader, performing the bilinear filtering and mirroring logic that you would usually get from the texture unit.

The shader code looks like this:

{% highlight cpp %}
// Compute UV
float2 uv = ( Input.Position.xz + fCloudOffset ) * fCloudScale;
float2 mirroredUV = abs( ( frac( uv ) * 2 ) - 1 );

// Sample the 2x2 image (stored in fCloudQuad) with bilinear
// filtering
float2 a = lerp( fCloudQuad.xy, fCloudQuad.zw, mirroredUV.yy );
float cloudFactor = lerp( a.x, a.y, mirroredUV.x );
{% endhighlight %}

You can animate this effect on the CPU in two ways. You can add a per-frame delta to fCloudOffset to make the clouds scroll, and animate the values inside the 2x2 image (stored in fCloudQuad) to perturb the cloud shadows over time.
