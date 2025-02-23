import React, { useState, useEffect } from 'react';
import { View, Text, Button, TextInput, StyleSheet, Alert } from 'react-native';
import { db, auth } from '../firebaseConfig';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const AddCourseScreen = ({ navigation, route }) => {
    const [cid, setCid] = useState('');
    const [stdid, setStdid] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);

    // รับข้อมูลจาก QR Scanner
    useEffect(() => {
        if (route.params?.scannedData) {
            setCid(route.params.scannedData);
        }
    }, [route.params?.scannedData]);

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

        setLoading(true);
        try {
            const studentRef = doc(db, 'classroom', cid, 'students', user.uid);
            const userRef = doc(db, 'users', user.uid, 'classroom', cid);

            // ตรวจสอบว่าลงทะเบียนซ้ำหรือไม่
            const docSnap = await getDoc(studentRef);
            if (docSnap.exists()) {
                Alert.alert('Error', 'คุณลงทะเบียนวิชานี้ไปแล้ว');
                return;
            }

            await setDoc(studentRef, { stdid, name, status: 0 });
            await setDoc(userRef, { status: 2 });

            Alert.alert('Success', 'ลงทะเบียนเข้าห้องเรียนสำเร็จ!');
            navigation.goBack();
        } catch (error) {
            Alert.alert('Error', 'ไม่สามารถลงทะเบียนได้: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>เพิ่มวิชา</Text>
            <TextInput
                style={styles.input}
                placeholder="รหัสวิชา (CID)"
                value={cid}
                onChangeText={setCid}
                editable={!loading}
            />
            <TextInput
                style={styles.input}
                placeholder="รหัสนักศึกษา"
                value={stdid}
                onChangeText={setStdid}
                editable={!loading}
            />
            <TextInput
                style={styles.input}
                placeholder="ชื่อ - สกุล"
                value={name}
                onChangeText={setName}
                editable={!loading}
            />

            <Button
                title="สแกน QR Code"
                onPress={() => navigation.navigate('QRScannerScreen')}
                disabled={loading}
            />
            <Button
                title="ลงทะเบียน"
                onPress={handleRegister}
                disabled={loading}
            />
            <Button
                title="ย้อนกลับ"
                onPress={() => navigation.goBack()}
                disabled={loading}
            />
            {loading && <Text>กำลังดำเนินการ...</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16, backgroundColor: '#fff' },
    title: { fontSize: 24, marginBottom: 16 },
    input: { width: '80%', padding: 10, borderWidth: 1, borderColor: '#ccc', marginBottom: 10, borderRadius: 5 },
});

export default AddCourseScreen;