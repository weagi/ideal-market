// pages/index/index.js
Page({
  data: {
    isRecording: false,
    recordingTime: 0,
    timer: null
  },

  // 语音录制开始
  startRecording() {
    const that = this;
    this.setData({ isRecording: true, recordingTime: 0 });
    
    // 模拟录音计时
    this.data.timer = setInterval(() => {
      const time = this.data.recordingTime + 1;
      this.setData({ recordingTime: time });
    }, 1000);
    
    // 开始录音
    wx.startRecord({
      success(res) {
        const tempFilePath = res.tempFilePath;
        that.submitIdea({ voiceFile: tempFilePath });
      },
      fail(err) {
        console.error('录音失败:', err);
        that.showError('录音失败，请重试');
        that.stopRecording();
      }
    });
  },

  // 语音录制结束
  stopRecording() {
    clearInterval(this.data.timer);
    this.setData({ isRecording: false, recordingTime: 0 });
    wx.stopRecord();
  },

  // 图片上传
  uploadImage() {
    const that = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success(res) {
        const tempFilePaths = res.tempFilePaths;
        that.submitIdea({ imageFile: tempFilePaths[0] });
      },
      fail(err) {
        console.error('图片选择失败:', err);
        that.showError('图片选择失败');
      }
    });
  },

  // 提交灵感
  async submitIdea(data) {
    const app = getApp();
    if (!app.globalData.openid) {
      await this.getUserInfo();
    }
    
    wx.showLoading({ title: '提交中...' });
    
    try {
      // 构建表单数据
      const formData = new FormData();
      formData.append('openid', app.globalData.openid);
      
      if (data.voiceFile) {
        formData.append('voice', wx.getFileSystemManager().readFileSync(data.voiceFile));
      }
      if (data.imageFile) {
        formData.append('image', wx.getFileSystemManager().readFileSync(data.imageFile));
      }
      
      const response = await wx.request({
        url: 'http://localhost:3001/api/v1/ideas',
        method: 'POST',
        data: formData,
        header: {
          'content-type': 'multipart/form-data'
        }
      });
      
      if (response.data.success) {
        wx.showToast({
          title: '提交成功！AI正在处理...',
          icon: 'success'
        });
        
        // 跳转到我的灵感页面
        setTimeout(() => {
          wx.switchTab({
            url: '/pages/my-ideas/my-ideas'
          });
        }, 1500);
      } else {
        throw new Error(response.data.message || '提交失败');
      }
    } catch (error) {
      console.error('提交失败:', error);
      this.showError('提交失败，请重试');
    } finally {
      wx.hideLoading();
    }
  },

  // 获取用户信息
  async getUserInfo() {
    const app = getApp();
    try {
      const userInfoRes = await wx.getUserProfile({
        desc: '用于完善用户资料'
      });
      
      const loginRes = await wx.login();
      const code = loginRes.code;
      
      // 调用后端获取openid
      const openidRes = await wx.request({
        url: 'http://localhost:3001/api/v1/users/login',
        method: 'POST',
        data: { code }
      });
      
      app.globalData.userInfo = userInfoRes.userInfo;
      app.globalData.openid = openidRes.data.openid;
      app.globalData.hasLogin = true;
      
    } catch (error) {
      console.error('获取用户信息失败:', error);
      this.showError('登录失败，请重试');
    }
  },

  // 显示错误提示
  showError(message) {
    wx.showToast({
      title: message,
      icon: 'error',
      duration: 3000
    });
  },

  // 页面生命周期
  onLoad() {
    // 初始化
  },

  onUnload() {
    // 清理定时器
    if (this.data.timer) {
      clearInterval(this.data.timer);
    }
  }
});