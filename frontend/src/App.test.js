// P2_LIBRARY/src/App.test.js
import React from 'react';

export default function AppTest() {
  return (
    <div className="min-h-screen bg-white dark:bg-black p-8">
      <h1 className="text-3xl font-bold text-black dark:text-white mb-4">
        Dark Mode Test
      </h1>
      
      <button
        onClick={() => {
          console.log('Before:', document.documentElement.className);
          document.documentElement.classList.toggle('dark');
          console.log('After:', document.documentElement.className);
          localStorage.setItem(
            'theme', 
            document.documentElement.classList.contains('dark') ? 'dark' : 'light'
          );
        }}
        className="px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold"
      >
        Toggle Dark Mode
      </button>
      
      <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <p className="text-gray-800 dark:text-gray-200">
          If dark mode is working, this background should turn dark when you click the button.
        </p>
      </div>
      
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-2">Debug Info:</h2>
        <pre className="bg-gray-800 text-green-400 p-4 rounded text-sm">
          {`
HTML class: ${document.documentElement.className}
LocalStorage theme: ${localStorage.getItem('theme')}
Has .dark class: ${document.documentElement.classList.contains('dark')}
          `}
        </pre>
      </div>
    </div>
  );
}