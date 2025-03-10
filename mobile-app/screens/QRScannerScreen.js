import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import QrScanner from 'react-qr-scanner';

const QRScannerScreen = () => {
    const navigation = useNavigation();
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);
    const [useBackCamera, setUseBackCamera] = useState(true);

    useEffect(() => {
        if (Platform.OS !== 'web' && !permission?.granted) {
            requestPermission();
        }
    }, [permission]);

    const handleScan = (data) => {
        if (data) {
            setScanned(true);
            console.log("Scanned QR Code:", data.text);
            navigation.navigate('AddCourse', { scannedData: data.text });
        }
    };

    const handleError = (err) => {
        console.error("QR Scan Error:", err);
    };

    
    if (Platform.OS === 'web') {
        return (
            <View style={styles.container}>
                <Text>Scan QR Code</Text>
                <QrScanner
                    delay={300}
                    onScan={handleScan}
                    onError={handleError}
                    style={styles.camera}
                    constraints={{
                        video: {
                            facingMode: useBackCamera ? "environment" : "user",
                        }
                    }}
                />
                <View style={styles.buttonContainer}>
                    <Button title="Switch Camera" onPress={() => setUseBackCamera(!useBackCamera)} />
                    {scanned && <Button title="Scan Again" onPress={() => setScanned(false)} />}
                </View>
            </View>
        );
    }

    
    if (!permission) {
        return <Text>Requesting camera permission...</Text>;
    }
    if (!permission.granted) {
        return (
            <View style={styles.container}>
                <Text>No access to camera</Text>
                <Button title="Grant Permission" onPress={requestPermission} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <CameraView
                style={StyleSheet.absoluteFillObject}
                facing={useBackCamera ? "back" : "front"}
                onBarcodeScanned={scanned ? undefined : ({ data }) => handleScan({ text: data })}
            />
            <View style={styles.buttonContainer}>
                <Button title="Switch Camera" onPress={() => setUseBackCamera(!useBackCamera)} />
                {scanned && <Button title="Scan Again" onPress={() => setScanned(false)} />}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    camera: { flex: 1, width: '100%' },
    buttonContainer: { marginTop: 10, flexDirection: 'row', gap: 10 },
});

export default QRScannerScreen;
