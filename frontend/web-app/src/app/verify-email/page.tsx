'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, XCircle, Mail } from 'lucide-react';
import Link from 'next/link';

export default function EmailVerificationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');
      
      if (!token) {
        setStatus('error');
        setMessage('Invalid verification link');
        return;
      }

      try {
        const response = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (response.ok) {
          setStatus('success');
          setMessage(data.message || 'Email verified successfully!');
          
          // Redirect to dashboard after 3 seconds
          setTimeout(() => {
            router.push('/dashboard');
          }, 3000);
        } else {
          setStatus('error');
          setMessage(data.message || 'Verification failed');
        }
      } catch (error) {
        console.error('Verification error:', error);
        setStatus('error');
        setMessage('Network error. Please try again.');
      }
    };

    if (isClient) {
      verifyEmail();
    }
  }, [searchParams, router, isClient]);

  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Email Verification</h1>
          <p className="text-gray-600">Verifying your email address</p>
        </div>

        <Card className="backdrop-blur-sm bg-white/80 border-none shadow-xl">
          <CardHeader className="space-y-1">
            <div className="flex justify-center">
              {status === 'loading' && <Mail className="h-12 w-12 text-purple-500" />}
              {status === 'success' && <CheckCircle className="h-12 w-12 text-green-500" />}
              {status === 'error' && <XCircle className="h-12 w-12 text-red-500" />}
            </div>
            <CardTitle className="text-2xl font-bold text-center">
              {status === 'loading' && 'Verifying...'}
              {status === 'success' && 'Verified!'}
              {status === 'error' && 'Verification Failed'}
            </CardTitle>
            <CardDescription className="text-center text-gray-600">
              {status === 'loading' && 'Please wait while we verify your email address'}
              {status === 'success' && 'Your email has been successfully verified'}
              {status === 'error' && 'There was an issue verifying your email'}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {status === 'loading' && (
              <div className="flex justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
              </div>
            )}

            {status === 'success' && (
              <div className="space-y-4">
                <Alert variant="success">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>{message}</AlertDescription>
                </Alert>
                
                <div className="text-center text-sm text-gray-600">
                  Redirecting to dashboard in 3 seconds...
                </div>
                
                <div className="flex justify-center">
                  <Button onClick={() => router.push('/dashboard')}>
                    Go to Dashboard
                  </Button>
                </div>
              </div>
            )}

            {status === 'error' && (
              <div className="space-y-4">
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>{message}</AlertDescription>
                </Alert>
                
                <div className="space-y-2">
                  <Button 
                    onClick={() => router.push('/resend-verification')}
                    variant="outline"
                    className="w-full"
                  >
                    Resend Verification Email
                  </Button>
                  
                  <Button 
                    onClick={() => router.push('/login')}
                    variant="ghost"
                    className="w-full"
                  >
                    Back to Login
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {status === 'success' && (
          <div className="text-center text-sm text-gray-600">
            If you're not redirected automatically,{' '}
            <Link href="/dashboard" className="text-purple-600 hover:text-purple-500">
              click here
            </Link>
            .
          </div>
        )}
      </div>
    </div>
  );
}