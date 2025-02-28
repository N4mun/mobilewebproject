import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AppBar, Toolbar, Box, Typography, Card, CardMedia, CardContent, Button, Modal, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";
import { db } from "../firebase";
import { doc, setDoc, collection, getDocs, updateDoc, deleteDoc, onSnapshot, getDoc } from "firebase/firestore";

const CheckinPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [openModal, setOpenModal] = useState(false);
    const [cno, setCno] = useState("");
    const [code, setCode] = useState("");
    const [date, setDate] = useState("");
    const [status, setStatus] = useState(0);
    const [checkins, setCheckins] = useState([]);
    const [showCodes, setShowCodes] = useState({});
    const [showQRs, setShowQRs] = useState({});
    const [showStudents, setShowStudents] = useState(false);
    const [checkedInStudents, setCheckedInStudents] = useState([]);
    const [showScores, setShowScores] = useState(false);
    const [scores, setScores] = useState([]);
    const [editedScores, setEditedScores] = useState({});
    const [openQuestionModal, setOpenQuestionModal] = useState(false);
    const [questionNo, setQuestionNo] = useState("");
    const [questionText, setQuestionText] = useState("");
    const [selectedCno, setSelectedCno] = useState("");
    const [answers, setAnswers] = useState([]);
    const { classroom, cid } = location.state || {};

    useEffect(() => {
        const fetchCheckins = async () => {
            if (!cid) return;
            const checkinCollection = collection(db, `classroom/${cid}/checkin`);
            const checkinSnapshot = await getDocs(checkinCollection);
            const checkinList = checkinSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setCheckins(checkinList.filter(item => item.status !== 2));
        };
        fetchCheckins();
    }, [cid]);

    const fetchCheckedInStudents = async () => {
        const activeCheckins = checkins.filter(item => item.status === 1);
        const studentList = [];
        for (const checkin of activeCheckins) {
            const studentsRef = collection(db, `classroom/${cid}/checkin/${checkin.id}/students`);
            const studentsSnap = await getDocs(studentsRef);
            studentsSnap.docs.forEach(doc => {
                studentList.push({
                    cno: checkin.id,
                    ...doc.data(),
                    studentId: doc.id, // This is the UID of the student
                });
            });
        }
        setCheckedInStudents(studentList);
    };

    const fetchScores = async () => {
        const allScores = [];
        for (const checkin of checkins) {
            const scoresRef = collection(db, `classroom/${cid}/checkin/${checkin.id}/scores`);
            const scoresSnap = await getDocs(scoresRef);
            scoresSnap.docs.forEach(doc => {
                allScores.push({
                    cno: checkin.id,
                    stdid: doc.id,
                    ...doc.data(),
                });
            });
        }
        console.log("Fetched scores:", allScores);
        setScores(allScores);
        setEditedScores({});
    };

    useEffect(() => {
        if (showStudents) fetchCheckedInStudents();
        if (showScores) fetchScores();
    }, [showStudents, showScores, checkins]);

    useEffect(() => {
        if (!selectedCno || !questionNo || !cid) return;

        const studentsRef = collection(db, `classroom/${cid}/checkin/${selectedCno}/answers/${questionNo}/students`);
        const unsubscribe = onSnapshot(studentsRef, (snapshot) => {
            const answerList = snapshot.docs.map(doc => ({
                stdid: doc.id,
                ...doc.data(),
            }));
            setAnswers(answerList);
        }, (error) => {
            console.error("Error fetching answers:", error);
        });

        return () => unsubscribe();
    }, [selectedCno, questionNo, cid]);

    if (!classroom || !cid) {
        return <Typography>ไม่มีข้อมูลห้องเรียน</Typography>;
    }

    const handleAddCheckin = async () => {
        if (!cno || !code || !date) {
            alert("กรุณากรอกข้อมูลให้ครบ");
            return;
        }

        try {
            const checkinRef = doc(db, `classroom/${cid}/checkin/${cno}`);
            await setDoc(checkinRef, { code, date, status });

            const studentsRef = collection(db, `classroom/${cid}/students`);
            const studentsSnap = await getDocs(studentsRef);
            const students = studentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            for (const student of students) {
                const scoreRef = doc(db, `classroom/${cid}/checkin/${cno}/scores/${student.stdid}`);
                await setDoc(scoreRef, {
                    date: new Date().toISOString(),
                    name: student.name,
                    uid: student.id,
                    remark: student.remark || "",
                    score: 0,
                    status: 0,
                });
            }

            setCheckins([...checkins, { id: cno, code, date, status }]);
            alert("เพิ่มการเช็คชื่อสำเร็จ");
            setOpenModal(false);
        } catch (error) {
            console.error("Error adding check-in:", error);
            alert("เกิดข้อผิดพลาด");
        }
    };

    const handleOpenCheckin = async (cno) => {
        const checkinRef = doc(db, `classroom/${cid}/checkin/${cno}`);
        await updateDoc(checkinRef, { status: 1 });
        setCheckins(checkins.map(item => item.id === cno ? { ...item, status: 1 } : item));
    };

    const handleCloseCheckin = async (cno) => {
        const checkinRef = doc(db, `classroom/${cid}/checkin/${cno}`);
        await updateDoc(checkinRef, { status: 2 });
        setCheckins(checkins.filter(item => item.id !== cno));
    };

    const handleDeleteStudent = async (cno, studentId) => {
        try {
            await deleteDoc(doc(db, `classroom/${cid}/checkin/${cno}/students/${studentId}`));
            setCheckedInStudents(checkedInStudents.filter(student => student.studentId !== studentId || student.cno !== cno));
        } catch (error) {
            console.error("Error deleting student:", error);
            alert("เกิดข้อผิดพลาดในการลบ");
        }
    };

    // Fixed: Changed student.studentId to student.id to match the data structure
    const handleSaveCheckin = async (cno) => {
        try {
            const studentsRef = collection(db, `classroom/${cid}/checkin/${cno}/students`);
            const studentsSnap = await getDocs(studentsRef);
            const students = studentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            for (const student of students) {
                const scoreRef = doc(db, `classroom/${cid}/checkin/${cno}/scores/${student.stdid}`);
                await setDoc(scoreRef, {
                    date: student.date,
                    name: student.name,
                    uid: student.id, 
                    remark: student.remark || "",
                    score: 0,
                    status: 1,
                }, { merge: true });
            }
            alert("บันทึกการเช็คชื่อสำเร็จ");
        } catch (error) {
            console.error("Error saving check-in:", error);
            alert("เกิดข้อผิดพลาดในการบันทึก: " + error.message);
        }
    };

    const handleScoreChange = (cno, stdid, field, value) => {
        let formattedValue = value;
        if (field === "score") {
            formattedValue = value === "" ? 0 : Number(value); // แปลงเป็น number และจัดการกรณีค่าว่าง
        } else if (field === "status") {
            formattedValue = Number(value); // แปลงสถานะเป็น number
        }
        setEditedScores(prev => ({
            ...prev,
            [`${cno}-${stdid}`]: {
                ...prev[`${cno}-${stdid}`],
                [field]: formattedValue,
            },
        }));
    };

    const handleSaveScores = async () => {
        try {
            console.log("Saving scores:", editedScores);
            for (const key in editedScores) {
                // แยก cno และ stdid โดยตัดเฉพาะส่วนแรก (cno) ออกมา
                const firstDashIndex = key.indexOf('-');
                const cno = key.substring(0, firstDashIndex);
                const stdid = key.substring(firstDashIndex + 1); // เก็บค่าเต็มของ stdid รวม "-4"
    
                const scoreRef = doc(db, `classroom/${cid}/checkin/${cno}/scores/${stdid}`);
    
                const scoreSnap = await getDoc(scoreRef);
                let updatedData;
    
                if (scoreSnap.exists()) {
                    const originalData = scoreSnap.data();
                    updatedData = { ...originalData, ...editedScores[key] };
                    await updateDoc(scoreRef, updatedData);
                } else {
                    updatedData = {
                        date: new Date().toISOString(),
                        name: "Unknown",
                        uid: stdid,
                        remark: editedScores[key].remark || "",
                        score: editedScores[key].score || 0,
                        status: editedScores[key].status || 0,
                    };
                    await setDoc(scoreRef, updatedData);
                }
    
                console.log(`Saved ${key}:`, updatedData);
            }
            alert("บันทึกคะแนนสำเร็จ");
            setShowScores(false);
            fetchScores();
        } catch (error) {
            console.error("Error saving scores:", error.message);
            alert(`เกิดข้อผิดพลาดในการบันทึกคะแนน: ${error.message}`);
        }
    };

    const handleStartQuestion = async () => {
        if (!questionNo || !questionText) {
            alert("กรุณากรอกข้อที่และข้อความคำถาม");
            return;
        }

        try {
            const checkinRef = doc(db, `classroom/${cid}/checkin/${selectedCno}`);
            await updateDoc(checkinRef, {
                question_no: questionNo,
                question_text: questionText,
                question_show: true,
            });

            // อัปเดต state ทันทีหลังจากตั้งคำถามสำเร็จ
            setCheckins(checkins.map(item =>
                item.id === selectedCno
                    ? { ...item, question_show: true }
                    : item
            ));

            alert("เริ่มถามสำเร็จ");
            setOpenQuestionModal(false);
        } catch (error) {
            console.error("Error starting question:", error);
            alert("เกิดข้อผิดพลาด");
        }
    };

    const handleCloseQuestion = async (cno) => {
        try {
            const checkinRef = doc(db, `classroom/${cid}/checkin/${cno}`);
            await updateDoc(checkinRef, { question_show: false });

            // อัปเดต state ทันทีหลังจากปิดคำถาม
            setCheckins(checkins.map(item =>
                item.id === cno
                    ? { ...item, question_show: false }
                    : item
            ));

            setAnswers([]);
            alert("ปิดคำถามสำเร็จ");
        } catch (error) {
            console.error("Error closing question:", error);
            alert("เกิดข้อผิดพลาด");
        }
    };

    const toggleShowCode = (cno) => {
        setShowCodes(prev => ({ ...prev, [cno]: !prev[cno] }));
    };

    const toggleShowQR = (cno) => {
        setShowQRs(prev => ({ ...prev, [cno]: !prev[cno] }));
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

            <Box sx={{ textAlign: "center", mt: 3 }}>
                <Typography sx={{ mb: 3 }} variant="h4">หน้าเช็คชื่อ</Typography>
                <Card sx={{ maxWidth: 600, mx: "auto", p: 3, boxShadow: 3 }}>
                    <CardMedia
                        component="img"
                        sx={{ height: 200 }}
                        image={classroom.image || "https://via.placeholder.com/600"}
                        alt={classroom.name}
                    />
                    <CardContent>
                        <Typography variant="h6">{classroom.code}</Typography>
                        <Typography variant="body2">{classroom.subject || "ไม่มีคำอธิบาย"}</Typography>
                        <Typography variant="body2">{classroom.name}</Typography>
                    </CardContent>
                    <Button variant="contained" color="secondary" sx={{ mt: 0 }} onClick={() => setOpenModal(true)}>
                        เพิ่มการเช็คชื่อ
                    </Button>
                </Card>

                <Box sx={{ mt: 1, display: "flex", justifyContent: "center", gap: 2 }}>
                    <Button variant="outlined" color="primary" sx={{ mt: 2 }} onClick={() => navigate(-1)}>
                        กลับไปที่ห้องเรียน
                    </Button>
                    <Button
                        variant="outlined"
                        color="primary"
                        sx={{ mt: 2 }}
                        onClick={() => setShowStudents(!showStudents)}
                    >
                        {showStudents ? "ซ่อนรายชื่อนักเรียน" : "แสดงรายชื่อนักเรียน"}
                    </Button>
                    <Button
                        variant="outlined"
                        color="primary"
                        sx={{ mt: 2 }}
                        onClick={() => setShowScores(!showScores)}
                    >
                        {showScores ? "ซ่อนคะแนน" : "แสดงคะแนน"}
                    </Button>
                </Box>
            </Box>

            <Modal open={openModal} onClose={() => setOpenModal(false)}>
                <Box sx={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", bgcolor: "background.paper", p: 4, boxShadow: 24, borderRadius: 2, width: 400 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>เพิ่มการเช็คชื่อ</Typography>
                    <TextField fullWidth label="ลำดับการเช็คชื่อ (cno)" variant="outlined" value={cno} onChange={(e) => setCno(e.target.value)} sx={{ mb: 2 }} />
                    <TextField fullWidth label="รหัสเช็คชื่อ" variant="outlined" value={code} onChange={(e) => setCode(e.target.value)} sx={{ mb: 2 }} />
                    <TextField fullWidth type="datetime-local" variant="outlined" value={date} onChange={(e) => setDate(e.target.value)} sx={{ mb: 2 }} />
                    <Button fullWidth variant="contained" color="primary" onClick={handleAddCheckin}>บันทึก</Button>
                </Box>
            </Modal>

            <Modal open={openQuestionModal} onClose={() => setOpenQuestionModal(false)}>
                <Box sx={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", bgcolor: "background.paper", p: 4, boxShadow: 24, borderRadius: 2, width: 400 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>ตั้งคำถาม</Typography>
                    <TextField
                        fullWidth
                        label="ข้อที่ (question_no)"
                        variant="outlined"
                        value={questionNo}
                        onChange={(e) => setQuestionNo(e.target.value)}
                        sx={{ mb: 2 }}
                        type="number"
                    />
                    <TextField
                        fullWidth
                        label="ข้อความคำถาม"
                        variant="outlined"
                        value={questionText}
                        onChange={(e) => setQuestionText(e.target.value)}
                        sx={{ mb: 2 }}
                        multiline
                    />
                    <Button fullWidth variant="contained" color="primary" onClick={handleStartQuestion}>เริ่มถาม</Button>
                </Box>
            </Modal>

            <Box sx={{ mt: 4, mx: "auto", maxWidth: 1000 }}>
                {checkins.length > 0 ? (
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>ลำดับ</TableCell>
                                    <TableCell>รหัส</TableCell>
                                    <TableCell>วันที่</TableCell>
                                    <TableCell>สถานะ</TableCell>
                                    <TableCell>การจัดการ</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {checkins.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell>{item.id}</TableCell>
                                        <TableCell>{showCodes[item.id] ? item.code : "****"}</TableCell>
                                        <TableCell>{item.date}</TableCell>
                                        <TableCell>{item.status === 0 ? "ยังไม่เริ่ม" : item.status === 1 ? "กำลังเช็คชื่อ" : "เสร็จแล้ว"}</TableCell>
                                        <TableCell>
                                            {item.status === 0 && (
                                                <Button variant="contained" color="primary" onClick={() => handleOpenCheckin(item.id)} sx={{ mr: 1 }}>
                                                    เปิดเช็คชื่อ
                                                </Button>
                                            )}
                                            {item.status === 1 && (
                                                <>
                                                    <Button variant="contained" color="secondary" onClick={() => handleCloseCheckin(item.id)} sx={{ mr: 1 }}>
                                                        ปิดเช็คชื่อ
                                                    </Button>
                                                    <Button variant="contained" color="success" onClick={() => handleSaveCheckin(item.id)} sx={{ mr: 1 }}>
                                                        บันทึกการเช็คชื่อ
                                                    </Button>
                                                    <Button
                                                        variant="outlined"
                                                        onClick={() => {
                                                            setSelectedCno(item.id);
                                                            if (item.question_show) {
                                                                handleCloseQuestion(item.id); // ถ้ากำลังแสดงคำถามอยู่ ให้ปิด
                                                            } else {
                                                                setOpenQuestionModal(true); // ถ้ายังไม่แสดงคำถาม ให้เปิด modal
                                                            }
                                                        }}
                                                        sx={{ mr: 1 }}
                                                    >
                                                        {item.question_show ? "ปิดคำถาม" : "ตั้งคำถาม"}
                                                    </Button>
                                                </>
                                            )}
                                            <Button variant="outlined" onClick={() => toggleShowCode(item.id)} sx={{ mr: 1 }}>
                                                {showCodes[item.id] ? "ซ่อนรหัส" : "แสดงรหัส"}
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                ) : (
                    <Typography variant="h6" sx={{ textAlign: "center" }}>
                        ไม่มีรายการเช็คชื่อที่ยังไม่ปิด
                    </Typography>
                )}

                {showStudents && (
                    <Box sx={{ mt: 4 }}>
                        <Typography variant="h5" sx={{ mb: 2 }}>รายชื่อนักเรียนที่เช็คชื่อ</Typography>
                        {checkedInStudents.length > 0 ? (
                            <TableContainer component={Paper}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>ลำดับ</TableCell>
                                            <TableCell>รหัสนักเรียน</TableCell>
                                            <TableCell>ชื่อ</TableCell>
                                            <TableCell>วันที่เช็คชื่อ</TableCell>
                                            <TableCell>ดำเนินการ</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {checkedInStudents.map((student, index) => (
                                            <TableRow key={`${student.cno}-${student.studentId}`}>
                                                <TableCell>{student.cno}</TableCell>
                                                <TableCell>{student.stdid}</TableCell>
                                                <TableCell>{student.name}</TableCell>
                                                <TableCell>{new Date(student.date).toLocaleString()}</TableCell>
                                                <TableCell>
                                                    <Button
                                                        variant="contained"
                                                        color="error"
                                                        onClick={() => handleDeleteStudent(student.cno, student.studentId)}
                                                    >
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
                                ไม่มีนักเรียนที่เช็คชื่อในขณะนี้
                            </Typography>
                        )}
                    </Box>
                )}

                {showScores && (
                    <Box sx={{ mt: 4 }}>
                        <Typography variant="h5" sx={{ mb: 2 }}>คะแนนการเช็คชื่อ</Typography>
                        {scores.length > 0 ? (
                            <>
                                <TableContainer component={Paper}>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>ลำดับ</TableCell>
                                                <TableCell>รหัส</TableCell>
                                                <TableCell>ชื่อ</TableCell>
                                                <TableCell>หมายเหตุ</TableCell>
                                                <TableCell>วันที่</TableCell>
                                                <TableCell>คะแนน</TableCell>
                                                <TableCell>สถานะ</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {scores.map((score) => (
                                                <TableRow key={`${score.cno}-${score.stdid}`}>
                                                    <TableCell>{score.cno}</TableCell>
                                                    <TableCell>{score.stdid}</TableCell>
                                                    <TableCell>{score.name}</TableCell>
                                                    <TableCell>
                                                        <TextField
                                                            value={editedScores[`${score.cno}-${score.stdid}`]?.remark ?? score.remark ?? ""}
                                                            onChange={(e) => handleScoreChange(score.cno, score.stdid, "remark", e.target.value)}
                                                            size="small"
                                                        />
                                                    </TableCell>
                                                    <TableCell>{new Date(score.date).toLocaleString()}</TableCell>
                                                    <TableCell>
                                                        <TextField
                                                            type="number"
                                                            value={editedScores[`${score.cno}-${score.stdid}`]?.score ?? score.score ?? 0}
                                                            onChange={(e) => handleScoreChange(score.cno, score.stdid, "score", e.target.value)}
                                                            size="small"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <TextField
                                                            select
                                                            value={editedScores[`${score.cno}-${score.stdid}`]?.status ?? score.status ?? 0}
                                                            onChange={(e) => handleScoreChange(score.cno, score.stdid, "status", e.target.value)}
                                                            SelectProps={{ native: true }}
                                                            size="small"
                                                        >
                                                            <option value={0}>ไม่มา</option>
                                                            <option value={1}>มาเรียน</option>
                                                            <option value={2}>มาสาย</option>
                                                        </TextField>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={handleSaveScores}
                                    sx={{ mt: 2 }}
                                >
                                    บันทึกข้อมูล
                                </Button>
                            </>
                        ) : (
                            <Typography variant="body1" sx={{ textAlign: "center" }}>
                                ไม่มีข้อมูลคะแนน
                            </Typography>
                        )}
                    </Box>
                )}

                {selectedCno && answers.length > 0 && (
                    <Box sx={{ mt: 4 }}>
                        <Typography variant="h5" sx={{ mb: 2 }}>รายการคำตอบ (ข้อที่ {questionNo})</Typography>
                        <TableContainer component={Paper}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>รหัสนักเรียน</TableCell>
                                        <TableCell>คำตอบ</TableCell>
                                        <TableCell>เวลาส่ง</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {answers.map((answer) => (
                                        <TableRow key={answer.stdid}>
                                            <TableCell>{answer.stdid}</TableCell>
                                            <TableCell>{answer.text}</TableCell>
                                            <TableCell>{new Date(answer.time).toLocaleString()}</TableCell>
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

export default CheckinPage;