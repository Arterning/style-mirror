<template>
    <view class="outfit-list">
        <!-- 顶部标题 -->
        <view class="header">
            <text class="title">我的搭配</text>
        </view>
        
        <!-- 搭配列表 -->
        <scroll-view scroll-y="true" class="outfit-grid">
            <view class="outfit-card" v-for="(outfit, index) in outfits" :key="index" @click="previewOutfit(outfit)">
                <!-- 搭配预览区域 -->
                <view class="preview-area">
                    <view class="clothes-preview" v-for="(item, clothesIndex) in outfit.clothes" 
                          :key="clothesIndex"
                          :style="{
                              transform: `translate(${item.left}px, ${item.top}px) rotate(${item.rotate || 0}deg) scale(${item.scale || 1})`,
                              zIndex: clothesIndex
                          }">
                        <image :src="item.image" mode="aspectFit"></image>
                    </view>
                </view>
                
                <!-- 搭配信息 -->
                <view class="outfit-info">
                    <text class="outfit-name">{{outfit.name}}</text>
                    <text class="outfit-date">{{formatDate(outfit.createTime)}}</text>
                </view>
                
                <!-- 删除按钮 -->
                <view class="delete-btn" @click.stop="deleteOutfit(index)">
                    <text class="delete-icon">×</text>
                </view>
            </view>
        </scroll-view>
        
        <!-- 空状态提示 -->
        <view class="empty-state" v-if="outfits.length === 0">
            <text>还没有保存的搭配哦~</text>
        </view>

        <!-- 创建按钮 - 移到固定位置 -->
        <view class="create-btn" @click="createOutfit">
            <text class="create-icon">+</text>
            <text>创建搭配</text>
        </view>
    </view>
</template>

<script>
export default {
    data() {
        return {
            outfits: []
        }
    },
    onLoad() {
        // 加载搭配数据
        this.loadOutfits();
    },
    onShow() {
        // 每次页面显示时重新加载数据
        this.loadOutfits();
    },
    methods: {
        // 加载搭配数据
        loadOutfits() {
            const storedOutfits = uni.getStorageSync('savedOutfits');
            console.log('加载搭配数据:', storedOutfits);
            if (storedOutfits) {
                this.outfits = JSON.parse(storedOutfits);
                // 按创建时间倒序排序
                this.outfits.sort((a, b) => b.createTime - a.createTime);
            }
        },
        
        // 格式化日期
        formatDate(timestamp) {
            const date = new Date(timestamp);
            return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        },
        
        // 预览搭配
        previewOutfit(outfit) {
            // 创建预览弹窗
            const previewContent = document.createElement('div');
            previewContent.className = 'preview-modal';
            
            // 创建预览内容
            const previewArea = document.createElement('div');
            previewArea.className = 'preview-content';
            
            // 添加关闭按钮
            const closeBtn = document.createElement('div');
            closeBtn.className = 'preview-close';
            closeBtn.innerHTML = '×';
            closeBtn.onclick = () => {
                document.body.removeChild(previewContent);
            };
            
            // 添加搭配名称
            const titleDiv = document.createElement('div');
            titleDiv.className = 'preview-title';
            titleDiv.textContent = outfit.name;
            
            previewArea.appendChild(closeBtn);
            previewArea.appendChild(titleDiv);
            previewContent.appendChild(previewArea);
            document.body.appendChild(previewContent);
            
            // 渲染衣服
            outfit.clothes.forEach(item => {
                const clothesDiv = document.createElement('div');
                clothesDiv.className = 'preview-clothes';
                clothesDiv.style.transform = `translate(${item.left}px, ${item.top}px) rotate(${item.rotate || 0}deg) scale(${item.scale || 1})`;
                
                const img = document.createElement('img');
                img.src = item.image;
                img.style.width = '100%';
                img.style.height = '100%';
                img.style.objectFit = 'contain';
                
                clothesDiv.appendChild(img);
                previewArea.appendChild(clothesDiv);
            });
        }
    }
}
</script>

<style>
.outfit-list {
    min-height: 100vh;
    background-color: #f8f8f8;
    padding: 20rpx;
    width: 100%;
    box-sizing: border-box;
}

.header {
    padding: 20rpx 0;
    margin-bottom: 20rpx;
    width: 100%;
}

.title {
    font-size: 36rpx;
    font-weight: bold;
    color: #333;
    display: block;
}

.outfit-grid {
    width: 100%;
    height: calc(100vh - 180rpx);
    padding-bottom: 120rpx;
}

.outfit-card {
    width: 100%;
    margin-bottom: 20rpx;
    background-color: #fff;
    border-radius: 20rpx;
    overflow: hidden;
    position: relative;
    box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.1);
}

.preview-area {
    height: 400rpx;
    position: relative;
    background-color: #f8f8f8;
    overflow: hidden;
}

.clothes-preview {
    position: absolute;
    width: 100rpx;
    height: 100rpx;
}

.clothes-preview image {
    width: 100%;
    height: 100%;
    object-fit: contain;
}

.outfit-info {
    padding: 20rpx;
}

.outfit-name {
    font-size: 32rpx;
    color: #333;
    margin-bottom: 10rpx;
    display: block;
}

.outfit-date {
    font-size: 24rpx;
    color: #999;
}

.delete-btn {
    position: absolute;
    top: 20rpx;
    right: 20rpx;
    width: 40rpx;
    height: 40rpx;
    background-color: rgba(0,0,0,0.5);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
}

.delete-icon {
    font-size: 32rpx;
    line-height: 1;
}

.empty-state {
    height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #999;
    font-size: 28rpx;
}

.create-btn {
    position: fixed;
    bottom: 40rpx;
    right: 40rpx;
    background-color: #FF80AB;
    width: auto;
    height: 80rpx;
    border-radius: 40rpx;
    display: flex;
    align-items: center;
    padding: 0 30rpx;
    color: #fff;
    font-size: 28rpx;
    box-shadow: 0 4rpx 10rpx rgba(255,128,171,0.3);
    z-index: 100;
}

.create-icon {
    font-size: 40rpx;
    margin-right: 10rpx;
}

/* 预览模态框样式 */
.preview-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0,0,0,0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.preview-content {
    width: 90%;
    height: 90%;
    background-color: #fff;
    border-radius: 20rpx;
    position: relative;
    padding: 20rpx;
}

.preview-close {
    position: absolute;
    top: 20rpx;
    right: 20rpx;
    width: 60rpx;
    height: 60rpx;
    background-color: rgba(0,0,0,0.5);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 40rpx;
    cursor: pointer;
}

.preview-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
    margin: 20rpx 0;
    text-align: center;
}

.preview-clothes {
    position: absolute;
    width: 100rpx;
    height: 100rpx;
}
</style>