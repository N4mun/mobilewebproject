import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { AppBar, Toolbar, Box, Button, TextField, Typography, Card, CardContent } from "@mui/material";

const Questions = () => {
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState("");

  useEffect(() => {
    const fetchQuestions = async () => {
      const querySnapshot = await getDocs(collection(db, "questions"));
      setQuestions(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchQuestions();
  }, []);

  const handleAddQuestion = async () => {
    if (newQuestion.trim() === "") return;
    await addDoc(collection(db, "questions"), { text: newQuestion, createdAt: new Date() });
    setNewQuestion("");
    const querySnapshot = await getDocs(collection(db, "questions"));
    setQuestions(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
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
        <Typography variant="h4">ถามคำถาม</Typography>
        <Card sx={{ maxWidth: 600, mx: "auto", p: 3, mt: 3 }}>
          <TextField
            label="คำถามใหม่"
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />
          <Button variant="contained" color="primary" onClick={handleAddQuestion}>
            เพิ่มคำถาม
          </Button>
        </Card>

        <Box sx={{ mt: 3 }}>
          {questions.map((question) => (
            <Card key={question.id} sx={{ maxWidth: 600, mx: "auto", p: 3, mt: 2 }}>
              <CardContent>
                <Typography>{question.text}</Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default Questions;