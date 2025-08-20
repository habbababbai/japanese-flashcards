import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Alert } from 'react-native';
import { StudyScreen } from './src/screens/StudyScreen';
import { hiraganaData } from './src/data/hiragana';
import { StudyProgress } from './src/types';

export default function App() {
    const handleStudyComplete = (progress: StudyProgress[]) => {
        const correctCount = progress.filter(p => p.isCorrect).length;
        const totalCount = progress.length;

        Alert.alert(
            'Study Session Complete! 🎉',
            `You got ${correctCount} out of ${totalCount} correct!`,
            [{ text: 'OK' }]
        );

        console.log('Study session completed:', progress);
    };

    const handleBack = () => {
        // For now, just show a message
        Alert.alert('Back to Home', 'This would go back to the main menu', [
            { text: 'OK' },
        ]);
    };

    return (
        <View style={styles.container}>
            <StudyScreen
                kanaList={hiraganaData}
                onComplete={handleStudyComplete}
                onBack={handleBack}
            />
            <StatusBar style="auto" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#f5f5f5',
        flex: 1,
    },
});
