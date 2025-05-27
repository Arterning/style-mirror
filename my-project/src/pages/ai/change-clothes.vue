<template>
    <view class="change-clothes">
        <!-- 上传区域 -->
        <view class="upload-section">
            <!-- 自拍上传 -->
            <view class="upload-area">
                <view class="upload-title">上传自拍照片</view>
                <view class="upload-box" @click="uploadSelfie" v-if="!selfieImage">
                    <text class="iconfont">+</text>
                    <text>点击上传</text>
                </view>
                <image v-else :src="selfieImage" mode="aspectFit" class="preview-image" @click="uploadSelfie"></image>
            </view>
            
            <!-- 衣服上传 -->
            <view class="upload-area">
                <view class="upload-title">上传衣服照片</view>
                <view class="upload-box" @click="uploadClothes" v-if="!clothesImage">
                    <text class="iconfont">+</text>
                    <text>点击上传</text>
                </view>
                <image v-else :src="clothesImage" mode="aspectFit" class="preview-image" @click="uploadClothes"></image>
            </view>
        </view>

        <!-- 生成按钮 -->
        <button class="generate-btn" 
                :disabled="!selfieImage || !clothesImage"
                @click="generateImage">
            生成换装效果
        </button>

        <!-- 结果展示 -->
        <view class="result-section" v-if="resultImage">
            <view class="result-title">换装效果</view>
            <image :src="resultImage" mode="aspectFit" class="result-image"></image>
            <button class="save-btn" @click="saveImage">保存图片</button>
        </view>
    </view>
</template>

<script>
export default {
    data() {
        return {
            selfieImage: '',
            clothesImage: '',
            resultImage: '',
            generating: false
        }
    },
    methods: {
        // 上传自拍照片
        uploadSelfie() {
            uni.chooseImage({
                count: 1,
                success: (res) => {
                    this.selfieImage = res.tempFilePaths[0];
                }
            });
        },
        
        // 上传衣服照片
        uploadClothes() {
            uni.chooseImage({
                count: 1,
                success: (res) => {
                    this.clothesImage = res.tempFilePaths[0];
                }
            });
        },
        
        // 生成换装效果
        generateImage() {
            if (!this.selfieImage || !this.clothesImage) {
                uni.showToast({
                    title: '请先上传照片',
                    icon: 'none'
                });
                return;
            }
            
            if (this.generating) return;
            
            this.generating = true;
            uni.showLoading({
                title: '正在生成...'
            });
            
            // 这里后续添加AI换装API调用
            setTimeout(() => {
                this.generating = false;
                uni.hideLoading();
                // 临时使用上传的衣服图片作为结果
                this.resultImage = this.clothesImage;
            }, 2000);
        },
        
        // 保存结果图片
        saveImage() {
            if (!this.resultImage) return;
            
            uni.saveImageToPhotosAlbum({
                filePath: this.resultImage,
                success: () => {
                    uni.showToast({
                        title: '保存成功',
                        icon: 'success'
                    });
                },
                fail: () => {
                    uni.showToast({
                        title: '保存失败',
                        icon: 'none'
                    });
                }
            });
        }
    }
}
</script>

<style>
.change-clothes {
    padding: 30rpx;
}

.upload-section {
    display: flex;
    justify-content: space-between;
    margin-bottom: 40rpx;
}

.upload-area {
    flex: 1;
    margin: 0 20rpx;
}

.upload-title {
    font-size: 28rpx;
    color: #333;
    margin-bottom: 20rpx;
    text-align: center;
}

.upload-box {
    width: 300rpx;
    height: 400rpx;
    background-color: #f8f8f8;
    border: 2rpx dashed #ddd;
    border-radius: 20rpx;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin: 0 auto;
}

.upload-box text {
    font-size: 28rpx;
    color: #999;
    margin-top: 20rpx;
}

.preview-image {
    width: 300rpx;
    height: 400rpx;
    border-radius: 20rpx;
    margin: 0 auto;
    display: block;
}

.generate-btn {
    width: 80%;
    height: 80rpx;
    line-height: 80rpx;
    background-color: #FF80AB;
    color: #fff;
    border-radius: 40rpx;
    margin: 40rpx auto;
}

.generate-btn[disabled] {
    background-color: #ddd;
    color: #999;
}

.result-section {
    margin-top: 40rpx;
}

.result-title {
    font-size: 28rpx;
    color: #333;
    margin-bottom: 20rpx;
    text-align: center;
}

.result-image {
    width: 100%;
    height: 800rpx;
    border-radius: 20rpx;
}

.save-btn {
    width: 60%;
    height: 80rpx;
    line-height: 80rpx;
    background-color: #FF80AB;
    color: #fff;
    border-radius: 40rpx;
    margin: 40rpx auto;
}
</style>