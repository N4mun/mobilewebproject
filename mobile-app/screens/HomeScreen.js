import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { signOut } from '@firebase/auth';
import { auth } from '../firebaseConfig';
import { Ionicons } from '@expo/vector-icons'; // ใช้ไอคอนจาก Expo

const HomeScreen = ({ navigation, user }) => {

    const handleLogout = async () => {
        await signOut(auth);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Welcome, {user?.email}</Text>
            
            <TouchableOpacity
                style={styles.button}
                onPress={() => navigation.navigate('AddCourse')}
            >
                <Ionicons name="add-circle" size={24} color="#fff" />
                <Text style={styles.buttonText}>เพิ่มวิชา</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.button, styles.logoutButton]}
                onPress={handleLogout}
            >
                <Ionicons name="log-out" size={24} color="#fff" />
                <Text style={styles.buttonText}>Logout</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#f5f5f5',
    },
    welcomeImage: {
        width: 150,
        height: 150,
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#3498db',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        marginBottom: 16,
        width: '80%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    logoutButton: {
        backgroundColor: '#e74c3c',
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
        marginLeft: 10,
    },
});

export default HomeScreen;