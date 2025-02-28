import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { db, auth } from '../firebaseConfig';
import { doc, getDoc, setDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';

const AttendanceScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { cid, cno } = route.params || {};
    const [course, setCourse] = useState({ code: '', name: '' });
    const [checkinModalVisible, setCheckinModalVisible] = useState(false);
    const [checkinCode, setCheckinCode] = useState('');
    const [remark, setRemark] = useState(''); // ยังคงใช้ state เดิม แต่ย้าย UI ไปใน Modal
    const [answerText, setAnswerText] = useState('');
    const [questionShow, setQuestionShow] = useState(false);
    const [questionNo, setQuestionNo] = useState('');

    useEffect(() => {
        const fetchCourseData = async () => {
            if (!cid) return;
            const classroomRef = doc(db, `classroom/${cid}`);
            const classroomSnap = await getDoc(classroomRef);
            if (classroomSnap.exists()) {
                const data = classroomSnap.data();
                setCourse({ code: data.code || 'N/A', name: data.name || 'N/A' });
            }
        };
        fetchCourseData();
    }, [cid]);

    useEffect(() => {
        if (!cid || !cno) return;

        const checkinRef = doc(db, `classroom/${cid}/checkin/${cno}`);
        const unsubscribe = onSnapshot(checkinRef, (doc) => {
            if (doc.exists()) {
                const data = doc.data();
                setQuestionShow(data.question_show || false);
                setQuestionNo(data.question_no || '');
            } else {
                setQuestionShow(false);
            }
        }, (error) => {
            console.error("Error listening to question_show:", error);
        });

        return () => unsubscribe();
    }, [cid, cno]);

    const handleCheckin = async () => {
        if (!checkinCode) {
            Alert.alert('Error', 'กรุณากรอกรหัสเช็คชื่อ');
            return;
        }

        try {
            const user = auth.currentUser;
            if (!user) {
                Alert.alert('Error', 'กรุณาเข้าสู่ระบบ');
                return;
            }

            const checkinRef = doc(db, `classroom/${cid}/checkin/${cno}`);
            const checkinSnap = await getDoc(checkinRef);
            if (!checkinSnap.exists() || checkinSnap.data().code !== checkinCode || checkinSnap.data().status !== 1) {
                Alert.alert('Error', 'รหัสเช็คชื่อไม่ถูกต้อง หรือเช็คชื่อไม่ได้เปิด');
                return;
            }

            const studentRef = doc(db, `classroom/${cid}/students/${user.uid}`);
            const studentSnap = await getDoc(studentRef);
            if (!studentSnap.exists()) {
                Alert.alert('Error', 'ไม่พบข้อมูลนักศึกษาในวิชานี้');
                return;
            }

            const { stdid, name } = studentSnap.data();
            const checkinStudentRef = doc(db, `classroom/${cid}/checkin/${cno}/students/${user.uid}`);
            await setDoc(checkinStudentRef, {
                stdid,
                name,
                date: new Date().toISOString(),
                remark: remark || '', // บันทึกหมายเหตุพร้อมการเช็คชื่อ
            });

            Alert.alert('Success', 'เช็คชื่อเข้าเรียนสำเร็จ!');
            setCheckinModalVisible(false);
            setCheckinCode('');
            setRemark(''); // ล้างหมายเหตุหลังบันทึก
        } catch (error) {
            console.error("Error checking in:", error);
            Alert.alert('Error', 'เกิดข้อผิดพลาด: ' + error.message);
        }
    };

    const handleSubmitAnswer = async () => {
        if (!answerText) {
            Alert.alert('Error', 'กรุณากรอกคำตอบ');
            return;
        }

        try {
            const user = auth.currentUser;
            if (!user) {
                Alert.alert('Error', 'กรุณาเข้าสู่ระบบ');
                return;
            }

            const studentRef = doc(db, `classroom/${cid}/students/${user.uid}`);
            const studentSnap = await getDoc(studentRef);
            if (!studentSnap.exists()) {
                Alert.alert('Error', 'ไม่พบข้อมูลนักศึกษา');
                return;
            }
            const { stdid } = studentSnap.data();

            const answerRef = doc(db, `classroom/${cid}/checkin/${cno}/answers/${questionNo}/students/${stdid}`);
            await setDoc(answerRef, {
                text: answerText,
                time: new Date().toISOString(),
            });
            Alert.alert('Success', 'ส่งคำตอบสำเร็จ');
            setAnswerText('');
        } catch (error) {
            console.error("Error submitting answer:", error);
            Alert.alert('Error', 'เกิดข้อผิดพลาด: ' + error.message);
        }
    };

    const handleBackToHome = async () => {
        try {
            await AsyncStorage.setItem('lastAttendance', JSON.stringify({ cid, cno }));
            navigation.navigate('Home');
        } catch (error) {
            console.error("Error saving to AsyncStorage:", error);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>หน้าจอเข้าเรียน</Text>

            <View style={styles.courseInfo}>
                <Text style={styles.courseText}>รหัสวิชา: {course.code}</Text>
                <Text style={styles.courseText}>ชื่อวิชา: {course.name}</Text>
            </View>

            <TouchableOpacity style={styles.checkinButton} onPress={() => setCheckinModalVisible(true)}>
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                <Text style={styles.buttonText}>เช็คชื่อ</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.backButton} onPress={handleBackToHome}>
                <Ionicons name="arrow-back" size={24} color="#fff" />
                <Text style={styles.buttonText}>กลับหน้าหลัก</Text>
            </TouchableOpacity>

            {questionShow && (
                <View style={styles.questionContainer}>
                    <Text style={styles.questionTitle}>ตอบคำถาม (ข้อที่ {questionNo})</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="คำตอบของคุณ"
                        value={answerText}
                        onChangeText={setAnswerText}
                        placeholderTextColor="#999"
                    />
                    <TouchableOpacity style={styles.submitButton} onPress={handleSubmitAnswer}>
                        <Text style={styles.buttonText}>ส่งคำตอบ</Text>
                    </TouchableOpacity>
                </View>
            )}

            <Modal visible={checkinModalVisible} transparent={true} animationType="slide" onRequestClose={() => setCheckinModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>เช็คชื่อเข้าเรียน</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="รหัสเช็คชื่อ"
                            value={checkinCode}
                            onChangeText={setCheckinCode}
                            placeholderTextColor="#999"
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="หมายเหตุ (ถ้ามี)"
                            value={remark}
                            onChangeText={setRemark}
                            placeholderTextColor="#999"
                        />
                        <TouchableOpacity style={styles.modalButton} onPress={handleCheckin}>
                            <Text style={styles.buttonText}>ยืนยัน</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setCheckinModalVisible(false)}>
                            <Text style={styles.buttonText}>ยกเลิก</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
        textAlign: 'center',
    },
    courseInfo: {
        marginBottom: 20,
    },
    courseText: {
        fontSize: 18,
        color: '#333',
        marginBottom: 5,
    },
    input: {
        width: '100%',
        padding: 12,
        borderWidth: 1,
        borderColor: '#ccc',
        marginBottom: 15,
        borderRadius: 8,
        backgroundColor: '#fff',
        fontSize: 16,
    },
    checkinButton: {
        flexDirection: 'row',
        backgroundColor: '#27ae60',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    backButton: {
        flexDirection: 'row',
        backgroundColor: '#e74c3c',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
        marginLeft: 10,
    },
    questionContainer: {
        marginTop: 20,
        padding: 10,
        backgroundColor: '#fff',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 3,
    },
    questionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#333',
    },
    submitButton: {
        backgroundColor: '#27ae60',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '80%',
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
    },
    modalButton: {
        backgroundColor: '#3498db',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        width: '100%',
        alignItems: 'center',
        marginBottom: 10,
    },
    cancelButton: {
        backgroundColor: '#e74c3c',
    },
});

export default AttendanceScreen;