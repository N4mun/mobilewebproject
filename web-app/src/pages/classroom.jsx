import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { doc, getDoc, collection, addDoc, getDocs, updateDoc } from "firebase/firestore";
import { QRCodeCanvas } from "qrcode.react";
import { Button, Card, CardContent, CardMedia, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Box } from "@mui/material";

const ClassroomPage = () => {
    const { cid } = useParams();
    const navigate = useNavigate();
    const [classroom, setClassroom] = useState(null);
    const [students, setStudents] = useState([]);
    const [checkins, setCheckins] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch classroom
                const classRef = doc(db, "classroom", cid);
                const classSnap = await getDoc(classRef);
                if (classSnap.exists()) {
                    setClassroom(classSnap.data());
                } else {
                    console.error("Classroom not found");
                }

                // Fetch students
                const studentsRef = collection(db, `classroom/${cid}/students`);
                const studentSnap = await getDocs(studentsRef);
                setStudents(studentSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

                // Fetch checkins
                const checkinRef = collection(db, `classroom/${cid}/checkin`);
                const checkinSnap = await getDocs(checkinRef);
                setCheckins(checkinSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [cid]);

    const handleAddCheckin = async () => {
        try {
            await addDoc(collection(db, `classroom/${cid}/checkin`), {
                timestamp: new Date(),
                status: "กำลังเรียน"
            });
            // รีเฟรชข้อมูล checkins
            const checkinRef = collection(db, `classroom/${cid}/checkin`);
            const checkinSnap = await getDocs(checkinRef);
            setCheckins(checkinSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (error) {
            console.error("Error adding checkin:", error);
        }
    };

    const handleVerifyStudent = async (studentId) => {
        try {
            const studentRef = doc(db, `classroom/${cid}/students`, studentId);
            await updateDoc(studentRef, { status: 1 });
            setStudents(students.map(student =>
                student.id === studentId ? { ...student, status: 1 } : student
            ));
        } catch (error) {
            console.error("Error verifying student:", error);
        }
    };

    if (loading) return <Typography>Loading...</Typography>;

    return (
        <Box sx={{ textAlign: "center", mt: 3, px: 2 }}>
            {classroom && (
                <Card sx={{ maxWidth: 600, mx: "auto", p: 3, textAlign: "center", boxShadow: 3 }}>
                    <CardMedia
                        component="img"
                        sx={{ height: 200 }}
                        image={classroom.image || "https://via.placeholder.com/600"}
                        alt={classroom.name}
                    />
                    <CardContent>
                        <Typography variant="h5">{classroom.code} - {classroom.name}</Typography>
                        <QRCodeCanvas value={cid} size={128} style={{ marginTop: 10 }} />
                    </CardContent>
                </Card>
            )}

            <Typography variant="h5" sx={{ mt: 4 }}>รายชื่อนักเรียน</Typography>
            <TableContainer component={Paper} sx={{ mt: 2 }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>ลำดับ</TableCell>
                            <TableCell>รหัส</TableCell>
                            <TableCell>ชื่อ</TableCell>
                            <TableCell>สถานะ</TableCell>
                            <TableCell>ดำเนินการ</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {students.map((student, index) => (
                            <TableRow key={student.id}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>{student.stdid}</TableCell>
                                <TableCell>{student.name}</TableCell>
                                <TableCell>{student.status === 0 ? "ยังไม่ตรวจสอบ" : "ตรวจสอบแล้ว"}</TableCell>
                                <TableCell>
                                    {student.status === 0 && (
                                        <Button
                                            variant="contained"
                                            color="secondary"
                                            onClick={() => handleVerifyStudent(student.id)}
                                        >
                                            ยืนยัน
                                        </Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Button
                variant="contained"
                color="primary"
                sx={{ mt: 3 }}
                onClick={handleAddCheckin}
            >
                เพิ่มการเช็คชื่อ
            </Button>
        </Box>
    );
};

export default ClassroomPage;