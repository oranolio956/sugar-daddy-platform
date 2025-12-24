'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Upload, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Shield, 
  FileText, 
  Trash2, 
  RefreshCw,
  Plus,
  Eye,
  EyeOff
} from 'lucide-react';
import { motion } from 'framer-motion';

interface VerificationDocument {
  id: string;
  type: 'photo_id' | 'utility_bill' | 'bank_statement' | 'selfie';
  fileName: string;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  rejectionReason?: string;
  verifiedAt?: string;
  createdAt: string;
}

interface VerificationStatus {
  verified: boolean;
  verificationLevel: string;
  documents: VerificationDocument[];
}

export default function VerificationPage() {
  const [status, setStatus] = useState<VerificationStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState('');
  const [showRejectedReason, setShowRejectedReason] = useState<string | null>(null);

  useEffect(() => {
    fetchVerificationStatus();
  }, []);

  const fetchVerificationStatus = async () => {
    try {
      const response = await fetch('/api/verification/status', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStatus(data.data);
      }
    } catch (error) {
      console.error('Error fetching verification status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleSubmitDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile || !documentType) {
      alert('Please select a file and document type');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('document', selectedFile);
      formData.append('type', documentType);

      const response = await fetch('/api/verification/documents', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        alert('Document submitted successfully!');
        setSelectedFile(null);
        setDocumentType('');
        fetchVerificationStatus();
      } else {
        alert(data.message || 'Failed to submit document');
      }
    } catch (error) {
      console.error('Error submitting document:', error);
      alert('Network error. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      const response = await fetch(`/api/verification/documents/${documentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        alert('Document deleted successfully!');
        fetchVerificationStatus();
      } else {
        alert(data.message || 'Failed to delete document');
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('Network error. Please try again.');
    }
  };

  const handleResubmitDocument = async (documentId: string, reason: string) => {
    try {
      const response = await fetch(`/api/verification/resubmit/${documentId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      });

      const data = await response.json();

      if (response.ok) {
        alert('Document resubmitted successfully!');
        fetchVerificationStatus();
      } else {
        alert(data.message || 'Failed to resubmit document');
      }
    } catch (error) {
      console.error('Error resubmitting document:', error);
      alert('Network error. Please try again.');
    }
  };

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'photo_id': return <FileText className="h-4 w-4" />;
      case 'utility_bill': return <FileText className="h-4 w-4" />;
      case 'bank_statement': return <FileText className="h-4 w-4" />;
      case 'selfie': return <FileText className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getDocumentLabel = (type: string) => {
    switch (type) {
      case 'photo_id': return 'Photo ID';
      case 'utility_bill': return 'Utility Bill';
      case 'bank_statement': return 'Bank Statement';
      case 'selfie': return 'Selfie';
      default: return type;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-600';
      case 'rejected': return 'text-red-600';
      case 'pending': return 'text-yellow-600';
      case 'expired': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'expired': return <XCircle className="h-4 w-4 text-gray-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Profile Verification</h1>
          <p className="text-gray-600">Verify your identity to unlock premium features and build trust with other users</p>
        </div>

        {/* Verification Status */}
        <Card className="backdrop-blur-sm bg-white/80 border-none shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Shield className="h-6 w-6 text-purple-500" />
              Verification Status
            </CardTitle>
            <CardDescription>
              Your current verification level and document status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Overall Status</p>
                    <p className={`font-semibold ${status?.verified ? 'text-green-600' : 'text-gray-600'}`}>
                      {status?.verified ? 'Verified' : 'Not Verified'}
                    </p>
                  </div>
                  {status?.verified ? (
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  ) : (
                    <XCircle className="h-8 w-8 text-gray-400" />
                  )}
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Verification Level</p>
                    <p className="font-semibold text-blue-600 capitalize">
                      {status?.verificationLevel || 'None'}
                    </p>
                  </div>
                  <Shield className="h-8 w-8 text-blue-500" />
                </div>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Documents Submitted</p>
                    <p className="font-semibold text-green-600">
                      {status?.documents.length || 0} / 4
                    </p>
                  </div>
                  <FileText className="h-8 w-8 text-green-500" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Document Submission */}
        <Card className="backdrop-blur-sm bg-white/80 border-none shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Upload className="h-6 w-6 text-purple-500" />
              Submit Documents
            </CardTitle>
            <CardDescription>
              Upload clear photos of your documents to verify your identity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitDocument} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Document Type Selection */}
                <div className="space-y-2">
                  <Label htmlFor="documentType">Document Type</Label>
                  <select
                    id="documentType"
                    value={documentType}
                    onChange={(e) => setDocumentType(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select document type</option>
                    <option value="photo_id">Photo ID (Passport, Driver's License)</option>
                    <option value="utility_bill">Utility Bill (Recent)</option>
                    <option value="bank_statement">Bank Statement (Recent)</option>
                    <option value="selfie">Selfie with ID</option>
                  </select>
                  <p className="text-xs text-gray-500">
                    We accept clear photos of government-issued IDs, recent utility bills, or bank statements
                  </p>
                </div>

                {/* File Upload */}
                <div className="space-y-2">
                  <Label htmlFor="document">Upload Document</Label>
                  <div className="flex items-center space-x-4">
                    <Input
                      id="document"
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="flex-1"
                    />
                    {selectedFile && (
                      <span className="text-sm text-gray-600">{selectedFile.name}</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    Maximum file size: 5MB. Supported formats: JPG, PNG, JPEG
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  disabled={uploading || !selectedFile || !documentType}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Submit Document
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Submitted Documents */}
        <Card className="backdrop-blur-sm bg-white/80 border-none shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <FileText className="h-6 w-6 text-purple-500" />
              Submitted Documents
            </CardTitle>
            <CardDescription>
              View and manage your submitted verification documents
            </CardDescription>
          </CardHeader>
          <CardContent>
            {status?.documents.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No documents submitted yet. Start by uploading your first document above.
              </div>
            ) : (
              <div className="space-y-4">
                {status?.documents.map((document) => (
                  <motion.div
                    key={document.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      {getDocumentIcon(document.type)}
                      <div>
                        <p className="font-medium">{getDocumentLabel(document.type)}</p>
                        <p className="text-sm text-gray-500">{document.fileName}</p>
                        <p className="text-xs text-gray-400">
                          Submitted: {new Date(document.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(document.status)}
                        <span className={`text-sm font-medium ${getStatusColor(document.status)}`}>
                          {document.status.charAt(0).toUpperCase() + document.status.slice(1)}
                        </span>
                      </div>
                      
                      {document.status === 'rejected' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowRejectedReason(
                            showRejectedReason === document.id ? null : document.id
                          )}
                        >
                          {showRejectedReason === document.id ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      )}
                      
                      {document.status === 'pending' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteDocument(document.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                      
                      {document.status === 'rejected' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleResubmitDocument(document.id, 'Resubmitting as requested')}
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
            
            {showRejectedReason && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 font-medium">Rejection Reason:</p>
                <p className="text-red-700 mt-1">
                  {status?.documents.find(d => d.id === showRejectedReason)?.rejectionReason || 'No reason provided'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Verification Benefits */}
        <Card className="backdrop-blur-sm bg-white/80 border-none shadow-xl">
          <CardHeader>
            <CardTitle>Why Verify Your Profile?</CardTitle>
            <CardDescription>
              Verified profiles enjoy enhanced features and build trust with other users
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-500 mb-2" />
                <h3 className="font-semibold">Increased Trust</h3>
                <p className="text-sm text-gray-600">Verified profiles are more likely to receive responses</p>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <Shield className="h-6 w-6 text-blue-500 mb-2" />
                <h3 className="font-semibold">Premium Features</h3>
                <p className="text-sm text-gray-600">Access to exclusive features and filters</p>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg">
                <Plus className="h-6 w-6 text-purple-500 mb-2" />
                <h3 className="font-semibold">Enhanced Visibility</h3>
                <p className="text-sm text-gray-600">Verified profiles appear higher in search results</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}