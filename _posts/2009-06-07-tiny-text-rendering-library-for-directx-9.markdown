---
layout: post
title: Tiny Text Rendering Library for DirectX 9
date: '2009-06-07 12:19:33 +0100'
---

![Tiny Text Library for Direct3D 9]({{ site.baseurl }}/images/tinytext.png)

Last week I posted a light-weight, quick-to-integrate debug text drawing library for DirectX 10 [click here to jump to that post]({% post_url 2009-05-29-tiny-text-rendering-library-for-directx-10 %}).

**Update - 22/02/2015:** The source code for this project is no longer available. The blog post still remains for people who previously downloaded it.

Based on some feedback, I decided to port this to DirectX 9.

The only changes in its' public interface are the obvious changes from using DirectX 10 types to DirectX 9 types.

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
