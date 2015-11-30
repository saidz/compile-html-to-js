var sax = require("sax");

exports.read = function(xmlstring, callback){
    var saxparser = sax.parser(true);
    var rootobject = {};
    var object = rootobject;

    saxparser.onerror = function (err) {
        // an error happened.

        return callback(err);
    };

    saxparser.onopentag = function (node) {
        // opened a tag.  node has "name" and "attributes"
        function attr2String (attr){
            var tpl = '';
            for(var pro in attr){
                if(attr.hasOwnProperty(pro)){
                    tpl += ' '+pro+'="'+attr[pro]+'"';
                }
            }
            return tpl;
        }
        var nodeTpl = '<'+node.name+attr2String(node.attributes)+'>';
        var newobject = {
            attributes: node.attributes || {},
            getAttribute: function(name){
                return this.attributes[name];
            },
            setAttribute: function(name,value){
                if(isObject(name)){
                    this.attributes = extend({},this.attributes,name);
                }else if(isString(value) && isString(name)){
                    this.attributes[name] = value;
                }
            },
            removeAttribute: function(name){
                if(typeof this.attributes[name] !== 'undefined'){
                    delete this.attributes[name];
                }
            },
            name:node.name,
            getHtml: function(){
                var arr = [].concat(this.children),
                html = '<'+this.name+attr2String(this.attributes)+'>';
                while (arr.length > 0) {
                    var ele = arr.shift();
                    if(!ele){
                       continue;
                    }
                    // 递归 和循环需要再处理下
                    html+=ele.getHtml();
                    // arr = arr.concat(ele.children);
                }
                html += '</'+this.name+'>';
                return html;
            },
            getInnerHtml: function(){
                var arr = [].concat(this.children),
                html = '';
                while (arr.length > 0) {
                    var ele = arr.shift();
                    if(!ele){
                       continue;
                    }
                    // 递归 和循环需要在处理下
                    html+=ele.getHtml();
                    // arr = arr.concat(ele.children);
                }
                return html;
            },
            children: []
        };

        // add the parent() function so that we can use it later:
        addParentFunction(newobject, object);

        // 设置 children
        if(object.children){
            object.children.push(newobject);
        }else{
            object[node.name] = newobject;
        }

        // set the current object to the newobject:
        object = newobject;
    };

    saxparser.oncdata = function(cdata){
        // push cdata node
        var cdataObject = {
            name:'cdata',
            text: cdata,
            getHtml: function(){
                return this.text;
            }
        };
        object.children.push(cdataObject);
        addParentFunction(cdataObject, object);
    };

    saxparser.ontext = function (text) {
        // push text node
        var textObject = {
            name:'text',
            text: text,
            getHtml: function(){
                return this.text;
            }
        };
        object.children.push(textObject);
        addParentFunction(textObject, object);
    };

    saxparser.onclosetag = function (node) {
        // set the object back to its parent:
        var parent = object.parent();
        object = parent;
    }

    saxparser.onend = function () {
        return callback(null, rootobject);
    };

    function addParentFunction(object, parent){
        object.parent = function(){
            return parent;
        }
    }

    // pass the xml string to the awesome sax parser:
    saxparser.write(xmlstring).close();
}
// helper function
function isObject(obj){
    return Object.prototype.toString.call(obj) ==='[object Object]';
}
function isString(str){
    return Object.prototype.toString.call(str) ==='[object String]';
}
function extend(){
    var args = arguments;
    for(var i = 1;i<args.length;i++){
        for(var pro in args[i]){
            if(args[i].hasOwnProperty(pro)){
                args[0][pro] = args[i][pro];
            }
        }
    }
    return args[0];
}