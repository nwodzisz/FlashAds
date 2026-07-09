import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function TutorialOverlay({
  onComplete,
  config
}: {
  onComplete: () => void,
  config: any
}) {
  const [step, setStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const steps = [
    {
      targetId: null,
      title: "Welcome to TownTicker! 👋",
      content: "Let's get your ad platform set up in just a few steps. This quick tour will show you the ropes.",
    },
    {
      targetId: 'tour-stripe',
      title: "1. Connect Stripe 💳",
      content: "First things first: you need to get paid! Onboard with Stripe so you can receive payouts from advertisers.",
    },
    {
      targetId: 'tour-tiers',
      title: "2. Set Your Pricing 🏷️",
      content: "In the 'Ad Tiers' section, you can define exactly what you're selling. Want to sell a 'Featured 24-hour Spot' for $100? Create a tier for it here.",
    },
    {
      targetId: 'tour-form',
      title: "3. Customize Your Form 📝",
      content: "Use the 'Form Builder' to decide what information advertisers need to submit. You can require images, text, links, and more.",
    },
    {
      targetId: 'tour-widget',
      title: "4. Embed Your Widget 🚀",
      content: "Once everything looks good, just copy the embed code and paste it into your website's HTML. You're ready to sell!",
    }
  ];

  useEffect(() => {
    const targetId = steps[step].targetId;
    if (targetId) {
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        const updateRect = () => {
          if (el) setTargetRect(el.getBoundingClientRect());
        };
        
        // Update immediately
        updateRect();
        
        // Update continuously for a brief period to catch smooth scroll
        const intervalId = setInterval(updateRect, 16);
        setTimeout(() => clearInterval(intervalId), 1000);
        
        window.addEventListener('scroll', updateRect);
        window.addEventListener('resize', updateRect);
        
        return () => {
          clearInterval(intervalId);
          window.removeEventListener('scroll', updateRect);
          window.removeEventListener('resize', updateRect);
        };
      }
    } else {
      setTargetRect(null);
    }
  }, [step]);

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  const overlayContent = (
    <>
      {/* Dimmed background. If there is a targetRect, we render the spotlight using a box-shadow trick */}
      {targetRect ? (
        <>
          <div style={{
            position: 'fixed', inset: 0, zIndex: 9997, cursor: 'pointer'
          }} onClick={e => e.stopPropagation()} />
          <div style={{
            position: 'fixed',
            top: targetRect.top - 10,
            left: targetRect.left - 10,
            width: targetRect.width + 20,
            height: targetRect.height + 20,
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
            borderRadius: '16px',
            zIndex: 9998,
            pointerEvents: 'none',
            transition: 'all 0.3s ease'
          }} />
        </>
      ) : (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 9998,
        }} />
      )}

      {/* The Modal Dialog */}
      <div style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        display: 'flex',
        alignItems: targetRect ? 'flex-end' : 'center',
        justifyContent: targetRect ? 'flex-end' : 'center',
        zIndex: 9999,
        padding: '2rem',
        pointerEvents: 'none',
      }}>
        <div style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '2rem',
          maxWidth: '450px',
          width: '100%',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
          pointerEvents: 'auto',
          position: 'relative',
          transition: 'all 0.3s ease'
        }}>
          <div style={{ display: 'flex', gap: '4px', marginBottom: '1.5rem' }}>
            {steps.map((_, idx) => (
              <div key={idx} style={{
                flex: 1,
                height: '4px',
                backgroundColor: idx <= step ? '#0284c7' : '#e2e8f0',
                borderRadius: '2px',
                transition: 'background-color 0.3s ease'
              }} />
            ))}
          </div>
  
          <h2 style={{ color: '#0f172a', marginBottom: '1rem', fontSize: '1.5rem', marginTop: 0 }}>
            {steps[step].title}
          </h2>
  
          <p style={{ color: '#475569', fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '2rem', minHeight: '80px' }}>
            {steps[step].content}
          </p>
  
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              onClick={onComplete}
              style={{
                background: 'none',
                border: 'none',
                color: '#64748b',
                cursor: 'pointer',
                fontSize: '0.95rem'
              }}
            >
              Skip Tutorial
            </button>
  
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {step > 0 && (
                <button
                  onClick={() => setStep(step - 1)}
                  className="btn secondary-btn"
                >
                  Back
                </button>
              )}
              <button
                onClick={handleNext}
                className="btn primary-btn"
              >
                {step === steps.length - 1 ? 'Get Started' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  return createPortal(overlayContent, document.body);
}
