import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AppBar, Toolbar, Box, Typography, Card, CardMedia, CardContent, Button, Modal, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Tabs, Tab } from "@mui/material";
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
    const [checkedInStudents, setCheckedInStudents] = useState([]);
    const [scores, setScores] = useState([]);
    const [editedScores, setEditedScores] = useState({});
    const [openQuestionModal, setOpenQuestionModal] = useState(false);
    const [questionNo, setQuestionNo] = useState("");
    const [questionText, setQuestionText] = useState("");
    const [selectedCno, setSelectedCno] = useState("");
    const [answers, setAnswers] = useState([]);
    const { classroom, cid } = location.state || {};
    const [tabValue, setTabValue] = useState(0);

    useEffect(() => {
        const fetchCheckins = async () => {
            if (!cid) return;
            const checkinCollection = collection(db, `classroom/${cid}/checkin`);
            const unsubscribe = onSnapshot(checkinCollection, (snapshot) => {
                const checkinList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setCheckins(checkinList.filter(item => item.status !== 2));
            }, (error) => {
                console.error("Error fetching checkins:", error);
            });
            return () => unsubscribe();
        };
        fetchCheckins();
    }, [cid]);

    useEffect(() => {
        if (tabValue === 2 && checkins.length > 0) {
            const activeQuestionCheckin = checkins.find(item => item.question_show && item.status === 1);
            if (activeQuestionCheckin) {
                setSelectedCno(activeQuestionCheckin.id);
                setQuestionNo(activeQuestionCheckin.question_no || "");
            } else {
                setSelectedCno("");
                setQuestionNo("");
                setAnswers([]);
            }
        }
    }, [tabValue, checkins]);

    useEffect(() => {
        if (!cid || tabValue !== 0) return;

        const activeCheckins = checkins.filter(item => item.status === 1);
        const unsubscribes = [];

        const fetchCheckedInStudents = () => {
            activeCheckins.forEach(checkin => {
                const studentsRef = collection(db, `classroom/${cid}/checkin/${checkin.id}/students`);
                const unsubscribe = onSnapshot(studentsRef, (studentsSnap) => {
                    const updatedStudents = studentsSnap.docs.map(doc => {
                        const data = doc.data();
                        const status = data.status !== undefined ? data.status : 1; // Default เป็น 1 ถ้าไม่มี status
                        console.log(`Student ${doc.id} Raw Data:`, data); // Log ข้อมูลดิบ
                        console.log(`Student ${doc.id} Status:`, status);
                        return {
                            cno: checkin.id,
                            stdid: data.stdid || doc.id,
                            name: data.name || "",
                            date: data.date || "",
                            remark: data.remark || "",
                            status: status,
                            studentId: doc.id,
                        };
                    });
                    setCheckedInStudents(prev => {
                        const otherStudents = prev.filter(student => student.cno !== checkin.id);
                        return [...otherStudents, ...updatedStudents];
                    });
                }, (error) => {
                    console.error("Error fetching checked-in students:", error);
                });
                unsubscribes.push(unsubscribe);
            });

            const checkStatus = () => {
                checkins.forEach(checkin => {
                    if (checkin.status !== 1) {
                        setCheckedInStudents(prev => prev.filter(student => student.cno !== checkin.id));
                    }
                });
            };
            checkStatus();
        };

        fetchCheckedInStudents();

        return () => {
            unsubscribes.forEach(unsubscribe => unsubscribe());
        };
    }, [cid, tabValue, checkins]);

    useEffect(() => {
        if (!cid || tabValue !== 0) return;

        const activeCheckins = checkins.filter(item => item.status === 1);
        const unsubscribes = [];

        const fetchCheckedInStudents = () => {
            activeCheckins.forEach(checkin => {
                const studentsRef = collection(db, `classroom/${cid}/checkin/${checkin.id}/students`);
                const unsubscribe = onSnapshot(studentsRef, (studentsSnap) => {
                    const updatedStudents = studentsSnap.docs.map(doc => {
                        const data = doc.data();
                        const status = data.status !== undefined ? data.status : 1; // Default เป็น 1 ถ้าไม่มี status
                        console.log(`Student ${doc.id} Raw Data:`, data);
                        console.log(`Student ${doc.id} Status:`, status);
                        return {
                            cno: checkin.id,
                            stdid: data.stdid || doc.id,
                            name: data.name || "",
                            date: data.date || "",
                            remark: data.remark || "",
                            status: status,
                            studentId: doc.id,
                        };
                    });
                    setCheckedInStudents(prev => {
                        const otherStudents = prev.filter(student => student.cno !== checkin.id);
                        return [...otherStudents, ...updatedStudents];
                    });
                }, (error) => {
                    console.error("Error fetching checked-in students:", error);
                });
                unsubscribes.push(unsubscribe);
            });

            const checkStatus = () => {
                checkins.forEach(checkin => {
                    if (checkin.status !== 1) {
                        setCheckedInStudents(prev => prev.filter(student => student.cno !== checkin.id));
                    }
                });
            };
            checkStatus();
        };

        fetchCheckedInStudents();

        return () => {
            unsubscribes.forEach(unsubscribe => unsubscribe());
        };
    }, [cid, tabValue, checkins]);

    useEffect(() => {
        if (!selectedCno || !questionNo || !cid || tabValue !== 2) return;

        const studentsRef = collection(db, `classroom/${cid}/checkin/${selectedCno}/answers/${questionNo}/students`);
        const unsubscribe = onSnapshot(studentsRef, (snapshot) => {
            const answerList = snapshot.docs.map(doc => ({
                stdid: doc.data().stdid || doc.id,
                text: doc.data().text || "",
                time: doc.data().time || "",
            }));
            setAnswers(answerList);
        }, (error) => {
            console.error("Error fetching answers:", error);
        });

        return () => unsubscribe();
    }, [selectedCno, questionNo, cid, tabValue]);

    if (!classroom || !cid) {
        return <Typography>ไม่มีข้อมูลห้องเรียน</Typography>;
    }

    useEffect(() => {
        if (!cid || tabValue !== 1) return;
    
        const activeCheckins = checkins.filter(item => item.status === 1);
        const unsubscribes = [];
    
        activeCheckins.forEach(checkin => {
            const scoresRef = collection(db, `classroom/${cid}/checkin/${checkin.id}/scores`);
            const unsubscribe = onSnapshot(scoresRef, (scoresSnap) => {
                const updatedScores = scoresSnap.docs.map(doc => ({
                    cno: checkin.id,
                    stdid: doc.data().stdid || doc.id,
                    name: doc.data().name || "",
                    date: doc.data().date || "",
                    remark: doc.data().remark || "",
                    score: doc.data().score || 0,
                    status: doc.data().status || 0,
                    uid: doc.data().uid || doc.id,
                }));
                setScores(prev => {
                    const otherScores = prev.filter(score => score.cno !== checkin.id);
                    return [...otherScores, ...updatedScores];
                });
            }, (error) => {
                console.error("Error fetching scores:", error);
            });
            unsubscribes.push(unsubscribe);
        });
    
        return () => {
            unsubscribes.forEach(unsubscribe => unsubscribe());
        };
    }, [cid, tabValue, checkins]);

    const handleAddCheckin = async () => {
        if (!cno || !code || !date) {
            alert("กรุณากรอกข้อมูลให้ครบ");
            return;
        }

        try {
            const checkinRef = doc(db, `classroom/${cid}/checkin/${cno}`);
            await setDoc(checkinRef, { code, date: new Date(date).toISOString(), status: 0 });

            const studentsRef = collection(db, `classroom/${cid}/students`);
            const studentsSnap = await getDocs(studentsRef);
            const students = studentsSnap.docs.map(doc => ({
                id: doc.id,
                stdid: doc.data().stdid || doc.id,
                name: doc.data().name || "",
                status: doc.data().status || 0,
                remark: doc.data().remark || "",
            }));

            for (const student of students) {
                const scoreRef = doc(db, `classroom/${cid}/checkin/${cno}/scores/${student.stdid}`);
                const existingScoreSnap = await getDoc(scoreRef);

                let initialScore = 0;
                if (existingScoreSnap.exists()) {
                    const existingData = existingScoreSnap.data();
                    initialScore = existingData.score || 0;
                }

                await setDoc(scoreRef, {
                    date: new Date().toISOString(),
                    name: student.name,
                    uid: student.id,
                    remark: student.remark || "",
                    score: initialScore,
                    status: 0,
                    stdid: student.stdid,
                }, { merge: true });
            }

            alert("เพิ่มการเช็คชื่อสำเร็จ");
            setOpenModal(false);
        } catch (error) {
            console.error("Error adding check-in:", error);
            alert("เกิดข้อผิดพลาด");
        }
    };

    const handleOpenCheckin = async (cno) => {
        try {
            const checkinRef = doc(db, `classroom/${cid}/checkin/${cno}`);
            await updateDoc(checkinRef, { status: 1 });
    
            // ดึงข้อมูลคะแนนทันทีหลังจากเปิดเช็คชื่อ
            const scoresRef = collection(db, `classroom/${cid}/checkin/${cno}/scores`);
            const scoresSnap = await getDocs(scoresRef);
            const updatedScores = scoresSnap.docs.map(doc => ({
                cno: cno,
                stdid: doc.data().stdid || doc.id,
                name: doc.data().name || "",
                date: doc.data().date || "",
                remark: doc.data().remark || "",
                score: doc.data().score || 0,
                status: doc.data().status || 0,
                uid: doc.data().uid || doc.id,
            }));
    
            setScores(prev => {
                const filteredScores = prev.filter(score => score.cno !== cno); // ลบข้อมูลเก่าของ check-in นี้
                return [...filteredScores, ...updatedScores]; // เพิ่มข้อมูลใหม่
            });
        } catch (error) {
            console.error("Error opening check-in or fetching scores:", error);
            alert("เกิดข้อผิดพลาดในการเปิดเช็คชื่อ");
        }
    };

    const handleCloseCheckin = async (cno) => {
        try {
            const checkinRef = doc(db, `classroom/${cid}/checkin/${cno}`);
            await updateDoc(checkinRef, { status: 2 });
    
            const checkinSnap = await getDoc(checkinRef);
            const questionNo = checkinSnap.data().question_no;
    
            if (questionNo) {
                const answersStudentsRef = collection(db, `classroom/${cid}/checkin/${cno}/answers/${questionNo}/students`);
                const answersSnap = await getDocs(answersStudentsRef);
    
                if (!answersSnap.empty) {
                    const deleteAnswerPromises = answersSnap.docs.map(async (doc) => {
                        await deleteDoc(doc.ref);
                        console.log(`Deleted answer for student ${doc.id} in question ${questionNo}`);
                    });
                    await Promise.all(deleteAnswerPromises);
                } else {
                    console.log(`No answers found for question ${questionNo}`);
                }
            } else {
                console.log("No question number found, skipping answer deletion.");
            }
    
            // ลบข้อมูลคะแนนของ check-in นี้ออกจาก state
            setScores(prev => prev.filter(score => score.cno !== cno));
            setAnswers([]); // รีเซ็ตคำตอบ (ถ้ามี)
    
            alert("ปิดเช็คชื่อและลบคำตอบสำเร็จ");
        } catch (error) {
            console.error("Error closing check-in or deleting answers:", error);
            alert("เกิดข้อผิดพลาดในการปิดเช็คชื่อ: " + error.message);
        }
    };

    const handleDeleteStudent = async (cno, studentId) => {
        try {
            const studentRef = doc(db, `classroom/${cid}/checkin/${cno}/students/${studentId}`);
            console.log("Deleting student with ID:", studentId);
            await deleteDoc(studentRef);
            console.log("Deleted student successfully:", studentId);
            setCheckedInStudents(prev => prev.filter(student => student.studentId !== studentId || student.cno !== cno));
        } catch (error) {
            console.error("Error deleting student:", error);
            throw error;
        }
    };

    const handleSaveCheckin = async (cno) => {
        try {
            const studentsRef = collection(db, `classroom/${cid}/checkin/${cno}/students`);
            const studentsSnap = await getDocs(studentsRef);
            const students = studentsSnap.docs.map(doc => ({
                id: doc.id,
                stdid: doc.data().stdid || doc.id,
                name: doc.data().name || "",
                date: doc.data().date || "",
                remark: doc.data().remark || "",
                status: doc.data().status || 1,
            }));
    
            for (const student of students) {
                const scoreRef = doc(db, `classroom/${cid}/checkin/${cno}/scores/${student.stdid}`);
                const currentScoreSnap = await getDoc(scoreRef);
                let updatedScore = 0;
                let currentStatus = student.status;
    
                if (currentScoreSnap.exists()) {
                    const currentData = currentScoreSnap.data();
                    updatedScore = currentData.score || 0;
                }
    
                const scoreIncrement = currentStatus === 1 ? 1 : (currentStatus === 2 ? 0.5 : 0);
                updatedScore += scoreIncrement;
    
                await setDoc(scoreRef, {
                    date: student.date,
                    name: student.name,
                    uid: student.id,
                    remark: student.remark || "",
                    score: updatedScore,
                    status: currentStatus,
                    stdid: student.stdid,
                }, { merge: true });
    
                setScores(prev => {
                    const existingIndex = prev.findIndex(s => s.stdid === student.stdid && s.cno === cno);
                    const updatedScoreObj = {
                        cno: cno,
                        stdid: student.stdid,
                        date: student.date,
                        name: student.name,
                        remark: student.remark || "",
                        score: updatedScore,
                        status: currentStatus,
                        uid: student.id,
                    };
                    if (existingIndex !== -1) {
                        const newScores = [...prev];
                        newScores[existingIndex] = updatedScoreObj;
                        return newScores;
                    } else {
                        return [...prev, updatedScoreObj].sort((a, b) => new Date(b.date) - new Date(a.date));
                    }
                });
            }
    
            // ลบข้อมูลนักเรียนหลังจากบันทึกคะแนน
            if (!studentsSnap.empty) {
                const deleteStudentPromises = studentsSnap.docs.map(async (doc) => {
                    await deleteDoc(doc.ref);
                    console.log(`Deleted student ${doc.id} from checkin ${cno}`);
                });
                await Promise.all(deleteStudentPromises);
            }
    
            setCheckedInStudents(prev => prev.filter(student => student.cno !== cno));
            alert("บันทึกการเช็คชื่อและลบข้อมูลนักเรียนสำเร็จ");
        } catch (error) {
            console.error("Error saving check-in or deleting students:", error);
            alert("เกิดข้อผิดพลาดในการบันทึก: " + error.message);
        }
    };

    const handleScoreChange = (cno, stdid, field, value) => {
        let formattedValue = value;
        if (field === "score") {
            formattedValue = value === "" ? 0 : Number(value);
        } else if (field === "status") {
            formattedValue = Number(value);
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
            for (const key in editedScores) {
                const firstDashIndex = key.indexOf('-');
                const cno = key.substring(0, firstDashIndex);
                const stdid = key.substring(firstDashIndex + 1);

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
                        stdid: stdid,
                    };
                    await setDoc(scoreRef, updatedData);
                }
            }
            alert("บันทึกคะแนนสำเร็จ");
            setEditedScores({});
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

            setAnswers([]);
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
            alert("ปิดคำถามสำเร็จ");
        } catch (error) {
            console.error("Error closing question:", error);
            alert("เกิดข้อผิดพลาด");
        }
    };

    const toggleShowCode = (cno) => {
        setShowCodes(prev => ({ ...prev, [cno]: !prev[cno] }));
    };

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
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

                <Box sx={{ mt: 2 }}>
                    <Button variant="outlined" color="primary" onClick={() => navigate(-1)}>
                        กลับไปที่ห้องเรียน
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
                                                                handleCloseQuestion(item.id);
                                                            } else {
                                                                setOpenQuestionModal(true);
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

                <Box sx={{ mt: 4 }}>
                    <Tabs value={tabValue} onChange={handleTabChange} centered>
                        <Tab label="รายชื่อนักเรียน" />
                        <Tab label="คะแนน" />
                        <Tab label="คำตอบ" />
                    </Tabs>

                    {tabValue === 0 && (
                        <Box sx={{ mt: 2 }}>
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
                                                <TableCell>สถานะ</TableCell>
                                                <TableCell>หมายเหตุ</TableCell>
                                                <TableCell>ดำเนินการ</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {checkedInStudents.map((student, index) => (
                                                <TableRow key={`${student.cno}-${student.stdid}`}>
                                                    <TableCell>{index + 1}</TableCell>
                                                    <TableCell>{student.stdid}</TableCell>
                                                    <TableCell>{student.name}</TableCell>
                                                    <TableCell>{new Date(student.date).toLocaleString()}</TableCell>
                                                    <TableCell>{student.status === 1 ? "มาเรียน" : student.status === 2 ? "มาสาย" : "ไม่มา"}</TableCell>
                                                    <TableCell>{student.remark || '-'}</TableCell>
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

                    {tabValue === 1 && (
                        <Box sx={{ mt: 2 }}>
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
                                                {scores.sort((a, b) => new Date(b.date) - new Date(a.date)).map((score, index) => (
                                                    <TableRow key={`${score.cno}-${score.stdid}`}>
                                                        <TableCell>{index + 1}</TableCell>
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

                    {tabValue === 2 && (
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="h5" sx={{ mb: 2 }}>รายการคำตอบ {selectedCno && questionNo ? `(ข้อที่ ${questionNo})` : ""}</Typography>
                            {selectedCno && answers.length > 0 ? (
                                <TableContainer component={Paper}>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>ลำดับ</TableCell>
                                                <TableCell>รหัสนักเรียน</TableCell>
                                                <TableCell>คำตอบ</TableCell>
                                                <TableCell>เวลาส่ง</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {answers.map((answer, index) => (
                                                <TableRow key={`${answer.stdid}-${index}`}>
                                                    <TableCell>{index + 1}</TableCell>
                                                    <TableCell>{answer.stdid}</TableCell>
                                                    <TableCell>{answer.text}</TableCell>
                                                    <TableCell>{new Date(answer.time).toLocaleString()}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            ) : (
                                <Typography variant="body1" sx={{ textAlign: "center" }}>
                                    {selectedCno ? "ไม่มีคำตอบในขณะนี้" : "กรุณาตั้งคำถามก่อนดูคำตอบ"}
                                </Typography>
                            )}
                        </Box>
                    )}
                </Box>
            </Box>
        </Box>
    );
};

export default CheckinPage;