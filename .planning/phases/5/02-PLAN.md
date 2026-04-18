---
phase: 5
plan: 2
wave: 2
depends_on: [5.1]
files_modified:
  - frontend/src/lib/useSpeech.ts
  - frontend/src/components/Chat/ChatContainer.tsx
  - frontend/src/components/Canvas3D/Main3DCanvas.tsx
autonomous: true
user_setup: []

must_haves:
  truths:
    - "Text-to-speech plays automatically when the assistant sends a message"
    - "A mute toggle button controls auto-speak"
    - "Speaking strips markdown before synthesizing"
    - "onInteract from 3D scenes triggers TTS voice narration"
    - "A speaking indicator shows visually while TTS is active"
  artifacts:
    - "frontend/src/lib/useSpeech.ts exists and exports useSpeech() hook"
    - "ChatContainer.tsx uses useSpeech to auto-speak each assistant message"
    - "Main3DCanvas.tsx passes handleInteract that calls speak() from useSpeech"
  key_links:
    - "useSpeech hook uses window.speechSynthesis — no npm packages"
    - "Plan 5.1 must be complete first (onInteract callback stub exists in Main3DCanvas)"
---

# Plan 5.2: Voice Agent — TTS Narrator + Interactive Narration

## Objective
Give both AI agents a voice. The Instructor **speaks its explanations automatically** when a response
arrives. The 3D visualization **narrates interactions** as the user explores ("You just rotated the
Bloch sphere through the |−⟩ state!"). This makes the platform feel like a live tutor.

Zero new dependencies — uses the browser's built-in `window.speechSynthesis` API.

## Context
- .planning/phases/5/RESEARCH.md (TTS section)
- frontend/src/lib/ ← create useSpeech.ts here
- frontend/src/components/Chat/ChatContainer.tsx ← add auto-speak
- frontend/src/components/Canvas3D/Main3DCanvas.tsx ← wire onInteract to speak

## Tasks

<task type="auto">
  <name>Create useSpeech.ts custom hook</name>
  <files>
    frontend/src/lib/useSpeech.ts
  </files>
  <action>
    Create `frontend/src/lib/useSpeech.ts`:

    ```typescript
    import { useCallback, useEffect, useRef, useState } from 'react';

    export function useSpeech() {
      const [isSpeaking, setIsSpeaking] = useState(false);
      const [isMuted, setIsMuted] = useState(false);
      const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

      // Load voices after they become available
      useEffect(() => {
        const updateVoices = () => { window.speechSynthesis.getVoices(); };
        updateVoices();
        window.speechSynthesis.onvoiceschanged = updateVoices;
        return () => { window.speechSynthesis.cancel(); };
      }, []);

      // Strip markdown formatting before speaking
      const stripMarkdown = (text: string): string =>
        text
          .replace(/\*\*(.*?)\*\*/g, '$1')     // **bold**
          .replace(/\*(.*?)\*/g, '$1')           // *italic*
          .replace(/`(.*?)`/g, '$1')             // `code`
          .replace(/^#{1,3}\s+/gm, '')           // ## headings
          .replace(/^[-•]\s+/gm, '')             // bullet points
          .replace(/\n{2,}/g, '. ')              // paragraph breaks
          .replace(/\n/g, ' ')                   // single newlines
          .trim();

      const speak = useCallback((text: string) => {
        if (isMuted || !window.speechSynthesis) return;

        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        const clean = stripMarkdown(text);
        if (!clean) return;

        const utt = new SpeechSynthesisUtterance(clean);
        utt.rate = 0.92;
        utt.pitch = 1.05;
        utt.volume = 1.0;

        // Pick a good English voice if available
        const voices = window.speechSynthesis.getVoices();
        const preferred =
          voices.find(v => v.lang === 'en-US' && v.name.toLowerCase().includes('google')) ||
          voices.find(v => v.lang === 'en-US') ||
          voices.find(v => v.lang.startsWith('en'));
        if (preferred) utt.voice = preferred;

        utt.onstart = () => setIsSpeaking(true);
        utt.onend = () => setIsSpeaking(false);
        utt.onerror = () => setIsSpeaking(false);

        utteranceRef.current = utt;
        window.speechSynthesis.speak(utt);
      }, [isMuted]);

      const stop = useCallback(() => {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      }, []);

      const toggleMute = useCallback(() => {
        setIsMuted(prev => {
          if (!prev) window.speechSynthesis.cancel(); // muting = stop current
          return !prev;
        });
      }, []);

      return { speak, stop, isSpeaking, isMuted, toggleMute };
    }
    ```

    AVOID: Using any external TTS library.
    AVOID: Calling `speak()` from useEffect without a user interaction (browser restriction).
    NOTE: speak() is called after user sends a message (user interaction triggers the response chain).
  </action>
  <verify>
    cd frontend && npx tsc --noEmit 2>&1 | grep "useSpeech" | head -5
  </verify>
  <done>
    - File exists at frontend/src/lib/useSpeech.ts
    - TypeScript compiles without errors for this file
    - Hook exports: speak, stop, isSpeaking, isMuted, toggleMute
  </done>
</task>

<task type="auto">
  <name>Wire auto-speak into ChatContainer and voice narration into Main3DCanvas</name>
  <files>
    frontend/src/components/Chat/ChatContainer.tsx
    frontend/src/components/Canvas3D/Main3DCanvas.tsx
  </files>
  <action>
    === ChatContainer.tsx changes ===

    1. Import useSpeech at the top:
       `import { useSpeech } from '../../lib/useSpeech';`

    2. In the component body, call the hook:
       `const { speak, stop, isSpeaking, isMuted, toggleMute } = useSpeech();`

    3. In the `sendMessage` function, after `addMessage(assistantMsg)`:
       ```
       // Auto-speak the explanation
       speak(data.text);
       ```
       Place it just after the `addMessage` call for the assistant message.

    4. In the header section (where the avatar and "THE INSTRUCTOR" title live), add a mute/unmute
       button immediately to the RIGHT of the existing avatar+title block:
       ```tsx
       <button
         onClick={toggleMute}
         title={isMuted ? 'Unmute voice' : 'Mute voice'}
         className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg
           bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/50
           text-slate-400 hover:text-slate-200 transition-all text-xs font-medium"
       >
         {isMuted ? '🔇' : isSpeaking ? '🔊' : '🔈'}
         <span>{isMuted ? 'Muted' : isSpeaking ? 'Speaking...' : 'Voice'}</span>
       </button>
       ```

    5. Update the placeholder text of the input to reflect the universal scope:
       Change: `"Ask about Q-RAM, superposition, qubits…"`
       To: `"Ask about quantum, AI, algorithms, physics…"`

    6. Update QUICK_STARTS to be more universal (replace the existing array with):
       ```typescript
       const QUICK_STARTS = [
         'How does a neural network learn?',
         'Explain quantum superposition',
         'Show me how gradient descent works',
         'What is quantum entanglement?',
         'How does bubble sort compare to quicksort?',
       ];
       ```

    === Main3DCanvas.tsx changes ===

    1. Import useSpeech:
       `import { useSpeech } from '../../lib/useSpeech';`

    2. In Main3DCanvas component body:
       `const { speak } = useSpeech();`

    3. Replace the stub `handleInteract` with:
       ```typescript
       const handleInteract = useCallback((msg: string) => {
         speak(msg);
       }, [speak]);
       ```
       Add `import { useCallback } from 'react';` to the React import line.

    4. Pass `onInteract={handleInteract}` to `<VisualizationRouter>`.
       The VisualizationRouter should already accept this prop from Plan 5.1.

    AVOID: Calling speak() in any useEffect or on component mount — only call on user interaction.
    AVOID: Duplicate speak() instances — useSpeech.cancel() is called internally before each speak.
  </action>
  <verify>
    cd frontend && npx tsc --noEmit 2>&1 | head -20
  </verify>
  <done>
    - TypeScript compiles without errors
    - The mute/unmute button is visible in the chat header
    - QUICK_STARTS array has been updated to universal topics
    - Main3DCanvas imports useSpeech and passes handleInteract to VisualizationRouter
    - Manual test: send a message → hear the TTS response in browser
  </done>
</task>

## Success Criteria
- [ ] `frontend/src/lib/useSpeech.ts` exists and exports correct hook shape
- [ ] `npx tsc --noEmit` exits 0 in frontend/
- [ ] Mute button appears in chat header with correct 🔇/🔈/🔊 states
- [ ] Auto-speak plays after assistant responds (not muted by default)
- [ ] Clicking on objects in 3D scenes triggers spoken narration
- [ ] Quick-start chips updated to include non-quantum topics
