<template>
    <view class="wardrobe">
        <!-- 搜索栏 -->
        <view class="search-bar">
            <input type="text" v-model="searchText" placeholder="搜索服装" @input="searchClothes"/>
            <text class="iconfont search-icon">&#xe6a4;</text>
        </view>
        
        <!-- 分类栏 -->
        <view class="category-bar">
            <view class="category-item" 
                  v-for="(category, index) in categories" 
                  :key="index" 
                  @click="switchCategory(index)" 
                  :class="{'active': currentCategory === index}">
                {{category.name}}
            </view>
        </view>
        
        <!-- 衣服网格 -->
        <scroll-view scroll-y="true" class="clothes-container">
            <view class="clothes-grid">
                <view class="clothes-card" 
                      v-for="(item, index) in displayClothes" 
                      :key="index" 
                      @click="previewImage(item.image)"
                      @longpress="showActionSheet(index)">
                    <view class="image-container">
                        <image :src="item.image" mode="aspectFill" class="clothes-image"></image>
                    </view>
                    <view class="clothes-info">
                        <text class="clothes-name">{{item.name}}</text>
                        <text class="clothes-category">{{getCategoryName(item.category)}}</text>
                    </view>
                </view>
            </view>
        </scroll-view>

        <!-- 添加按钮 -->
        <view class="add-btn" @click="uploadClothes">
            <text class="iconfont">&#xe61a;</text>
            <text>添加服装</text>
        </view>
    </view>
</template>

<script>
export default {
    data() {
        return {
            categories: [
                { name: '全部', id: 'all' },
                { name: '上衣', id: 'tops' },
                { name: '裤子', id: 'pants' },
                { name: '裙子', id: 'dresses' },
                { name: '鞋子', id: 'shoes' }
            ],
            currentCategory: 0,
            clothes: [],
            currentClothes: [],
            searchText: '',
            displayClothes: []
        }
    },
    onLoad() {
        // 从本地存储加载数据
        this.loadClothesData();
    },
    methods: {
        // 加载本地存储的衣服数据
        loadClothesData() {
            const storedClothes = uni.getStorageSync('wardrobeClothes');
            if (storedClothes) {
                this.clothes = JSON.parse(storedClothes);
                this.currentClothes = this.clothes;
                this.displayClothes = this.clothes;
            }
        },
        // 保存数据到本地存储
        saveClothesData() {
            uni.setStorageSync('wardrobeClothes', JSON.stringify(this.clothes));
        },
        // 切换分类
        switchCategory(index) {
            this.currentCategory = index;
            this.searchText = ''; // 切换分类时清空搜索
            if(index === 0) {
                this.currentClothes = this.clothes;
            } else {
                this.currentClothes = this.clothes.filter(item => 
                    item.category === this.categories[index].id
                );
            }
            this.displayClothes = this.currentClothes;
        },
        // 搜索功能
        searchClothes() {
            if (!this.searchText) {
                this.displayClothes = this.currentClothes;
                return;
            }
            this.displayClothes = this.currentClothes.filter(item => 
                item.name.toLowerCase().includes(this.searchText.toLowerCase())
            );
        },
        // 获取分类名称
        getCategoryName(categoryId) {
            const category = this.categories.find(c => c.id === categoryId);
            return category ? category.name : '';
        },
        // 上传衣服
        uploadClothes() {
            uni.chooseImage({
                count: 1,
                success: (res) => {
                    uni.showModal({
                        title: '添加服装',
                        content: '',
                        editable: true,
                        placeholderText: '请输入服装名称',
                        success: (modalRes) => {
                            if(modalRes.confirm && modalRes.content) {
                                uni.showActionSheet({
                                    itemList: this.categories.slice(1).map(item => item.name),
                                    success: (actionRes) => {
                                        const category = this.categories[actionRes.tapIndex + 1];
                                        const newClothes = {
                                            image: res.tempFilePaths[0],
                                            name: modalRes.content,
                                            category: category.id
                                        };
                                        this.clothes.push(newClothes);
                                        this.saveClothesData(); // 保存到本地存储
                                        this.switchCategory(this.currentCategory);
                                    }
                                });
                            }
                        }
                    });
                }
            });
        },
        // 删除衣服
        deleteClothes(index) {
            uni.showModal({
                title: '删除确认',
                content: '是否确认删除该服装？',
                success: (res) => {
                    if(res.confirm) {
                        this.clothes.splice(index, 1);
                        this.saveClothesData(); // 保存到本地存储
                        this.switchCategory(this.currentCategory);
                    }
                }
            });
        },
        
        // 预览图片
        previewImage(image) {
            uni.previewImage({
                urls: [image],
                current: image
            });
        },
        
        // 显示操作菜单
        showActionSheet(index) {
            uni.showActionSheet({
                itemList: ['修改', '删除'],
                success: (res) => {
                    if (res.tapIndex === 0) {
                        this.editClothes(index);
                    } else if (res.tapIndex === 1) {
                        this.deleteClothes(index);
                    }
                }
            });
        },
        
        // 修改衣服信息
        editClothes(index) {
            const clothes = this.displayClothes[index];
            uni.showModal({
                title: '修改服装',
                content: '',
                editable: true,
                placeholderText: '请输入新的服装名称',
                success: (modalRes) => {
                    if(modalRes.confirm && modalRes.content) {
                        uni.showActionSheet({
                            itemList: this.categories.slice(1).map(item => item.name),
                            success: (actionRes) => {
                                const category = this.categories[actionRes.tapIndex + 1];
                                const clothesIndex = this.clothes.findIndex(item => 
                                    item.image === clothes.image && item.name === clothes.name
                                );
                                if (clothesIndex !== -1) {
                                    this.clothes[clothesIndex] = {
                                        ...clothes,
                                        name: modalRes.content,
                                        category: category.id
                                    };
                                    this.saveClothesData();
                                    this.switchCategory(this.currentCategory);
                                }
                            }
                        });
                    }
                }
            });
        }
    }
}
</script>

<style>
.wardrobe {
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

.category-bar {
    flex-direction: row;
    background-color: #fff;
    padding: 20rpx;
    justify-content: space-around;
    border-bottom: 1rpx solid #eee;
}

.category-item {
    padding: 10rpx 20rpx;
    font-size: 28rpx;
    color: #666;
    border-radius: 20rpx;
}

.category-item.active {
    background-color: #FF80AB;
    color: #fff;
}

.clothes-container {
    flex: 1;
    height: calc(100vh - 220rpx);
}

.clothes-grid {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    padding: 10rpx;
}

.clothes-card {
    display: flex;
    flex-direction: column;
    width: calc(50% - 20rpx);
    margin: 10rpx;
    background-color: #fff;
    border-radius: 15rpx;
    overflow: hidden;
    box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.1);
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

.clothes-info {
    display: flex;
    justify-content: space-between;
    padding: 15rpx;
    background-color: #fff;
}

.clothes-name {
    font-size: 28rpx;
    color: #333;
    margin-bottom: 8rpx;
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.clothes-category {
    font-size: 24rpx;
    color: #999;
    display: block;
}

.add-btn {
    position: fixed;
    bottom: 40rpx;
    right: 40rpx;
    background-color: #FF80AB;
    width: 120rpx;
    height: 120rpx;
    border-radius: 60rpx;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    color: #fff;
    box-shadow: 0 4rpx 20rpx rgba(255,128,171,0.3);
}

.add-btn text {
    font-size: 24rpx;
}

.add-btn .iconfont {
    font-size: 40rpx;
    margin-bottom: 5rpx;
}
</style>