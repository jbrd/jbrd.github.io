---
layout: post
title: Rendering Points as Spheres With Displacement in Houdini
---

Here is a step-by-step guide to rendering points as spheres in Houdini
with a displacement shader.

First of all, start up a new scene in Houdini, and in the ```/obj/``` context,
lay down  a new *Geometry* object:

![Step 1]({{ site.baseurl }}/images/20160319_Step01.png)

Now, dive into this node and place down an *Add* SOP. Set 'Number of Points'
to 1, and enable the first point. We will leave its' position at the origin.

![Step 2]({{ site.baseurl }}/images/20160319_Step02.png)

Whilst still on the *Add* SOP, switch to the 'Particles' tab and enable
'Add Particle System'. This will add a particle system primitive to the stream.
It seems that whilst particles can have displacement shaders applied, plain points
cannot.

![Step 3]({{ site.baseurl }}/images/20160319_Step03.png)

Next, we are going to give our point a radius. Feed the result of the *Add* SOP
into a *Point* SOP, and on its' 'Particle' tab, switch 'Keep Scale' to 'Add Scale',
and set the scale value to '1'.

![Step 4]({{ site.baseurl }}/images/20160319_Step04.png)

At this stage, we should be able to set up a simple Mantra render and verify that
our point is rendering as a unit sphere.

To do this, switch to the ```/out/``` context and lay down a *mantra* ROP. Switch
to the 'Render' panel and hit 'Render'. You should see a default-lit unit-sphere
in the resultant image.

![Step 5]({{ site.baseurl }}/images/20160319_Step05.png)

We are now going to set up a displacement shader. In the ```/SHOP/``` context,
lay down a *Material Shader Builder* node, and dive inside of it.

By default, this network should already have an empty surface and displacement
shader. Lay down a *Displace Along Normal* VOP, and connect its 'dispP' and
'dispN' outputs to the 'P' and 'N' inputs on the 'displacement_output' node. In
the 'Parameters' panel, set the 'amount' to -0.5.

![Step 6]({{ site.baseurl }}/images/20160319_Step06.png)

We also need to supply Mantra with displacement bounds (if you don't, you will
probably observe dicing artefacts). We can do this by laying down a *Properties*
VOP in our material, and connect its' output to the third input on the
'output_connect' node.

![Step 7]({{ site.baseurl }}/images/20160319_Step07.png)

Once you have done this, right-click the *Properties* node and select 'Edit
Parameter Interface...'. In the dialog that appears, find the 'Render Properties'
tab, and inside this, drag the 'Mantra -> Shading -> Displacement Bound' parameter
into the middle panel underneath 'root' and hit 'Accept'.

![Step 8]({{ site.baseurl }}/images/20160319_Step08.png)

Now we can select the *Properties* node, and in the 'Parameters' panel, set the
'Displacement Bound' parameter to 0.5, to match the magnitude of our displacement
value.

The final thing we need to do is assign our new material to our points. To do this,
go back to the ```/obj/``` context and select the geometry object. In the 'Parameters'
panel, find the 'Material' tab, and underneath this, set the 'Material' path to point
to your new material VOP.

![Step 9]({{ site.baseurl }}/images/20160319_Step09.png)

Now we can head back to the 'Render' panel and hit 'Render' again. This time, the
sphere should appear half-as-small, and this is a result of the negative displacement
along the surface normal.

![Step 10]({{ site.baseurl }}/images/20160319_Step10.png)
