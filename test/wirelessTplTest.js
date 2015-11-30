var compileTpl = require('../src/wirelessTpl').compileTpl;
var fs = require('fs');
// var assert = require('assert');

var scriptXml = '<script type="text/template" id="wx.pay.success" container="#mainStage" logicmodule="logic.wx.pay.success">\
    <div class="container">\
      <div class="info">\
        <i class="i-complete"></i>\
        <h2 class="info-t" vm-data="html.place@infoTitle">话费马上到账</h2>\
        <p class="info-txt" vm-data="html.place@infoText">充值成功后会收到公众号消息提醒</p>\
      </div>\
      <a class="" href="javascript:void(0);"></a>\
      <div class="function" vm-data="html.place@functionShow">\
        <img class="function-pic" src="//tacs_v3.oa.com/img.php?100x100" alt="" />\
        <div class="function-detail" vm-data="attr.style.display@detailShow;html.place@infoTitle.a" style="diaplay:none;">\
          <h2 class="function-detail_title" vm-data="html.place@detailTitle">\
                获得一次抽奖机会\
            </h2>\
          <p class="function-detail_info" vm-data="html.place@detailInfo">100%中奖哦</p>\
        </div>\
        <div class="function-result">\
          <i class="icon-arrow-right"></i>\
        </div>\
      </div>\
      <a class="cm-btn cm-btn-complete" href="javascript:void(0);" vm-data="html.place@btnShow">完成</a>\
      <ul class="footer" vm-data="html.innerRepeat@footerList">\
        <li><a href="javascript:void(0);">常见问题</a></li>\
        <li><a href="javascript:void(0);">充值记录</a></li>\
      </ul>\
    </div>\
</script>';
/**
 * 将编译后的结果保存到 js 文件中
 * @param  {String} name     文件名称
 * @param  {content} content  文本内容
 */
function write2Fs(name,content){
    fs.open(name,'w',0644,function(e, fd){
        if(e) {
            throw e;
        }
        fs.write(fd,content,0,'utf8',function(e){
            if(e) throw e;
            fs.closeSync(fd);
        });
    });
}
var result = compileTpl(scriptXml);
write2Fs('tmp/ctrl.'+result.id+'.js',result.code);
