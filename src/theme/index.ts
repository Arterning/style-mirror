import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#FF69B4', // 粉红色主题
    background: '#FFFFFF',
    surface: '#FFFFFF',
    accent: '#FF1493',
  },
  dark: false,
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#FF69B4',
    background: '#121212',
    surface: '#121212',
    accent: '#FF1493',
  },
  dark: true,
};