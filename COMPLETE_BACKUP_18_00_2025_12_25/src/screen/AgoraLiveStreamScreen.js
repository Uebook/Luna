// AgoraLiveStreamScreen.js
// Screen for celebrities/vendors to broadcast live streams
import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    Alert,
    Platform,
    PermissionsAndroid,
    ActivityIndicator,
} from 'react-native';
import { RtcEngine, ChannelProfileType, ClientRoleType } from 'react-native-agora';
import Icon from 'react-native-vector-icons/Feather';
import StandardHeader from '../components/StandardHeader';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';

// Agora Configuration - Should be moved to config file
const AGORA_APP_ID = 'YOUR_AGORA_APP_ID'; // Replace with actual App ID
const AGORA_APP_CERTIFICATE = 'YOUR_AGORA_APP_CERTIFICATE'; // Replace with actual Certificate

const AgoraLiveStreamScreen = ({ navigation, route }) => {
    const { theme } = useTheme();
    const [isStreaming, setIsStreaming] = useState(false);
    const [viewerCount, setViewerCount] = useState(0);
    const [streamId, setStreamId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [agoraToken, setAgoraToken] = useState(null);
    const [channelName, setChannelName] = useState(null);
    const agoraEngine = useRef(null);

    useEffect(() => {
        initializeAgora();
        return () => {
            cleanup();
        };
    }, []);

    const initializeAgora = async () => {
        try {
            // Request camera and microphone permissions
            const granted = await requestPermissions();
            if (!granted) {
                Alert.alert('Permission Denied', 'Camera and microphone permissions are required for live streaming.');
                navigation.goBack();
                return;
            }

            // Initialize Agora RTC Engine
            agoraEngine.current = await RtcEngine.create(AGORA_APP_ID);
            
            // Enable video
            await agoraEngine.current.enableVideo();
            
            // Enable audio
            await agoraEngine.current.enableAudio();
            
            // Set channel profile to live broadcasting
            await agoraEngine.current.setChannelProfile(ChannelProfileType.ChannelProfileLiveBroadcasting);
            
            // Set client role to broadcaster
            await agoraEngine.current.setClientRole(ClientRoleType.ClientRoleBroadcaster);

            // Set up event handlers
            agoraEngine.current.addListener('JoinChannelSuccess', (channel, uid, elapsed) => {
                console.log('JoinChannelSuccess', channel, uid, elapsed);
                setIsStreaming(true);
                setLoading(false);
            });

            agoraEngine.current.addListener('UserJoined', (uid, elapsed) => {
                console.log('UserJoined', uid);
                setViewerCount(prev => prev + 1);
            });

            agoraEngine.current.addListener('UserOffline', (uid, reason) => {
                console.log('UserOffline', uid);
                setViewerCount(prev => Math.max(0, prev - 1));
            });

            agoraEngine.current.addListener('Error', (err) => {
                console.error('Agora Error:', err);
                Alert.alert('Streaming Error', err.message || 'An error occurred during streaming');
                setLoading(false);
            });

        } catch (error) {
            console.error('Agora initialization error:', error);
            Alert.alert('Initialization Error', 'Failed to initialize streaming. Please try again.');
            setLoading(false);
        }
    };

    const requestPermissions = async () => {
        if (Platform.OS === 'android') {
            try {
                const granted = await PermissionsAndroid.requestMultiple([
                    PermissionsAndroid.PERMISSIONS.CAMERA,
                    PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
                ]);
                return (
                    granted['android.permission.CAMERA'] === PermissionsAndroid.RESULTS.GRANTED &&
                    granted['android.permission.RECORD_AUDIO'] === PermissionsAndroid.RESULTS.GRANTED
                );
            } catch (err) {
                console.warn(err);
                return false;
            }
        }
        return true; // iOS permissions are handled via Info.plist
    };

    const startStream = async () => {
        try {
            setLoading(true);

            // Generate unique channel name
            const generatedChannelName = `stream_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            setChannelName(generatedChannelName);

            // Get Agora token from backend
            const tokenResponse = await api.post('/stream/agora-token', {
                channelName: generatedChannelName,
                role: 'broadcaster',
            });

            if (tokenResponse.data.success && tokenResponse.data.token) {
                setAgoraToken(tokenResponse.data.token);
                
                // Create stream record in backend
                const streamResponse = await api.post('/stream/create', {
                    channelName: generatedChannelName,
                    title: route?.params?.title || 'Live Stream',
                    description: route?.params?.description || '',
                });

                if (streamResponse.data.success) {
                    setStreamId(streamResponse.data.stream.id);

                    // Join Agora channel
                    await agoraEngine.current.joinChannel(
                        tokenResponse.data.token,
                        generatedChannelName,
                        null, // uid (0 means auto-generate)
                        {
                            clientRoleType: ClientRoleType.ClientRoleBroadcaster,
                        }
                    );
                } else {
                    throw new Error('Failed to create stream record');
                }
            } else {
                throw new Error('Failed to get Agora token');
            }
        } catch (error) {
            console.error('Start stream error:', error);
            Alert.alert('Error', error.response?.data?.message || 'Failed to start stream. Please try again.');
            setLoading(false);
        }
    };

    const endStream = async () => {
        try {
            setLoading(true);

            // Leave Agora channel
            if (agoraEngine.current) {
                await agoraEngine.current.leaveChannel();
            }

            // End stream in backend
            if (streamId) {
                await api.post('/stream/end', {
                    streamId: streamId,
                });
            }

            setIsStreaming(false);
            setViewerCount(0);
            setStreamId(null);
            setAgoraToken(null);
            setChannelName(null);
            setLoading(false);

            Alert.alert('Stream Ended', 'Your live stream has been ended successfully.', [
                { text: 'OK', onPress: () => navigation.goBack() },
            ]);
        } catch (error) {
            console.error('End stream error:', error);
            Alert.alert('Error', 'Failed to end stream properly.');
            setLoading(false);
        }
    };

    const cleanup = async () => {
        try {
            if (isStreaming && agoraEngine.current) {
                await agoraEngine.current.leaveChannel();
            }
            if (agoraEngine.current) {
                await agoraEngine.current.destroy();
            }
        } catch (error) {
            console.error('Cleanup error:', error);
        }
    };

    const styles = createStyles(theme);

    return (
        <SafeAreaView style={styles.container}>
            <StandardHeader
                title="Live Stream"
                navigation={navigation}
                showGradient={true}
            />
            
            <View style={styles.content}>
                {!isStreaming ? (
                    <View style={styles.startContainer}>
                        <Icon name="video" size={80} color={theme.p3} />
                        <Text style={styles.title}>Start Live Stream</Text>
                        <Text style={styles.subtitle}>
                            Share your products with your audience in real-time
                        </Text>
                        
                        <TouchableOpacity
                            style={[styles.button, styles.startButton]}
                            onPress={startStream}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <>
                                    <Icon name="play" size={20} color="#fff" />
                                    <Text style={styles.buttonText}>Start Streaming</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.streamingContainer}>
                        <View style={styles.videoContainer}>
                            {/* Agora video view will be rendered here */}
                            <View style={styles.videoPlaceholder}>
                                <Icon name="video" size={60} color={theme.muted} />
                                <Text style={styles.videoPlaceholderText}>Live Stream Active</Text>
                            </View>
                        </View>

                        <View style={styles.statsContainer}>
                            <View style={styles.statItem}>
                                <Icon name="eye" size={20} color={theme.p3} />
                                <Text style={styles.statText}>{viewerCount} Viewers</Text>
                            </View>
                            <View style={styles.statItem}>
                                <View style={styles.liveIndicator} />
                                <Text style={styles.liveText}>LIVE</Text>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={[styles.button, styles.endButton]}
                            onPress={endStream}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <>
                                    <Icon name="square" size={20} color="#fff" />
                                    <Text style={styles.buttonText}>End Stream</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
};

const createStyles = (theme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.bg,
    },
    content: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
    },
    startContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: theme.text,
        marginTop: 20,
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: theme.sub,
        textAlign: 'center',
        marginBottom: 40,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 12,
        gap: 10,
    },
    startButton: {
        backgroundColor: theme.p3,
    },
    endButton: {
        backgroundColor: '#ff3b30',
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    streamingContainer: {
        flex: 1,
    },
    videoContainer: {
        flex: 1,
        backgroundColor: '#000',
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 20,
    },
    videoPlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    videoPlaceholderText: {
        color: theme.muted,
        fontSize: 16,
        marginTop: 10,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        padding: 16,
        backgroundColor: theme.card,
        borderRadius: 12,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    statText: {
        color: theme.text,
        fontSize: 16,
        fontWeight: '600',
    },
    liveIndicator: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#ff3b30',
    },
    liveText: {
        color: '#ff3b30',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 4,
    },
});

export default AgoraLiveStreamScreen;




