---
layout: post
title: Tiny Text Rendering Library for DirectX 10
date: '2009-05-29 19:10:15 +0100'
---

![Tiny Text Library for Direct3D 10]({{ site.baseurl }}/images/TinyText.png)

**Update - 22/02/2015:** The source code for this project is no longer available. The blog post still remains for people who previously downloaded it.

I've posted the source code for my light-weight text rendering library for Direct3D 10. The goal of the "TinyText" library is to provide a quick-to-integrate debug text drawing routine. It was not intended to provide a customer-facing font rendering solution and for this reason, it uses a single embedded font of a single size and has a minimal set of rendering options.

It was designed to be used in situations where you need to print something out to the screen while keeping risk of failure to a minimum. For this reason the single (3kb) font is embedded into the code (so that it doesn't require any I/O and is not dependant on operating system font support). By default it maintains the original state of the D3D10 device so it should integrate nicely into already established renderers (although this can be turned off if speed is an issue). It doesn't allocate any memory on the heap, and only ever allocates Direct3D 10 objects via a Direct3D 10 device that you pass it.

Here are some examples of how to use the library:

{% highlight cpp %}
// Example 1: Not checking for failure

// Construct a TinyTextContext_c object with a maximum capacity
// of 128 characters
TinyTextContext_c context( device, 128 );

// During your frame update, add some text to the context which
// will be printed 20 pixels from the left-hand side and 20 pixels
// from the top side of your viewport (printed using the default
// colour of white)
context.Print( viewport, "Hello World", 20, 20 );

// When you wish to render the text, call 'Render' on the context
context.Render( );

// -------------------------------------------------------

// Example 2: Checking for failures

// This 'bool' will receive the result of the operations below:
bool result = false;

// Construct a TinyTextContext_c object with a maximum capacity
// of 128 characters
TinyTextContext_c context( device, 128, &result );

if ( !result )
{
    // Failed to construct a valid context
    return;
}

// Try adding some text to the context
result = context.Print( viewport, "Hello World", 20, 20 );

if ( !result )
{
    // Failed to add some text to the context
    return;
}

// Try to render the current frame's text
result = context.Render( );

if ( !result )
{
    // Failed to render
    return;
}

// -------------------------------------------------------

// Example 3: Adding different colour text (light green in this case)
// (colour is of the format: 0xAABBGGRR)
context.Print( viewport, "Hello World", 20, 20, 0xFF80FF80 );

// -------------------------------------------------------

// Example 4: Limiting number of characters (prevent buffer overruns)
context.Print( viewport, 11, "Hello World", 20, 20, 0xFF80FF80 );

// -------------------------------------------------------

// Example 5: Disabling the saving and restoring of D3D device state
context.Render( false );
{% endhighlight %}

NOTE: For those that are interested, the embedded font is called "Triskweline" and can be freely downloaded [here](http://www.netalive.org/tinkering/triskweline/).
