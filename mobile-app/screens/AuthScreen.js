import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
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
                    createdAt: serverTimestamp(),
                });
                Alert.alert('Success', 'Account created!');
            }
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
                placeholderTextColor="#999"
            />
            <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Password"
                secureTextEntry
                placeholderTextColor="#999"
            />

            {loading ? (
                <ActivityIndicator size="small" color="#3498db" />
            ) : (
                <TouchableOpacity
                    style={styles.button}
                    onPress={handleAuthentication}
                    disabled={loading}
                >
                    <Text style={styles.buttonText}>{isLogin ? 'Sign In' : 'Sign Up'}</Text>
                </TouchableOpacity>
            )}

            <TouchableOpacity
                style={styles.toggleButton}
                onPress={() => setIsLogin(!isLogin)}
            >
                <Text style={styles.toggleText}>
                    {isLogin ? 'Need an account? Sign Up' : 'Already have an account? Sign In'}
                </Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
    },
    input: {
        width: '80%',
        padding: 12,
        borderWidth: 1,
        borderColor: '#ccc',
        marginBottom: 15,
        borderRadius: 8,
        backgroundColor: '#fff',
        fontSize: 16,
    },
    button: {
        width: '80%',
        padding: 12,
        backgroundColor: '#3498db',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    toggleButton: {
        marginTop: 20,
    },
    toggleText: {
        color: '#3498db',
        fontSize: 16,
        textAlign: 'center',
    },
});

export default AuthScreen;