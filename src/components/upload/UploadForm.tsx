"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Upload, FileUp, AlertCircle, CheckCircle } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function UploadForm() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [jerseyNumber, setJerseyNumber] = useState("7"); // Default jersey number
  const [profileCompletion, setProfileCompletion] = useState<{completionPercentage: number, verificationStatus: string} | null>(null);
  const [isCheckingProfile, setIsCheckingProfile] = useState(true);
  const [lastVideoId, setLastVideoId] = useState<string | null>(null);

  // Check profile completion and verification status
  useEffect(() => {
    const checkProfile = async () => {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const response = await axios.get(`${backendUrl}/api/user/profile-completion`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        setProfileCompletion(response.data);
      } catch (error) {
        console.error('Failed to check profile:', error);
        toast.error('Failed to verify profile status');
      } finally {
        setIsCheckingProfile(false);
      }
    };

    checkProfile();
  }, [router]);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Check file size (limit to 500MB)
    if (selectedFile.size > 500 * 1024 * 1024) {
      setUploadError("File size exceeds 500MB limit");
      return;
    }

    // Check file type
    const validTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo'];
    if (!validTypes.includes(selectedFile.type)) {
      setUploadError("File type not supported. Please upload MP4, MOV, or AVI");
      return;
    }

    setUploadError(null);
    setFile(selectedFile);

    // Create preview URL
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
  };

  // Handle form submission - upload directly to backend (which uploads to Google Drive)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';
    
    // Check profile completion
    if (!profileCompletion) {
      toast.error("Unable to verify profile status");
      return;
    }

    if (profileCompletion.completionPercentage < 100) {
      toast.error("Your profile must be 100% complete to upload videos");
      router.push('/profile-completion');
      return;
    }

    if (profileCompletion.verificationStatus !== 'VERIFIED') {
      toast.error("Your profile must be verified by a scout to upload videos");
      return;
    }
    
    if (!file) {
      toast.error("Please select a file to upload");
      return;
    }
    
    try {
      setIsUploading(true);
      setProgress(0);
      
      // Upload video file directly to backend (which uploads to Google Drive)
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error("Authentication token not found");
      }

      const formData = new FormData();
      formData.append('video', file);

      // Upload with progress tracking
      const response = await axios.post(
        `${backendUrl}/api/videos/upload`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              setProgress(percentCompleted);
            }
          }
        }
      );

      // Save last uploaded video id so we can link ML metrics to this video
      if (response.data?.id) {
        setLastVideoId(response.data.id);
      }

      toast.success("Video uploaded to Google Drive successfully! You can now run AI analysis.");
      setUploadSuccess(true);
      
    } catch (error) {
      console.error('Upload failed:', error);
      
      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.message || 
          error.response?.data?.error ||
          "Failed to upload video. Please try again."
        );
      } else {
        toast.error("An unexpected error occurred during upload.");
      }
    } finally {
      setIsUploading(false);
    }
  };

  // Process video for analysis and redirect to player analysis page
  const handleProcessAnalysis = async () => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    try {
      if (!file) {
        toast.error("Missing file information");
        return;
      }

      setIsUploading(true);

      // Create form data for API call
      const formData = new FormData();
      formData.append("jerseyNumber", jerseyNumber);
      formData.append("video", file, file.name);
      if (lastVideoId) {
        formData.append("videoId", lastVideoId);
      }

      // Call the API to process the video (Node -> Python)
      const token = localStorage.getItem("accessToken");
      if (!token) {
        toast.error("Authentication required. Please log in again.");
        return;
      }

      const response = await axios.post(
        `${backendUrl}/upload-performance-video`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Expect real stats coming from Python model
      // e.g. metrics = { stats: { distance_covered, top_speed, pass_accuracy, dribble_success, shot_conversion, overall_accuracy, ... } }
      const metricsPayload = response.data?.metrics;
      if (metricsPayload) {
        const stats =
          metricsPayload.stats ||
          metricsPayload.player_stats || // in case backend forwards Python directly
          metricsPayload ||
          {};

        const parseNumber = (raw: unknown, unitSuffix?: string): number => {
          if (typeof raw === "number") return raw;
          if (typeof raw === "string") {
            const cleaned = unitSuffix ? raw.replace(unitSuffix, "") : raw;
            const parsed = parseFloat(cleaned);
            return isNaN(parsed) ? 0 : parsed;
          }
          return 0;
        };

        // Python backend returns distance_covered in meters, e.g. "905.35 m"
        const distanceCovered = parseNumber(stats.distance_covered, " m");
        const topSpeed = parseNumber(stats.top_speed, " km/h");

        // All these come directly from Python stats (no hard-coded fake values)
        const dribbling =
          typeof stats.dribble_success === "number" ? stats.dribble_success : 0;
        const passing =
          typeof stats.pass_accuracy === "number" ? stats.pass_accuracy : 0;
        const shooting =
          typeof stats.shot_conversion === "number" ? stats.shot_conversion : 0;

        const overallAccuracy =
          typeof stats.overall_accuracy === "number"
            ? Math.max(0, Math.min(stats.overall_accuracy, 100))
            : 0;

        // Stamina is derived from real distance covered (logic-based but using real distance)
        const normalizeStamina = (distanceM: number): number => {
          if (!distanceM || distanceM <= 0) return 0;
          const referenceDistance = 1000; // 1 km → 100 stamina
          const value = (distanceM / referenceDistance) * 100;
          return Math.max(0, Math.min(value, 100));
        };

        const stamina = normalizeStamina(distanceCovered);

        const playerMetrics = {
          id: `temp-${Date.now()}`,
          playerProfileId: "",
          speed: topSpeed,
          dribbling,
          passing,
          shooting,
          stamina,
          createdAt: new Date().toISOString(),
          distanceCovered,
          topSpeed,
          overallAccuracy,
        };

        localStorage.setItem("playerMetrics", JSON.stringify(playerMetrics));
      }

      toast.success("Performance metrics processed successfully!");

      // Redirect to the player analysis page
      router.push("/playeranalysis");
    } catch (error) {
      console.error("Analysis processing failed:", error);
      toast.error("Failed to process video analysis. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  // Clear selected file
  const clearFile = () => {
    setFile(null);
    setPreviewUrl(null);
    setProgress(0);
    setUploadError(null);
    setUploadSuccess(false);
  };

  if (isCheckingProfile) {
    return (
      <div className="text-center py-8">
        <div className="text-zinc-400">Checking profile status...</div>
      </div>
    );
  }

  const canUpload = (profileCompletion?.completionPercentage ?? 0) === 100 && 
                    profileCompletion?.verificationStatus === 'VERIFIED';

  return (
    <div>
      {!canUpload ? (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-red-400 font-semibold mb-1">Upload Not Available</h3>
              {(profileCompletion?.completionPercentage ?? 0) < 100 && (
                <p className="text-zinc-400 text-sm">
                  Your profile must be 100% complete. Current: {profileCompletion?.completionPercentage ?? 0}%
                </p>
              )}
              {(profileCompletion?.completionPercentage ?? 0) === 100 && profileCompletion?.verificationStatus !== 'VERIFIED' && (
                <p className="text-zinc-400 text-sm">
                  Your profile must be verified by a scout to upload videos. Current status: {profileCompletion?.verificationStatus}
                </p>
              )}
              <Button
                type="button"
                onClick={() => router.push('/profile-completion')}
                className="mt-3 bg-red-600 hover:bg-red-700 text-white text-sm"
                size="sm"
              >
                Complete Profile
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <form onSubmit={handleSubmit}>
            {!file ? (
              <div 
                className={`border-2 border-dashed ${uploadError ? 'border-red-500' : 'border-zinc-700'} rounded-xl p-8 text-center cursor-pointer hover:border-red-500 transition-colors`}
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <input
                  id="file-upload"
                  type="file"
                  accept="video/mp4,video/quicktime,video/x-msvideo"
                  className="hidden"
                  onChange={handleFileChange}
                />
                
                <div className="flex flex-col items-center justify-center">
                  <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mb-4">
                    <FileUp className="w-8 h-8 text-red-500" />
                  </div>
                  
                  <h3 className="text-white font-medium text-lg mb-2">
                    Drag & drop or click to upload
                  </h3>
                  
                  <p className="text-zinc-400 text-sm mb-4">
                    Supported formats: MP4, MOV, AVI (Max 500MB)
                  </p>
                  
                  <Button 
                    type="button"
                    variant="outline" 
                    className="border-zinc-700 text-white hover:bg-red-600 hover:text-white hover:border-red-600"
                  >
                    Select Video
                  </Button>
                  
                  {uploadError && (
                    <div className="mt-4 text-red-500 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      <span>{uploadError}</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-zinc-900 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-zinc-800 rounded-lg flex items-center justify-center">
                      <Upload className="w-6 h-6 text-red-500" />
                    </div>
                    <div>
                      <h3 className="text-white font-medium text-md">{file.name}</h3>
                      <p className="text-zinc-400 text-sm">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={clearFile}
                    className="text-zinc-400 hover:text-white"
                  >
                    Remove
                  </Button>
                </div>
                
                {previewUrl && (
                  <div className="mb-4 rounded-lg overflow-hidden bg-black">
                    <video
                      src={previewUrl}
                      controls
                      className="w-full h-auto max-h-[300px]"
                    />
                  </div>
                )}
                
                {/* Jersey number input field */}
                <div className="mb-4">
                  <label htmlFor="jersey-number" className="block text-zinc-400 text-sm mb-1">
                    Jersey Number
                  </label>
                  <input
                    id="jersey-number"
                    type="text"
                    value={jerseyNumber}
                    onChange={(e) => setJerseyNumber(e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                
                {isUploading ? (
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-zinc-400">Uploading...</span>
                      <span className="text-white">{progress}%</span>
                    </div>
                    <div className="w-full bg-zinc-800 rounded-full h-2">
                      <div 
                        className="bg-red-600 h-2 rounded-full" 
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-4">
                    {!uploadSuccess ? (
                      <Button
                        type="submit"
                        disabled={!canUpload}
                        className="bg-red-600 hover:bg-red-700 text-white w-full disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Upload Video
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        onClick={handleProcessAnalysis}
                        className="bg-green-600 hover:bg-green-700 text-white w-full flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-5 h-5" />
                        Process Video Analysis
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}
          </form>
          
          <div className="mt-6 text-sm text-zinc-400">
            <p>
              By uploading, you agree to our <span className="text-red-500 cursor-pointer">Terms of Service</span> and 
              understand that AI analysis may take 5-15 minutes to complete.
            </p>
          </div>
        </>
      )}
    </div>
  );
}