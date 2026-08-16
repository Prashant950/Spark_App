 import { createSlice } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";

const memoryStorage = globalThis.__SPARK_MEMORY_STORAGE__ || {};
globalThis.__SPARK_MEMORY_STORAGE__ = memoryStorage;

export const storage = {
  getItem: async (key) => {
    try {
      return await AsyncStorage.getItem(key);
    } catch (_error) {
      console.warn("AsyncStorage unavailable, using memory fallback for:", key);
      return memoryStorage[key] ?? null;
    }
  },
  setItem: async (key, value) => {
    try {
      await AsyncStorage.setItem(key, String(value));
    } catch (_error) {
      console.warn("AsyncStorage unavailable, using memory fallback for:", key);
      memoryStorage[key] = String(value);
    }
  },
  removeItem: async (key) => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (_error) {
      console.warn("AsyncStorage unavailable, clearing memory fallback for:", key);
      delete memoryStorage[key];
    }
  },
};

const initialState = {
  user: null,
  token: null,
  role: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, token } = action.payload;
      console.log("Saving auth token to Redux and storage:", token ? token.slice(0, 20) + "..." : "missing");
      state.user = user;
      state.token = token;
      state.role = user.role;
      storage.setItem("token", token);
      storage.setItem("role", user.role);
      storage.setItem("user", JSON.stringify(user));
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.role = null;
      storage.removeItem("token");
      storage.removeItem("role");
      storage.removeItem("user");
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
