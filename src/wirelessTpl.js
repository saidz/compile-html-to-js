var xmlreader = require('./xmlParser');

exports.compileTpl = function (source) {
    var viewTagIndex = 'vm-data';
    var viewDataIndex = 'viewData';
    var privateViewDataIndex = '_viewData';
    var viewData = {};
    var UUID = Date.now();
    var result = null;
    xmlreader.read(source, function(err, res) {
        if (err) return console.log(err);
        var dom = res.script;
        /**
         * 遍历dom tree
         * @param  {Object} dom dom 节点
         * @return {String}     返回编译后的模板
         */
        function walk(dom) {
            var list = [dom]; // DOM 列表
            var prop = "";
            // 遍历list列表中的所有dom节点，调用tagHandle处理所有`vm-data`
            while (list.length > 0) {
                var tagNode = list.shift(); // 从堆栈中压出一个DOM节点
                var tagData = tagNode.getAttribute(viewTagIndex); // 获取DOM节点中标识属性`vm-data`属性的值
                if (tagData) {
                    prop = prop + '\n' + tagHandle(tagNode, tagData); // 根据对应的tagData处理当前的DOM节点
                }
                for (var i = 0; i < tagNode.children.length; i++) { // 将当前node的子节点都压进list数组中
                    if (tagNode.children[i].name !== 'text') {
                        list.push(tagNode.children[i]);
                    }
                }
            }
            return prop;
        }

        function getDomId(dom) {
            var domId = dom.getAttribute('id');
            if (!domId) {
                var randLetter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
                var uniqId = randLetter + (UUID++);
                dom.setAttribute('id', uniqId);
                return uniqId;
            }
            return domId;
        }
        // 控制标签
        var tagController = {
            html: {
                innerRepeat: function(dom, attrPath) {
                    var domId = getDomId(dom);
                    var tpl = dom.getInnerHtml().replace(/^[\n\t ]+/, '').replace(/[\n\t ]+$/, '');
                    dom.innerHTML = '';
                    var c = "{\n\
                        get:function(){\n\
                            return " + privateViewDataIndex + '.' + attrPath + ";\n\
                        },\n\
                        set:function(data){\n\
                            " + privateViewDataIndex + '.' + attrPath + "=data;\n\
                            var html='';\n\
                            var tpl='" + tpl.replace(/\n|\t/g, '') + "';\n\
                            for(var i=0;i<data.length;i++){\n\
                                var dataItem=data[i];\n\
                                var hc=tpl;\n\
                                for(var j in dataItem){\n\
                                    hc=hc.replace(new RegExp('{{'+j+'}}','g'),dataItem[j]);\n\
                                }\n\
                                html=html+hc;\n\
                            }\n\
                            $('#" + domId + "').html(html);\n\
                        }\n\
                    \t}";
                    return c;
                },
                place: function(dom, attrPath) {
                    var domId = getDomId(dom);
                    var c = "{\n\
                        get:function(){\n\
                            return $('#" + domId + "').html();\n\
                        },\n\
                        set:function(data){\n\
                            $('#" + domId + "').html(data);\n\
                        }\n\
                    \t}";
                    return c;
                }
            },
            attr: {
                input: function(dom, attrPath) {
                    var domId = getDomId(dom);
                    var c = "{\n\
                        get:function(){\n\
                            return $('#" + domId + "').val();\n\
                        },\n\
                        set:function(data){\n\
                            $('#" + domId + "').val(data);\n\
                        }\n\
                    \t}";
                    return c;
                },
                style: function(dom, attrPath, cntl) {
                    var domId = getDomId(dom);
                    var c = "{\n\
                        get:function(){\n\
                            return $('#" + domId + "').css('" + cntl + "');\n\
                        },\n\
                        set:function(data){\n\
                            $('#" + domId + "').css('" + cntl + "',data);\n\
                        }\n\
                    \t}";
                    return c;
                },
                class: function(dom, attrPath, cntl) {
                    var domId = getDomId(dom);
                    var c = "{\n\
                        get:function(){\n\
                            return $('#" + domId + "').attr('class');\n\
                        },\n\
                        set:function(data){\n\
                            $('#" + domId + "').attr('class',data);\n\
                        }\n\
                    \t}";
                    return c;
                },
                src: function(dom, attrPath, cntl) {
                    var domId = getDomId(dom);
                    var c = "{\n\
                        get:function(){\n\
                            return $('#" + domId + "').attr('src');\n\
                        },\n\
                        set:function(data){\n\
                            $('#" + domId + "').attr('src',data);\n\
                        }\n\
                    \t}";
                    return c;
                }
            }
        };
        /**
         * 标签解析,渲染出编译后的文件,支持属性、数组和对象的处理
         * 以下面的tag为例 attr.style.display@foo.bar;html.place@foo.bar1
         */
        function tagHandle(dom, tag) {
            var tl = tag.split(';'); // 分离出标识属性中以`;`分隔的第一层数据; attr.style.display@activeShow;html.place@activeImg;
            var tagHandleStr = ''; //
            for (var i = 0; i < tl.length; i++) { // 遍历第一层属性
                var tagData = tl[i].split('@'); // 分离出标识属性中以`@`分隔的第二次数据
                var dataAttr = tagData[1].split('.'); // 分离出标识属性中以`.`分隔的第三层数据,数据中的属性标签
                var dataNode = viewData; // 数据节点
                var attrPrefix = '';
                var lastAttr = dataAttr[dataAttr.length - 1]; // 数据标签中的属性段
                // 数据标签中的对应的对象段
                for (var di = 0; di < dataAttr.length - 1; di++) {
                    var attrName = dataAttr[di];
                    attrPrefix = attrPrefix + '.' + attrName;
                    if (!dataNode[attrName]) {
                        dataNode[attrName] = {};
                        tagHandleStr = tagHandleStr + '\n\tviewData' + attrPrefix + '={};';
                        tagHandleStr = tagHandleStr + '\n\t_viewData' + attrPrefix + '={};';
                    }
                    dataNode = dataNode[attrName];
                }
                // 处理数据中的控制标签
                var cntlData = tagData[0].split('.');
                var cntl = tagController;
                for (var ci = 0; ci < cntlData.length; ci++) {
                    if (typeof(cntl[cntlData[ci]]) == 'object') {
                        cntl = cntl[cntlData[ci]];
                    } else if (typeof(cntl[cntlData[ci]]) == 'function') {
                        cntl = cntl[cntlData[ci]];
                        break;
                    } else {
                        return '';
                    }
                }
                // 根据控制标签生成对应的执行内容
                var code = cntl(dom, tagData[1], cntlData[cntlData.length - 1]);
                tagHandleStr = tagHandleStr + '\n\tObject.defineProperty(' + viewDataIndex + attrPrefix + ',"' + lastAttr + '",' + code + ');';
            }
            dom.removeAttribute(viewTagIndex);
            return tagHandleStr;
        }
        var d = 'define(\'ctrl.' + dom.getAttribute('id') + '\',function(require, exports, module) {';
        var p = walk(dom);
        // 模板容器
        var tplContainer = dom.getAttribute('container') ? dom.getAttribute('container') : 'body';
        // 属性字符串化
        function attr2String(attr) {
            var tpl = '';
            for (var pro in attr) {
                if (attr.hasOwnProperty(pro)) {
                    tpl += '\n\texports["' + pro + '"]="' + attr[pro] + '";';
                }
            }
            return tpl;
        }
        // 变量与暴露字段展示
        var h = '\tvar $ = require(\'{jquery}\');\n\
            exports.selector = \'' + tplContainer + '\';\
            ' + attr2String(dom.attributes) + '\n\
            var viewData={};\n\
            var _viewData={};\n\
            exports.viewData=viewData;';
        var dep = dom.getAttribute('css');
        dep = dep ? 'require.css(\'' + dep.split(',').join('\');\n\t\trequire.css(\'') + '\');' : '';
        var t = '\texports.template = function(){\n\
            ' + dep + '\n\
            var t=\
            \'' + dom.getInnerHtml().replace(/[\n\r]/g, '').replace(/^[\t ]+/, '').replace(/[\t ]+$/, '') + '\';\n\
            return t;\n\
        }';
        var f = '});'
        result = {
            code: [d, h, p, t, f].join('\n'),
            source: source,
            id: dom.getAttribute('id')
        };
    });
    return result;
};