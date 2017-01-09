---
layout: post
title: Paper Study - Fast Bit-Reversal Algorithms by Elster
date: '2017-01-08 12:00:00 +0000'
---

Given a sequence of integers in the range $$[0..2^t)$$, its bit-reversal permutation is given as a sequence of integers whose bits are in reverse order to the original sequence.

For example, for $$t=3$$:

	Input:  0, 1, 2, 3, 4, 5, 6, 7 == 000, 001, 010, 011, 100, 101, 110, 111
	Output: 0, 4, 2, 6, 1, 5, 3, 7 == 000, 100, 010, 110, 001, 101, 011, 111

The bit-reversal permutation is commonly used in Fast Fourier Transform algorithms, to reorder the input sequence into an order that makes computing recursively smaller DFTs convenient (the necessary elements are adjacent to each other). 

A naive way of computing the bit reversal permutation is to iterate through each value in the input sequence, and then reverse each bit in turn:

{% highlight cpp %}
template <unsigned t>
std::array<unsigned, 1 << t> bit_reversal_permutation() {
	std::array<unsigned, 1 << t> result;
	for (unsigned i = 0; i < result.size(); ++i) {
		unsigned a = i, b = 0, j = 0;
		while (j++ < t) {
			b = (b << 1) | (a & 1);
			a >>= 1;
		}
		result[i] = b;
	}
	return result;
}

{% endhighlight %}

The naive algorithm loops through every value in the sequence, and then every bit of every value, so its performance is $$O(N log_2N)$$.

The *Fast Bit Reversal Algorithms* paper by *Elster* [1] presents a method for computing the bit-reversal permutation in $$O(N)$$ time sequentially, by mapping values in the input sequence to values in the output sequence.

The key observation made in this paper is that, as you iterate through the values of the input sequence, you can factor out values in the output sequence by a power of two, the exponent of which is related to the most-significant-bit of the input sequence.

Running through this for $$t=3$$, defining $$q$$ as the most significant bit in the input number:
	
|Input Number (k)|MSB (q)|Ouptut Number|Factorisation                |
|----------------|-------|-------------|-----------------------------|
|0 (000)         |0      |0 (000)      |$$C_k\cdot2^{t-q}=0\cdot8=0$$|
|1 (001)         |1      |4 (100)      |$$C_k\cdot2^{t-q}=1\cdot4=4$$|
|2 (010)         |2      |2 (010)      |$$C_k\cdot2^{t-q}=1\cdot2=2$$|
|3 (011)         |2      |6 (110)      |$$C_k\cdot2^{t-q}=3\cdot2=6$$|
|4 (100)         |3      |1 (001)      |$$C_k\cdot2^{t-q}=1\cdot1=1$$|
|5 (101)         |3      |5 (101)      |$$C_k\cdot2^{t-q}=5\cdot1=5$$|
|6 (110)         |3      |3 (011)      |$$C_k\cdot2^{t-q}=3\cdot1=3$$|
|7 (111)         |3      |7 (111)      |$$C_k\cdot2^{t-q}=7\cdot1=7$$|
|                |       |             |                             |

By factoring out a power of two, our focus is now shifted to finding the sequence of $$C_k$$
constants (for example, when $$t=3; C=0,1,1,3,1,5,3,7$$). The paper shows that this sequence can be computed sequentially, as the following relations hold:

$$
C_{2k} = C_k
$$

$$
C_{2k+1} = C_k + 2^q
$$

For example, continuing to use $$t=3$$, suppose we already know the value of $$C_3 = 3$$. Then we can trivially compute the values of $$C_6$$ and $$C_7$$:

$$
C_6 = C_3 = 3
$$

$$
C_7 = C_3 + 2^q = 3 + 2^2 = 7
$$

We can therefore write an algorithm to compute future values of $$C_k$$ given the values of $$C_k$$ we have already computed:

{% highlight cpp %}
template <unsigned t>
std::array<unsigned, 1 << t> bit_reversal_permutation() {
	std::array<unsigned, 1 << t> result = {0, 1};
	for (unsigned q=0, min=1, max=2; q < t; ++q, min = max, max <<= 1) {
		for (unsigned k = min; k < max; ++k) {
			if (q < t - 1) { // Compute Ck constant for 2k and 2k+1
				const unsigned k2 = k << 1;
				result[k2] = result[k];
				result[k2+1] = result[k2] + max;
			}
			result[k] <<= (t - q - 1); // Multiply by 2^(t-q)
		}
	}
	return result;
}
{% endhighlight %}

The algorithm iterates each input value $$k$$ sequentially, computing the odd constant $$C_k$$ for future values of $$k$$
in advance, and then finally multiplies by $$2^{t-q}$$ to compute each final bit-reversed value.

Despite running in linear time, it does require storage space of size $$N$$. It should be noted though that if you are
performing many DFTs of the same size for example, you could generate the permutation table once and reuse it across all
those DFTs to accelerate the cost of the bit reversal step. Since the paper was written (in 1989!) the gap between compute
and memory performance has grown significantly larger, and the cost of repeated loads and stores could be detremental.
Other cache-friendly bit reversal algorithms do exist, I will save those for a future post!

**References**

[1] Elster, A.C., 1989, May. Fast bit-reversal algorithms. In *Acoustics, Speech, and Signal Processing, 1989. ICASSP-89., 1989 International Conference on* (pp. 1099-1102). IEEE.
