var network = require("../../../../utils/netWork.js")
var util = require('../../../../utils/util.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    config:{},
    url:'',
    params:{}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var _this = this;
    network.getWsData('hefei_nianhui2020_config',{},function(res){
      var config = JSON.parse(res[0].v);
      _this.setData({
        config:config,
        url:network.getUrl()
      });
    });
  },

  formInputChange:function(e){
    util.inputChange(e,this,"params.");
  },

  commit:function(e){
    if(!this.data.params.name){
      wx.showToast({
        title: '名字不能为空',
        icon:'none'
      });
      return;
    }else{
      wx.showLoading({
        title: '查询中'
      });
      network.getWsData('hefei_nianhui2020_search',this.data.params,function(res){
        if(res.length == 0){
          wx.showToast({
            title: '未查询到您的信息，请重新输入',
            icon:'none'
          })
          return;
        }
        wx.navigateTo({
          url: '../info/index?id='+res[0].id,
        })
      });
    }

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})