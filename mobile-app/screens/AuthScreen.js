import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from '@firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';

const AuthScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);

    const handleAuthentication = async () => {
        setLoading(true);
        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
                Alert.alert('Success', 'Signed in successfully!');
            } else {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const uid = userCredential.user.uid;
                await setDoc(doc(db, 'users', uid), {
                    email: userCredential.user.email,
                    status: 2,
                    createdAt: serverTimestamp(),
                });
                Alert.alert('Success', 'Account created!');
            }
            // แทนที่ replace ด้วย navigate หรือปล่อยให้ onAuthStateChanged จัดการ
            // navigation.replace('Home');
        } catch (error) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{isLogin ? 'Sign In' : 'Sign Up'}</Text>
            <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Email"
                autoCapitalize="none"
            />
            <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Password"
                secureTextEntry
            />
            {loading ? (
                <ActivityIndicator size="small" color="#3498db" />
            ) : (
                <Button
                    title={isLogin ? 'Sign In' : 'Sign Up'}
                    onPress={handleAuthentication}
                    color="#3498db"
                />
            )}
            <Text
                style={styles.toggleText}
                onPress={() => setIsLogin(!isLogin)}
            >
                {isLogin ? 'Need an account? Sign Up' : 'Already have an account? Sign In'}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16, backgroundColor: '#f0f0f0' },
    title: { fontSize: 24, marginBottom: 16 },
    input: { height: 40, borderColor: '#ddd', borderWidth: 1, marginBottom: 16, padding: 8, width: '80%', borderRadius: 4 },
    toggleText: { color: '#3498db', marginTop: 20, textAlign: 'center' },
});

export default AuthScreen;