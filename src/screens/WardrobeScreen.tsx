import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Button, FAB, Portal, Modal } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ClothingItem {
  id: string;
  imageUri: string;
  category: string;
  createdAt: string;
}

const WardrobeScreen = () => {
  const [clothes, setClothes] = useState<ClothingItem[]>([]);
  const [visible, setVisible] = useState(false);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ClothingItem | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const categories = ['上衣', '裤子', '裙子', '鞋子', '包包', '配饰', '未分类'];

  // 添加 useEffect 钩子来加载保存的数据
  useEffect(() => {
    loadClothesFromStorage();
  }, []);

  // 添加加载数据的函数
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

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      alert('需要相册权限才能选择照片！');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      // 这里可以调用AI服务进行衣物识别和背景去除
      // 暂时先直接保存原图
      const newItem: ClothingItem = {
        id: Date.now().toString(),
        imageUri: result.assets[0].uri,
        category: '未分类',
        createdAt: new Date().toISOString(),
      };

      const updatedClothes = [...clothes, newItem];
      setClothes(updatedClothes);
      saveClothesToStorage(updatedClothes);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      alert('需要相机权限才能拍照！');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      const newItem: ClothingItem = {
        id: Date.now().toString(),
        imageUri: result.assets[0].uri,
        category: '未分类',
        createdAt: new Date().toISOString(),
      };

      const updatedClothes = [...clothes, newItem];
      setClothes(updatedClothes);
      saveClothesToStorage(updatedClothes);
    }
  };

  const saveClothesToStorage = async (clothesData: ClothingItem[]) => {
    try {
      await AsyncStorage.setItem('wardrobe', JSON.stringify(clothesData));
    } catch (error) {
      console.error('保存衣物数据失败:', error);
    }
  };

  const handleLongPress = (item: ClothingItem) => {
    setSelectedItem(item);
    setCategoryModalVisible(true);
  };

  const updateCategory = (newCategory: string) => {
    if (selectedItem) {
      const updatedClothes = clothes.map(item =>
        item.id === selectedItem.id
          ? { ...item, category: newCategory }
          : item
      );
      setClothes(updatedClothes);
      saveClothesToStorage(updatedClothes);
      setCategoryModalVisible(false);
      setSelectedItem(null);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.clothesList}>
        <View style={styles.grid}>
          {clothes.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.clothItem}
              onLongPress={() => handleLongPress(item)}
            >
              <Image
                source={{ uri: item.imageUri }}
                style={styles.clothImage}
                resizeMode="cover"
              />
              <Text style={styles.category}>{item.category}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <Portal>
        {/* 原有的添加衣物模态框 */}
        <Modal
          visible={visible}
          onDismiss={() => setVisible(false)}
          contentContainerStyle={styles.modal}
        >
          <Button mode="contained" onPress={takePhoto} style={styles.modalButton}>
            拍照
          </Button>
          <Button mode="contained" onPress={pickImage} style={styles.modalButton}>
            从相册选择
          </Button>
          <Button mode="outlined" onPress={() => setVisible(false)}>
            取消
          </Button>
        </Modal>

        {/* 新增的分类选择模态框 */}
        <Modal
          visible={categoryModalVisible}
          onDismiss={() => setCategoryModalVisible(false)}
          contentContainerStyle={styles.modal}
        >
          {categories.map((category) => (
            <Button
              key={category}
              mode="outlined"
              onPress={() => updateCategory(category)}
              style={styles.modalButton}
            >
              {category}
            </Button>
          ))}
          <Button
            mode="contained"
            onPress={() => setCategoryModalVisible(false)}
            style={styles.modalButton}
          >
            取消
          </Button>
        </Modal>
      </Portal>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => setVisible(true)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  clothesList: {
    flex: 1,
    padding: 10,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  clothItem: {
    width: '48%',
    marginBottom: 10,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
  },
  clothImage: {
    width: '100%',
    height: 150,
  },
  category: {
    padding: 8,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  modal: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  modalButton: {
    marginBottom: 10,
  },
});

export default WardrobeScreen;