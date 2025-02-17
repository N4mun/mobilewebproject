import React, { useEffect, useState } from "react";
import { Button, Card, CardContent, CardMedia, Typography, Avatar, Box, Grid } from "@mui/material";
import { auth, db } from "../firebase";
import { signOut } from "firebase/auth";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
    const user = auth.currentUser;
    const navigate = useNavigate();
    const [userData, setUserData] = useState({ name: "", email: "", photo: "" });
    const [classes, setClasses] = useState([]);

    useEffect(() => {
        if (!user) return; // 🔹 ป้องกัน error ถ้าผู้ใช้ไม่ได้ล็อกอิน

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

    return (
        <Box sx={{ textAlign: "center", mt: 3, px: 2 }}>
            {/* ข้อมูลผู้ใช้ */}
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

            {/* ห้องเรียน */}
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
                                <Box sx={{ display: "flex", justifyContent: "center", mt: 1 }}>
                                    <Button variant="outlined" color="primary" onClick={() => navigate(`/classroom/${classData.id}`)}>
                                        ดูรายละเอียด
                                    </Button>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

        </Box>
    );
};

export default Dashboard;
