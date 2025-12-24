'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Alert, AlertDescription } from '../ui/Alert';
import { 
  Upload, 
  Shield, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  FileText,
  CreditCard,
  Building,
  User,
  Eye,
  EyeOff
} from 'lucide-react';

interface VerificationManagerProps {
  user: any;
  onUpdate?: () => void;
}

export default function VerificationManager({ user, onUpdate }: VerificationManagerProps) {
  const [verificationStatus, setVerificationStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [showDocument, setShowDocument] = useState<string | null>(null);

  useEffect(() => {
    fetchVerificationStatus();
  }, []);

  const fetchVerificationStatus = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/verification/status', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setVerificationStatus(data.data);
      } else {
        setError('Failed to fetch verification status');
      }
    } catch (err) {
      setError('An error occurred while fetching verification status');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, documentType: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);
    setSuccess(null);
    setUploadProgress(0);

    try {
      // Check file type and size
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!allowedTypes.includes(file.type)) {
        throw new Error('Invalid file type. Please upload JPEG, PNG, or PDF files.');
      }

      if (file.size > maxSize) {
        throw new Error('File too large. Please upload files smaller than 5MB.');
      }

      // Create FormData
      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentType', documentType);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      const response = await fetch('/api/verification/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      clearInterval(progressInterval);

      if (response.ok) {
        setUploadProgress(100);
        setSuccess('Document uploaded successfully');
        fetchVerificationStatus();
        onUpdate?.();
      } else {
        const data = await response.json();
        throw new Error(data.message || 'Failed to upload document');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
      // Reset file input
      e.target.value = '';
    }
  };

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'photo_id': return <CreditCard className="h-5 w-5" />;
      case 'utility_bill': return <Building className="h-5 w-5" />;
      case 'bank_statement': return <FileText className="h-5 w-5" />;
      case 'selfie': return <User className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  const getDocumentName = (type: string) => {
    switch (type) {
      case 'photo_id': return 'Photo ID (Driver\'s License, Passport)';
      case 'utility_bill': return 'Utility Bill (Electricity, Water, Gas)';
      case 'bank_statement': return 'Bank Statement';
      case 'selfie': return 'Selfie with ID';
      default: return type;
    }
  };

  const getDocumentRequirements = (type: string) => {
    switch (type) {
      case 'photo_id':
        return [
          'Must be government-issued',
          'Must be clear and legible',
          'Must not be expired',
          'All corners must be visible'
        ];
      case 'utility_bill':
        return [
          'Must be recent (within 3 months)',
          'Must show your name and address',
          'Must be clear and legible'
        ];
      case 'bank_statement':
        return [
          'Must be recent (within 3 months)',
          'Must show your name and account number (partially)',
          'Must be clear and legible'
        ];
      case 'selfie':
        return [
          'Must show your face clearly',
          'Must hold your ID next to your face',
          'Must be a recent photo',
          'Good lighting required'
        ];
      default:
        return [];
    }
  };

  const canSubmitDocument = (documentType: string) => {
    if (!verificationStatus) return false;

    const existingApproved = verificationStatus.documents?.find(
      (doc: any) => doc.type === documentType && doc.status === 'approved'
    );

    const existingPending = verificationStatus.documents?.find(
      (doc: any) => doc.type === documentType && doc.status === 'pending'
    );

    return !existingApproved && !existingPending;
  };

  if (isLoading && !verificationStatus) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold">Profile Verification</h1>
        </div>
        
        <div className="text-right">
          <div className="text-sm text-gray-600">Verification Level</div>
          <div className="text-lg font-semibold capitalize">
            {verificationStatus?.verificationLevel || 'Not Verified'}
          </div>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="font-semibold mb-4">Verification Status</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Shield className="h-4 w-4 text-gray-600" />
                  <span className="text-sm">Overall Status</span>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  verificationStatus?.verified 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {verificationStatus?.verified ? 'Verified' : 'Not Verified'}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-4 w-4 text-gray-600" />
                  <span className="text-sm">Verification Level</span>
                </div>
                <span className="text-sm font-medium capitalize">
                  {verificationStatus?.verificationLevel || 'None'}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-gray-600" />
                  <span className="text-sm">Documents Submitted</span>
                </div>
                <span className="text-sm font-medium">
                  {verificationStatus?.documents?.length || 0}
                </span>
              </div>
            </div>

            {verificationStatus?.verified && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 text-green-800">
                  <CheckCircle className="h-4 w-4" />
                  <span className="font-medium">Verified Account</span>
                </div>
                <p className="text-sm text-green-700 mt-1">
                  Your account has been verified. You can now access all premium features.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-semibold">Submit Documents</h3>
              <p className="text-sm text-gray-600 mt-1">
                Upload clear photos or scans of your documents to verify your identity.
              </p>
            </div>

            <div className="p-6 space-y-6">
              {['photo_id', 'selfie', 'utility_bill', 'bank_statement'].map((docType) => {
                const existingDocument = verificationStatus?.documents?.find((doc: any) => doc.type === docType);
                const canSubmit = canSubmitDocument(docType);

                return (
                  <div key={docType} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {getDocumentIcon(docType)}
                        <div>
                          <h4 className="font-medium">{getDocumentName(docType)}</h4>
                          <p className="text-sm text-gray-600">Document Type: {docType}</p>
                        </div>
                      </div>
                      
                      {existingDocument ? (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          existingDocument.status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : existingDocument.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {existingDocument.status === 'approved' ? 'Approved' : 
                           existingDocument.status === 'rejected' ? 'Rejected' : 'Pending'}
                        </span>
                      ) : null}
                    </div>

                    {existingDocument?.status === 'rejected' && existingDocument.rejectionReason && (
                      <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-800">
                          <strong>Rejection Reason:</strong> {existingDocument.rejectionReason}
                        </p>
                      </div>
                    )}

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label>Requirements</Label>
                        <ul className="text-sm text-gray-600 space-y-1 mt-2">
                          {getDocumentRequirements(docType).map((req, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-gray-400">•</span>
                              {req}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <Label>Upload Document</Label>
                        <div className="mt-2">
                          {existingDocument?.status === 'approved' ? (
                            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span className="text-sm text-green-800">Document approved</span>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Input
                                  type="file"
                                  accept="image/*,.pdf"
                                  onChange={(e) => handleFileUpload(e, docType)}
                                  disabled={!canSubmit || isLoading}
                                  className="flex-1"
                                />
                                {existingDocument && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowDocument(existingDocument.fileUrl)}
                                  >
                                    <Eye className="h-4 w-4 mr-2" />
                                    View
                                  </Button>
                                )}
                              </div>
                              
                              {uploadProgress > 0 && (
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${uploadProgress}%` }}
                                  ></div>
                                </div>
                              )}

                              {!canSubmit && existingDocument && (
                                <p className="text-xs text-gray-500">
                                  {existingDocument.status === 'pending' 
                                    ? 'Document already pending review' 
                                    : 'Document already approved'}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-2">Why Verify Your Account?</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>Trust & Safety:</strong> Verified members are more trustworthy</li>
          <li>• <strong>Priority Matching:</strong> Verified profiles get better match suggestions</li>
          <li>• <strong>Enhanced Features:</strong> Access to premium features and filters</li>
          <li>• <strong>Community Standards:</strong> Helps maintain a safe and genuine community</li>
        </ul>
      </div>

      {showDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-semibold">Document Preview</h3>
              <Button variant="ghost" onClick={() => setShowDocument(null)}>
                <XCircle className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4">
              <img src={showDocument} alt="Document" className="w-full h-auto rounded" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}