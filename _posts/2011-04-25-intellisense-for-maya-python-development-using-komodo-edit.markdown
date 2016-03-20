---
layout: post
title: Intellisense for Maya Python Development with Komodo Edit
date: '2011-04-25 21:02:37 +0100'
---

![Intellisense for Maya Python Development in Komodo Edit]({{ site.baseurl }}/images/MayaPythonIntellisense.png)

I use Komodo Edit as an alternative to the built-in Script Editor for Maya Python development. Whilst I can live without Intellisense, it is useful to have and so I spent a bit of time the other day trying to get it working. It turned out to be incredibly easy!

Komodo Edit has built-in Intellisense support for the Python Standard Library, and can also parse Python source files. However, the Maya Python API (OpenMaya, OpenMayaMPx, etc) are provided as compiled Python files (.pyc). Unfortunately Komodo Edit cannot parse these. However, it does allow you to extend its Intellisense Database with 'API Catalogue' files. These files are just XML files that describe the constructs inside your API.

It turns out that there is a freely available Komodo Extension called [Maya-Mel](http://support.activestate.com/xpi/maya-mel) that not only provides an API Catalogue for the Maya Python API, but also provides syntax highlighting for MEL. For any Maya developer using Komodo, this is a must. In order to get it set up, follow these instructions:

* Download the .XPI file from [this page](http://support.activestate.com/xpi/maya-mel)
* Open the .XPI file in Komodo to install it (a dialog will appear to confirm this)
* Restart Komodo
* Open the Komodo Preferences dialog
	* Under 'Code Intelligence', find the 'API Catalogues' list
	* You should now see 'Maya' in the list (note that this list is not alphabetically sorted!)
	* Tick the checkbox next to 'Maya' in this list and close the preferences dialog box
