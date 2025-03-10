import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { doc, getDoc, collection, onSnapshot, updateDoc, deleteDoc } from "firebase/firestore";
import { QRCodeCanvas } from "qrcode.react";
import { AppBar, Toolbar, Typography, Button, Card, CardContent, CardMedia, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Box, Tabs, Tab } from "@mui/material";

const ClassroomPage = () => {
    const { cid } = useParams();
    const navigate = useNavigate();
    const [classroom, setClassroom] = useState(null);
    const [students, setStudents] = useState([]);
    const [checkins, setCheckins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showQRCode, setShowQRCode] = useState(false);
    const [tabValue, setTabValue] = useState(0);

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
                const unsubscribeStudents = onSnapshot(studentsRef, (snapshot) => {
                    const studentsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    setStudents(studentsData);
                });

                const checkinRef = collection(db, `classroom/${cid}/checkin`);
                const unsubscribeCheckins = onSnapshot(checkinRef, (snapshot) => {
                    const checkinList = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data(),
                        studentCount: 0, // ค่าเริ่มต้น
                    }));

                    // ฟังข้อมูล scores แบบเรียลไทม์สำหรับแต่ละ checkin
                    const scoreUnsubscribes = checkinList.map(checkin => {
                        const scoresRef = collection(db, `classroom/${cid}/checkin/${checkin.id}/scores`);
                        return onSnapshot(scoresRef, (scoresSnap) => {
                            // นับเฉพาะนักเรียนที่มี status เป็น 1 (มาเรียน) หรือ 2 (มาสาย)
                            const studentCount = scoresSnap.docs.reduce((count, doc) => {
                                const status = doc.data().status;
                                return (status === 1 || status === 2) ? count + 1 : count;
                            }, 0);

                            setCheckins(prevCheckins =>
                                prevCheckins.map(prevCheckin =>
                                    prevCheckin.id === checkin.id
                                        ? { ...prevCheckin, studentCount: studentCount }
                                        : prevCheckin
                                )
                            );
                        }, (error) => {
                            console.error(`Error fetching scores for checkin ${checkin.id}:`, error);
                        });
                    });

                    setCheckins(checkinList);

                    // Cleanup subscriptions
                    return () => {
                        unsubscribeStudents();
                        unsubscribeCheckins();
                        scoreUnsubscribes.forEach(unsub => unsub());
                    };
                }, (error) => {
                    console.error("Error fetching checkins:", error);
                });
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
        } catch (error) {
            console.error("Error verifying student:", error);
        }
    };

    const handleRemoveStudent = async (studentId) => {
        try {
            await deleteDoc(doc(db, `classroom/${cid}/students`, studentId));
        } catch (error) {
            console.error("Error removing student:", error);
        }
    };

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
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
                        color="secondary"
                        sx={{ minWidth: 150 }}
                        onClick={() => navigate("/checkin", { state: { classroom, cid } })}
                    >
                        เช็คชื่อ
                    </Button>
                </Box>

                <Box sx={{ mt: 4 }}>
                    <Tabs value={tabValue} onChange={handleTabChange} centered>
                        <Tab label="รายชื่อนักเรียน" />
                        <Tab label="ประวัติการเช็คชื่อ" />
                    </Tabs>

                    {tabValue === 0 && (
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="h5" sx={{ mb: 2 }}>รายชื่อนักเรียน</Typography>
                            {students.length > 0 ? (
                                <TableContainer component={Paper}>
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
                            ) : (
                                <Typography variant="body1" sx={{ textAlign: "center" }}>
                                    ไม่มีรายชื่อนักเรียนในขณะนี้
                                </Typography>
                            )}
                        </Box>
                    )}

                    {tabValue === 1 && (
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="h5" sx={{ mb: 2 }}>ประวัติการเช็คชื่อ</Typography>
                            {checkins.length > 0 ? (
                                <TableContainer component={Paper}>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>ลำดับ</TableCell>
                                                <TableCell>วันที่-เวลา</TableCell>
                                                <TableCell>จำนวนคนเข้าเรียน</TableCell>
                                                <TableCell>สถานะ</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {checkins.map((checkin) => (
                                                <TableRow key={checkin.id}>
                                                    <TableCell>{checkin.id}</TableCell>
                                                    <TableCell>{checkin.date}</TableCell>
                                                    <TableCell>{checkin.studentCount}</TableCell>
                                                    <TableCell>
                                                        {checkin.status === 0 ? "ยังไม่เริ่ม" : checkin.status === 1 ? "กำลังดำเนินการ" : "เสร็จสิ้น"}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            ) : (
                                <Typography variant="body1" sx={{ textAlign: "center" }}>
                                    ไม่มีประวัติการเช็คชื่อในขณะนี้
                                </Typography>
                            )}
                        </Box>
                    )}
                </Box>
            </Box>
        </Box>
    );
};

export default ClassroomPage;