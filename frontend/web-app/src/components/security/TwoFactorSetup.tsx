'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Alert, AlertDescription } from '../ui/Alert';
import { Shield, QrCode, Key, Smartphone, CheckCircle, XCircle } from 'lucide-react';

interface TwoFactorSetupProps {
  onSuccess?: () => void;
}

export default function TwoFactorSetup({ onSuccess }: TwoFactorSetupProps) {
  const [step, setStep] = useState<'setup' | 'verify' | 'backup'>('setup');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [secret, setSecret] = useState<string>('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [showBackupCodes, setShowBackupCodes] = useState(false);

  useEffect(() => {
    initialize2FA();
  }, []);

  const initialize2FA = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/2fa/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        setQrCodeUrl(data.data.qrCodeUrl);
        setSecret(data.data.secret);
        setBackupCodes(data.data.backupCodes);
      } else {
        setError(data.message || 'Failed to setup 2FA');
      }
    } catch (err) {
      setError('An error occurred while setting up 2FA');
    } finally {
      setIsLoading(false);
    }
  };

  const verify2FA = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/2fa/enable', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          token: verificationCode
        })
      });

      const data = await response.json();

      if (response.ok) {
        setStep('backup');
      } else {
        setError(data.message || 'Invalid verification code');
      }
    } catch (err) {
      setError('An error occurred while verifying 2FA');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadBackupCodes = () => {
    const element = document.createElement('a');
    const file = new Blob([backupCodes.join('\n')], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = '2fa-backup-codes.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const printBackupCodes = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>2FA Backup Codes</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              .header { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; }
              .codes { background: #f3f4f6; padding: 20px; border-radius: 8px; }
              .code-item { font-family: monospace; font-size: 18px; margin: 5px 0; }
              .warning { color: #ef4444; font-size: 14px; margin-top: 10px; }
            </style>
          </head>
          <body>
            <div class="header">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="#6366f1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <h1>2FA Backup Codes</h1>
            </div>
            <div class="codes">
              <h3>Save these codes in a safe place:</h3>
              ${backupCodes.map(code => `<div class="code-item">${code}</div>`).join('')}
              <div class="warning">
                ⚠️ Each backup code can only be used once. Store them securely and don't share them with anyone.
              </div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  if (step === 'setup') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Shield className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-semibold">Setup Two-Factor Authentication</h2>
        </div>

        {error && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="font-semibold mb-2">Step 1: Scan QR Code</h3>
              <p className="text-sm text-gray-600 mb-4">
                Use an authenticator app like Google Authenticator, Authy, or Microsoft Authenticator.
              </p>
              
              {isLoading ? (
                <div className="flex justify-center items-center h-48">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : qrCodeUrl ? (
                <div className="flex justify-center">
                  <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48 border-2 border-gray-200 rounded-lg" />
                </div>
              ) : (
                <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                  <QrCode className="h-12 w-12 text-gray-400" />
                </div>
              )}
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="font-semibold mb-2">Step 2: Manual Entry</h3>
              <p className="text-sm text-gray-600 mb-4">
                If you can't scan the QR code, manually enter this key:
              </p>
              <div className="bg-gray-50 p-3 rounded-lg font-mono text-sm">
                {secret || 'Loading...'}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="font-semibold mb-4">Step 3: Verify Setup</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="verificationCode">Enter 6-digit code from your authenticator</Label>
                  <Input
                    id="verificationCode"
                    placeholder="000000"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    maxLength={6}
                    pattern="[0-9]*"
                    inputMode="numeric"
                  />
                </div>
                <Button 
                  onClick={verify2FA} 
                  disabled={verificationCode.length !== 6 || isLoading}
                  className="w-full"
                >
                  <Smartphone className="h-4 w-4 mr-2" />
                  Verify and Enable 2FA
                </Button>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">What is 2FA?</h4>
              <p className="text-sm text-blue-800">
                Two-Factor Authentication adds an extra layer of security to your account.
                Even if someone knows your password, they won't be able to access your account
                without your phone.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'backup') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <CheckCircle className="h-6 w-6 text-green-600" />
          <h2 className="text-xl font-semibold">2FA Enabled Successfully!</h2>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="font-semibold mb-4">Backup Codes</h3>
          <p className="text-sm text-gray-600 mb-4">
            Save these backup codes in a safe place. You can use them to access your account
            if you lose your phone or authenticator app.
          </p>

          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <div className="grid grid-cols-2 gap-2 font-mono text-sm">
              {backupCodes.map((code, index) => (
                <div key={index} className="bg-white p-2 rounded">
                  {code}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <Button onClick={downloadBackupCodes} variant="outline">
              Download Codes
            </Button>
            <Button onClick={printBackupCodes} variant="outline">
              Print Codes
            </Button>
            <Button onClick={() => setShowBackupCodes(!showBackupCodes)} variant="outline">
              {showBackupCodes ? 'Hide' : 'Show'} Codes
            </Button>
            <Button onClick={onSuccess} className="ml-auto">
              Complete Setup
            </Button>
          </div>

          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
            ⚠️ <strong>Important:</strong> Each backup code can only be used once. 
            Store them securely and don't share them with anyone.
          </div>
        </div>
      </div>
    );
  }

  return null;
}