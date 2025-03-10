import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { onAuthStateChanged, signOut } from '@firebase/auth';
import { auth } from './firebaseConfig';
import AuthScreen from './screens/AuthScreen';
import HomeScreen from './screens/HomeScreen';
import AddCourseScreen from './screens/AddCourseScreen';
import QRScannerScreen from './screens/QRScannerScreen';
import AttendanceScreen from './screens/AttendanceScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Stack = createNativeStackNavigator();

const App = () => {
    const [user, setUser] = useState(null);
    const [initialRoute, setInitialRoute] = useState('Auth'); // ตั้งค่าเริ่มต้นเป็น Auth
    const [initialParams, setInitialParams] = useState(null); // เก็บ params สำหรับ Attendance
    const navigationRef = React.useRef(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                try {
                    const value = await AsyncStorage.getItem('lastAttendance');
                    if (value) {
                        const { cid, cno } = JSON.parse(value);
                        setInitialRoute('Attendance'); // เปลี่ยนเส้นทางเริ่มต้นเป็น Attendance
                        setInitialParams({ cid, cno });
                    } else {
                        setInitialRoute('Home'); // ถ้าไม่มี lastAttendance ไป Home
                        setInitialParams(null);
                    }
                } catch (error) {
                    console.error("Error reading AsyncStorage:", error);
                    setInitialRoute('Home'); // fallback เป็น Home ถ้ามีข้อผิดพลาด
                }
            } else {
                setInitialRoute('Auth'); // ถ้าไม่มี user ไป Auth
                setInitialParams(null);
            }
        });
        return () => unsubscribe();
    }, []);

    const handleLogout = async () => {
        await signOut(auth);
    };

    return (
        <NavigationContainer ref={navigationRef}>
            <Stack.Navigator initialRouteName={initialRoute}>
                {user ? (
                    <>
                        <Stack.Screen name="Home">
                            {(props) => <HomeScreen {...props} user={user} handleLogout={handleLogout} />}
                        </Stack.Screen>
                        <Stack.Screen name="AddCourse">
                            {(props) => <AddCourseScreen {...props} user={user} />}
                        </Stack.Screen>
                        <Stack.Screen name="QRScannerScreen" component={QRScannerScreen} />
                        <Stack.Screen 
                            name="Attendance" 
                            component={AttendanceScreen}
                            initialParams={initialParams} // ส่ง params ไปกับ Attendance
                        />
                    </>
                ) : (
                    <Stack.Screen name="Auth" component={AuthScreen} />
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default App;