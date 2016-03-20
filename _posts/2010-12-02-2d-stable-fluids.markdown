---
layout: post
title: 2D Stable Fluids
date: '2010-12-02 18:57:07 +0000'
---

In my spare time I have been learning about the simulation of fluids. I started off by writing a simple 2D stable fluid solver, based on the techniques presented in Stam's paper. Here's a screenshot of it in action:

![2D Stable Fluid]({{ site.baseurl }}/images/2DFluidCPU.png)

I spent a lot of time working through the equations in order to fully understand them. I made some notes which might be of use to some people, so I have decided to post them here.

**Solving the Poisson Pressure Equation**

The Poisson Pressure Equation can be written as shown in Equation 1 below:

(1)    $$\nabla ^2 p = \nabla \cdot {\bf{w}}$$

On a uniform grid of values under finite differences, Equation 1 can be rewritten as:

(2)    $$\frac{1}{dx^2}\left( {p_{i + 1,j} + p_{i - 1,j} + p_{i,j + 1} + p_{i,j - 1} - 4p_{i,j} } \right) = \left( {\nabla \cdot {\bf{w}}} \right)_{i,j}$$

This is a linear system of equations that can be rewritten in matrix form:

(3)    $${\bf{Ax}} = {\bf{b}}$$

In order to form the above equation, we first rearrange Equation 2 to yield:

(4)    $$4p_{i,j} - p_{i + 1,j} - p_{i - 1,j} - p_{i,j + 1} - p_{i,j - 1} = - dx^2 \left( {\nabla \cdot {\bf{w}}} \right)_{i,j}$$

One can formulate the matrix equation by using natural ordering, where the equations for the boundary elements are discarded. When the boundary elements are referenced by the remaining equations, the boundary terms are moved to the right hand side. For example, imagine we have a 4x4 grid with grid indices ranging from [0..3]. The equation for element (1,1) and the entire system of equations is shown in Equations 5 and 6 below:

(5)    $$4p_{1,1} - p_{2,1} - p_{1,2} = - dx^2 \left( {\nabla \cdot {\bf{w}}} \right)_{i,j} + p_{0,1} + p_{1,0}$$

(6)    $$\left[ {\begin{array}{*{20}c}
4 & { - 1} & { - 1} & 0 \\ { - 1} & 4 & 0 & { - 1} \\ { - 1} & 0 & 4 & { - 1} \\ 0 & { - 1} & { - 1} & 4 \\ \end{array}} \right]\left[ {\begin{array}{*{20}c}
{p_{1,1} } \\ {p_{1,2} } \\ {p_{2,1} } \\ {p_{2,2} } \\ \end{array}} \right] = \left[ {\begin{array}{*{20}c}
{ - dx^2 \left( {\nabla \cdot {\bf{w}}} \right)_{1,1} + p_{0,1} + p_{1,0} } \\ { - dx^2 \left( {\nabla \cdot {\bf{w}}} \right)_{1,2} + p_{0,2} + p_{1,3} } \\ { - dx^2 \left( {\nabla \cdot {\bf{w}}} \right)_{2,1} + p_{3,1} + p_{2,0} } \\ { - dx^2 \left( {\nabla \cdot {\bf{w}}} \right)_{2,2} + p_{3,2} + p_{2,3} } \\ \end{array}} \right]$$

So, given that we have discarded the equations for the boundary elements, we end up having $${\left(m-2\right)}$$ x $${\left(n-2\right)}$$ elements to solve, where $$m$$ x $$n$$ are the dimensions of our grid.

In practise, in order to solve the matrix equation, the boundary terms of 'p' inside the vector on the right-hand-side are moved into the vector on the left-hand-side. As the boundary terms cannot be computed whilst solving this matrix, their corresponding rows are set to zero, and boundary conditions are applied afterwards in order to solve the remaining boundary terms. It is common to assume that the fluid is completely enclosed within a box (i.e. no fluid should leave the box), and in this case, we can apply the Neumann boundary conditions (which states that the pressure does not change in the direction of the boundary normal). This is given in Equation 7 below:

There are many ways of solving Equation 3. Something that my above example doesn't really demonstrate is that for all-but-tiny grids, the matrix $${\bf{A}}$$ is sparse, diagonally dominant, and has a regular pattern. Some particular methods excel at solving systems with these type of matrices (i have read that multigrid methods arrive at a solution in an optimal amount of time). In GPU Gems 1, Harris chooses the Jacobi method as it can be trivially implemented on parallel hardware.

(7)    $$\frac{\partial p}{\partial {\bf{n}}} = 0$$

Applying this boundary condition under finite differences is actually very simple - it boils down to setting the value of boundary grid cells to that of their immediate neighbour inside the boundary.


**Solving the Viscous Diffusion Term**

The Viscous Diffusion term is given in Equation 8 below:

(8)    $$\frac{\partial {\bf{u}}}{\partial t} = \nu \nabla ^2 {\bf{u}}$$

Equation 8 can be discretised to yield Equation 9 below:

(9)    $${\bf{u}}\left( {\bf{x},t + \delta t} \right) = {\bf{u}}({\bf{x}},t) + \nu \delta t\nabla ^2 {\bf{u}}({\bf{x}},t)$$

In his Stable Fluids paper, Stam noted that the Equation 9 becomes instable under large time steps. He instead chooses to rewrite the equation in implicit form, and being the mathematical luddite that I am, it took me a bit of time to understand how this implicit form is derived. The key to understanding this, is that instead of using the Euler Method to compute the diffused velocities at some time in the future, we use the Backward Euler Method instead. The Backward Euler Method can be applied to give Equation 10:

(10)    $${\bf{u}}\left( {\bf{x},t} \right) = {\bf{u}}\left( {\bf{x},t + \delta t} \right) - \nu \delta t\nabla ^2 {\bf{u}}\left( {\bf{x},t + \delta t} \right)$$

The right hand side of Equation 10 can be factorised to yield the implicit form found in Stam's paper. This is given in Equation 11 below:

(11)    $${\bf{u}}\left( {\bf{x},t} \right) = \left( {\bf{I} - \nu \delta t\nabla ^2 } \right){\bf{u}}\left( {\bf{x},t + \delta t} \right)$$

As with the pressure equation, this can be written in matrix form and solved using the same kind of methods. An example for a 4x4 grid is given in Equations 12 and 13 below, with boundary elements moved to the right-hand side of the equation:

(12)    $$k = \frac{\nu \delta t}{\delta x^2 }$$

(13)    $$\left[ {\begin{array}{*{20}c}{1 + 4k} & { - k} & { - k} & 0 \\ { - k} & {1 + 4k} & 0 & { - k} \\ { - k} & 0 & {1 + 4k} & { - k} \\ 0 & { - k} & { - k} & {1 + 4k} \\ \end{array}} \right]\left[ {\begin{array}{*{20}c}{\bf{u'}_{1,1} } \\ {\bf{u'}_{1,2} } \\ {\bf{u'}_{2,1} } \\ {\bf{u'}_{2,2} } \\ \end{array}} \right] = \left[ {\begin{array}{*{20}c}{\bf{u}_{1,1} + k \cdot \bf{u'}_{0,1} + k \cdot \bf{u'}_{1,0} } \\ {\bf{u}_{2,1} + k \cdot \bf{u'}_{0,2} + k \cdot \bf{u'}_{1,3} } \\ {\bf{u}_{1,2} + k \cdot \bf{u'}_{3,1} + k \cdot \bf{u'}_{2,0} } \\ {\bf{u}_{2,2} + k \cdot \bf{u'}_{3,2} + k \cdot \bf{u'}_{2,3} } \\ \end{array}} \right]$$

Note that in Equation 13, we now have boundary $$\bf{u'}$$ terms on the right hand side. In order to solve this equation, we need to eliminate these boundary terms. As with the Pressure Equation, we can do this by applying boundary conditions. For "fluid in a box", we apply no-slip boundary conditions to the velocity field. To satisfy the no-slip condition, the velocity at the fluid boundaries must equal zero. Our values are defined at the grid-cell centres, but the boundaries are defined at the edges of these grid cells. Therefore, we must compute the cell values at either side of the boundary such that they uphold the boundary conditions. To uphold the no-slip condition, the value at the boundary must be set to the negative value of its neighbour, i.e:

(14)    $$u_{0,j} = - u_{1,j}$$

Corners next to the boundary must also be handled. In this case, we must satisfy two equations. An example for the top-left cell is given in Equations 15 and 16 below:

(15)    $$u_{0,1} = - u_{1,1}$$

(16)    $$u_{1,0} = - u_{1,1}$$

An equation like the one given in Equation 13 can be solved using the same methods as for the pressure matrix equation (as it is also sparse, square, and diagonally dominant).
