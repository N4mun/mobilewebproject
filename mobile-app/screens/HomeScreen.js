import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { signOut } from '@firebase/auth';
import { auth } from '../firebaseConfig';
const HomeScreen = ({ navigation, user }) => {

    const handleLogout = async () => {
        await signOut(auth);
    };
    
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Welcome</Text>
            <Text style={styles.emailText}>{user?.email}</Text>
            <Button title="เพิ่มวิชา" onPress={() => navigation.navigate('AddCourse')} />
            <Button title="Logout" onPress={handleLogout} color="#e74c3c" />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16, backgroundColor: '#fff' },
    title: { fontSize: 24, marginBottom: 16 },
    emailText: { fontSize: 18, marginBottom: 20 }

});

export default HomeScreen;
