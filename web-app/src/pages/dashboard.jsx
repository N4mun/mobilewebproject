import React, { useEffect, useState } from "react";
import { AppBar, Toolbar, Button, Card, CardContent, CardMedia, Typography, Avatar, Box, Grid, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import { auth, db } from "../firebase";
import { signOut } from "firebase/auth";
import { doc, getDoc, collection, query, where, getDocs, deleteDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
    const user = auth.currentUser;
    const navigate = useNavigate();
    const [userData, setUserData] = useState({ name: "", email: "", photo: "" });
    const [classes, setClasses] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedClass, setSelectedClass] = useState(null);

    useEffect(() => {
        if (!user) return;

        const fetchUserData = async () => {
            try {
                const userRef = doc(db, "users", user.uid);
                const userSnap = await getDoc(userRef);
                if (userSnap.exists()) {
                    setUserData(userSnap.data());
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        };

        const fetchUserClasses = async () => {
            try {
                const q = query(collection(db, "classroom"), where("owner", "==", user.uid));
                const querySnapshot = await getDocs(q);
                const classList = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setClasses(classList);
            } catch (error) {
                console.error("Error fetching classes:", error);
            }
        };

        fetchUserData();
        fetchUserClasses();
    }, [user]);

    const confirmDelete = (classData) => {
        setSelectedClass(classData);
        setOpenDialog(true);
    };

    const handleDeleteClass = async () => {
        if (!selectedClass) return;
    
        try {
            const user = auth.currentUser;
            const cid = selectedClass.id;
    
            // 1. ดึงข้อมูลนักเรียนทั้งหมดในห้องเรียนนี้
            const studentsRef = collection(db, `classroom/${cid}/students`);
            const studentsSnap = await getDocs(studentsRef);
            const studentIds = studentsSnap.docs.map(doc => doc.id);
    
            // 2. ลบข้อมูลใน users/{student.uid}/classroom/{cid} ของนักเรียนทุกคน
            const studentDeletePromises = studentIds.map(studentId =>
                deleteDoc(doc(db, `users/${studentId}/classroom`, cid))
            );
            await Promise.all(studentDeletePromises);
    
            // 3. ลบ subcollection students ใน classroom/{cid}
            const studentDocsDeletePromises = studentIds.map(studentId =>
                deleteDoc(doc(db, `classroom/${cid}/students`, studentId))
            );
            await Promise.all(studentDocsDeletePromises);
    
            // 4. ลบ subcollection checkin (รวมถึง subcollection ภายใน เช่น scores, answers)
            const checkinRef = collection(db, `classroom/${cid}/checkin`);
            const checkinSnap = await getDocs(checkinRef);
            for (const checkinDoc of checkinSnap.docs) {
                const checkinId = checkinDoc.id;
    
                // ลบ subcollection scores
                const scoresRef = collection(db, `classroom/${cid}/checkin/${checkinId}/scores`);
                const scoresSnap = await getDocs(scoresRef);
                const scoresDeletePromises = scoresSnap.docs.map(scoreDoc =>
                    deleteDoc(doc(db, `classroom/${cid}/checkin/${checkinId}/scores`, scoreDoc.id))
                );
                await Promise.all(scoresDeletePromises);
    
                // ลบ subcollection answers (ถ้ามีคำถาม)
                const answersRef = collection(db, `classroom/${cid}/checkin/${checkinId}/answers`);
                const answersSnap = await getDocs(answersRef);
                for (const answerDoc of answersSnap.docs) {
                    const answerId = answerDoc.id;
                    const studentsAnswersRef = collection(db, `classroom/${cid}/checkin/${checkinId}/answers/${answerId}/students`);
                    const studentsAnswersSnap = await getDocs(studentsAnswersRef);
                    const studentsAnswersDeletePromises = studentsAnswersSnap.docs.map(studentDoc =>
                        deleteDoc(doc(db, `classroom/${cid}/checkin/${checkinId}/answers/${answerId}/students`, studentDoc.id))
                    );
                    await Promise.all(studentsAnswersDeletePromises);
                    await deleteDoc(doc(db, `classroom/${cid}/checkin/${checkinId}/answers`, answerId));
                }
    
                // ลบเอกสาร checkin หลัก
                await deleteDoc(doc(db, `classroom/${cid}/checkin`, checkinId));
            }
    
            // 5. ลบเอกสารหลักใน classroom/{cid}
            await deleteDoc(doc(db, "classroom", cid));
    
            // 6. ลบข้อมูลใน users/{teacher.uid}/classroom/{cid} (ของอาจารย์)
            await deleteDoc(doc(db, "users", user.uid, "classroom", cid));
    
            // อัปเดต UI
            setClasses(classes.filter((c) => c.id !== cid));
        } catch (error) {
            console.error("Error deleting class:", error);
        } finally {
            setOpenDialog(false);
            setSelectedClass(null);
        }
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

            <Box sx={{ textAlign: "center", mt: 3, px: 2 }}>
                <Typography variant="h4" gutterBottom>ข้อมูลผู้ใช้</Typography>
                <Card sx={{ maxWidth: 400, mx: "auto", p: 3, textAlign: "center", boxShadow: 3 }}>
                    <Avatar src={userData.photo} sx={{ width: 80, height: 80, mx: "auto", mb: 2 }} />
                    <Typography variant="h6">{userData.name}</Typography>
                    <Typography color="textSecondary">{userData.email}</Typography>
                    <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 2 }}>
                        <Button variant="outlined" color="primary" onClick={() => navigate("/edit-profile")}>
                            แก้ไขข้อมูลส่วนตัว
                        </Button>
                        <Button variant="contained" color="secondary" onClick={() => signOut(auth)}>
                            ออกจากระบบ
                        </Button>
                    </Box>
                </Card>

                <Typography variant="h4" sx={{ mt: 5 }}>ห้องเรียนของฉัน</Typography>
                <Button variant="contained" color="primary" onClick={() => navigate("/add-class")} sx={{ mt: 2, mb: 3 }}>
                    เพิ่มห้องเรียน
                </Button>

                <Grid container spacing={1} justifyContent="center">
                    {classes.map((classData) => (
                        <Grid item xs={12} sm={6} md={3} key={classData.id} sx={{ px: 0.5 }}>
                            <Card sx={{ maxWidth: "100%", boxShadow: 3, height: 300, display: "flex", flexDirection: "column" }}>
                                <CardMedia
                                    component="img"
                                    sx={{ height: 150, objectFit: "cover" }}
                                    image={classData.image || "https://via.placeholder.com/300"}
                                    alt={classData.name}
                                />
                                <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
                                    <Typography variant="h6">{classData.code}</Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        {classData.subject || "ไม่มีคำอธิบาย"}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary" sx={{ mb: "auto" }}>
                                        {classData.name}
                                    </Typography>
                                    <Box sx={{ display: "flex", justifyContent: "center", gap: 1, mt: 1 }}>
                                        <Button variant="outlined" color="primary" onClick={() => navigate(`/classroom/${classData.id}`)}>
                                            จัดการห้องเรียน
                                        </Button>
                                        <Button variant="contained" color="error" onClick={() => confirmDelete(classData)}>
                                            ลบ
                                        </Button>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>

                <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
                    <DialogTitle>ยืนยันการลบ</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            คุณแน่ใจหรือไม่ว่าต้องการลบห้องเรียน "{selectedClass?.code} {selectedClass?.subject} {selectedClass?.name}"? การกระทำนี้ไม่สามารถย้อนกลับได้
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenDialog(false)} color="primary">ยกเลิก</Button>
                        <Button onClick={handleDeleteClass} color="error">ลบ</Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </Box>
    );
};

export default Dashboard;