import React from 'react';
import { StudyScreen } from '../../src/components/StudyScreen';
import { hiraganaData } from '../../src/data/hiragana';

export default function HiraganaStudyScreen() {
  return (
    <StudyScreen
      kanaData={hiraganaData}
      kanaType="hiragana"
      completionTitle="Hiragana"
    />
  );
}
