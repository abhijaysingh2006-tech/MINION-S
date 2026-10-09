import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Audio } from 'expo-av';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');

const MOCK_TRACKS = [
  {
    id: '1',
    title: 'Banana Groove (Summer Beat)',
    artist: 'DJ Stuart',
    cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600',
    audioUrl: 'https://cdn.freesound.org/previews/612/612613_5674468-lq.mp3',
  },
  {
    id: '2',
    title: 'Midnight Goggle Drive',
    artist: 'The Gru-vers',
    cover: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600',
    audioUrl: 'https://cdn.freesound.org/previews/536/536108_5674468-lq.mp3',
  },
];

export default function App() {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(MOCK_TRACKS[0]);
  const [activeTab, setActiveTab] = useState<'home' | 'search' | 'library' | 'profile'>('home');

  useEffect(() => {
    // Configure background audio mode for iOS/Android
    Audio.setAudioModeAsync({
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });

    return () => {
      sound?.unloadAsync();
    };
  }, [sound]);

  async function playAudio(track: typeof MOCK_TRACKS[0]) {
    try {
      if (sound) {
        await sound.unloadAsync();
      }
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: track.audioUrl },
        { shouldPlay: true }
      );
      setSound(newSound);
      setCurrentTrack(track);
      setIsPlaying(true);

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlaying(false);
        }
      });
    } catch (e) {
      console.warn(e);
    }
  }

  async function togglePlayPause() {
    if (!sound) {
      await playAudio(currentTrack);
      return;
    }
    if (isPlaying) {
      await sound.pauseAsync();
      setIsPlaying(false);
    } else {
      await sound.playAsync();
      setIsPlaying(true);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <View style={styles.avatarGoggle} />
          <Text style={styles.brandTitle}>Minion</Text>
        </View>
        <View style={styles.adFreePill}>
          <Text style={styles.adFreeText}>ZERO ADS</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Trending Tracks</Text>
        {MOCK_TRACKS.map((t) => (
          <TouchableOpacity
            key={t.id}
            style={styles.trackCard}
            onPress={() => playAudio(t)}
          >
            <Image source={{ uri: t.cover }} style={styles.trackImage} />
            <View style={styles.trackInfo}>
              <Text style={styles.trackTitle}>{t.title}</Text>
              <Text style={styles.trackArtist}>{t.artist}</Text>
            </View>
            <Text style={styles.playArrow}>{currentTrack.id === t.id && isPlaying ? '⏸' : '▶'}</Text>
          </TouchableOpacity>
        ))}

        {/* Empty state message demonstration */}
        <View style={styles.emptyStateContainer}>
          <Text style={styles.emptyStateEmoji}>🍌</Text>
          <Text style={styles.emptyStateTitle}>Nothing here yet, go find some bangers!</Text>
        </View>
      </ScrollView>

      {/* Persistent Mini Player */}
      <View style={styles.miniPlayer}>
        <Image source={{ uri: currentTrack.cover }} style={styles.miniCover} />
        <View style={styles.miniInfo}>
          <Text style={styles.miniTitle} numberOfLines={1}>
            {currentTrack.title}
          </Text>
          <Text style={styles.miniArtist} numberOfLines={1}>
            {currentTrack.artist}
          </Text>
        </View>
        <TouchableOpacity style={styles.playButton} onPress={togglePlayPause}>
          <Text style={styles.playButtonIcon}>{isPlaying ? '❚❚' : '▶'}</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Tab Bar */}
      <View style={styles.tabBar}>
        {(['home', 'search', 'library', 'profile'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={styles.tabItem}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.tabTextActive,
              ]}
            >
              {tab.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F12',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarGoggle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFD60A',
    marginRight: 10,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  adFreePill: {
    backgroundColor: '#2B5BA8',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  adFreeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  content: {
    padding: 20,
    paddingBottom: 150,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 14,
  },
  trackCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#18191E',
    padding: 12,
    borderRadius: 14,
    marginBottom: 12,
  },
  trackImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  trackInfo: {
    flex: 1,
    marginLeft: 14,
  },
  trackTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  trackArtist: {
    color: '#94A3B8',
    fontSize: 13,
    marginTop: 2,
  },
  playArrow: {
    fontSize: 18,
    color: '#FFD60A',
    paddingRight: 8,
  },
  emptyStateContainer: {
    alignItems: 'center',
    marginTop: 40,
    padding: 20,
  },
  emptyStateEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  emptyStateTitle: {
    color: '#94A3B8',
    fontSize: 14,
    textAlign: 'center',
  },
  miniPlayer: {
    position: 'absolute',
    bottom: 60,
    left: 10,
    right: 10,
    height: 64,
    backgroundColor: '#1E2028',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#2B5BA8',
  },
  miniCover: {
    width: 44,
    height: 44,
    borderRadius: 8,
  },
  miniInfo: {
    flex: 1,
    marginLeft: 12,
  },
  miniTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  miniArtist: {
    color: '#94A3B8',
    fontSize: 12,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFD60A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButtonIcon: {
    fontSize: 14,
    color: '#000000',
    fontWeight: '900',
  },
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: '#0F0F12',
    borderTopWidth: 1,
    borderTopColor: '#18191E',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tabItem: {
    alignItems: 'center',
  },
  tabText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
  },
  tabTextActive: {
    color: '#FFD60A',
  },
});
