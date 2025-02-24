import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { doc, getDoc, collection, addDoc, getDocs, updateDoc, deleteDoc } from "firebase/firestore";
import { QRCodeCanvas } from "qrcode.react";
import { AppBar, Toolbar, Typography, Button, Card, CardContent, CardMedia, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Box, TextField, Dialog, DialogTitle, DialogContent, DialogActions, List, ListItem, ListItemText, Divider, IconButton } from "@mui/material";
import { Delete, Edit, Save } from "@mui/icons-material";

const ClassroomPage = () => {
    const { cid } = useParams();
    const navigate = useNavigate();
    const [classroom, setClassroom] = useState(null);
    const [students, setStudents] = useState([]);
    const [checkins, setCheckins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showTable, setShowTable] = useState(false);
    const [showQRCode, setShowQRCode] = useState(false);
    const [openQuestionDialog, setOpenQuestionDialog] = useState(false);
    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState("");
    const [questions, setQuestions] = useState([]);
    const [editingQuestion, setEditingQuestion] = useState(null);
    const [scores, setScores] = useState([]); // State สำหรับเก็บข้อมูลคะแนน
    const [showScoresTable, setShowScoresTable] = useState(false); // State สำหรับแสดงตารางคะแนน

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

                // ดึงข้อมูลคำถาม
                const questionsRef = collection(db, `classroom/${cid}/questions`);
                const questionsSnap = await getDocs(questionsRef);
                setQuestions(questionsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

                // ดึงข้อมูลคะแนน
                const scoresRef = collection(db, `classroom/${cid}/checkin`);
                const scoresSnap = await getDocs(scoresRef);
                const scoresData = [];
                for (const checkinDoc of scoresSnap.docs) {
                    const scoresCollectionRef = collection(db, `classroom/${cid}/checkin/${checkinDoc.id}/scores`);
                    const scoresCollectionSnap = await getDocs(scoresCollectionRef);
                    scoresData.push(...scoresCollectionSnap.docs.map(doc => ({ id: doc.id, checkinId: checkinDoc.id, ...doc.data() })));
                }
                setScores(scoresData);
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

    const handleOpenQuestionDialog = () => {
        setOpenQuestionDialog(true);
    };

    const handleCloseQuestionDialog = () => {
        setOpenQuestionDialog(false);
        setQuestion("");
        setAnswer("");
        setEditingQuestion(null);
    };

    const handleSaveQuestion = async () => {
        try {
            const questionsRef = collection(db, `classroom/${cid}/questions`);
            const newQuestion = {
                question,
                answer,
                timestamp: new Date()
            };
            if (editingQuestion) {
                const questionRef = doc(db, `classroom/${cid}/questions`, editingQuestion.id);
                await updateDoc(questionRef, newQuestion);
                setQuestions(questions.map(q => q.id === editingQuestion.id ? { ...q, ...newQuestion } : q));
            } else {
                const docRef = await addDoc(questionsRef, newQuestion);
                setQuestions([...questions, { id: docRef.id, ...newQuestion }]);
            }
            handleCloseQuestionDialog();
        } catch (error) {
            console.error("Error saving question:", error);
        }
    };

    const handleDeleteQuestion = async (questionId) => {
        try {
            await deleteDoc(doc(db, `classroom/${cid}/questions`, questionId));
            setQuestions(questions.filter(q => q.id !== questionId));
        } catch (error) {
            console.error("Error deleting question:", error);
        }
    };

    const handleEditQuestion = (question) => {
        setQuestion(question.question);
        setAnswer(question.answer);
        setEditingQuestion(question);
        setOpenQuestionDialog(true);
    };

    const handleScoreChange = (id, field, value) => {
        setScores(scores.map(score => 
            score.id === id ? { ...score, [field]: value } : score
        ));
    };

    const handleSaveScores = async () => {
        try {
            for (const score of scores) {
                const scoreRef = doc(db, `classroom/${cid}/checkin/${score.checkinId}/scores`, score.id);
                await updateDoc(scoreRef, {
                    score: score.score,
                    note: score.note,
                    status: score.status
                });
            }
            alert("บันทึกข้อมูลสำเร็จ");
        } catch (error) {
            console.error("Error saving scores:", error);
            alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
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


                        onClick={handleOpenQuestionDialog}
                        sx={{ minWidth: 150 }}
                    >
                        เพิ่มคำถาม
                    </Button>
                    <Button
                        variant="contained"
                        color="info"
                        onClick={() => setShowScoresTable(!showScoresTable)}
                        sx={{ minWidth: 150 }}
                    >
                        {showScoresTable ? "ซ่อนคะแนน" : "แสดงคะแนน"}
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

                {showScoresTable && (
                    <Box sx={{ mt: 4 }}>
                        <Typography variant="h5">คะแนนการเช็คชื่อ</Typography>
                        <TableContainer component={Paper} sx={{ mt: 2 }}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>ลำดับ</TableCell>
                                        <TableCell>รหัส</TableCell>
                                        <TableCell>ชื่อ</TableCell>
                                        <TableCell>หมายเหตุ</TableCell>
                                        <TableCell>วันเวลา</TableCell>
                                        <TableCell>คะแนน</TableCell>
                                        <TableCell>สถานะ</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {scores.map((score, index) => (
                                        <TableRow key={score.id}>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell>{score.stdid}</TableCell>
                                            <TableCell>{score.name}</TableCell>
                                            <TableCell>
                                                <TextField
                                                    value={score.note || ""}
                                                    onChange={(e) => handleScoreChange(score.id, "note", e.target.value)}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>{new Date(score.timestamp?.toDate()).toLocaleString()}</TableCell>
                                            <TableCell>
                                                <TextField
                                                    value={score.score || ""}
                                                    onChange={(e) => handleScoreChange(score.id, "score", e.target.value)}
                                                    size="small"
                                                    type="number"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <TextField
                                                    value={score.status || ""}
                                                    onChange={(e) => handleScoreChange(score.id, "status", e.target.value)}
                                                    size="small"
                                                />
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
                            startIcon={<Save />}
                        >
                            บันทึกข้อมูล
                        </Button>
                    </Box>
                )}

                {/* แสดงรายการคำถาม */}
                <Box sx={{ mt: 4 }}>
                    <Typography variant="h5">รายการคำถาม</Typography>
                    <List sx={{ width: '100%', maxWidth: 600, mx: 'auto', bgcolor: 'background.paper' }}>
                        {questions.map((q, index) => (
                            <React.Fragment key={q.id}>
                                <ListItem alignItems="flex-start">
                                    <ListItemText
                                        primary={`คำถามที่ ${index + 1}: ${q.question}`}
                                        secondary={`คำตอบ: ${q.answer}`}
                                    />
                                    <IconButton onClick={() => handleEditQuestion(q)}>
                                        <Edit />
                                    </IconButton>
                                    <IconButton onClick={() => handleDeleteQuestion(q.id)}>
                                        <Delete />
                                    </IconButton>
                                </ListItem>
                                {index < questions.length - 1 && <Divider />}
                            </React.Fragment>
                        ))}
                    </List>
                </Box>
            </Box>

            <Dialog open={openQuestionDialog} onClose={handleCloseQuestionDialog}>
                <DialogTitle>{editingQuestion ? "แก้ไขคำถาม" : "เพิ่มคำถาม"}</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="คำถาม"
                        type="text"
                        fullWidth
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                    />
                    <TextField
                        margin="dense"
                        label="คำตอบ"
                        type="text"
                        fullWidth
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseQuestionDialog} color="primary">
                        ยกเลิก
                    </Button>
                    <Button onClick={handleSaveQuestion} color="primary">
                        {editingQuestion ? "อัพเดต" : "บันทึก"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ClassroomPage;