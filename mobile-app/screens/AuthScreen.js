import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPhoneNumber } from '@firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';

const AuthScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phoneNumber, setPhoneNumber] = useState(''); // เพิ่ม state สำหรับเบอร์โทร
    const [otp, setOtp] = useState(''); // state สำหรับ OTP
    const [confirmationResult, setConfirmationResult] = useState(null); // เก็บผลการยืนยัน OTP
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [authMethod, setAuthMethod] = useState('email'); // 'email' หรือ 'phone'

    const handleEmailAuth = async () => {
        setLoading(true);
        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
                Alert.alert('Success', 'Signed in successfully!');
            } else {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const uid = userCredential.user.uid;
                await setDoc(doc(db, 'users', uid), {
                    email: userCredential.user.email,
                    createdAt: serverTimestamp(),
                });
                Alert.alert('Success', 'Account created!');
            }
        } catch (error) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handlePhoneAuth = async () => {
        if (!phoneNumber) {
            Alert.alert('Error', 'กรุณากรอกเบอร์โทรศัพท์');
            return;
        }

        setLoading(true);
        try {
            // ต้องใส่รหัสประเทศด้วย เช่น +66 สำหรับประเทศไทย
            const formattedPhoneNumber = phoneNumber.startsWith('+') ? phoneNumber : `+66${phoneNumber.slice(1)}`;
            const confirmation = await signInWithPhoneNumber(auth, formattedPhoneNumber);
            setConfirmationResult(confirmation);
            Alert.alert('Info', 'กรุณากรอกรหัส OTP ที่ได้รับทาง SMS');
        } catch (error) {
            Alert.alert('Error', `เกิดข้อผิดพลาด: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (!otp) {
            Alert.alert('Error', 'กรุณากรอกรหัส OTP');
            return;
        }

        setLoading(true);
        try {
            const result = await confirmationResult.confirm(otp);
            const uid = result.user.uid;
            const userRef = doc(db, 'users', uid);
            const userSnap = await getDoc(userRef);

            if (!userSnap.exists()) {
                await setDoc(userRef, {
                    phoneNumber: result.user.phoneNumber,
                    createdAt: serverTimestamp(),
                });
            }
            Alert.alert('Success', 'เข้าสู่ระบบด้วยเบอร์โทรสำเร็จ!');
            setConfirmationResult(null);
            setOtp('');
            setPhoneNumber('');
        } catch (error) {
            Alert.alert('Error', `รหัส OTP ไม่ถูกต้อง: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{authMethod === 'email' ? (isLogin ? 'Sign In' : 'Sign Up') : 'Sign In with Phone'}</Text>

            {/* ตัวเลือกวิธีการเข้าสู่ระบบ */}
            <View style={styles.authToggle}>
                <TouchableOpacity
                    style={[styles.authOption, authMethod === 'email' && styles.activeOption]}
                    onPress={() => setAuthMethod('email')}
                >
                    <Text style={styles.authOptionText}>Email</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.authOption, authMethod === 'phone' && styles.activeOption]}
                    onPress={() => setAuthMethod('phone')}
                >
                    <Text style={styles.authOptionText}>Phone</Text>
                </TouchableOpacity>
            </View>

            {authMethod === 'email' ? (
                <>
                    <TextInput
                        style={styles.input}
                        value={email}
                        onChangeText={setEmail}
                        placeholder="Email"
                        autoCapitalize="none"
                        placeholderTextColor="#999"
                    />
                    <TextInput
                        style={styles.input}
                        value={password}
                        onChangeText={setPassword}
                        placeholder="Password"
                        secureTextEntry
                        placeholderTextColor="#999"
                    />
                    {loading ? (
                        <ActivityIndicator size="small" color="#3498db" />
                    ) : (
                        <TouchableOpacity
                            style={styles.button}
                            onPress={handleEmailAuth}
                            disabled={loading}
                        >
                            <Text style={styles.buttonText}>{isLogin ? 'Sign In' : 'Sign Up'}</Text>
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity
                        style={styles.toggleButton}
                        onPress={() => setIsLogin(!isLogin)}
                    >
                        <Text style={styles.toggleText}>
                            {isLogin ? 'Need an account? Sign Up' : 'Already have an account? Sign In'}
                        </Text>
                    </TouchableOpacity>
                </>
            ) : (
                <>
                    {!confirmationResult ? (
                        <>
                            <TextInput
                                style={styles.input}
                                value={phoneNumber}
                                onChangeText={setPhoneNumber}
                                placeholder="Phone Number (e.g., 0812345678)"
                                keyboardType="phone-pad"
                                placeholderTextColor="#999"
                            />
                            {loading ? (
                                <ActivityIndicator size="small" color="#3498db" />
                            ) : (
                                <TouchableOpacity
                                    style={styles.button}
                                    onPress={handlePhoneAuth}
                                    disabled={loading}
                                >
                                    <Text style={styles.buttonText}>Send OTP</Text>
                                </TouchableOpacity>
                            )}
                        </>
                    ) : (
                        <>
                            <TextInput
                                style={styles.input}
                                value={otp}
                                onChangeText={setOtp}
                                placeholder="Enter OTP"
                                keyboardType="numeric"
                                placeholderTextColor="#999"
                            />
                            {loading ? (
                                <ActivityIndicator size="small" color="#3498db" />
                            ) : (
                                <TouchableOpacity
                                    style={styles.button}
                                    onPress={handleVerifyOtp}
                                    disabled={loading}
                                >
                                    <Text style={styles.buttonText}>Verify OTP</Text>
                                </TouchableOpacity>
                            )}
                        </>
                    )}
                </>
            )}
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
        width: '80%',
        padding: 12,
        backgroundColor: '#3498db',
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
    },
    toggleButton: {
        marginTop: 20,
    },
    toggleText: {
        color: '#3498db',
        fontSize: 16,
        textAlign: 'center',
    },
    authToggle: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    authOption: {
        padding: 10,
        marginHorizontal: 10,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeOption: {
        borderBottomColor: '#3498db',
    },
    authOptionText: {
        fontSize: 16,
        color: '#333',
    },
});

export default AuthScreen;