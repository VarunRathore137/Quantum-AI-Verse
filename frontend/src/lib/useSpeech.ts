import { useCallback, useEffect, useRef, useState } from 'react';
import { useAppStore } from '../store';

let globalSentences: string[] = [];
let globalCurrentIdx: number = 0;
let isPlayingSequence: boolean = false;
let globalResolve: (() => void) | null = null;

export function useSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    const updateVoices = () => { window.speechSynthesis.getVoices(); };
    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;
    return () => { window.speechSynthesis.cancel(); };
  }, []);

  const stripMarkdown = (text: string): string =>
    text
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/`(.*?)`/g, '$1')
      .replace(/^#{1,3}\s+/gm, '')
      .replace(/^[-•]\s+/gm, '')
      .replace(/\n{2,}/g, '. ')
      .replace(/\n/g, ' ')
      .trim();
      
  const playNext = useCallback(() => {
    if (globalCurrentIdx >= globalSentences.length) {
      setIsSpeaking(false);
      isPlayingSequence = false;
      useAppStore.getState().setSubtitle('');
      if (globalResolve) {
        globalResolve();
        globalResolve = null;
      }
      return;
    }

    const sentence = globalSentences[globalCurrentIdx].trim();
    if (!sentence) {
      globalCurrentIdx++;
      playNext();
      return;
    }

    const utt = new SpeechSynthesisUtterance(sentence);
    utt.rate = 0.92;
    utt.pitch = 1.05;
    utt.volume = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const preferred =
      voices.find(v => v.lang === 'en-US' && v.name.toLowerCase().includes('female')) ||
      voices.find(v => v.lang === 'en-US' && v.name.toLowerCase().includes('zira')) ||
      voices.find(v => v.lang === 'en-US' && v.name.toLowerCase().includes('samantha')) ||
      voices.find(v => v.lang === 'en-US' && v.name.toLowerCase().includes('victoria')) ||
      voices.find(v => v.lang === 'en-US' && !v.name.toLowerCase().includes('david') && !v.name.toLowerCase().includes('mark')) ||
      voices.find(v => v.lang.startsWith('en'));
    if (preferred) utt.voice = preferred;

    utt.onstart = () => {
      setIsSpeaking(true);
      useAppStore.getState().setSubtitle(sentence);
    };
    utt.onend = () => {
      globalCurrentIdx++;
      playNext();
    };
    utt.onerror = (e) => {
      setIsSpeaking(false);
      isPlayingSequence = false;
      useAppStore.getState().setSubtitle('');
      if (globalResolve) {
        globalResolve();
        globalResolve = null;
      }
    };

    utteranceRef.current = utt;
    window.speechSynthesis.speak(utt);
  }, []);

  const speak = useCallback((text: string, options?: { interrupt?: boolean; tourEvent?: boolean }): Promise<void> => {
    if (isMuted || !window.speechSynthesis) return Promise.resolve();

    if (options?.interrupt) {
      // Save remaining sentences from the main explanation
      if (isPlayingSequence && globalCurrentIdx < globalSentences.length) {
        const remaining = globalSentences.slice(globalCurrentIdx);
        useAppStore.getState().setMainSpeechQueue(remaining);
        useAppStore.getState().setHasInterruptedSpeech(true);
      }
    }

    window.speechSynthesis.cancel();
    isPlayingSequence = true;
    
    // Resolve any previous dangling promise
    if (globalResolve) {
       globalResolve();
       globalResolve = null;
    }

    const clean = stripMarkdown(text);
    if (!clean) return Promise.resolve();

    // Split text into shorter phrases (one-liner subtitles) using .,!?:; and commas
    const sentences = clean.split(/(?<=[.!?\\:;,])\s+/).filter(Boolean);
    globalSentences = sentences;
    globalCurrentIdx = 0;

    useAppStore.getState().setSubtitle('');
    
    return new Promise<void>((resolve) => {
      globalResolve = resolve;
      playNext();
    });
  }, [isMuted, playNext]);

  const resumeSpeech = useCallback(() => {
    const queue = useAppStore.getState().mainSpeechQueue;
    if (!queue.length) return;
    
    useAppStore.getState().setHasInterruptedSpeech(false);
    useAppStore.getState().setMainSpeechQueue([]);
    
    window.speechSynthesis.cancel();
    isPlayingSequence = true;
    globalSentences = queue;
    globalCurrentIdx = 0;
    playNext();
  }, [playNext]);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    isPlayingSequence = false;
    useAppStore.getState().setSubtitle('');
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      if (!prev) window.speechSynthesis.cancel();
      return !prev;
    });
    setIsSpeaking(false);
  }, []);

  return { speak, stop, resumeSpeech, isSpeaking, isMuted, toggleMute };
}
