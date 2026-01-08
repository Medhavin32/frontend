"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios, { AxiosError } from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import AppLayout from "@/components/layout/AppLayout";
import Image from "next/image";
import { Edit2, Save, X, Mail, Phone, MapPin, User, Award, Shield, CheckCircle2, AlertCircle, XCircle } from "lucide-react";

// Common country codes
const countryCodes = [
  { code: '+1', country: 'US/CA' },
  { code: '+44', country: 'UK' },
  { code: '+91', country: 'India' },
  { code: '+86', country: 'China' },
  { code: '+81', country: 'Japan' },
  { code: '+49', country: 'Germany' },
  { code: '+33', country: 'France' },
  { code: '+39', country: 'Italy' },
  { code: '+34', country: 'Spain' },
  { code: '+7', country: 'Russia' },
  { code: '+61', country: 'Australia' },
  { code: '+55', country: 'Brazil' },
  { code: '+52', country: 'Mexico' },
  { code: '+27', country: 'South Africa' },
  { code: '+971', country: 'UAE' },
  { code: '+966', country: 'Saudi Arabia' },
];

const positionOptions = [
  'Goalkeeper', 
  'Defender', 
  'Midfielder', 
  'Forward'
];

export default function ProfilePage() {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  // User profile fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+1');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('');
  const [pincode, setPincode] = useState('');
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState('');
  const [profilePictureUrl, setProfilePictureUrl] = useState('');
  const [verificationStatus, setVerificationStatus] = useState<'VERIFIED' | 'PENDING' | 'REJECTED'>('PENDING');
  const [verificationRemarks, setVerificationRemarks] = useState('');

  // Player profile fields
  const [age, setAge] = useState('');
  const [position, setPosition] = useState('');
  const [club, setClub] = useState('');
  const [nationality, setNationality] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const user = localStorage.getItem('user');

    if (!token || !user) {
      router.push('/login');
      return;
    }

    try {
      const userData = JSON.parse(user);
      setUserRole(userData.role?.toLowerCase() || null);
    } catch (error) {
      console.error('Error parsing user data:', error);
    }

    loadProfile();
  }, [router]);

  const loadProfile = async () => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';
    const token = localStorage.getItem('accessToken');

    try {
      // Load user profile
      const userResponse = await axios.get(`${backendUrl}/api/user/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const userData = userResponse.data;
      
      // Set user profile fields
      setName(userData.name || '');
      setEmail(userData.email || '');
      setPhoneNumber(userData.phoneNumber || '');
      setCountryCode(userData.countryCode || '+1');
      setCity(userData.city || '');
      setState(userData.state || '');
      setCountry(userData.country || '');
      setPincode(userData.pincode || '');
      setProfilePictureUrl(userData.profilePicture || '');
      setProfilePicturePreview(userData.profilePicture || '');
      setVerificationStatus(userData.verificationStatus || 'PENDING');
      setVerificationRemarks(userData.verificationRemarks || '');

      // Load player profile if user is a player
      if (userData.role === 'PLAYER' && userData.playerProfile) {
        const profile = userData.playerProfile;
        setAge(profile.age?.toString() || '');
        setPosition(profile.position || '');
        setClub(profile.club || '');
        setNationality(profile.nationality || '');
      } else if (userData.role === 'PLAYER') {
        // Try to load player profile separately
        try {
          const playerResponse = await axios.get(`${backendUrl}/api/player/profile`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const profile = playerResponse.data;
          if (profile) {
            setAge(profile.age?.toString() || '');
            setPosition(profile.position || '');
            setClub(profile.club || '');
            setNationality(profile.nationality || '');
          }
        } catch (error) {
          // Player profile might not exist yet
          console.log('Player profile not found');
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Failed to load profile data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        toast.error('Invalid file type. Please upload JPG, PNG, or WEBP image.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size too large. Maximum size is 5MB.');
        return;
      }
      setProfilePicture(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicturePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';
    const token = localStorage.getItem('accessToken');

    if (!token) {
      toast.error("Authentication token not found");
      router.push('/login');
      return;
    }

    setIsSaving(true);

    try {
      let finalProfilePictureUrl = profilePictureUrl;

      // Upload profile picture if a new file was selected
      if (profilePicture) {
        const formData = new FormData();
        formData.append('profilePicture', profilePicture);

        try {
          const uploadResponse = await axios.post(
            `${backendUrl}/api/user/profile/picture`,
            formData,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
              }
            }
          );
          finalProfilePictureUrl = uploadResponse.data.profilePictureUrl;
          toast.success("Profile picture uploaded successfully");
        } catch (uploadError) {
          console.error('Profile picture upload failed:', uploadError);
          toast.error("Failed to upload profile picture");
          setIsSaving(false);
          return;
        }
      }

      // Update user profile
      await axios.put(
        `${backendUrl}/api/user/profile`,
        {
          phoneNumber: phoneNumber || undefined,
          countryCode: countryCode || undefined,
          city: city || undefined,
          state: state || undefined,
          country: country || undefined,
          pincode: pincode || undefined,
          profilePicture: finalProfilePictureUrl || undefined
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Update player profile if user is a player
      if (userRole === 'player') {
        const ageNum = parseInt(age);
        if (age && position && club && nationality) {
          await axios.post(
            `${backendUrl}/api/player/profile`,
            { 
              age: ageNum, 
              position, 
              club, 
              nationality 
            },
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }
          );
        }
      }

      toast.success("Profile updated successfully");
      setIsEditing(false);
      await loadProfile(); // Reload to get updated data
    } catch (error) {
      console.error('Profile update failed:', error);
      const errorMessage = (error as AxiosError<{message?: string, errors?: Array<{msg: string}>}>).response?.data;
      if (errorMessage?.errors && Array.isArray(errorMessage.errors)) {
        toast.error(errorMessage.errors[0]?.msg || "Failed to update profile");
      } else {
        toast.error(errorMessage?.message || "Failed to update profile");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusBadge = (status: 'VERIFIED' | 'PENDING' | 'REJECTED') => {
    switch (status) {
      case 'VERIFIED':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/20 px-3 py-1 text-sm font-medium text-green-400">
            <CheckCircle2 className="h-4 w-4" /> Verified
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-500/20 px-3 py-1 text-sm font-medium text-yellow-400">
            <AlertCircle className="h-4 w-4" /> Pending
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/20 px-3 py-1 text-sm font-medium text-red-400">
            <XCircle className="h-4 w-4" /> Rejected
          </span>
        );
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center text-white">Loading profile...</div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="w-full max-w-6xl mx-auto">
        <div className="bg-zinc-950 rounded-xl p-6 md:p-8 border border-zinc-800">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-white">My Profile</h1>
            <div className="flex items-center gap-3">
              {verificationStatus && getStatusBadge(verificationStatus)}
              {!isEditing ? (
                <Button
                  onClick={() => setIsEditing(true)}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      setIsEditing(false);
                      loadProfile(); // Reload to discard changes
                    }}
                    variant="outline"
                    className="border-zinc-700 text-white hover:bg-zinc-800"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Profile Picture & Basic Info */}
            <div className="lg:col-span-1">
              <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
                <div className="flex flex-col items-center">
                  <div className="relative w-40 h-40 rounded-full bg-zinc-800 border-4 border-red-600 flex items-center justify-center mb-4 overflow-hidden">
                    {/* {profilePicturePreview ? (
                      <Image
                        src={profilePicturePreview}
                        alt="Profile"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <User className="w-16 h-16 text-zinc-500" />
                    )} */}
                    <User className="w-16 h-16 text-zinc-500" />
                  </div>
                  
                  {isEditing && (
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleProfilePictureChange}
                      className="w-full p-2 bg-zinc-950 text-white text-sm border border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 cursor-pointer mb-2"
                    />
                  )}
                  
                  <h2 className="text-2xl font-bold text-white mb-2">{name || 'User'}</h2>
                  <p className="text-zinc-400 text-sm mb-4">{email}</p>
                  
                  {userRole === 'player' && (
                    <div className="w-full space-y-2">
                      <div className="flex items-center gap-2 text-zinc-300 text-sm">
                        <Award className="h-4 w-4" />
                        <span>Role: Player</span>
                      </div>
                      {position && (
                        <div className="flex items-center gap-2 text-zinc-300 text-sm">
                          <Shield className="h-4 w-4" />
                          <span>Position: {position}</span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {userRole === 'scout' && (
                    <div className="flex items-center gap-2 text-zinc-300 text-sm">
                      <Award className="h-4 w-4" />
                      <span>Role: Scout</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Profile Details */}
            <div className="lg:col-span-2">
              <div className="space-y-6">
                {/* Contact Information */}
                <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Mail className="h-5 w-5 text-red-500" />
                    Contact Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-zinc-300 text-sm mb-2">Country Code</label>
                      {isEditing ? (
                        <select
                          value={countryCode}
                          onChange={(e) => setCountryCode(e.target.value)}
                          className="w-full p-3 bg-zinc-950 border border-zinc-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-600"
                        >
                          {countryCodes.map((cc) => (
                            <option key={cc.code} value={cc.code}>
                              {cc.code}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <p className="text-white p-3 bg-zinc-950 rounded-lg border border-zinc-800">{countryCode || 'N/A'}</p>
                      )}
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-zinc-300 text-sm mb-2">Phone Number</label>
                      {isEditing ? (
                        <input 
                          type="tel" 
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          placeholder="Enter your phone number"
                          className="w-full p-3 bg-zinc-950 text-white border border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                        />
                      ) : (
                        <p className="text-white p-3 bg-zinc-950 rounded-lg border border-zinc-800 flex items-center gap-2">
                          <Phone className="h-4 w-4 text-zinc-400" />
                          {phoneNumber || 'N/A'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Address Information */}
                <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-red-500" />
                    Address Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-zinc-300 text-sm mb-2">City</label>
                      {isEditing ? (
                        <input 
                          type="text" 
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="Enter your city"
                          className="w-full p-3 bg-zinc-950 text-white border border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                        />
                      ) : (
                        <p className="text-white p-3 bg-zinc-950 rounded-lg border border-zinc-800">{city || 'N/A'}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-zinc-300 text-sm mb-2">State</label>
                      {isEditing ? (
                        <input 
                          type="text" 
                          value={state}
                          onChange={(e) => setState(e.target.value)}
                          placeholder="Enter your state"
                          className="w-full p-3 bg-zinc-950 text-white border border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                        />
                      ) : (
                        <p className="text-white p-3 bg-zinc-950 rounded-lg border border-zinc-800">{state || 'N/A'}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-zinc-300 text-sm mb-2">Country</label>
                      {isEditing ? (
                        <input 
                          type="text" 
                          value={country}
                          onChange={(e) => setCountry(e.target.value)}
                          placeholder="Enter your country"
                          className="w-full p-3 bg-zinc-950 text-white border border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                        />
                      ) : (
                        <p className="text-white p-3 bg-zinc-950 rounded-lg border border-zinc-800">{country || 'N/A'}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-zinc-300 text-sm mb-2">Pincode</label>
                      {isEditing ? (
                        <input 
                          type="text" 
                          value={pincode}
                          onChange={(e) => setPincode(e.target.value)}
                          placeholder="Enter pincode"
                          className="w-full p-3 bg-zinc-950 text-white border border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                        />
                      ) : (
                        <p className="text-white p-3 bg-zinc-950 rounded-lg border border-zinc-800">{pincode || 'N/A'}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Player Details (only for players) */}
                {userRole === 'player' && (
                  <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Award className="h-5 w-5 text-red-500" />
                      Player Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-zinc-300 text-sm mb-2">Age</label>
                        {isEditing ? (
                          <input 
                            type="number" 
                            value={age}
                            onChange={(e) => setAge(e.target.value)}
                            placeholder="Enter your age"
                            className="w-full p-3 bg-zinc-950 text-white border border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                          />
                        ) : (
                          <p className="text-white p-3 bg-zinc-950 rounded-lg border border-zinc-800">{age || 'N/A'}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-zinc-300 text-sm mb-2">Position</label>
                        {isEditing ? (
                          <select
                            value={position}
                            onChange={(e) => setPosition(e.target.value)}
                            className="w-full p-3 bg-zinc-950 text-white border border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                          >
                            <option value="">Select Position</option>
                            {positionOptions.map((pos) => (
                              <option key={pos} value={pos}>
                                {pos}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <p className="text-white p-3 bg-zinc-950 rounded-lg border border-zinc-800">{position || 'N/A'}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-zinc-300 text-sm mb-2">Club</label>
                        {isEditing ? (
                          <input 
                            type="text"
                            value={club}
                            onChange={(e) => setClub(e.target.value)}
                            placeholder="Enter your current club"
                            className="w-full p-3 bg-zinc-950 text-white border border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                          />
                        ) : (
                          <p className="text-white p-3 bg-zinc-950 rounded-lg border border-zinc-800">{club || 'N/A'}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-zinc-300 text-sm mb-2">Nationality</label>
                        {isEditing ? (
                          <input 
                            type="text"
                            value={nationality}
                            onChange={(e) => setNationality(e.target.value)}
                            placeholder="Enter your nationality"
                            className="w-full p-3 bg-zinc-950 text-white border border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                          />
                        ) : (
                          <p className="text-white p-3 bg-zinc-950 rounded-lg border border-zinc-800">{nationality || 'N/A'}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Verification Remarks (if rejected) */}
                {verificationStatus === 'REJECTED' && verificationRemarks && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-red-400 mb-2">Verification Remarks</h3>
                    <p className="text-zinc-300 text-sm">{verificationRemarks}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

