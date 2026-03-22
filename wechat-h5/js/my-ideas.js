// 我的灵感页面
class MyIdeasPage {
  constructor() {
    this.ideasList = document.getElementById('ideasList');
    this.emptyState = document.getElementById('emptyState');
  }
  
  // 页面加载
  async load() {
    const userInfo = window.weChatConfig.getUserInfo();
    if (!userInfo.openid) {
      alert('请先授权登录');
      window.location.href = 'index.html';
      return;
    }
    
    await this.loadIdeas();
  }
  
  // 加载灵感列表
  async loadIdeas() {
    const userInfo = window.weChatConfig.getUserInfo();
    
    try {
      const response = await fetch(`/api/v1/ideas?openid=${userInfo.openid}`);
      const data = await response.json();
      
      if (data.success) {
        this.renderIdeas(data.data);
      } else {
        throw new Error(data.message || '加载失败');
      }
    } catch (error) {
      console.error('加载灵感失败:', error);
      alert('加载失败，请重试');
    }
  }
  
  // 渲染灵感列表
  renderIdeas(ideas) {
    if (ideas.length === 0) {
      this.emptyState.style.display = 'block';
      this.ideasList.style.display = 'none';
      return;
    }
    
    this.emptyState.style.display = 'none';
    this.ideasList.style.display = 'block';
    
    this.ideasList.innerHTML = ideas.map(idea => `
      <div class="idea-item">
        <div class="idea-header">
          <div class="idea-title">${idea.aiGenerated?.xianyuTitle || idea.title || '未命名灵感'}</div>
          <span class="status-tag status-${idea.status}">${this.getStatusText(idea.status)}</span>
        </div>
        <div class="idea-content">
          ${idea.status === 'completed' ? 
            `<span>AI评分: ${idea.aiGenerated?.aiScore || 0}</span>
             <span>价格: ¥${idea.marketPrice || 0}</span>` : 
            '<span>AI正在后台为您整理...</span>'
          }
        </div>
      </div>
    `).join('');
  }
  
  // 获取状态文本
  getStatusText(status) {
    switch (status) {
      case 'processing': return '处理中';
      case 'completed': return '已完成';
      case 'failed': return '异常';
      default: return status;
    }
  }
}

// 页面初始化
document.addEventListener('DOMContentLoaded', () => {
  const myIdeasPage = new MyIdeasPage();
  myIdeasPage.load();
});