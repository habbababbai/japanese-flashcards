import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Flashcard } from '../../src/components/Flashcard';
import { Kana } from '../../src/types';

describe('Flashcard Component', () => {
  const mockKana: Kana = {
    id: '1',
    character: 'あ',
    romaji: 'a',
    type: 'hiragana',
    correctCount: 0,
    incorrectCount: 0,
  };

  const defaultProps = {
    kana: mockKana,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the flashcard with kana character', () => {
      const { getByText } = render(<Flashcard {...defaultProps} />);

      expect(getByText('あ')).toBeTruthy();
      expect(getByText('What does this sound like?')).toBeTruthy();
    });

    it('should render the card front initially', () => {
      const { getByText, queryByText } = render(
        <Flashcard {...defaultProps} />
      );

      // Front should be visible
      expect(getByText('あ')).toBeTruthy();
      expect(getByText('What does this sound like?')).toBeTruthy();

      // Back should not be visible initially
      expect(queryByText('a')).toBeFalsy();
      expect(queryByText('Did you know it?')).toBeFalsy();
    });

    it('should not show answer buttons initially', () => {
      const { queryByText } = render(<Flashcard {...defaultProps} />);

      expect(queryByText("❌ I didn't know it")).toBeFalsy();
      expect(queryByText('✅ I knew it!')).toBeFalsy();
    });

    it('should render with different kana data', () => {
      const differentKana: Kana = {
        id: '2',
        character: 'か',
        romaji: 'ka',
        type: 'hiragana',
        correctCount: 5,
        incorrectCount: 2,
      };

      const { getByText } = render(<Flashcard kana={differentKana} />);

      expect(getByText('か')).toBeTruthy();
      expect(getByText('What does this sound like?')).toBeTruthy();
    });
  });

  describe('Card Flipping', () => {
    it('should flip card when pressed', () => {
      const onFlip = jest.fn();
      const { getByText } = render(
        <Flashcard {...defaultProps} onFlip={onFlip} />
      );

      const card = getByText('あ');
      fireEvent.press(card);

      expect(onFlip).toHaveBeenCalledTimes(1);
    });

    it('should show answer buttons after flipping', () => {
      const { getByText, queryByText } = render(
        <Flashcard {...defaultProps} />
      );

      const card = getByText('あ');
      fireEvent.press(card);

      expect(queryByText("❌ I didn't know it")).toBeTruthy();
      expect(queryByText('✅ I knew it!')).toBeTruthy();
    });

    it('should flip back when pressed again', () => {
      const onFlip = jest.fn();
      const { getByText, queryByText } = render(
        <Flashcard {...defaultProps} onFlip={onFlip} />
      );

      const card = getByText('あ');

      // First flip
      fireEvent.press(card);
      expect(onFlip).toHaveBeenCalledTimes(1);

      // Second flip (back) - now press the back side
      const backCard = getByText('a');
      fireEvent.press(backCard);
      expect(onFlip).toHaveBeenCalledTimes(2);

      // Answer buttons should be hidden
      expect(queryByText("❌ I didn't know it")).toBeFalsy();
      expect(queryByText('✅ I knew it!')).toBeFalsy();
    });
  });

  describe('Answer Buttons', () => {
    it('should call onAnswer with true when correct button is pressed', async () => {
      const onAnswer = jest.fn();
      const { getByText } = render(
        <Flashcard {...defaultProps} onAnswer={onAnswer} />
      );

      // Flip card to show answer buttons
      const card = getByText('あ');
      fireEvent.press(card);

      // Press correct button
      const correctButton = getByText('✅ I knew it!');
      fireEvent.press(correctButton);

      // Wait for the timeout to complete
      await waitFor(
        () => {
          expect(onAnswer).toHaveBeenCalledWith(true);
        },
        { timeout: 1000 }
      );
    });

    it('should call onAnswer with false when incorrect button is pressed', async () => {
      const onAnswer = jest.fn();
      const { getByText } = render(
        <Flashcard {...defaultProps} onAnswer={onAnswer} />
      );

      // Flip card to show answer buttons
      const card = getByText('あ');
      fireEvent.press(card);

      // Press incorrect button
      const incorrectButton = getByText("❌ I didn't know it");
      fireEvent.press(incorrectButton);

      // Wait for the timeout to complete
      await waitFor(
        () => {
          expect(onAnswer).toHaveBeenCalledWith(false);
        },
        { timeout: 1000 }
      );
    });

    it('should hide answer buttons after answering', async () => {
      const onAnswer = jest.fn();
      const { getByText, queryByText } = render(
        <Flashcard {...defaultProps} onAnswer={onAnswer} />
      );

      // Flip card to show answer buttons
      const card = getByText('あ');
      fireEvent.press(card);

      // Press correct button
      const correctButton = getByText('✅ I knew it!');
      fireEvent.press(correctButton);

      // Wait for animations to complete
      await waitFor(
        () => {
          expect(queryByText("❌ I didn't know it")).toBeFalsy();
          expect(queryByText('✅ I knew it!')).toBeFalsy();
        },
        { timeout: 1000 }
      );
    });
  });

  describe('State Reset', () => {
    it('should reset state when kana changes', () => {
      const { getByText, queryByText, rerender } = render(
        <Flashcard {...defaultProps} />
      );

      // Flip card to show answer buttons
      const card = getByText('あ');
      fireEvent.press(card);

      // Verify answer buttons are shown
      expect(queryByText("❌ I didn't know it")).toBeTruthy();

      // Change kana
      const newKana: Kana = {
        id: '2',
        character: 'い',
        romaji: 'i',
        type: 'hiragana',
        correctCount: 0,
        incorrectCount: 0,
      };

      rerender(<Flashcard kana={newKana} />);

      // Verify state is reset
      expect(queryByText('い')).toBeTruthy();
      expect(queryByText("❌ I didn't know it")).toBeFalsy();
      expect(queryByText('✅ I knew it!')).toBeFalsy();
    });
  });

  describe('Optional Props', () => {
    it('should work without onFlip callback', () => {
      const { getByText } = render(<Flashcard {...defaultProps} />);

      const card = getByText('あ');
      expect(() => fireEvent.press(card)).not.toThrow();
    });

    it('should work without onAnswer callback', () => {
      const { getByText } = render(<Flashcard {...defaultProps} />);

      // Flip card to show answer buttons
      const card = getByText('あ');
      fireEvent.press(card);

      const correctButton = getByText('✅ I knew it!');
      expect(() => fireEvent.press(correctButton)).not.toThrow();
    });
  });

  describe('Accessibility', () => {
    it('should have touchable card', () => {
      const { getByText } = render(<Flashcard {...defaultProps} />);

      const card = getByText('あ');
      expect(card).toBeTruthy();
    });

    it('should have touchable answer buttons', () => {
      const { getByText } = render(<Flashcard {...defaultProps} />);

      // Flip card to show answer buttons
      const card = getByText('あ');
      fireEvent.press(card);

      const correctButton = getByText('✅ I knew it!');
      const incorrectButton = getByText("❌ I didn't know it");

      expect(correctButton).toBeTruthy();
      expect(incorrectButton).toBeTruthy();
    });
  });

  describe('Visual Feedback', () => {
    it('should show correct answer text on back', () => {
      const { getByText } = render(<Flashcard {...defaultProps} />);

      // Flip card
      const card = getByText('あ');
      fireEvent.press(card);

      // The romaji should be visible on the back
      expect(getByText('a')).toBeTruthy();
      expect(getByText('Did you know it?')).toBeTruthy();
    });
  });
});
