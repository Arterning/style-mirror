<template>
    <view class="outfit">
        <!-- 上方展示区域 -->
        <view class="display-area">
            <view class="outfit-canvas">
                <!-- 这里将显示被拖拽的衣服 -->
                <view v-for="(item, index) in selectedClothes" 
                      :key="index" 
                      class="draggable-clothes"
                      :style="{ left: item.left + 'px', top: item.top + 'px' }"
                      @touchmove="handleDrag($event, index)"
                      @click="removeClothes(index)">
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
            clothes: [], // 衣橱中的所有衣服
            selectedClothes: [] // 被选中用于搭配的衣服
        }
    },
    onLoad() {
        // 从本地存储加载衣服数据
        const storedClothes = uni.getStorageSync('wardrobeClothes');
        if (storedClothes) {
            this.clothes = JSON.parse(storedClothes);
        }
    },
    methods: {
        // 添加衣服到搭配区
        addToOutfit(item) {
            this.selectedClothes.push({
                ...item,
                left: 50, // 初始位置
                top: 50
            });
        },
        // 处理拖拽
        handleDrag(event, index) {
            const touch = event.touches[0];
            const clothes = this.selectedClothes[index];
            
            // 更新位置
            clothes.left = touch.clientX - 50; // 50是衣服宽度的一半
            clothes.top = touch.clientY - 50;
            
            // 确保不超出边界
            clothes.left = Math.max(0, Math.min(clothes.left, 750 - 100)); // 750是屏幕宽度
            clothes.top = Math.max(0, Math.min(clothes.top, this.displayHeight - 100));
            
            this.$set(this.selectedClothes, index, clothes);
        },
        // 移除已选择的衣服
        removeClothes(index) {
            this.selectedClothes.splice(index, 1);
        }
    }
}
</script>

<style>
.outfit {
    display: flex;
    flex-direction: column;
    height: 100vh;
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