var API_URL = 'http://10.13.7.106:8083/' //开发
const app = getApp()
var requestHandler = {
  url: '',
  params: {},
  success: function (res) { 
  },
  fail: function () {
  },
}
function getUrl() {
  return API_URL;
}

function loadDict(codes,$this,callback){
  POST({
    url:'attr/load.html',
    params: { attr_code:codes},
    success:function(res){
      var obj = {};
      var data = res.data.data;
      for(var i=0;i<data.length;i++){
        if(!obj[data[i].code]){
          obj[data[i].code] = {};
          obj[data[i].code+"_arr"] = [];
        }
        obj[data[i].code][data[i].value] = data[i].name;
        obj[data[i].code+"_arr"].push(data[i]);
      }
      $this.setData({
        _dict: obj
      });
      callback && callback();
    }
  });
}

//获取序号
function getMenuOrder(callback){
  POST({
    url:'menu/ewfwmenuorder/listMyData.html',
    success:function(res){
      callback(res.data.data);
    }
  });
  
}

function getcvposition(id,callback){
  POST({
    url:'recruitment/hrrecruitmentcvposition/viewData.html',
    params:{id:id},
    success:function(res){
      wx.hideLoading();
      var data = res.data.data.data;
      if(!data){
        wx.showToast({
          title: '无此简历',
          icon:'none'
        });
        setTimeout(function(){
          wx.switchTab({
            url: '/pages/index/index',
          });
        },2000);
        return;
      }
      var workflow = JSON.parse(res.data.data.workflow);
      var status = data.status,next={};
      for(var i=0;i<workflow.length;i++){
        if(workflow[i].name == status){
          next = workflow[i+1];
          break;
        }
      }
      callback(data,next,workflow);
    }
  });
}

function GET(requestHandler) {
  return request('GET', requestHandler)
}
function POST(requestHandler) {
  return request('POST', requestHandler)
}
function request(method, requestHandler) {
  var pages = getCurrentPages()
  var currentPage = pages[pages.length - 1]
  currentPage.setData({_commitFlag:true});
  var params = requestHandler.params;
  var url = requestHandler.url;
  return wx.request({
    url: API_URL + url,
    data: params,
    method: method,
    header: {
      'content-type': 'application/x-www-form-urlencoded;charset=utf-8',
      'cache-control': 'no-cache',
      'Cookie': 'JSESSIONID = ' + wx.getStorageSync("JSESSIONID")+"; SESSION = "+wx.getStorageSync("JSESSIONID")
    },
    success: function (res) {
      if (res.data.toString().match(/<script/)) {
        //重新触发登录，登录成功后重新触发之前的请求
        if (currentPage && currentPage.route) {
          login(function () {
            request(method, requestHandler)
          });
        }
        return;
      }
      var code = res.data.code;
      if (code == "-2") {
        //重新触发登录，登录成功后重新触发之前的请求
        if (currentPage && currentPage.route) {
          login(function () {
            request(method, requestHandler)           
          });
        }
      } else if (code == "-1") {
        wx.hideLoading();
        setTimeout(function(){
          currentPage.setData({_commitFlag:false});
        },500);
        wx.showModal({
          title: '提示',
          content: '后台异常，请联系管理员！',
          confirmText: "确认",
        })
      } else if (code == "0") {
        //后台异常，请联系管理员
        wx.hideLoading();
        setTimeout(function(){
          currentPage.setData({_commitFlag:false});
        },500);
        wx.showToast({
          title: res.data.msg,
          icon:'none',
          duration:3000
        })
      }else{
        wx.hideLoading();
        setTimeout(function(){
          currentPage.setData({_commitFlag:false});
        },500);
        requestHandler.success(res)
      }      
    },
    fail: function (res) {
      requestHandler.fail(res)
    },
    complete: function () {
    }
  })
}
function login(callback,err) {
  getApp().getLogin().then(function (res){
    if (getApp().globalData.userInfo.code == 1) {
      callback && callback(res);
    }else{
      if(err){
        err && err();
      }else{
        back({title:'请先绑定嘉扬系统账号',icon:'none',duration:3000});
      }
    }
  });
}

//请求列表数据
function getList(url,_this,callback,beforepush,config){
  config = Object.assign({
    pageInfo:_this.data.pageInfo,
    params:_this.data.params,
    listKey:"list",
    pageInfoKey:"pageInfo",
    loadingKey:'loading'
  },config);
  if(!config.list){
    config.list = _this.data[config.listKey];
  }
  if (config.loading || config.pageInfo.isLastPage) {
    return;
  } else {
    wx.showLoading({ title: '加载中' });
    _this.setData({
      [config.loadingKey]:true
    });
    var params = Object.assign({ page: config.pageInfo.nextPage ? config.pageInfo.nextPage : 1 },config.params);
    POST({
      url: url,
      params: params,
      success: function (res) {
        _this.setData({
          [config.loadingKey]:false,
          [config.pageInfoKey]: res.data.data
        });
        if (res.data.data.list.length > 0) {
          var dataList = config.list;
          beforepush && beforepush(res.data.data.list);
          dataList.push.apply(dataList, res.data.data.list);
          _this.setData({
            [config.listKey]: dataList
          });
        }
        callback && callback();
      }
    });
  }
}

function downloadFile(url){
  //下载文件，生成临时地址
  wx.showLoading({
    title: '下载中'
  });
  wx.downloadFile({
    url: url,
    success(res) {
      //保存到本地
      wx.saveFile({
        tempFilePath: res.tempFilePath,
        success: function (res) {
          wx.hideLoading();
          const savedFilePath = res.savedFilePath;
          // 打开文件
          wx.openDocument({
            filePath: savedFilePath,
            success: function (res) {
              console.log('打开文档成功')
            },
          });
        },
        fail: function (err) {
          wx.showToast({
            title: '保存失败:' + err.errMsg,
            icon:'none',
            duration:5000
          })
        }
      });
    },
    fail(err){
      wx.showToast({
        title: '下载失败:' + err.errMsg,
        icon: 'none',
        duration: 5000
      })
    }
  })
}
//完成待办
function finishDaiban(_daibanId){
  POST({
    url: 'daiban/hrdaiban/finish.html',
    params: { _daibanId: _daibanId },
    success: function (res) {
      console.log(res);
    }
  })
}

function viewNews(model){
  var pages = getCurrentPages();
  var currentPage = pages[pages.length - 1];
  var prefix = currentPage.route == 'pages/index/index'?'../':'../../';
  wx.navigateTo({
    url: prefix+'h5/h5?title=' + model.name + '&src=' + encodeURIComponent(model.content)
  })
}

function setTabBarBadge(config){
  if(config){
    var num = config.num;
    if(num>0){
      wx.setTabBarBadge({
        index:1,
        text:num+""
      });
    }else{
      wx.removeTabBarBadge({
        index:1
      });
    }
    return;
  }
  POST({
    url:'daiban/hrmsg/listMyData.html?status=N&pageSize=1',
    success:function(res){
      var num = res.data.data.total;
      if(num>0){
        wx.setTabBarBadge({
          index:1,
          text:num+""
        });
      }else{
        wx.removeTabBarBadge({
          index:1
        });
      }
    }
  });
}

function uploadFile(url,file,formData,callback){
  wx.uploadFile({
    url: url,
    header: {
      'Cookie': 'JSESSIONID = ' + wx.getStorageSync("JSESSIONID")+"; SESSION = "+wx.getStorageSync("JSESSIONID")
    },
    filePath: file,
    name: 'file',
    formData: formData,
    success: function (res) {
      callback && callback(JSON.parse(res.data));
    }
  })
}

function initBadge(menus,_this){
  //计算各个菜单的角标
  if(menus.length == 0){
    return;
  }
  //需要计算角标的页面
  var pages = ["/pages/recruitment/ordinary/chushilist/index"];
  var urls = ["recruitment/hrrecruitmentordinarycv/listData.html?pageSize=1&cvPosition.status=简历提交"];
  pages.push("/pages/recruitment/ordinary/fushilist/index");
  urls.push("recruitment/hrrecruitmentordinarycv/listData.html?pageSize=1&cvPosition.status=人资初试");
  pages.push("/pages/recruitment/staff/chushilist/index");
  urls.push("recruitment/hrrecruitmentstaffcv/listData.html?pageSize=1&cvPosition.status=简历提交");
  pages.push("/pages/recruitment/school/chushilist/index");
  urls.push("recruitment/hrrecruitmentschoolcv/listData.html?pageSize=1&cvPosition.status=简历提交");
  pages.push("/pages/recruitment/school/fushilist/index");
  urls.push("recruitment/hrrecruitmentschoolcv/listData.html?pageSize=1&cvPosition.status=人资初试");
  pages.push("/pages/daiban/daiban_list/index");
  urls.push("daiban/hrdaiban/listData.html?pageSize=1");
  for(var i=0;i<menus.length;i++){
    var url = menus[i].url,menuId = menus[i].menuId;
    var j = pages.indexOf(url);
    if(j<0){
      continue;
    }
    getBadge(menuId,urls[j],_this);    
  }
}

function getBadge(menuId,url,_this){
  POST({
    url:url,
    success: function (res) {
      var total = res.data.data.total*1;
      if(total>0){
        if(total>=99){
          total = 99;
        }
        _this.setData({
          ["menuBadge["+menuId+"]"] :total
        });
      }else{
        _this.setData({
          ["menuBadge["+menuId+"]"] :0
        });
      }      
    }
  });
}

//检查待办是否可用，如果不可用，则返回至前一页或首页
function checkDaibanAuth(id,callback){
  POST({
    url:'/daiban/hrdaiban/checkAuth.html?id='+id,
    success: function (res) {
      var data = res.data;
      if(data.code == "1"){
        if(data.data){
          callback && callback();
        }else{
          wx.showToast({
            title: '该待办已完成',
            icon:'none'
          })
          back();
        }
      }           
    }
  });
}

function back(msg){
  if(msg){
    wx.showToast(msg);
  }
  setTimeout(function(){
    var pages = getCurrentPages(),len = pages.length;
    //如果只有一页或者上一页是空白页，则直接跳转至首页，否则返回至上一页
    if(len==1 || pages[len-1].route=="pages/blankPage/blankPage"){
      wx.switchTab({
        url: '/pages/index/index',
      })
    }else{
      wx.navigateBack();
    }
  },2000);
}

//请求ws通用接口
function getWsData(key,param,callback){
  GET({
    url:'/commonData/getData.html?key='+key,
    params:{parameter:param?JSON.stringify(param):""},
    success:function(d){
      callback && callback(d.data.data);
    }
  });
}

module.exports = {
  GET: GET,
  POST: POST,
  getUrl: getUrl,
  loadDict: loadDict,
  getList: getList,
  downloadFile: downloadFile,
  finishDaiban:finishDaiban,
  viewNews:viewNews,
  setTabBarBadge:setTabBarBadge,
  getcvposition:getcvposition,
  uploadFile:uploadFile,
  initBadge:initBadge,
  getMenuOrder:getMenuOrder,
  login:login,
  checkDaibanAuth:checkDaibanAuth,
  back:back,
  getWsData:getWsData
}  