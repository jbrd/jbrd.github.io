---
layout: post
title: Software Scaffolding with 'begin'
---

I recently released a small open-source terminal command called [begin](https://jbrd.github.io/begin/), for running logic-less project templates. The goal of the project is to make it easy for teams and individuals to reduce the amount of repetitive work in starting a new project, and to help them ensure new projects start off at quality.

![Begin Terminal Command]({{ site.baseurl }}/images/BeginTerminal.png)

# Motivation

The motivation for this command stems from my experience in working on a software team that had a relatively small number of engineers that were responsible for maintaining a large quantity (hundreds) of small software projects.

A high ratio of projects to engineers had some interesting consequences. It created opportunity where different software projects could adopt vastly different practises. Some of these differences were harmless (coding style), but others certainly affected the software quality (testing strategy for instance). Decisions about which coding style, testing framework, build system, etc were often deferred to the engineers writing the software, rather than having some central authority to make these decisions and enforce them. It is only natural and healthy for opinion and level of experience to vary greatly across an engineering team, but in this environment, this naturally lead to some inconsistency.

This inconsistency made it difficult to roll out wide-spread improvements across all software projects. Engineers would only ever be exposed to a small subset of these projects, and so this typically required the entire engineering team to coordinate and share this work, and it could sometimes be difficult to balance this maintenance against the day-to-day demands of production. In striving to do better, it was important to ensure new projects adopted best practises from the moment they were started.

# Software Scaffolding

This is where [software scaffolding](https://en.wikipedia.org/wiki/Scaffold_(programming)) can help. A *scaffold* is a small interactive program that guides the user through the creation of a new project. The concept was made popular by [Ruby on Rails](http://rubyonrails.org) which provides a `scaffold` command to automatically generate a model, view, and controller for an entity in your web app - in doing so, it creates the boilerplate code, sets up unit test modules, and enforces a consistent project structure by convention.

My idea was to adopt something similar for new software projects. The idea was that a developer could run `begin new maya-plugin` for example, and it would ask the developer a few questions about their new project, and then construct for them the source code for a boilerplate Maya plugin, along with the code necessary to spin up Maya in batch mode for unit tests, and build scripts that were compatible with our internal build system.

I also imagined this having to scale up to support several project variants, for example:

* `begin new maya-plugin`
* `begin new houdini-plugin`
* `begin new nuke-plugin`
* `begin new clarisse-plugin`
* `begin new standalone-app`

If that were to happen, then we would need to ensure the creation and maintenance of these scaffolds was cheap. Specifically, cheaper than the cost of having to maintain the source code for an equivalent scaffolding script.

# Template-Driven Scaffolding

One alternative to expressing a scaffold in terms of source code is to express it in terms of a *template*.

This is the approach that forms the basis of [begin](https://jbrd.github.io/begin/). In [begin](https://jbrd.github.io/begin/) a template is simply a collection of files and directories. These can be placed in a [Git](https://git-scm.com) repository, such that a template can be shared across teams, and can evolve over time. [begin](https://jbrd.github.io/begin/) has commands for installing, removing, and updating templates from [Git](https://git-scm.com):

* Install a template from Git with the `begin install` command
* Update a Git-based template with the `begin update` command
* Uninstall a template with the `begin uninstall` command

File names, directory names, and file content are permitted to contain [Mustache](https://mustache.github.io) tags. When creating your template, you can tell [begin](https://jbrd.github.io/begin/) about expected tags, and [begin](https://jbrd.github.io/begin/) will then prompt the user for their values when the template is evaluated. The benefits of using [Mustache](https://mustache.github.io) is that whilst it is logic-less, it supports many useful templating concepts such as false values, and arrays of values. [begin](https://jbrd.github.io/begin/) can take advantage of this - for instance, when you tell [begin](https://jbrd.github.io/begin/) that a template tag expects an array of values, [begin](https://jbrd.github.io/begin/) will prompt the user for multiple values in the terminal.

# Simple Example

Suppose we have a template consisting of two files:

* `.begin.yml`
* `Example.txt`

We have a template configuration (`.begin.yml`) which tells [begin](https://jbrd.github.io/begin/) that we are expecting one tag called `name`. As part of the configuration, we also give this tag a human-readable label that can be printed to the terminal:

```
tags:
    name:
        label: Your Name
```

We also have a content file (`Example.txt`) which contains a [Mustache](https://mustache.github.io) tag:

{% raw %}
```
Hello {{name}}
```
{% endraw %}

Upon evaluating the template, [begin](https://jbrd.github.io/begin/) checks the template configuration to see which tags are expected, and prompts the user for their values. This is then passed to [Mustache](https://mustache.github.io) which substitutes these values into the resultant files. The template is evaluated by using the `begin new` command:

```
$ begin new example-template
Your Name: World
Running Template 'example-template'...
Template 'example-template' successfully run
```

The directory will now have a file called `Example.txt` containing the string `Hello World`.

# File and Directory Names

Whilst the above example is very simple, it should be possible to imagine this scaling to more complicated use cases, in which your template contains source files, unit tests, build scripts, and uses various [Mustache](https://mustache.github.io) tags to customise this content when the template is evaluated. 

Another powerful feature of [begin](https://jbrd.github.io/begin/) is that file and directory names are also permitted to contain [Mustache](https://mustache.github.io) tags.

{% raw %}
Suppose that in the previous example, your template contained another file called `{{name}}.txt`. This would be evaluated to `World.txt` in the destination directory.
{% endraw %}

# Conclusion

[begin](https://jbrd.github.io/begin/) provides a simple way to construct and evaluate template-based scaffolds, and share them with others. If you are interested, please try it!

* Read the [User Guide](https://jbrd.github.io/begin/) for more information about the command
* Read the [Installation Guide](https://jbrd.github.io/begin/install.html) to obtain the command
* Go to the [Project on Github](https://github.com/jbrd/begin/) for the source code, issues, etc...
* For an example, see [Begin Template for LaTeX documents](https://github.com/jbrd/begin-latex-document/)

