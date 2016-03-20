---
layout: post
title: Minimising State Changes in your Mesh Pipeline (Part 2)
date: '2008-12-22 21:29:45 +0000'
---

In my previous post I presented a gentle introduction to mesh rendering optimisation. These articles focus on just one approach - reducing the amount of state changes by maximising "shared state". In this article I examine each GPU resource in turn and suggest some ways that these GPU resources could be shared in order to improve performance. This article will focus on Direct 3D 10 resources.

**Vertex Buffer**

The vertex buffer contains the vertices that are passed to the vertex shader upon executing a 'Draw' call. In a naive mesh renderer, the a model would possess one vertex buffer for each vertex shader used to render the various parts of the mesh (this is the approach that the XNA 'Model' class seems to take). A better approach would be to store the input vertices for all vertex shaders inside a single vertex buffer. This way, you reduce the number of resources down to one vertex buffer per mesh. When issuing Draw calls, you just have to make sure to specify the correct vertex buffer offset and stride values.

**Vertex Layout**

A DirectX 10 specific resource, the Vertex Layout resource is used to map elements inside your vertex buffer to input variables inside the vertex shader. As such, the number of vertex layout resources you need is really equal to the number of unique vertex shaders you have. Therefore, decreasing the number of vertex shaders will allow you to also reduce the number of vertex layout resources you use.

**Index Buffer**

An index buffer contains vertex indices for each primitive (line, triangle, etc). The indices refer to the vertices inside the vertex buffer. As with the vertex buffer, you can easily reduce the amount of index buffers down to one-per-mesh by storing all indices in a single index buffer. You can do this even if you are using multiple vertex buffers. You just need to make sure that with every 'DrawIndexed' call you make, you pass the correct index-buffer-offset and index-count.

**Vertex Shader**

The amount of vertex and pixel shaders required to render a model are primarily dictated by the complexity of the mesh (i.e. number of unique materials). Furthermore, a single material could in theory have multiple shaders based on the input of the vertex shader - for example, some people choose to have different shaders that can handle different numbers of bones when rendering a skinned mesh.

One way that you can reduce the amount of vertex shaders is by seeing if certain inputs of one shader can reduce its behaviour to match a second shader. For example, when given a specularity constant of 0, the behaviour of a Phong shader will reduce to that of a Lambertian shader. Using the Phong shader for both diffuse and specular areas of the mesh reduces the overhead in having to switch between different vertex shaders at a cost of potentially having to pass in an extra specularity value (unless its defined by a shader constant or you already have space left in your vertex buffer anyway). Another trade off here is that your shader will be performing more work but in some cases this extra amount of work is negligable.

**Pixel Shader**

Just as the vertex shader is dependant on the inputs provided by the vertex buffer, the pixel shader is dependant on the inputs provided by the vertex shader. As well as reducing the behaviour of a complex shader to that of a simple shader (as suggested above), another approach would see a single pixel shader shared across multiple vertex shaders. For this to work, the vertex shader output must always be compatible with the input of the pixel shader. For example, when rendering a smooth-skinned-mesh with a per-pixel Phong shader, you could use several vertex shaders to handle the varying number of bones, but each of these vertex shaders could pass common input into a single Phong pixel shader.

**Textures**

The sharing of texture resources cannot easily be handled at a rendering level, as it is too costly to compute whether too textures are the same and the content of these textures are usually determined by the artist.

There is one thing that a graphics programmer can do to reduce the amount of texture state changes however, and that is to minimise the amount of texture swapping that is performed whilst rendering different parts of the mesh. If two parts require the same texture, then write a system that will try to batch these parts together. Note that a trade off is usually required here, because if we batch parts by texture, then we often can't batch parts by other types of resource such as shader. The trick here is to make sure you're batching by most expensive resource to change.

As far as textures are concerned, I've seen many engines resolve duplicate textures into a single GPU resource at the content pipeline level. If your content pipeline can resolve duplicate assets (such as two texture assets with the same content), then you automatically obtain texture sharing on a per-mesh basis. Even better than this, you achieve cross-mesh sharing as well. As far as state changes are concerned, this later point cannot be fully taken advantage of unless your mesh renderer supports cross-mesh batching.

**Overview**

As this article has shown, there are many opportunities for batching data into a smaller number of GPU resources, which in turn allows you to maximise shared state. This article very much focussed on reducing the amount of GPU resources down to a per-mesh basis. The next (and last) article on this topic will explore cross-mesh batching techniques.
