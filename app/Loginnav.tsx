import Link from 'next/link';
export default function Loginnav(){
    return <>

<div className="flex items-center space-x-2 mr-4">
          <Link 
            href="/login"
            className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors duration-300"
          >
            Login
          </Link>
          <Link 
            href="/signup"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors duration-300"
          >
            Sign Up
          </Link>
        </div>

    
    </>
}
