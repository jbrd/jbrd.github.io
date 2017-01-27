---
layout: post
title: Aperiodic Improved Perlin Noise
---

![Aperiodic Improved Perlin Noise]({{ site.baseurl }}/images/Noise.png)

In this post, I will show how the reference implementation of Improved Perlin Noise can be rewritten to yield an aperiodic noise function.

The reference implementation for Improved Perlin Noise (which can be found on Ken Perlin's website [here](http://mrl.nyu.edu/~perlin/noise/)), is given (in Java) as:

{% highlight java %}
static public double noise(double x, double y, double z) {
    int X = (int)Math.floor(x) & 255,                  // FIND UNIT CUBE THAT
        Y = (int)Math.floor(y) & 255,                  // CONTAINS POINT.
        Z = (int)Math.floor(z) & 255;
    x -= Math.floor(x);                                // FIND RELATIVE X,Y,Z
    y -= Math.floor(y);                                // OF POINT IN CUBE.
    z -= Math.floor(z);
    double u = fade(x),                                // COMPUTE FADE CURVES
           v = fade(y),                                // FOR EACH OF X,Y,Z.
           w = fade(z);
    int A = p[X  ]+Y, AA = p[A]+Z, AB = p[A+1]+Z,      // HASH COORDINATES OF
        B = p[X+1]+Y, BA = p[B]+Z, BB = p[B+1]+Z;      // THE 8 CUBE CORNERS,
 
    return lerp(w, lerp(v, lerp(u, grad(p[AA  ], x  , y  , z   ),  // AND ADD
                                   grad(p[BA  ], x-1, y  , z   )), // BLENDED
                           lerp(u, grad(p[AB  ], x  , y-1, z   ),  // RESULTS
                                   grad(p[BB  ], x-1, y-1, z   ))),// FROM  8
                   lerp(v, lerp(u, grad(p[AA+1], x  , y  , z-1 ),  // CORNERS
                                   grad(p[BA+1], x-1, y  , z-1 )), // OF CUBE
                           lerp(u, grad(p[AB+1], x  , y-1, z-1 ),
                                   grad(p[BB+1], x-1, y-1, z-1 ))));
}
{% endhighlight %}

The reference implementation makes use of a permutation table (omitted for brevity)
to build an 8-bit hash for eight corners of the unit cube surrounding the given input
coordinate. The permutation table is a fixed size of 256 but actually repeated to
conveniently avoid buffer overflow errors.

To ensure that we don't overflow this table, the modulus operator is first applied 
to the input coordinates. We can think of this as an initial hashing function:

{% highlight cpp %}
int initial_hash(double x) { return (int)floor(x) & 255; }
{% endhighlight %}

A consequence of this is that the reference implementation repeats for every
256 units.

The first step in removing this repetition is to apply a better initial hashing
function, that makes use of the full precision range of the input value. For
example, we could choose to reuse the permutation table to perform a Pearson Hash
of the input value:

{% highlight cpp %}
int initial_hash(int value) {
    int result = 0;
    for (int i = 0; i < sizeof(value); ++i, value >>= 8) {
        result = p[result ^ (value & 0xff)];
    }
    return result;
}
{% endhighlight %}

We could then change the first three lines of the noise function to apply this
better hashing scheme instead:

{% highlight cpp %}
int X = initial_hash((int)floor(x)),                  // FIND UNIT CUBE THAT
    Y = initial_hash((int)floor(y)),                  // CONTAINS POINT.
    Z = initial_hash((int)floor(z));
{% endhighlight %}

However, this isn't enough. The following lines that make use of the X,Y and Z 
values make a very important assumption on the initial hashing function used to
generate them:

{% highlight cpp %}
initial_hash(x + 1) = initial_hash(x) + 1
{% endhighlight %}

Whilst the modulus operator has this property, our new hashing function doesn't.
We can see how this affects the computation of the gradient hashes by expanding
one of them out:

{% highlight cpp %}
  p[ BB + 1 ] 
= p[ p[ B + 1 ] + Z + 1 ] 
= p[ p[ p[ X + 1 ] + Y + 1 ] + Z + 1 ] 
{% endhighlight %}

For the positive corners of the unit grid we are adding 1 to the X, Y, and Z
terms but these terms are the results of the initial hashing function, and will
therefore only work if our initial hashing function maintains the assumption
stated above.

In breaking this assumption, we must rewrite these terms as well. We'll start
by computing the hash of the positive corners too:

{% highlight cpp %}
int XX = initial_hash((int)floor(x)+1),    // FIND UNIT CUBE ADJACENT
    YY = initial_hash((int)floor(y)+1),    // TO THIS POINT.
    ZZ = initial_hash((int)floor(z)+1);
{% endhighlight %}

Then we can rewrite these these terms such that, for example, the expression:

```p[ p[ p[ X + 1 ] + Y + 1 ] + Z + 1 ]```

becomes:

```p[ p[ p[ XX ] + YY ] + ZZ ]```

After some factorisation, here is the resultant function (in C++):

{% highlight cpp %}
double aperiodic_noise(double x, double y, double z) {
    double FX = floor(x),
           FY = floor(y),
           FZ = floor(z);
    int X = initial_hash((int)FX),            // FIND UNIT CUBE THAT
        Y = initial_hash((int)FY),            // CONTAINS POINT.
        Z = initial_hash((int)FZ);
    int XX = initial_hash((int)FX+1),         // FIND UNIT CUBE ADJACENT
        YY = initial_hash((int)FY+1),         // TO THIS POINT.
        ZZ = initial_hash((int)FZ+1);
    x -= FX;                                      // FIND RELATIVE X,Y,Z
    y -= FY;                                      // OF POINT IN CUBE.
    z -= FZ;
    double u = fade(x),                           // COMPUTE FADE CURVES
           v = fade(y),                           // FOR EACH OF X,Y,Z.
           w = fade(z);
    int A = p[X ], AA = p[A+Y], AB = p[A+YY],     // HASH COORDINATES OF
        B = p[XX], BA = p[B+Y], BB = p[B+YY];     // THE 8 CUBE CORNERS,
    return lerp(w, lerp(v, lerp(u, grad(p[AA+Z ], x  , y  , z   ),  // AND ADD
                                   grad(p[BA+Z ], x-1, y  , z   )), // BLENDED
                           lerp(u, grad(p[AB+Z ], x  , y-1, z   ),  // RESULTS
                                   grad(p[BB+Z ], x-1, y-1, z   ))),// FROM  8
                   lerp(v, lerp(u, grad(p[AA+ZZ], x  , y  , z-1 ),  // CORNERS
                                   grad(p[BA+ZZ], x-1, y  , z-1 )), // OF CUBE
                           lerp(u, grad(p[AB+ZZ], x  , y-1, z-1 ),
                                   grad(p[BB+ZZ], x-1, y-1, z-1 ))));
}
{% endhighlight %}

The full source listing can be found here: [https://gist.github.com/jbrd/290bcef984b3e2e0224da6acc76e7489](https://gist.github.com/jbrd/290bcef984b3e2e0224da6acc76e7489)

Whilst this is more expensive than the original implementation, this should go to
demonstrate a technique that can be used to remove the 256 unit repetition in the
reference implementation.
