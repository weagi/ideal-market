<template>
  <div class="market-container">
    <header class="market-header">
      <h1>灵感集市</h1>
      <p>实现者采购市场</p>
    </header>
    
    <main class="market-main">
      <div class="filter-section">
        <el-input 
          v-model="searchQuery" 
          placeholder="搜索创意..."
          clearable
          style="width: 300px; margin-right: 20px;"
        />
        <el-select 
          v-model="priceRange" 
          placeholder="价格范围"
          style="width: 150px; margin-right: 20px;"
        >
          <el-option label="全部" value="" />
          <el-option label="0-100元" value="0-100" />
          <el-option label="100-500元" value="100-500" />
          <el-option label="500-1000元" value="500-1000" />
          <el-option label="1000元以上" value="1000+" />
        </el-select>
        <el-button type="primary" @click="searchIdeas">搜索</el-button>
      </div>
      
      <div class="ideas-grid">
        <div 
          v-for="idea in ideas" 
          :key="idea.id"
          class="idea-card"
          @click="viewIdeaDetail(idea)"
        >
          <div class="idea-header">
            <h3>{{ idea.title }}</h3>
            <el-tag type="success" size="small">AI评分: {{ idea.aiScore }}</el-tag>
          </div>
          <div class="idea-tags">
            <el-tag 
              v-for="tag in idea.tags" 
              :key="tag" 
              size="small"
              style="margin-right: 5px; margin-bottom: 5px;"
            >
              {{ tag }}
            </el-tag>
          </div>
          <div class="idea-price">
            <span class="price">{{ idea.price }}元</span>
            <el-button type="primary" size="small" @click.stop="buyIdea(idea)">
              去闲鱼购买
            </el-button>
          </div>
        </div>
        
        <div v-if="ideas.length === 0" class="no-ideas">
          <el-empty description="暂无创意项目" />
        </div>
      </div>
    </main>
  </div>
</template>

<script>
export default {
  name: 'MarketView',
  data() {
    return {
      searchQuery: '',
      priceRange: '',
      ideas: [
        {
          id: 1,
          title: '社区团购小程序源码',
          aiScore: 85,
          tags: ['小程序', '电商', '社区'],
          price: 299,
          xianyuLink: '#'
        },
        {
          id: 2,
          title: 'AI智能客服系统',
          aiScore: 92,
          tags: ['AI', '客服', 'SaaS'],
          price: 599,
          xianyuLink: '#'
        }
      ]
    }
  },
  methods: {
    searchIdeas() {
      // 模拟搜索功能
      console.log('搜索:', this.searchQuery, this.priceRange)
    },
    viewIdeaDetail(idea) {
      // 查看详情
      console.log('查看详情:', idea)
    },
    buyIdea(idea) {
      // 跳转到闲鱼
      window.open(idea.xianyuLink, '_blank')
    }
  }
}
</script>

<style scoped>
.market-container {
  padding: 20px;
}

.market-header {
  text-align: center;
  margin-bottom: 30px;
}

.market-header h1 {
  font-size: 2.5rem;
  color: #07c160;
  margin-bottom: 10px;
}

.market-header p {
  color: #666;
  font-size: 1.2rem;
}

.filter-section {
  display: flex;
  align-items: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
}

.ideas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.idea-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  border: 1px solid #ebeef5;
}

.idea-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.idea-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.idea-header h3 {
  font-size: 1.2rem;
  color: #333;
  margin: 0;
}

.idea-tags {
  margin-bottom: 15px;
  min-height: 32px;
}

.idea-price {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.price {
  font-size: 1.3rem;
  font-weight: bold;
  color: #07c160;
}

.no-ideas {
  grid-column: 1 / -1;
  text-align: center;
  padding: 40px;
}
</style>