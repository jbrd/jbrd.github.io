---
layout: post
title: Creating immutable data classes in Python with namedtuple
date: '2015-02-24 22:31:55 +0000'
---

I was reviewing some Python code at work today, in which we wanted to wrap up a number of fields in a simple immutable data class. Our initial attempt was to construct a long-winded class definition, for example:

{% highlight python %}

class Parameters( object ):

	def __init__( self, x, y, z ):
		super( Parameters, self ).__init__( )
		self._x = x
		self._y = y
		self._z = z

	@property
	def x( self ):
		return self._x

	@property
	def y( self ):
		return self._y

	@property
	def z( self ):
		return self._z

{% endhighlight %}

Our real-world class had many more properties than the example above, and during the review, I did wonder whether there was a more elegant way of expressing this. After I bit of research, I eventually found `collections.namedtuple`. This function can be used to construct a new class type, which has the same semantics as a tuple, but provides access to its members by name rather than by index. Using this function, the above class can be expressed as follows:

{% highlight python %}
import collections
Parameters = collections.namedtuple( 'Parameters', [ 'x', 'y', 'z' ] )
{% endhighlight %}

The class type returned by `collections.namedtuple` can be used in exactly the same way as in the first example:

{% highlight python %}

# The namedtuple can be constructed in the same way
params = Parameters( 1, 2, z = 3 )

# The properties can be accessed in the same way
print params.x

# The properties are immutable
try:
	params.x = 200
except:
	print 'Cannot modify a namedtuple member'

# Attempting to access a non-existant property raises an exception
try:
	print params.w
except:
	print 'Cannot get non-existant namedtuple member'

{% endhighlight %}

One notable difference between the two versions of this class type is that with namedtuple, you aren't allowed to set a non-existant property either. This is presumably such that the namedtuple matches the semantics of a plain tuple:

{% highlight python %}

# Attempting to set a non-existant property also raises an exception
try:
	params.w = 200
except:
	print 'Cannot set non-existant namedtuple member'

{% endhighlight %}
