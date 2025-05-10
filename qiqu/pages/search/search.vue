<template>
  <view class="container">
    <!-- 搜索框 -->
    <view class="search-box">
      <view class="input-wrap">
        <text class="iconfont icon-search"></text>
        <input 
          type="text" 
          v-model="keyword" 
          placeholder="请输入商品名称" 
          @input="handleInput"
          class="search-input"
          confirm-type="search"
          @confirm="handleSearch"
        />
        <text class="clear-icon" v-if="keyword" @click="clearKeyword">×</text>
      </view>
      <text class="cancel" @click="goBack">取消</text>
    </view>

    <!-- 搜索历史 -->
    <view class="history-section" v-if="!keyword && searchHistory.length > 0">
      <view class="section-header">
        <text class="title">搜索历史</text>
        <text class="clear" @click="clearHistory">清空</text>
      </view>
      <view class="history-list">
        <view 
          class="history-item" 
          v-for="(item, index) in searchHistory" 
          :key="index"
          @click="useHistoryKeyword(item)"
        >
          <text class="iconfont icon-time"></text>
          <text class="keyword">{{item}}</text>
        </view>
      </view>
    </view>

    <!-- 热门搜索 -->
    <view class="hot-section" v-if="!keyword && hotSearch.length > 0">
      <view class="section-header">
        <text class="title">热门搜索</text>
      </view>
      <view class="hot-list">
        <view 
          class="hot-item" 
          v-for="(item, index) in hotSearch" 
          :key="index"
          @click="useHistoryKeyword(item)"
        >
          <text class="keyword">{{item}}</text>
        </view>
      </view>
    </view>

    <!-- 搜索建议 -->
    <view class="suggest-section" v-if="keyword && suggestList.length > 0">
      <view 
        class="suggest-item"
        v-for="(item, index) in suggestList"
        :key="index"
        @click="useHistoryKeyword(item.name)"
      >
        <text class="iconfont icon-search"></text>
        <text class="name">{{item.name}}</text>
      </view>
    </view>

    <!-- 搜索结果 -->
    <view class="result-section" v-if="showResults">
      <view class="product-list">
        <view 
          class="product-item"
          v-for="item in searchResults"
          :key="item.id"
          @click="goDetail(item.id)"
        >
          <image :src="item.image" mode="aspectFill" class="product-image"/>
          <view class="product-info">
            <text class="name">{{item.name}}</text>
            <text class="price">¥{{item.price}}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <view class="empty" v-if="showEmpty">
      <text>暂无相关商品</text>
    </view>
  </view>
</template>

<script>
import { 
  searchProducts, 
  getSearchHistory, 
  getHotSearch, 
  addSearchHistory, 
  clearSearchHistory 
} from '@/api/search'
import debounce from '@/utils/debounce'

export default {
  data() {
    return {
      keyword: '',
      searchHistory: [],
      hotSearch: [],
      suggestList: [],
      searchResults: [],
      showResults: false,
      loading: false
    }
  },

  computed: {
    showEmpty() {
      return this.showResults && this.searchResults.length === 0 && !this.loading
    }
  },

  created() {
    // 获取搜索历史和热门搜索
    this.getHistory()
    this.getHotSearch()
  },

  methods: {
    // 处理输入，使用防抖
    handleInput: debounce(async function() {
      if (!this.keyword.trim()) {
        this.suggestList = []
        this.showResults = false
        return
      }

      try {
        const res = await searchProducts(this.keyword.trim(), 1, 5)
        if (res.data) {
          this.suggestList = res.data.map(item => ({
            id: item.id,
            name: item.name
          }))
        }
      } catch (e) {
        console.error('获取搜索建议失败:', e)
      }
    }, 300),

    // 执行搜索
    async handleSearch() {
      if (!this.keyword.trim()) return

      this.loading = true
      this.showResults = true
      this.suggestList = []

      try {
        const res = await searchProducts(this.keyword.trim(), 1, 10)
        if (res.data) {
          this.searchResults = res.data
          // 添加到搜索历史
          this.addToHistory(this.keyword.trim())
        }
      } catch (e) {
        console.error('搜索失败:', e)
        uni.showToast({
          title: '搜索失败',
          icon: 'none'
        })
      } finally {
        this.loading = false
      }
    },

    // 获取搜索历史
    async getHistory() {
      try {
        const res = await getSearchHistory()
        if (res.data) {
          this.searchHistory = res.data
        }
      } catch (e) {
        console.error('获取搜索历史失败:', e)
      }
    },

    // 获取热门搜索
    async getHotSearch() {
      try {
        const res = await getHotSearch()
        if (res.data) {
          this.hotSearch = res.data
        }
      } catch (e) {
        console.error('获取热门搜索失败:', e)
      }
    },

    // 添加到搜索历史
    async addToHistory(keyword) {
      try {
        const res = await addSearchHistory(keyword)
        if (res.code === 0) {
          await this.getHistory()
        }
      } catch (e) {
        console.error('添加搜索历史失败:', e)
      }
    },

    // 清空搜索历史
    async clearHistory() {
      try {
        const res = await clearSearchHistory()
        if (res.code === 0) {
          this.searchHistory = []
          uni.showToast({
            title: '已清空',
            icon: 'success'
          })
        }
      } catch (e) {
        console.error('清空搜索历史失败:', e)
      }
    },

    // 使用历史关键词
    useHistoryKeyword(keyword) {
      this.keyword = keyword
      this.handleSearch()
    },

    // 清空关键词
    clearKeyword() {
      this.keyword = ''
      this.suggestList = []
      this.showResults = false
    },

    // 跳转到商品详情
    goDetail(id) {
      uni.navigateTo({
        url: `/pages/product/detail?id=${id}`
      })
    },

    // 返回
    goBack() {
      uni.navigateBack()
    }
  }
}
</script>

<style lang="scss">
.container {
  min-height: 100vh;
  background: #f8f8f8;
}

.search-box {
  padding: 20rpx 30rpx;
  background: #fff;
  display: flex;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 100;
  
  .input-wrap {
    flex: 1;
    height: 72rpx;
    background: #f5f5f5;
    border-radius: 36rpx;
    display: flex;
    align-items: center;
    padding: 0 20rpx;
    margin-right: 20rpx;
    
    .icon-search {
      font-size: 32rpx;
      color: #999;
      margin-right: 10rpx;
    }
    
    .search-input {
      flex: 1;
      height: 100%;
      font-size: 28rpx;
    }
    
    .clear-icon {
      padding: 0 10rpx;
      color: #999;
      font-size: 32rpx;
    }
  }
  
  .cancel {
    font-size: 28rpx;
    color: #666;
  }
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  
  .title {
    font-size: 28rpx;
    color: #333;
    font-weight: bold;
  }
  
  .clear {
    font-size: 24rpx;
    color: #999;
  }
}

.history-list {
  padding: 0 30rpx;
  
  .history-item {
    display: flex;
    align-items: center;
    padding: 20rpx 0;
    
    .icon-time {
      font-size: 28rpx;
      color: #999;
      margin-right: 10rpx;
    }
    
    .keyword {
      font-size: 28rpx;
      color: #333;
    }
  }
}

.hot-list {
  padding: 0 30rpx;
  display: flex;
  flex-wrap: wrap;
  
  .hot-item {
    padding: 10rpx 30rpx;
    background: #f5f5f5;
    border-radius: 30rpx;
    margin: 0 20rpx 20rpx 0;
    
    .keyword {
      font-size: 24rpx;
      color: #666;
    }
  }
}

.suggest-section {
  background: #fff;
  
  .suggest-item {
    display: flex;
    align-items: center;
    padding: 20rpx 30rpx;
    border-bottom: 1rpx solid #f5f5f5;
    
    .icon-search {
      font-size: 28rpx;
      color: #999;
      margin-right: 10rpx;
    }
    
    .name {
      font-size: 28rpx;
      color: #333;
    }
  }
}

.result-section {
  padding: 20rpx;
  
  .product-list {
    .product-item {
      background: #fff;
      border-radius: 12rpx;
      margin-bottom: 20rpx;
      overflow: hidden;
      
      .product-image {
        width: 100%;
        height: 400rpx;
      }
      
      .product-info {
        padding: 20rpx;
        
        .name {
          font-size: 28rpx;
          color: #333;
          margin-bottom: 10rpx;
        }
        
        .price {
          font-size: 32rpx;
          color: #ff4444;
          font-weight: bold;
        }
      }
    }
  }
}

.empty {
  text-align: center;
  padding: 100rpx 0;
  color: #999;
  font-size: 28rpx;
}
</style> 