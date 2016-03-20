---
layout: post
title: Passing integer references in the Maya Python API
date: '2010-01-14 21:40:45 +0000'
---

In the Maya Python API, there are many functions that take reference to an integer (`int &`) - the `MItMeshPolygon.numTriangles` function for instance. The function expects a reference to an integer, and if you don't pass it one, you might end up with an error message reading something like `'MItMeshPolygon_numTriangles', argument 2 of type 'int &'`.

This took me way longer to work out than it should have done, so I'm posting it here in case anyone else has similar problems. The solution is to use the MScriptUtil class to convert to and from reference types:

{% highlight python %}	
# In this example, we use an MItMeshPolygon iterator
polyIterator = OpenMaya.MItMeshPolygon( mesh.dagPath() )

# Create an integer reference
numTrisPtr = OpenMaya.MScriptUtil().asIntPtr()

# Pass the integer reference into 'numTriangles'
polyIterator.numTriangles(numTrisPtr)

# To access the value of the integer reference, use the 'asInt' method
numTris = OpenMaya.MScriptUtil(numTrisPtr).asInt()
{% endhighlight %}
