<script>
	export default {
		onLaunch: function() {
			console.log('App Launch')
			// 获取当前页面路径
			const pages = getCurrentPages()
			const currentPage = pages[pages.length - 1]
			const token = uni.getStorageSync('token')
			const adminAuth = uni.getStorageSync('adminAuth')
			const userInfo = uni.getStorageSync('userInfo')
			
			// 需要登录的页面路径列表
			const needLoginPages = [
				'pages/index/index',
				'pages/product/list',
				'pages/product/edit',
				'pages/order/list',
				'pages/order/edit'
			]
			
			// 需要管理员权限的页面
			const adminPages = [
				'pages/product/list',
				'pages/product/edit',
				'pages/category/list',
				'pages/category/edit',
				'pages/category/add'
			]
			
			if (needLoginPages.includes(currentPage?.route) && !token) {
				uni.reLaunch({
					url: '/pages/login/login'
				})
			}
			
			// 加强管理员权限检查
			if (adminPages.includes(currentPage?.route) && 
				(!adminAuth || !token || userInfo?.username !== 'admin')) {
				// 清除所有认证信息
				uni.removeStorageSync('token')
				uni.removeStorageSync('userInfo')
				uni.removeStorageSync('adminAuth')
				uni.showToast({
					title: '无权访问管理功能',
					icon: 'none'
				})
				uni.reLaunch({
					url: '/pages/login/login'
				})
			}
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

<style>
	/*每个页面公共css */
	page {
		background-color: #f5f5f5;
		font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica,
			Segoe UI, Arial, Roboto, 'PingFang SC', 'miui', 'Hiragino Sans GB', 'Microsoft Yahei',
			sans-serif;
	}

	/* 如果使用自定义图标，需要引入iconfont样式 */
	@font-face {
		font-family: 'iconfont';
		src: url('static/iconfont.ttf') format('truetype');
	}

	.iconfont {
		font-family: "iconfont" !important;
		font-style: normal;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
	}
</style>
