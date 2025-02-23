---
layout: post
title: BVH Animation Plugin for OpenUSD
date: 2025-02-23 14:55 +0000
---
I have recently released an open-source BVH animation file format plug-in for [OpenUSD](https://openusd.org/).

**[Github Repo](https://github.com/jbrd/usdBVHAnim)** \| **[Documentation](https://jbrd.github.io/usdBVHAnim)**

# What Does It Do?

The plug-in enables USD to read BVH skeletal animation files, by translating them into the `usdSkel` schema.

![BVH skeleton and animation loaded in usdview]({{ site.baseurl }}/images/screenshot-bvh-skeleton.png)

Once installed, USD can either read them directly, e.g.:

```
> usdview ./walk_motion.bvh
```

Or compose BVH data into a larger scene through its composition arcs, e.g:

```
over "AnimationData"
(
    references = @./walk_motion.bvh@
)
{
}
```

# Example Use Cases

Here are some example use cases that are made possible by the plug-in:

💡Use `usdview` to inspect and play back skeletal animation data in BVH files

💡Use `usdrecord` to render playblasts of BVH motion capture data on the command line

💡Use USD to transcode BVH motion capture data to other file formats

💡Use USD to compose BVH animation into a larger scene composition

💡Extend a DCC that supports USD (and the usdSkel schema) to import BVH animation data

💡Write your skeletal animation pipeline on top of USD and use this plug-in to ingest BVH data into it

💡Ingest the various open source motion capture data sets delivered in BVH (Ubisoft LAFAN1, etc...) into your USD-based skeletal animation pipeline

To illustrate one such use case, here is a screenshot of the plug-in being used to bind a BVH animation from the Ubisoft LAFAN1 dataset to its sample model, visualised in usdview.

![usdview screenshot showing the binding of a BVH animation from the LAFAN1 dataset with its sample model]({{ site.baseurl }}/images/screenshot-lafan1-model-and-anim.png)
