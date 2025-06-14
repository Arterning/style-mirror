<template>
	<view class="center">
		<view class="logo" @click="wxLogin" :hover-class="!login ? 'logo-hover' : ''">
			<image class="logo-img" :src="login ? uerInfo.avatarUrl :avatarUrl"></image>
			<view class="logo-title">
				<text class="uer-name">Hi，{{login ? uerInfo.name : '您未登录'}}</text>
				<text class="go-login navigat-arrow" v-if="!login">&#xe65e;</text>
			</view>
		</view>
		<!-- <view class="center-list">
			<view class="center-list-item border-bottom">
				<text class="list-icon">&#xe60c;</text>
				<text class="list-text">收藏图片</text>
				<text class="navigat-arrow">&#xe65e;</text>
			</view>
			<view class="center-list-item">
				<text class="list-icon">&#xe60d;</text>
				<text class="list-text">收藏图集</text>
				<text class="navigat-arrow">&#xe65e;</text>
			</view>
		</view> -->
		<!-- <view class="center-list">
			<view class="center-list-item border-bottom">
				<text class="list-icon">&#xe60b;</text>
				<text class="list-text">管理图片</text>
				<text class="navigat-arrow">&#xe65e;</text>
			</view>
			<view class="center-list-item">
				<text class="list-icon">&#xe61a;</text>
				<text class="list-text">上传图片</text>
				<text class="navigat-arrow">&#xe65e;</text>
			</view>
		</view> -->
		<!-- <view class="center-list">
			<view class="center-list-item border-bottom" @click="goAbout">
				<text class="list-icon">&#xe603;</text>
				<text class="list-text">关于</text>
				<text class="navigat-arrow">&#xe65e;</text>
			</view>
			<view class="center-list-item">
				<text class="list-icon">&#xe609;</text>
				<text class="list-text">账号管理</text>
				<text class="navigat-arrow">&#xe65e;</text>
			</view>
		</view> -->
	</view>
</template>

<script>
	export default {
		data() {
			return {
				login: false,
				avatarUrl: '/static/logo.png',
				uerInfo: {}
			}
		},
		methods: {
			goLogin() {
				if (!this.login) {
					uni.navigateTo({
						url: '/pages/login/login'
					});
				}
			},
			goAbout() {
				uni.navigateTo({
					url: '/pages/about/about'
				});
			},
			wxLogin() {
				uni.login({
					success: (res) => {
						if (res.code) {
							// 发送 res.code 到后台换取 openId, sessionKey, unionId
							// 这里假设你有一个后端接口来处理登录
							// 示例代码，实际需要替换为你的后端接口地址
							uni.request({
								url: 'https://your-api-domain.com/login',
								method: 'POST',
								data: {
									code: res.code
								},
								success: (loginRes) => {
									// 登录成功，获取用户信息
									uni.getUserProfile({
										desc: '用于完善会员资料',
										success: (userRes) => {
											this.login = true;
											this.uerInfo = userRes.userInfo;
										},
										fail: (err) => {
											console.error('获取用户信息失败', err);
										}
									});
								},
								fail: (err) => {
									console.error('登录接口调用失败', err);
								}
							});
						} else {
							console.error('登录失败！' + res.errMsg);
						}
					}
				});
			}
		}
	}
</script>

<style>
</style>
