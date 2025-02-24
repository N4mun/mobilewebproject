import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { doc, getDoc, collection, addDoc, getDocs, updateDoc, deleteDoc } from "firebase/firestore";
import { QRCodeCanvas } from "qrcode.react";
import { AppBar, Toolbar, Typography, Button, Card, CardContent, CardMedia, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Box } from "@mui/material";

const ClassroomPage = () => {
    const { cid } = useParams();
    const navigate = useNavigate();
    const [classroom, setClassroom] = useState(null);
    const [students, setStudents] = useState([]);
    const [checkins, setCheckins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showTable, setShowTable] = useState(false);
    const [showQRCode, setShowQRCode] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const classRef = doc(db, "classroom", cid);
                const classSnap = await getDoc(classRef);
                if (classSnap.exists()) {
                    setClassroom(classSnap.data());
                } else {
                    console.error("Classroom not found");
                }

                const studentsRef = collection(db, `classroom/${cid}/students`);
                const studentSnap = await getDocs(studentsRef);
                setStudents(studentSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

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

    const handleVerifyStudent = async (studentId) => {
        try {
            const studentRef = doc(db, `classroom/${cid}/students`, studentId);
            await updateDoc(studentRef, { status: 1 });
            setStudents(students.map(student => student.id === studentId ? { ...student, status: 1 } : student));
        } catch (error) {
            console.error("Error verifying student:", error);
        }
    };

    const handleRemoveStudent = async (studentId) => {
        try {
            await deleteDoc(doc(db, `classroom/${cid}/students`, studentId));
            setStudents(students.filter(student => student.id !== studentId));
        } catch (error) {
            console.error("Error removing student:", error);
        }
    };

    if (loading) return <Typography>Loading...</Typography>;

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

            <Box sx={{ textAlign: "center", mt: 3, px: 2 }}>
                {classroom && (
                    <Card sx={{ maxWidth: 600, mx: "auto", p: 3, textAlign: "center", boxShadow: 3 }}>
                        <CardMedia
                            component="img"
                            sx={{ height: 200 }}
                            image={classroom.image || "https://via.placeholder.com/600"}
                            alt={classroom.name}
                        />
                        <CardContent sx={{ textAlign: "center" }}>
                            <Typography variant="h6">{classroom.code}</Typography>
                            <Typography variant="body2" color="textSecondary">
                                {classroom.subject || "ไม่มีคำอธิบาย"}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                {classroom.name}
                            </Typography>

                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => setShowQRCode(!showQRCode)}
                                sx={{ mt: 2 }}
                            >
                                {showQRCode ? "ซ่อน QR CODE" : "แสดง QR CODE"}
                            </Button>

                            {showQRCode && (
                                <Box sx={{ mt: 2 }}>
                                    <QRCodeCanvas value={cid} size={128} />
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                )}

                <Box sx={{ mt: 3, display: "flex", justifyContent: "center", gap: 2 }}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => setShowTable(!showTable)}
                        sx={{ minWidth: 150 }}
                    >
                        {showTable ? "ซ่อนตารางรายชื่อ" : "แสดงตารางรายชื่อ"}
                    </Button>
                    <Button
                        variant="contained"
                        color="secondary"
                        sx={{ minWidth: 150 }}
                        onClick={() => navigate("/checkin", { state: { classroom, cid } })}
                    >
                        เช็คชื่อ
                    </Button>

                </Box>

                {showTable && (
                    <Box>
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
                                                    <Button variant="contained" color="success" onClick={() => handleVerifyStudent(student.id)}>
                                                        ยืนยัน
                                                    </Button>
                                                )}
                                                <Button variant="contained" color="error" sx={{ ml: 1 }} onClick={() => handleRemoveStudent(student.id)}>
                                                    ลบ
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                )}
            </Box>
        </Box>
    );
};

export default ClassroomPage;
