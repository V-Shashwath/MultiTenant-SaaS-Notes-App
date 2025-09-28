import React, { useState } from 'react';
import { X, UserPlus } from 'lucide-react';
import { validateEmail } from '../../utils/validators';
import Button from '../UI/Button';
import Input from '../UI/Input';

const InviteUserModal = ({ isOpen, onClose, onInvite }) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');
  const [errors, setErrors] = useState({});
  const [inviting, setInviting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate email
    const emailError = validateEmail(email);
    if (emailError) {
      setErrors({ email: emailError });
      return;
    }

    setInviting(true);
    try {
      await onInvite({ email: email.toLowerCase(), role });
      setEmail('');
      setRole('member');
      setErrors({});
      onClose();
    } catch (error) {
      // Error handling is done in parent component
    } finally {
      setInviting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                  <UserPlus className="h-5 w-5 mr-2 text-blue-600" />
                  Invite New User
                </h3>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600"
                  disabled={inviting}
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <Input
                  label="Email Address *"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@example.com"
                  error={errors.email}
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role *
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    disabled={inviting}
                  >
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </select>
                  <p className="mt-1 text-sm text-gray-500">
                    Members can manage notes. Admins can invite users and upgrade subscriptions.
                  </p>
                </div>
              </div>

              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Demo Note:</strong> The invited user will be created with password "password" for testing purposes.
                </p>
              </div>
            </div>

            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <Button
                type="submit"
                loading={inviting}
                disabled={!email.trim()}
                className="w-full sm:ml-3 sm:w-auto"
              >
                Send Invitation
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={inviting}
                className="mt-3 w-full sm:mt-0 sm:ml-3 sm:w-auto"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default InviteUserModal;
