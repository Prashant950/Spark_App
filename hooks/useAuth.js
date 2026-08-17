// // hooks/useAuth.js
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { jwtDecode } from "jwt-decode";
// import { useEffect, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { logout, setCredentials } from "../features/authSlice";

// export default function useAuth() {
//   const { token, role } = useSelector((state) => state.auth);
//   const dispatch = useDispatch();
//   const [loading, setLoading] = useState(true);
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [currentRole, setCurrentRole] = useState(null);

//   useEffect(() => {
//     const checkAuth = async () => {
//       try {
//         let storedToken = token;
//         let storedRole = role;

//         if (!storedToken || !storedRole) {
//           storedToken = await AsyncStorage.getItem("token");
//           storedRole = await AsyncStorage.getItem("role");
//         }

        
//         const storedUserJson = await AsyncStorage.getItem("user");
//         const storedUser = storedUserJson ? JSON.parse(storedUserJson) : null;

//         if ((!token || !role) && (!storedToken || !storedRole)) {
//           dispatch(logout());
//           setIsAuthenticated(false);
//           setLoading(false);
//           return;
//         }

//         let decoded;

//         try {
//           decoded = jwtDecode(storedToken);
//         } catch {
//           dispatch(logout());
//           setIsAuthenticated(false);
//           setLoading(false);
//           return;
//         }

//         const currentTime = Math.floor(Date.now() / 1000);
//         if (decoded.exp && decoded.exp < currentTime) {
//           dispatch(logout());
//           setIsAuthenticated(false);
//           setLoading(false);
//           return;
//         }

//         if (!token || !role) {
//           dispatch(
//             setCredentials({
//               user: storedUser || { role: storedRole },
//               token: storedToken,
//             })
//           );
//         }

//         setIsAuthenticated(true);
//         setCurrentRole(storedRole);
//         setLoading(false);
//       } catch (err) {
//         console.error("Auth check error:", err);
//         dispatch(logout());
//         setIsAuthenticated(false);
//         setLoading(false);
//       }
//     };

//     checkAuth();
//   }, [token, role, dispatch]);

//   return { loading, isAuthenticated, role: currentRole };
// }
import { View, Text } from 'react-native'
import React from 'react'

const useAuth = () => {
  return (
    <View>
      <Text>useAuth</Text>
    </View>
  )
}

export default useAuth