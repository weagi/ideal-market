// pages/idea-detail/idea-detail.js
Page({
  data: {
    idea: null,
    loading: false
  },

  // 页面加载
  onLoad(options) {
    const ideaId = options.id;
    if (ideaId) {
      this.loadIdeaDetail(ideaId);
    }
  },

  // 加载灵感详情
  async loadIdeaDetail(ideaId) {
    const app = getApp();
    if (!app.globalData.openid) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      return;
    }

    this.setData({ loading: true });

    try {
      const response = await wx.request({
        url: `http://localhost:3001/api/v1/ideas/${ideaId}`,
        method: 'GET',
        data: { openid: app.globalData.openid }
      });

      if (response.data.success) {
        this.setData({ 
          idea: response.data.data,
          loading: false 
        });
      } else {
        throw new Error(response.data.message || '加载失败');
      }
    } catch (error) {
      console.error('加载详情失败:', error);
      wx.showToast({ title: '加载失败', icon: 'error' });
      this.setData({ loading: false });
    }
  },

  // 复制闲鱼文案
  copyXianyuContent() {
    if (!this.data.idea) return;
    
    const content = `${this.data.idea.aiGenerated.xianyuTitle}\n${this.data.idea.aiGenerated.xianyuDescription}`;
    wx.setClipboardData({
      data: content,
      success() {
        wx.showToast({ title: '已复制到剪贴板' });
      }
    });
  },

  // 去闲鱼发布
  goToXianyu() {
    wx.showToast({ title: '正在跳转闲鱼...', icon: 'loading' });
    // 模拟跳转闲鱼
    setTimeout(() => {
      wx.showToast({ title: '闲鱼App已唤起' });
    }, 1000);
  },

  // 回填闲鱼链接
  submitXianyuLink() {
    const that = this;
    wx.showModal({
      title: '回填闲鱼链接',
      content: '请输入您的闲鱼商品链接',
      editable: true,
      placeholderText: 'https://2.taobao.com/item.htm?id=...',
      success(res) {
        if (res.confirm && res.content) {
          that.updateXianyuLink(res.content);
        }
      }
    });
  },

  // 更新闲鱼链接
  async updateXianyuLink(xianyuLink) {
    const app = getApp();
    const ideaId = this.data.idea._id;
    
    wx.showLoading({ title: '同步中...' });
    
    try {
      const response = await wx.request({
        url: `http://localhost:3001/api/v1/ideas/${ideaId}/xianyu-link`,
        method: 'PUT',
        data: {
          openid: app.globalData.openid,
          xianyuLink: xianyuLink
        }
      });
      
      if (response.data.success) {
        wx.showToast({ title: '同步成功！已上架到市场' });
        // 更新本地数据
        const updatedIdea = { ...this.data.idea, ...response.data.data };
        this.setData({ idea: updatedIdea });
      } else {
        throw new Error(response.data.message || '同步失败');
      }
    } catch (error) {
      console.error('同步失败:', error);
      wx.showToast({ title: '同步失败', icon: 'error' });
    } finally {
      wx.hideLoading();
    }
  }
});