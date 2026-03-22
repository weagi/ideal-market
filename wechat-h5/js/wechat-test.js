// 微信公众号接口测试
class WeChatTest {
  constructor() {
    this.oauthStatus = '未授权';
    this.jsSdkStatus = '未初始化';
    this.recordStatus = '未录音';
    
    this.initEventListeners();
    this.checkCurrentState();
  }
  
  // 初始化事件监听器
  initEventListeners() {
    // OAuth2.0 测试
    document.getElementById('oauthBtn').addEventListener('click', () => this.testOAuth());
    document.getElementById('userInfoBtn').addEventListener('click', () => this.testUserInfo());
    
    // JS-SDK 测试
    document.getElementById('jsConfigBtn').addEventListener('click', () => this.testJsConfig());
    document.getElementById('checkJsApiBtn').addEventListener('click', () => this.testCheckJsApi());
    
    // 微信API测试
    document.getElementById('chooseImageBtn').addEventListener('click', () => this.testChooseImage());
    document.getElementById('startRecordBtn').addEventListener('click', () => this.testStartRecord());
    document.getElementById('stopRecordBtn').addEventListener('click', () => this.testStopRecord());
    
    // 后端API测试
    document.getElementById('backendHealthBtn').addEventListener('click', () => this.testBackendHealth());
    document.getElementById('submitTestBtn').addEventListener('click', () => this.testSubmitIdea());
  }
  
  // 检查当前状态
  checkCurrentState() {
    const userInfo = window.weChatConfig.getUserInfo();
    if (userInfo.openid) {
      this.oauthStatus = '已授权';
      this.updateStatusDisplay();
    }
  }
  
  // 更新状态显示
  updateStatusDisplay() {
    document.getElementById('oauthStatus').textContent = this.oauthStatus;
    document.getElementById('jsSdkStatus').textContent = this.jsSdkStatus;
    document.getElementById('recordStatus').textContent = this.recordStatus;
  }
  
  // 显示测试结果
  showResult(elementId, result, isError = false) {
    const element = document.getElementById(elementId);
    element.textContent = typeof result === 'object' ? JSON.stringify(result, null, 2) : result;
    element.className = `test-result ${isError ? 'error' : 'success'}`;
  }
  
  // 显示加载状态
  showLoading(elementId) {
    const element = document.getElementById(elementId);
    element.innerHTML = '<div class="loading"></div> 测试中...';
    element.className = 'test-result';
  }
  
  // OAuth2.0 授权测试
  testOAuth() {
    this.showLoading('oauthResult');
    
    // 构建OAuth授权URL
    const appId = 'your-wechat-app-id'; // 需要替换为实际的AppID
    const redirectUri = encodeURIComponent(window.location.href);
    const scope = 'snsapi_userinfo';
    const state = 'STATE';
    
    const oauthUrl = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&state=${state}#wechat_redirect`;
    
    // 由于需要真实的AppID，这里模拟测试
    setTimeout(() => {
      this.showResult('oauthResult', 'OAuth2.0授权URL已生成:\n' + oauthUrl);
    }, 1000);
  }
  
  // 获取用户信息测试
  async testUserInfo() {
    this.showLoading('oauthResult');
    
    try {
      const userInfo = window.weChatConfig.getUserInfo();
      if (!userInfo.openid) {
        throw new Error('未授权，请先进行OAuth2.0授权');
      }
      
      // 模拟从后端获取用户信息
      const response = await fetch(`/api/v1/users/profile?openid=${userInfo.openid}`);
      const data = await response.json();
      
      if (data.success) {
        this.oauthStatus = '已授权';
        this.updateStatusDisplay();
        this.showResult('oauthResult', data.data);
      } else {
        throw new Error(data.message || '获取用户信息失败');
      }
    } catch (error) {
      console.error('获取用户信息失败:', error);
      this.showResult('oauthResult', error.message, true);
    }
  }
  
  // JS-SDK 配置测试
  async testJsConfig() {
    this.showLoading('jsConfigResult');
    
    try {
      await window.weChatConfig.init();
      this.jsSdkStatus = '已初始化';
      this.updateStatusDisplay();
      this.showResult('jsConfigResult', 'JS-SDK初始化成功!');
    } catch (error) {
      console.error('JS-SDK初始化失败:', error);
      this.showResult('jsConfigResult', error.message, true);
    }
  }
  
  // 检查JS接口测试
  testCheckJsApi() {
    this.showLoading('jsConfigResult');
    
    if (typeof wx === 'undefined') {
      this.showResult('jsConfigResult', '微信JS-SDK未加载', true);
      return;
    }
    
    wx.checkJsApi({
      jsApiList: ['chooseImage', 'startRecord', 'stopRecord'],
      success: (res) => {
        this.showResult('jsConfigResult', 'JS接口检查结果:\n' + JSON.stringify(res, null, 2));
      },
      fail: (error) => {
        this.showResult('jsConfigResult', 'JS接口检查失败:\n' + JSON.stringify(error, null, 2), true);
      }
    });
  }
  
  // 选择图片测试
  testChooseImage() {
    this.showLoading('apiResult');
    
    if (typeof wx === 'undefined') {
      this.showResult('apiResult', '微信JS-SDK未初始化，请先初始化JS-SDK', true);
      return;
    }
    
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        this.showResult('apiResult', '选择图片成功!\nlocalIds: ' + JSON.stringify(res.localIds));
      },
      fail: (error) => {
        this.showResult('apiResult', '选择图片失败:\n' + JSON.stringify(error, null, 2), true);
      }
    });
  }
  
  // 开始录音测试
  testStartRecord() {
    this.showLoading('apiResult');
    
    if (typeof wx === 'undefined') {
      this.showResult('apiResult', '微信JS-SDK未初始化，请先初始化JS-SDK', true);
      return;
    }
    
    wx.startRecord({
      success: () => {
        this.recordStatus = '录音中';
        this.updateStatusDisplay();
        this.showResult('apiResult', '开始录音成功!');
        
        // 设置3秒后自动停止（测试用）
        setTimeout(() => {
          this.testStopRecord();
        }, 3000);
      },
      cancel: () => {
        this.showResult('apiResult', '用户取消录音');
      },
      fail: (error) => {
        this.showResult('apiResult', '开始录音失败:\n' + JSON.stringify(error, null, 2), true);
      }
    });
  }
  
  // 停止录音测试
  testStopRecord() {
    if (typeof wx === 'undefined') {
      this.showResult('apiResult', '微信JS-SDK未初始化', true);
      return;
    }
    
    wx.stopRecord({
      success: (res) => {
        this.recordStatus = '已停止';
        this.updateStatusDisplay();
        this.showResult('apiResult', '停止录音成功!\nlocalId: ' + res.localId);
      },
      fail: (error) => {
        this.showResult('apiResult', '停止录音失败:\n' + JSON.stringify(error, null, 2), true);
      }
    });
  }
  
  // 后端健康检查
  async testBackendHealth() {
    this.showLoading('backendResult');
    
    try {
      const response = await fetch('/api/v1/');
      const data = await response.json();
      
      this.showResult('backendResult', '后端服务正常:\n' + JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('后端健康检查失败:', error);
      this.showResult('backendResult', '后端服务不可用:\n' + error.message, true);
    }
  }
  
  // 提交测试灵感
  async testSubmitIdea() {
    this.showLoading('backendResult');
    
    try {
      const userInfo = window.weChatConfig.getUserInfo();
      if (!userInfo.openid) {
        throw new Error('未授权，请先进行OAuth2.0授权');
      }
      
      const formData = new FormData();
      formData.append('openid', userInfo.openid);
      formData.append('textContent', '这是通过测试页面提交的灵感');
      
      const response = await fetch('/api/v1/ideas', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      if (data.success) {
        this.showResult('backendResult', '提交测试灵感成功!\n' + JSON.stringify(data, null, 2));
      } else {
        throw new Error(data.message || '提交失败');
      }
    } catch (error) {
      console.error('提交测试灵感失败:', error);
      this.showResult('backendResult', error.message, true);
    }
  }
}

// 页面加载完成后初始化测试
document.addEventListener('DOMContentLoaded', () => {
  new WeChatTest();
});