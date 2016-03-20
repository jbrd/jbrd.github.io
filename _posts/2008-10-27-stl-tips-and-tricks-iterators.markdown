---
layout: post
title: 'STL Tips and Tricks: Iterators'
date: '2008-10-27 22:42:14 +0000'
---

Over the past few weeks, I've been helping out at Abertay University in the labs for the "BSc Hons Computer Games Technology" course. At the moment, the students are familiarising themselves with the STL. Several really good questions were raised during the labs, and I proceed to answer these questions in the next series of posts.

**What are iterators? Why are they useful?**

An iterator is an object that works very much like a pointer, in that it references a single item of a container (vector,list,etc) at any one time. You can gain access to the object it currently referencing in the same way as you "defererence" a pointer:

{% highlight cpp %}
std::vector< int >::iterator myIterator;

// The iterator supports the dereference operator:
*myIterator = 1;
{% endhighlight %}

When referencing an object, an iterator also supports the pointer-to-member operator:

{% highlight cpp %}
// An example object
struct Point { float x, y; };

// Our iterator object:
std::vector< Point >::iterator myIterator;

// The iterator also supports the pointer-to-member (->) operator:
std::cout << myIterator->x << std::endl;
std::cin >> myIterator->y >> std::endl;
{% endhighlight %}

As well as giving you access to an item inside your container, the iterator object also allows you to move (aka iterate) forward (and sometimes even backward) through the items inside your container, using the "increment" and "decrement" operators:

{% highlight cpp %}
// Our iterator object:
std::vector<Point>::iterator myIterator;

// Move to the next item in your container
myIterator++;

// Move to the previous item in your container
myIterator--;
{% endhighlight %}

Iterators are also comparable - the equality operators (== and !=) are available for all iterators, and for some containers you can even compare two iterator objects to determine which of the objects is closer to the beginning or end of the vector, as shown below:

{% highlight cpp %}
// Declare two iterators:
std::vector<int>::iterator a = myVector.begin();
std::vector<int>::iterator b = myVector.end();

// If the vector is empty, this expression will return true
a == b;

// If there is more one or more item in the vector, this
// expression will return true...
a < b;

// ... and this expression will return false
a > b;
{% endhighlight %}

With all of these features, an iterator can be used to move linearly through the items of a container, as shown below:

{% highlight cpp %}
// Print each item in the container
std::vector<int> myVector;
std::vector<int>::iterator i = myVector.begin();
for ( ; i < myVector.end(); ++i )
{
    std::cout << *i << std::endl;
}
{% endhighlight %}

Some of you may recall that a vector can be indexed in the same way as an array (using the [] operator). So why would you want to use an iterator instead of an integer loop counter? Well, one of the key benefits over the iterator design is that it provides a common interface for iteration throughout all types of STL container. This is particularly important for the types of container that cannot be indexed (the list for example). Even if a container cannot be indexed, an iterator can still be provided that allows you to visit each item of the list. And finally, when using an iterator you don't need to worry about the underlying data structure in order to iterate it as this is handled by the iterator. For example, while a vector iterator might maintain the index of the current item, the list iterator internally takes care of walking the linked list pointers. In a nutshell - iterators provide a powerful interface for visiting the items of an STL container.
