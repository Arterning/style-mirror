import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Text, Button, Portal, Modal } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  GestureHandlerRootView,
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  useAnimatedGestureHandler,
} from 'react-native-reanimated';

interface ClothingItem {
  id: string;
  imageUri: string;
  category: string;
  createdAt: string;
}

interface DraggableItemProps {
  item: ClothingItem;
  index: number;
}

const DraggableItem: React.FC<DraggableItemProps> = ({ item, index }) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const panGestureEvent = useAnimatedGestureHandler<PanGestureHandlerGestureEvent>({
    onStart: (_, context: any) => {
      context.translateX = translateX.value;
      context.translateY = translateY.value;
    },
    onActive: (event, context: any) => {
      translateX.value = context.translateX + event.translationX;
      translateY.value = context.translateY + event.translationY;
    },
    onEnd: () => {
      // 可以添加边界检查等逻辑
    },
  });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
      ],
    };
  });

  return (
    <PanGestureHandler onGestureEvent={panGestureEvent}>
      <Animated.View style={[styles.canvasItem, animatedStyle]}>
        <Image
          source={{ uri: item.imageUri }}
          style={styles.canvasImage}
          resizeMode="contain"
        />
      </Animated.View>
    </PanGestureHandler>
  );
};

const OutfitsScreen = () => {
  const [clothes, setClothes] = useState<ClothingItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('未分类');
  const [selectedItems, setSelectedItems] = useState<ClothingItem[]>([]);
  
  // 加载衣橱数据
  useEffect(() => {
    loadClothesFromStorage();
  }, []);

  const loadClothesFromStorage = async () => {
    try {
      const savedClothes = await AsyncStorage.getItem('wardrobe');
      if (savedClothes) {
        setClothes(JSON.parse(savedClothes));
      }
    } catch (error) {
      console.error('加载衣物数据失败:', error);
    }
  };

  // 分类列表
  const categories = ['上衣', '裤子', '裙子', '鞋子', '包包', '配饰', '未分类'];

  // 添加衣物到画布
  const addItemToCanvas = (item: ClothingItem) => {
    setSelectedItems([...selectedItems, item]);
  };

  // 渲染分类选择器
  const renderCategories = () => (
    <ScrollView horizontal style={styles.categoryScroll}>
      {categories.map((category) => (
        <TouchableOpacity
          key={category}
          onPress={() => setSelectedCategory(category)}
          style={[
            styles.categoryButton,
            selectedCategory === category && styles.selectedCategory,
          ]}
        >
          <Text style={selectedCategory === category ? styles.selectedCategoryText : styles.categoryText}>
            {category}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  // 渲染衣物列表
  const renderClothingList = () => (
    <ScrollView horizontal style={styles.clothingScroll}>
      {clothes
        .filter((item) => item.category === selectedCategory)
        .map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.clothingItem}
            onPress={() => addItemToCanvas(item)}
          >
            <Image
              source={{ uri: item.imageUri }}
              style={styles.clothingImage}
              resizeMode="contain"
            />
          </TouchableOpacity>
        ))}
    </ScrollView>
  );

  // 渲染画布
  // 修改渲染画布的函数
  const renderCanvas = () => (
    <View style={styles.canvas}>
      {selectedItems.map((item, index) => (
        <DraggableItem key={`${item.id}-${index}`} item={item} index={index} />
      ))}
    </View>
  );

  return (
    <GestureHandlerRootView style={styles.container}>
      {renderCanvas()}
      <View style={styles.bottomPanel}>
        {renderCategories()}
        {renderClothingList()}
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  canvas: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    margin: 10,
    borderRadius: 8,
  },
  bottomPanel: {
    height: 200,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  categoryScroll: {
    height: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  categoryButton: {
    padding: 10,
    marginHorizontal: 5,
    height: 40,
    justifyContent: 'center',
    borderRadius: 20,
    marginTop: 5,
  },
  selectedCategory: {
    backgroundColor: '#FF69B4',
  },
  categoryText: {
    color: '#666',
  },
  selectedCategoryText: {
    color: '#fff',
  },
  clothingScroll: {
    padding: 10,
  },
  clothingItem: {
    width: 100,
    height: 100,
    marginRight: 10,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
  },
  clothingImage: {
    width: '100%',
    height: '100%',
  },
  canvasItem: {
    position: 'absolute',
    width: 150,
    height: 150,
  },
  canvasImage: {
    width: '100%',
    height: '100%',
  },
});

export default OutfitsScreen;