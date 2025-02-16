import React, { useEffect, useState } from "react";
import { Button, Card, TextField, Typography, Avatar } from "@mui/material";
import { auth, db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const EditProfile = () => {
    const user = auth.currentUser;
    const navigate = useNavigate();
    const [userData, setUserData] = useState({ name: "", email: "", photo: "" });

    useEffect(() => {
        if (user) fetchUserData();
    }, [user]);

    const fetchUserData = async () => {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
            setUserData(userSnap.data());
        }
    };

    const handleUpdateProfile = async () => {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, userData);
        alert("อัปเดตข้อมูลเรียบร้อย!");
        navigate("/dashboard");
    };

    return (
        <div style={{ textAlign: "center", marginTop: "20px" }}>
            <Typography variant="h4">แก้ไขข้อมูลส่วนตัว</Typography>

            <Card style={{ maxWidth: 400, margin: "20px auto", padding: "20px" }}>
                <Avatar src={userData.photo} style={{ width: 80, height: 80, margin: "auto" }} />

                <TextField
                    label="ชื่อ"
                    value={userData.name}
                    onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                    fullWidth
                    style={{ margin: "10px 0" }}
                />

                <TextField
                    label="อีเมล"
                    value={userData.email}
                    disabled
                    fullWidth
                    style={{ margin: "10px 0" }}
                />

                <TextField
                    label="URL รูปภาพโปรไฟล์"
                    value={userData.photo}
                    onChange={(e) => setUserData({ ...userData, photo: e.target.value })}
                    fullWidth
                    style={{ margin: "10px 0" }}
                />

                <Button variant="contained" color="primary" onClick={handleUpdateProfile} style={{ margin: "10px" }}>
                    บันทึก
                </Button>

                <Button variant="outlined" color="secondary" onClick={() => navigate("/dashboard")} style={{ margin: "10px" }}>
                    ยกเลิก
                </Button>
            </Card>
        </div>
    );
};

export default EditProfile;
