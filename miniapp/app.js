// app.js
App({
  onLaunch() {
    // 获取用户信息
    this.getUserInfo();
    
    // 初始化全局数据
    this.globalData = {
      userInfo: null,
      openid: null,
      hasLogin: false
    };
  },
  
  // 获取用户信息和openid
  async getUserInfo() {
    try {
      // 获取用户信息
      const userInfoRes = await wx.getUserProfile({
        desc: '用于完善用户资料'
      });
      this.globalData.userInfo = userInfoRes.userInfo;
      
      // 登录获取openid
      const loginRes = await wx.login();
      const { openid } = await this.getOpenId(loginRes.code);
      this.globalData.openid = openid;
      this.globalData.hasLogin = true;
      
      console.log('用户登录成功', { openid, userInfo: userInfoRes.userInfo });
    } catch (error) {
      console.error('获取用户信息失败', error);
      // 处理登录失败的情况
    }
  },
  
  // 通过code获取openid
  async getOpenId(code) {
    const API_BASE = 'https://your-backend-domain.com/api/v1';
    try {
      const res = await wx.request({
        url: `${API_BASE}/users/login`,
        method: 'POST',
        data: { code },
        header: { 'Content-Type': 'application/json' }
      });
      return res.data;
    } catch (error) {
      console.error('获取openid失败', error);
      throw error;
    }
  },
  
  // 全局方法：显示加载提示
  showLoading(title = '加载中...') {
    wx.showLoading({ title, mask: true });
  },
  
  // 全局方法：隐藏加载提示
  hideLoading() {
    wx.hideLoading();
  },
  
  // 全局方法：显示错误提示
  showError(message) {
    wx.showToast({
      title: message,
      icon: 'error',
      duration: 3000
    });
  },
  
  // 全局方法：显示成功提示
  showSuccess(message) {
    wx.showToast({
      title: message,
      icon: 'success',
      duration: 2000
    });
  }
});