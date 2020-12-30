const app = getApp()
var netWork = require('../../utils/netWork.js');
var util = require('../../utils/util.js')
Page({
  data: {
    globalData: app.globalData,
    visitPage: '我的',
    visitTime: util.formatTime(new Date()),
    url:netWork.getUrl()
  },
  onShow:function(){
    
  },
  onLoad: function (options) {
    
  },
  navigate:function(e){
    util.navigateTo(e);
  },
  bindJY:function(){
    var $this = this;
    if (this.data.globalData.userInfo.code == 1){
      var config = { title: '操作', content: '确定要解除绑定吗？' };
      config.success = function(e){
        if(e.cancel){
          return;
        }
        netWork.POST({
          url: '/user/jyuser/unbind.html',
          success: function (res) {
            if (res.data.code == 1) {
              wx.showToast({
                title: '解绑成功'
              })
              wx.setStorageSync('JSESSIONID', '');
              $this.onShow();
            } else {
              wx.showToast({
                title: res.data.msg
              })
            }
          }
        })
      }
      wx.showModal(config);      
    }else{
      if (!this.data.globalData.unionId){
        wx.showToast({
          title: '请先关注公众号“许昌裕同印刷包装有限公司”',
          icon:'none',
          duration:5000
        })
      }else{
        wx.navigateTo({
          url: '../jy/jy',
        })
      }
    }    
  },
  getMessageList:function(){
    wx.navigateTo({
      url: '../daiban/msg_list/index',
    })
  },
})
