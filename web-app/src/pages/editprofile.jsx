import React, { useEffect, useState } from "react";
import { AppBar, Toolbar, Box, Button, Card, TextField, Typography, Avatar } from "@mui/material";
import { auth, db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

// ดึงค่าจาก .env
const CLOUDINARY_URL = import.meta.env.VITE_CLOUDINARY_URL;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

const EditProfile = () => {
    const user = auth.currentUser;
    const navigate = useNavigate();
    const [userData, setUserData] = useState({ name: "", email: "", photo: "" });
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);

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

    const handleImageChange = (e) => {
        if (e.target.files[0]) {
            const file = e.target.files[0];
            setImage(file);

            // แสดงตัวอย่างรูปที่เลือก
            const imagePreview = URL.createObjectURL(file);
            setUserData((prev) => ({ ...prev, photo: imagePreview }));
        }
    };


    const uploadImageToCloudinary = async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", UPLOAD_PRESET);

        try {
            setLoading(true);
            const response = await fetch(CLOUDINARY_URL, {
                method: "POST",
                body: formData,
            });
            const data = await response.json();
            setLoading(false);
            return data.secure_url;
        } catch (error) {
            console.error("Upload failed:", error);
            setLoading(false);
            return "";
        }
    };

    const handleUpdateProfile = async () => {
        const userRef = doc(db, "users", user.uid);

        let imageUrl = userData.photo;
        if (image) {
            imageUrl = await uploadImageToCloudinary(image);
        }

        await updateDoc(userRef, {
            name: userData.name,
            photo: imageUrl,
        });

        alert("อัปเดตข้อมูลเรียบร้อย!");
        navigate("/dashboard");
    };

    return (
        <Box>

            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                        ระบบจัดการห้องเรียน
                    </Typography>
                    <Button color="inherit" onClick={() => navigate("/dashboard")}>หน้าหลัก</Button>
                </Toolbar>
            </AppBar>
            
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

                    {/* ออกแบบให้ "เพิ่มรูปภาพ" กับปุ่ม Choose File อยู่ใกล้กัน */}
                    <div style={{ display: "flex", alignItems: "center", margin: "10px 0" }}>
                        <Typography variant="body2" color="textSecondary" style={{ marginRight: 10 }}>แก้ไขรูปภาพ</Typography>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            style={{ flex: 1 }}
                        />
                    </div>

                    <Button variant="contained" color="primary" onClick={handleUpdateProfile} style={{ margin: "10px" }}>
                        บันทึก
                    </Button>

                    <Button variant="outlined" color="secondary" onClick={() => navigate("/dashboard")} style={{ margin: "10px" }}>
                        ยกเลิก
                    </Button>
                </Card>
            </div>
        </Box>
    );
};

export default EditProfile;
