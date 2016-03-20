---
layout: post
title: Minimising State Changes in your Mesh Pipeline (Part 1)
date: '2008-11-12 18:14:51 +0000'
---

On both PC and games consoles, rendering a mesh ultimately envolves issuing commands to the graphics card. The majority of commands that get sent to the graphics card are draw calls and state changes. As modern GPUs are designed for processing small amounts of large batches of data per frame (with a minimal number of state changes in between), it is important to reduce the number of "state changes" by batching similar polygons together. In order to minimise the amount of state changes, batching must be considered at all stages of the mesh pipeline, from buildside to runtime.

Lets first assume that your in-game mesh has been built by an artist in a DCC package such as 3DS Max or Maya. A single scene in Max and Maya can actually consist of multiple meshes, each with their own materials and properties. It is usually the material that dictates a state change, as each material can potentially require different set of shader constants, textures, vertex formats, etc. Therefore, the first step in reducing state changes is to minimise the number of these "internal meshes" by grouping them by material. Ideally, you want to end up with as few groups as possible, and each group should posess a unique material within the overall scene.

Generally a material will have a unique type, plus a set of parameters that define the behaviour of that material. Examples of material types could include surface types ("wood", "concrete", "water", etc), reflectance models (Lambert, Phong, Blinn, etc). Each "material type" usually requires the following GPU resources:

* Vertex Buffer
* Vertex Shader
* Pixel Shader
* Shader Constant Buffer

Taking the Phong reflectance model, examples of parameters include the diffuse and specular colours, shinyness component, etc. These parameters are usually stored inside the shader constant buffer. In fact, for materials with with same "type" but different parameters, the vertex buffer, vertex shader, and pixel shader can be shared with only the shader constant buffer changing in between draw calls. With this in mind, we can order our material groups so that we can eliminate redundant state changes.

For example, imagine a scene containing three cubes - a red phong-shaded cube, a green lambertian cube, and a blue phong-shaded cube. As the two phong-shaded cubes can share the same vertex buffers, vertex shaders, and pixel shaders, we can render the scene in the following order to reduce state changes in between draw calls:

* Draw the green cube
	* Set the "lambertian" vertex buffer, vertex shader, and pixel shader
	* Set the "green" shader constant buffer
	* Issue a draw command

* Draw the red cube
	* Set the "phong" vertex buffer, vertex shader, and pixel shader
	* Set the "red" shader constant buffer
	* Issue a draw command

* Draw the blue cube
	* Don't need to set the "phong" vertex buffer, vertex shader, and pixel shader again, as they are already set
	* Set the "blue" shader constant buffer
	* Issue a draw command

Because the red and blue cubes can share the same vertex buffer, vertex shader, and pixel shader, we have reduced the amount of GPU resources we are using and have therefore reduced the number of state changes required to render our scene.

The above example was a very simple one - in the next part I'll dive in and examine each resource that we use in order to render a mesh, and how we can potentially share these resources between multiple materials.
