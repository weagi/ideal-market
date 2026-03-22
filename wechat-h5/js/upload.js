// 图片上传功能
class UploadManager {
  constructor() {
    this.fileInput = document.getElementById('fileInput');
    this.uploadBtn = document.getElementById('uploadBtn');
    
    if (this.fileInput && this.uploadBtn) {
      this.init();
    }
  }
  
  init() {
    // 绑定上传按钮点击事件
    this.uploadBtn.addEventListener('click', () => {
      this.fileInput.click();
    });
    
    // 绑定文件选择事件
    this.fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        this.handleFileSelect(file);
      }
    });
  }
  
  // 处理文件选择
  handleFileSelect(file) {
    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件');
      return;
    }
    
    // 验证文件大小（10MB限制）
    if (file.size > 10 * 1024 * 1024) {
      alert('图片大小不能超过10MB');
      return;
    }
    
    // 检查是否在微信环境中
    if (typeof wx !== 'undefined' && wx.config) {
      // 微信JS-SDK上传
      this.uploadWeChatImage(file);
    } else {
      // 浏览器原生上传
      this.uploadBrowserImage(file);
    }
  }
  
  // 微信JS-SDK上传图片
  uploadWeChatImage(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      // 微信JS-SDK需要base64数据
      const base64 = e.target.result.split(',')[1];
      
      // 这里需要先将图片上传到服务器，然后使用微信JS-SDK
      // 由于微信JS-SDK的chooseImage返回的是localId，我们需要模拟这个过程
      this.submitIdea({ imageFile: file });
    };
    reader.readAsDataURL(file);
  }
  
  // 浏览器原生上传图片
  uploadBrowserImage(file) {
    this.submitIdea({ imageFile: file });
  }
  
  // 提交灵感
  async submitIdea(data) {
    const userInfo = window.weChatConfig.getUserInfo();
    if (!userInfo.openid) {
      alert('请先授权登录');
      return;
    }
    
    const formData = new FormData();
    formData.append('openid', userInfo.openid);
    formData.append('image', data.imageFile);
    
    try {
      const response = await fetch('/api/v1/ideas', {
        method: 'POST',
        body: formData
      });
      
      const result = await response.json();
      if (result.success) {
        alert('提交成功！AI正在处理...');
        setTimeout(() => {
          window.location.href = 'my-ideas.html';
        }, 2000);
      } else {
        throw new Error(result.message || '提交失败');
      }
    } catch (error) {
      console.error('提交失败:', error);
      alert('提交失败，请重试');
    }
  }
}

// 初始化上传管理器
document.addEventListener('DOMContentLoaded', () => {
  new UploadManager();
});