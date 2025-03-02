import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity, ActivityIndicator } from 'react-native';
import { db, auth } from '../firebaseConfig';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';

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
            // ตรวจสอบว่ารหัสวิชา (cid) มีอยู่ในระบบหรือไม่
            const classroomRef = doc(db, 'classroom', cid);
            const classroomSnap = await getDoc(classroomRef);
            if (!classroomSnap.exists()) {
                Alert.alert('Error', 'รหัสวิชา (CID) ไม่มีอยู่ในระบบ กรุณาตรวจสอบอีกครั้ง');
                setLoading(false);
                return;
            }

            const studentRef = doc(db, 'classroom', cid, 'students', user.uid);
            const userRef = doc(db, 'users', user.uid, 'classroom', cid);

            // ตรวจสอบว่าลงทะเบียนซ้ำหรือไม่
            const docSnap = await getDoc(studentRef);
            if (docSnap.exists()) {
                Alert.alert('Error', 'คุณลงทะเบียนวิชานี้ไปแล้ว');
                setLoading(false);
                return;
            }

            await setDoc(studentRef, { stdid, name, status: 0 });
            await setDoc(userRef, { status: 2 });

            Alert.alert('Success', 'ลงทะเบียนเข้าห้องเรียนสำเร็จ!');
            navigation.navigate('AddCourse');
            setCid('');
            setStdid('');
            setName('');
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
                placeholderTextColor="#999"
            />
            <TextInput
                style={styles.input}
                placeholder="รหัสนักศึกษา"
                value={stdid}
                onChangeText={setStdid}
                editable={!loading}
                placeholderTextColor="#999"
            />
            <TextInput
                style={styles.input}
                placeholder="ชื่อ - สกุล"
                value={name}
                onChangeText={setName}
                editable={!loading}
                placeholderTextColor="#999"
            />

            <TouchableOpacity
                style={[styles.button, styles.scanButton]}
                onPress={() => navigation.navigate('QRScannerScreen')}
                disabled={loading}
            >
                <Ionicons name="qr-code" size={24} color="#fff" />
                <Text style={styles.buttonText}>สแกน QR Code</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.button, styles.registerButton]}
                onPress={handleRegister}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.buttonText}>ลงทะเบียน</Text>
                )}
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.button, styles.backButton]}
                onPress={() => navigation.navigate('Home')}
                disabled={loading}
            >
                <Ionicons name="arrow-back" size={24} color="#fff" />
                <Text style={styles.buttonText}>ย้อนกลับ</Text>
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
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
    },
    input: {
        width: '80%',
        padding: 12,
        borderWidth: 1,
        borderColor: '#ccc',
        marginBottom: 15,
        borderRadius: 8,
        backgroundColor: '#fff',
        fontSize: 16,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
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
    scanButton: {
        backgroundColor: '#3498db',
    },
    registerButton: {
        backgroundColor: '#27ae60',
    },
    backButton: {
        backgroundColor: '#e74c3c',
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
        marginLeft: 10,
    },
});

export default AddCourseScreen;