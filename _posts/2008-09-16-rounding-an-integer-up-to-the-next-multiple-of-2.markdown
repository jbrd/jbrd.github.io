---
layout: post
title: Rounding an integer up to the next multiple of 2
date: '2008-09-16 08:46:13 +0100'
---

Here's a neat little bit hack for rounding an integer up to the next multiple of 'n' (where 'n' is a power of two):

{% highlight cpp %}
uint Align( uint numberToAlign, uint alignment )
{
    return ( numberToAlign + alignment - 1 ) & ~( alignment - 1 );
}
{% endhighlight %}

So for example, rounding 3 to the nearest multiple of 4 would yield 4. Rounding 16 to the nearest multiple of 16 would yield 16.

This is quite useful for custom memory allocation, when you want to ensure that an allocated memory address lies on an 'n' byte boundary.
