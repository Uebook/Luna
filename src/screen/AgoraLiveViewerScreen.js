// AgoraLiveViewerScreen.js
// Screen for users to watch live streams
import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    ScrollView,
    Image,
} from 'react-native';
import { RtcEngine, ChannelProfileType, ClientRoleType, RtcSurfaceView } from 'react-native-agora';
import Icon from 'react-native-vector-icons/Feather';
import StandardHeader from '../components/StandardHeader';
import { useTheme } from '../context/ThemeContext';
import { liveStreamAPI, getUserId } from '../services/api';

// Agora Configuration - Should be moved to config file
const AGORA_APP_ID = 'YOUR_AGORA_APP_ID'; // Replace with actual App ID

const AgoraLiveViewerScreen = ({ navigation, route }) => {
    const { theme } = useTheme();
    const { stream } = route.params || {};
    const [isJoined, setIsJoined] = useState(false);
    const [loading, setLoading] = useState(false);
    const [viewerCount, setViewerCount] = useState(stream?.viewerCount || 0);
    const [likes, setLikes] = useState(stream?.likes || 0);
    const [isLiked, setIsLiked] = useState(false);
    const [agoraToken, setAgoraToken] = useState(null);
    const [remoteUid, setRemoteUid] = useState(null);
    const agoraEngine = useRef(null);

    useEffect(() => {
        if (stream?.channelName) {
            joinStream();
        }
        return () => {
            leaveStream();
        };
    }, [stream]);

    const joinStream = async () => {
        try {
            setLoading(true);

            // Initialize Agora RTC Engine
            agoraEngine.current = await RtcEngine.create(AGORA_APP_ID);

            // Enable video
            await agoraEngine.current.enableVideo();

            // Enable audio
            await agoraEngine.current.enableAudio();

            // Set channel profile to live broadcasting
            await agoraEngine.current.setChannelProfile(ChannelProfileType.ChannelProfileLiveBroadcasting);

            // Set client role to audience
            await agoraEngine.current.setClientRole(ClientRoleType.ClientRoleAudience);

            // Set up event handlers
            agoraEngine.current.addListener('JoinChannelSuccess', (channel, uid, elapsed) => {
                console.log('JoinChannelSuccess', channel, uid, elapsed);
                setIsJoined(true);
                setLoading(false);
            });

            agoraEngine.current.addListener('UserJoined', (uid, elapsed) => {
                console.log('UserJoined (Broadcaster)', uid);
                setRemoteUid(uid);
            });

            agoraEngine.current.addListener('UserOffline', (uid, reason) => {
                console.log('UserOffline (Broadcaster)', uid);
                Alert.alert('Stream Ended', 'The broadcaster has ended the stream.', [
                    { text: 'OK', onPress: () => navigation.goBack() },
                ]);
            });

            agoraEngine.current.addListener('Error', (err) => {
                console.error('Agora Error:', err);
                Alert.alert('Streaming Error', err.message || 'An error occurred while watching the stream');
                setLoading(false);
            });

            // Get user ID
            const userId = await getUserId();

            // Get Agora token from backend
            const tokenResponse = await liveStreamAPI.getAgoraToken(
                stream.channelName,
                userId || 0,
                'audience'
            );

            if (tokenResponse.data.success && tokenResponse.data.token) {
                setAgoraToken(tokenResponse.data.token);

                // Join Agora channel
                await agoraEngine.current.joinChannel(
                    tokenResponse.data.token,
                    stream.channelName,
                    null, // uid (0 means auto-generate)
                    {
                        clientRoleType: ClientRoleType.ClientRoleAudience,
                    }
                );

                // Track viewer join
                if (userId && stream.id) {
                    await liveStreamAPI.viewerJoin(stream.id, userId);
                }
            } else {
                throw new Error('Failed to get Agora token');
            }
        } catch (error) {
            console.error('Join stream error:', error);
            Alert.alert('Error', error.response?.data?.message || 'Failed to join stream. Please try again.');
            setLoading(false);
        }
    };

    const leaveStream = async () => {
        try {
            if (isJoined && agoraEngine.current) {
                await agoraEngine.current.leaveChannel();
            }
            if (agoraEngine.current) {
                await agoraEngine.current.destroy();
            }
            if (stream?.id) {
                const userId = await getUserId();
                if (userId) {
                    await liveStreamAPI.viewerLeave(stream.id, userId);
                }
            }
        } catch (error) {
            console.error('Leave stream error:', error);
        }
    };

    const handleLike = async () => {
        try {
            const newLiked = !isLiked;
            setIsLiked(newLiked);
            setLikes(prev => newLiked ? prev + 1 : prev - 1);

            const userId = await getUserId();
            if (userId && stream.id) {
                await liveStreamAPI.likeStream(stream.id, userId);
            }
        } catch (error) {
            console.error('Like error:', error);
            // Revert on error
            setIsLiked(!isLiked);
            setLikes(prev => isLiked ? prev - 1 : prev + 1);
        }
    };

    const handleShare = async () => {
        try {
            const Share = require('react-native').Share;
            await Share.share({
                message: `Watch ${stream?.title || 'this live stream'} on Luna!`,
                url: `luna://stream/${stream?.id}`,
            });
        } catch (error) {
            console.error('Share error:', error);
        }
    };

    const styles = createStyles(theme);

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <StandardHeader
                    title={stream?.title || 'Live Stream'}
                    navigation={navigation}
                    showGradient={true}
                />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.p3} />
                    <Text style={styles.loadingText}>Joining stream...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StandardHeader
                title={stream?.title || 'Live Stream'}
                navigation={navigation}
                showGradient={true}
            />

            <View style={styles.content}>
                <View style={styles.videoContainer}>
                    {isJoined && remoteUid ? (
                        <RtcSurfaceView
                            canvas={{ uid: remoteUid }}
                            style={styles.video}
                        />
                    ) : (
                        <View style={styles.videoPlaceholder}>
                            <ActivityIndicator size="large" color={theme.p3} />
                            <Text style={styles.placeholderText}>Connecting to stream...</Text>
                        </View>
                    )}

                    {/* Live indicator */}
                    <View style={styles.liveBadge}>
                        <View style={styles.liveDot} />
                        <Text style={styles.liveText}>LIVE</Text>
                    </View>

                    {/* Viewer count */}
                    <View style={styles.viewerBadge}>
                        <Icon name="eye" size={16} color="#fff" />
                        <Text style={styles.viewerText}>{viewerCount}</Text>
                    </View>
                </View>

                {/* Stream info */}
                <View style={styles.infoContainer}>
                    <View style={styles.infoHeader}>
                        <View style={styles.broadcasterInfo}>
                            {stream?.broadcasterAvatar && (
                                <Image
                                    source={{ uri: stream.broadcasterAvatar }}
                                    style={styles.avatar}
                                />
                            )}
                            <View>
                                <Text style={styles.broadcasterName}>
                                    {stream?.broadcasterName || 'Broadcaster'}
                                </Text>
                                <Text style={styles.streamTitle}>
                                    {stream?.title || 'Live Stream'}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {stream?.description && (
                        <Text style={styles.description}>{stream.description}</Text>
                    )}

                    {/* Actions */}
                    <View style={styles.actionsContainer}>
                        <TouchableOpacity
                            style={[styles.actionButton, isLiked && styles.actionButtonActive]}
                            onPress={handleLike}
                        >
                            <Icon
                                name={isLiked ? 'heart' : 'heart'}
                                size={24}
                                color={isLiked ? '#ff3b30' : theme.text}
                                fill={isLiked ? '#ff3b30' : 'none'}
                            />
                            <Text style={[styles.actionText, isLiked && styles.actionTextActive]}>
                                {likes}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={handleShare}
                        >
                            <Icon name="share-2" size={24} color={theme.text} />
                            <Text style={styles.actionText}>Share</Text>
                        </TouchableOpacity>
                    </View>
                </View>
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
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        color: theme.sub,
        fontSize: 16,
    },
    videoContainer: {
        width: '100%',
        height: 300,
        backgroundColor: '#000',
        position: 'relative',
    },
    video: {
        width: '100%',
        height: '100%',
    },
    videoPlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderText: {
        color: theme.muted,
        marginTop: 12,
    },
    liveBadge: {
        position: 'absolute',
        top: 12,
        left: 12,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 59, 48, 0.9)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 6,
    },
    liveDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#fff',
    },
    liveText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    viewerBadge: {
        position: 'absolute',
        top: 12,
        right: 12,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 6,
    },
    viewerText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    infoContainer: {
        padding: 16,
    },
    infoHeader: {
        marginBottom: 12,
    },
    broadcasterInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
    },
    broadcasterName: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.text,
    },
    streamTitle: {
        fontSize: 14,
        color: theme.sub,
        marginTop: 2,
    },
    description: {
        fontSize: 14,
        color: theme.sub,
        marginBottom: 16,
        lineHeight: 20,
    },
    actionsContainer: {
        flexDirection: 'row',
        gap: 16,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        padding: 12,
        borderRadius: 8,
        backgroundColor: theme.card,
    },
    actionButtonActive: {
        backgroundColor: theme.line,
    },
    actionText: {
        fontSize: 16,
        color: theme.text,
        fontWeight: '600',
    },
    actionTextActive: {
        color: '#ff3b30',
    },
});

export default AgoraLiveViewerScreen;




