import React from 'react';
import { StudyScreen } from '../../src/components/StudyScreen';
import { katakanaData } from '../../src/data/katakana';

export default function KatakanaStudyScreen() {
  return (
    <StudyScreen
      kanaData={katakanaData}
      kanaType="katakana"
      completionTitle="Katakana"
    />
  );
}
