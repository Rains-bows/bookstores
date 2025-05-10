<template>
  <view class="container">
    <!-- 地址列表 -->
    <scroll-view scroll-y class="address-list">
      <view 
        class="address-item" 
        v-for="item in addressList" 
        :key="item.id"
        @click="handleAddressClick(item)"
      >
        <view class="left">
          <text class="iconfont icon-location"></text>
        </view>
        <view class="info">
          <view class="user-info">
            <text class="name">{{item.recipient_name}}</text>
            <text class="phone">{{item.phone}}</text>
            <text class="mt-label primary" v-if="item.isDefault">默认</text>
          </view>
          <view class="address">{{item.address}}</view>
        </view>
        <view class="right">
          <view class="actions">
            <text class="edit" @click.stop="editAddress(item)">编辑</text>
            <text class="delete" @click.stop="handleDelete(item.id)">删除</text>
          </view>
        </view>
      </view>
    </scroll-view>
    
    <!-- 底部添加按钮 -->
    <view class="mt-bottom-btn">
      <button class="mt-btn" @click="showAddressForm">+ 新增收货地址</button>
    </view>
    
    <!-- 地址表单弹窗 -->
    <uni-popup ref="popup" type="bottom">
      <view class="form-container">
        <view class="form-header">
          <text>{{formData.id ? '编辑地址' : '新增地址'}}</text>
          <text class="close" @click="closeForm">关闭</text>
        </view>
        
        <view class="form">
          <view class="form-item">
            <text class="label">收货人</text>
            <input 
              type="text" 
              v-model="formData.recipientName" 
              placeholder="请输入收货人姓名"
            />
          </view>
          
          <view class="form-item">
            <text class="label">手机号码</text>
            <input 
              type="number" 
              v-model="formData.phone" 
              placeholder="请输入手机号码"
            />
          </view>
          
          <view class="form-item">
            <text class="label">所在地区</text>
            <view class="picker" @click="showRegionPicker">
              <text :class="{ placeholder: !formData.province }">
                {{formData.province ? `${formData.province} ${formData.city} ${formData.district}` : '请选择所在地区'}}
              </text>
              <text class="arrow">></text>
            </view>
          </view>
          
          <view class="form-item">
            <text class="label">详细地址</text>
            <textarea 
              v-model="formData.detailAddress" 
              placeholder="请输入详细地址"
            />
          </view>
        </view>
        
        <button class="submit-btn" @click="handleSubmit">保存</button>
      </view>
    </uni-popup>
    
    <!-- 地区选择弹窗 -->
    <uni-popup ref="regionPopup" type="bottom">
      <view class="region-picker">
        <view class="region-header">
          <text class="cancel" @click="closeRegionPicker">取消</text>
          <text class="title">选择地区</text>
          <text class="confirm" @click="confirmRegion">确定</text>
        </view>
        <view class="region-content">
          <!-- 省份列表 -->
          <scroll-view scroll-y class="region-column">
            <view 
              class="region-item"
              v-for="item in provinces"
              :key="item.value"
              :class="{ active: selectedProvince && selectedProvince.value === item.value }"
              @click="selectProvince(item)"
            >
              {{item.label}}
            </view>
          </scroll-view>
          
          <!-- 城市列表 -->
          <scroll-view scroll-y class="region-column">
            <view 
              class="region-item"
              v-for="item in cities"
              :key="item.value"
              :class="{ active: selectedCity && selectedCity.value === item.value }"
              @click="selectCity(item)"
            >
              {{item.label}}
            </view>
          </scroll-view>
          
          <!-- 区县列表 -->
          <scroll-view scroll-y class="region-column">
            <view 
              class="region-item"
              v-for="item in districts"
              :key="item.value"
              :class="{ active: selectedDistrict && selectedDistrict.value === item.value }"
              @click="selectDistrict(item)"
            >
              {{item.label}}
            </view>
          </scroll-view>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script>
import { addAddress, getAddressList, updateAddress, deleteAddress } from '@/api/address'
import { getRegionDataFromCache } from '@/utils/region-data'
import { regionData } from 'element-china-area-data'

export default {
  data() {
    return {
      type: '', // 页面类型：normal-普通模式，select-选择模式
      addressList: [],
      formData: {
        recipientName: '',
        phone: '',
        province: '',
        city: '',
        district: '',
        detailAddress: '',
        user_id: null,
        address: ''
      },
      // 用于存储转换后的地区数据
      provinces: regionData,
      cities: [],
      districts: [],
      selectedProvince: null,
      selectedCity: null,
      selectedDistrict: null
    }
  },
  
  computed: {
    currentList() {
      switch(this.currentTab) {
        case 0:
          return this.provinces
        case 1:
          return this.cities
        case 2:
          return this.districts
        default:
          return []
      }
    }
  },
  
  onShow() {
    this.loadAddressList()
  },
  
  onLoad(options) {
    this.type = options.type || 'normal'
  },
  
  created() {
    const data = getRegionDataFromCache()
    this.provinces = data.provinces
  },
  
  methods: {
    // 加载地址列表
    async loadAddressList() {
      try {
        const userInfo = uni.getStorageSync('userInfo')
        if (!userInfo) {
          uni.showToast({
            title: '请先登录',
            icon: 'none'
          })
          return
        }
        
        const res = await getAddressList(userInfo.id)
        if (res.code === 1) {
          this.addressList = res.data || []
        } else {
          uni.showToast({
            title: res.message || '获取地址列表失败',
            icon: 'none'
          })
        }
      } catch (e) {
        console.error('获取地址列表失败:', e)
        uni.showToast({
          title: '获取地址列表失败',
          icon: 'none'
        })
      }
    },
    
    // 显示地址表单
    showAddressForm() {
      const userInfo = uni.getStorageSync('userInfo')
      if (!userInfo) {
        uni.showToast({
          title: '请先登录',
          icon: 'none'
        })
        return
      }
      
      this.formData = {
        recipientName: '',
        phone: '',
        province: '',
        city: '',
        district: '',
        detailAddress: '',
        user_id: userInfo.id
      }
      // 重置为默认值
      this.provinces = regionData
      this.cities = []
      this.districts = []
      this.selectedProvince = null
      this.selectedCity = null
      this.selectedDistrict = null
      this.$refs.popup.open()
    },
    
    // 关闭表单
    closeForm() {
      // 重置表单和地区选择器
      this.formData = {
        recipientName: '',
        phone: '',
        province: '',
        city: '',
        district: '',
        detailAddress: '',
        user_id: null,
        address: ''
      }
      // 重置为默认值
      this.provinces = regionData
      this.cities = []
      this.districts = []
      this.selectedProvince = null
      this.selectedCity = null
      this.selectedDistrict = null
      this.$refs.popup.close()
    },
    
    // 显示地区选择器
    showRegionPicker() {
      this.$refs.regionPopup.open()
    },
    
    // 关闭地区选择器
    closeRegionPicker() {
      this.$refs.regionPopup.close()
    },
    
    // 选择省份
    selectProvince(province) {
      this.selectedProvince = province
      this.cities = province.children
      this.districts = []
      this.selectedCity = null
      this.selectedDistrict = null
    },
    
    // 选择城市
    selectCity(city) {
      this.selectedCity = city
      this.districts = city.children
      this.selectedDistrict = null
    },
    
    // 选择区县
    selectDistrict(district) {
      this.selectedDistrict = district
    },
    
    // 确认选择
    confirmRegion() {
      if (this.selectedProvince && this.selectedCity && this.selectedDistrict) {
        this.formData.province = this.selectedProvince.label
        this.formData.city = this.selectedCity.label
        this.formData.district = this.selectedDistrict.label
        this.formData.address = `${this.formData.province}${this.formData.city}${this.formData.district}${this.formData.detailAddress || ''}`
        this.closeRegionPicker()
      } else {
        uni.showToast({
          title: '请选择完整的地区信息',
          icon: 'none'
        })
      }
    },
    
    // 提交表单
    async handleSubmit() {
      try {
        if (!this.validateForm()) return
        
        const userInfo = uni.getStorageSync('userInfo')
        if (!userInfo || !userInfo.id) {
          uni.showToast({
            title: '用户信息异常，请重新登录',
            icon: 'none'
          })
          return
        }
        
        // 组合完整地址
        this.formData.address = `${this.formData.province}${this.formData.city}${this.formData.district}${this.formData.detailAddress}`
        
        // 构造提交的数据
        const submitData = {
          user_id: parseInt(userInfo.id),
          address: this.formData.address,
          phone: this.formData.phone,
          recipient_name: this.formData.recipientName
        }
        
        const api = this.formData.id ? updateAddress : addAddress
        const res = await api(submitData)
        
        if (res.code === 1) {
          uni.showToast({
            title: this.formData.id ? '修改成功' : '添加成功',
            icon: 'success'
          })
          this.closeForm()
          this.loadAddressList()
        } else {
          uni.showToast({
            title: res.message || (this.formData.id ? '修改失败' : '添加失败'),
            icon: 'none'
          })
        }
      } catch (e) {
        console.error('保存地址失败:', e)
        uni.showToast({
          title: e.message || '保存失败',
          icon: 'none'
        })
      }
    },
    
    // 表单验证
    validateForm() {
      if (!this.formData.recipientName) {
        uni.showToast({
          title: '请输入收货人姓名',
          icon: 'none'
        })
        return false
      }
      if (!this.formData.phone) {
        uni.showToast({
          title: '请输入手机号码',
          icon: 'none'
        })
        return false
      }
      if (!/^1[3-9]\d{9}$/.test(this.formData.phone)) {
        uni.showToast({
          title: '请输入正确的手机号码',
          icon: 'none'
        })
        return false
      }
      if (!this.formData.province || !this.formData.city || !this.formData.district) {
        uni.showToast({
          title: '请选择所在地区',
          icon: 'none'
        })
        return false
      }
      if (!this.formData.detailAddress) {
        uni.showToast({
          title: '请输入详细地址',
          icon: 'none'
        })
        return false
      }
      return true
    },
    
    // 编辑地址
    editAddress(address, event) {
      // 阻止事件冒泡，防止触发父元素的点击事件
      if (event) {
        event.stopPropagation()
      }
      
      this.formData = { ...address }
      // 设置地区选择器的值
      if (address.province && address.city && address.district) {
        // 找到对应的省份数据
        const province = regionData.find(p => p.label === address.province)
        if (province) {
          this.selectedProvince = province
          this.cities = province.children
          
          // 找到对应的城市数据
          const city = province.children.find(c => c.label === address.city)
          if (city) {
            this.selectedCity = city
            this.districts = city.children
            
            // 找到对应的区县数据
            const district = city.children.find(d => d.label === address.district)
            if (district) {
              this.selectedDistrict = district
            }
          }
        }
      } else {
        // 如果没有地址信息，使用默认值
        this.provinces = regionData
        this.cities = []
        this.districts = []
        this.selectedProvince = null
        this.selectedCity = null
        this.selectedDistrict = null
      }
      this.$refs.popup.open()
    },
    
    // 删除地址
    async handleDelete(id, event) {
      // 阻止事件冒泡，防止触发父元素的点击事件
      if (event) {
        event.stopPropagation()
      }
      
      uni.showModal({
        title: '提示',
        content: '确定要删除该地址吗？',
        success: async (res) => {
          if (res.confirm) {
            try {
              const res = await deleteAddress(id)
              if (res.code === 1) {
                uni.showToast({
                  title: '删除成功',
                  icon: 'success'
                })
                this.loadAddressList()
              } else {
                uni.showToast({
                  title: res.message || '删除失败',
                  icon: 'none'
                })
              }
            } catch (e) {
              console.error('删除地址失败:', e)
              uni.showToast({
                title: '删除失败',
                icon: 'none'
              })
            }
          }
        }
      })
    },
    
    // 修改地址列表项的点击事件
    handleAddressClick(address) {
      if (this.type === 'select') {
        // 在选择模式下，直接返回上一页并传递地址数据
        const eventChannel = this.getOpenerEventChannel()
        eventChannel.emit('selectAddress', {
          type: 'delivery',
          address: {
            recipient_name: address.recipient_name,
            phone: address.phone,
            address: address.address
          }
        })
        uni.navigateBack()
      } else {
        this.editAddress(address)
      }
    },
  }
}
</script>

<style lang="scss">
@import '@/styles/meituan.scss';

.container {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20rpx;
}

.address-list {
  .address-item {
    @extend .mt-section;
    
    .edit {
      color: $mt-orange;
    }
    
    .delete {
      color: $mt-red;
    }
  }
}

.add-btn {
  @extend .mt-btn;
}

.form-container {
  background: #fff;
  border-radius: 24rpx 24rpx 0 0;
  padding: 30rpx;
  
  .form-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30rpx;
    
    text {
      font-size: 32rpx;
      font-weight: bold;
      
      &.close {
        color: #999;
      }
    }
  }
  
  .form {
    .form-item {
      margin-bottom: 30rpx;
      
      .label {
        font-size: 28rpx;
        color: #333;
        margin-bottom: 16rpx;
        display: block;
      }
      
      input, .picker, textarea {
        width: 100%;
        height: 88rpx;
        background: #f8f8f8;
        border-radius: 8rpx;
        padding: 0 20rpx;
        font-size: 28rpx;
      }
      
      textarea {
        height: 160rpx;
        padding: 20rpx;
      }
      
      .picker {
        width: 100%;
        height: 88rpx;
        background: #f8f8f8;
        border-radius: 8rpx;
        padding: 0 20rpx;
        font-size: 28rpx;
        display: flex;
        align-items: center;
        justify-content: space-between;
        
        text {
          color: #333;
          
          &.placeholder {
            color: #999;
          }
          
          &.arrow {
            color: #999;
            font-size: 24rpx;
          }
        }
      }
    }
  }
  
  .submit-btn {
    margin-top: 40rpx;
    height: 88rpx;
    line-height: 88rpx;
    background: #FE8C00;
    color: #fff;
    font-size: 32rpx;
    border-radius: 44rpx;
  }
}

.region-picker {
  background: #fff;
  border-radius: 24rpx 24rpx 0 0;
  overflow: hidden;
  
  .region-header {
    padding: 30rpx;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1rpx solid #eee;
    
    .cancel, .confirm {
      font-size: 28rpx;
      padding: 0 20rpx;
    }
    
    .title {
      font-size: 32rpx;
      font-weight: bold;
    }
    
    .confirm {
      color: #FE8C00;
    }
  }
  
  .region-content {
    display: flex;
    height: 600rpx;
    
    .region-column {
      flex: 1;
      height: 100%;
      border-right: 1rpx solid #eee;
      
      &:last-child {
        border-right: none;
      }
    }
    
    .region-item {
      padding: 30rpx 20rpx;
      font-size: 28rpx;
      color: #333;
      border-bottom: 1rpx solid #eee;
      
      &.active {
        color: #FE8C00;
        background: #FFF5E6;
      }
    }
  }
}
</style>