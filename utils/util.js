const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function formatDate(date, fmt) {
  var o = {
    'M+' : date.getMonth() + 1, //月份
    'd+' : date.getDate(), //日
    '[Hh]+' : date.getHours(), //小时
    'm+' : date.getMinutes(), //分
    's+' : date.getSeconds(), //秒
    'q+' : Math.floor((date.getMonth() + 3) / 3), //季度
    'S' : date.getMilliseconds() //毫秒
  };
  if (!isNotEmpty(fmt)) {
    fmt = 'yyyy-MM-dd';
  }
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
  }
  for (var k in o) {
    if (new RegExp('(' + k + ')').test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)));
    }
  }
  return fmt;
}

function isNotEmpty(str) {
  if (str != '' && str != null && typeof str != 'undefined') {
    return true;
  }
  return false;
}

const formatMonth = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  return [year, month].map(formatNumber).join('-');
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

const yestoday = function(){
  return formatDate(new Date(new Date().getTime()-24*3600*1000));
}

function checkNull(v,name,_this){
  if(!v || v.length == 0){
    _this.setData({
      error:name+'不能为空'
    });
    return false;
  }else{
    return true;
  }
}

function inputChange(e,_this,prefix) {
  prefix = prefix?prefix:"data.";//前缀
  var field = e.currentTarget.dataset.field || e.currentTarget.dataset.prop;
  console.log(field+":"+e.detail.value);
  //数组类型
  if(typeof e.detail.value == "object"){
    _this.setData({
      [prefix+field]: e.detail.value.join(',')
    });
  }else{
    _this.setData({
      [prefix+field]: e.detail.value
  })
  }  
};

function pickerChange(e,_this,prefix){
  prefix = prefix?prefix:"data.";//前缀
  var field = e.currentTarget.dataset.field || e.currentTarget.dataset.prop;
  var field2 = field.substr(0,field.length-5);//去掉末尾的Index
  var key = field2.split(".");
  key = key[key.length-1];
  var list = _this.data[key];
  _this.setData({
    [prefix+field]:e.detail.value,
    [prefix+field2]:list[e.detail.value]
  });
}

function addSub(e,_this,prefix){
  prefix = prefix?prefix:"data";//前缀
  var list = _this.data.data;
  var key = prefix+"["+list.length+"]";
  _this.setData({
    [key]:{}
  });
}

function removeSub(e,_this,prefix){
  prefix = prefix?prefix:"data";//前缀
  var key = e.currentTarget.dataset.key;
  var data = _this.data[prefix];
  data.splice(key,1);
  _this.setData({
    [prefix]:data
  });
}

function navigateTo(e){
  var page = e.currentTarget.dataset.page;
    if(e.currentTarget.dataset.model){
      var model = encodeURIComponent(JSON.stringify(e.currentTarget.dataset.model));
      if(page.indexOf("?")<0){
        page = page+"?model="+model;
      }else{
        page = page+"&model="+model;
      }
    }
    wx.navigateTo({
      url: page
    })
}

//将菜单数组转成map，key为menuId
function menus2map(menus,network){
  var menuMap = {};
  for (var i = 0; i < menus.length; i++) {
    var now = menus[i];
    if(now.childrens && now.childrens.length>0){
      for(var j=0;j<now.childrens.length;j++){
        var menu = now.childrens[j];
        if (menu.menuIcon.indexOf('http') == -1) {
          menu.menuIcon = network.getUrl() + menu.menuIcon
        }
        menuMap[menu.menuId] = menu;
      }
    }
  }
  return menuMap;
}

/**
 * 对一个数据进行排序
 * @param {*} arr 
 * @param {*} order 排序方式：asc，desc
 * @param {*} orderBy 排序字段
 */
function sort(arr,order,orderBy){
  if(order){
    arr.sort(function(a,b){
      if(a["_sum"]){
        return 1;
      }else if(b["_sum"]){
        return -1;
      }
      if((a[orderBy]>b[orderBy] && order=='asc') || (a[orderBy]<b[orderBy] && order=='desc')){
        return 1;
      }else if(a[orderBy]==b[orderBy]){
        return 0;
      }else{
        return -1;
      }
    });
  }
  return arr;
}

function getWindowHeightByRpx(){
  var info = wx.getSystemInfoSync(),ratio = 750/info.windowWidth;
  return info.windowHeight * ratio;
}

/**
 * 获取屏幕方向，1：纵向，2：横向
 */
function getScreenDirection(){
  var info = wx.getSystemInfoSync();
  if(info.windowWidth<info.windowHeight){
    return 1;
  }else{
    return 2;
  }
}

module.exports = {
  formatTime: formatTime,
  formatDate: formatDate,
  formatMonth:formatMonth,
  yestoday:yestoday,
  checkNull:checkNull,
  pickerChange:pickerChange,
  inputChange:inputChange,
  addSub:addSub,
  removeSub:removeSub,
  navigateTo:navigateTo,
  menus2map:menus2map,
  isLogin:function(){
    return wx.getStorageSync('userInfo').code == "1";
  },
  getUserId:function(){
    return wx.getStorageSync('userInfo').userId;
  },
  sort:sort,
  getWindowHeightByRpx:getWindowHeightByRpx,
  getScreenDirection:getScreenDirection
}
