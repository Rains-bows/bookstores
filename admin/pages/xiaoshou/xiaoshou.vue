<template>
	<view class="container">
		<!-- 顶部欢迎信息 -->
		<view class="header">
			<view class="welcome">
				<text class="title">欢迎回来</text>
				<text class="username">{{userInfo.username}}</text>
			</view>
			<!-- 退出登录按钮 -->
			<view class="logout-btn" @tap="handleLogout">
				<uni-icons type="logout" size="24" color="#fff"></uni-icons>
				<text>退出登录</text>
			</view>
		</view>
		
		<!-- 功能模块导航 -->
		<view class="nav-grid">
			<view 
				class="nav-item"
				v-for="(item, index) in navList"
				:key="index"
				@tap="handleNavClick(item)"
			>
				<uni-icons 
					:type="item.icon" 
					:color="item.color"
					size="40"
					class="nav-icon"
				></uni-icons>
				<text class="nav-text">{{item.name}}</text>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				userInfo: {
					username: '销售'
				},
				navList: [
					{
						name: '商品管理',
						icon: 'shop',
						color: '#6366f1',
						path: '/pages/product/list'
					},
					{
						name: '订单管理',
						icon: 'cart',
						color: '#3b82f6',
						path: '/pages/order/list'
					},
					{
						name: '分类管理',
						icon: 'folder',
						color: '#10b981',
						path: '/pages/category/list'
					},
					// {
					// 	name: '服务器监控',
					// 	icon: 'server',
					// 	color: '#f59e0b',
					// 	path: '/pages/server/server'
					// },
					// {
					// 	name: 'AI运营助手',
					// 	icon: 'person',
					// 	color: '#ec4899',
					// 	path: '/pages/user/user'
					// },
					// {
					// 	name: '大数据分析',
					// 	icon: 'person',
					// 	color: '#ec4899',
					// 	path: '/pages/userAnalysis/userAnalysis'
					// }
				]
			}
		},
		onLoad() {
			this.checkLogin()
			this.getUserInfo()
		},
		methods: {
			checkLogin() {
				const token = uni.getStorageSync('token')
				const userInfo = uni.getStorageSync('userInfo')
				if (!token || !userInfo) {
					uni.reLaunch({ url: '/pages/login/login' })
				}
			},
			getUserInfo() {
				const userInfo = uni.getStorageSync('userInfo')
				if (userInfo) this.userInfo = userInfo
			},
			handleNavClick(item) {
				uni.navigateTo({ url: item.path })
			},
			handleLogout() {
				uni.showModal({
					title: '提示',
					content: '确定要退出登录吗？',
					success: (res) => {
						if (res.confirm) {
							uni.clearStorageSync()
							uni.reLaunch({ url: '/pages/login/login' })
						}
					}
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.container {
		min-height: 100vh;
		background: #f8fafc;
	}
	
	.header {
		background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
		padding: 80rpx 40rpx 120rpx;
		color: #fff;
		position: relative;
		clip-path: ellipse(120% 100% at 50% 0%);
		
		.welcome {
			max-width: 500rpx;
			.title {
				font-size: 44rpx;
				font-weight: 600;
				margin-bottom: 16rpx;
				position: relative;
				display: inline-block;
				
				&::after {
					content: '';
					position: absolute;
					bottom: -8rpx;
					left: 0;
					width: 50%;
					height: 4rpx;
					background: rgba(255,255,255,0.3);
				}
			}
			
			.username {
				font-size: 32rpx;
				opacity: 0.95;
				display: flex;
				align-items: center;
				font-weight: 300;
				
				&::before {
					content: '👋';
					margin-right: 12rpx;
					filter: drop-shadow(0 2rpx 4rpx rgba(0,0,0,0.1));
				}
			}
		}
		
		.logout-btn {
			position: absolute;
			right: 40rpx;
			top: 50%;
			transform: translateY(-50%);
			display: flex;
			align-items: center;
			gap: 8rpx;
			padding: 20rpx 32rpx;
			background: rgba(255,255,255,0.18);
			border-radius: 999rpx;
			transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
			
			text {
				font-size: 28rpx;
				font-weight: 400;
			}
			
			&:active {
				background: rgba(255,255,255,0.25);
				transform: translateY(-50%) scale(0.95);
			}
		}
	}

	.nav-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(240rpx, 1fr));
		gap: 32rpx;
		padding: 40rpx;
		margin-top: -80rpx;
		position: relative;
		
		.nav-item {
			background: #fff;
			border-radius: 24rpx;
			padding: 48rpx 24rpx;
			text-align: center;
			transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
			box-shadow: 0 8rpx 32rpx rgba(99, 102, 241, 0.08);
			position: relative;
			overflow: hidden;
			
			.nav-icon {
				margin-bottom: 32rpx;
				transition: transform 0.3s ease;
			}
			
			.nav-text {
				font-size: 30rpx;
				color: #1e293b;
				font-weight: 500;
				letter-spacing: 0.5rpx;
			}
			
			&:active {
				transform: scale(0.96);
				box-shadow: 0 4rpx 16rpx rgba(99, 102, 241, 0.1);
			}
		}
	}

	@keyframes float {
		0%, 100% { transform: translateY(0); }
		50% { transform: translateY(-8rpx); }
	}
	.nav-item {
		animation: float 5s ease-in-out infinite;
		&:nth-child(2n) { animation-delay: 0.3s; }
		&:nth-child(3n) { animation-delay: 0.6s; }
	}
</style>