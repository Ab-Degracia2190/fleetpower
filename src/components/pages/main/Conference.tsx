import React, { useState, useEffect } from "react";
import {
  MapPin,
  Calendar,
  Users,
  Sparkles,
  User,
  Building,
  Phone,
  FileText,
  Zap,
  Sliders,
  Filter,
} from "lucide-react";
import { GoogleSheetsService } from "@/base/services/GoogleSheetsService";
import SuccessModal from "@/components/modals/Success";
import ErrorModal from "@/components/modals/Error";
import Logo from "@/assets/images/FleetCompleteLogo.jpg";

interface FormData {
  name: string;
  companyName: string;
  contactNumber: string;
  emailAddress: string;
}

interface FormErrors {
  name?: string;
  companyName?: string;
  contactNumber?: string;
  emailAddress?: string;
}

interface FileInfo {
  spreadsheetId: string;
  lastModified: Date;
  recordCount: number;
}

export default function IIEEConferencePage() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    companyName: "",
    contactNumber: "",
    emailAddress: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);

  useEffect(() => {
    const loadClient = async () => {
      try {
        await GoogleSheetsService.initializeClient();
        loadFileInfo();
      } catch (error) {
        console.error("Error initializing Google Identity Services:", error);
        setErrorMessage("Failed to initialize Google Services. Please refresh the page and try again.");
        setShowErrorModal(true);
      }
    };
    loadClient();
  }, []);

  const loadFileInfo = async () => {
    try {
      const info = await GoogleSheetsService.getFileInfo();
      setFileInfo(info);
    } catch (error) {
      console.error("Error loading file info:", error);
    }
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.companyName.trim()) {
      newErrors.companyName = "Company name is required";
    }

    if (!formData.contactNumber.trim()) {
      newErrors.contactNumber = "Contact number is required";
    }

    if (!formData.emailAddress.trim()) {
      newErrors.emailAddress = "Email address is required";
    } else if (!validateEmail(formData.emailAddress)) {
      newErrors.emailAddress = "Please enter a valid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      console.log("Submitting form data:", formData);
      await GoogleSheetsService.addRegistration(formData);

      setShowSuccessModal(true);
      setFormData({
        name: "",
        companyName: "",
        contactNumber: "",
        emailAddress: "",
      });

      await loadFileInfo();
    } catch (error: any) {
      console.error("Error saving registration:", error);
      setErrorMessage(error?.message || "Unknown error occurred. Please try again.");
      setShowErrorModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterClick = () => {
    const form = document.getElementById("conference-form") as HTMLFormElement;
    if (form) {
      form.requestSubmit();
    }
  };

  const handleModalClose = () => {
    setShowSuccessModal(false);
  };

  const handleErrorModalClose = () => {
    setShowErrorModal(false);
    setErrorMessage("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-800 via-blue-900 to-indigo-900 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-red-500/10 rounded-full blur-3xl animate-pulse animation-delay-1000"></div>
        <div className="absolute top-1/3 right-20 w-64 h-64 bg-green-500/10 rounded-full blur-3xl animate-pulse animation-delay-500"></div>
        <div className="absolute bottom-1/3 left-20 w-72 h-72 bg-indigo-500/15 rounded-full blur-3xl animate-pulse animation-delay-1500"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/5 to-transparent animate-pulse"></div>
        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-red-500/5 to-transparent animate-pulse animation-delay-2000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <div className="flex justify-center items-center mb-6">
            <div className="flex w-auto min-w-[300px] h-24 items-center gap-2 bg-white/15 backdrop-blur-sm rounded-2xl px-8 py-4 border border-white/20 animate-fade-in shadow-2xl">
              <img
                src={Logo}
                alt="Fleet Logo"
                className="w-auto h-16 object-contain rounded-lg"
              />
            </div>
          </div>

          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-6 py-2 mb-6 border border-white/20 animate-fade-in">
            <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
            <span className="text-white font-medium">IIEE Conference 2025</span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 bg-gradient-to-r from-blue-200 via-white to-blue-200 bg-clip-text text-transparent animate-fade-in-up">
            24TH IIEE EASTERN AND CENTRAL VISAYAS
          </h1>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-blue-100 mb-6 animate-fade-in-up animation-delay-300">
            REGIONAL CONFERENCE
          </h2>
          <p className="text-lg text-blue-200 mb-8 max-w-3xl mx-auto animate-fade-in-up animation-delay-600">
            Join us for cutting-edge research presentations, networking with
            industry leaders, and hands-on technical workshops at this premier
            technology event.
          </p>

          <div className="flex flex-wrap justify-center gap-6 text-white/80 mb-8 animate-fade-in-up animation-delay-600">
            <div className="flex items-center gap-2 hover:text-white transition-colors duration-300">
              <MapPin className="w-5 h-5 text-blue-300" />
              <span>RC Pavilion, Cebu City</span>
            </div>
            <div className="flex items-center gap-2 hover:text-white transition-colors duration-300">
              <Calendar className="w-5 h-5 text-red-300" />
              <span>July 25 - 26, 2025</span>
            </div>
            <div className="flex items-center gap-2 hover:text-white transition-colors duration-300">
              <Users className="w-5 h-5 text-green-300" />
              <span>Tech Professionals</span>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12 animate-fade-in-up animation-delay-900">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 group">
              <Zap className="w-12 h-12 text-blue-300 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
              <h3 className="text-xl font-bold text-white mb-2">
                Research Presentations
              </h3>
              <p className="text-blue-200 text-sm">
                Discover cutting-edge research in technology and engineering
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 group">
              <Sliders className="w-12 h-12 text-green-300 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
              <h3 className="text-xl font-bold text-white mb-2">Networking</h3>
              <p className="text-blue-200 text-sm">
                Connect with industry leaders and professionals
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 group">
              <Filter className="w-12 h-12 text-red-300 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
              <h3 className="text-xl font-bold text-white mb-2">Workshops</h3>
              <p className="text-blue-200 text-sm">
                Hands-on technical workshops and demonstrations
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto">
          {fileInfo && (
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-white/20 shadow-xl animate-fade-in-up animation-delay-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="w-6 h-6 text-green-300" />
                  <div>
                    <p className="text-white font-medium">Registration Sheet</p>
                    <p className="text-blue-100 text-sm">
                      {fileInfo.recordCount} registrations
                    </p>
                  </div>
                </div>
                <a
                  href={`https://docs.google.com/spreadsheets/d/${fileInfo.spreadsheetId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-green-500/20 hover:bg-green-500/30 text-green-100 px-4 py-2 rounded-lg border border-green-500/30 transition-all duration-200"
                >
                  <FileText className="w-4 h-4" />
                  View in Google Sheets
                </a>
              </div>
            </div>
          )}

          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 md:p-12 border border-white/20 shadow-2xl hover:bg-white/15 transition-all duration-500 animate-fade-in-up animation-delay-1200">
            <div className="text-center mb-8">
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
                Join the Conference
              </h3>
              <p className="text-sm md:text-base text-blue-100">
                Register now to secure your spot at this premier technology
                event
              </p>
            </div>

            <form
              id="conference-form"
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              <div className="grid md:grid-cols-2 gap-6">
                <div className="transform hover:scale-105 transition-transform duration-200">
                  <label className="block text-white text-sm font-medium mb-2">
                    Full Name <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
                    <input
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      className="w-full pl-12 pr-4 py-3 bg-white/10 backdrop-blur-sm text-white placeholder-white/50 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    />
                  </div>
                  {errors.name && (
                    <p className="mt-1 text-red-400 text-sm">{errors.name}</p>
                  )}
                </div>
                <div className="transform hover:scale-105 transition-transform duration-200">
                  <label className="block text-white text-sm font-medium mb-2">
                    Company Name <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
                    <input
                      type="text"
                      placeholder="Your organization"
                      value={formData.companyName}
                      onChange={(e) =>
                        handleInputChange("companyName", e.target.value)
                      }
                      className="w-full pl-12 pr-4 py-3 bg-white/10 backdrop-blur-sm text-white placeholder-white/50 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    />
                  </div>
                  {errors.companyName && (
                    <p className="mt-1 text-red-400 text-sm">
                      {errors.companyName}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="transform hover:scale-105 transition-transform duration-200">
                  <label className="block text-white text-sm font-medium mb-2">
                    Contact Number <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
                    <input
                      type="tel"
                      placeholder="+63 xxx xxx xxxx"
                      value={formData.contactNumber}
                      onChange={(e) =>
                        handleInputChange("contactNumber", e.target.value)
                      }
                      className="w-full pl-12 pr-4 py-3 bg-white/10 backdrop-blur-sm text-white placeholder-white/50 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    />
                  </div>
                  {errors.contactNumber && (
                    <p className="mt-1 text-red-400 text-sm">
                      {errors.contactNumber}
                    </p>
                  )}
                </div>
                <div className="transform hover:scale-105 transition-transform duration-200">
                  <label className="block text-white text-sm font-medium mb-2">
                    Email Address <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <svg
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                    <input
                      type="email"
                      placeholder="your@email.com"
                      value={formData.emailAddress}
                      onChange={(e) =>
                        handleInputChange("emailAddress", e.target.value)
                      }
                      className="w-full pl-12 pr-4 py-3 bg-white/10 backdrop-blur-sm text-white placeholder-white/50 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    />
                  </div>
                  {errors.emailAddress && (
                    <p className="mt-1 text-red-400 text-sm">
                      {errors.emailAddress}
                    </p>
                  )}
                </div>
              </div>
              <div className="w-full">
                <button
                  onClick={handleRegisterClick}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Processing...
                    </div>
                  ) : (
                    "Register for Conference"
                  )}
                </button>
              </div>
            </form>

            <div className="mt-8 p-6 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-300">
              <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-300" />
                Why Attend?
              </h4>
              <ul className="text-blue-100 text-sm space-y-2">
                <li className="hover:text-white transition-colors duration-200 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                  Cutting-edge research presentations
                </li>
                <li className="hover:text-white transition-colors duration-200 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                  Networking with industry leaders
                </li>
                <li className="hover:text-white transition-colors duration-200 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-red-400 rounded-full"></div>
                  Hands-on technical workshops
                </li>
                <li className="hover:text-white transition-colors duration-200 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></div>
                  Innovation showcases and demos
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={handleModalClose}
        title="Registration Successful!"
      />

      <ErrorModal
        isOpen={showErrorModal}
        onClose={handleErrorModalClose}
        title="Registration Failed"
        message={errorMessage}
      />

      <style>{`
        .animation-delay-300 { animation-delay: 300ms; }
        .animation-delay-500 { animation-delay: 500ms; }
        .animation-delay-600 { animation-delay: 600ms; }
        .animation-delay-700 { animation-delay: 700ms; }
        .animation-delay-900 { animation-delay: 900ms; }
        .animation-delay-1000 { animation-delay: 1000ms; }
        .animation-delay-1200 { animation-delay: 1200ms; }
        .animation-delay-1500 { animation-delay: 1500ms; }
        .animation-delay-2000 { animation-delay: 2000ms; }

        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 0.6;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.05);
          }
        }
      `}</style>
    </div>
  );
}