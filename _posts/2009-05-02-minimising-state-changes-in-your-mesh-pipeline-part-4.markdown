---
layout: post
title: Minimising State Changes in your Mesh Pipeline (Part 4)
date: '2009-05-02 12:47:44 +0100'
---

In the last few articles, I showed how you can speed up your mesh rendering pipeline by batching geometry that share similar GPU resources together. We looked at how we can do this within a single mesh, and also with multiple instances of the same mesh. This final article will extend this optimisation into multiple instances of different meshes.

So before we can begin batching up similar chunks of different meshes, these meshes must share some common resources. This is often tricky in practice, because many engines represent a mesh as an entity whose resources are often not publically exposed. However, many engines have layers of abstraction, and we can exploit these to achieve a greater level of sharing.

The first layer of abstraction lies totally outside most graphics engines, and this is the underlying file system. All of the industrial-grade file (resource, asset, etc) systems that I have ever used have possessed two key features:

* Duplicate data removal at build-time
* Reference counting at run-time

When used together, these features enable you to automatically share resources for free (without any modification to your mesh library). The idea is that at build-time, duplicate data is reduced down to a single unique resource. Imagine a case where lots of levels reference the same texture. Duplicate data removal ensures that when you come to ship your game, this texture only appears once (on whatever medium you choose to ship your game).

Having removed duplicates, you’ll end up with a bunch of resources that depend on a bunch of other resources. Imagine now that you have some car meshes that all share a common wheel texture. When loading each car mesh, you’ll probably want to load all of their textures as well. If two cars share the same texture resource, and the file system maintains a reference count on resources that have been loaded, then at runtime, only one copy of the texture will be loaded into memory. As a result, this single copy will be shared amongst the other resources that depend on it.

Textures are just one type of resource that can benefit from this “free” sharing of resources. In the past I have worked with mesh libraries that generated shaders based on shader graphs that the artist has defined in their DCC package (3DS Max, Maya, etc). Without being able to detect duplicate shaders, this type of system is actually really dangerous as you could end up with hundreds of copies of the same shader!

Once we have many meshes sharing the same resources, we still need a way of batching different parts of these meshes together. We can take advantage of another layer of abstraction here – the renderer itself, which provides a layer of abstraction between the mesh (or renderable) and the graphics API.

All renderers have a concept of a “renderable”. A very simple renderer design would define a “renderable” as “an object that can be rendered”. In this design, renderables would be added to a render queue and then submitted for rendering. Under this pattern, a mesh would be considered a single renderable and added to the render list. The problem with this design is that the mesh is represented as a single entity. This doesn’t provide the renderer with enough information to split up the mesh into groups of data that can be batched together.

This can be fixed by extending the definition of “renderable” to “a collection of geometry and a material”. As an example, a “material” could also be defined as “a shader and a collection of textures”. As a mesh could be composed of many materials, adding the mesh to the “render list” would now result in adding several renderables. As each renderable now has a material definition, the renderer can sort the render list by material and batch similar renderables together. These renderables could belong to different meshes, but at this point the renderer doesn’t need to care.

In closing, maximising shared state by batching similar materials together is the key to reducing the number of state changes in your mesh pipeline. Different materials inside the same mesh can be batched together as part of the build process. Different materials inside different meshes can be batched at runtime by exploiting resource sharing at the file system level, and exposing material information to the renderer so that it may sort by similar material.
