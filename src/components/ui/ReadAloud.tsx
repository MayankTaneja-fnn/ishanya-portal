
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, Pause, Play } from 'lucide-react';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { useLanguage } from '@/components/ui/LanguageProvider';

const ReadAloud = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [utterance, setUtterance] = useState<SpeechSynthesisUtterance | null>(null);
  const { t, language } = useLanguage();

  useEffect(() => {
    // Initialize speech synthesis
    const synth = window.speechSynthesis;
    const u = new SpeechSynthesisUtterance();
    
    // Clean up on component unmount
    return () => {
      if (synth && synth.speaking) {
        synth.cancel();
      }
    };
  }, []);

  // Set up speech voices based on language
  useEffect(() => {
    if (!utterance) return;
    
    const voices = window.speechSynthesis.getVoices();
    
    // Try to find a voice that matches the current UI language
    let voiceForLanguage;
    
    switch (language) {
      case 'hindi':
        voiceForLanguage = voices.find(voice => voice.lang.includes('hi-'));
        break;
      case 'kannada':
        voiceForLanguage = voices.find(voice => voice.lang.includes('kn-'));
        break;
      case 'english':
      default:
        voiceForLanguage = voices.find(voice => voice.lang.includes('en-'));
        break;
    }
    
    // Use found voice or default to the first available voice
    if (voiceForLanguage) {
      utterance.voice = voiceForLanguage;
    }
  }, [language, utterance]);

  const readPageContent = () => {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    // Create a fresh utterance
    const u = new SpeechSynthesisUtterance();
    setUtterance(u);
    
    // Extract readable content from the page
    // We'll exclude navigation, buttons, etc.
    const contentElements = document.querySelectorAll('main p, main h1, main h2, main h3, main h4, main h5, main h6, main li, .card-content, .readable-content');
    
    // If no specific readable content, get all text from the main content area
    let textToRead = '';
    if (contentElements.length > 0) {
      contentElements.forEach(element => {
        textToRead += element.textContent + ' ';
      });
    } else {
      // Fallback to main content or entire page content
      const mainContent = document.querySelector('main') || document.body;
      textToRead = mainContent.textContent || '';
    }
    
    // Filter out some common UI text that shouldn't be read
    textToRead = textToRead.replace(/Toggle navigation|Submit|Cancel|Close|Menu/g, '');
    
    u.text = textToRead.trim();
    
    // Set up event handlers
    u.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };
    
    u.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };
    
    u.onpause = () => {
      setIsPaused(true);
    };
    
    u.onresume = () => {
      setIsPaused(false);
    };
    
    // Start speaking
    window.speechSynthesis.speak(u);
  };

  const toggleSpeech = () => {
    const synth = window.speechSynthesis;
    
    if (!isSpeaking) {
      readPageContent();
    } else if (isPaused) {
      synth.resume();
      setIsPaused(false);
    } else {
      synth.pause();
      setIsPaused(true);
    }
  };

  const stopSpeech = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  };

  return (
    <TooltipProvider>
      <div className="flex items-center space-x-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className={`rounded-full transition-colors ${isSpeaking ? 'bg-blue-100 dark:bg-blue-900' : ''}`}
              onClick={toggleSpeech}
              aria-label={isSpeaking ? (isPaused ? t('accessibility.resume_reading') || 'Resume reading' : t('accessibility.pause_reading') || 'Pause reading') : t('accessibility.read_aloud') || 'Read page aloud'}
            >
              {isSpeaking ? (
                isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            {isSpeaking 
              ? (isPaused 
                ? t('accessibility.resume_reading') || 'Resume reading' 
                : t('accessibility.pause_reading') || 'Pause reading')
              : t('accessibility.read_aloud') || 'Read page aloud'
            }
          </TooltipContent>
        </Tooltip>
        
        {isSpeaking && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full"
                onClick={stopSpeech}
                aria-label={t('accessibility.stop_reading') || 'Stop reading'}
              >
                <VolumeX className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              {t('accessibility.stop_reading') || 'Stop reading'}
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
};

export default ReadAloud;
