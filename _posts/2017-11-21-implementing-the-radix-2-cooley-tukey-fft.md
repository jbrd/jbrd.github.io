---
layout: post
title: Implementing the Radix-2 Cooley-Tukey FFT
---

# Introduction

The Discrete Fourier Transform (DFT) takes a fixed number of samples $$N$$ of a time-domain signal $$x$$ (at regular intervals), and transforms them into an equally sized set of complex sinusoids $$X$$ in the frequency domain. The DFT is given as follows:

$$X_k = \sum_{n=0}^{N-1}{x_n \cdot e^{-2 \pi i k n / N}}$$

Computing the DFT analytically results in an algorithmic complexity of $$O(N^2)$$ - for each value $$X_k$$ we have to visit each value of the input signal $$x_k$$.

A Fast Fourier Transform algorithm can compute the same result with a significantly reduced algorithmic complexity of $$O(N \log N)$$. The Radix-2 Cooley-Tukey FFT algorithm is one of many FFT algorithms. In this post, I'll break down the algorithm and describe how to implement it.

# Eliminating Redundant Calculations

The Cooley-Tukey algorithm takes advantage of the Danielson-Lanczos lemma, stating that a DFT of size $$N$$ can be broken down into the sum of two smaller DFTs of size $$\frac{N}{2}$$ - a DFT of the even components, and a DFT of the odd components:

$$X_k = \sum_{m=0}^{N/2-1}{x_{2m} \cdot e^{\frac{-2 \pi i k m}{N/2}}} + W^k \sum_{m=0}^{N/2-1}{x_{2m+1} \cdot e^{\frac{-2 \pi i k m}{N/2}}}$$

$$W = e^{\frac{-2 \pi i}{N}}$$

This lemma can be applied recursively on the smaller DFTs, until we eventually end up having to compute DFTs of size $$1$$.

To visualise this, lets break this down for a DFT of size $$N=4$$:

|$$\textbf{N=4}$$                               |$$\textbf{N=2}$$               |$$\textbf{N=1}$$          |
|-----------------------------------------------|-------------------------------|--------------------------|
|$$X_0 = \mathrm{DFT}(0, [x_0, x_1, x_2, x_3])$$|$$\mathrm{DFT}(0, [x_0, x_2])$$|$$\mathrm{DFT}(0, [x_0])$$|
|                                               |                               |$$\mathrm{DFT}(0, [x_2])$$|
|                                               |$$\mathrm{DFT}(0, [x_1, x_3])$$|$$\mathrm{DFT}(0, [x_1])$$|
|                                               |                               |$$\mathrm{DFT}(0, [x_3])$$|
|$$X_1 = \mathrm{DFT}(1, [x_0, x_1, x_2, x_3])$$|$$\mathrm{DFT}(1, [x_0, x_2])$$|$$\mathrm{DFT}(1, [x_0])$$|
|                                               |                               |$$\mathrm{DFT}(1, [x_2])$$|
|                                               |$$\mathrm{DFT}(1, [x_1, x_3])$$|$$\mathrm{DFT}(1, [x_1])$$|
|                                               |                               |$$\mathrm{DFT}(1, [x_3])$$|
|$$X_2 = \mathrm{DFT}(2, [x_0, x_1, x_2, x_3])$$|$$\mathrm{DFT}(2, [x_0, x_2])$$|$$\mathrm{DFT}(2, [x_0])$$|
|                                               |                               |$$\mathrm{DFT}(2, [x_2])$$|
|                                               |$$\mathrm{DFT}(2, [x_1, x_3])$$|$$\mathrm{DFT}(2, [x_1])$$|
|                                               |                               |$$\mathrm{DFT}(2, [x_3])$$|
|$$X_3 = \mathrm{DFT}(3, [x_0, x_1, x_2, x_3])$$|$$\mathrm{DFT}(3, [x_0, x_2])$$|$$\mathrm{DFT}(3, [x_0])$$|
|                                               |                               |$$\mathrm{DFT}(3, [x_2])$$|
|                                               |$$\mathrm{DFT}(3, [x_1, x_3])$$|$$\mathrm{DFT}(3, [x_1])$$|
|                                               |                               |$$\mathrm{DFT}(3, [x_3])$$|
|                                               |                               |                          |

On the face of it, it doesn't look like we have saved anything in terms of computation. The key to reducing the computational cost is to exploit the periodicity of the DFT to eliminate some of these calls. The DFT is periodic with a wave length of $$N$$. It therefore follows that any integer multiple of $$N$$ will return the same value, e.g:

$$\textrm{DFT}(k, [...]) = \textrm{DFT}(k + i \cdot N, [...])$$

We can use this relation to significantly reduce the number of unique calculations that we need to perform. To illustrate this, we can now rewrite the previous example as follows:

|$$\textbf{N=4}$$                               |$$\textbf{N=2}$$               |$$\textbf{N=1}$$          |
|$$X_0 = \mathrm{DFT}(0, [x_0, x_1, x_2, x_3])$$|$$\mathrm{DFT}(0, [x_0, x_2])$$|$$\mathrm{DFT}(0, [x_0])$$|
|                                               |                               |$$\mathrm{DFT}(0, [x_2])$$|
|                                               |$$\mathrm{DFT}(0, [x_1, x_3])$$|$$\mathrm{DFT}(0, [x_1])$$|
|                                               |                               |$$\mathrm{DFT}(0, [x_3])$$|
|$$X_1 = \mathrm{DFT}(1, [x_0, x_1, x_2, x_3])$$|$$\mathrm{DFT}(1, [x_0, x_2])$$|$$\mathrm{DFT}(0, [x_0])$$|
|                                               |                               |$$\mathrm{DFT}(0, [x_2])$$|
|                                               |$$\mathrm{DFT}(1, [x_1, x_3])$$|$$\mathrm{DFT}(0, [x_1])$$|
|                                               |                               |$$\mathrm{DFT}(0, [x_3])$$|
|$$X_2 = \mathrm{DFT}(2, [x_0, x_1, x_2, x_3])$$|$$\mathrm{DFT}(0, [x_0, x_2])$$|$$\mathrm{DFT}(0, [x_0])$$|
|                                               |                               |$$\mathrm{DFT}(0, [x_2])$$|
|                                               |$$\mathrm{DFT}(0, [x_1, x_3])$$|$$\mathrm{DFT}(0, [x_1])$$|
|                                               |                               |$$\mathrm{DFT}(0, [x_3])$$|
|$$X_3 = \mathrm{DFT}(3, [x_0, x_1, x_2, x_3])$$|$$\mathrm{DFT}(1, [x_0, x_2])$$|$$\mathrm{DFT}(0, [x_0])$$|
|                                               |                               |$$\mathrm{DFT}(0, [x_2])$$|
|                                               |$$\mathrm{DFT}(1, [x_1, x_3])$$|$$\mathrm{DFT}(0, [x_1])$$|
|                                               |                               |$$\mathrm{DFT}(0, [x_3])$$|
|                                               |                               |                          |

And to illustrate this even further, we can strip out the duplicate calculations:

|$$\textbf{N=4}$$                               |$$\textbf{N=2}$$               |$$\textbf{N=1}$$          |
|$$X_0 = \mathrm{DFT}(0, [x_0, x_1, x_2, x_3])$$|$$\mathrm{DFT}(0, [x_0, x_2])$$|$$\mathrm{DFT}(0, [x_0])$$|
|$$X_1 = \mathrm{DFT}(1, [x_0, x_1, x_2, x_3])$$|$$\mathrm{DFT}(0, [x_1, x_3])$$|$$\mathrm{DFT}(0, [x_2])$$|
|$$X_2 = \mathrm{DFT}(2, [x_0, x_1, x_2, x_3])$$|$$\mathrm{DFT}(1, [x_0, x_2])$$|$$\mathrm{DFT}(0, [x_1])$$|
|$$X_3 = \mathrm{DFT}(3, [x_0, x_1, x_2, x_3])$$|$$\mathrm{DFT}(1, [x_1, x_3])$$|$$\mathrm{DFT}(0, [x_3])$$|
|                                               |                               |                          |

Another common way to visualise this is to draw what is known as a *butterfly diagram*, where we represent every
DFT that must be computed as a node in a graph, and use connections between these nodes to show how the smaller DFTs
are distributed amongst the larger DFTs:

{% include d3-js-fft-butterfly-diagram-pow2.html %}

# Evaluating the FFT

In order to compute the entire FFT, we iterate through successive powers-of-two, using the results of the previous
iteration to compute the next iteration. For each power-of-two, we compute a total of $$N$$ values.

In the first iteration, we need to compute DFTs of size 1. For a DFT of size 1, the exponential term reduces
to 1, which means that a DFT of a single value returns that single value unchanged. We can also see that we
compute these size-1 DFTs in [bit-reversed]({% post_url 2017-01-08-paper-study-fast-bit-reversal-algorithms-by-elster %}) order, and we can therefore compute the entire first iteration
*in-place* by just reordering the elements of our input samples.

For each subsequent power-of-two, we compute each DFT value by using the values we computed in the previous
iteration. The butterfly diagram is particularly good at illustrating the relationship between values across
iterations of the algorithm:

* Each pair of values in the previous iteration is used to compute a pair of new values in the next iteration
* Each pair of values in the previous iteration map to the same pair of values in the next iteration (e.g. the
  element indicies are the same)
* The distance between element indices in each pair is equal to half the current power-of-two

We can take advantage of these properties to calculate the remaining power-of-two iterations in-place, which
is one key factor in implementing this algorithm efficiently.

If we were to iterate over our array of values in index order, we would prematurely overwrite a value from the
previous iteration before we had a chance to use it to compute the next iteration. So to compute these
values in-place, we must find an alternative way of iterating the array, specifically by iterating over each
independent pair of values:

```cpp
// Compute the first iteration by swapping elements into a bit-reversed order
BitReversal( /* ... */ );

// Now iterate over the remaining powers of two. We could use N here,
// but it turns out that using previousN simplifies some of the logic inside
// these loops.
for (int previousN = 1; previousN < maxN; previousN <<= 1)
{
    // Next we iterate over pairs of elements at a time, using the following
    // two loops. The outer loop iterates over groups of N elements.
    // Values within these groups are guaranteed not to depend on each other.
    for (int groupOffset = 0; groupOffset < maxN; groupOffset += previousN << 1)
    {
        // The inner loop iterates over each pair of values in the current group
        // There are N/2 pairs per group.
        for (int pairOffset = 0; pairOffset < previousN; ++pairOffset)
        {
            // Compute the indices of the pair of values.
            int i = groupOffset + pairOffset;
            int j = i + previousN;

            // NOTE: This is deliberately naive! Read on for a better version!

            // Read previous values at indices 'i' and 'j'
            double even_real = VALUES_REAL[i], even_imag = VALUES_IMAG[i];
            double odd_real = VALUES_REAL[j], odd_imag = VALUES_IMAG[j];

            // Compute the new value at index 'i'
            double wEXP = M_PI * double(-2 * i) / double(previousN * 2);
            double wRE = COS(wEXP);
            double wIM = SIN(wEXP);
            VALUES_REAL[i] = even_real + (wRE * odd_real) - (wIM * odd_imag);
            VALUES_IMAG[i] = even_imag + (wRE * odd_imag) + (wIM * odd_real);

            // Compute the new value at index 'j'
            wEXP = M_PI * double(-2 * j) / double(previousN * 2);
            wRE = COS(wEXP);
            wIM = SIN(wEXP);
            VALUES_REAL[j] = even_real + (wRE * odd_real) - (wIM * odd_imag);
            VALUES_IMAG[j] = even_imag + (wRE * odd_imag) + (wIM * odd_real);
        }
    }
}
```

# Simplifications

The source code listing above is a fully-functional in-place FFT algorithm. The most significant performance gains have already been found by computing the DFT in $$O(N \log N)$$. Performance in the source code shown above is now bounded by trigonometric functions, and so to speed this up further, we need to find some way of reducing these calls. We can again, exploit the periodicity of the FFT in order to do this.

The trigonometric operations are used to compute the real and complex parts of the $$W$$ term for each of the two values are updating. Specifically, we are computing the *sine* and *cosine* of the following values:

$$\frac{-2 \pi \cdot (\textrm{groupOffset} + \textrm{pairOffset})}{2 \cdot \textrm{previousN}}$$

$$\frac{-2 \pi \cdot (\textrm{groupOffset} + \textrm{pairOffset} + \textrm{previousN})}{2 \cdot \textrm{previousN}}$$

When written out like this, we can see that these values differ by a constant of $$\pi$$, and that allows us to apply the identities $$\sin(\theta + \pi) = -\sin(\theta)$$ and $$\cos(\theta + \pi) = -\cos(\theta)$$ to share the computation of the *sine* and *cosine* across both $$W$$ terms:

```cpp
// Compute the indices of the pair of values.
int i = groupOffset + pairOffset;
int j = i + previousN;

// Compute W term
double wEXP = M_PI * double(-i) / double(previousN);
double wRE = COS(wEXP);
double wIM = SIN(wEXP);

// Compute the even and odd terms
double evenRE = VALUES_REAL[i];
double evenIM = VALUES_IMAG[i];
double oddRE = (wRE * VALUES_REAL[j]) - (wIM * VALUES_IMAG[j]);
double oddIM = (wRE * VALUES_IMAG[j]) + (wIM * VALUES_REAL[j]);

// Compute the new values at index 'i' and 'j'
VALUES_REAL[i] = evenRE + oddRE;
VALUES_IMAG[i] = evenIM + oddIM;
VALUES_REAL[j] = evenRE - oddRE;
VALUES_IMAG[j] = evenIM - oddIM;
```

We also notice that $$\textrm{groupOffset}$$ increases in increments of $$2 \cdot \textrm{previousN}$$, causing these expressions to decrement in steps of $$2 \pi$$, having no effect when we take the *sine* and *cosine* of them. We can therefore replace $$\textrm{i}$$ with $$\textrm{pairOffset}$$ in the computation of $$\textrm{wEXP}$$ to yield:

```cpp
// Compute the indices of the pair of values.
int i = groupOffset + pairOffset;
int j = i + previousN;

// Compute W term
double wEXP = M_PI * double(-pairOffset) / double(previousN);
double wRE = COS(wEXP);
double wIM = SIN(wEXP);

// Compute the even and odd terms
double evenRE = VALUES_REAL[i];
double evenIM = VALUES_IMAG[i];
double oddRE = (wRE * VALUES_REAL[j]) - (wIM * VALUES_IMAG[j]);
double oddIM = (wRE * VALUES_IMAG[j]) + (wIM * VALUES_REAL[j]);

// Compute the new values at index 'i' and 'j'
VALUES_REAL[i] = evenRE + oddRE;
VALUES_IMAG[i] = evenIM + oddIM;
VALUES_REAL[j] = evenRE - oddRE;
VALUES_IMAG[j] = evenIM - oddIM;
```

In the above source code listing, we have eliminated a loop variable ($$\textrm{groupOffset}$$) from the computation
of the $$W$$ term. This allows us to reorder the loops and move the computation of the $$W$$ term out of the inner
loop body, allowing us to further share this computation across all groups of pairs:

```cpp
// Compute the first iteration by swapping elements into a bit-reversed order
BitReversal( /* ... */ );

// Now iterate over the remaining powers of two. We could use N here,
// but it turns out that using previousN simplifies some of the logic inside
// these loops.
for (int previousN = 1; previousN < maxN; previousN <<= 1)
{
    // Next we iterate over pairs of elements at a time, using the following
    // two loops. The outer loop iterates over each pair of values in the current
    // group. There are N/2 pairs per group.
    for (int pairOffset = 0; pairOffset < previousN; ++pairOffset)
    {
        // Compute W term
        double wEXP = M_PI * double(-pairOffset) / double(previousN);
        double wRE = COS(wEXP);
        double wIM = SIN(wEXP);

        // The inner loop 'a' iterates over groups of N elements.
        // Values within these groups are guaranteed not to depend on each other.
        for (int groupOffset = 0; groupOffset < maxN; groupOffset += previousN << 1)
        {
            // Compute the indices of the pair of values.
            int i = groupOffset + pairOffset;
            int j = i + previousN;

            // Compute the even and odd terms
            double evenRE = VALUES_REAL[i];
            double evenIM = VALUES_IMAG[i];
            double oddRE = (wRE * VALUES_REAL[j]) - (wIM * VALUES_IMAG[j]);
            double oddIM = (wRE * VALUES_IMAG[j]) + (wIM * VALUES_REAL[j]);

            // Compute the new values at index 'i' and 'j'
            VALUES_REAL[i] = evenRE + oddRE;
            VALUES_IMAG[i] = evenIM + oddIM;
            VALUES_REAL[j] = evenRE - oddRE;
            VALUES_IMAG[j] = evenIM - oddIM;
        }
    }
}
```

# Trigonometric Recurrence Relation

There is one final optimisation technique we can employ to reduce the number of trigonometric calls even further.
This is a useful technique to know about in general, so it deserves its own section. In the source code listing
above, we have a loop that calculates the *sine* and *cosine* of values that increase by a constant delta $$\delta$$.

In a paper by Singleton (1967), a technique was presented that allows us to compute these values iteratively using
the following recurrence relation:

$$\cos(\theta + \delta) = \cos(\theta) - \alpha \cos(\theta) - \beta \sin(\theta)$$

$$\sin(\theta + \delta) = \sin(\theta) + \beta \cos(\theta) - \alpha \sin(\theta)$$

$$\alpha = 2 \sin^{2}\frac{1}{2} \delta$$

$$\beta = \sin \delta$$

We can therefore compute $$\alpha$$ and $$\beta$$ once, and then use the recurrence relation to compute the
subsequent values of the *sine* and *cosine* values:

```cpp
// Compute the first iteration by swapping elements into a bit-reversed order
BitReversal( /* ... */ );

// Now iterate over the remaining powers of two. We could use N here,
// but it turns out that using previousN simplifies some of the logic inside
// these loops.
for (int previousN = 1; previousN < maxN; previousN <<= 1)
{
    // Initial values of the w-term
    double wRE = 1.0;
    double wIM = 0.0;

    // Compute alpha and beta values for the trigonometric recurrence
    double alpha = SIN(-M_PI / double(previousN << 1));
    alpha *= alpha * 2.0;
    double beta = SIN(-M_PI / double(previousN));

    // Next we iterate over pairs of elements at a time, using the following
    // two loops. The outer loop iterates over each pair of values in the current
    // group. There are N/2 pairs per group.
    for (int pairOffset = 0; pairOffset < previousN; ++pairOffset)
    {
        // The inner loop 'a' iterates over groups of N elements.
        // Values within these groups are guaranteed not to depend on each other.
        for (int groupOffset = 0; groupOffset < maxN; groupOffset += previousN << 1)
        {
            // Compute the indices of the pair of values.
            int i = groupOffset + pairOffset;
            int j = i + previousN;

            // Compute the even and odd terms
            double evenRE = VALUES_REAL[i];
            double evenIM = VALUES_IMAG[i];
            double oddRE = (wRE * VALUES_REAL[j]) - (wIM * VALUES_IMAG[j]);
            double oddIM = (wRE * VALUES_IMAG[j]) + (wIM * VALUES_REAL[j]);

            // Compute the new values at index 'i' and 'j'
            VALUES_REAL[i] = evenRE + oddRE;
            VALUES_IMAG[i] = evenIM + oddIM;
            VALUES_REAL[j] = evenRE - oddRE;
            VALUES_IMAG[j] = evenIM - oddIM;
        }

        // Compute next W-term by applying the trigonometric recurrence relation
        double wRENext = wRE - (alpha * wRE) - (beta * wIM);
        double wIMNext = wIM + (beta * wRE) - (alpha * wIM);
        wRE = wRENext;
        wIM = wIMNext;
    }
}
```

This is a technique that is common in many FFT algorithm listings today, and reduces the number
of trigonometric calls down to $$2 \log N$$.

This concludes my breakdown of the Radix-2 Cooley-Tukey algorithm. There are lots of things that can be done
to yield a faster FFT but this should hopefully yield some insight into how this relatively simple FFT variant is derived.
