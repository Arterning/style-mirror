import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Image, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { Text, Button } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ClothingItem {
  id: string;
  imageUri: string;
  category: string;
  createdAt: string;
  position?: {
    x: number;
    y: number;
  };
}

const DraggableItem: React.FC<{
  item: ClothingItem;
  index: number;
  onPositionChange: (id: string, x: number, y: number) => void;
}> = ({ item, index, onPositionChange }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = (e: any) => {
    setIsDragging(true);
    const startX = e.pageX - (item.position?.x || 0);
    const startY = e.pageY - (item.position?.y || 0);

    const handleMouseMove = (e: any) => {
      const x = e.pageX - startX;
      const y = e.pageY - startY;
      onPositionChange(item.id, x, y);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <View
      style={[
        styles.canvasItem,
        {
          left: item.position?.x || 0,
          top: item.position?.y || 0,
          cursor: isDragging ? 'grabbing' : 'grab',
        },
      ]}
      onTouchStart={handleMouseDown}
      onMouseDown={handleMouseDown}
    >
      <Image
        source={{ uri: item.imageUri }}
        style={styles.canvasImage}
        resizeMode="contain"
      />
    </View>
  );
};

const OutfitsScreen = () => {
  const [clothes, setClothes] = useState<ClothingItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('未分类');
  const [selectedItems, setSelectedItems] = useState<ClothingItem[]>([]);

  useEffect(() => {
    loadClothesFromStorage();
  }, []);

  const handlePositionChange = (id: string, x: number, y: number) => {
    setSelectedItems(items =>
      items.map(item =>
        item.id === id ? { ...item, position: { x, y } } : item
      )
    );
  };

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
    setSelectedItems([
      ...selectedItems,
      { ...item, position: { x: 0, y: 0 } }
    ]);
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
        <DraggableItem
          key={`${item.id}-${index}`}
          item={item}
          index={index}
          onPositionChange={handlePositionChange}
        />
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      {renderCanvas()}
      <View style={styles.bottomPanel}>
        {renderCategories()}
        {renderClothingList()}
      </View>
    </View>
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
    zIndex: 1,
  },
  canvasImage: {
    width: '100%',
    height: '100%',
  },
});

export default OutfitsScreen;