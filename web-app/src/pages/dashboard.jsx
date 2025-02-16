import React, { useEffect, useState } from "react";
import { Button, Card, CardContent, CardMedia, Typography, Avatar, Grid } from "@mui/material";
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
        if (user) {
            const fetchUserData = async () => {
                const userRef = doc(db, "users", user.uid);
                const userSnap = await getDoc(userRef);
                if (userSnap.exists()) {
                    setUserData(userSnap.data());
                }
            };

            const fetchUserClasses = async () => {
                const q = query(collection(db, "classroom"), where("owner", "==", user.uid));
                const querySnapshot = await getDocs(q);
                const classList = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setClasses(classList);
            };

            fetchUserData();
            fetchUserClasses();
        }
    }, [user]);

    return (
        <div style={{ textAlign: "center", marginTop: "20px", padding: "20px" }}>
            <Typography variant="h4">ข้อมูลผู้ใช้</Typography>

            <Card style={{ maxWidth: 400, margin: "20px auto", padding: "20px" }}>
                <Avatar src={userData.photo} style={{ width: 80, height: 80, margin: "auto" }} />

                <Typography variant="h6">{userData.name}</Typography>
                <Typography color="textSecondary">{userData.email}</Typography>

                <Button
                    variant="outlined"
                    color="primary"
                    style={{ marginTop: 10 }}
                    onClick={() => navigate("/edit-profile")}
                >
                    แก้ไขข้อมูลส่วนตัว
                </Button>

                <Button
                    variant="contained"
                    color="secondary"
                    style={{ marginTop: 10 }}
                    onClick={() => signOut(auth)}
                >
                    ออกจากระบบ
                </Button>
            </Card>

            <Typography variant="h4" style={{ marginTop: "20px" }}>
                ห้องเรียนของฉัน
            </Typography>

            <Grid container spacing={3} style={{ marginTop: "10px" }}>
                {classes.map((classData) => (
                    <Grid item xs={12} sm={6} md={4} key={classData.id}>
                        <Card>
                            <CardMedia
                                component="img"
                                height="140"
                                image={classData.image || "https://via.placeholder.com/300"}
                                alt={classData.name}
                            />
                            <CardContent>
                                <Typography variant="h6">{classData.name}</Typography>
                                <Typography variant="body2" color="textSecondary">
                                    {classData.subject || "ไม่มีคำอธิบาย"}
                                </Typography>
                                <Button
                                    variant="outlined"
                                    color="primary"
                                    onClick={() => navigate(`/classroom/${classData.id}`)}
                                    style={{ marginTop: 10 }}
                                >
                                    ดูรายละเอียด
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Button variant="contained" color="primary" onClick={() => navigate("/add-class")} style={{ marginTop: "20px" }}>
                เพิ่มห้องเรียน
            </Button>
        </div>
    );
};

export default Dashboard;
