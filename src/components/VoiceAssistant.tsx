import { useState, useRef, useCallback, useEffect } from 'react';
import { Mic, MicOff, Volume2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface VoiceAssistantProps {
  onCommand: (command: string) => void;
}

const HINDI_COMMANDS: Record<string, string> = {
  'दवा जोड़ो': 'add_medicine',
  'दवा स्कैन करो': 'scan_medicine',
  'रिपोर्ट दिखाओ': 'export_csv',
  'एक्सपोर्ट करो': 'export_csv',
  'खोजो': 'search',
  'निपटान गाइड': 'disposal_guide',
  'लॉगआउट': 'logout',
  'सभी दिखाओ': 'filter_all',
  'एक्सपायर्ड दिखाओ': 'filter_expired',
};

const HINDI_RESPONSES: Record<string, string> = {
  add_medicine: 'दवा जोड़ने का फॉर्म खोल रहा हूँ।',
  scan_medicine: 'बारकोड स्कैनर खोल रहा हूँ।',
  export_csv: 'रिपोर्ट एक्सपोर्ट कर रहा हूँ।',
  search: 'खोज बार में ले जा रहा हूँ।',
  disposal_guide: 'दवा निपटान गाइड खोल रहा हूँ।',
  logout: 'लॉगआउट कर रहा हूँ।',
  filter_all: 'सभी दवाइयाँ दिखा रहा हूँ।',
  filter_expired: 'एक्सपायर्ड दवाइयाँ दिखा रहा हूँ।',
  unknown: 'माफ़ कीजिए, मैं यह कमांड नहीं समझ पाया। कृपया दोबारा बोलें।',
  greeting: 'नमस्ते! मैं मेडीट्रैक सहायक हूँ। आप क्या करना चाहते हैं?',
};

function speak(text: string, lang = 'hi-IN') {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 0.85;
  utterance.pitch = 1;
  window.speechSynthesis.speak(utterance);
}

export function VoiceAssistant({ onCommand }: VoiceAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [lastResponse, setLastResponse] = useState('');
  const recognitionRef = useRef<any>(null);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  const processCommand = useCallback((text: string) => {
    const normalized = text.trim().toLowerCase();
    let matchedCommand: string | null = null;

    for (const [hindi, cmd] of Object.entries(HINDI_COMMANDS)) {
      if (normalized.includes(hindi) || normalized.includes(hindi.toLowerCase())) {
        matchedCommand = cmd;
        break;
      }
    }

    // English fallback
    if (!matchedCommand) {
      if (normalized.includes('add') || normalized.includes('medicine')) matchedCommand = 'add_medicine';
      else if (normalized.includes('scan')) matchedCommand = 'scan_medicine';
      else if (normalized.includes('export') || normalized.includes('report')) matchedCommand = 'export_csv';
      else if (normalized.includes('search') || normalized.includes('find')) matchedCommand = 'search';
      else if (normalized.includes('disposal') || normalized.includes('dispose')) matchedCommand = 'disposal_guide';
      else if (normalized.includes('logout') || normalized.includes('sign out')) matchedCommand = 'logout';
    }

    if (matchedCommand) {
      const response = HINDI_RESPONSES[matchedCommand] || '';
      setLastResponse(response);
      speak(response);
      onCommand(matchedCommand);
    } else {
      setLastResponse(HINDI_RESPONSES.unknown);
      speak(HINDI_RESPONSES.unknown);
    }
  }, [onCommand]);

  const startListening = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error('Speech recognition is not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'hi-IN';
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      setTranscript(finalTranscript || interimTranscript);
      if (finalTranscript) {
        processCommand(finalTranscript);
        setIsListening(false);
      }
    };

    recognition.onerror = () => {
      setIsListening(false);
      toast.error('Could not hear you. Please try again.');
    };

    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
    setTranscript('');
    setLastResponse('');
    speak(HINDI_RESPONSES.greeting);
  }, [processCommand]);

  useEffect(() => {
    if (!isOpen) stopListening();
  }, [isOpen, stopListening]);

  return (
    <>
      {/* Floating mic button */}
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 rounded-full w-14 h-14 shadow-lg bg-primary hover:bg-primary/90"
        size="icon"
        aria-label="Voice assistant — Hindi"
      >
        <Mic size={24} />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-24 right-6 z-50 w-80 rounded-xl border border-border bg-card shadow-xl overflow-hidden"
          >
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-heading font-semibold text-foreground text-sm">🎙️ Hindi Voice Assistant</h3>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-8 w-8">
                <X size={16} />
              </Button>
            </div>

            <div className="p-4 space-y-4">
              {/* Status */}
              <div className="text-center">
                {isListening ? (
                  <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                    <div className="inline-flex p-4 rounded-full bg-destructive/10">
                      <MicOff size={28} className="text-destructive" />
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">सुन रहा हूँ... (Listening...)</p>
                  </motion.div>
                ) : (
                  <div>
                    <div className="inline-flex p-4 rounded-full bg-primary/10">
                      <Mic size={28} className="text-primary" />
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">माइक दबाएँ और बोलें</p>
                  </div>
                )}
              </div>

              {/* Transcript */}
              {transcript && (
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-xs text-muted-foreground mb-1">आपने कहा:</p>
                  <p className="text-sm font-medium text-foreground">{transcript}</p>
                </div>
              )}

              {/* Response */}
              {lastResponse && (
                <div className="rounded-lg bg-primary/5 border border-primary/10 p-3">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs text-muted-foreground">Assistant:</p>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => speak(lastResponse)} aria-label="Replay response">
                      <Volume2 size={12} />
                    </Button>
                  </div>
                  <p className="text-sm text-foreground">{lastResponse}</p>
                </div>
              )}

              {/* Controls */}
              <div className="flex justify-center">
                <Button
                  onClick={isListening ? stopListening : startListening}
                  variant={isListening ? 'destructive' : 'default'}
                  className="gap-2 min-h-[44px] w-full"
                >
                  {isListening ? <><MicOff size={16} /> रुकें (Stop)</> : <><Mic size={16} /> बोलें (Speak)</>}
                </Button>
              </div>

              {/* Quick commands */}
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Quick commands:</p>
                <div className="flex flex-wrap gap-1">
                  {['दवा जोड़ो', 'दवा स्कैन करो', 'रिपोर्ट दिखाओ', 'निपटान गाइड'].map(cmd => (
                    <button
                      key={cmd}
                      onClick={() => { setTranscript(cmd); processCommand(cmd); }}
                      className="text-xs px-2 py-1 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
                    >
                      {cmd}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
