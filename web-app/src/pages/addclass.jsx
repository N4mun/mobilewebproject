//addclass.jsx
import React, { useState } from "react";
import { Button, TextField, Card, Typography } from "@mui/material";
import { db, auth } from "../firebase";
import { collection, addDoc, doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const CLOUDINARY_URL = import.meta.env.VITE_CLOUDINARY_URL;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

const AddClass = () => {
    const [className, setClassName] = useState("");
    const [courseCode, setCourseCode] = useState("");
    const [subjectName, setSubjectName] = useState("");
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleImageChange = (e) => {
        if (e.target.files[0]) {
            setImage(e.target.files[0]);
        }
    };

    const uploadImageToCloudinary = async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", UPLOAD_PRESET);

        try {
            const response = await fetch(CLOUDINARY_URL, {
                method: "POST",
                body: formData,
            });
            const data = await response.json();
            return data.secure_url;
        } catch (error) {
            console.error("Upload failed:", error);
            return "";
        }
    };

    const handleCreateClass = async () => {
        if (!className || !courseCode || !subjectName) {
            alert("กรุณากรอกข้อมูลให้ครบถ้วน");
            return;
        }

        setLoading(true);
        let imageUrl = "";
        const user = auth.currentUser;

        if (!user) {
            alert("กรุณาเข้าสู่ระบบก่อน");
            setLoading(false);
            return;
        }

        try {
            if (image) {
                imageUrl = await uploadImageToCloudinary(image);
            }

            const classRef = await addDoc(collection(db, "classroom"), {
                code: courseCode,
                subject: subjectName,
                name: className,
                image: imageUrl,
                owner: user.uid,
                createdAt: new Date(),
            });

            await setDoc(doc(db, "users", user.uid, "classroom", classRef.id), { status: 1 });

            alert("สร้างคลาสสำเร็จ!");
            navigate("/dashboard");
        } catch (error) {
            console.error("Error adding class:", error);
            alert("เกิดข้อผิดพลาดในการสร้างคลาส");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ textAlign: "center", marginTop: "20px" }}>
            <Typography variant="h4">สร้างคลาสใหม่</Typography>
            <Card style={{ maxWidth: 400, margin: "20px auto", padding: "20px" }}>
                <TextField label="รหัสวิชา" value={courseCode} onChange={(e) => setCourseCode(e.target.value)} fullWidth style={{ marginBottom: 10 }} />
                <TextField label="ชื่อวิชา" value={subjectName} onChange={(e) => setSubjectName(e.target.value)} fullWidth style={{ marginBottom: 10 }} />
                <TextField label="ชื่อคลาส" value={className} onChange={(e) => setClassName(e.target.value)} fullWidth style={{ marginBottom: 10 }} />
                
                <div style={{ display: "flex", alignItems: "center", marginBottom: 20 }}>
                    <Typography variant="body2" color="textSecondary" style={{ marginRight: 10 }}>เพิ่มรูปภาพ</Typography>
                    <input type="file" accept="image/*" onChange={handleImageChange} style={{ flex: 1 }} />
                </div>

                <Button variant="contained" color="primary" onClick={handleCreateClass} disabled={loading}>
                    {loading ? "กำลังสร้าง..." : "สร้างคลาส"}
                </Button>
                <Button variant="outlined" color="secondary" onClick={() => navigate("/dashboard")} style={{ margin: "10px" }}>
                                ยกเลิก
                </Button>
            </Card>
        </div>
    );
};

export default AddClass;