import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { 
  Users, 
  CreditCard, 
  Shield, 
  UserCog, 
  Trash2, 
  Plus,
  RefreshCw,
  AlertCircle,
  FileText,
  Edit,
  ChevronDown,
  ChevronUp,
  Sparkles,
  X,
  Save
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { selectUser } from '@/redux/slices/authSlice';

const AdminDashboardPage = () => {
  const user = useSelector(selectUser);
  const navigate = useNavigate();
  
  // Users state
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  
  // Summaries state
  const [summaries, setSummaries] = useState([]);
  const [summariesLoading, setSummariesLoading] = useState(false);
  const [summariesError, setSummariesError] = useState(null);
  const [expandedSummary, setExpandedSummary] = useState(null);
  const [editingSummary, setEditingSummary] = useState(null);
  const [editContent, setEditContent] = useState('');

  // Redirect if not admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Fetch all users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('smartbrief_token');
      const response = await fetch('http://localhost:5000/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (response.ok) {
        setUsers(data.data.users);
        setStats(data.data.statistics);
      } else {
        setError(data.message || 'Failed to fetch users');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all summaries
  const fetchSummaries = async () => {
    try {
      setSummariesLoading(true);
      setSummariesError(null);
      
      const token = localStorage.getItem('smartbrief_token');
      const response = await fetch('http://localhost:5000/api/admin/summaries?limit=50', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (response.ok) {
        setSummaries(data.data.summaries);
      } else {
        setSummariesError(data.message || 'Failed to fetch summaries');
      }
    } catch (err) {
      setSummariesError('Network error: ' + err.message);
    } finally {
      setSummariesLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchUsers();
      fetchSummaries();
    }
  }, [user]);

  // Recharge credits
  const handleRecharge = async (userId, userName) => {
    const { value: credits, isConfirmed } = await Swal.fire({
      title: `Add Credits to ${userName}`,
      input: 'number',
      inputLabel: 'Number of credits to add',
      inputPlaceholder: 'Enter amount (e.g., 10)',
      inputValue: 10,
      showCancelButton: true,
      confirmButtonText: 'Add Credits',
      confirmButtonColor: '#3b82f6',
      cancelButtonText: 'Cancel',
      inputValidator: (value) => {
        if (!value || isNaN(value) || value <= 0) {
          return 'Please enter a valid positive number';
        }
      }
    });

    if (!isConfirmed) return;

    try {
      setActionLoading(userId);
      const token = localStorage.getItem('smartbrief_token');
      
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}/recharge`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ credits: parseInt(credits) })
      });

      const data = await response.json();
      
      if (response.ok) {
        await Swal.fire({
          icon: 'success',
          title: 'Credits Added!',
          text: `Successfully added ${credits} credits to ${userName}`,
          timer: 2000,
          showConfirmButton: false
        });
        fetchUsers();
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Failed',
          text: data.message || 'Failed to add credits'
        });
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Change user role
  const handleChangeRole = async (userId, currentRole, userName) => {
    const roles = {
      user: '👤 User - Standard access',
      editor: '✏️ Editor - Can edit any summary',
      reviewer: '👁️ Reviewer - Can review summaries',
      admin: '🛡️ Admin - Full access'
    };

    const { value: newRole, isConfirmed } = await Swal.fire({
      title: `Change Role for ${userName}`,
      html: `<p class="text-sm text-gray-600 mb-4">Current role: <strong class="text-blue-600">${currentRole}</strong></p>`,
      input: 'select',
      inputOptions: roles,
      inputValue: currentRole,
      showCancelButton: true,
      confirmButtonText: 'Change Role',
      confirmButtonColor: '#3b82f6',
      cancelButtonText: 'Cancel',
      inputValidator: (value) => {
        if (!value) {
          return 'Please select a role';
        }
      }
    });

    if (!isConfirmed || newRole === currentRole) return;

    try {
      setActionLoading(userId);
      const token = localStorage.getItem('smartbrief_token');
      
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: newRole })
      });

      const data = await response.json();
      
      if (response.ok) {
        await Swal.fire({
          icon: 'success',
          title: 'Role Changed!',
          text: `${userName}'s role changed to ${newRole}`,
          timer: 2000,
          showConfirmButton: false
        });
        fetchUsers();
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Failed',
          text: data.message || 'Failed to change role'
        });
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Delete user
  const handleDeleteUser = async (userId, userName) => {
    const result = await Swal.fire({
      title: 'Delete User?',
      html: `
        <p class="text-gray-700">Are you sure you want to delete <strong class="text-red-600">${userName}</strong>?</p>
        <p class="text-sm text-gray-500 mt-2">This action cannot be undone!</p>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete user',
      cancelButtonText: 'Cancel'
    });

    if (!result.isConfirmed) return;

    try {
      setActionLoading(userId);
      const token = localStorage.getItem('smartbrief_token');
      
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (response.ok) {
        await Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: `User ${userName} has been deleted`,
          timer: 2000,
          showConfirmButton: false
        });
        fetchUsers();
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Failed',
          text: data.message || 'Failed to delete user'
        });
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Edit summary
  const handleEditSummary = (summary) => {
    setEditingSummary(summary._id);
    setEditContent(summary.summarizedContent);
  };

  // Save edited summary
  const handleSaveEdit = async (summaryId) => {
    try {
      setActionLoading(summaryId);
      const token = localStorage.getItem('smartbrief_token');
      
      const response = await fetch(`http://localhost:5000/api/admin/summaries/${summaryId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ summarizedContent: editContent })
      });

      const data = await response.json();
      
      if (response.ok) {
        await Swal.fire({
          icon: 'success',
          title: 'Updated!',
          text: 'Summary updated successfully',
          timer: 2000,
          showConfirmButton: false
        });
        setEditingSummary(null);
        setEditContent('');
        fetchSummaries();
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Failed',
          text: data.message || 'Failed to update summary'
        });
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Delete summary
  const handleDeleteSummary = async (summaryId, ownerName) => {
    const result = await Swal.fire({
      title: 'Delete Summary?',
      html: `
        <p class="text-gray-700">Delete this summary by <strong>${ownerName}</strong>?</p>
        <p class="text-sm text-gray-500 mt-2">This action cannot be undone!</p>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel'
    });

    if (!result.isConfirmed) return;

    try {
      setActionLoading(summaryId);
      const token = localStorage.getItem('smartbrief_token');
      
      const response = await fetch(`http://localhost:5000/api/admin/summaries/${summaryId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (response.ok) {
        await Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Summary has been deleted',
          timer: 2000,
          showConfirmButton: false
        });
        fetchSummaries();
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Failed',
          text: data.message || 'Failed to delete summary'
        });
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message
      });
    } finally {
      setActionLoading(null);
    }
  };

  const getRoleBadgeVariant = (role) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'editor':
        return 'default';
      case 'reviewer':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Access Denied</CardTitle>
            <CardDescription>
              You don't have permission to access this page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/dashboard')}>
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Shield className="w-8 h-8 text-red-600" />
            Admin Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Manage users, summaries, credits, and permissions
          </p>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Summaries</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summaries.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Credits</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalCredits}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Admins</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.roleDistribution?.admin || 0}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Error Alerts */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {summariesError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{summariesError}</AlertDescription>
          </Alert>
        )}

        {/* Tabs for Users and Summaries */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full md:w-[400px] grid-cols-2">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Users Management
            </TabsTrigger>
            <TabsTrigger value="summaries" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              All Summaries
            </TabsTrigger>
          </TabsList>

          {/* USERS TAB */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>All Users</CardTitle>
                    <CardDescription>
                      Manage user accounts, credits, and roles
                    </CardDescription>
                  </div>
                  <Button onClick={fetchUsers} variant="outline" size="sm">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-500">Loading users...</p>
                  </div>
                ) : users.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No users found
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead className="text-right">Credits</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map((u) => (
                          <TableRow key={u._id}>
                            <TableCell className="font-medium">{u.name}</TableCell>
                            <TableCell>{u.email}</TableCell>
                            <TableCell>
                              <Badge variant={getRoleBadgeVariant(u.role)}>
                                {u.role.toUpperCase()}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right font-semibold">
                              {u.credits}
                            </TableCell>
                            <TableCell>
                              {new Date(u.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleRecharge(u._id, u.name)}
                                  disabled={actionLoading === u._id}
                                >
                                  <Plus className="w-3 h-3 mr-1" />
                                  Credits
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleChangeRole(u._id, u.role, u.name)}
                                  disabled={actionLoading === u._id}
                                >
                                  <UserCog className="w-3 h-3 mr-1" />
                                  Role
                                </Button>
                                {u._id !== user?.id && (
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleDeleteUser(u._id, u.name)}
                                    disabled={actionLoading === u._id}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Role Distribution */}
            {stats?.roleDistribution && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Role Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(stats.roleDistribution).map(([role, count]) => (
                      <div key={role} className="text-center p-4 bg-gray-50 rounded-lg">
                        <Badge variant={getRoleBadgeVariant(role)} className="mb-2">
                          {role.toUpperCase()}
                        </Badge>
                        <div className="text-2xl font-bold">{count}</div>
                        <div className="text-sm text-gray-500">users</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* SUMMARIES TAB */}
          <TabsContent value="summaries">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>All User Summaries</CardTitle>
                    <CardDescription>
                      View, edit, and manage all summaries from all users
                    </CardDescription>
                  </div>
                  <Button onClick={fetchSummaries} variant="outline" size="sm">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {summariesLoading ? (
                  <div className="text-center py-8">
                    <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-500">Loading summaries...</p>
                  </div>
                ) : summaries.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No summaries found
                  </div>
                ) : (
                  <div className="space-y-4">
                    {summaries.map((summary) => (
                      <Card key={summary._id} className="border-l-4 border-l-primary">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant={getRoleBadgeVariant(summary.user?.role || 'user')}>
                                  {summary.user?.role?.toUpperCase() || 'USER'}
                                </Badge>
                                <span className="text-sm font-medium text-gray-700">
                                  {summary.user?.name || 'Unknown User'}
                                </span>
                                <span className="text-xs text-gray-500">
                                  ({summary.user?.email || 'N/A'})
                                </span>
                              </div>
                              <CardDescription className="text-sm text-gray-600 line-clamp-2">
                                {summary.summarizedContent?.substring(0, 150)}...
                              </CardDescription>
                            </div>
                            <div className="flex gap-2 ml-4">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setExpandedSummary(
                                  expandedSummary === summary._id ? null : summary._id
                                )}
                                title={expandedSummary === summary._id ? "Collapse" : "Expand"}
                              >
                                {expandedSummary === summary._id ? (
                                  <ChevronUp className="w-4 h-4" />
                                ) : (
                                  <ChevronDown className="w-4 h-4" />
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEditSummary(summary)}
                                title="Edit summary"
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteSummary(summary._id, summary.user?.name)}
                                title="Delete summary"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                disabled={actionLoading === summary._id}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>

                        <div className="px-6 pb-3">
                          <div className="flex items-center gap-6 text-xs text-gray-600">
                            <div className="flex items-center gap-1">
                              <FileText className="w-3.5 h-3.5" />
                              <span>{summary.originalWordCount || 'N/A'} words</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Sparkles className="w-3.5 h-3.5 text-green-600" />
                              <span>{summary.compressionRatio || 'N/A'}% ratio</span>
                            </div>
                            <div className="flex items-center gap-1 text-gray-500">
                              {new Date(summary.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>

                        {expandedSummary === summary._id && (
                          <CardContent className="border-t bg-gray-50 pt-4">
                            <div className="space-y-4">
                              {summary.originalContent && (
                                <div>
                                  <h4 className="font-semibold text-sm text-gray-700 mb-2 flex items-center gap-2">
                                    <FileText className="w-4 h-4" />
                                    Original Content
                                  </h4>
                                  <div className="text-sm text-gray-600 p-4 bg-white rounded-lg border max-h-48 overflow-y-auto">
                                    {summary.originalContent}
                                  </div>
                                </div>
                              )}
                              
                              <div>
                                <h4 className="font-semibold text-sm text-gray-700 mb-2 flex items-center gap-2">
                                  <Sparkles className="w-4 h-4 text-primary" />
                                  AI Summary
                                  {editingSummary === summary._id && (
                                    <Badge variant="secondary" className="ml-2">EDITING</Badge>
                                  )}
                                </h4>
                                {editingSummary === summary._id ? (
                                  <div className="space-y-2">
                                    <textarea
                                      value={editContent}
                                      onChange={(e) => setEditContent(e.target.value)}
                                      className="w-full min-h-[200px] p-4 text-sm border rounded-lg focus:ring-2 focus:ring-primary"
                                    />
                                    <div className="flex gap-2">
                                      <Button
                                        size="sm"
                                        onClick={() => handleSaveEdit(summary._id)}
                                        disabled={actionLoading === summary._id}
                                      >
                                        <Save className="w-3 h-3 mr-1" />
                                        Save Changes
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                          setEditingSummary(null);
                                          setEditContent('');
                                        }}
                                      >
                                        <X className="w-3 h-3 mr-1" />
                                        Cancel
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="text-sm text-gray-800 p-4 bg-white rounded-lg border border-primary/20">
                                    {summary.summarizedContent || 'Summary not available'}
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        )}
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
