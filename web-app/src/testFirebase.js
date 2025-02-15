import { db } from "./firebase";
import { collection, addDoc } from "firebase/firestore";

async function testFirestore() {
    try {
        const docRef = await addDoc(collection(db, "testCollection"), {
            message: "Hello Firebase!",
            timestamp: new Date(),
        });
        console.log("Document written with ID: ", docRef.id);
    } catch (error) {
        console.error("Error adding document: ", error);
    }
}

testFirestore();
