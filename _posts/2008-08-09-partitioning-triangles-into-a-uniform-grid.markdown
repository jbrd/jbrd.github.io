---
layout: post
title: Partitioning Triangles into a Uniform Grid
date: '2008-08-09 14:47:07 +0100'
---

**Introduction**

As part of my thesis I had to partition sets of triangles in 3D space into various acceleration structures. One such structure was the uniform grid and although there seems to be a wide variety of literature on uniform grid traversal, I had a hard job finding any literature on uniform grid construction. As a result I ended up deriving an algorithm myself, and this article presents the development of this algorithm. Hopefully these notes will be useful for people trying to solve similar problems.

When deriving the algorithm, I first thought about similar problems to which a well-known solution already exists. One such problem is the rasterisation of 2D triangles onto a 2D image. In this case, the 2D image can be thought of as a 2D uniform grid with grid cell dimensions of 1×1 unit. Several algorithms exist for rasterizing a 2D triangle onto a 2D image. One such algorithm is the [scanline algorithm](http://en.wikipedia.org/wiki/Scanline_algorithm):

* Split the triangle horizontally at the middle-vertical vertex to produce (up to) two triangles
	* A flat-bottomed triangle
	* A flat-topped triangle

* For each of these triangles:
	* Compute the gradient of its left and right edge
	* Use these gradients to step through each row of pixels. For each row:
		* Compute the left and right extents of the row
		* Fill every grid cell between the left and right extents

This process is illustrated in the diagram below (if you can spot some errors in this image, they are deliberate). The pixels have been enlarged, and the extents of each row are shown as black dots.

![2D Triangle Rasterization Enlarged]({{ site.baseurl }}/images/UniformGrid01.png)


**Extending The Scanline Algorithm**

In order to rasterise a 3D triangle into a 3D uniform grid, the following extensions must be made to the above algorithm:

* It must support arbitrary grid cell dimensions
* It must support a third dimension

The next few sections cover these extensions in further detail.


**Supporting Arbitrary Grid Cell Dimensions**

As mentioned previously, you should notice that the diagram looks wrong. Look at the very top row and you will see that the triangle clearly intersects the two grid cells to the left of the filled cell, but for some reason they are not filled.

The reason that some grid cells are ignored is because the extents are computed by finding the point on each edge that lies in the vertical centre of the row, as shown in the following diagram (the third row from the first diagram):

![Taking Extents At Grid Cell Centre (Wrong)]({{ site.baseurl }}/images/UniformGrid02.png)

This is fine for pixels, because they are so small that you often cannot notice these errors. Furthermore, the pixel is usually the smallest unit of operation when rasterising an image. This is not true for the general case of rasterising into a uniform grid of arbitrary grid cell dimensions.

Instead of taking extents at the vertical centre of the row, we actually want to compute the intersection points of the triangle edges and the row boundaries. Once we have found these we can determine:

* The left extent
	* By taking the minimum horizontal coordinate of the intersection points

* The right extent
	* By taking the maximum horizontal coordinate of the intersection points

This is shown in the following diagram:

![Correct Extents Are Found By Considering Intersection Points]({{ site.baseurl }}/images/UniformGrid03.png)

As you can see, the left-most grid cell is now correctly filled.


**Supporting A Third Dimension**

In order to support a third dimension, the triangle must first be projected onto one of the orthogonal planes (the XZ plane for example). Examining the projection of the triangle allows us to split the triangle into “strips”, where each strip appears in exactly one grid row (where the Z component of the grid coordinate remains constant for all grid cells intersected). This is shown in the following diagram:

![Triangle Is Projected And Split Into Strips]({{ site.baseurl }}/images/UniformGrid04.png)

The next step is to split the original 3D triangle into these grid-row aligned strips, as shown in the following diagram:

![Triangle split into strips - each strip lies in exactly one grid row]({{ site.baseurl }}/images/UniformGrid05.png)

You then examine each strip in turn. Having determined the Z grid cell coordinate of each cell that is intersected with the strip, you then examine the XY projection of the strip:

![Strips Projected Into XY Plane]({{ site.baseurl }}/images/UniformGrid06.png)

By examining the XY projection of the strip, you can determine the X and Y coordinates of the overlapping grid cells. This can be done by triangulating the strip and then applying the 2D scanline algorithm (extended to support arbitrary grid cell size). As you already know the Z grid-cell coordinate of the strip, the problem has been solved.
