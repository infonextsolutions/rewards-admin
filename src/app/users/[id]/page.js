'use client';

import { UserDetailPage } from '../../../components/users/UserDetailPage';
import { useParams, useRouter } from 'next/navigation';

// Mock user data - in a real app, this would come from an API
const mockUsers = {
  'IDO9012': {
    id: 1,
    name: "Neil Jackson",
    userId: "IDO9012",
    tier: "Silver",
    email: "neil.jackson@gmail.com",
    status: "Active",
    avatar: "https://c.animaapp.com/t66hdvJZ/img/avatar.svg",
    gender: "Male",
    age: "25–34",
    phone: "+33 6 45 32 19 87",
    location: "Lyon, France",
    device: "Android – Samsung Galaxy M13",
    ipAddress: "182.77.56.14 (Lyon, France)",
    appVersion: "1.1.3.7",
    lastActive: "12:08 am on 23 May 2025",
    faceVerification: "Yes",
    memberSince: "12 Jan 2025",
  },
  'IDIO8202': {
    id: 2,
    name: "Samuel Joh",
    userId: "IDIO8202",
    tier: "Gold",
    email: "samthegamer@gmail.com",
    status: "Active",
    avatar: "https://c.animaapp.com/t66hdvJZ/img/avatar-1.svg",
    gender: "Male",
    age: "28–35",
    phone: "+1 555 123 4567",
    location: "New York, USA",
    device: "iOS – iPhone 14 Pro",
    ipAddress: "192.168.1.1 (New York, USA)",
    appVersion: "1.1.3.7",
    lastActive: "2:15 pm on 24 May 2025",
    faceVerification: "Yes",
    memberSince: "15 Feb 2025",
  },
  'USR-202589': {
    id: 3,
    name: "Nick Johnson",
    userId: "USR-202589",
    tier: "Gold",
    email: "nickjohson12@gmail.com",
    status: "Active",
    avatar: "https://c.animaapp.com/6mo0E72h/img/avatar.svg",
    gender: "Male",
    age: "25–34",
    phone: "+33 6 45 32 19 87",
    location: "Lyon, France",
    device: "Android – Samsung Galaxy M13",
    ipAddress: "182.77.56.14 (Lyon, France)",
    appVersion: "1.1.3.7",
    lastActive: "12:08 am on 23 May 2025",
    faceVerification: "Yes",
    memberSince: "12 Jan 2025",
  }
};

export default function UserDetail() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id;

  // Find user by ID
  const user = mockUsers[userId];

  if (!user) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-semibold text-gray-900 mb-4">User Not Found</h1>
        <p className="text-gray-600 mb-6">The user with ID &quot;{userId}&quot; could not be found.</p>
        <button
          onClick={() => router.push('/users')}
          className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
        >
          Back to Users
        </button>
      </div>
    );
  }

  return <UserDetailPage user={user} />;
}