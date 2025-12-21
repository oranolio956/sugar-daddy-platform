import React from 'react';
import Head from 'next/head';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Head>
        <title>Sugar Daddy Platform - Home</title>
        <meta name="description" content="Connect with sugar daddies and sugar babies" />
      </Head>
      
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Sugar Daddy Platform</h1>
          <nav className="flex space-x-4">
            <a href="/login" className="text-gray-600 hover:text-gray-900">Login</a>
            <a href="/register" className="text-gray-600 hover:text-gray-900">Register</a>
          </nav>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <section className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Welcome to Sugar Daddy Platform</h2>
          <p className="text-lg text-gray-600 mb-8">Connect with sugar daddies and sugar babies in a safe and discreet environment.</p>
          <div className="flex justify-center space-x-4">
            <a href="/register" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">Join Now</a>
            <a href="/login" className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700">Login</a>
          </div>
        </section>
      </main>
      
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-gray-600 text-center">&copy; 2023 Sugar Daddy Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;