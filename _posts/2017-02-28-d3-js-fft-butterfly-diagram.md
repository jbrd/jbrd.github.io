---
layout: post
title: Radix-2 FFT Butterfly Diagram with d3.js
---

Drawing a butterfly diagram can be very useful in understanding how the Cooley-Tukey algorithm
exploits redundancy in a DFT.

{% include d3-js-fft-butterfly-diagram.html %}

Each node in the first column represents an input value of the DFT. Each node in the subsequent 
columns represent a calculation of the following form, where $$A$$ and $$B$$ represent a node's
first and second inputs respectively:

$$\mathrm{DFT}(k) = A + W^{k} B$$

$$W = e^{\frac{-2 \pi i}{N}}$$

Here is the Javascript source code for generating the above diagram, which requires d3.js 4:

{% gist jbrd/469d993644f064a6f6ebf92f5bd63de9 %}
