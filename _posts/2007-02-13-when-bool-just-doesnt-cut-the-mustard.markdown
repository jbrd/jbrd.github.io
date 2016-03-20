---
layout: post
title: When bool just doesn't cut the mustard
date: '2007-02-13 21:47:29 +0000'
---

Recent problems have lead me to review the way I handle errors and pass results around. I used to have every function that can fail or succeed return a bool based on the result. This is logical - my function can either fail or succeed. Sometimes, these functions are nested in calls to other functions. When my function fails, 'false' would be passed down the call stack until the error is finally handled. So when we handle the error, we know that something has failed - we don't know what, why or how (ok so we could step through it with a debugger but we cannot do this in a shipped piece of software).

Then, I remembered the MStatus object in the Maya API. It solves all of these problems nicely by encapsulating a result of an operation in a class. The basic idea is to have a class, which contains a public enumeration of all possible results, and an instance of this enumeration as a member:

{% highlight cpp %}
class Result
{
public:
	enum ResultID
	{
		Success = 0,
		FileNotFound,
		InvalidArgument,
	};

private:
	ResultID m_Result;
};
{% endhighlight %}

First of all, you will notice how small this class is - small enough to pass by value. On certain platforms (like the Xbox 360 for example) it would be advantageous to force the enumeration to be 32-bits in size, to save the CPU from having to perform extra sign-extend operations. Secondly, because the enumeration is stored in the class, the result codes do not litter the global namespace, but they are still accessible (i.e. using `Result::Success`, `Result::FileNotFound`, etc). Now, lets add some methods to this class. First of all, we need a constructor that will initialise `m_Result` (otherwise, the class would be useless!). This constructor has added value, as it will also allow us to do an implicit conversion from a `ResultID` to a `Result`. Sometimes, all we want from a result is to know whether or not an operation has succeeded or failed. For this, we can add a bool operator. Finally, if the result is bad and we need to handle the error, we would like a way of generating an error string so that it can be presented to the user. Here is the next version of the class:

{% highlight cpp %}
class Result
{
public:
	enum ResultID
	{
		Success = 0,
		FileNotFound,
		InvalidArgument,
	};

	Result( ResultID id ) : m_Result( id ) { }

	operator bool ( ) { return m_Result == Success; }

	const char* ToString( ) const
	{
		static const char SuccessStr[] = "Operation succeeded";
		static const char FileNotFoundStr[] = "File not found";
		static const char InvalidArgStr[] = "Invalid argument";
		static const char UnknownStr[] = "Unknown result";

		switch ( m_Result )
		{
			case Success: return SuccessStr;
			case FileNotFound: return FileNotFoundStr;
			case InvalidArgument: return InvalidArgStr;
			default: return UnknownStr;
		}
	}

private:
	ResultID m_Result;
};
{% endhighlight %}

Notice how the `ToString` method encapsulates the convertion of a result into a human readable error string? Long gone are the days where your code is littered with duplicated error string literals! Now, lets see how you use this class:

{% highlight cpp %}
Result DoSomething( )
{
	if ( !fileOpened )
	{
		return Result::FileNotFound;
	}

	return Result::Success;
}

void AnotherFunction( )
{
	Result result = DoSomething( );
	if ( !result )
	{
		std::cout << result.ToString( ) << std::endl;
	}
}
{% endhighlight %}
