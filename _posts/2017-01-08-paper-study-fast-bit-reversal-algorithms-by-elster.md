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

The naive algorithm loops through every value in the sequence, and then every bit of every value, so its performance is $$O(N log_2N)$$. The *Fast Bit Reversal Algorithms* paper by *Elster* [1] presents a method for computing the bit-reversal permutation in $$O(N)$$ time sequentially, by mapping values in the input sequence to values in the output sequence.

The key observation made in this paper is that, as you iterate through the values of the input sequence, you can factor out values in the output sequence by a power of two, the exponent of which is dependant on the most-significant-bit of the input value:

$$
X_k = C_k \cdot 2^{t-q}
$$

Running through with $$t=3$$, and defining $$q$$ as the most significant bit in the input number:
	
|Input Number (k)|MSB (q)|Ouptut Number (X)|Factorisation                |
|----------------|-------|-----------------|-----------------------------|
|0 (000)         |0      |0 (000)          |$$C_k\cdot2^{t-q}=0\cdot8=0$$|
|1 (001)         |1      |4 (100)          |$$C_k\cdot2^{t-q}=1\cdot4=4$$|
|2 (010)         |2      |2 (010)          |$$C_k\cdot2^{t-q}=1\cdot2=2$$|
|3 (011)         |2      |6 (110)          |$$C_k\cdot2^{t-q}=3\cdot2=6$$|
|4 (100)         |3      |1 (001)          |$$C_k\cdot2^{t-q}=1\cdot1=1$$|
|5 (101)         |3      |5 (101)          |$$C_k\cdot2^{t-q}=5\cdot1=5$$|
|6 (110)         |3      |3 (011)          |$$C_k\cdot2^{t-q}=3\cdot1=3$$|
|7 (111)         |3      |7 (111)          |$$C_k\cdot2^{t-q}=7\cdot1=7$$|
|                |       |                 |                             |

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

The paper also shows that the $$2^{t-q}$$ factor can be generated directly. Suppose you have a value $$k$$, and its most significant bit number $$q_k$$. To find the value of $$q_{2k}$$, we realise that multiplying $$k$$ by two is equivalent to left shifting the value of $$k$$ by 1, and so $$q_{2k} = q_k + 1$$.

Multiplying a value by two will always result in an even number (or to put it another way, left shifting by 1 will always result in a least significant bit of zero). It therefore follows that $$q_{2k+1} = q_{2k}$$ (e.g. adding a value of 1 to the value of $$2k$$ will have no effect on its most significant bit).

With this, we can now have all the information we need to directly compute the bit reversed value $$X$$ given its previous value, and after some simplification, the following relations can be found:

$$
X_{2k} = X_k \cdot 2^{-1}
$$

$$
X_{2k+1} = X_{2k} + 2^{t-1}
$$

We can therefore write an algorithm to directly compute future values of the permutation given the values we have already computed:

{% highlight cpp %}
template <unsigned t> std::array<unsigned, 1 << t> bit_reversal_permutation() {
	const unsigned half_n = 1 << (t-1);
	std::array<unsigned, 1 << t> result = {0, half_n};
	for (unsigned n = 1; n < half_n; ++n) {
		const unsigned index = n << 1;
		result[index] = result[n] >> 1;
		result[index+1] = result[index] + half_n;
	}
	return result;
}
{% endhighlight %}

Despite running in linear time, the algorithm does require storage space of size $$N$$. It should be noted though that if you are performing many DFTs of the same size, you could generate the permutation table once and reuse it across all those DFTs to accelerate the cost of the bit reversal step. Since the paper was written (in 1989!) the gap between compute and memory performance has grown significantly larger, and the cost of repeated loads and stores could be detremental on modern architectures. Other cache-friendly bit reversal algorithms do exist, I will save those for a future post!

**References**

[1] Elster, A.C., 1989, May. Fast bit-reversal algorithms. In *Acoustics, Speech, and Signal Processing, 1989. ICASSP-89., 1989 International Conference on* (pp. 1099-1102). IEEE.
