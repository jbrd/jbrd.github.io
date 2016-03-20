---
layout: post
title: A class for timing GPU operations in DirectX 10
date: '2008-03-21 13:48:25 +0000'
---

**Update - 22/02/2015:** The source code for this project is no longer available. The blog post still remains for people who previously downloaded it.

My recent work in the field of GPGPU has lead me to require the time it takes to perform specific GPU tasks. I am using DirectX 10 (because part of my research considers the features added in DirectX 10 generation graphics cards). After looking at many ways of profiling the GPU, the best I have found so far has been to use the `D3D10_QUERY_TIMESTAMP` and `D3D10_QUERY_TIMESTAMP_DISJOINT` queries. As well as determining how long a GPU operation takes, it can also determine whether or not the timing has become disjointed (caused by some change in hardware state such as switching from AC/power to battery on a laptop).

I wrote a little class that encapsulates a GPU timer using the `D3D10_QUERY` method. I thought this might be of some interest to other people wishing to profile the GPU in this way, so I have now made this available.

Here are some examples for how to use it:

{% highlight cpp %}
// Example 1: Not checking for failure

// Construct a GPUTimer object
GPUTimer timer( device );

// Time one or more device operations
timer.Start( );
device->Draw( ... );
device->Flush( );
timer.End( );

// Get the elapsed time in seconds between Start and End
float elapsedTime = timer.GetResult( );

// -------------------------------------------------------

// Example 2: Checking for failures

// This bool will receive the result of operations below
bool result;

// Construct a GPU timer object
GPUTimer timer( device, &result );
if ( !result )
{
    // Failed to create timer
    return;
}

// Time one or more device operations
timer.Start( );
device->Draw( ... );
device->Flush( );
timer.End( );

// Get the elapsed time in seconds between Start and End
float elapsedTime = timer.GetResult( &result );
if ( !result )
{
    // The elapsed time is invalid
    return;
}
{% endhighlight %}
