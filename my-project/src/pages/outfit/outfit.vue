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
                        <!-- 删除按钮 -->
                        <view class="delete-handle"
                              @tap.stop="deleteClothes(index)">
                            <text class="delete-icon">×</text>
                        </view>
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
            <!-- 添加操作按钮 -->
            <view class="action-buttons">
                <button class="action-btn clear-btn" @click="clearCanvas">清空画布</button>
                <button class="action-btn save-btn" @click="showSaveModal">保存搭配</button>
            </view>
        </view>

        <!-- 下方衣橱区域 - 修改为横向滚动 -->
        <scroll-view scroll-x="true" class="wardrobe-area">
            <view class="clothes-row">
                <view class="clothes-item" 
                      v-for="(item, index) in clothes" 
                      :key="index"
                      @click="addToOutfit(item)">
                    <image :src="item.image" mode="aspectFill"></image>
                </view>
            </view>
        </scroll-view>
        
        <!-- 添加用于生成预览图的canvas -->
        <canvas type="2d" 
                id="previewCanvas"
                class="preview-canvas"
                :style="{
                    width: canvasWidth + 'px',
                    height: canvasHeight + 'px'
                }">
        </canvas>
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
            initialScale: 1,
            showModal: false,
            outfitName: ''
        }
    },
    onLoad(options) {
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
            
            // 如果有传入的搭配数据，加载它
            if (options.outfit) {
                const outfit = JSON.parse(decodeURIComponent(options.outfit));
                this.selectedClothes = outfit.clothes;
                this.outfitName = outfit.name;
            }
        }).exec();
    },
    onShow() {
        // 每次页面显示时重新加载衣服数据
        const storedClothes = uni.getStorageSync('wardrobeClothes');
        if (storedClothes) {
            this.clothes = JSON.parse(storedClothes);
        }
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
        },
        
        // 添加删除方法
        deleteClothes(index) {
            uni.showModal({
                title: '确认删除',
                content: '确定要删除这件衣服吗？',
                success: (res) => {
                    if (res.confirm) {
                        this.selectedClothes.splice(index, 1);
                        this.selectedIndex = -1;
                    }
                }
            });
        },

        // 清空画布
        clearCanvas() {
            this.selectedClothes = [];
            this.selectedIndex = -1;
        },


        // 显示保存模态框
        showSaveModal() {
            uni.showModal({
                title: '保存搭配',
                editable: true,
                placeholderText: '请输入搭配名称',
                success: (res) => {
                    if (res.confirm && res.content) {
                        this.saveOutfit(res.content);
                    }
                }
            });
        },


        // 保存搭配
        saveOutfit(name) {
            if (this.selectedClothes.length === 0) {
                uni.showToast({
                    title: '请先添加衣服到画布',
                    icon: 'none'
                });
                return;
            }
        
            // 获取canvas上下文
            const query = uni.createSelectorQuery().in(this);
            query.select('#previewCanvas')
                .fields({ node: true, size: true })
                .exec((res) => {
                    const canvas = res[0].node;
                    const ctx = canvas.getContext('2d');
                    
                    // 设置canvas尺寸
                    const dpr = uni.getSystemInfoSync().pixelRatio;
                    canvas.width = this.canvasWidth * dpr;
                    canvas.height = this.canvasHeight * dpr;
                    ctx.scale(dpr, dpr);
                    
                    // 绘制背景
                    ctx.fillStyle = '#f8f8f8';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    
                    // 创建绘制Promise数组
                    const drawPromises = this.selectedClothes.map(item => {
                        return new Promise((resolve) => {
                            // 创建离屏canvas中的图片对象
                            const img = canvas.createImage();
                            img.onload = () => {
                                ctx.save();
                                // 设置变换中心点
                                const centerX = item.left + 50;
                                const centerY = item.top + 50;
                                ctx.translate(centerX, centerY);
                                ctx.rotate((item.rotate || 0) * Math.PI / 180);
                                ctx.scale(item.scale || 1, item.scale || 1);
                                ctx.drawImage(img, -50, -50, 100, 100);
                                ctx.restore();
                                resolve();
                            };
                            img.src = item.image;
                        });
                    });
                    
                    // 等待所有图片绘制完成
                    Promise.all(drawPromises).then(() => {
                        // 将canvas转换为图片
                        uni.canvasToTempFilePath({
                            canvas: canvas,
                            success: (res) => {
                                // 构建搭配数据
                                const outfit = {
                                    name: name,
                                    previewImage: res.tempFilePath,
                                    clothes: this.selectedClothes.map(item => ({
                                        image: item.image,
                                        left: item.left,
                                        top: item.top,
                                        rotate: item.rotate || 0,
                                        scale: item.scale || 1
                                    })),
                                    createTime: new Date().getTime()
                                };
                                
                                // 从本地存储获取现有搭配
                                let outfits = uni.getStorageSync('savedOutfits') || [];
                                if (typeof outfits === 'string') {
                                    outfits = JSON.parse(outfits);
                                }
                                
                                // 添加新搭配
                                outfits.push(outfit);
                                
                                // 保存到本地存储
                                uni.setStorageSync('savedOutfits', JSON.stringify(outfits));
                                
                                uni.showToast({
                                    title: '保存成功',
                                    icon: 'success',
                                    success: () => {
                                        // 保存成功后返回上一页
                                        setTimeout(() => {
                                            uni.navigateBack();
                                        }, 1500);
                                    }
                                });
                            },
                            fail: (err) => {
                                console.error('Canvas转图片失败:', err);
                                uni.showToast({
                                    title: '保存失败',
                                    icon: 'none'
                                });
                            }
                        });
                    });
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
    position: fixed;  /* 添加固定定位，防止下拉刷新 */
    top: 0;
    left: 0;
}

.display-area {
    flex: 9;
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
    flex: 1;
    height: 180rpx;  /* 固定高度 */
    background-color: #fff;
    padding: 20rpx;
    white-space: nowrap;  /* 防止换行 */
}

.clothes-row {
    display: inline-flex;  /* 改为内联弹性布局 */
    padding: 10rpx;
    height: 100%;
}

.clothes-item {
    width: 120rpx;  /* 固定宽度 */
    height: 120rpx;  /* 固定高度 */
    margin-right: 20rpx;  /* 右侧间距 */
    border-radius: 10rpx;
    overflow: hidden;
    box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.1);
    flex-shrink: 0;  /* 防止压缩 */
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

.delete-handle {
    position: absolute;
    right: -30rpx;
    top: -30rpx;
    width: 40rpx;
    height: 40rpx;
    background: #ff4444;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: auto;
    color: #fff;
    font-size: 32rpx;
}

.delete-icon {
    font-size: 32rpx;
    line-height: 1;
}

.action-buttons {
    position: absolute;
    bottom: 20rpx;
    left: 0;
    right: 0;
    display: flex;
    justify-content: center;
    gap: 20rpx;
    padding: 0 30rpx;
}

.action-btn {
    padding: 15rpx 30rpx;
    border-radius: 30rpx;
    font-size: 28rpx;
    color: #fff;
}

.clear-btn {
    background-color: #ff4081;
}

.save-btn {
    background-color: #FF80AB;
}

.preview-canvas {
    display: none; /* 隐藏预览canvas */
}
</style>