
import { useEffect, useState } from 'react';
import { useLanguage } from '@/components/ui/LanguageProvider';
import { KeyboardIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { DialogContent } from '@/components/ui/dialog';
import { DialogHeader } from '@/components/ui/dialog';
import { DialogTitle } from '@/components/ui/dialog';
import { DialogDescription } from '@/components/ui/dialog';
import { DialogClose } from '@/components/ui/dialog';

const KeyboardNavigation = () => {
  const { t } = useLanguage();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [focusedElement, setFocusedElement] = useState<number | null>(null);
  const [focusableElements, setFocusableElements] = useState<HTMLElement[]>([]);
  const [isNavigationActive, setIsNavigationActive] = useState(false);

  // Initialize keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle keyboard navigation mode with Alt+K
      if (e.altKey && e.key === 'k') {
        e.preventDefault();
        setIsNavigationActive(prev => !prev);
        return;
      }

      // Show keyboard shortcuts help with Alt+?
      if (e.altKey && e.key === '/') {
        e.preventDefault();
        setIsDialogOpen(true);
        return;
      }

      // Only handle navigation in keyboard navigation mode
      if (!isNavigationActive) return;

      switch (e.key) {
        case 'Tab':
          // Let Tab work naturally for accessibility
          break;
        
        case 'ArrowRight':
        case 'ArrowDown':
          e.preventDefault();
          navigateToNextElement();
          break;
          
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault();
          navigateToPreviousElement();
          break;
          
        case 'Enter':
        case ' ':
          // Let the browser handle the action naturally
          break;
          
        case 'Escape':
          e.preventDefault();
          setIsNavigationActive(false);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isNavigationActive, focusedElement, focusableElements.length]);

  // Update focusable elements whenever navigation becomes active
  useEffect(() => {
    if (isNavigationActive) {
      updateFocusableElements();
    }
  }, [isNavigationActive]);

  // Update the list of focusable elements
  const updateFocusableElements = () => {
    const elements = Array.from(
      document.querySelectorAll('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])')
    ) as HTMLElement[];
    
    setFocusableElements(elements.filter(el => {
      // Filter out hidden elements
      const style = window.getComputedStyle(el);
      return !(style.display === 'none' || style.visibility === 'hidden' || el.hasAttribute('disabled'));
    }));
  };

  // Navigate to the next focusable element
  const navigateToNextElement = () => {
    if (focusableElements.length === 0) {
      updateFocusableElements();
      return;
    }
    
    const nextIndex = focusedElement === null 
      ? 0 
      : (focusedElement + 1) % focusableElements.length;
    
    setFocusedElement(nextIndex);
    focusableElements[nextIndex]?.focus();
  };

  // Navigate to the previous focusable element
  const navigateToPreviousElement = () => {
    if (focusableElements.length === 0) {
      updateFocusableElements();
      return;
    }
    
    const prevIndex = focusedElement === null 
      ? focusableElements.length - 1 
      : (focusedElement - 1 + focusableElements.length) % focusableElements.length;
    
    setFocusedElement(prevIndex);
    focusableElements[prevIndex]?.focus();
  };

  return (
    <>
      <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end space-y-2">
        {/* Keyboard navigation status indicator - visible when active */}
        {isNavigationActive && (
          <div className="bg-primary text-primary-foreground rounded-lg px-3 py-1 text-sm shadow-md">
            {t('accessibility.keyboard_navigation_active') || 'Keyboard Navigation Active'}
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t('accessibility.keyboard_shortcuts') || 'Keyboard Shortcuts'}</DialogTitle>
            <DialogDescription>
              {t('accessibility.keyboard_shortcuts_description') || 'Use these keyboard shortcuts to navigate the site.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-[1fr_2fr] gap-4">
              <div className="font-medium">Alt + K</div>
              <div>{t('accessibility.toggle_keyboard_navigation') || 'Toggle keyboard navigation'}</div>
              
              <div className="font-medium">Alt + /</div>
              <div>{t('accessibility.show_keyboard_shortcuts') || 'Show keyboard shortcuts'}</div>
              
              <div className="font-medium">↑ / ←</div>
              <div>{t('accessibility.previous_element') || 'Focus previous element'}</div>
              
              <div className="font-medium">↓ / →</div>
              <div>{t('accessibility.next_element') || 'Focus next element'}</div>
              
              <div className="font-medium">Enter / Space</div>
              <div>{t('accessibility.activate_element') || 'Activate focused element'}</div>
              
              <div className="font-medium">Escape</div>
              <div>{t('accessibility.exit_keyboard_navigation') || 'Exit keyboard navigation'}</div>
            </div>
          </div>
          
          <DialogClose asChild>
            <Button>{t('common.close') || 'Close'}</Button>
          </DialogClose>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default KeyboardNavigation;
