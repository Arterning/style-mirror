<template>
    <view class="edit-clothes">
        <form @submit="saveClothes">
            <!-- 基本信息 -->
            <view class="form-group">
                <text class="form-label">服装名称</text>
                <input type="text" v-model="clothesInfo.name" placeholder="请输入服装名称"/>
            </view>
            
            <view class="form-group">
                <text class="form-label">分类</text>
                <input type="text" v-model="clothesInfo.categoryName" placeholder="请选择分类"/>
                <!-- <picker :range="categoryOptions" :value="categoryIndex" @change="onCategoryChange">
                    <view class="picker-value">{{clothesInfo.categoryName    || '请选择分类'}}</view>
                </picker> -->
            </view>
            
            <!-- 扩展信息 -->
            <view class="form-group">
                <text class="form-label">购买日期</text>
                <picker mode="date" :value="clothesInfo.purchaseDate" @change="onDateChange">
                    <view class="picker-value">{{clothesInfo.purchaseDate || '请选择日期'}}</view>
                </picker>
            </view>
            
            <view class="form-group">
                <text class="form-label">价格</text>
                <input type="digit" v-model="clothesInfo.price" placeholder="请输入价格"/>
            </view>
            
            <view class="form-group">
                <text class="form-label">购买链接</text>
                <input type="text" v-model="clothesInfo.purchaseLink" placeholder="请输入购买链接"/>
            </view>
            
            <view class="form-group">
                <text class="form-label">洗涤方式</text>
                <textarea v-model="clothesInfo.washingMethod" placeholder="请输入洗涤方式说明"/>
            </view>
            
            <view class="form-group">
                <text class="form-label">状态</text>
                <picker :range="statusOptions" :value="statusIndex" @change="onStatusChange">
                    <view class="picker-value">{{statusOptions[statusIndex]}}</view>
                </picker>
            </view>
            
            <!-- 保存按钮 -->
             <view class="form-group">
                <button class="save-btn" form-type="submit">保存</button>
             </view>
        </form>
    </view>
</template>

<script>
export default {
    data() {
        return {
            clothesInfo: {
                name: '',
                categoryName: '',
                category: '',
                image: '',
                purchaseDate: '',
                price: '',
                purchaseLink: '',
                washingMethod: '',
                status: '已购买'
            },
            statusOptions: ['已购买', '种草', '计划购买'],
            statusIndex: 0,
            categoryOptions: [],
            categoryIndex: 0,
            originalIndex: -1
        }
    },
    onLoad(options) {
        // 获取分类列表
        const storedCategories = uni.getStorageSync('wardrobeCategories') || '[]';
        const customCategories = JSON.parse(storedCategories);
        const presetCategories = [
            { name: '上衣', id: 'tops' },
            { name: '裤子', id: 'pants' },
            { name: '裙子', id: 'dresses' },
            { name: '鞋子', id: 'shoes' }
        ];
        this.categories = [...presetCategories, ...customCategories];
        this.categoryOptions = this.categories.map(c => c.name);

        // 回填数据
        if (options.clothes) {
            const clothes = JSON.parse(decodeURIComponent(options.clothes));
            this.originalIndex = options.index;
            
            // 回填基本信息
            this.clothesInfo = {
                ...clothes,
                categoryName: clothes.categoryName || '',
                purchaseDate: clothes.purchaseDate || '',
                price: clothes.price || '',
                purchaseLink: clothes.purchaseLink || '',
                washingMethod: clothes.washingMethod || '',
                status: clothes.status || '已购买'
            };
            
            // 设置状态索引
            this.statusIndex = this.statusOptions.indexOf(this.clothesInfo.status);
            
            // 设置分类索引
            this.categoryIndex = this.categoryOptions.indexOf(this.clothesInfo.categoryName);
        }
    },
    methods: {
        onDateChange(e) {
            this.clothesInfo.purchaseDate = e.detail.value;
        },
        onStatusChange(e) {
            this.statusIndex = e.detail.value;
            this.clothesInfo.status = this.statusOptions[this.statusIndex];
        },
        saveClothes() {
            const pages = getCurrentPages();
            const prevPage = pages[pages.length - 2];
            
            // 更新上一页的数据
            if (this.originalIndex !== -1) {
                prevPage.$vm.updateClothes(this.originalIndex, this.clothesInfo);
            }
            
            uni.navigateBack();
        },
        
        onCategoryChange(e) {
            this.categoryIndex = e.detail.value;
            const selectedCategory = this.categories[this.categoryIndex];
            this.clothesInfo.categoryName = selectedCategory.name;
            this.clothesInfo.category = selectedCategory.id;
        }
    }
}
</script>

<style>
.edit-clothes {
    padding: 30rpx;
    background-color: #f8f8f8;
    min-height: 100vh;
}

.form-group {
    background-color: #fff;
    padding: 20rpx;
    margin-bottom: 20rpx;
    border-radius: 10rpx;
    display: flex;
    align-items: center;
}

.form-label {
    font-size: 28rpx;
    color: #333;
    width: 160rpx;
    flex-shrink: 0;
}

.form-group input,
.form-group .picker-value {
    flex: 1;
    height: 80rpx;
    line-height: 80rpx;
    font-size: 28rpx;
    color: #333;
    padding: 0 20rpx;
}

.form-group textarea {
    flex: 1;
    height: 160rpx;
    font-size: 28rpx;
    color: #333;
    line-height: 1.5;
    padding: 20rpx;
}

/* 特殊处理带文本框的表单组 */
.form-group:has(textarea) {
    align-items: flex-start;
    padding-top: 30rpx;
}

.save-btn {
    background-color: #FF80AB;
    color: #fff;
    margin-top: 40rpx;
    width: 160rpx;
    height: 88rpx;
    line-height: 88rpx;
    border-radius: 44rpx;
    font-size: 32rpx;
}

/* 输入框和选择器的统一样式 */
input, .picker-value, textarea {
    background-color: #f8f8f8;
    border-radius: 8rpx;
}
</style>