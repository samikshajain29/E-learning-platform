import React, { useEffect, useState } from "react";
import axios from "axios";
import { 
  User, Mail, Phone, BookOpen, GraduationCap, 
  Link as LinkIcon, Briefcase, FileText, Check, X,
  BadgeCheck 
} from "lucide-react";

const API_URL = "http://localhost:8000/api";

const EducatorRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);
  const [actionError, setActionError] = useState(null);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("adminToken");
    return {
      headers: { Authorization: token ? `Bearer ${token}` : "" }
    };
  };

  useEffect(() => {
    fetchRequests();
    
    // Auto Data Fetching (Polling) to instantly reflect new applications
    const interval = setInterval(() => {
      fetchRequests(true);
    }, 5000); // 5 seconds interval
    
    return () => clearInterval(interval);
  }, []);

  const fetchRequests = async (isBackground = false) => {
    try {
      if (!isBackground) setLoading(true);
      const res = await axios.get(`${API_URL}/admin/educator-requests?status=pending`, getAuthHeaders());
      setRequests(res.data);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        window.location.href = "/login";
        return;
      }
      if (!isBackground) setError("Failed to fetch pending educator requests.");
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  const handleAction = async (id, status) => {
    try {
      setActionLoading(true);
      setActionError(null);
      setActionMessage(null);
      
      await axios.patch(`${API_URL}/admin/educator-request/${id}`, { status }, getAuthHeaders());
      
      setActionMessage(`Request successfully ${status}!`);
      // Remove from list immediately
      setRequests(prev => prev.filter(req => req._id !== id));
      setTimeout(() => {
        setSelectedRequest(null);
        setActionMessage(null);
      }, 1500);
      
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        window.location.href = "/login";
        return;
      }
      setActionError(err.response?.data?.message || `Failed to mark as ${status}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDownload = async (url, type, name) => {
    if (!url) return;
    
    // Format URL properly
    let finalUrl = url;
    if (!finalUrl.startsWith("http")) {
      finalUrl = `https://${finalUrl}`;
    }

    // Fix Cloudinary specific formatting
    if (finalUrl.includes('cloudinary.com') && !finalUrl.includes('fl_attachment')) {
      // Only inject fl_attachment without altering the native resource_type (image/raw/etc.)
      finalUrl = finalUrl.replace('/upload/', '/upload/fl_attachment/');
    }

    const cleanName = name ? name.replace(/\s+/g, '_').toLowerCase() : 'educator';
    const extensionParts = finalUrl.split('.');
    const ext = extensionParts.length > 1 ? extensionParts.pop().split('?')[0] : 'file';
    const filename = `${cleanName}_${type}.${ext}`;

    try {
      // Important Fallback Strategy: Fetch file directly as a Blob to enforce download without relying on browser navigation behavior
      const res = await axios.get(finalUrl, { responseType: 'blob' });
      const blobUrl = window.URL.createObjectURL(new Blob([res.data]));
      
      const link = document.createElement("a");
      link.href = blobUrl;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 30000); // Cleanup memory
    } catch (err) {
      console.warn("Blob download failed, falling back to direct anchor...", err);
      // Ultimate fallback: Basic Anchor tag
      const link = document.createElement("a");
      link.href = finalUrl;
      link.setAttribute("download", filename);
      link.setAttribute("target", "_blank");
      link.setAttribute("rel", "noopener noreferrer");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Educator Applications</h1>
          <p className="text-gray-500 mt-1">Review and manage pending educator requests</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 w-full mb-6 text-red-700">
          {error}
        </div>
      )}

      {/* Main Layout */}
      <div className="flex gap-6 relative">
        {/* List Section */}
        <div className={`transition-all duration-300 ${selectedRequest ? 'w-1/3' : 'w-full'}`}>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {requests.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <BadgeCheck className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-lg">No pending requests</p>
                <p className="text-sm">You have reviewed all applications.</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100 max-h-[80vh] overflow-y-auto">
                {requests.map(req => (
                  <li 
                    key={req._id}
                    onClick={() => {
                        setSelectedRequest(req);
                        setActionMessage(null);
                        setActionError(null);
                    }}
                    className={`p-4 cursor-pointer hover:bg-purple-50 transition-colors ${selectedRequest?._id === req._id ? 'bg-purple-50 border-l-4 border-purple-600' : 'border-l-4 border-transparent'}`}
                  >
                    <div className="flex items-center gap-4">
                      <img 
                        src={req.profileImageUrl} 
                        alt={req.name}
                        className="w-12 h-12 rounded-full object-cover border border-gray-200"
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/150'; }}
                      />
                      <div className="overflow-hidden">
                        <h3 className="font-semibold text-gray-900 truncate">{req.name}</h3>
                        <p className="text-sm text-gray-500 truncate">{req.email}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Detail Panel */}
        {selectedRequest && (
          <div className="w-2/3 bg-white rounded-xl shadow-sm border border-gray-100 p-6 relative overflow-y-auto max-h-[85vh]">
            <button 
              onClick={() => setSelectedRequest(null)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition"
            >
              <X size={20} />
            </button>
            
            {(actionMessage || actionError) && (
              <div className={`p-4 rounded-lg mb-6 ${actionError ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
                {actionError || actionMessage}
              </div>
            )}

            <div className="flex items-center gap-6 mb-8 mt-2">
              <img 
                src={selectedRequest.profileImageUrl} 
                alt={selectedRequest.name}
                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
              />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedRequest.name}</h2>
                <div className="flex items-center gap-2 mt-2 text-gray-600">
                  <span className="flex items-center gap-1 text-sm bg-purple-100 text-purple-700 px-3 py-1 rounded-full"><Briefcase size={14} /> {selectedRequest.currentRole || "N/A"}</span>
                  <span className="flex items-center gap-1 text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full">{selectedRequest.experience} Yrs Experience</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 uppercase text-xs tracking-wider border-b pb-2">Contact Details</h3>
                <div className="flex items-center gap-3 text-gray-600">
                  <Mail size={18} className="text-gray-400" /> {selectedRequest.email}
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <Phone size={18} className="text-gray-400" /> {selectedRequest.contact}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 uppercase text-xs tracking-wider border-b pb-2">Expertise</h3>
                <div className="flex gap-3 text-gray-600">
                  <GraduationCap size={18} className="text-gray-400 flex-shrink-0 mt-0.5" /> 
                  <span className="break-all">{selectedRequest.qualification}</span>
                </div>
                <div className="flex gap-3 text-gray-600">
                  <BookOpen size={18} className="text-gray-400 flex-shrink-0 mt-0.5" /> 
                  <span className="break-all">{selectedRequest.subjects}</span>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="font-semibold text-gray-900 uppercase text-xs tracking-wider border-b pb-2 mb-4">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {selectedRequest.skills?.split(',').map((skill, index) => (
                  <span key={index} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-md text-sm border border-gray-200">
                    {skill.trim()}
                  </span>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <h3 className="font-semibold text-gray-900 uppercase text-xs tracking-wider border-b pb-2 mb-4">Bio / Motivation</h3>
              <p className="text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-lg border border-gray-100 italic">"{selectedRequest.bio}"</p>
            </div>

            <div className="mb-8 grid grid-cols-2 gap-4">
              <button 
                onClick={() => handleDownload(selectedRequest.resumeUrl, 'resume', selectedRequest.name)}
                className="flex items-center justify-center gap-2 bg-blue-50 text-blue-700 py-3 px-4 rounded-lg font-medium hover:bg-blue-100 transition border border-blue-200"
              >
                <FileText size={18} /> Download Resume
              </button>
              <button 
                onClick={() => handleDownload(selectedRequest.idProofUrl, 'id_proof', selectedRequest.name)}
                className="flex items-center justify-center gap-2 bg-gray-50 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-100 transition border border-gray-200"
              >
                <LinkIcon size={18} /> Download ID Proof
              </button>
            </div>

            <div className="border-t pt-6 flex justify-end gap-3 sticky bottom-0 bg-white py-4 shadow-[0_-10px_10px_-10px_rgba(0,0,0,0.05)]">
              <button 
                disabled={actionLoading}
                onClick={() => handleAction(selectedRequest._id, "rejected")}
                className="flex items-center gap-2 px-6 py-2.5 border border-red-200 text-red-600 font-medium rounded-lg hover:bg-red-50 transition disabled:opacity-50"
              >
                <X size={18} /> {actionLoading ? 'Processing...' : 'Reject'}
              </button>
              <button 
                disabled={actionLoading}
                onClick={() => handleAction(selectedRequest._id, "approved")}
                className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition shadow-sm disabled:opacity-50"
              >
                <Check size={18} /> {actionLoading ? 'Processing...' : 'Approve Application'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EducatorRequests;
