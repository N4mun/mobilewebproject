import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { doc, getDoc, collection, addDoc, getDocs, query } from "firebase/firestore";
import { QRCodeCanvas } from "qrcode.react";
import { Button, Card, CardContent, CardMedia, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Box, Grid } from "@mui/material";

const ClassroomPage = () => {
    const { cid } = useParams();
    const navigate = useNavigate();
    const [classroom, setClassroom] = useState(null);
    const [students, setStudents] = useState([]);
    const [checkins, setCheckins] = useState([]);

    useEffect(() => {
        const fetchClassroom = async () => {
            const classRef = doc(db, "classroom", cid);
            const classSnap = await getDoc(classRef);
            if (classSnap.exists()) {
                setClassroom(classSnap.data());
            }
        };
        
        const fetchStudents = async () => {
            const studentsRef = collection(db, `classroom/${cid}/students`);
            const studentSnap = await getDocs(studentsRef);
            setStudents(studentSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        };

        const fetchCheckins = async () => {
            const checkinRef = collection(db, `classroom/${cid}/checkin`);
            const checkinSnap = await getDocs(checkinRef);
            setCheckins(checkinSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        };

        fetchClassroom();
        fetchStudents();
        fetchCheckins();
    }, [cid]);

    const handleAddCheckin = async () => {
        const newCheckin = await addDoc(collection(db, `classroom/${cid}/checkin`), {
            timestamp: new Date(),
            status: "กำลังเรียน"
        });

        const scoresRef = collection(db, `classroom/${cid}/checkin/${newCheckin.id}/scores`);
        students.forEach(async (student) => {
            await addDoc(scoresRef, { id: student.id, name: student.name, status: 0 });
        });
        fetchCheckins();
    };

    return (
        <Box sx={{ textAlign: "center", mt: 3, px: 2 }}>
            {classroom && (
                <Card sx={{ maxWidth: 600, mx: "auto", p: 3, textAlign: "center", boxShadow: 3 }}>
                    <CardMedia component="img" sx={{ height: 200 }} image={classroom.image || "https://via.placeholder.com/600"} alt={classroom.name} />
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
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {students.map((student, index) => (
                            <TableRow key={student.id}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>{student.stdid}</TableCell>
                                <TableCell>{student.name}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Button variant="contained" color="primary" sx={{ mt: 3 }} onClick={handleAddCheckin}>
                เพิ่มการเช็คชื่อ
            </Button>

            <Typography variant="h5" sx={{ mt: 4 }}>ประวัติการเช็คชื่อ</Typography>
            <TableContainer component={Paper} sx={{ mt: 2 }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>ลำดับ</TableCell>
                            <TableCell>วัน-เวลา</TableCell>
                            <TableCell>จำนวนเข้าเรียน</TableCell>
                            <TableCell>สถานะ</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {checkins.map((checkin, index) => (
                            <TableRow key={checkin.id}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>{new Date(checkin.timestamp.toDate()).toLocaleString()}</TableCell>
                                <TableCell>{students.length}</TableCell>
                                <TableCell>{checkin.status}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default ClassroomPage;
