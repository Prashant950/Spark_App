// config.js
import { Platform } from 'react-native';

let BACKEND_IP = '10.216.76.157';
let BACKEND_PORT = '5000';

if (Platform.OS !== 'web') {
  // Only import @env on native
  try {
  } catch (e) {
    console.warn('@env not found, using defaults : ', e);
  }
}

//const BACKEND_URL = `http://${BACKEND_IP}:${BACKEND_PORT}`;

const BACKEND_URL = 'https://spark-dating-app-backend.onrender.com';

export { BACKEND_IP, BACKEND_PORT, BACKEND_URL };

