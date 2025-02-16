import {
    View, Text, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, TextInput, TouchableOpacity
} from 'react-native';
import React, { useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { FIREBASE_AUTH } from '../../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithCredential, GoogleAuthProvider } from 'firebase/auth';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { router } from 'expo-router';

WebBrowser.maybeCompleteAuthSession();

const Page = () => {
    const { type } = useLocalSearchParams<{ type: string }>();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const auth = FIREBASE_AUTH;

    // ✅ Google Sign-In Config
    const [request, response, promptAsync] = Google.useAuthRequest({
        clientId: "YOUR_GOOGLE_CLIENT_ID",
        androidClientId: "YOUR_ANDROID_CLIENT_ID",
        iosClientId: "YOUR_IOS_CLIENT_ID",
        scopes: ["profile", "email"]
    });

    // ✅ Handle Google Sign-In Response
    React.useEffect(() => {
        if (response?.type === "success") {
            const { id_token } = response.params;
            const credential = GoogleAuthProvider.credential(id_token);
            signInWithCredential(auth, credential)
                .then(() => router.replace('/(tabs)'))
                .catch(error => alert('Google Sign-In Failed: ' + error.message));
        }
    }, [response]);

    const signIn = async () => {
        setLoading(true);
        try {
            const user = await signInWithEmailAndPassword(auth, email, password);
            if (user) router.replace('/(tabs)');
        } catch (error: any) {
            alert('Sign in failed: ' + error.message);
        }
        setLoading(false);
    };

    const signUp = async () => {
        setLoading(true);
        try {
            const user = await createUserWithEmailAndPassword(auth, email, password);
            if (user) router.replace('/(tabs)');
        } catch (error: any) {
            alert('Sign up failed: ' + error.message);
        }
        setLoading(false);
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS == 'ios' ? 'padding' : 'height'}
            style={styles.container}
            keyboardVerticalOffset={1}
        >
            {loading && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size='large' color='#fff' />
                </View>
            )}

            <Text style={styles.title}>
                {type === 'login' ? 'Welcome back' : 'Create your account'}
            </Text>

            <View style={{ marginBottom: 20 }}>
                <TextInput
                    autoCapitalize='none'
                    placeholder='Email'
                    style={styles.inputField}
                    value={email}
                    onChangeText={setEmail}
                />
                <TextInput
                    autoCapitalize='none'
                    placeholder='Password'
                    style={styles.inputField}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />
            </View>

            {type === 'login' ? (
                <TouchableOpacity onPress={signIn} style={styles.btnPrimary}>
                    <Text style={styles.btnPrimaryText}>Login</Text>
                </TouchableOpacity>
            ) : (
                <TouchableOpacity onPress={signUp} style={styles.btnPrimary}>
                    <Text style={styles.btnPrimaryText}>Create Account</Text>
                </TouchableOpacity>
            )}

            {/* ✅ ปุ่ม Google Sign-In */}
            <TouchableOpacity onPress={() => promptAsync()} style={styles.btnGoogle}>
                <Text style={styles.btnGoogleText}>Sign in with Google</Text>
            </TouchableOpacity>

        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    title: {
        fontSize: 30,
        alignSelf: 'center',
        fontWeight: 'bold',
    },
    inputField: {
        marginVertical: 4,
        height: 50,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 12,
        padding: 10,
        backgroundColor: '#fff',
    },
    btnPrimary: {
        backgroundColor: "#007bff",
        padding: 15,
        borderRadius: 10,
        marginVertical: 10,
        alignItems: 'center',
    },
    btnPrimaryText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    btnGoogle: {
        backgroundColor: "#DB4437",
        padding: 15,
        borderRadius: 10,
        marginVertical: 10,
        alignItems: 'center',
    },
    btnGoogleText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999, // หรือค่าที่สูงเพื่อให้ overlay ปกคลุมหน้าจอ
    },
});

export default Page;
