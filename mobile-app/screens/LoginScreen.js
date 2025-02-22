// LoginScreen.js
import React, { useState } from "react";
import { View, TextInput, Button, Alert, TouchableOpacity, Text } from "react-native";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPhoneNumber } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import { useNavigation } from '@react-navigation/native';
import { firebaseApp, db } from "../firebaseConfig";

const auth = getAuth(firebaseApp);

const LoginScreen = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState("");
    const [confirmResult, setConfirmResult] = useState(null);
    const [isPhoneLogin, setIsPhoneLogin] = useState(false);
    const navigation = useNavigation(); // ใช้สำหรับ navigate ไปหน้า Home

    // ฟังก์ชันบันทึกข้อมูล User ใน Firestore
    const saveUserToFirestore = async (user, extraData = {}) => {
        const userRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(userRef);

        if (!docSnap.exists()) {
            await setDoc(userRef, {
                uid: user.uid,
                email: user.email || null,
                phone: user.phoneNumber || null,
                createdAt: new Date(),
                status: 2,
                ...extraData
            });
        }
    };

    // สมัครสมาชิกใหม่
    const handleSignUp = async () => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            await saveUserToFirestore(user);
            Alert.alert("Success", "Account created successfully!");
            navigation.replace("Home"); // ไปหน้า Home หลังจากล็อกอินสำเร็จ
        } catch (error) {
            Alert.alert("Signup Failed", error.message);
        }
    };

    // ล็อกอินด้วย Email/Password
    const handleSignIn = async () => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            await saveUserToFirestore(user);
            Alert.alert("Success", "Login successful!");
            navigation.replace("Home"); // ไปหน้า Home หลังจากล็อกอินสำเร็จ
        } catch (error) {
            Alert.alert("Login Failed", error.message);
        }
    };

    // ส่ง OTP ไปยังหมายเลขโทรศัพท์
    const handleSendOtp = async () => {
        try {
            const confirmation = await signInWithPhoneNumber(auth, phone);
            setConfirmResult(confirmation);
            Alert.alert("OTP Sent", "Please enter the OTP sent to your phone");
        } catch (error) {
            Alert.alert("Error", error.message);
        }
    };

    // ยืนยัน OTP และล็อกอิน
    const handleVerifyOtp = async () => {
        try {
            if (confirmResult) {
                const userCredential = await confirmResult.confirm(otp);
                const user = userCredential.user;
                await saveUserToFirestore(user);
                Alert.alert("Success", "Phone login successful!");
                navigation.replace("Home"); // ไปหน้า Home หลังจากล็อกอินสำเร็จ
            }
        } catch (error) {
            Alert.alert("OTP Verification Failed", error.message);
        }
    };

    return (
        <View>
            {isPhoneLogin ? (
                <View>
                    <TextInput placeholder="Phone Number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
                    <Button title="Send OTP" onPress={handleSendOtp} />
                    <TextInput placeholder="Enter OTP" value={otp} onChangeText={setOtp} keyboardType="numeric" />
                    <Button title="Verify OTP" onPress={handleVerifyOtp} />
                </View>
            ) : (
                <View>
                    <TextInput placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
                    <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
                    <Button title="Sign Up" onPress={handleSignUp} />
                    <Button title="Sign In" onPress={handleSignIn} />
                </View>
            )}
            <TouchableOpacity onPress={() => setIsPhoneLogin(!isPhoneLogin)}>
                <Text style={{ color: "blue", textAlign: "center", marginTop: 10 }}>
                    {isPhoneLogin ? "Use Email/Password Login" : "Use Phone OTP Login"}
                </Text>
            </TouchableOpacity>
        </View>
    );
};

export default LoginScreen;
