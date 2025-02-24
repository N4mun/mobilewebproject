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

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                // Check AsyncStorage for last attendance data
                AsyncStorage.getItem('lastAttendance')
                    .then((value) => {
                        if (value) {
                            const { cid, cno } = JSON.parse(value);
                            // Navigate to AttendanceScreen with last cid and cno
                            navigationRef.current?.navigate('Attendance', { cid, cno });
                        }
                    })
                    .catch((error) => {
                        console.error("Error reading AsyncStorage:", error);
                    });
            }
        });
        return () => unsubscribe();
    }, []);

    const handleLogout = async () => {
        await signOut(auth);
    };

    // Create a ref to access navigation outside useEffect
    const navigationRef = React.useRef(null);

    return (
        <NavigationContainer ref={navigationRef}>
            <Stack.Navigator>
                {user ? (
                    <>
                        <Stack.Screen name="Home">
                            {(props) => <HomeScreen {...props} user={user} handleLogout={handleLogout} />}
                        </Stack.Screen>
                        <Stack.Screen name="AddCourse">
                            {(props) => <AddCourseScreen {...props} user={user} />}
                        </Stack.Screen>
                        <Stack.Screen name="QRScannerScreen" component={QRScannerScreen} />
                        <Stack.Screen name="Attendance" component={AttendanceScreen} />
                    </>
                ) : (
                    <Stack.Screen name="Auth" component={AuthScreen} />
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default App;