import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button } from "react-native";
import { auth, db } from "../firebaseConfig";
import { collection, doc, setDoc, getDoc } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BarCodeScanner } from "expo-barcode-scanner";

const HomeScreen = ({ navigation }) => {
    const [cid, setCid] = useState("");
    const [studentId, setStudentId] = useState("");
    const [name, setName] = useState("");
    const [scanned, setScanned] = useState(false);

    const handleJoinCourse = async () => {
        const uid = auth.currentUser.uid;
        try {
            await setDoc(doc(db, `classroom/${cid}/students/${uid}`), {
                stdid: studentId,
                name: name,
            });
            await setDoc(doc(db, `users/${uid}/classroom/${cid}`), { status: 2 });
            AsyncStorage.setItem("cid", cid);
            alert("ลงทะเบียนสำเร็จ");
        } catch (error) {
            console.error("Error joining course:", error);
        }
    };

    const handleScan = ({ type, data }) => {
        setScanned(true);
        setCid(data);
    };

    return (
        <View>
            <Text>โปรไฟล์ผู้ใช้</Text>
            <Text>เพิ่มวิชา</Text>
            <TextInput placeholder="รหัสวิชา (CID)" onChangeText={setCid} value={cid} />
            <BarCodeScanner onBarCodeScanned={scanned ? undefined : handleScan} style={{ height: 300, width: "100%" }} />
            <TextInput placeholder="รหัสนักศึกษา" onChangeText={setStudentId} value={studentId} />
            <TextInput placeholder="ชื่อ-สกุล" onChangeText={setName} value={name} />
            <Button title="ลงทะเบียน" onPress={handleJoinCourse} />
        </View>
    );
};

export default HomeScreen;
