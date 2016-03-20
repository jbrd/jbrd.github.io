---
layout: post
title: Saving custom data in Visual Studio 2005 .suo files using the Managed Package Framework
date: '2007-02-11 14:37:40 +0000'
---

Recently, I've been learning how to use the Visual Studio 2005 SDK, so that I can add new and exciting features to the IDE! I am using the managed package framework, as it is by far the easiest way of creating a VS package. While coding one of my nice new features, I came to a point where I wanted to store some custom data in the solution user options file (the .suo file that sits along side the solution file). After trawling the documentation, I found that I needed to implement the `IVsPersistSolutionOpts` interface, but also noticed that the MPF Package class implements this anyway. It turns out that the Package class actually does a lot of the work for you.

Each setting that gets stored in the .suo file has a key string, which is used to identify that particular setting. Let us suppose that we want to store a setting called `MySetting`:

1. In the Package's Initialize method, call `Package.AddOptionKey` for each setting, passing the settings' key string (`"MySetting"`)

2. Override `Package.OnLoadOptions`. When Visual Studio loads the solution file, this method is called for each setting found in the .suo file. This method has two arguments - a 'key' string, and a stream. If the key string matches that of our custom data (`"MySetting"`), then we will want to read this setting's data from the stream. Otherwise, we will call the base class' `OnLoadOptions` method.

3. Override `Package.OnSaveOptions`. This method is called for each .suo option that is saved. Again, this method has two arguments: a 'key' string, and a stream. We want to check if the key string matches that of our custom setting (`"MySetting"`). If it does, we want to write our custom data to the stream, otherwise we will call the base class' implementation.

4. Most of the implementation is now done. However, we want to make sure that our package is loaded when a solution is opened. This is because if Visual Studio delays the loading of our package until after we have opened a solution file, we wouldn't have had a chance to load our custom data. We can tell Visual Studio to load our package automatically when a solution is opened, by adding the `ProvideAutoLoad` attribute to our Package class, and passing in the following GUID string: `{f1536ef8-92ec-443c-9ed7-fdadf150da82}`. This is the GUID for `UICONTEXT_SolutionExists` (we cannot pass `UICONTEXT_SolutionExists` because the attribute expects a string constant, not a GUID).
