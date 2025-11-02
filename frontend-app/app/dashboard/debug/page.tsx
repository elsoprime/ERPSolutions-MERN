'use client'

import {useAuth} from '@/hooks/useAuth'
import {getHighestRole} from '@/utils/roleRouting'
import {getMenuByRole} from '@/data/Menu'
import {UserRole} from '@/interfaces/EnhanchedCompany/MultiCompany'

export default function DebugPage() {
  const {getUserData} = useAuth()
  const userData = getUserData()
  const userRole = getHighestRole(userData)
  const menuItems = getMenuByRole(userRole)

  return (
    <div className='p-8 max-w-4xl mx-auto'>
      <h1 className='text-3xl font-bold mb-6'>🔍 Debug Dashboard</h1>

      <div className='space-y-6'>
        {/* User Data */}
        <div className='bg-white p-6 rounded-lg shadow'>
          <h2 className='text-xl font-semibold mb-4'>👤 User Data</h2>
          <pre className='bg-gray-100 p-4 rounded overflow-auto text-sm'>
            {JSON.stringify(userData, null, 2)}
          </pre>
        </div>

        {/* Role Info */}
        <div className='bg-white p-6 rounded-lg shadow'>
          <h2 className='text-xl font-semibold mb-4'>🎭 Role Information</h2>
          <div className='space-y-2'>
            <p>
              <strong>Detected Role:</strong>{' '}
              <span className='text-blue-600 font-mono'>{userRole}</span>
            </p>
            <p>
              <strong>Raw Role:</strong>{' '}
              <span className='text-blue-600 font-mono'>{userData?.role}</span>
            </p>
            <p>
              <strong>Is SUPER_ADMIN?</strong>{' '}
              <span
                className={
                  userRole === UserRole.SUPER_ADMIN
                    ? 'text-green-600'
                    : 'text-red-600'
                }
              >
                {userRole === UserRole.SUPER_ADMIN ? '✅ YES' : '❌ NO'}
              </span>
            </p>
          </div>
        </div>

        {/* Enum Values */}
        <div className='bg-white p-6 rounded-lg shadow'>
          <h2 className='text-xl font-semibold mb-4'>
            📋 UserRole Enum Values
          </h2>
          <div className='grid grid-cols-2 gap-2'>
            <div>
              <strong>SUPER_ADMIN:</strong>{' '}
              <code className='bg-gray-100 px-2 py-1 rounded'>
                {UserRole.SUPER_ADMIN}
              </code>
            </div>
            <div>
              <strong>ADMIN_EMPRESA:</strong>{' '}
              <code className='bg-gray-100 px-2 py-1 rounded'>
                {UserRole.ADMIN_EMPRESA}
              </code>
            </div>
            <div>
              <strong>MANAGER:</strong>{' '}
              <code className='bg-gray-100 px-2 py-1 rounded'>
                {UserRole.MANAGER}
              </code>
            </div>
            <div>
              <strong>EMPLOYEE:</strong>{' '}
              <code className='bg-gray-100 px-2 py-1 rounded'>
                {UserRole.EMPLOYEE}
              </code>
            </div>
            <div>
              <strong>VIEWER:</strong>{' '}
              <code className='bg-gray-100 px-2 py-1 rounded'>
                {UserRole.VIEWER}
              </code>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className='bg-white p-6 rounded-lg shadow'>
          <h2 className='text-xl font-semibold mb-4'>
            📱 Menu Items ({menuItems.length} items)
          </h2>
          <div className='space-y-2'>
            {menuItems.map((item, index) => (
              <div
                key={item.id}
                className='border-l-4 border-purple-500 pl-4 py-2 bg-gray-50 rounded'
              >
                <p className='font-semibold'>
                  {index + 1}. {item.title}
                </p>
                <p className='text-sm text-gray-600'>
                  Link: {item.link || 'N/A'}
                </p>
                {item.ISubMenu && (
                  <p className='text-sm text-gray-500'>
                    Submenú: {item.ISubMenu.length} items
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Comparison Test */}
        <div className='bg-white p-6 rounded-lg shadow'>
          <h2 className='text-xl font-semibold mb-4'>
            🧪 Role Comparison Test
          </h2>
          <div className='space-y-2'>
            <p>
              <code>userRole === UserRole.SUPER_ADMIN</code>:{' '}
              <span className='font-mono'>
                {String(userRole === UserRole.SUPER_ADMIN)}
              </span>
            </p>
            <p>
              <code>userRole === 'super_admin'</code>:{' '}
              <span className='font-mono'>
                {String(userRole === 'super_admin')}
              </span>
            </p>
            <p>
              <code>typeof userRole</code>:{' '}
              <span className='font-mono'>{typeof userRole}</span>
            </p>
            <p>
              <code>typeof UserRole.SUPER_ADMIN</code>:{' '}
              <span className='font-mono'>{typeof UserRole.SUPER_ADMIN}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
