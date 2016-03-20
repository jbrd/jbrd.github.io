---
layout: post
title: CMake Cheat Sheet
date: '2011-07-16 19:14:55 +0100'
---

In my last post I explained how I recently extended my build to support multiple platforms using CMake. During this process, there were several tasks that required some Googling (as the CMake documentation can be a bit hard to chew). I thought it would be useful to combine all of these little tips into a single post. Enjoy!

**Adding a Directory to your Header Search Paths**

To add a header search path, use the `include_directories` command. For example:
{% highlight cmake %}
include_directories( ../external/boost/ )
{% endhighlight %}

**Adding a Directory to your Library Search Paths**

Same syntax as above, but use the `link_directories` command instead:

{% highlight cmake %}
link_directories( ../external/libcinder/libs/ )
{% endhighlight %}

**Linking To Third-Party Libraries**

To link to a third-party library, you first need to add the library to your project as if it were a library you are building yourself. You can do this with the `add_library` command:

{% highlight cmake %}
add_library( libcinder STATIC IMPORTED )
{% endhighlight %}

The third argument is the most important here - it tells CMake that this library is pre-built, and that there are therefore no sources to specify. 

Once you've defined the library, you then have to tell CMake where the prebuilt library is located. This can be done by setting the `IMPORTED_LOCATION` property on your new library:

{% highlight cmake %}
set_property( TARGET libcinder PROPERTY IMPORTED_LOCATION libcinder.a )
{% endhighlight %}

Now that you have defined your library, you can then have your executable target it by using the `target_link_libraries` command:

{% highlight cmake %}
add_executable( AwesomeDemo ${ SOURCE_FILES } )
target_link_libraries( AwesomeDemo libcinder )
{% endhighlight %}

**Specifying Different Debug and Release Libraries**

Is is pretty likely that your third-party vendor has supplied different debug and release builds of their libraries. Here is an example of how to express this in CMake:

{% highlight cmake %}
add_library( libcinder_d STATIC IMPORTED )
add_library( libcinder STATIC IMPORTED )

set_property( TARGET libcinder_d PROPERTY IMPORTED_LOCATION libcinder_d.a )
set_property( TARGET libcinder PROPERTY IMPORTED_LOCATION libcinder.a )

add_executable( AwesomeDemo ${ SOURCE_FILES } )
target_link_libraries( AwesomeDemo debug libcinder_d optimized libcinder )
{% endhighlight %}

What we've basically done here is define both external libraries. Then, when calling the `target_link_libraries` command we can use the `debug` and `optimized` keywords to specify the two versions accordingly.

**How To Access Environment Variables**

Environment variables can be accessed via the ENV CMake variable, for example:

{% highlight cmake %}
include_directories( $ENV{ MAYA_PATH }/devkit/include )
{% endhighlight %}

**How to detect Apple, Windows, and Linux**

If you need to add platform specific commands to your CMakeLists then you can use the following syntax:

{% highlight cmake %}
IF (APPLE)
    # Add your apple commands here
ENDIF ( )

IF (WIN32)
    # Add your windows commands here
ENDIF ( )

IF (UNIX)
    # Add your unix commands here
ENDIF ( )
{% endhighlight %}

**How to force i386 architecture on Apple Builds**

By default, CMake targets the architecture that you are running on. This means that if you're running on a 64-bit Intel CPU, your target architecture will be set to x86_64. Some external libraries don't support 64-bit processors, in which case you need to find a way of forcing CMake to target 32-bit architectures only. This can controlled via the `CMAKE_OSX_ARCHITECTURES` environment variable. This environment variable takes a comma separated list of all the architectures you want to target. So, to force CMake to target 32-bit Intel chips, you would set `CMAKE_OSX_ARCHITECTURES` to `i386`. 

**How to build an executable project as an Apple app bundle**

On Apple, by default the `add_executable` command will build an executable as a command line tool. In order to build the executable as an app bundle, use the MACOSX_BUNDLE keyword:

{% highlight cmake %}
add_executable( AwesomeDemo MACOSX_BUNDLE ${ SOURCE_FILES } )
{% endhighlight %}
