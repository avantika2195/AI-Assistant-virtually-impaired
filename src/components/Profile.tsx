import React, { useState } from 'react';
import { Camera, User } from 'lucide-react';

interface ProfileData {
  name: string;
  age: string;
  emergencyContact: string;
}

export default function Profile({ onComplete }: { onComplete: (data: ProfileData) => void }) {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<ProfileData>({
    name: '',
    age: '',
    emergencyContact: ''
  });

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  };

  const handleVoiceInput = () => {
    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      switch (step) {
        case 1:
          setProfile(prev => ({ ...prev, name: transcript }));
          break;
        case 2:
          setProfile(prev => ({ ...prev, age: transcript }));
          break;
        case 3:
          setProfile(prev => ({ ...prev, emergencyContact: transcript }));
          break;
      }
      setStep(prev => prev + 1);
    };
    recognition.start();
  };

  React.useEffect(() => {
    const questions = [
      'Please say your name',
      'Please say your age',
      'Please say your emergency contact number'
    ];
    
    if (step <= 3) {
      speak(questions[step - 1]);
    } else {
      onComplete(profile);
      speak('Profile setup complete. Welcome to Vision Assist!');
    }
  }, [step]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <div className="flex items-center justify-center mb-8">
          <User className="w-16 h-16 text-purple-600" />
        </div>
        
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Profile Setup
        </h1>

        <div className="space-y-6">
          {step <= 3 ? (
            <div className="text-center">
              <button
                onClick={handleVoiceInput}
                className="flex items-center justify-center w-full py-3 px-6 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Camera className="w-6 h-6 mr-2" />
                {step === 1 && 'Record Name'}
                {step === 2 && 'Record Age'}
                {step === 3 && 'Record Emergency Contact'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-gray-600"><strong>Name:</strong> {profile.name}</p>
              <p className="text-gray-600"><strong>Age:</strong> {profile.age}</p>
              <p className="text-gray-600"><strong>Emergency Contact:</strong> {profile.emergencyContact}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}