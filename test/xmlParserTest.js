var xmlParser = require('../src/xmlParser');
var assert = require('assert');

var scriptXml = '<script id="ctrl.wx.pay.success" container="#mainStage" logicmodule="logic.wx.pay.success">sss<div vm-data="html.place@test"></div>abc<a>dddbc</a></script>';

xmlParser.read(scriptXml, function(err, res) {
    var dom = res.script;

    describe('xmlParser', function() {
        describe('#getHtml()', function() {
            it('html equal '+scriptXml, function() {
                assert.equal(scriptXml, dom.getHtml());
            });
        });

        describe('#getInnerHtml()', function() {
            it('innerHtml is sss<div vm-data="html.place@test"></div>abc<a>dddbc</a>', function() {
                assert.equal('sss<div vm-data="html.place@test"></div>abc<a>dddbc</a>', dom.getInnerHtml());
            });
        });

        describe('#getAttribute()', function() {
            it('id should equal ctrl.wx.pay.success', function() {
                assert.equal('ctrl.wx.pay.success', dom.getAttribute('id'));
            });
            it('container should equal #mainStage', function() {
                assert.equal('#mainStage', dom.getAttribute('container'));
            });
        });

        describe('#setAttribute()', function() {
            it('id should equal 22', function() {
                dom.setAttribute('id','22');
                assert.equal('22', dom.getAttribute('id'));
            });
        });

        describe('#removeAttribute()', function() {
            it('id should be undefined', function() {
                dom.removeAttribute('id');
                assert.equal(undefined, dom.getAttribute('id'));
            });
        });

        describe('#children', function() {
            it('length should be 4', function() {
                assert.equal(4, dom.children.length);
            });
            it('children dom has 2 text', function() {
                assert.equal(2, dom.children.filter(function(v,i){
                    return v.name==='text';
                }).length);
            });
        });

    });
});
