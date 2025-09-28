import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { userService } from '../../services';
import { 
  Users, 
  UserPlus, 
  Crown, 
  User,
  Shield,
  Trash2 
} from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../UI/Button';
import Card from '../UI/Card';
import Badge from '../UI/Badge';
import LoadingSpinner from '../UI/LoadingSpinner';
import InviteUserModal from './InviteUserModal';
import ConfirmDialog from '../UI/ConfirmDialog';
import { formatDate } from '../../utils/formatters';

const UserManagement = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [userToRemove, setUserToRemove] = useState(null);
  const [changingRole, setChangingRole] = useState(null);

  useEffect(() => {
    if (currentUser?.role === 'admin') {
      loadUsers();
    }
  }, [currentUser]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await userService.getTenantUsers();
      setUsers(response.data.users);
    } catch (error) {
      console.error('Failed to load users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleInviteUser = async (userData) => {
    try {
      await userService.inviteUser(userData);
      toast.success(`User ${userData.email} invited successfully!`);
      await loadUsers();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to invite user';
      toast.error(message);
      throw error;
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      setChangingRole(userId);
      await userService.updateUserRole(userId, newRole);
      toast.success('User role updated successfully');
      await loadUsers();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update user role';
      toast.error(message);
    } finally {
      setChangingRole(null);
    }
  };

  const handleRemoveUser = async () => {
    if (!userToRemove?._id) return;

    try {
      await userService.removeUser(userToRemove._id);
      toast.success('User removed successfully');
      setUserToRemove(null);
      await loadUsers();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to remove user';
      toast.error(message);
    }
  };

  if (currentUser?.role !== 'admin') {
    return (
      <Card>
        <div className="text-center py-8">
          <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Admin Access Required</h3>
          <p className="text-gray-600">Only administrators can manage users.</p>
        </div>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner />
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Users className="h-6 w-6 mr-2" />
            User Management
          </h2>
          <p className="text-gray-600 mt-1">
            Manage users in your {currentUser.tenant_name} tenant
          </p>
        </div>
        
        <Button
          onClick={() => setIsInviteModalOpen(true)}
          icon={UserPlus}
        >
          Invite User
        </Button>
      </div>

      {/* Users List */}
      <Card>
        <Card.Header>
          <h3 className="text-lg font-semibold text-gray-900">
            Team Members ({users.length})
          </h3>
        </Card.Header>
        
        <Card.Body padding={false}>
          {users.length === 0 ? (
            <div className="p-6 text-center">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No users yet</h3>
              <p className="text-gray-600 mb-4">Invite team members to get started</p>
              <Button onClick={() => setIsInviteModalOpen(true)}>
                Invite First User
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {users.map((user) => (
                <div key={user._id} className="p-6 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="h-5 w-5 text-gray-600" />
                    </div>
                    
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-medium text-gray-900">
                          {user.email}
                        </h4>
                        {user._id === currentUser._id && (
                          <Badge variant="info" size="sm">You</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        Joined {formatDate(user.created_at)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    {/* Role Badge */}
                    <Badge 
                      variant={user.role === 'admin' ? 'warning' : 'default'}
                      className="flex items-center space-x-1"
                    >
                      {user.role === 'admin' && <Crown className="h-3 w-3" />}
                      <span className="capitalize">{user.role}</span>
                    </Badge>
                    
                    {/* Actions */}
                    {user._id !== currentUser._id && (
                      <div className="flex items-center space-x-2">
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user._id, e.target.value)}
                          disabled={changingRole === user._id}
                          className="text-sm border border-gray-300 rounded px-2 py-1"
                        >
                          <option value="member">Member</option>
                          <option value="admin">Admin</option>
                        </select>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setUserToRemove(user)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Invite User Modal */}
      <InviteUserModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onInvite={handleInviteUser}
      />

      {/* Remove User Confirmation */}
      {userToRemove && (
        <ConfirmDialog
          isOpen={true}
          onClose={() => setUserToRemove(null)}
          onConfirm={handleRemoveUser}
          title="Remove User"
          message={`Are you sure you want to remove ${userToRemove.email} from your tenant? This action cannot be undone.`}
          confirmText="Remove User"
          confirmStyle="danger"
        />
      )}
    </div>
  );
};

export default UserManagement;
