---
layout: post
title: Detecting the Windows Forms Designer in code
date: '2007-03-24 09:41:27 +0000'
---

There are times when you are designing a control or a form in C#, whose constructor needs to be passed information. However, the control will also need a default constructor in order for the Windows Forms Designer to work correctly. This default constructor should not be called at run-time (only design-time), and this rule should be enforced. To do this, we need to add some code to our default constructor, that will throw an `InvalidOperationException` when it is called at run-time, but not at design-time.

The solution to this problem is to use `GetService` to return a `System.ComponentModel.Design.IDesignerHost` service. It will return `null` if the service isn't running (i.e. if we are at run-time).

Take the following class as an example. It has a default constructor that contains our design time check, and another constructor that should be used at run-time. It also has a private method called `CommonCtor`, which contains construction code that should be ran for both constructors.

{% highlight csharp %}
public partial class DocumentView : Form
{
	private Document m_Document = null;

	public DocumentView()
	{
		// Detect design-time
		if (GetService(typeof(IDesignerHost)) == null)
		{
		    // Not in design-time - throw an exception
		    throw new InvalidOperationException();
		}

		CommonCtor();
	}

	public DocumentView(Document document)
	{
		CommonCtor();
		m_Document = document;
	}

	private void CommonCtor()
	{
		InitializeComponent();
	}
}
{% endhighlight %}
