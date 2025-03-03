import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import { signOut } from '@firebase/auth';
import { auth, db } from '../firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import { collection, doc, getDoc, onSnapshot, deleteDoc } from 'firebase/firestore';

const HomeScreen = ({ navigation, user }) => {
    const [courses, setCourses] = useState([]);

    useEffect(() => {
        if (!user) return;

        const userCoursesRef = collection(db, `users/${user.uid}/classroom`);
        const unsubscribeCourses = onSnapshot(userCoursesRef, (querySnapshot) => {
            const unsubscribes = []; // เก็บ unsubscribes สำหรับ student และ checkin

            // ดึง cid ทั้งหมดที่ยังอยู่ใน users/${user.uid}/classroom
            const courseIds = querySnapshot.docs.map(doc => doc.id);

            // ลบ courses ที่ไม่อยู่ใน querySnapshot ออก
            setCourses(prevCourses => prevCourses.filter(course => courseIds.includes(course.cid)));

            // ฟังข้อมูลสำหรับ cid แต่ละตัว
            querySnapshot.docs.forEach(docSnapshot => {
                const cid = docSnapshot.id;

                const classroomRef = doc(db, `classroom/${cid}`);
                getDoc(classroomRef).then(classroomSnap => {
                    if (!classroomSnap.exists()) {
                        // ถ้า classroom/${cid} ไม่อยู่ ลบออกจาก users/${user.uid}/classroom
                        deleteDoc(doc(db, `users/${user.uid}/classroom`, cid));
                        return;
                    }
                    const classroomData = classroomSnap.data();

                    const studentRef = doc(db, `classroom/${cid}/students/${user.uid}`);
                    const unsubscribeStudent = onSnapshot(studentRef, (studentSnap) => {
                        if (studentSnap.exists() && studentSnap.data().status === 1) {
                            setCourses(prevCourses => {
                                const existingCourse = prevCourses.find(course => course.cid === cid);
                                if (!existingCourse) {
                                    return [
                                        ...prevCourses,
                                        {
                                            cid,
                                            code: classroomData.code || 'N/A',
                                            subject: classroomData.subject || 'N/A',
                                            name: classroomData.name || 'N/A',
                                            activeCheckins: [],
                                        }
                                    ].sort((a, b) => a.cid.localeCompare(b.cid));
                                }
                                return prevCourses;
                            });

                            const checkinRef = collection(db, `classroom/${cid}/checkin`);
                            const unsubscribeCheckin = onSnapshot(checkinRef, (checkinSnap) => {
                                const activeCheckins = checkinSnap.docs
                                    .map(doc => ({ id: doc.id, ...doc.data() }))
                                    .filter(checkin => checkin.status === 1);

                                setCourses(prevCourses => {
                                    return prevCourses.map(course => 
                                        course.cid === cid 
                                            ? { ...course, activeCheckins }
                                            : course
                                    );
                                });
                            });

                            unsubscribes.push(unsubscribeCheckin);
                        } else {
                            setCourses(prevCourses => prevCourses.filter(course => course.cid !== cid));
                        }
                    });

                    unsubscribes.push(unsubscribeStudent);
                });
            });

            // Cleanup subscriptions เมื่อ component unmount
            return () => {
                unsubscribes.forEach(unsubscribe => unsubscribe());
            };
        }, (error) => {
            console.error("Error fetching user courses:", error);
        });

        return () => unsubscribeCourses();
    }, [user]);

    const handleLogout = async () => {
        await signOut(auth);
    };

    const handleAttend = (cid) => {
        const activeCheckin = courses.find(course => course.cid === cid)?.activeCheckins[0];
        if (activeCheckin) {
            navigation.navigate('Attendance', { cid, cno: activeCheckin.id });
        } else {
            Alert.alert('Error', 'ไม่มีรายการเช็คชื่อที่เปิดอยู่สำหรับวิชานี้');
        }
    };

    const renderCourseItem = ({ item }) => (
        <View style={styles.courseItem}>
            <View style={styles.courseDetails}>
                <Text style={styles.courseText}>รหัส: {item.code}</Text>
                <Text style={styles.courseText}>วิชา: {item.subject}</Text>
                <Text style={styles.courseText}>ชื่อ: {item.name}</Text>
            </View>
            <TouchableOpacity
                style={[
                    styles.attendButton,
                    { opacity: item.activeCheckins.length > 0 ? 1 : 0.5 }
                ]}
                onPress={() => handleAttend(item.cid)}
                disabled={item.activeCheckins.length === 0}
            >
                <Ionicons name="school" size={20} color="#fff" />
                <Text style={styles.buttonText}>เข้าเรียน</Text>
            </TouchableOpacity>
        </View>
    );

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

            <Text style={styles.subtitle}>วิชาที่ลงทะเบียน</Text>
            {courses.length > 0 ? (
                <FlatList
                    data={courses}
                    renderItem={renderCourseItem}
                    keyExtractor={(item) => item.cid}
                    style={styles.courseList}
                />
            ) : (
                <Text style={styles.noCourses}>ยังไม่มีวิชาที่ลงทะเบียนและยืนยัน</Text>
            )}

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
    subtitle: {
        fontSize: 20,
        fontWeight: '600',
        marginVertical: 10,
        color: '#333',
        textAlign: 'center',
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
        alignSelf: 'center',
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
    courseList: {
        flex: 1,
        width: '100%',
    },
    courseItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
        backgroundColor: '#fff',
        borderRadius: 8,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 3,
    },
    courseDetails: {
        flex: 1,
    },
    courseText: {
        fontSize: 16,
        color: '#333',
        marginBottom: 4,
    },
    attendButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2ecc71',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 6,
    },
    noCourses: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 20,
    },
});

export default HomeScreen;