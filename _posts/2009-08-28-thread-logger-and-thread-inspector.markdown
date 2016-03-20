---
layout: post
title: Thread Logger and Thread Inspector
date: '2009-08-28 12:00:14 +0100'
---

![Thread Inspector]({{ site.baseurl }}/images/ThreadInspector.png)

**Update - 22/02/2015:** The source code for this project is no longer available. The blog post still remains for people who previously downloaded it.

When writing multithreaded code, a programmer will often reason with the various parallel operations in his or her program by thinking about them with respect to time. When writing small programs or using well estabished concurrent patterns this is often tricky but none-the-less possible. In my experience this becomes a lot harder as the size of your project grows and if you happen to be working on a project with a poorly defined threading model this becomes nigh on impossible.

Even when I think I know what's going on, I often find myself wanting to verify my assumptions. I want to actually see which tasks are running on which threads, in which order, and how they compare in terms of performance. For these reasons I have written a very simple thread logging API and a tool to visualize these logs. The logging API is lock-less (only uses interlocked operations) and depends on the Windows API.

So how do you use it? Well, the thread logging API is composed of three classes - `ThreadLoggerManager_c`, `ThreadLogger_c`, and `ThreadLog_c`:

![UML Diagram of the Thread Logging API]({{ site.baseurl }}/images/ThreadLogUML.png)

The `ThreadLoggerManager_c` class is responsible for creating and destroying thread loggers, and enabling / disabling logging. The idea is that your master thread creates a `ThreadLoggerManager_c` and then passes this to each of your worker threads. Each worker thread can then use this manager to create a `ThreadLogger_c`:

{% highlight cpp %}
void MasterThread::Main( )
{
    // Create a log manager that has the capacity for 1024 log entries
    m_Manager = new ThreadLoggerManager_c( 1024 );

    // Spawn worker threads, and pass them the thread logger manager
    SpawnWorkerThread( m_Manager );
    SpawnWorkerThread( m_Manager );
    SpawnWorkerThread( m_Manager );

    // Wait for worker threads to complete...

    // Before you exit, make sure you destroy the ThreadLoggerManager
    delete m_Manager;
}

void WorkerThread::Main( ThreadLoggerManager_c * manager )
{
    // Create a thread logger for this single thread
    ThreadLogger_c * logger =
        manager->CreateThreadLogger( "Worker Thread" );

    // Start executing tasks, using the logger to record their activity
    DoWork( logger );

    // Before your thread exits, remember to destroy the logger!
    manager->DestroyThreadLogger( logger );
}
{% endhighlight %}

As you might have guessed, a `ThreadLogger_c` is designed to be used by one thread only, and is responsible for logging all of the activity on that single thread. This is actually a very important design decision - by keeping each `ThreadLogger_c` object single-threaded, we aren't imposing any changes to the threading model of the target application. This allows us to get accurate results that do not vary too much from a normal run of your application. The `ThreadLogger_c` object has two methods - `BeginTask` and `EndTask` which allows you to log the lifetime of your thread's tasks:

{% highlight cpp %}
void WorkerThread::DoWork( ThreadLogger_c * logger )
{
    // Run Task A
    logger->StartTask( "Task A" );
    bool taskAResult = DoTaskA( );
    logger->EndTask( taskAResult );

    // Run Task B
    logger->StartTask( "Task B" );
    bool taskBResult = DoTaskB( );
    logger->EndTask( taskBResult );
}
{% endhighlight %}

Logging is disabled by default - in order to enable it, you must call `StartLogging` on the `ThreadLoggerManager_c` - this instructs all thread loggers to begin recording tasks. Likewise, when you want to stop logging thread activity you must call `StopLogging`. `StopLogging` returns a pointer to a new `ThreadLog_c` object. This class represents the resultant log. It has methods that allow you to either iterate the log entries in-memory (in case you want to display the results immediately on screen), or export the log entries to an XML file format. 

{% highlight cpp %}
void MasterThread::Main( )
{
    // Start logging
    m_Manager->StartLogging( );

    // ... run rest of program

    // Stop logging and export resultant log
    ThreadLog_c * log = m_Manager->StopLogging( );
    log->ExportXML( "ThreadLog.xml" );
    delete log;
}
{% endhighlight %}

The XML file produced by `ThreadLog_c::ExportXML` can be read by the Thread Inspector Tool - a small Windows Forms application that displays the tasks on a timeline (see top of this page for a screenshot).
