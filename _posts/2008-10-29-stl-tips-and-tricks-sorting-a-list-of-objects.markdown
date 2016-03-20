---
layout: post
title: 'STL Tips and Tricks: Sorting a list of objects'
date: '2008-10-29 22:00:27 +0000'
---

Here's another one for my lab group at Abertay University. In these series of articles, I proceed to answer some interesting questions that some of the students have asked. This time, the question is:

**How do I sort an std::list of objects?**

When using the STL list, providing that the items in your list can be compared (i.e. they override the comparison operators '<', '>', etc), then you can sort the elements of your list in ascending order using the list's sort method:

{% highlight cpp %}
// Create a list
std::list< int > myList;
myList.push_back(3);
myList.push_back(1);
myList.push_back(2);

// Sort the list in ascending order (1,2,3)
myList.sort();
{% endhighlight %}

Lets now imagine we have a collection of 'Employee' objects, and we would like to sort by 'age':

{% highlight cpp %}
struct Employee
{
    char firstName[ 32 ];
    char lastName[ 32 ];
    int age;
    float salary;
};
{% endhighlight %}

The STL doesn't know how to sort these objects by default, and we must therefore tell it how to do so.

The STL provides an overload (read alternative version) of the list's 'sort' method that allows you to specify a function for it to use to compare the items in your list. The function that 'sort' expects must conform to the following rules:

* It must have two arguments and these arguments must be of the same type as the items in your list
* It must return a boolean to indicate which of the two arguments should be placed first in the sorted list:
	* It should return true if the object passed in as the first argument should appear before the object passed in as the second argument
	* Or false otherwise

With this in mind, we can create a compatible function to sort our 'Employee' objects:

{% highlight cpp %}
bool SortByAge( const Employee & first, const Employee & second )
{
    // The expression below will return 'true' if 'first' should
    // come before 'second' in the sorted list, or 'false' otherwise
    return first.age < second.age;
}
{% endhighlight %}

Now that we have a function that is compatible with the STL list's 'sort' method, we can pass the name of this function in as an argument to the 'sort' method as shown below:

{% highlight cpp %}
std::list< Employee > employees;
employees.sort( SortByAge );
{% endhighlight %}
