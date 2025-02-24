import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AppBar, Toolbar, Box, Typography, Card, CardMedia, CardContent, Button } from "@mui/material";
import { QRCodeCanvas } from "qrcode.react";

const CheckinPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [showQRCode, setShowQRCode] = useState(false);
    const { classroom, cid } = location.state || {};

    if (!classroom || !cid) {
        return <Typography>ไม่มีข้อมูลห้องเรียน</Typography>;
    }

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
                </Card>

                <Box sx={{ mt: 1, display: "flex", justifyContent: "center", gap: 2 }}>
                    <Button variant="outlined" color="primary" sx={{ mt: 2 }} onClick={() => navigate(-1)}>
                        กลับไปที่ห้องเรียน
                    </Button>
                    <Button variant="contained" color="secondary" sx={{ mt: 2 }} onClick={() => navigate(-1)}>
                        เพิ่มการเช็คชื่อ
                    </Button>
                </Box>
            </Box>
        </Box>
    );
};

export default CheckinPage;
