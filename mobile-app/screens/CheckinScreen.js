import React, { useState } from "react";
import { View, Text, TextInput, Button } from "react-native";
import { auth, db } from "../firebaseConfig";
import { doc, setDoc, Timestamp } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

const CheckinScreen = () => {
    const [cno, setCno] = useState("");
    const [code, setCode] = useState("");

    const handleCheckin = async () => {
        const uid = auth.currentUser.uid;
        const cid = await AsyncStorage.getItem("cid");

        if (!cid || !cno || !code) {
            alert("กรุณากรอกข้อมูลให้ครบถ้วน");
            return;
        }

        try {
            await setDoc(doc(db, `classroom/${cid}/checkin/${cno}/students/${uid}`), {
                stdid: "รหัสนักศึกษา",
                name: "ชื่อ-สกุล",
                date: Timestamp.now(),
            });
            alert("เช็คชื่อสำเร็จ");
        } catch (error) {
            console.error("Error checking in:", error);
        }
    };

    return (
        <View>
            <Text>เช็คชื่อเข้าเรียน</Text>
            <TextInput placeholder="ลำดับ (CNO)" onChangeText={setCno} value={cno} />
            <TextInput placeholder="รหัสเข้าเรียน (Code)" onChangeText={setCode} value={code} />
            <Button title="เช็คชื่อ" onPress={handleCheckin} />
        </View>
    );
};

export default CheckinScreen;
