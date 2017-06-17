"""
Sheepydoc (a *sheepy* documentation generator).

A very simple, easy to use documentation generator written in Python.
It uses the docstrings from defined entities (modules,classes and methods) to generate content.

Find it on [Github]{https://github.com/starhash/sheepydoc}.

<h2>Using sheepydoc</h2>
Coming soon.


@app sheepydoc
@sub Documentation Generator for Python
"""

import inspect
import re
import os
import shutil
import importlib
import pprint
from json import dumps
from io import StringIO

def _tab_(_count_ = 0):
    return "  " * _count_

def _deleteall_(top):
    """
    Helper method which cleans the passed directory tree as parameter.

    @param top : str {
        The directory (empty/non-empty) to remove
        }
    """
    try:
        for root, dirs, files in os.walk(top, topdown=False):
            for name in files:
                os.remove(os.path.join(root, name))
            for name in dirs:
                if os.path.exists(os.path.join(root, name)):
                    os.rmdir(os.path.join(root, name))
            os.rmdir(root)
    except:
        pass

def _splitinclude_(docstring, splitters = []):
    """
    Helper function which removes the '@' tags used by sheepydoc from the $glossary{docstring}.

    @param string : str {
        The docstring which needs to be cleaned.
        }
    """
    for splitter in splitters:
        of = splitter[1][0] + ((' : ' + splitter[1][1]) if not splitter[0] == 'returns' else '')
        start = docstring.index(of)
        end = docstring.rindex(splitter[1][len(splitter[1]) - 1]) + len(splitter[1][len(splitter[1]) - 1])
        sub = "@" + splitter[0] + " " + docstring[start : end + 1]
        docstring = docstring.replace(sub, "")
    return docstring

def _getsourcecode_(source):
    """
    Helper function which gets the source code of the module/method/class passed as parameter, only if it is available.

    @param source : module/class/function {
        The object for which the source code is needed
        }
    """
    src = ""
    try:
        code = inspect.getsourcelines(source)
        if code != None:
            src = "".join(code[0])
    except:
        try:
            with open (source.__spec__.origin, "r") as myfile:
                src = "".join(myfile.readlines())
        except:
            return src
    return src.replace("`", "'")

def _getsubmodules_(module):
    """
    Helper function which finds all the sub modules by hook or crook. (Looks into the source code folder from which the module is loaded, if sub-modules aren't loaded yet.)

    @param module : module {
        The module object for which sub-modules are needed
        }
    """
    _modules_ = []
    module_spec = module.__spec__
    def _list_modules_in_(location):
        for item in os.listdir(location):
            if os.path.isdir(location + '\\' + item):
                if os.path.exists(location + '\\' + item + '\\__init__.py'):
                    _module_ = module.__name__ + '.' + item
                    try: 
                        _modules_.append(importlib.import_module(_module_))
                    except ModuleNotFoundError: 
                        print('not found module : ' + _module_)
            elif item.endswith('.py') and item != "__init__.py":
                _module_ = module.__name__ + '.' + item[0 : len(item) - 3]
                try: 
                    _modules_.append(importlib.import_module(_module_))
                except ModuleNotFoundError:
                    print('not found module : ' + _module_)
    if not module_spec.submodule_search_locations == None:
        for location in module_spec.submodule_search_locations:
            _list_modules_in_(location)
    #_list_modules_in_(os.path.dirname(module_spec.origin))
    else:
        for _module_ in inspect.getmembers(module, inspect.ismodule):
            _modules_.append(_module_[1])
    return _modules_

def _getdocstring_(obj):
    """
    Helper function which retrieves the $glossary{docstring} of the passed module/class/function object.

    This function is also responsible for the processing of the sheepy-markdown.

    @param obj : object {
        The object for which docstring needs to be processed and returned
        }
    """
    if obj.__doc__ == None:
        return ""
    _doc_ = obj.__doc__.strip()
    _doc_ = _doc_.replace("\n\n", "<br /><br />")
    _doc_ = _doc_.replace("\r\n\r\n", "<br /><br />")
    _doc_ = re.sub(r'\*([A-Za-z 0-9]+)\*', r'<b>\1</b>', _doc_)
    _doc_ = re.sub(r'\~([A-Za-z 0-9]+)\~', r'<i>\1</i>', _doc_)
    _doc_ = re.sub(r'\_([A-Za-z 0-9]+)\_', r'<u>\1</u>', _doc_)
    _doc_ = re.sub(r'\[([A-Za-z 0-9]+)\]\{([a-zA-z0-9\_\&\#\$\.\,\-\=\+\'\"\[\]\{\}\(\)\\\/\@\!\~\`\:\;]+)\}', r'<a href="\2" target="_blank">\1</a>', _doc_)
    _doc_ = re.sub(
        r"""\$glossary\{[ ]*([A-Za-z0-9 \.\,]+)[ ]*\}""",
        r"""<span style="display: inline-flex;" class="sheepy-glossary-link" md-colors="{color:'accent'}" ng-click="openGlossary('\1');">\1</span>""",
        _doc_
        )
    _doc_ = re.sub(r"\$search\{([A-Za-z0-9 \.\,]+)\}", r"<a class='sheepy-link' target='_blank' href='https://www.google.co.in/search?q=\1'>\1</a>", _doc_)
    _doc_ = re.sub(
        r"""\$index\{[ ]*([A-Za-z0-9 \.\,]+)[ ]*\}""",
        r"""<span style="display: inline-flex;" class="sheepy-glossary-link" md-colors="{color:'primary'}" ng-click="setIndex('\1');">\1</span>""",
        _doc_
        )
    return _doc_

def _generatejson_class_(cls):
    """
    Generates the $search{JSON} convertible Python object that represents the class.

    @param cls : class {
        The class object to convert to JSON equivalent.
        }
    """
    _class = {}
    _class['code'] = '$sheepycode`' + _getsourcecode_(cls) + '`$sheepycode'
    _class['methods'] = _generatedoc_methods_(cls)
    _class['classes'] = _generatedoc_classes_(cls)
    print('class ' + cls.__name__)
    _docstring_ = _getdocstring_(cls)
    
    _class['description'] = _docstring_

    return _class

def _generatejson_method_(method):
    """
    Generates the $search{JSON} convertible Python object that represents the function.

    The function-JSON contains the following information-
    <ul>
    <li><b>code</b><br />The code for the function.</li>
    <li><b>description</b><br />The processed $glossary{docstring} for the method</li>
    <li><b>params</b><br />The parameters passed to the function.</li>
    <li><b>returns</b><br />The type of object(s) returned from the function</li>
    </ul>

    @param method : function {
        The method object to convert to JSON equivalent.
        }
    """
    _method = {}
    _method['code'] = '$sheepycode`' + _getsourcecode_(method) + '`$sheepycode'
    try: print('def ' + method.__name__)
    except: pass

    _docstring_ = _getdocstring_(method)
    m_params = re.findall(__param_re__, _docstring_)
    m_returns = re.findall(__returns_re__, _docstring_)
    m_list = []
    for m_param in m_params:
        m_list.append(["param", m_param])
    for m_return in m_returns:
        m_list.append(["returns", m_return])

    _docstring_ = [("<p>" + line.strip() + "</p>") for line in _splitinclude_(_docstring_, m_list).strip().splitlines() if len(line.strip()) != 0]
    _method['description'] = "".join(_docstring_)

    _method['params'] = {}
    for param in m_params:
        print("    " + param[0] + " : " + param[1])
        _method['params'][param[0]] = {
            'type': param[1],
            'description': "".join([("<p>" + line.strip() + "</p>") for line in param[2].splitlines() if len(line.strip()) != 0])
            }

    _method['returns'] = []
    for ret in m_returns:
        print("    returns " + ret[0])
        _method['returns'].append({
            'type': ret[0],
            'description': "".join([("<p>" + line.strip() + "</p>") for line in ret[1].splitlines() if len(line.strip()) != 0])
            })
    return _method

__param_re__ = re.compile(r'@param[ ]+([A-Za-z0-9\_]+)[ ]+\:[ ]+([A-Za-z\_0-9\.\/]+)[\r\n ]+\{([A-Za-z \,\.\<\>\/\?\;\'\:\"\[\]\{\}\(\)\-\=\_\+\!\#\$\%\^\&\*\~\`0-9\t\r\n\"]+)\}')
__returns_re__ = re.compile(r'@returns[ ]+([A-Za-z\_0-9\.\/]+)[\r\n ]+\{([A-Za-z \,\.\<\>\/\?\;\'\:\"\[\]\{\}\(\)\-\=\_\+\!\#\$\%\^\&\*\~\`0-9\t\r\n\"]+)\}')
__app_re__ = re.compile(r'@app[ ]+([A-Za-z 0-9\_\,\{\}\.\:\|\<\>\=\"\'\-\/\\]+)')
__sub_re__ = re.compile(r'@sub[ ]+([A-Za-z 0-9\_\,\{\}\.\:\|\<\>\=\"\'\-\/\\]+)')

def _generatedoc_modules_(module):
    """
    Generates the $search{JSON} convertible Python object that represents the modules.
    Basically returns an array of module-JSON converted.

    @param module : module {
        The parent module needed to be processed
        }
    """
    if inspect.ismodule(module):
        _modules = {}
        for _module_ in _getsubmodules_(module):
            _parent_ = _module_.__spec__.parent
            if _module_.__spec__.name == _parent_ and '.' in _parent_:
                _parent_ = _parent_[0 : _parent_.rindex('.')]
            if _parent_ == module.__name__:
                _modules[_module_.__name__] = _generatedoc_(_module_)
        return _modules
    return []

def _generatedoc_methods_(mod_class):
    """
    Generates the $search{JSON} convertible Python object that represents the methods for either a class or a module.
    Basically returns an array of methods-JSON converted.

    @param mod_class : module {
        The module or class needed to be processed
        }
    """
    if inspect.ismodule(mod_class):
        _methods = {}
        for _method_ in inspect.getmembers(mod_class, inspect.isroutine):
            if _settings_['ignore____methods']:
                if _method_[0].startswith('__') and _method_[0].endswith('__'):
                    continue
            if _method_[1].__module__ == mod_class.__name__:
                _methods[_method_[0]] = _generatedoc_(_method_[1])
        return _methods
    if inspect.isclass(mod_class):
        _methods = {}
        for _method_ in inspect.getmembers(mod_class, inspect.isroutine):
            if _settings_['ignore____methods']:
                if _method_[0].startswith('__') and _method_[0].endswith('__'):
                    continue
            _methods[_method_[0]] = _generatedoc_(_method_[1])
            if not 'name' in _methods[_method_[0]]:
                _methods[_method_[0]]['name'] = _method_[0]
        return _methods
    return []

def _generatedoc_classes_(mod_class):
    """
    Generates the $search{JSON} convertible Python object that represents the classes.
    Basically returns an array of class-JSON converted.

    @param mod_class : module {
        The module or class needed to be processed
        }
    """
    if inspect.ismodule(mod_class):
        _classes = {}
        for _class_ in inspect.getmembers(mod_class, inspect.isclass):
            if _class_[1].__module__ == mod_class.__name__:
                _classes[_class_[0]] = _generatedoc_(_class_[1])
        return _classes
    if inspect.isclass(mod_class):
        _classes = {}
        for _class_ in inspect.getmembers(mod_class, inspect.isclass):
            if _class_[1].__module__ == mod_class.__name__:
                _classes[_class_[0]] = _generatedoc_(_class_[1])
        return _classes
    return []

def _generatedoc_(source):
    """
    This method processes the source (module/class/method) and returns the hirarchical $search{JSON} format Python object.

    @param source : module/class/method {
        The object to be processed
        }
    """
    if inspect.ismodule(source):
        _module = {}
        _docstring_ = _getdocstring_(source)
        if len(re.compile(r'\@nodoc').findall(_docstring_)) != 0:
            return {}
        try:
            name = __app_re__.findall(_docstring_)[0]
            start = _docstring_.index('@app')
            end = _docstring_.rindex(name) + len(name)
            _docstring_ = _docstring_.replace(_docstring_[start : end], "")
            _module['name'] = name
        except:
            _module['name'] = ""
        try:
            sub = __sub_re__.findall(_docstring_)[0]
            start = _docstring_.index('@sub')
            end = _docstring_.rindex(sub) + len(sub)
            _docstring_ = _docstring_.replace(_docstring_[start : end], "")
            _module['sub'] = sub
        except:
            _module['sub'] = ""
        _module['description'] = "".join([("<p>" + line.strip() + "</p>") for line in _docstring_.splitlines() if len(line.strip()) != 0])
        if len(_module['description']) == 0:
            _module['description'] = "<i>No description available</i>"
        
        _module['code'] = '$sheepycode`' + _getsourcecode_(source) + '`$sheepycode'
        _module['modules'] = _generatedoc_modules_(source)
        _module['classes'] = _generatedoc_classes_(source)
        _module['methods'] = _generatedoc_methods_(source)
        
        return _module
    elif inspect.isclass(source):
        return _generatejson_class_(source)
    elif inspect.isroutine(source):
        return _generatejson_method_(source)

_settings_ = {
    'ignore____methods': False
    }

def generatedoc(source, output = 'docs', logo = 'images/logo.png', glossary = {}, ignore____methods = False):
    """
    This is the prime call method to invoke the documentation generation.

    It checks if the 'docs' folder exists, if it does it deletes it.
    Then copies the <b><i>sheepydoc template</i></b> to the current working directory under the name of 'docs/<modulename>'.
    The documentation is stored under the <modulename> folder inside 'docs' folder.

    @param source : module/class/function {
        The object needed to be processed
        }
    @param outout : str {
        Default value = 'docs', the folder for the output
        }
    @param logo : str {
        Default value 'images/logo.png', the company/project logo file path
        }
    """
    _settings_['ignore____methods'] = ignore____methods
    if os.path.exists(output + '\\' + source.__name__):
        _deleteall_(output)

    sources = []
    if not isinstance(source, list):
        sources = [ source ]

    packages = {}
    for source in sources:
        json = _generatedoc_(source)
        packages[source.__name__] = json

    import sheepydoc
    shutil.copytree(os.path.join(os.path.dirname(os.path.abspath(sheepydoc.__spec__.origin)), 'template'), output + '\\' + source.__name__)
    if os.path.exists(logo):
        shutil.copyfile(logo, os.path.join(output, source.__name__, "images", "logo.png"))
    
    os.remove(output + '\\' + source.__name__ + '\\index.js')
    indexw = open(output + '\\' + source.__name__ + '\\index.js', "w")
    newSheepyJS = sheepyJS.replace('{$module}', source.__name__.replace('.', '_'))
    
    lines = dumps({ 'modules': packages, 'classes': {}, 'methods': {}, 'description': 'Documentation for ' + source.__name__, 'code': '' })
    
    newSheepyJS = newSheepyJS.replace('{$content}', lines.replace("\"$sheepycode`", "`").replace("`$sheepycode\"", "`"))
    newSheepyJS = re.sub(r'\{\$glossary\}', dumps(glossary), newSheepyJS)
    indexw.write(newSheepyJS)
    indexw.close()
    
    os.remove(output + '\\' + source.__name__ + '\\index.html')
    indexw = open(output + '\\' + source.__name__ + '\\index.html', "w")
    newSheepyHTML = sheepyHTML.replace('{$module}', source.__name__.replace('.', '_'))
    newSheepyHTML = newSheepyHTML.replace('{$name}', json['name'])
    newSheepyHTML = newSheepyHTML.replace('{$sub}', json['sub'])
    indexw.write(newSheepyHTML)
    indexw.close()

    return

sheepyJSFile = open("template\\index.js", "r")
sheepyJS = "".join(sheepyJSFile.readlines())

sheepyHTMLFile = open("template\\index.html", "r")
sheepyHTML = "".join(sheepyHTMLFile.readlines())
