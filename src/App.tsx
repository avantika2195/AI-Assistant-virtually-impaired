import React, { useState } from 'react';
import Profile from './components/Profile';
import ImageRecognition from './components/ImageRecognition';
import Chatbot from './components/Chatbot';
import { Camera, MessageSquare, User } from 'lucide-react';

interface ProfileData {
  name: string;
  age: string;
  emergencyContact: string;
}

function App() {
  const [profileComplete, setProfileComplete] = useState(false);
  const [activeTab, setActiveTab] = useState<'camera' | 'chat'>('camera');

  const handleProfileComplete = (data: ProfileData) => {
    setProfileComplete(true);
    localStorage.setItem('userProfile', JSON.stringify(data));
  };

  if (!profileComplete) {
    return <Profile onComplete={handleProfileComplete} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-500">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="flex justify-center space-x-4 mb-6">
            <button
              onClick={() => setActiveTab('camera')}
              className={`flex items-center px-6 py-3 rounded-lg transition-colors ${
                activeTab === 'camera'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Camera className="w-5 h-5 mr-2" />
              Camera
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex items-center px-6 py-3 rounded-lg transition-colors ${
                activeTab === 'chat'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <MessageSquare className="w-5 h-5 mr-2" />
              Chat
            </button>
          </div>

          <div className="mb-8">
            {activeTab === 'camera' ? <ImageRecognition /> : <Chatbot />}
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <User className="w-6 h-6 text-purple-600" />
              <div>
                <h3 className="font-medium text-gray-800">
                  {JSON.parse(localStorage.getItem('userProfile') || '{}').name}
                </h3>
                <p className="text-sm text-gray-500">
                  Emergency Contact: {JSON.parse(localStorage.getItem('userProfile') || '{}').emergencyContact}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;