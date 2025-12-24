'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, CheckCircle, XCircle } from 'lucide-react';

export default function ResendVerificationPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setStatus('error');
      setMessage('Please enter your email address');
      return;
    }

    setIsLoading(true);
    setStatus('idle');

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage(data.message || 'Verification email sent successfully!');
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        setStatus('error');
        setMessage(data.message || 'Failed to resend verification email');
      }
    } catch (error) {
      console.error('Resend verification error:', error);
      setStatus('error');
      setMessage('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Resend Verification</h1>
          <p className="text-gray-600">Enter your email to receive a new verification link</p>
        </div>

        <Card className="backdrop-blur-sm bg-white/80 border-none shadow-xl">
          <CardHeader className="space-y-1">
            <div className="flex justify-center">
              <Mail className="h-12 w-12 text-purple-500" />
            </div>
            <CardTitle className="text-2xl font-bold text-center">Resend Email</CardTitle>
            <CardDescription className="text-center text-gray-600">
              We'll send a new verification link to your email address
            </CardDescription>
          </CardHeader>

          <CardContent>
            {status === 'success' && (
              <Alert variant="success" className="mb-6">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}

            {status === 'error' && (
              <Alert variant="destructive" className="mb-6">
                <XCircle className="h-4 w-4" />
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading || status === 'success'}
                  className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading || status === 'success'}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Verification Email'
                )}
              </Button>
            </form>

            {status === 'success' && (
              <div className="mt-4 text-center text-sm text-gray-600">
                Redirecting to login in 3 seconds...
              </div>
            )}

            <div className="mt-6 text-center">
              <Button 
                variant="ghost" 
                onClick={() => router.push('/login')}
                className="text-purple-600 hover:text-purple-500"
              >
                Back to Login
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-gray-600">
          <p>Didn't receive the email? Check your spam folder.</p>
          <p className="mt-2">Still having issues? Contact our support team.</p>
        </div>
      </div>
    </div>
  );
}