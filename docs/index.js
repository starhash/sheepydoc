var app = angular.module('sheepydoc', ["angular-bind-html-compile", 'ngMaterial']);

app.config(function ($mdThemingProvider) {
    $mdThemingProvider.definePalette('sheepyBlue', {
        '50': 'e6f3ff',
        '100': 'acd7fe',
        '200': '99ceff',
        '300': '66b5ff',
        '400': '4da9ff',
        '500': '339cff',
        '600': '1a90ff',
        '700': '0084ff',
        '800': '0077e6',
        '900': '0069cc',
        'A100': '005cb3',
        'A200': '004f99',
        'A400': '004280',
        'A700': '003566',
        'contrastDefaultColor': 'light',    // whether, by default, text (contrast)
        // on this palette should be dark or light

        'contrastDarkColors': ['50', '100', //hues which contrast should be 'dark' by default
            '200', '300', '400', 'A100'],
        'contrastLightColors': undefined    // could also specify this if default was 'dark'
    });
    $mdThemingProvider.definePalette('sheepyPink', {
        '50': 'ffcce2',
        '100': 'ffb3d4',
        '200': 'ff99c5',
        '300': 'ff80b7',
        '400': 'ff66a8',
        '500': 'ff4d9a',
        '600': 'ff338b',
        '700': 'ff1a7d',
        '800': 'ff006f',
        '900': 'e60063',
        'A100': 'ce0058',
        'A200': 'b3004d',
        'A400': '990042',
        'A700': '800037',
        'contrastDefaultColor': 'light',    // whether, by default, text (contrast)
        // on this palette should be dark or light

        'contrastDarkColors': ['50', '100', //hues which contrast should be 'dark' by default
            '200', '300', '400', 'A100'],
        'contrastLightColors': undefined    // could also specify this if default was 'dark'
    });
    $mdThemingProvider.definePalette('white', {
        '50': 'ffffff',
        '100': 'ffffff',
        '200': 'ffffff',
        '300': 'ffffff',
        '400': 'ffffff',
        '500': 'ffffff',
        '600': 'ffffff',
        '700': 'ffffff',
        '800': 'ffffff',
        '900': 'ffffff',
        'A100': 'ffffff',
        'A200': 'ffffff',
        'A400': 'ffffff',
        'A700': 'ffffff',
        'contrastDefaultColor': 'light',    // whether, by default, text (contrast)
        // on this palette should be dark or light

        'contrastDarkColors': ['A100'],
        'contrastLightColors': undefined    // could also specify this if default was 'dark'
    });

    $mdThemingProvider.theme('default').primaryPalette('sheepyBlue');
    $mdThemingProvider.theme('default').accentPalette('sheepyPink');
    $mdThemingProvider.theme('white').accentPalette('white');
});

app.controller('sheepydocController', ['$scope', function($scope) {
    $scope.content = {"modules": {"sheepydoc": {"name": "sheepydoc", "sub": "Documentation Generator for Python", "description": "<p>Sheepydoc (a <b>sheepy</b> documentation generator).<br /><br />A very simple, easy to use documentation generator written in Python.</p><p>It uses the docstrings from defined entities (modules,classes and methods) to generate content.<br /><br />Find it on <a href=\"https://github.com/starhash/sheepydoc\" target=\"_blank\">Github</a>.<br /><br /><h2>Using sheepydoc</h2></p><p>Coming soon.<br /><br /></p>", "code": `\"\"\"\nSheepydoc (a *sheepy* documentation generator).\n\nA very simple, easy to use documentation generator written in Python.\nIt uses the docstrings from defined entities (modules,classes and methods) to generate content.\n\nFind it on [Github]{https://github.com/starhash/sheepydoc}.\n\n<h2>Using sheepydoc</h2>\nComing soon.\n\n\n@app sheepydoc\n@sub Documentation Generator for Python\n\"\"\"\n\nimport inspect\nimport re\nimport os\nimport shutil\nimport importlib\nimport pprint\nfrom json import dumps\nfrom io import StringIO\n\ndef _tab_(_count_ = 0):\n    return \"  \" * _count_\n\ndef _deleteall_(top):\n    \"\"\"\n    Helper method which cleans the passed directory tree as parameter.\n\n    @param top : str {\n        The directory (empty/non-empty) to remove\n        }\n    \"\"\"\n    try:\n        for root, dirs, files in os.walk(top, topdown=False):\n            for name in files:\n                os.remove(os.path.join(root, name))\n            for name in dirs:\n                if os.path.exists(os.path.join(root, name)):\n                    os.rmdir(os.path.join(root, name))\n            os.rmdir(root)\n    except:\n        pass\n\ndef _splitinclude_(docstring, splitters = []):\n    \"\"\"\n    Helper function which removes the '@' tags used by sheepydoc from the $glossary{docstring}.\n\n    @param string : str {\n        The docstring which needs to be cleaned.\n        }\n    \"\"\"\n    for splitter in splitters:\n        of = splitter[1][0] + ((' : ' + splitter[1][1]) if not splitter[0] == 'returns' else '')\n        start = docstring.index(of)\n        end = docstring.rindex(splitter[1][len(splitter[1]) - 1]) + len(splitter[1][len(splitter[1]) - 1])\n        sub = \"@\" + splitter[0] + \" \" + docstring[start : end + 1]\n        docstring = docstring.replace(sub, \"\")\n    return docstring\n\ndef _getsourcecode_(source):\n    \"\"\"\n    Helper function which gets the source code of the module/method/class passed as parameter, only if it is available.\n\n    @param source : module/class/function {\n        The object for which the source code is needed\n        }\n    \"\"\"\n    src = \"\"\n    try:\n        code = inspect.getsourcelines(source)\n        if code != None:\n            src = \"\".join(code[0])\n    except:\n        try:\n            with open (source.__spec__.origin, \"r\") as myfile:\n                src = \"\".join(myfile.readlines())\n        except:\n            return src\n    return src.replace(\"'\", \"'\")\n\ndef _getsubmodules_(module):\n    \"\"\"\n    Helper function which finds all the sub modules by hook or crook. (Looks into the source code folder from which the module is loaded, if sub-modules aren't loaded yet.)\n\n    @param module : module {\n        The module object for which sub-modules are needed\n        }\n    \"\"\"\n    _modules_ = []\n    module_spec = module.__spec__\n    def _list_modules_in_(location):\n        for item in os.listdir(location):\n            if os.path.isdir(location + '\\\\' + item):\n                if os.path.exists(location + '\\\\' + item + '\\\\__init__.py'):\n                    _module_ = module.__name__ + '.' + item\n                    try: \n                        _modules_.append(importlib.import_module(_module_))\n                    except ModuleNotFoundError: \n                        print('not found module : ' + _module_)\n            elif item.endswith('.py') and item != \"__init__.py\":\n                _module_ = module.__name__ + '.' + item[0 : len(item) - 3]\n                try: \n                    _modules_.append(importlib.import_module(_module_))\n                except ModuleNotFoundError:\n                    print('not found module : ' + _module_)\n    if not module_spec.submodule_search_locations == None:\n        for location in module_spec.submodule_search_locations:\n            _list_modules_in_(location)\n    #_list_modules_in_(os.path.dirname(module_spec.origin))\n    else:\n        for _module_ in inspect.getmembers(module, inspect.ismodule):\n            _modules_.append(_module_[1])\n    return _modules_\n\ndef _getdocstring_(obj):\n    \"\"\"\n    Helper function which retrieves the $glossary{docstring} of the passed module/class/function object.\n\n    This function is also responsible for the processing of the sheepy-markdown.\n\n    @param obj : object {\n        The object for which docstring needs to be processed and returned\n        }\n    \"\"\"\n    if obj.__doc__ == None:\n        return \"\"\n    _doc_ = obj.__doc__.strip()\n    _doc_ = _doc_.replace(\"\\n\\n\", \"<br /><br />\")\n    _doc_ = _doc_.replace(\"\\r\\n\\r\\n\", \"<br /><br />\")\n    _doc_ = re.sub(r'\\*([A-Za-z 0-9]+)\\*', r'<b>\\1</b>', _doc_)\n    _doc_ = re.sub(r'\\~([A-Za-z 0-9]+)\\~', r'<i>\\1</i>', _doc_)\n    _doc_ = re.sub(r'\\_([A-Za-z 0-9]+)\\_', r'<u>\\1</u>', _doc_)\n    _doc_ = re.sub(r'\\[([A-Za-z 0-9]+)\\]\\{([a-zA-z0-9\\_\\&\\#\\$\\.\\,\\-\\=\\+\\'\\\"\\[\\]\\{\\}\\(\\)\\\\\\/\\@\\!\\~\\'\\:\\;]+)\\}', r'<a href=\"\\2\" target=\"_blank\">\\1</a>', _doc_)\n    _doc_ = re.sub(\n        r\"\"\"\\$glossary\\{[ ]*([A-Za-z0-9 \\.\\,]+)[ ]*\\}\"\"\",\n        r\"\"\"<span style=\"display: inline-flex;\" class=\"sheepy-glossary-link\" md-colors=\"{color:'accent'}\" ng-click=\"openGlossary('\\1');\">\\1</span>\"\"\",\n        _doc_\n        )\n    _doc_ = re.sub(r\"\\$search\\{([A-Za-z0-9 \\.\\,]+)\\}\", r\"<a class='sheepy-link' target='_blank' href='https://www.google.co.in/search?q=\\1'>\\1</a>\", _doc_)\n    _doc_ = re.sub(\n        r\"\"\"\\$index\\{[ ]*([A-Za-z0-9 \\.\\,]+)[ ]*\\}\"\"\",\n        r\"\"\"<span style=\"display: inline-flex;\" class=\"sheepy-glossary-link\" md-colors=\"{color:'primary'}\" ng-click=\"setIndex('\\1');\">\\1</span>\"\"\",\n        _doc_\n        )\n    return _doc_\n\ndef _generatejson_class_(cls):\n    \"\"\"\n    Generates the $search{JSON} convertible Python object that represents the class.\n\n    @param cls : class {\n        The class object to convert to JSON equivalent.\n        }\n    \"\"\"\n    _class = {}\n    _class['code'] = '$sheepycode'' + _getsourcecode_(cls) + ''$sheepycode'\n    _class['methods'] = _generatedoc_methods_(cls)\n    _class['classes'] = _generatedoc_classes_(cls)\n    print('class ' + cls.__name__)\n    _docstring_ = _getdocstring_(cls)\n    \n    _class['description'] = _docstring_\n\n    return _class\n\ndef _generatejson_method_(method):\n    \"\"\"\n    Generates the $search{JSON} convertible Python object that represents the function.\n\n    The function-JSON contains the following information-\n    <ul>\n    <li><b>code</b><br />The code for the function.</li>\n    <li><b>description</b><br />The processed $glossary{docstring} for the method</li>\n    <li><b>params</b><br />The parameters passed to the function.</li>\n    <li><b>returns</b><br />The type of object(s) returned from the function</li>\n    </ul>\n\n    @param method : function {\n        The method object to convert to JSON equivalent.\n        }\n    \"\"\"\n    _method = {}\n    _method['code'] = '$sheepycode'' + _getsourcecode_(method) + ''$sheepycode'\n    try: print('def ' + method.__name__)\n    except: pass\n\n    _docstring_ = _getdocstring_(method)\n    m_params = re.findall(__param_re__, _docstring_)\n    m_returns = re.findall(__returns_re__, _docstring_)\n    m_list = []\n    for m_param in m_params:\n        m_list.append([\"param\", m_param])\n    for m_return in m_returns:\n        m_list.append([\"returns\", m_return])\n\n    _docstring_ = [(\"<p>\" + line.strip() + \"</p>\") for line in _splitinclude_(_docstring_, m_list).strip().splitlines() if len(line.strip()) != 0]\n    _method['description'] = \"\".join(_docstring_)\n\n    _method['params'] = {}\n    for param in m_params:\n        print(\"    \" + param[0] + \" : \" + param[1])\n        _method['params'][param[0]] = {\n            'type': param[1],\n            'description': \"\".join([(\"<p>\" + line.strip() + \"</p>\") for line in param[2].splitlines() if len(line.strip()) != 0])\n            }\n\n    _method['returns'] = []\n    for ret in m_returns:\n        print(\"    returns \" + ret[0])\n        _method['returns'].append({\n            'type': ret[0],\n            'description': \"\".join([(\"<p>\" + line.strip() + \"</p>\") for line in ret[1].splitlines() if len(line.strip()) != 0])\n            })\n    return _method\n\n__param_re__ = re.compile(r'@param[ ]+([A-Za-z0-9\\_]+)[ ]+\\:[ ]+([A-Za-z\\_0-9\\.\\/]+)[\\r\\n ]+\\{([A-Za-z \\,\\.\\<\\>\\/\\?\\;\\'\\:\\\"\\[\\]\\{\\}\\(\\)\\-\\=\\_\\+\\!\\#\\$\\%\\^\\&\\*\\~\\'0-9\\t\\r\\n\\\"]+)\\}')\n__returns_re__ = re.compile(r'@returns[ ]+([A-Za-z\\_0-9\\.\\/]+)[\\r\\n ]+\\{([A-Za-z \\,\\.\\<\\>\\/\\?\\;\\'\\:\\\"\\[\\]\\{\\}\\(\\)\\-\\=\\_\\+\\!\\#\\$\\%\\^\\&\\*\\~\\'0-9\\t\\r\\n\\\"]+)\\}')\n__app_re__ = re.compile(r'@app[ ]+([A-Za-z 0-9\\_\\,\\{\\}\\.\\:\\|\\<\\>\\=\\\"\\'\\-\\/\\\\]+)')\n__sub_re__ = re.compile(r'@sub[ ]+([A-Za-z 0-9\\_\\,\\{\\}\\.\\:\\|\\<\\>\\=\\\"\\'\\-\\/\\\\]+)')\n\ndef _generatedoc_modules_(module):\n    \"\"\"\n    Generates the $search{JSON} convertible Python object that represents the modules.\n    Basically returns an array of module-JSON converted.\n\n    @param module : module {\n        The parent module needed to be processed\n        }\n    \"\"\"\n    if inspect.ismodule(module):\n        _modules = {}\n        for _module_ in _getsubmodules_(module):\n            _parent_ = _module_.__spec__.parent\n            if _module_.__spec__.name == _parent_ and '.' in _parent_:\n                _parent_ = _parent_[0 : _parent_.rindex('.')]\n            if _parent_ == module.__name__:\n                _modules[_module_.__name__] = _generatedoc_(_module_)\n        return _modules\n    return []\n\ndef _generatedoc_methods_(mod_class):\n    \"\"\"\n    Generates the $search{JSON} convertible Python object that represents the methods for either a class or a module.\n    Basically returns an array of methods-JSON converted.\n\n    @param mod_class : module {\n        The module or class needed to be processed\n        }\n    \"\"\"\n    if inspect.ismodule(mod_class):\n        _methods = {}\n        for _method_ in inspect.getmembers(mod_class, inspect.isroutine):\n            if _settings_['ignore____methods']:\n                if _method_[0].startswith('__') and _method_[0].endswith('__'):\n                    continue\n            if _method_[1].__module__ == mod_class.__name__:\n                _methods[_method_[0]] = _generatedoc_(_method_[1])\n        return _methods\n    if inspect.isclass(mod_class):\n        _methods = {}\n        for _method_ in inspect.getmembers(mod_class, inspect.isroutine):\n            if _settings_['ignore____methods']:\n                if _method_[0].startswith('__') and _method_[0].endswith('__'):\n                    continue\n            _methods[_method_[0]] = _generatedoc_(_method_[1])\n            if not 'name' in _methods[_method_[0]]:\n                _methods[_method_[0]]['name'] = _method_[0]\n        return _methods\n    return []\n\ndef _generatedoc_classes_(mod_class):\n    \"\"\"\n    Generates the $search{JSON} convertible Python object that represents the classes.\n    Basically returns an array of class-JSON converted.\n\n    @param mod_class : module {\n        The module or class needed to be processed\n        }\n    \"\"\"\n    if inspect.ismodule(mod_class):\n        _classes = {}\n        for _class_ in inspect.getmembers(mod_class, inspect.isclass):\n            if _class_[1].__module__ == mod_class.__name__:\n                _classes[_class_[0]] = _generatedoc_(_class_[1])\n        return _classes\n    if inspect.isclass(mod_class):\n        _classes = {}\n        for _class_ in inspect.getmembers(mod_class, inspect.isclass):\n            if _class_[1].__module__ == mod_class.__name__:\n                _classes[_class_[0]] = _generatedoc_(_class_[1])\n        return _classes\n    return []\n\ndef _generatedoc_(source):\n    \"\"\"\n    This method processes the source (module/class/method) and returns the hirarchical $search{JSON} format Python object.\n\n    @param source : module/class/method {\n        The object to be processed\n        }\n    \"\"\"\n    if inspect.ismodule(source):\n        _module = {}\n        _docstring_ = _getdocstring_(source)\n        if len(re.compile(r'\\@nodoc').findall(_docstring_)) != 0:\n            return {}\n        try:\n            name = __app_re__.findall(_docstring_)[0]\n            start = _docstring_.index('@app')\n            end = _docstring_.rindex(name) + len(name)\n            _docstring_ = _docstring_.replace(_docstring_[start : end], \"\")\n            _module['name'] = name\n        except:\n            _module['name'] = \"\"\n        try:\n            sub = __sub_re__.findall(_docstring_)[0]\n            start = _docstring_.index('@sub')\n            end = _docstring_.rindex(sub) + len(sub)\n            _docstring_ = _docstring_.replace(_docstring_[start : end], \"\")\n            _module['sub'] = sub\n        except:\n            _module['sub'] = \"\"\n        _module['description'] = \"\".join([(\"<p>\" + line.strip() + \"</p>\") for line in _docstring_.splitlines() if len(line.strip()) != 0])\n        if len(_module['description']) == 0:\n            _module['description'] = \"<i>No description available</i>\"\n        \n        _module['code'] = '$sheepycode'' + _getsourcecode_(source) + ''$sheepycode'\n        _module['modules'] = _generatedoc_modules_(source)\n        _module['classes'] = _generatedoc_classes_(source)\n        _module['methods'] = _generatedoc_methods_(source)\n        \n        return _module\n    elif inspect.isclass(source):\n        return _generatejson_class_(source)\n    elif inspect.isroutine(source):\n        return _generatejson_method_(source)\n\n_settings_ = {\n    'ignore____methods': False\n    }\n\ndef generatedoc(source, output = 'docs', logo = 'images/logo.png', glossary = {}, ignore____methods = False):\n    \"\"\"\n    This is the prime call method to invoke the documentation generation.\n\n    It checks if the 'docs' folder exists, if it does it deletes it.\n    Then copies the <b><i>sheepydoc template</i></b> to the current working directory under the name of 'docs/<modulename>'.\n    The documentation is stored under the <modulename> folder inside 'docs' folder.\n\n    @param source : module/class/function {\n        The object needed to be processed\n        }\n    @param outout : str {\n        Default value = 'docs', the folder for the output\n        }\n    @param logo : str {\n        Default value 'images/logo.png', the company/project logo file path\n        }\n    \"\"\"\n    _settings_['ignore____methods'] = ignore____methods\n    if os.path.exists(output + '\\\\' + source.__name__):\n        _deleteall_(output)\n\n    sources = []\n    if not isinstance(source, list):\n        sources = [ source ]\n\n    packages = {}\n    for source in sources:\n        json = _generatedoc_(source)\n        packages[source.__name__] = json\n\n    import sheepydoc\n    shutil.copytree(os.path.join(os.path.dirname(os.path.abspath(sheepydoc.__spec__.origin)), 'template'), output + '\\\\' + source.__name__)\n    if os.path.exists(logo):\n        shutil.copyfile(logo, os.path.join(output, source.__name__, \"images\", \"logo.png\"))\n    \n    os.remove(output + '\\\\' + source.__name__ + '\\\\index.js')\n    indexw = open(output + '\\\\' + source.__name__ + '\\\\index.js', \"w\")\n    newSheepyJS = sheepyJS.replace('{$module}', source.__name__.replace('.', '_'))\n    \n    lines = dumps({ 'modules': packages, 'classes': {}, 'methods': {}, 'description': 'Documentation for ' + source.__name__, 'code': '' })\n    \n    newSheepyJS = newSheepyJS.replace('{$content}', lines.replace(\"\\\"$sheepycode'\", \"'\").replace(\"'$sheepycode\\\"\", \"'\"))\n    newSheepyJS = re.sub(r'\\{\\$glossary\\}', dumps(glossary), newSheepyJS)\n    indexw.write(newSheepyJS)\n    indexw.close()\n    \n    os.remove(output + '\\\\' + source.__name__ + '\\\\index.html')\n    indexw = open(output + '\\\\' + source.__name__ + '\\\\index.html', \"w\")\n    newSheepyHTML = sheepyHTML.replace('{$module}', source.__name__.replace('.', '_'))\n    newSheepyHTML = newSheepyHTML.replace('{$name}', json['name'])\n    newSheepyHTML = newSheepyHTML.replace('{$sub}', json['sub'])\n    indexw.write(newSheepyHTML)\n    indexw.close()\n\n    return\n\nsheepyJSFile = open(\"template\\\\index.js\", \"r\")\nsheepyJS = \"\".join(sheepyJSFile.readlines())\n\nsheepyHTMLFile = open(\"template\\\\index.html\", \"r\")\nsheepyHTML = \"\".join(sheepyHTMLFile.readlines())\n`, "modules": {}, "classes": {}, "methods": {"_deleteall_": {"code": `def _deleteall_(top):\n    \"\"\"\n    Helper method which cleans the passed directory tree as parameter.\n\n    @param top : str {\n        The directory (empty/non-empty) to remove\n        }\n    \"\"\"\n    try:\n        for root, dirs, files in os.walk(top, topdown=False):\n            for name in files:\n                os.remove(os.path.join(root, name))\n            for name in dirs:\n                if os.path.exists(os.path.join(root, name)):\n                    os.rmdir(os.path.join(root, name))\n            os.rmdir(root)\n    except:\n        pass\n`, "description": "<p>Helper method which cleans the passed directory tree as parameter.<br /><br /></p>", "params": {"top": {"type": "str", "description": "<p>The directory (empty/non-empty) to remove</p>"}}, "returns": []}, "_generatedoc_": {"code": `def _generatedoc_(source):\n    \"\"\"\n    This method processes the source (module/class/method) and returns the hirarchical $search{JSON} format Python object.\n\n    @param source : module/class/method {\n        The object to be processed\n        }\n    \"\"\"\n    if inspect.ismodule(source):\n        _module = {}\n        _docstring_ = _getdocstring_(source)\n        if len(re.compile(r'\\@nodoc').findall(_docstring_)) != 0:\n            return {}\n        try:\n            name = __app_re__.findall(_docstring_)[0]\n            start = _docstring_.index('@app')\n            end = _docstring_.rindex(name) + len(name)\n            _docstring_ = _docstring_.replace(_docstring_[start : end], \"\")\n            _module['name'] = name\n        except:\n            _module['name'] = \"\"\n        try:\n            sub = __sub_re__.findall(_docstring_)[0]\n            start = _docstring_.index('@sub')\n            end = _docstring_.rindex(sub) + len(sub)\n            _docstring_ = _docstring_.replace(_docstring_[start : end], \"\")\n            _module['sub'] = sub\n        except:\n            _module['sub'] = \"\"\n        _module['description'] = \"\".join([(\"<p>\" + line.strip() + \"</p>\") for line in _docstring_.splitlines() if len(line.strip()) != 0])\n        if len(_module['description']) == 0:\n            _module['description'] = \"<i>No description available</i>\"\n        \n        _module['code'] = '$sheepycode'' + _getsourcecode_(source) + ''$sheepycode'\n        _module['modules'] = _generatedoc_modules_(source)\n        _module['classes'] = _generatedoc_classes_(source)\n        _module['methods'] = _generatedoc_methods_(source)\n        \n        return _module\n    elif inspect.isclass(source):\n        return _generatejson_class_(source)\n    elif inspect.isroutine(source):\n        return _generatejson_method_(source)\n`, "description": "<p>This method processes the source (module/class/method) and returns the hirarchical <a class='sheepy-link' target='_blank' href='https://www.google.co.in/search?q=JSON'>JSON</a> format Python object.<br /><br /></p>", "params": {"source": {"type": "module/class/method", "description": "<p>The object to be processed</p>"}}, "returns": []}, "_generatedoc_classes_": {"code": `def _generatedoc_classes_(mod_class):\n    \"\"\"\n    Generates the $search{JSON} convertible Python object that represents the classes.\n    Basically returns an array of class-JSON converted.\n\n    @param mod_class : module {\n        The module or class needed to be processed\n        }\n    \"\"\"\n    if inspect.ismodule(mod_class):\n        _classes = {}\n        for _class_ in inspect.getmembers(mod_class, inspect.isclass):\n            if _class_[1].__module__ == mod_class.__name__:\n                _classes[_class_[0]] = _generatedoc_(_class_[1])\n        return _classes\n    if inspect.isclass(mod_class):\n        _classes = {}\n        for _class_ in inspect.getmembers(mod_class, inspect.isclass):\n            if _class_[1].__module__ == mod_class.__name__:\n                _classes[_class_[0]] = _generatedoc_(_class_[1])\n        return _classes\n    return []\n`, "description": "<p>Generates the <a class='sheepy-link' target='_blank' href='https://www.google.co.in/search?q=JSON'>JSON</a> convertible Python object that represents the classes.</p><p>Basically returns an array of class-JSON converted.<br /><br /></p>", "params": {"mod_class": {"type": "module", "description": "<p>The module or class needed to be processed</p>"}}, "returns": []}, "_generatedoc_methods_": {"code": `def _generatedoc_methods_(mod_class):\n    \"\"\"\n    Generates the $search{JSON} convertible Python object that represents the methods for either a class or a module.\n    Basically returns an array of methods-JSON converted.\n\n    @param mod_class : module {\n        The module or class needed to be processed\n        }\n    \"\"\"\n    if inspect.ismodule(mod_class):\n        _methods = {}\n        for _method_ in inspect.getmembers(mod_class, inspect.isroutine):\n            if _settings_['ignore____methods']:\n                if _method_[0].startswith('__') and _method_[0].endswith('__'):\n                    continue\n            if _method_[1].__module__ == mod_class.__name__:\n                _methods[_method_[0]] = _generatedoc_(_method_[1])\n        return _methods\n    if inspect.isclass(mod_class):\n        _methods = {}\n        for _method_ in inspect.getmembers(mod_class, inspect.isroutine):\n            if _settings_['ignore____methods']:\n                if _method_[0].startswith('__') and _method_[0].endswith('__'):\n                    continue\n            _methods[_method_[0]] = _generatedoc_(_method_[1])\n            if not 'name' in _methods[_method_[0]]:\n                _methods[_method_[0]]['name'] = _method_[0]\n        return _methods\n    return []\n`, "description": "<p>Generates the <a class='sheepy-link' target='_blank' href='https://www.google.co.in/search?q=JSON'>JSON</a> convertible Python object that represents the methods for either a class or a module.</p><p>Basically returns an array of methods-JSON converted.<br /><br /></p>", "params": {"mod_class": {"type": "module", "description": "<p>The module or class needed to be processed</p>"}}, "returns": []}, "_generatedoc_modules_": {"code": `def _generatedoc_modules_(module):\n    \"\"\"\n    Generates the $search{JSON} convertible Python object that represents the modules.\n    Basically returns an array of module-JSON converted.\n\n    @param module : module {\n        The parent module needed to be processed\n        }\n    \"\"\"\n    if inspect.ismodule(module):\n        _modules = {}\n        for _module_ in _getsubmodules_(module):\n            _parent_ = _module_.__spec__.parent\n            if _module_.__spec__.name == _parent_ and '.' in _parent_:\n                _parent_ = _parent_[0 : _parent_.rindex('.')]\n            if _parent_ == module.__name__:\n                _modules[_module_.__name__] = _generatedoc_(_module_)\n        return _modules\n    return []\n`, "description": "<p>Generates the <a class='sheepy-link' target='_blank' href='https://www.google.co.in/search?q=JSON'>JSON</a> convertible Python object that represents the modules.</p><p>Basically returns an array of module-JSON converted.<br /><br /></p>", "params": {"module": {"type": "module", "description": "<p>The parent module needed to be processed</p>"}}, "returns": []}, "_generatejson_class_": {"code": `def _generatejson_class_(cls):\n    \"\"\"\n    Generates the $search{JSON} convertible Python object that represents the class.\n\n    @param cls : class {\n        The class object to convert to JSON equivalent.\n        }\n    \"\"\"\n    _class = {}\n    _class['code'] = '$sheepycode'' + _getsourcecode_(cls) + ''$sheepycode'\n    _class['methods'] = _generatedoc_methods_(cls)\n    _class['classes'] = _generatedoc_classes_(cls)\n    print('class ' + cls.__name__)\n    _docstring_ = _getdocstring_(cls)\n    \n    _class['description'] = _docstring_\n\n    return _class\n`, "description": "<p>Generates the <a class='sheepy-link' target='_blank' href='https://www.google.co.in/search?q=JSON'>JSON</a> convertible Python object that represents the class.<br /><br /></p>", "params": {"cls": {"type": "class", "description": "<p>The class object to convert to JSON equivalent.</p>"}}, "returns": []}, "_generatejson_method_": {"code": `def _generatejson_method_(method):\n    \"\"\"\n    Generates the $search{JSON} convertible Python object that represents the function.\n\n    The function-JSON contains the following information-\n    <ul>\n    <li><b>code</b><br />The code for the function.</li>\n    <li><b>description</b><br />The processed $glossary{docstring} for the method</li>\n    <li><b>params</b><br />The parameters passed to the function.</li>\n    <li><b>returns</b><br />The type of object(s) returned from the function</li>\n    </ul>\n\n    @param method : function {\n        The method object to convert to JSON equivalent.\n        }\n    \"\"\"\n    _method = {}\n    _method['code'] = '$sheepycode'' + _getsourcecode_(method) + ''$sheepycode'\n    try: print('def ' + method.__name__)\n    except: pass\n\n    _docstring_ = _getdocstring_(method)\n    m_params = re.findall(__param_re__, _docstring_)\n    m_returns = re.findall(__returns_re__, _docstring_)\n    m_list = []\n    for m_param in m_params:\n        m_list.append([\"param\", m_param])\n    for m_return in m_returns:\n        m_list.append([\"returns\", m_return])\n\n    _docstring_ = [(\"<p>\" + line.strip() + \"</p>\") for line in _splitinclude_(_docstring_, m_list).strip().splitlines() if len(line.strip()) != 0]\n    _method['description'] = \"\".join(_docstring_)\n\n    _method['params'] = {}\n    for param in m_params:\n        print(\"    \" + param[0] + \" : \" + param[1])\n        _method['params'][param[0]] = {\n            'type': param[1],\n            'description': \"\".join([(\"<p>\" + line.strip() + \"</p>\") for line in param[2].splitlines() if len(line.strip()) != 0])\n            }\n\n    _method['returns'] = []\n    for ret in m_returns:\n        print(\"    returns \" + ret[0])\n        _method['returns'].append({\n            'type': ret[0],\n            'description': \"\".join([(\"<p>\" + line.strip() + \"</p>\") for line in ret[1].splitlines() if len(line.strip()) != 0])\n            })\n    return _method\n`, "description": "<p>Generates the <a class='sheepy-link' target='_blank' href='https://www.google.co.in/search?q=JSON'>JSON</a> convertible Python object that represents the function.<br /><br />    The function-JSON contains the following information-</p><p><ul></p><p><li><b>code</b><br />The code for the function.</li></p><p><li><b>description</b><br />The processed <span style=\"display: inline-flex;\" class=\"sheepy-glossary-link\" md-colors=\"{color:'accent'}\" ng-click=\"openGlossary('docstring');\">docstring</span> for the method</li></p><p><li><b>params</b><br />The parameters passed to the function.</li></p><p><li><b>returns</b><br />The type of object(s) returned from the function</li></p><p></ul><br /><br /></p>", "params": {"method": {"type": "function", "description": "<p>The method object to convert to JSON equivalent.</p>"}}, "returns": []}, "_getdocstring_": {"code": `def _getdocstring_(obj):\n    \"\"\"\n    Helper function which retrieves the $glossary{docstring} of the passed module/class/function object.\n\n    This function is also responsible for the processing of the sheepy-markdown.\n\n    @param obj : object {\n        The object for which docstring needs to be processed and returned\n        }\n    \"\"\"\n    if obj.__doc__ == None:\n        return \"\"\n    _doc_ = obj.__doc__.strip()\n    _doc_ = _doc_.replace(\"\\n\\n\", \"<br /><br />\")\n    _doc_ = _doc_.replace(\"\\r\\n\\r\\n\", \"<br /><br />\")\n    _doc_ = re.sub(r'\\*([A-Za-z 0-9]+)\\*', r'<b>\\1</b>', _doc_)\n    _doc_ = re.sub(r'\\~([A-Za-z 0-9]+)\\~', r'<i>\\1</i>', _doc_)\n    _doc_ = re.sub(r'\\_([A-Za-z 0-9]+)\\_', r'<u>\\1</u>', _doc_)\n    _doc_ = re.sub(r'\\[([A-Za-z 0-9]+)\\]\\{([a-zA-z0-9\\_\\&\\#\\$\\.\\,\\-\\=\\+\\'\\\"\\[\\]\\{\\}\\(\\)\\\\\\/\\@\\!\\~\\'\\:\\;]+)\\}', r'<a href=\"\\2\" target=\"_blank\">\\1</a>', _doc_)\n    _doc_ = re.sub(\n        r\"\"\"\\$glossary\\{[ ]*([A-Za-z0-9 \\.\\,]+)[ ]*\\}\"\"\",\n        r\"\"\"<span style=\"display: inline-flex;\" class=\"sheepy-glossary-link\" md-colors=\"{color:'accent'}\" ng-click=\"openGlossary('\\1');\">\\1</span>\"\"\",\n        _doc_\n        )\n    _doc_ = re.sub(r\"\\$search\\{([A-Za-z0-9 \\.\\,]+)\\}\", r\"<a class='sheepy-link' target='_blank' href='https://www.google.co.in/search?q=\\1'>\\1</a>\", _doc_)\n    _doc_ = re.sub(\n        r\"\"\"\\$index\\{[ ]*([A-Za-z0-9 \\.\\,]+)[ ]*\\}\"\"\",\n        r\"\"\"<span style=\"display: inline-flex;\" class=\"sheepy-glossary-link\" md-colors=\"{color:'primary'}\" ng-click=\"setIndex('\\1');\">\\1</span>\"\"\",\n        _doc_\n        )\n    return _doc_\n`, "description": "<p>Helper function which retrieves the <span style=\"display: inline-flex;\" class=\"sheepy-glossary-link\" md-colors=\"{color:'accent'}\" ng-click=\"openGlossary('docstring');\">docstring</span> of the passed module/class/function object.<br /><br />    This function is also responsible for the processing of the sheepy-markdown.<br /><br /></p>", "params": {"obj": {"type": "object", "description": "<p>The object for which docstring needs to be processed and returned</p>"}}, "returns": []}, "_getsourcecode_": {"code": `def _getsourcecode_(source):\n    \"\"\"\n    Helper function which gets the source code of the module/method/class passed as parameter, only if it is available.\n\n    @param source : module/class/function {\n        The object for which the source code is needed\n        }\n    \"\"\"\n    src = \"\"\n    try:\n        code = inspect.getsourcelines(source)\n        if code != None:\n            src = \"\".join(code[0])\n    except:\n        try:\n            with open (source.__spec__.origin, \"r\") as myfile:\n                src = \"\".join(myfile.readlines())\n        except:\n            return src\n    return src.replace(\"'\", \"'\")\n`, "description": "<p>Helper function which gets the source code of the module/method/class passed as parameter, only if it is available.<br /><br /></p>", "params": {"source": {"type": "module/class/function", "description": "<p>The object for which the source code is needed</p>"}}, "returns": []}, "_getsubmodules_": {"code": `def _getsubmodules_(module):\n    \"\"\"\n    Helper function which finds all the sub modules by hook or crook. (Looks into the source code folder from which the module is loaded, if sub-modules aren't loaded yet.)\n\n    @param module : module {\n        The module object for which sub-modules are needed\n        }\n    \"\"\"\n    _modules_ = []\n    module_spec = module.__spec__\n    def _list_modules_in_(location):\n        for item in os.listdir(location):\n            if os.path.isdir(location + '\\\\' + item):\n                if os.path.exists(location + '\\\\' + item + '\\\\__init__.py'):\n                    _module_ = module.__name__ + '.' + item\n                    try: \n                        _modules_.append(importlib.import_module(_module_))\n                    except ModuleNotFoundError: \n                        print('not found module : ' + _module_)\n            elif item.endswith('.py') and item != \"__init__.py\":\n                _module_ = module.__name__ + '.' + item[0 : len(item) - 3]\n                try: \n                    _modules_.append(importlib.import_module(_module_))\n                except ModuleNotFoundError:\n                    print('not found module : ' + _module_)\n    if not module_spec.submodule_search_locations == None:\n        for location in module_spec.submodule_search_locations:\n            _list_modules_in_(location)\n    #_list_modules_in_(os.path.dirname(module_spec.origin))\n    else:\n        for _module_ in inspect.getmembers(module, inspect.ismodule):\n            _modules_.append(_module_[1])\n    return _modules_\n`, "description": "<p>Helper function which finds all the sub modules by hook or crook. (Looks into the source code folder from which the module is loaded, if sub-modules aren't loaded yet.)<br /><br /></p>", "params": {"module": {"type": "module", "description": "<p>The module object for which sub-modules are needed</p>"}}, "returns": []}, "_splitinclude_": {"code": `def _splitinclude_(docstring, splitters = []):\n    \"\"\"\n    Helper function which removes the '@' tags used by sheepydoc from the $glossary{docstring}.\n\n    @param string : str {\n        The docstring which needs to be cleaned.\n        }\n    \"\"\"\n    for splitter in splitters:\n        of = splitter[1][0] + ((' : ' + splitter[1][1]) if not splitter[0] == 'returns' else '')\n        start = docstring.index(of)\n        end = docstring.rindex(splitter[1][len(splitter[1]) - 1]) + len(splitter[1][len(splitter[1]) - 1])\n        sub = \"@\" + splitter[0] + \" \" + docstring[start : end + 1]\n        docstring = docstring.replace(sub, \"\")\n    return docstring\n`, "description": "<p>Helper function which removes the '@' tags used by sheepydoc from the <span style=\"display: inline-flex;\" class=\"sheepy-glossary-link\" md-colors=\"{color:'accent'}\" ng-click=\"openGlossary('docstring');\">docstring</span>.<br /><br /></p>", "params": {"string": {"type": "str", "description": "<p>The docstring which needs to be cleaned.</p>"}}, "returns": []}, "_tab_": {"code": `def _tab_(_count_ = 0):\n    return \"  \" * _count_\n`, "description": "", "params": {}, "returns": []}, "generatedoc": {"code": `def generatedoc(source, output = 'docs', logo = 'images/logo.png', glossary = {}, ignore____methods = False):\n    \"\"\"\n    This is the prime call method to invoke the documentation generation.\n\n    It checks if the 'docs' folder exists, if it does it deletes it.\n    Then copies the <b><i>sheepydoc template</i></b> to the current working directory under the name of 'docs/<modulename>'.\n    The documentation is stored under the <modulename> folder inside 'docs' folder.\n\n    @param source : module/class/function {\n        The object needed to be processed\n        }\n    @param outout : str {\n        Default value = 'docs', the folder for the output\n        }\n    @param logo : str {\n        Default value 'images/logo.png', the company/project logo file path\n        }\n    \"\"\"\n    _settings_['ignore____methods'] = ignore____methods\n    if os.path.exists(output + '\\\\' + source.__name__):\n        _deleteall_(output)\n\n    sources = []\n    if not isinstance(source, list):\n        sources = [ source ]\n\n    packages = {}\n    for source in sources:\n        json = _generatedoc_(source)\n        packages[source.__name__] = json\n\n    import sheepydoc\n    shutil.copytree(os.path.join(os.path.dirname(os.path.abspath(sheepydoc.__spec__.origin)), 'template'), output + '\\\\' + source.__name__)\n    if os.path.exists(logo):\n        shutil.copyfile(logo, os.path.join(output, source.__name__, \"images\", \"logo.png\"))\n    \n    os.remove(output + '\\\\' + source.__name__ + '\\\\index.js')\n    indexw = open(output + '\\\\' + source.__name__ + '\\\\index.js', \"w\")\n    newSheepyJS = sheepyJS.replace('{$module}', source.__name__.replace('.', '_'))\n    \n    lines = dumps({ 'modules': packages, 'classes': {}, 'methods': {}, 'description': 'Documentation for ' + source.__name__, 'code': '' })\n    \n    newSheepyJS = newSheepyJS.replace('{$content}', lines.replace(\"\\\"$sheepycode'\", \"'\").replace(\"'$sheepycode\\\"\", \"'\"))\n    newSheepyJS = re.sub(r'\\{\\$glossary\\}', dumps(glossary), newSheepyJS)\n    indexw.write(newSheepyJS)\n    indexw.close()\n    \n    os.remove(output + '\\\\' + source.__name__ + '\\\\index.html')\n    indexw = open(output + '\\\\' + source.__name__ + '\\\\index.html', \"w\")\n    newSheepyHTML = sheepyHTML.replace('{$module}', source.__name__.replace('.', '_'))\n    newSheepyHTML = newSheepyHTML.replace('{$name}', json['name'])\n    newSheepyHTML = newSheepyHTML.replace('{$sub}', json['sub'])\n    indexw.write(newSheepyHTML)\n    indexw.close()\n\n    return\n`, "description": "<p>This is the prime call method to invoke the documentation generation.<br /><br />    It checks if the 'docs' folder exists, if it does it deletes it.</p><p>Then copies the <b><i>sheepydoc template</i></b> to the current working directory under the name of 'docs/<modulename>'.</p><p>The documentation is stored under the <modulename> folder inside 'docs' folder.<br /><br /></p>", "params": {"source": {"type": "module/class/function", "description": "<p>The object needed to be processed</p>"}, "outout": {"type": "str", "description": "<p>Default value = 'docs', the folder for the output</p>"}, "logo": {"type": "str", "description": "<p>Default value 'images/logo.png', the company/project logo file path</p>"}}, "returns": []}}}}, "classes": {}, "methods": {}, "description": "Documentation for sheepydoc", "code": ""};

    $scope.$contentIndex = {};
    $scope.$currentContentIndex = {};
    $scope.$glossary = {"docstring": "A docstring is the immediate multiline comment after the opening declaration of any Python structure"};
    $scope.search = { show: false, input: "" };
    $scope.searchResults = [];

    $scope.$indexer = function ($name, $content, $type, $indexingStore) {
        $content.$type = $type;
        $content.$name = $name;
        $indexingStore[$content.$name] = $content;
        if ($type === "module") {
            if ($content.modules !== undefined) {
                for (var $module in $content.modules) {
                    $scope.$indexer($name + '.' + $module.substring($module.lastIndexOf('.') + 1), $content.modules[$module], $type, $indexingStore);
                }
            }
            for (var $class in $content.classes) {
                $scope.$indexer($name + '.' + $class.substring($class.lastIndexOf('.') + 1), $content.classes[$class], "class", $indexingStore);
            }
            for (var $method in $content.methods) {
                $scope.$indexer($name + '.' + $method.substring($method.lastIndexOf('.') + 1), $content.methods[$method], "method", $indexingStore);
            }
        } else if ($type === "class") {
            for (var $class in $content.classes) {
                $scope.$indexer($name + '.' + $class.substring($class.lastIndexOf('.') + 1), $content.classes[$class], "class", $indexingStore);
            }
            for (var $method in $content.methods) {
                $scope.$indexer($name + '.' + $method.substring($method.lastIndexOf('.') + 1), $content.methods[$method], "method", $indexingStore);
            }
        } else if ($type === "method") {
            $content.returns.forEach(function ($returns) {
                if (/search\//.test($returns.type)) {
                    $returns.type = $returns.type.replace("search/", "<a class='sheepy-link-code' target='_blank' href='https://www.google.co.in/search?q=python:doc:" + $returns.type.replace('search/', "") + "'>") + "</a>";
                }
            });
        }
    }
    $scope.$linkresolver = function ($code) {
        /*var $keys = Object.keys($scope.$contentIndex);
        for (var i = 0; i < $keys.length; i++) {
            var $indexEntry = $keys[i];
            var $pythonNameList = $indexEntry.replace("$root$.", "").split('.');
            var $pythonIdentifier = $pythonNameList[$pythonNameList.length - 1];
            var $replacer = RegExp($pythonIdentifier.replace('.', '\.'), "g");
            $code = $code.replace($replacer, "<a class='sheepy-link-code' href='#" + $pythonNameList.join(".") + "'>" + $pythonIdentifier + "</a>");
        }*/
        return $code;
    };
    $scope.$linker = function ($content) {
        var $codeContent = $('.hljs-title');
        for (var i = 0; i < $codeContent.length; i++) {
            var $codeElement = $codeContent[i];
            $codeElement.innerHTML = $scope.$linkresolver($codeElement.innerHTML);
        }
    };
    $scope.indexAvailableContent = function () {
        $scope.$indexer("$root$", $scope.content, "module", $scope.$contentIndex);
        setTimeout(function () {
            $scope.$linker();
        }, 500);
    }

    $scope.indexAvailableContent();

    $scope.setContent = function ($key, $content, $type) {
        $scope.selectedContent = $content;
        $scope.$indexer($key, $content, $type, $scope.$currentContentIndex);
        setTimeout(function () {
            var codes = $('code');
            codes.each(function (i, block) {
                hljs.highlightBlock(block);
            });
        }, 10);
        $scope.pushStack($key, $content);
    }

    $scope.contentStack = [];
    $scope.peekStack = function () {
        return $scope.contentStack[$scope.contentStack.length - 1];
    };
    $scope.pushStack = function ($key, $content, $type) {
        $scope.contentStack.push({ key: $key, content: $content, type: $type });
    };
    $scope.popStack = function () {
        if ($scope.contentStack.length === 1) {
            return;
        }
        var popped = $scope.contentStack.pop();
        var peek = $scope.contentStack.pop();
        if (peek !== undefined) {
            $scope.setContent(peek.key, peek.content, peek.type);
        }
    };

    $scope.setContent("$root$", $scope.content, "module");

    $scope.noModules = function () {
        if ($scope.selectedContent === undefined || $scope.selectedContent.modules === undefined) {
            return true;
        }
        return Object.keys($scope.selectedContent.modules).length == 0;
    };
    $scope.noClasses = function () {
        if ($scope.selectedContent === undefined || $scope.selectedContent.classes === undefined) {
            return true;
        }
        return Object.keys($scope.selectedContent.classes).length == 0;
    };
    $scope.noMethods = function () {
        if ($scope.selectedContent === undefined || $scope.selectedContent.methods === undefined) {
            return true;
        }
        return Object.keys($scope.selectedContent.methods).length == 0;
    };
    $scope.noParams = function ($params) {
        return Object.keys($params).length == 0;
    };
    $scope.noReturns = function ($returns) {
        return Object.keys($returns).length == 0;
    };
    $scope.stackEmpty = function () {
        return $scope.contentStack.length <= 1;
    };

    $scope.closeSidebar = function () {
        $scope.sidebarOpen = false;
    };
    $scope.openSidebar = function ($type) {
        $scope.sidebarType = $type;
        $scope.sidebarOpen = true;
    }

    $scope.openGlossary = function ($glossaryTerm) {
        $scope.openSidebar("glossary");
        $scope.selectedGlossaryTerm = $glossaryTerm;
        $scope.selectedGlossaryContent = $scope.$glossary[$glossaryTerm];
    };

    $scope.setIndex = function ($index) {
        $scope.popStack();
        var $indexedContent = $scope.$contentIndex["$root$." + $index];
        $scope.setContent($index, $indexedContent);
        if (!$scope.$digest) {
            $scope.$apply();
        }
    };

    $scope.toggleSearch = function () {
        $scope.search.show = !$scope.search.show;
        if ($scope.search.show) {
            $scope.openSidebar("search");
            $scope.searchIndex();
        } else {
            $scope.closeSidebar();
        }
    };

    $scope.searchIndex = function () {
        $scope.searchResults = [];
        for(var key in $scope.$contentIndex) {
            if (key.indexOf($scope.search.input) !== -1 && key !== "$root$") {
                $scope.searchResults.push(key.replace("$root$.", ""));
            }
        }
    };
    $scope.noResults = function () {
        return $scope.searchResults.length === 0;
    };
}]);