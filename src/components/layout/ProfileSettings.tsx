import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, User, Camera, Activity, BarChart3, CheckCircle, Calendar, Flag } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface ProfileSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    avatar: ''
  });
  const [loading, setLoading] = useState(true);
  const [storageUsed, setStorageUsed] = useState(0);
  const [tasksCompleted, setTasksCompleted] = useState(0);

  useEffect(() => {
    if (isOpen) {
      loadUserProfile();
    }
  }, [isOpen]);

  const loadUserProfile = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserData({
          name: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
          email: user.email || '',
          currentPassword: '',
          newPassword: '',
          avatar: user.user_metadata?.avatar_url || ''
        });
        
        // Mock data for storage and tasks (would come from actual database in production)
        setStorageUsed(Math.floor(Math.random() * 3000)); // Random used storage in MB
        setTasksCompleted(Math.floor(Math.random() * 50)); // Random completed tasks
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // In a real app, this would upload the file to Supabase Storage
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserData(prev => ({ ...prev, avatar: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const updateProfile = async () => {
    try {
      // Update user metadata in Supabase Auth
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: userData.name
        }
      });
      
      if (error) throw error;
      
      // If changing password
      if (userData.newPassword) {
        await supabase.auth.updateUser({
          password: userData.newPassword
        });
      }
      
      alert(t('profile.updateSuccess') || 'Profile updated successfully!');
      onClose();
    } catch (error: any) {
      console.error('Error updating profile:', error.message);
      alert(t('profile.updateError') || 'Error updating profile: ' + error.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        className="w-full max-w-2xl bg-bg-primary rounded-2xl shadow-2xl border border-border max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-border flex justify-between items-center">
          <h2 className="text-xl font-bold text-text-primary">{t('profile.settings')}</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-bg-secondary transition-colors"
          >
            <X className="w-5 h-5 text-text-secondary" />
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent-primary"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Profile Information */}
              <div className="space-y-6">
                <h3 className="font-semibold text-text-primary">{t('profile.personalInfo')}</h3>
                
                <div className="flex flex-col items-center">
                  <div className="relative mb-4">
                    <div className="w-24 h-24 rounded-full bg-accent-gradient-1 flex items-center justify-center text-white text-2xl font-bold">
                      {userData.name.charAt(0).toUpperCase()}
                    </div>
                    <label className="absolute bottom-0 right-0 bg-bg-elevated rounded-full p-2 border border-border cursor-pointer">
                      <Camera className="w-4 h-4 text-text-secondary" />
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*" 
                        onChange={handleAvatarUpload}
                      />
                    </label>
                  </div>
                  
                  <div className="w-full space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-2">
                        {t('profile.name')}
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={userData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-2 rounded-lg border border-border bg-bg-secondary focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 outline-none transition-all text-text-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-2">
                        {t('profile.email')}
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={userData.email}
                        disabled
                        className="w-full px-4 py-2 rounded-lg border border-border bg-bg-secondary/50 focus:outline-none text-text-tertiary cursor-not-allowed"
                      />
                      <p className="text-xs text-text-tertiary mt-1">
                        {t('profile.emailCannotBeChanged')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Settings */}
              <div className="space-y-6">
                <h3 className="font-semibold text-text-primary">{t('profile.account')}</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      {t('profile.currentPassword')}
                    </label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={userData.currentPassword}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-lg border border-border bg-bg-secondary focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 outline-none transition-all text-text-primary"
                      placeholder={t('profile.enterCurrentPassword')}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      {t('profile.newPassword')}
                    </label>
                    <input
                      type="password"
                      name="newPassword"
                      value={userData.newPassword}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-lg border border-border bg-bg-secondary focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 outline-none transition-all text-text-primary"
                      placeholder={t('profile.enterNewPassword')}
                    />
                  </div>
                </div>

                {/* Storage Usage */}
                <div className="pt-4">
                  <h4 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    {t('profile.storage')}
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-text-secondary">{t('profile.storageUsed')}</span>
                      <span className="text-text-primary">{storageUsed} MB / 10 GB</span>
                    </div>
                    <div className="w-full bg-bg-tertiary rounded-full h-2">
                      <div 
                        className="bg-accent-primary h-2 rounded-full" 
                        style={{ width: `${Math.min(100, (storageUsed / 10000) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Activity Stats */}
                <div className="pt-4">
                  <h4 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    {t('profile.activity')}
                  </h4>
                  <div className="space-y-2 text-sm text-text-secondary">
                    <div className="flex justify-between">
                      <span>{t('profile.lastActive')}</span>
                      <span>{new Date().toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t('profile.tasksCompleted')}</span>
                      <span>{tasksCompleted}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-border flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-bg-secondary text-text-primary hover:bg-bg-tertiary transition-colors"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={updateProfile}
            className="px-4 py-2 rounded-lg bg-accent-gradient-1 text-white font-medium hover:shadow-lg transition-shadow"
          >
            {t('common.save')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;