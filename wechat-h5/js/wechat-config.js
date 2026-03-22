// 微信JS-SDK配置
class WeChatConfig {
  constructor() {
    this.config = null;
  }
  
  // 初始化微信JS-SDK
  async init() {
    try {
      const response = await fetch(`/api/v1/wechat/js-config?url=${encodeURIComponent(window.location.href)}`);
      const data = await response.json();
      
      if (data.success) {
        this.config = data.config;
        wx.config({
          debug: false,
          appId: this.config.appId,
          timestamp: this.config.timestamp,
          nonceStr: this.config.nonceStr,
          signature: this.config.signature,
          jsApiList: ['chooseImage', 'uploadImage', 'startRecord', 'stopRecord', 'onVoiceRecordEnd']
        });
        
        wx.ready(() => {
          console.log('微信JS-SDK初始化成功');
        });
        
        wx.error((res) => {
          console.error('微信JS-SDK初始化失败:', res);
        });
      } else {
        throw new Error('获取微信配置失败');
      }
    } catch (error) {
      console.error('初始化微信配置失败:', error);
    }
  }
  
  // 获取用户信息（从URL参数）
  getUserInfo() {
    const urlParams = new URLSearchParams(window.location.search);
    return {
      token: urlParams.get('token'),
      openid: urlParams.get('openid')
    };
  }
}

// 全局实例
window.weChatConfig = new WeChatConfig();