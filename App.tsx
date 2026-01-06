/**
 * Pomodoro Timer App
 * Beautiful, modern Pomodoro timer for iOS
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
  Platform,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

type TimerMode = 'work' | 'break' | 'longBreak';

function App(): React.JSX.Element {
  const [seconds, setSeconds] = useState(25 * 60); // 25 minutes in seconds
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<TimerMode>('work');
  const [completedSessions, setCompletedSessions] = useState(0);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  const WORK_TIME = 25 * 60;
  const BREAK_TIME = 5 * 60;
  const LONG_BREAK_TIME = 15 * 60;

  const handleTimerComplete = React.useCallback(() => {
    setIsActive(false);
    if (mode === 'work') {
      const newSessions = completedSessions + 1;
      setCompletedSessions(newSessions);
      // Every 4 sessions, take a long break
      if (newSessions % 4 === 0) {
        setMode('longBreak');
        setSeconds(LONG_BREAK_TIME);
      } else {
        setMode('break');
        setSeconds(BREAK_TIME);
      }
    } else {
      setMode('work');
      setSeconds(WORK_TIME);
    }
  }, [mode, completedSessions, WORK_TIME, BREAK_TIME, LONG_BREAK_TIME]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (isActive && seconds > 0) {
      interval = setInterval(() => {
        setSeconds(prev => prev - 1);
      }, 1000);
    } else if (seconds === 0) {
      // Timer completed
      handleTimerComplete();
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, seconds, handleTimerComplete]);

  useEffect(() => {
    // Pulse animation when active
    if (isActive) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isActive, pulseAnim]);

  useEffect(() => {
    // Update progress animation
    const maxTime = mode === 'work' ? WORK_TIME : mode === 'break' ? BREAK_TIME : LONG_BREAK_TIME;
    const progress = 1 - (seconds / maxTime);
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [seconds, mode, WORK_TIME, BREAK_TIME, LONG_BREAK_TIME, progressAnim]);



  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setSeconds(mode === 'work' ? WORK_TIME : mode === 'break' ? BREAK_TIME : LONG_BREAK_TIME);
  };

  const skipTimer = () => {
    setSeconds(0);
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  const getModeColor = () => {
    switch (mode) {
      case 'work':
        return '#FF6B6B';
      case 'break':
        return '#4ECDC4';
      case 'longBreak':
        return '#45B7D1';
      default:
        return '#FF6B6B';
    }
  };

  const getModeText = () => {
    switch (mode) {
      case 'work':
        return 'Focus Time';
      case 'break':
        return 'Short Break';
      case 'longBreak':
        return 'Long Break';
      default:
        return 'Focus Time';
    }
  };

  const modeColor = getModeColor();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: modeColor }]}>
      <StatusBar barStyle="light-content" backgroundColor={modeColor} />

      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.modeText}>{getModeText()}</Text>
          <View style={styles.sessionContainer}>
            <Text style={styles.sessionText}>Session {completedSessions + 1}</Text>
            <View style={styles.dots}>
              {[0, 1, 2, 3].map((_, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.dot,
                    (completedSessions % 4) > idx && styles.dotActive,
                  ]}
                />
              ))}
            </View>
          </View>
        </View>

        {/* Timer Circle */}
        <View style={styles.timerContainer}>
          <Animated.View
            style={[
              styles.timerCircle,
              {
                transform: [{ scale: pulseAnim }],
              },
            ]}
          >
            <View style={styles.timerInner}>
              <Text style={styles.timerText}>{formatTime(seconds)}</Text>
              <Text style={styles.timerLabel}>
                {isActive ? 'In Progress' : 'Ready'}
              </Text>
            </View>
          </Animated.View>

          {/* Progress Ring */}
          <Animated.View
            style={[
              styles.progressRing,
              {
                opacity: progressAnim,
              },
            ]}
          />
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={resetTimer}
          >
            <Text style={styles.secondaryButtonText}>Reset</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={toggleTimer}
          >
            <Text style={styles.primaryButtonText}>
              {isActive ? 'Pause' : 'Start'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={skipTimer}
          >
            <Text style={styles.secondaryButtonText}>Skip</Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{completedSessions}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {Math.floor(completedSessions * 25 / 60)}h {(completedSessions * 25) % 60}m
            </Text>
            <Text style={styles.statLabel}>Total Time</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 20 : 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  modeText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  sessionContainer: {
    alignItems: 'center',
  },
  sessionText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
    fontWeight: '500',
  },
  dots: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  dotActive: {
    backgroundColor: '#FFFFFF',
  },
  timerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 60,
    position: 'relative',
  },
  timerCircle: {
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: width * 0.35,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  timerInner: {
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: width * 0.3,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerText: {
    fontSize: 56,
    fontWeight: '700',
    color: '#2C3E50',
    letterSpacing: 2,
  },
  timerLabel: {
    fontSize: 16,
    color: '#7F8C8D',
    marginTop: 8,
    fontWeight: '500',
  },
  progressRing: {
    position: 'absolute',
    width: width * 0.72,
    height: width * 0.72,
    borderRadius: width * 0.36,
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 40,
    gap: 12,
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  primaryButton: {
    backgroundColor: '#FFFFFF',
    flex: 2,
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    flex: 1,
  },
  primaryButtonText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2C3E50',
    textAlign: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  stats: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    padding: 24,
    marginTop: 40,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
});

export default App;
