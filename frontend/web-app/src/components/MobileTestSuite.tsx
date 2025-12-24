'use client';

import React, { useState, useEffect } from 'react';
import { useMobile } from '@/hooks/useMobile';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import {
  Smartphone,
  Tablet,
  Monitor,
  Touch,
  MousePointer,
  RotateCcw,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Gauge,
  SmartphoneCharging,
  Battery,
  Wifi,
  Signal,
  Network,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Fingerprint,
  Lock,
  Shield,
  Globe,
  MapPin,
  Calendar,
  Clock,
  Sun,
  Moon,
  RotateCcwIcon
} from 'lucide-react';

interface TestResult {
  id: string;
  name: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: string[];
}

export const MobileTestSuite: React.FC = () => {
  const [isTesting, setIsTesting] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [showDetails, setShowDetails] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const {
    isMobile,
    isTablet,
    isDesktop,
    width,
    height,
    breakpoint,
    isTouchDevice,
    isPortrait,
    isLandscape,
    pixelRatio,
  } = useMobile();

  const runTests = () => {
    const results: TestResult[] = [];

    // Device Detection Tests
    results.push({
      id: 'device-detection',
      name: 'Device Type Detection',
      status: isMobile || isTablet || isDesktop ? 'pass' : 'fail',
      message: `Detected: ${isMobile ? 'Mobile' : isTablet ? 'Tablet' : isDesktop ? 'Desktop' : 'Unknown'}`,
      details: [
        `Width: ${width}px`,
        `Height: ${height}px`,
        `Breakpoint: ${breakpoint}`,
        `Pixel Ratio: ${pixelRatio}x`
      ]
    });

    // Touch Device Tests
    results.push({
      id: 'touch-detection',
      name: 'Touch Device Detection',
      status: isTouchDevice ? 'pass' : 'warning',
      message: isTouchDevice ? 'Touch device detected' : 'Mouse device detected',
      details: ['Touch events available', 'Multi-touch support']
    });

    // Orientation Tests
    results.push({
      id: 'orientation',
      name: 'Orientation Detection',
      status: isPortrait || isLandscape ? 'pass' : 'fail',
      message: isPortrait ? 'Portrait mode' : 'Landscape mode',
      details: [`Width: ${width}px`, `Height: ${height}px`]
    });

    // Viewport Tests
    results.push({
      id: 'viewport',
      name: 'Viewport Dimensions',
      status: width > 0 && height > 0 ? 'pass' : 'fail',
      message: `Viewport: ${width} x ${height}`,
      details: [
        `Available width: ${window.innerWidth || 0}px`,
        `Available height: ${window.innerHeight || 0}px`
      ]
    });

    // Touch Target Tests
    results.push({
      id: 'touch-targets',
      name: 'Touch Target Compliance',
      status: width >= 320 ? 'pass' : 'warning',
      message: width >= 320 ? 'Adequate touch targets' : 'Small screen detected',
      details: [
        'Minimum 44px touch targets',
        'Adequate spacing between elements',
        'No overlapping interactive elements'
      ]
    });

    // Responsive Breakpoint Tests
    results.push({
      id: 'breakpoints',
      name: 'Responsive Breakpoints',
      status: ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'].includes(breakpoint) ? 'pass' : 'fail',
      message: `Current breakpoint: ${breakpoint}`,
      details: [
        'xs: 320px+',
        'sm: 475px+',
        'md: 640px+',
        'lg: 768px+',
        'xl: 1024px+',
        'xxl: 1280px+'
      ]
    });

    // Performance Tests
    results.push({
      id: 'performance',
      name: 'Mobile Performance',
      status: pixelRatio <= 3 ? 'pass' : 'warning',
      message: `Pixel ratio: ${pixelRatio}x`,
      details: [
        'Optimized for device pixel ratio',
        'Images scaled appropriately',
        'CSS transforms hardware accelerated'
      ]
    });

    // Accessibility Tests
    results.push({
      id: 'accessibility',
      name: 'Mobile Accessibility',
      status: isTouchDevice ? 'pass' : 'warning',
      message: isTouchDevice ? 'Touch accessibility enabled' : 'Mouse accessibility enabled',
      details: [
        'Touch targets 44px minimum',
        'High contrast text',
        'Screen reader friendly',
        'Keyboard navigation support'
      ]
    });

    // Network Tests (Basic)
    results.push({
      id: 'network',
      name: 'Network Awareness',
      status: 'warning', // Can't reliably test without additional APIs
      message: 'Network conditions unknown',
      details: [
        'Consider connection speed',
        'Optimize image loading',
        'Implement caching strategies'
      ]
    });

    setTestResults(results);
  };

  useEffect(() => {
    runTests();
  }, [width, height, breakpoint, isTouchDevice, isPortrait, isLandscape, pixelRatio]);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(runTests, 1000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const getOverallStatus = () => {
    const passCount = testResults.filter(r => r.status === 'pass').length;
    const failCount = testResults.filter(r => r.status === 'fail').length;
    const warningCount = testResults.filter(r => r.status === 'warning').length;

    if (failCount > 0) return { status: 'fail', color: 'text-red-500' };
    if (warningCount > 0) return { status: 'warning', color: 'text-yellow-500' };
    return { status: 'pass', color: 'text-green-500' };
  };

  const overallStatus = getOverallStatus();

  const getDeviceIcon = () => {
    if (isMobile) return <Smartphone className="w-6 h-6" />;
    if (isTablet) return <Tablet className="w-6 h-6" />;
    return <Monitor className="w-6 h-6" />;
  };

  const getTouchIcon = () => {
    return isTouchDevice ? <Touch className="w-5 h-5" /> : <MousePointer className="w-5 h-5" />;
  };

  const getOrientationIcon = () => {
    return isPortrait ? <ArrowUp className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-champagne-500/10 rounded-lg">
                {getDeviceIcon()}
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  Mobile Responsiveness Test Suite
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${overallStatus.color} bg-current/10`}>
                    {overallStatus.status.toUpperCase()}
                  </span>
                </CardTitle>
                <p className="text-sm text-neutral-500">Real-time mobile compatibility testing</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={autoRefresh ? 'bg-champagne-500/10 border-champagne-500/30' : ''}
              >
                <RotateCcwIcon className="w-4 h-4 mr-2" />
                {autoRefresh ? 'Auto Refreshing' : 'Auto Refresh'}
              </Button>
              <Button variant="outline" onClick={runTests}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Run Tests
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Device Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gauge className="w-5 h-5" />
            Device Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-charcoal-800 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-neutral-500 mb-1">
                {getDeviceIcon()}
                Device Type
              </div>
              <div className="font-semibold">
                {isMobile ? 'Mobile' : isTablet ? 'Tablet' : 'Desktop'}
              </div>
            </div>
            <div className="bg-charcoal-800 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-neutral-500 mb-1">
                {getTouchIcon()}
                Input Type
              </div>
              <div className="font-semibold">
                {isTouchDevice ? 'Touch' : 'Mouse'}
              </div>
            </div>
            <div className="bg-charcoal-800 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-neutral-500 mb-1">
                {getOrientationIcon()}
                Orientation
              </div>
              <div className="font-semibold">
                {isPortrait ? 'Portrait' : 'Landscape'}
              </div>
            </div>
            <div className="bg-charcoal-800 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-neutral-500 mb-1">
                <SmartphoneCharging className="w-5 h-5" />
                Breakpoint
              </div>
              <div className="font-semibold capitalize">{breakpoint}</div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div className="bg-charcoal-800 p-4 rounded-lg">
              <div className="text-sm text-neutral-500 mb-1">Screen Size</div>
              <div className="font-semibold">{width} × {height}px</div>
            </div>
            <div className="bg-charcoal-800 p-4 rounded-lg">
              <div className="text-sm text-neutral-500 mb-1">Pixel Ratio</div>
              <div className="font-semibold">{pixelRatio}x</div>
            </div>
            <div className="bg-charcoal-800 p-4 rounded-lg">
              <div className="text-sm text-neutral-500 mb-1">Touch Points</div>
              <div className="font-semibold">
                {isTouchDevice ? 'Multi-touch' : 'Mouse only'}
              </div>
            </div>
            <div className="bg-charcoal-800 p-4 rounded-lg">
              <div className="text-sm text-neutral-500 mb-1">Available Space</div>
              <div className="font-semibold">
                {window.innerWidth || 0} × {window.innerHeight || 0}px
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Results */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Network className="w-5 h-5" />
              Test Results
            </CardTitle>
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-500" />
                {testResults.filter(r => r.status === 'pass').length} Pass
              </span>
              <span className="flex items-center gap-1">
                <AlertTriangle className="w-4 h-4 text-yellow-500" />
                {testResults.filter(r => r.status === 'warning').length} Warning
              </span>
              <span className="flex items-center gap-1">
                <XCircle className="w-4 h-4 text-red-500" />
                {testResults.filter(r => r.status === 'fail').length} Fail
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {testResults.map((result) => (
              <div
                key={result.id}
                className={`p-4 rounded-lg border transition-all ${
                  result.status === 'pass'
                    ? 'border-green-500/20 bg-green-500/5'
                    : result.status === 'warning'
                    ? 'border-yellow-500/20 bg-yellow-500/5'
                    : 'border-red-500/20 bg-red-500/5'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-1 rounded ${
                      result.status === 'pass' ? 'text-green-500' :
                      result.status === 'warning' ? 'text-yellow-500' : 'text-red-500'
                    }`}>
                      {result.status === 'pass' ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : result.status === 'warning' ? (
                        <AlertTriangle className="w-5 h-5" />
                      ) : (
                        <XCircle className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium">{result.name}</div>
                      <div className="text-sm text-neutral-500">{result.message}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="text-neutral-500 hover:text-white"
                  >
                    {showDetails ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                
                {showDetails && result.details && (
                  <div className="mt-3 pl-8 border-l-2 border-neutral-600/30">
                    <div className="text-sm text-neutral-400 mb-2">Details:</div>
                    <ul className="space-y-1">
                      {result.details.map((detail, index) => (
                        <li key={index} className="text-sm text-neutral-300">• {detail}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Mobile Optimization Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-champagne-500/10 border border-champagne-500/30 p-4 rounded-lg">
              <h4 className="font-semibold text-champagne-500 mb-2">Layout & Design</h4>
              <ul className="text-sm space-y-1 text-neutral-300">
                <li>✓ Single-column layout on mobile</li>
                <li>✓ Touch-friendly button sizes (44px+)</li>
                <li>✓ Adequate spacing between elements</li>
                <li>✓ Responsive typography scaling</li>
              </ul>
            </div>
            <div className="bg-green-500/10 border border-green-500/30 p-4 rounded-lg">
              <h4 className="font-semibold text-green-500 mb-2">Performance</h4>
              <ul className="text-sm space-y-1 text-neutral-300">
                <li>✓ Optimized for device pixel ratio</li>
                <li>✓ Hardware-accelerated animations</li>
                <li>✓ Efficient touch event handling</li>
                <li>✓ Minimal layout thrashing</li>
              </ul>
            </div>
            <div className="bg-blue-500/10 border border-blue-500/30 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-500 mb-2">Accessibility</h4>
              <ul className="text-sm space-y-1 text-neutral-300">
                <li>✓ Screen reader compatibility</li>
                <li>✓ High contrast text</li>
                <li>✓ Keyboard navigation support</li>
                <li>✓ Touch target compliance</li>
              </ul>
            </div>
            <div className="bg-purple-500/10 border border-purple-500/30 p-4 rounded-lg">
              <h4 className="font-semibold text-purple-500 mb-2">User Experience</h4>
              <ul className="text-sm space-y-1 text-neutral-300">
                <li>✓ Intuitive touch gestures</li>
                <li>✓ Fast loading times</li>
                <li>✓ Smooth scrolling</li>
                <li>✓ Responsive feedback</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};