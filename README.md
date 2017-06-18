# sheepydoc
A python docstring based documentation generator, using the AngularJS framework

Have a look at the [sheepy documentation](https://starhash.github.io/sheepydoc/).

It works during the runtime by scanning all modules and classes for more modules, classes and methods declared within using the methods defined in python's [inspect](https://docs.python.org/2/library/inspect.html) module.

To let the sheeps do their job to perfection, you will need to provide documentation within multiline docstrings for every nameable Python structure (modules, classes and methods).

To generate documentation for you project, you can place the *templates* folder in the present working directory for your python script along with the *sheepydoc.py* script.
The documentation can be generaetd by-
```
import sheepydoc

sheepydoc.generatedoc(
    <module>,
    output = '<output_folder>',
    logo = '<your_logo>',
    ignore____methods = True,
    glossary = <dictionary_of_terms>
    )
```

The sheepy markdown is used to provide more information to the sheepydoc engine.

For methods-
- @param <parameter_name> : <parameter_type(s separated by '/')> {
      <documentation string for parameter>
    }
- @returns <return_type> {
      <documentation string for parameter>
    }

For modules-
- @app <name>
  will tell the module name, and will only be interpreted for the root module.
- @sub <name>
  will tell the module sub heading and will only be interpreted for the root module.
  
URLs and indices-
- Like Github, [<text>](<URL>) will show a link with the <text> to the <URL> specified.
- $index{<text>} makes a hotlink to another element within the documentation, (only modules, classes adn methods. Need to give full name for a module, example - sheepydoc.generatedoc).
- $glossary{<text>} makes a quick link to the glossary term. The glossary can be specified as a dictionary during the sheepydoc.generatedoc method call.

Feel free to report any issue or needed enhancements.
