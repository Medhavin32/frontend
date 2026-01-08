"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios, { AxiosError } from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import AppLayout from "@/components/layout/AppLayout";
import Image from "next/image";
import { User } from "lucide-react";

// Add an interface for the error response data
interface ErrorResponse {
  message: string;
}

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

export default function PlayerProfile() {
  const router = useRouter();
  const [age, setAge] = useState('');
  const [position, setPosition] = useState('');
  const [club, setClub] = useState('');
  const [nationality, setNationality] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+1');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('');
  const [pincode, setPincode] = useState('');
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState('');
  const [profilePictureUrl, setProfilePictureUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Predefined position options
  const positionOptions = [
    'Goalkeeper', 
    'Defender', 
    'Midfielder', 
    'Forward'
  ];

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('accessToken');
    const user = localStorage.getItem('user');

    if (!token || !user) {
      // Redirect to login if not authenticated
      router.push('/login');
      return;
    }

    // Load user profile data
    const loadUserProfile = async () => {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';
      try {
        // Load user profile
        const userResponse = await axios.get(`${backendUrl}/api/user/profile`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        const userData = userResponse.data;
        console.log('User profile data:', userData); // Debug log
        
        // Set user profile fields
        setPhoneNumber(userData.phoneNumber || '');
        setCountryCode(userData.countryCode || '+1');
        setCity(userData.city || '');
        setState(userData.state || '');
        setCountry(userData.country || '');
        setPincode(userData.pincode || '');
        setProfilePictureUrl(userData.profilePicture || '');
        setProfilePicturePreview(userData.profilePicture || '');

        // Check if playerProfile is included in user response
        if (userData.playerProfile) {
          console.log('Player profile from user data:', userData.playerProfile);
          const profile = userData.playerProfile;
          setAge(profile.age?.toString() || '');
          setPosition(profile.position || '');
          setClub(profile.club || '');
          setNationality(profile.nationality || '');
        } else {
          // Try to load player profile separately if not included in user response
          try {
            const playerResponse = await axios.get(`${backendUrl}/api/player/profile`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });

            console.log('Player profile data:', playerResponse.data); // Debug log
            
            // The endpoint returns the profile directly, not wrapped in { profile: ... }
            const profile = playerResponse.data;
            if (profile) {
              setAge(profile.age?.toString() || '');
              setPosition(profile.position || '');
              setClub(profile.club || '');
              setNationality(profile.nationality || '');
            }
          } catch (playerError) {
            // Player profile might not exist yet, that's okay
            console.log('Player profile not found or error:', playerError);
            // Don't show error if profile doesn't exist - user can create it
          }
        }
      } catch (error) {
        console.error('Error loading profile data:', error);
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 404) {
            // Profile doesn't exist yet, that's fine
            console.log('Profile not found, user can create it');
          } else {
            toast.error('Failed to load profile data. Please try again.');
          }
        }
      } finally {
        setIsLoadingData(false);
      }
    };

    loadUserProfile();
  }, [router]);

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        toast.error('Invalid file type. Please upload JPG, PNG, or WEBP image.');
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size too large. Maximum size is 5MB.');
        return;
      }

      // Store the file object
      setProfilePicture(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicturePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitProfile = async () => {
    // Validate inputs
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';
    if (!age || !position || !club || !nationality) {
      toast.error("Please fill in all player profile fields");
      return;
    }

    // Additional validations
    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 16 || ageNum > 50) {
      toast.error("Please enter a valid age between 16 and 50");
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem('accessToken');
      let finalProfilePictureUrl = profilePictureUrl;

      // Upload profile picture first if a new file was selected
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
          toast.error("Failed to upload profile picture. Please try again.");
          setIsLoading(false);
          return;
        }
      }

      // Update user profile with all fields (always use JSON since file is uploaded separately)
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

      // Then create/update player profile
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

      toast.success("Profile updated successfully");
      router.push('/profile-completion');
    } catch (error) {
      console.error('Profile update failed:', error);
      const errorMessage = (error as AxiosError<{message?: string, errors?: Array<{msg: string}>}>).response?.data;
      if (errorMessage?.errors && Array.isArray(errorMessage.errors)) {
        toast.error(errorMessage.errors[0]?.msg || "Failed to update profile. Please try again.");
      } else {
        toast.error(
          errorMessage?.message || 
          "Failed to update profile. Please try again."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="w-full max-w-5xl mx-auto">
        <div className="bg-zinc-950 rounded-xl p-6 md:p-8 border border-zinc-800">
          <h2 className="text-3xl font-bold text-white mb-6">
            Complete Your Profile
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Profile Picture */}
            <div className="lg:col-span-1">
              <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
                <label className="block text-white font-medium mb-4">Profile Picture</label>
                <div className="flex flex-col items-center">
                  <div className="relative w-32 h-32 rounded-full bg-zinc-800 border-4 border-red-600 flex items-center justify-center mb-4 overflow-hidden">
                    {profilePicturePreview ? (
                      <Image
                        src={profilePicturePreview}
                        alt="Profile preview"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <User className="h-12 w-12 text-zinc-500" />
                    )}
                  </div>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleProfilePictureChange}
                    className="w-full p-2 bg-zinc-950 text-white text-sm border border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 cursor-pointer"
                  />
                  <p className="text-zinc-400 text-xs mt-2 text-center">JPG, PNG, WEBP (Max 5MB)</p>
                </div>
              </div>
            </div>

            {/* Right Column - Form Fields */}
            <div className="lg:col-span-2">
              <div className="space-y-6">
                {/* Contact Information Section */}
                <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
                  <h3 className="text-lg font-semibold text-white mb-4">Contact Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-zinc-300 text-sm mb-2">Country Code</label>
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
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-zinc-300 text-sm mb-2">Phone Number</label>
                      <input 
                        type="tel" 
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="Enter your phone number"
                        className="w-full p-3 bg-zinc-950 text-white border border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                      />
                    </div>
                  </div>
                </div>

                {/* Address Information Section */}
                <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
                  <h3 className="text-lg font-semibold text-white mb-4">Address Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-zinc-300 text-sm mb-2">City</label>
                      <input 
                        type="text" 
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Enter your city"
                        className="w-full p-3 bg-zinc-950 text-white border border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-300 text-sm mb-2">State</label>
                      <input 
                        type="text" 
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        placeholder="Enter your state"
                        className="w-full p-3 bg-zinc-950 text-white border border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-300 text-sm mb-2">Country</label>
                      <input 
                        type="text" 
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        placeholder="Enter your country"
                        className="w-full p-3 bg-zinc-950 text-white border border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-300 text-sm mb-2">Pincode</label>
                      <input 
                        type="text" 
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        placeholder="Enter pincode"
                        className="w-full p-3 bg-zinc-950 text-white border border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                      />
                    </div>
                  </div>
                </div>

                {/* Player Details Section */}
                <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
                  <h3 className="text-lg font-semibold text-white mb-4">Player Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-zinc-300 text-sm mb-2">Age</label>
                      <input 
                        type="number" 
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        placeholder="Enter your age"
                        className="w-full p-3 bg-zinc-950 text-white border border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-300 text-sm mb-2">Position</label>
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
                    </div>
                    <div>
                      <label className="block text-zinc-300 text-sm mb-2">Club</label>
                      <input 
                        type="text"
                        value={club}
                        onChange={(e) => setClub(e.target.value)}
                        placeholder="Enter your current club"
                        className="w-full p-3 bg-zinc-950 text-white border border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-300 text-sm mb-2">Nationality</label>
                      <input 
                        type="text"
                        value={nationality}
                        onChange={(e) => setNationality(e.target.value)}
                        placeholder="Enter your nationality"
                        className="w-full p-3 bg-zinc-950 text-white border border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end pt-4">
                  <Button 
                    size="lg" 
                    className="bg-red-600 hover:bg-red-700 text-white px-8 rounded-full"
                    onClick={handleSubmitProfile}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Submitting...' : 'Save Profile'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}