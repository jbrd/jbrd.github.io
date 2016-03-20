---
layout: post
title: 'C++0x: RValue references cannot be bound to lvalues'
date: '2011-03-12 10:53:58 +0000'
---

I have recently been reading up about the new language features of C++0x. One of these new features allows you to create references to rvalues, i.e:

{% highlight cpp %}
int && foo = 5;
{% endhighlight %}

There is a wealth of information about these and why they are useful:

* [A Brief Introduction to RValue References](http://www.open-std.org/jtc1/sc22/wg21/docs/papers/2006/n2027.html)
* [Rvalue References: C++0x Features in VC10, Part 2](http://blogs.msdn.com/b/vcblog/archive/2009/02/03/rvalue-references-c-0x-features-in-vc10-part-2.aspx)

However, the semantics of rvalue references have slightly changed since these documents were published. You used to be able to bind an lvalue to an rvalue reference, i.e:

{% highlight cpp %}
int foo;
int && bar = foo;
{% endhighlight %}

This is no longer allowed and will generate a compiler error (more details [here](http://www.open-std.org/JTC1/SC22/WG21/docs/papers/2008/n2812.html)). As a result, several online sources of information (including the above documents) now contain broken code and this can be an additional source of confusion when experimenting with this new language feature. So take care - Visual Studio 2010 uses these updated semantics, and so does GCC (at the time of writing, I tested this with version 4.5.2).
