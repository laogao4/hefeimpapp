var network = require("../../../../utils/netWork.js")
var util = require('../../../../utils/util.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    config:{},
    url:'',
    data:{},
    showName:false,
    seatMap:{}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // options.id = 4;
    var _this = this;
    network.getWsData('hefei_nianhui2020_config',{},function(res){
      var config = JSON.parse(res[0].v);
      console.log(config)
      _this.setData({
        config:config,
        url:network.getUrl()
      });
    });
    network.getWsData('hefei_nianhui2020_search',{},function(res){
      var seatMap = {},data={};
      for(var i=0;i<res.length;i++){
        seatMap[res[i].row+'-'+res[i].col] = res[i].name;
        if(options.id == res[i].id){
          data = res[i];
        }
      }
      console.log(data)
      _this.setData({
        data:data,
        seatMap:seatMap
      });
    });
  },

  change:function(){
    this.setData({
      showName:!this.data.showName
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
  showDriver:function(e){
    var type = e.currentTarget.dataset.type;
    var data = this.data.data;
    var name = data["driver"+type+"_name"];
    var phone = data["driver"+type+"_phone"];
    wx.showModal({
      title: '联系司机',
      content:'司机姓名：'+name+"\r\n司机手机号："+phone,
      confirmText:'我要联系',
      success:function(res){
        if (!res.confirm) {
          return;
        }
        wx.makePhoneCall({
          phoneNumber: phone,
        })
      }
    });
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