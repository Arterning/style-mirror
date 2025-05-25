<template>
    <view class="outfit-list">
        <!-- 搜索栏 -->
        <view class="search-bar">
            <input type="text" v-model="searchText" placeholder="搜索搭配" @input="searchOutfits"/>
            <text class="iconfont search-icon">&#xe6a4;</text>
        </view>
        
        <!-- 搭配网格 -->
        <scroll-view scroll-y="true" class="outfit-container">
            <view class="outfit-grid">
                <view class="outfit-card" v-for="(outfit, index) in displayOutfits" :key="index">
                    <view class="image-container">
                        <image :src="outfit.previewImage" mode="aspectFill" class="clothes-image"></image>
                    </view>
                    
                    <!-- 搭配信息和操作按钮 -->
                    <view class="outfit-info">
                        <view>
                            <text class="outfit-name">{{outfit.name}}</text>
                            <text class="outfit-date">{{formatDate(outfit.createTime)}}</text>
                        </view>
                        <view class="outfit-actions">
                            <text class="action-btn edit-btn" @click.stop="editOutfit(outfit)">编辑</text>
                            <text class="action-btn delete-btn" @click.stop="deleteOutfit(index)">删除</text>
                        </view>
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
        
        // 编辑搭配
        editOutfit(outfit) {
            uni.navigateTo({
                url: `/pages/outfit/outfit?outfit=${encodeURIComponent(JSON.stringify(outfit))}`
            });
        },
        
        // 删除搭配
        deleteOutfit(index) {
            uni.showModal({
                title: '确认删除',
                content: '确定要删除这个搭配吗？',
                success: (res) => {
                    if (res.confirm) {
                        this.outfits.splice(index, 1);
                        uni.setStorageSync('savedOutfits', JSON.stringify(this.outfits));
                        this.displayOutfits = this.outfits;
                        uni.showToast({
                            title: '删除成功',
                            icon: 'success'
                        });
                    }
                }
            });
        }
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

.outfit-actions {
    display: flex;
    gap: 20rpx;
}

.action-btn {
    font-size: 24rpx;
    padding: 6rpx 16rpx;
    border-radius: 20rpx;
    color: #fff;
}

.edit-btn {
    background-color: #FF80AB;
}

.delete-btn {
    background-color: #ff4444;
}


.image-container {
    width: 100%;
    padding-bottom: 100%;
    position: relative;
    overflow: hidden;
}

.clothes-image {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
}
</style>
