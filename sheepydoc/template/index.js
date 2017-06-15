var app = angular.module('{$module}', ["angular-bind-html-compile", 'ngMaterial']);

app.config(function($mdThemingProvider) {
    $mdThemingProvider.definePalette('sheepyBlue', {
        '50': 'e6f3ff',
        '100': 'b3daff',
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

app.controller('{$module}Controller', ['$scope', function($scope) {
    $scope.content = {$content};

    $scope.$contentIndex = {};
    $scope.$indexer = function($name, $content, $type) {
        $content.$type = $type;
        $content.$name = $name;
        $scope.$contentIndex[$content.$name] = $content;
        if ($type === "module") {
            for (var $module in $content.modules) {
                $scope.$indexer($name + '.' + $module, $content.modules[$module], $type);
            }
            for (var $class in $content.classes) {
                $scope.$indexer($name + '.' + $class, $content.classes[$class], "class");
            }
            for (var $method in $content.methods) {
                $scope.$indexer($name + '.' + $method, $content.methods[$method], "method");
            }
        } else if ($type === "class") {
            
        } else if ($type === "method") {

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
        $scope.$indexer("$root$", $scope.content, "module");
        setTimeout(function () {
            $scope.$linker();
        }, 500);
    }

    $scope.indexAvailableContent();
    
    $scope.setContent = function($key, $content) {
        $scope.selectedContent = $content;
        setTimeout(function () {
            var codes = $('code');
            codes.each(function(i, block) {
                hljs.highlightBlock(block);
            });
        }, 10);
        $scope.pushStack($key, $content);
    }

    $scope.contentStack = [];
    $scope.peekStack = function() {
        return $scope.contentStack[$scope.contentStack.length - 1];
    };
    $scope.pushStack = function($key, $content) {
        $scope.contentStack.push({ key: $key, content: $content });
    };
    $scope.popStack = function() {
        if ($scope.contentStack.length === 1) {
            return;
        }
        var popped = $scope.contentStack.pop();
        var peek = $scope.contentStack.pop();
        if (peek !== undefined) {
            $scope.setContent(peek.key, peek.content);
        }
    };
    
    $scope.setContent("{$module}_root", $scope.content);

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
    $scope.stackEmpty = function () {
        return $scope.contentStack.length <= 1;
    };
}]);