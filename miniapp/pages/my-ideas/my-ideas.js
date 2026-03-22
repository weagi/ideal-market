// pages/my-ideas/my-ideas.js
Page({
  data: {
    ideas: [],
    loading: false,
    page: 1,
    hasMore: true
  },

  // 页面加载
  onLoad() {
    this.loadIdeas();
  },

  // 加载灵感列表
  async loadIdeas(loadMore = false) {
    const app = getApp();
    if (!app.globalData.openid) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      return;
    }

    if (loadMore && !this.data.hasMore) return;
    if (this.data.loading) return;

    this.setData({ loading: true });

    try {
      const response = await wx.request({
        url: `http://localhost:3001/api/v1/ideas?page=${loadMore ? this.data.page + 1 : 1}&limit=20`,
        method: 'GET',
        data: { openid: app.globalData.openid }
      });

      if (response.data.success) {
        const newIdeas = response.data.data;
        const updatedIdeas = loadMore ? [...this.data.ideas, ...newIdeas] : newIdeas;
        
        this.setData({
          ideas: updatedIdeas,
          page: loadMore ? this.data.page + 1 : 1,
          hasMore: response.data.pagination.pages > (loadMore ? this.data.page + 1 : 1),
          loading: false
        });
      } else {
        throw new Error(response.data.message || '加载失败');
      }
    } catch (error) {
      console.error('加载灵感失败:', error);
      wx.showToast({ title: '加载失败', icon: 'error' });
      this.setData({ loading: false });
    }
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadIdeas();
    wx.stopPullDownRefresh();
  },

  // 上拉加载更多
  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadIdeas(true);
    }
  },

  // 查看灵感详情
  viewIdeaDetail(e) {
    const ideaId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/idea-detail/idea-detail?id=${ideaId}`
    });
  },

  // 刷新单个灵感状态
  refreshIdeaStatus(ideaId) {
    const ideas = this.data.ideas.map(idea => {
      if (idea._id === ideaId && idea.status === 'processing') {
        // 模拟状态更新
        return { ...idea, status: 'completed' };
      }
      return idea;
    });
    this.setData({ ideas });
  }
});