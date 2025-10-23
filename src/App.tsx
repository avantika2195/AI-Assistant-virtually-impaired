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

type ActiveTab = 'camera' | 'chat';

const App: React.FC = () => {
  const [profileComplete, setProfileComplete] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('camera');

  const handleProfileComplete = (data: ProfileData): void => {
    setProfileComplete(true);
    localStorage.setItem('userProfile', JSON.stringify(data));
  };

  if (!profileComplete) {
    return <Profile onComplete={handleProfileComplete} />;
  }

  const userProfile: ProfileData = JSON.parse(
    localStorage.getItem('userProfile') || '{"name": "", "age": "", "emergencyContact": ""}'
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-300 via-blue-400 to-indigo-700 flex items-center justify-center">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/20">
          
          {/* Tabs */}
          <div className="flex justify-center space-x-4 mb-6">
            <button
              onClick={() => setActiveTab('camera')}
              className={`flex items-center px-6 py-3 rounded-xl font-medium transition-all ${
                activeTab === 'camera'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Camera className="w-5 h-5 mr-2" />
              Camera
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex items-center px-6 py-3 rounded-xl font-medium transition-all ${
                activeTab === 'chat'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <MessageSquare className="w-5 h-5 mr-2" />
              Chat
            </button>
          </div>

          {/* Main Content */}
          <div className="mb-8">
            {activeTab === 'camera' ? <ImageRecognition /> : <Chatbot />}
          </div>

          {/* User Info */}
          <div className="mt-6 p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl border border-indigo-100">
            <div className="flex items-center space-x-3">
              <User className="w-6 h-6 text-indigo-600" />
              <div>
                <h3 className="font-semibold text-gray-800">{userProfile.name}</h3>
                <p className="text-sm text-gray-500">
                  Emergency Contact: {userProfile.emergencyContact}
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default App;
