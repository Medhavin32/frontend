"use client";

import { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { 
  HelpCircle, 
  MessageCircle, 
  Mail, 
  Phone, 
  FileText, 
  Video, 
  Upload, 
  User,
  ChevronDown,
  ChevronUp,
  ExternalLink
} from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqs: FAQItem[] = [
  {
    category: "Getting Started",
    question: "How do I create an account?",
    answer: "Click on the 'Sign Up' button in the header, select your role (Player or Scout), and fill in your basic information. After signing up, you'll need to complete your profile to access all features."
  },
  {
    category: "Getting Started",
    question: "What information do I need to complete my profile?",
    answer: "For players, you need to provide: name, email, phone number with country code, address (city, state, country, pincode), profile picture, age, position, club, and nationality. Your profile must be 100% complete and verified by a scout before you can upload videos."
  },
  {
    category: "Video Upload",
    question: "What video formats are supported?",
    answer: "We support MP4, MOV, and AVI formats. The maximum file size is 500MB. Videos should be clear and show the player clearly for best tracking results."
  },
  {
    category: "Video Upload",
    question: "How long does video analysis take?",
    answer: "AI analysis typically takes 5-15 minutes depending on video length and quality. You'll receive a notification once the analysis is complete."
  },
  {
    category: "Video Upload",
    question: "Why can't I upload a video?",
    answer: "To upload videos, your profile must be 100% complete and verified by a scout. Check your profile completion status on the Profile Completion page. If your profile is complete but not verified, you'll need to wait for a scout to verify your account."
  },
  {
    category: "Profile & Verification",
    question: "How do I get my profile verified?",
    answer: "After completing your profile 100%, a scout will review your information and verify your account. This process may take a few days. You'll be notified once your profile is verified."
  },
  {
    category: "Profile & Verification",
    question: "What if my profile verification is rejected?",
    answer: "If your profile is rejected, you'll see remarks from the scout explaining why. Update your profile based on the feedback and resubmit for verification."
  },
  {
    category: "Performance Metrics",
    question: "What metrics are tracked?",
    answer: "Our AI tracks various performance metrics including: pass accuracy, dribble success, shot conversion, distance covered, top speed, and overall tracking accuracy. These metrics are displayed in your player analysis dashboard."
  },
  {
    category: "Performance Metrics",
    question: "How accurate are the performance metrics?",
    answer: "Our AI uses advanced computer vision and tracking algorithms to provide accurate metrics. The overall accuracy percentage shows how well the system tracked the player throughout the video."
  },
  {
    category: "Account",
    question: "How do I update my profile information?",
    answer: "Go to the Profile page from the sidebar and click 'Edit Profile'. Make your changes and click 'Save Changes'. Your profile picture can be updated by selecting a new image during editing."
  },
  {
    category: "Account",
    question: "Can I change my role from Player to Scout or vice versa?",
    answer: "Your role is set during signup and cannot be changed. If you need a different role, please contact support or create a new account with the desired role."
  },
  {
    category: "Technical",
    question: "What browser should I use?",
    answer: "We recommend using the latest version of Chrome, Firefox, Safari, or Edge for the best experience. Make sure JavaScript is enabled."
  },
  {
    category: "Technical",
    question: "I'm experiencing technical issues. What should I do?",
    answer: "Try refreshing the page, clearing your browser cache, or logging out and back in. If the issue persists, contact our support team using the contact form below."
  }
];

export default function HelpPage() {
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const categories = ["All", ...Array.from(new Set(faqs.map(faq => faq.category)))];
  const filteredFAQs = selectedCategory === "All" 
    ? faqs 
    : faqs.filter(faq => faq.category === selectedCategory);

  const toggleFAQ = (index: number) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the form data to your backend
    alert("Thank you for contacting us! We'll get back to you soon.");
    setContactForm({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <AppLayout>
      <div className="w-full max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-zinc-950 rounded-xl p-6 md:p-8 border border-zinc-800 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center">
              <HelpCircle className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white">Help & Support</h1>
          </div>
          <p className="text-zinc-400">
            Find answers to common questions or contact our support team for assistance.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Quick Links */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-zinc-950 rounded-xl p-6 border border-zinc-800">
              <h2 className="text-xl font-semibold text-white mb-4">Quick Links</h2>
              <div className="space-y-3">
                <a 
                  href="/profile" 
                  className="flex items-center gap-3 p-3 bg-zinc-900 rounded-lg hover:bg-zinc-800 transition-colors group"
                >
                  <User className="h-5 w-5 text-zinc-400 group-hover:text-red-500" />
                  <span className="text-white group-hover:text-red-500">View Profile</span>
                </a>
                <a 
                  href="/upload" 
                  className="flex items-center gap-3 p-3 bg-zinc-900 rounded-lg hover:bg-zinc-800 transition-colors group"
                >
                  <Upload className="h-5 w-5 text-zinc-400 group-hover:text-red-500" />
                  <span className="text-white group-hover:text-red-500">Upload Video</span>
                </a>
                <a 
                  href="/profile-completion" 
                  className="flex items-center gap-3 p-3 bg-zinc-900 rounded-lg hover:bg-zinc-800 transition-colors group"
                >
                  <FileText className="h-5 w-5 text-zinc-400 group-hover:text-red-500" />
                  <span className="text-white group-hover:text-red-500">Profile Completion</span>
                </a>
              </div>
            </div>

            <div className="bg-zinc-950 rounded-xl p-6 border border-zinc-800">
              <h2 className="text-xl font-semibold text-white mb-4">Contact Support</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-zinc-400">
                  <Mail className="h-5 w-5" />
                  <span className="text-sm">support@footballscout.ai</span>
                </div>
                <div className="flex items-center gap-3 text-zinc-400">
                  <Phone className="h-5 w-5" />
                  <span className="text-sm">+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center gap-3 text-zinc-400">
                  <MessageCircle className="h-5 w-5" />
                  <span className="text-sm">Available 24/7</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - FAQs and Contact Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* FAQ Section */}
            <div className="bg-zinc-950 rounded-xl p-6 border border-zinc-800">
              <h2 className="text-2xl font-semibold text-white mb-4">Frequently Asked Questions</h2>
              
              {/* Category Filter */}
              <div className="flex flex-wrap gap-2 mb-6">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      selectedCategory === category
                        ? "bg-red-600 text-white"
                        : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>

              {/* FAQ Items */}
              <div className="space-y-3">
                {filteredFAQs.map((faq, index) => (
                  <div
                    key={index}
                    className="bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden"
                  >
                    <button
                      onClick={() => toggleFAQ(index)}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-zinc-800 transition-colors"
                    >
                      <span className="text-white font-medium pr-4">{faq.question}</span>
                      {expandedFAQ === index ? (
                        <ChevronUp className="h-5 w-5 text-zinc-400 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-zinc-400 flex-shrink-0" />
                      )}
                    </button>
                    {expandedFAQ === index && (
                      <div className="px-4 pb-4">
                        <p className="text-zinc-400 text-sm leading-relaxed">{faq.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-zinc-950 rounded-xl p-6 border border-zinc-800">
              <h2 className="text-2xl font-semibold text-white mb-4">Contact Us</h2>
              <p className="text-zinc-400 text-sm mb-6">
                Can't find what you're looking for? Send us a message and we'll get back to you as soon as possible.
              </p>
              
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-zinc-300 text-sm mb-2">Name</label>
                    <input
                      type="text"
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      required
                      className="w-full p-3 bg-zinc-900 text-white border border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-300 text-sm mb-2">Email</label>
                    <input
                      type="email"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      required
                      className="w-full p-3 bg-zinc-900 text-white border border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-zinc-300 text-sm mb-2">Subject</label>
                  <input
                    type="text"
                    value={contactForm.subject}
                    onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                    required
                    className="w-full p-3 bg-zinc-900 text-white border border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                    placeholder="What can we help you with?"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 text-sm mb-2">Message</label>
                  <textarea
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    required
                    rows={5}
                    className="w-full p-3 bg-zinc-900 text-white border border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 resize-none"
                    placeholder="Tell us more about your question or issue..."
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-red-600 hover:bg-red-700 text-white"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
              </form>
            </div>

            {/* Documentation Links */}
            <div className="bg-zinc-950 rounded-xl p-6 border border-zinc-800">
              <h2 className="text-xl font-semibold text-white mb-4">Documentation</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <a
                  href="#"
                  className="flex items-center gap-3 p-4 bg-zinc-900 rounded-lg hover:bg-zinc-800 transition-colors group"
                >
                  <Video className="h-5 w-5 text-zinc-400 group-hover:text-red-500" />
                  <div className="flex-1">
                    <h3 className="text-white font-medium group-hover:text-red-500">Video Upload Guide</h3>
                    <p className="text-zinc-400 text-sm">Learn how to upload and analyze videos</p>
                  </div>
                  <ExternalLink className="h-4 w-4 text-zinc-400 group-hover:text-red-500" />
                </a>
                <a
                  href="#"
                  className="flex items-center gap-3 p-4 bg-zinc-900 rounded-lg hover:bg-zinc-800 transition-colors group"
                >
                  <FileText className="h-5 w-5 text-zinc-400 group-hover:text-red-500" />
                  <div className="flex-1">
                    <h3 className="text-white font-medium group-hover:text-red-500">Profile Setup</h3>
                    <p className="text-zinc-400 text-sm">Complete guide to setting up your profile</p>
                  </div>
                  <ExternalLink className="h-4 w-4 text-zinc-400 group-hover:text-red-500" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

