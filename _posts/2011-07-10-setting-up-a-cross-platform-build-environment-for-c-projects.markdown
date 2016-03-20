---
layout: post
title: Setting up a cross platform build environment for C++ projects
date: '2011-07-10 19:11:00 +0100'
---

I never thought I'd actually say this, but I don't do a lot of Windows programming anymore - I have a Mac at home, and use Linux at work. I have recently been extending my demos code-base to support Mac OS X and Linux as well as Windows.

The original codebase was made up of Visual Studio projects and could be built over the command line with NAnt (allowing tools, data, and code to be built in the correct order). It quickly became clear that this was not going to extend nicely to other platforms for two main reasons.

The first reason is that Visual Studio projects are platform specific and cannot be used to define project structure on other platforms. Whilst you could check in lots of platform specific project files (Visual Studio projects for Windows, Xcode projects for Mac, Makefiles for Linux, etc), this quickly becomes tedious to manage. For example, suppose you want to add a source file. You'd have to update every type of project file, which is not an easy task if you've only got one of these platforms in front of you.

The second reason is that all of my tools were .NET based and whilst I could in theory use Mono to run these programs on non-Microsoft platforms, in practise this never turns out to be that simple.

To address the above problems I set myself the following goals:

* A single unified workflow should apply to all supported platforms
* Each project should only be defined once (i.e. use platform independant project files, rather than VS, Xcode, etc)
* Avoid the Mono layer of abstraction by rewriting the tools in a platform independant language

I had a look at several cross platform build tools, but settled on CMake. CMake allows you to define your executable and library projects in platform-independant, human-readable configuration files. CMake will then parse these configuration files and generate the platform specific project files for an IDE of your choosing. This is possibly the greatest thing about CMake, as it allows programmers to continue to work in the IDE of their choice. Furthermore, it can generate these files "out of source" (in a totally separate directory), which means that none of these generated files will ever interfere with your source code directories. This also makes cleaning your build extremely simple - you just have to delete the contents of your out-of-source directory.

Certain features of CMake are controlled via environment variables. I spent a bit of time automating the development environment setup process by using Insomniac Games EShell. I've blogged about EShell before - it is essentially a nice little perl script that allows you to define your environment variables in an XML file, and have it set them all up for you (it actually does a bit more than this - check out the Nocturnal Initiative for more info!)

Anyway, my directory structure now looks something like this:

* `config/` - Contains the EShell configuration files for the development environment
* `external/` - Contains all external software / libraries
* `source/` - Contains all source code and CMake projects
* `tools/` - Contains all tools (now written in Python)
* `workspace/` - An empty folder that can be used for out-of-source CMake builds (this folder is ignored by version control)

In my root directory I also have the following Bash / Batch scripts:

* `eshell.sh`
* `eshell.bat`

These are just shortcut scripts for running EShell.

With all of the above in place, the day-to-day workflow now looks something like this:

* Open up a terminal or command prompt and navigate to the project directory
* `./eshell`
* `cd workspace`
* `cmake ../source`
* Open up the generated project files in your favourite IDE

This workflow is consistent across all platforms. I've been really impressed with CMake so far - I'd definitely recommend it for cross platform work.
