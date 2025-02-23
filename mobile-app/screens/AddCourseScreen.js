import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, TextInput, Alert } from 'react-native';
import { db, auth } from '../firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';

const AddCourseScreen = ({ navigation }) => {
    const [cid, setCid] = useState('');
    const [stdid, setStdid] = useState('');
    const [name, setName] = useState('');

    const handleRegister = async () => {
        const user = auth.currentUser;
        if (!user) {
            Alert.alert('Error', 'กรุณาเข้าสู่ระบบก่อน');
            return;
        }
        if (!cid || !stdid || !name) {
            Alert.alert('Error', 'กรุณากรอกรหัสวิชา, รหัสนักศึกษา และชื่อ');
            return;
        }
        try {
            const studentRef = doc(db, 'classroom', cid, 'students', user.uid);
            const userRef = doc(db, 'users', user.uid, 'classroom', cid);

            await setDoc(studentRef, { stdid, name });
            await setDoc(userRef, { status: 2 });

            Alert.alert('Success', 'ลงทะเบียนเข้าห้องเรียนสำเร็จ!');
            navigation.goBack();
        } catch (error) {
            Alert.alert('Error', 'ไม่สามารถลงทะเบียนได้: ' + error.message);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>เพิ่มวิชา</Text>
            <TextInput style={styles.input} placeholder="รหัสวิชา (CID)" value={cid} onChangeText={setCid} />
            <TextInput style={styles.input} placeholder="รหัสนักศึกษา" value={stdid} onChangeText={setStdid} />
            <TextInput style={styles.input} placeholder="ชื่อ - สกุล" value={name} onChangeText={setName} />

            <Button title="ลงทะเบียน" onPress={handleRegister} />
            <Button title="ย้อนกลับ" onPress={() => navigation.goBack()} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16, backgroundColor: '#fff' },
    title: { fontSize: 24, marginBottom: 16 },
    input: { width: '80%', padding: 10, borderWidth: 1, borderColor: '#ccc', marginBottom: 10, borderRadius: 5 }
});

export default AddCourseScreen;
