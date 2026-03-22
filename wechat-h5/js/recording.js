// 录音功能
class RecordingManager {
  constructor() {
    this.isRecording = false;
    this.recordingStartTime = null;
    this.mediaRecorder = null;
    this.audioChunks = [];
  }
  
  // 开始录音
  async startRecording() {
    if (this.isRecording) return;
    
    try {
      // 检查是否在微信环境中
      if (typeof wx !== 'undefined' && wx.config) {
        // 微信JS-SDK录音
        this.startWeChatRecording();
      } else {
        // 浏览器原生录音
        this.startBrowserRecording();
      }
      
      this.isRecording = true;
      this.recordingStartTime = Date.now();
      this.showRecordingUI();
      
    } catch (error) {
      console.error('开始录音失败:', error);
      this.showError('录音功能不可用，请在微信中打开');
    }
  }
  
  // 停止录音
  stopRecording() {
    if (!this.isRecording) return;
    
    if (typeof wx !== 'undefined' && wx.config) {
      // 微信JS-SDK停止录音
      wx.stopRecord();
    } else {
      // 浏览器原生停止录音
      if (this.mediaRecorder) {
        this.mediaRecorder.stop();
      }
    }
    
    this.isRecording = false;
    this.hideRecordingUI();
  }
  
  // 微信JS-SDK录音
  startWeChatRecording() {
    wx.startRecord({
      success: () => {
        console.log('微信录音开始');
      },
      cancel: () => {
        console.log('用户取消录音');
        this.stopRecording();
      }
    });
    
    // 监听录音结束
    wx.onVoiceRecordEnd({
      complete: (res) => {
        console.log('微信录音结束，localId:', res.localId);
        this.uploadWeChatVoice(res.localId);
      }
    });
  }
  
  // 上传微信语音
  uploadWeChatVoice(localId) {
    wx.uploadVoice({
      localId: localId,
      isShowProgressTips: 1,
      success: (res) => {
        console.log('微信语音上传成功，serverId:', res.serverId);
        this.submitIdea({ voiceServerId: res.serverId });
      },
      fail: (error) => {
        console.error('微信语音上传失败:', error);
        this.showError('语音上传失败');
      }
    });
  }
  
  // 浏览器原生录音
  async startBrowserRecording() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.mediaRecorder = new MediaRecorder(stream);
    this.audioChunks = [];
    
    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.audioChunks.push(event.data);
      }
    };
    
    this.mediaRecorder.onstop = () => {
      const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
      this.submitIdea({ voiceFile: audioBlob });
    };
    
    this.mediaRecorder.start();
  }
  
  // 显示录音UI
  showRecordingUI() {
    document.getElementById('recordingSection').style.display = 'none';
    document.getElementById('uploadSection').style.display = 'none';
    document.getElementById('statusSection').style.display = 'block';
  }
  
  // 隐藏录音UI
  hideRecordingUI() {
    document.getElementById('recordingSection').style.display = 'block';
    document.getElementById('uploadSection').style.display = 'block';
    document.getElementById('statusSection').style.display = 'none';
  }
  
  // 提交灵感
  async submitIdea(data) {
    const userInfo = window.weChatConfig.getUserInfo();
    if (!userInfo.openid) {
      this.showError('请先授权登录');
      return;
    }
    
    const formData = new FormData();
    formData.append('openid', userInfo.openid);
    
    if (data.voiceServerId) {
      formData.append('voiceServerId', data.voiceServerId);
    }
    if (data.voiceFile) {
      formData.append('voice', data.voiceFile);
    }
    if (data.imageFile) {
      formData.append('image', data.imageFile);
    }
    
    try {
      const response = await fetch('/api/v1/ideas', {
        method: 'POST',
        body: formData
      });
      
      const result = await response.json();
      if (result.success) {
        this.showSuccess('提交成功！AI正在处理...');
        setTimeout(() => {
          window.location.href = 'my-ideas.html';
        }, 2000);
      } else {
        throw new Error(result.message || '提交失败');
      }
    } catch (error) {
      console.error('提交失败:', error);
      this.showError('提交失败，请重试');
    }
  }
  
  // 显示错误
  showError(message) {
    alert(message);
  }
  
  // 显示成功
  showSuccess(message) {
    alert(message);
  }
}

// 全局实例
window.recordingManager = new RecordingManager();

// 绑定录音按钮事件
document.addEventListener('DOMContentLoaded', () => {
  const recordBtn = document.getElementById('recordBtn');
  if (recordBtn) {
    let touchTimeout;
    
    recordBtn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      touchTimeout = setTimeout(() => {
        window.recordingManager.startRecording();
      }, 300);
    });
    
    recordBtn.addEventListener('touchend', (e) => {
      e.preventDefault();
      clearTimeout(touchTimeout);
      window.recordingManager.stopRecording();
    });
    
    // PC端鼠标事件
    recordBtn.addEventListener('mousedown', (e) => {
      e.preventDefault();
      touchTimeout = setTimeout(() => {
        window.recordingManager.startRecording();
      }, 300);
    });
    
    recordBtn.addEventListener('mouseup', (e) => {
      e.preventDefault();
      clearTimeout(touchTimeout);
      window.recordingManager.stopRecording();
    });
    
    recordBtn.addEventListener('mouseleave', () => {
      clearTimeout(touchTimeout);
      window.recordingManager.stopRecording();
    });
  }
});