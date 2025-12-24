import { Metadata } from 'next';
import { generateMetaTags } from '../../src/lib/seo';
import EnhancedDashboard from '../../src/components/dashboard/EnhancedDashboard';

export async function generateMetadata(): Promise<Metadata> {
  return generateMetaTags(
    'Dashboard - BrandyBabe.com Premium Dating',
    'Your personalized dashboard for managing connections, messages, and dating activity. Track your progress and find meaningful arrangements.',
    ['dashboard', 'dating dashboard', 'sugar daddy dashboard', 'sugar baby dashboard', 'matches', 'messages'],
    undefined,
    '/dashboard',
    'website'
  );
}

export default function DashboardPage() {
  return <EnhancedDashboard />;
}