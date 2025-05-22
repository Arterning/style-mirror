<template>
    <view class="outfit-list">
        <!-- 搜索栏 -->
        <view class="search-bar">
            <input type="text" v-model="searchText" placeholder="搜索搭配" @input="searchOutfits"/>
            <text class="iconfont search-icon">&#xe6a4;</text>
        </view>
        
        <!-- 搭配网格 -->
        <scroll-view scroll-y="true" class="outfit-container">
            <view  class="outfit-grid">
                <view class="outfit-card" v-for="(outfit, index) in displayOutfits" :key="index" @click="previewOutfit(outfit)">
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
                </view>
            </view>
        </scroll-view>

        <!-- 创建按钮 -->
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
            outfits: [],
            searchText: '',
            displayOutfits: []
        }
    },
    onLoad() {
        this.loadOutfits();
        this.displayOutfits = this.outfits;
    },
    onShow() {
        this.loadOutfits();
        this.displayOutfits = this.outfits;
    },
    methods: {
        // 加载搭配数据
        loadOutfits() {
            const storedOutfits = uni.getStorageSync('savedOutfits');
            // console.log('加载搭配数据:', storedOutfits);
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
        },
        
        // 创建新搭配
        createOutfit() {
            uni.navigateTo({
                url: '/pages/outfit/outfit'
            });
        },
        
        // 搜索搭配
        searchOutfits() {
            if (!this.searchText) {
                this.displayOutfits = this.outfits;
                return;
            }
            this.displayOutfits = this.outfits.filter(outfit => 
                outfit.name.toLowerCase().includes(this.searchText.toLowerCase())
            );
        },
    }
}
</script>


<style>
.outfit-list {
    flex-direction: column;
    background-color: #f8f8f8;
    height: 100vh;
    width: 100vw;
}

.search-bar {
    background-color: #fff;
    padding: 20rpx 30rpx;
    position: relative;
}

.search-bar input {
    background-color: #f5f5f5;
    border-radius: 30rpx;
    padding: 10rpx 60rpx 10rpx 30rpx;
    font-size: 28rpx;
}

.search-icon {
    position: absolute;
    right: 50rpx;
    top: 50%;
    transform: translateY(-50%);
    color: #999;
}


.outfit-container {
    flex: 1;
    height: calc(100vh - 220rpx);
}

.outfit-grid {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    padding: 10rpx;
}


.outfit-card {
    display: flex;
    flex-direction: column;
    width: calc(50% - 20rpx);
    margin: 10rpx;
    background-color: #fff;
    border-radius: 15rpx;
    overflow: hidden;
    box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.1);
}

.preview-area {
    height: 345rpx;
    position: relative;
    background-color: #f8f8f8;
    overflow: hidden;
}

.outfit-info {
    display: flex;
    justify-content: space-between;
    padding: 15rpx;
}

.outfit-name {
    font-size: 28rpx;
    color: #333;
    margin-bottom: 8rpx;
    display: block;
}

.outfit-date {
    font-size: 24rpx;
    color: #999;
}

.create-btn {
    position: fixed;
    bottom: 40rpx;
    right: 40rpx;
    background-color: #FF80AB;
    width: 120rpx;
    height: 120rpx;
    border-radius: 60rpx;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    color: #fff;
    box-shadow: 0 4rpx 20rpx rgba(255,128,171,0.3);
}

.create-btn text {
    font-size: 24rpx;
}

.create-icon {
    font-size: 40rpx;
    margin-bottom: 5rpx;
}
</style>
