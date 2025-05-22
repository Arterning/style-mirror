<template>
    <view class="outfit">
        <!-- 上方展示区域 -->
        <view class="display-area">
            <view class="outfit-canvas">
                <!-- 这里将显示被拖拽的衣服 -->
                <view v-for="(item, index) in selectedClothes" 
                      :key="index" 
                      class="draggable-clothes"
                      :class="{'selected': selectedIndex === index}"
                      :style="{ 
                          transform: `translate(${item.left}px, ${item.top}px) rotate(${item.rotate || 0}deg) scale(${item.scale || 1})`
                      }"
                      @touchstart="handleTouchStart($event, index)"
                      @touchmove.prevent="handleDrag($event, index)"
                      @touchend="handleTouchEnd(index)"
                      @click="selectClothes(index)">
                    <image :src="item.image" mode="aspectFit"></image>
                    
                    <!-- 选中时显示的控制框 -->
                    <view v-if="selectedIndex === index" class="control-box">
                        <!-- 旋转控制点 -->
                        <view class="rotate-handle"
                              @touchstart.stop="handleRotateStart($event)"
                              @touchmove.stop.prevent="handleRotate($event)"
                              @touchend.stop="handleRotateEnd">
                            <text class="rotate-icon">⟲</text>
                        </view>
                        <!-- 缩放控制点 -->
                        <view class="scale-handle"
                              @touchstart.stop="handleScaleStart($event)"
                              @touchmove.stop.prevent="handleScale($event)"
                              @touchend.stop="handleScaleEnd">
                            <text class="scale-icon">⤡</text>
                        </view>
                    </view>
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
            canvasHeight: 0,
            selectedIndex: -1,  // 添加选中索引
            rotateStartAngle: 0,
            scaleStartDistance: 0,
            initialRotate: 0,
            initialScale: 1
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
                top: centerY || 50,
                rotate: 0,
                scale: 1
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
        },
        
        // 选择衣服
        selectClothes(index) {
            this.selectedIndex = index;
        },

        // 旋转相关方法
        handleRotateStart(event) {
            const touch = event.touches[0];
            // 直接使用选中衣服的位置和尺寸
            const clothes = this.selectedClothes[this.selectedIndex];
            const rect = {
                left: clothes.left,
                top: clothes.top,
                width: 100,  // 固定宽度
                height: 100  // 固定高度
            };
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            this.rotateStartAngle = Math.atan2(
                touch.clientY - centerY,
                touch.clientX - centerX
            ) * 180 / Math.PI;
            this.initialRotate = clothes.rotate || 0;
        },

        handleRotate(event) {
            if (this.selectedIndex === -1) return;
            const touch = event.touches[0];
            const clothes = this.selectedClothes[this.selectedIndex];
            const rect = {
                left: clothes.left,
                top: clothes.top,
                width: 100,
                height: 100
            };
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const angle = Math.atan2(
                touch.clientY - centerY,
                touch.clientX - centerX
            ) * 180 / Math.PI;
            const deltaAngle = angle - this.rotateStartAngle;
            const newRotate = this.initialRotate + deltaAngle;
            
            this.$set(this.selectedClothes[this.selectedIndex], 'rotate', newRotate);
        },

        handleRotateEnd() {
            this.rotateStartAngle = 0;
        },

        // 缩放相关方法
        handleScaleStart(event) {
            const touch = event.touches[0];
            const clothes = this.selectedClothes[this.selectedIndex];
            const rect = {
                left: clothes.left,
                top: clothes.top,
                width: 100,
                height: 100
            };
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            this.scaleStartDistance = Math.sqrt(
                Math.pow(touch.clientX - centerX, 2) + 
                Math.pow(touch.clientY - centerY, 2)
            );
            this.initialScale = clothes.scale || 1;
        },

        handleScale(event) {
            if (this.selectedIndex === -1) return;
            const touch = event.touches[0];
            const clothes = this.selectedClothes[this.selectedIndex];
            const rect = {
                left: clothes.left,
                top: clothes.top,
                width: 100,
                height: 100
            };
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const currentDistance = Math.sqrt(
                Math.pow(touch.clientX - centerX, 2) + 
                Math.pow(touch.clientY - centerY, 2)
            );
            const scale = this.initialScale * (currentDistance / this.scaleStartDistance);
            
            // 限制缩放范围在0.5到2倍之间
            const boundedScale = Math.max(0.5, Math.min(scale, 2));
            this.$set(this.selectedClothes[this.selectedIndex], 'scale', boundedScale);
        },

        handleScaleEnd() {
            this.scaleStartDistance = 0;
        },

        // 修改添加衣服方法
        addToOutfit(item) {
            // 使用已获取的画布尺寸计算中心位置
            const centerX = (this.canvasWidth - 100) / 2;
            const centerY = (this.canvasHeight - 100) / 2;
            
            this.selectedClothes.push({
                ...item,
                left: centerX || 50, // 如果尺寸未获取到，使用默认值
                top: centerY || 50
            });
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

.wardrobe-area {
    flex: 2;
    background-color: #fff;
    padding: 20rpx;
}

.clothes-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20rpx;
    padding: 10rpx;
}

.clothes-item {
    aspect-ratio: 1;
    border-radius: 10rpx;
    overflow: hidden;
    box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.1);
}

.clothes-item image {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.draggable-clothes {
    position: absolute;
    width: 100px;
    height: 100px;
    z-index: 1;
    touch-action: none;
}

.draggable-clothes.selected {
    z-index: 2;
}

.draggable-clothes image {
    width: 100%;
    height: 100%;
    object-fit: contain;
}

.control-box {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border: 2rpx dashed #FF80AB;
    pointer-events: none;
}

.rotate-handle {
    position: absolute;
    left: -30rpx;
    top: -30rpx;
    width: 40rpx;
    height: 40rpx;
    background: #FF80AB;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: auto;
    color: #fff;
}

.scale-handle {
    position: absolute;
    right: -30rpx;
    bottom: -30rpx;
    width: 40rpx;
    height: 40rpx;
    background: #FF80AB;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: auto;
    color: #fff;
}

.rotate-icon, .scale-icon {
    font-size: 24rpx;
}
</style>