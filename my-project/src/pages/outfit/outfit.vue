<template>
    <view class="outfit">
        <!-- 上方展示区域 -->
        <view class="display-area">
            <view class="outfit-canvas">
                <!-- 这里将显示被拖拽的衣服 -->
                <view v-for="(item, index) in selectedClothes" 
                      :key="index" 
                      class="draggable-clothes"
                      :style="{ transform: `translate(${item.left}px, ${item.top}px)` }"
                      @touchstart="handleTouchStart($event, index)"
                      @touchmove.prevent="handleDrag($event, index)"
                      @touchend="handleTouchEnd(index)">
                    <image :src="item.image" mode="aspectFit"></image>
                </view>
            </view>
        </view>

        <!-- 下方衣橱区域 -->
        <scroll-view scroll-y="true" class="wardrobe-area">
            <view class="clothes-grid">
                <view class="clothes-item" 
                      v-for="(item, index) in clothes" 
                      :key="index"
                      @click="addToOutfit(item)">
                    <image :src="item.image" mode="aspectFill"></image>
                </view>
            </view>
        </scroll-view>
    </view>
</template>

<script>
export default {
    data() {
        return {
            clothes: [],
            selectedClothes: [],
            isDragging: false,
            startX: 0,
            startY: 0,
            initialLeft: 0,
            initialTop: 0,
            canvasWidth: 0,
            canvasHeight: 0
        }
    },
    onLoad() {
        // 从本地存储加载衣服数据
        const storedClothes = uni.getStorageSync('wardrobeClothes');
        if (storedClothes) {
            this.clothes = JSON.parse(storedClothes);
        }
        
        // 获取展示区域的尺寸
        const query = uni.createSelectorQuery();
        query.select('.display-area').boundingClientRect(data => {
            this.canvasWidth = data.width;
            this.canvasHeight = data.height;
        }).exec();
    },
    methods: {
        // 添加衣服到搭配区
        addToOutfit(item) {
            // 使用已获取的画布尺寸计算中心位置
            const centerX = (this.canvasWidth - 100) / 2;
            const centerY = (this.canvasHeight - 100) / 2;
            
            this.selectedClothes.push({
                ...item,
                left: centerX || 50, // 如果尺寸未获取到，使用默认值
                top: centerY || 50
            });
        },
        
        handleTouchStart(event, index) {
            const touch = event.touches[0];
            this.isDragging = true;
            this.startX = touch.clientX;
            this.startY = touch.clientY;
            this.initialLeft = this.selectedClothes[index].left;
            this.initialTop = this.selectedClothes[index].top;
        },

        handleDrag(event, index) {
            if (!this.isDragging) return;
            
            const touch = event.touches[0];
            const deltaX = touch.clientX - this.startX;
            const deltaY = touch.clientY - this.startY;
            
            const newLeft = this.initialLeft + deltaX;
            const newTop = this.initialTop + deltaY;
            
            // 使用已获取的画布尺寸限制范围
            const maxX = this.canvasWidth - 100;
            const maxY = this.canvasHeight - 100;
            
            // 限制拖动范围
            const boundedLeft = Math.max(0, Math.min(newLeft, maxX));
            const boundedTop = Math.max(0, Math.min(newTop, maxY));
            
            // 更新位置
            this.$set(this.selectedClothes[index], 'left', boundedLeft);
            this.$set(this.selectedClothes[index], 'top', boundedTop);
        },

        handleTouchEnd(index) {
            this.isDragging = false;
        }
    }
}
</script>

<style>
.outfit {
    display: flex;
    flex-direction: column;
    height: 100vh;
    width: 100%;
}

.display-area {
    flex: 3;
    background-color: #f8f8f8;
    position: relative;
    overflow: hidden;
}

.outfit-canvas {
    width: 100%;
    height: 100%;
    position: relative;
}

.draggable-clothes {
    position: absolute;
    width: 100px;
    height: 100px;
    z-index: 1;
    touch-action: none; /* 防止浏览器默认的触摸行为 */
    will-change: transform; /* 优化性能 */
}

.draggable-clothes image {
    width: 100%;
    height: 100%;
    object-fit: contain;
}

.wardrobe-area {
    flex: 1;
    background-color: #fff;
    padding: 20rpx;
}

.clothes-grid {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
}

.clothes-item {
    width: 150rpx;
    height: 150rpx;
    margin: 10rpx;
    border-radius: 10rpx;
    overflow: hidden;
    background-color: #f5f5f5;
}

.clothes-item image {
    width: 100%;
    height: 100%;
    object-fit: cover;
}
</style>