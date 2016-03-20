---
layout: post
title: On Detecting Invalid C++ Memory Addresses on Windows
date: '2008-02-29 20:26:52 +0000'
---

I have recently been writing some unit tests for some of my software. One of my classes (which I’ll call ‘Foo’) holds a pointer to another class (which I’ll call ‘Bar’). ‘Foo’ should be notified when ‘Bar’ is destroyed (so that its' pointer can be set to NULL). I wanted to write a unit test for this because if broken, it could cause me all sorts of trouble.

My unit test framework can detect assertions, and I thought the easiest way of testing this functionality would be to add an assertion that the pointer is to a valid memory location, and put this in a location that should only be reached if the pointer is valid.

When implementing this, I found that detecting an invalid memory address is actually rather tricky. I am using Visual C++ (and hence the Visual C++ CRT) for memory allocations. My first guess was to use the `_CrtIsValidPointer` function.  However, this function doesn’t do what you’d think. Take a look at the following code:

{% highlight cpp %}
int * ptr = new int( );
delete ptr;
if ( _CrtIsValidPointer( ptr, sizeof *ptr, 1 ) == 0 )
{
	throw std::exception( );
}
{% endhighlight %}

As you can see, when `ptr` is deleted, it is immediately invalid. However, the exception is never thrown because `_CrtIsValidPointer` fails to detect the problem. When looking at the implementation of `_CrtIsValidPointer`, something else surprised me – all it does is check for a NULL pointer!

Taking a closer look at the documentation, there is also a `_CrtIsValidHeapPointer` function. I plugged this into the above code, so that it now looks like this:

{% highlight cpp %}
int * ptr = new int( );
delete ptr;
if ( _CrtIsValidHeapPointer( ptr ) == 0 )
{
	throw std::exception( );
}
{% endhighlight %}

Now this does work – but there are some caveats. Firstly, `_CrtIsValidHeapPointer` is removed under the ‘Release’ configuration. This isn’t very helpful, as it is often useful to run the unit tests in both Debug and Release. Secondly, the implementation of `_CrtIsValidHeapPointer` uses `HeapValidate` which breaks execution under the Debug configuration. This causes `_CrtIsValidHeapPointer` to never return, which is also not very helpful for unit testing (you might for example, have other tests you’d like to run – breaking execution causes the program to crash and requires user intervention to continue execution).

My solution is to track the memory allocations myself. This is probably not a good idea in code that is shipped to clients, however for unit tests this suits perfectly. The solution works in both Debug and Release, theoretically works on multiple platforms (I’ve only used it on Windows), and is incredibly simple! See the following example:

{% highlight cpp %}
// A vector containing all allocations
std::vector< void *, InvisibleAllocator< void * > > Allocations;

// Checks whether a memory address is valid or not
bool MemoryChecker::IsValidPtr( void * address )
{
	return find( Allocations.begin( ), Allocations.end( ), address )
	       != Allocations.end( );
}

// Allocates the specified amount of memory, and tracks
// the allocation
void * operator new ( size_t bytes )
{
	void * mem = malloc( bytes );
	Allocations.push_back( mem );
	return mem;
}

// Frees the specified amount of memory, and removes the
// address from the list of tracked allocations
void operator delete ( void * address )
{
	Allocations.erase(
		remove(
			Allocations.begin( ),
			Allocations.end( ),
			address
		),
		Allocations.end( )
	);

	free( address );
}
{% endhighlight %}

In the above example, operator new and operator delete are overloaded to keep track of all allocations (using a vector). Notice that the vector uses a custom allocator `InvisibleAllocator`. This is because the vector also dynamically allocates memory - the custom allocator by-passes the operator new and operator delete so that the vector allocations aren’t tracked (if they are tracked, a stack overflow will occur). The `MemoryChecker::IsValidPtr` function can be used to check whether or not the specified address is valid.
