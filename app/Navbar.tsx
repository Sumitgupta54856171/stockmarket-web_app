'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Navbar() {
  const [activeItem, setActiveItem] = useState('home');

  return (
    <nav className="fixed inset-x-0 bottom-0 bg-white shadow-lg">
      <ul className="flex justify-around items-center h-16">
        <li 
          className={`flex flex-col items-center justify-center p-2 ${
            activeItem === 'home' 
              ? 'text-blue-600 bg-blue-100 rounded-lg shadow-md' 
              : 'text-gray-500'
          } transition-all duration-300`}
        >
          <Link 
            href="/" 
            className="flex flex-col items-center"
            onClick={() => setActiveItem('home')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m0 0l7 7M19 10v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-xs mt-1">Home</span>
          </Link>
        </li>

        <li 
          className={`flex flex-col items-center justify-center p-2 ${
            activeItem === 'search' 
              ? 'text-blue-600 bg-blue-100 rounded-lg shadow-md' 
              : 'text-gray-500'
          } transition-all duration-300`}
        >
          <Link 
            href="/search" 
            className="flex flex-col items-center"
            onClick={() => setActiveItem('search')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="text-xs mt-1">Search</span>
          </Link>
        </li>

        <li className="flex flex-col items-center justify-center -mt-6">
          <button className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 text-white shadow-xl hover:bg-blue-700 transition-colors duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
          <span className="text-xs text-gray-500 mt-1">Add</span>
        </li>

        <li 
          className={`flex flex-col items-center justify-center p-2 ${
            activeItem === 'messages' 
              ? 'text-blue-600 bg-blue-100 rounded-lg shadow-md' 
              : 'text-gray-500'
          } transition-all duration-300`}
        >
          <Link 
            href="/messages" 
            className="flex flex-col items-center"
            onClick={() => setActiveItem('messages')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <span className="text-xs mt-1">Messages</span>
          </Link>
        </li>

        <li 
          className={`flex flex-col items-center justify-center p-2 ${
            activeItem === 'settings' 
              ? 'text-blue-600 bg-blue-100 rounded-lg shadow-md' 
              : 'text-gray-500'
          } transition-all duration-300`}
        >
          <Link 
            href="/settings" 
            className="flex flex-col items-center"
            onClick={() => setActiveItem('settings')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.426 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-xs mt-1">Settings</span>
          </Link>
        </li>
      </ul>
    </nav>
  );
}
