import React, { useState } from "react";
import { Button, TextField, Card, Typography } from "@mui/material";
import { db, auth, storage } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { useNavigate } from "react-router-dom";
import imageCompression from "browser-image-compression";

const AddClass = () => {
    const [className, setClassName] = useState("");
    const [courseCode, setCourseCode] = useState("");  // เพิ่ม State สำหรับรหัสวิชา
    const [subjectName, setSubjectName] = useState(""); // เพิ่ม State สำหรับชื่อวิชา
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleImageChange = (e) => {
        if (e.target.files[0]) {
            setImage(e.target.files[0]);
        }
    };

    const handleCreateClass = async () => {
        if (!className || !courseCode || !subjectName) {
            alert("กรุณากรอกข้อมูลให้ครบถ้วน");
            return;
        }

        setLoading(true);

        try {
            let imageUrl = "";

            // อัปโหลดรูปไปที่ Firebase Storage ถ้ามีไฟล์
            if (image) {
                const imageRef = ref(storage, `class-images/${image.name}`);
                const uploadTask = uploadBytesResumable(imageRef, image);

                await uploadTask;
                imageUrl = await getDownloadURL(imageRef);
            }

            // บันทึกข้อมูลคลาสลง Firestore
            await addDoc(collection(db, "classroom"), {
                code: courseCode,
                subject: subjectName,
                name: className,
                image: imageUrl, // บันทึก URL ของรูปภาพ
                owner: auth.currentUser.uid,
                createdAt: new Date(),
            });

            alert("สร้างคลาสสำเร็จ!");
            navigate("/dashboard"); // กลับไปหน้าหลัก
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
                <TextField
                    label="รหัสวิชา"
                    value={courseCode}
                    onChange={(e) => setCourseCode(e.target.value)}
                    fullWidth
                    style={{ marginBottom: 10 }}
                />

                <TextField
                    label="ชื่อวิชา"
                    value={subjectName}
                    onChange={(e) => setSubjectName(e.target.value)}
                    fullWidth
                    style={{ marginBottom: 10 }}
                />

                <TextField
                    label="ชื่อคลาส"
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                    fullWidth
                    style={{ marginBottom: 10 }}
                />

                <input  type="file" accept="image/*" onChange={handleImageChange} style={{ marginBottom: 10 }} />

                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleCreateClass}
                    disabled={loading}
                >
                    {loading ? "กำลังสร้าง..." : "สร้างคลาส"}
                </Button>
            </Card>
        </div>
    );
};

export default AddClass;
