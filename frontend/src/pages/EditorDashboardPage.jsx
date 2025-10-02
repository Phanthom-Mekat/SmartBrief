import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Edit, 
  Trash2, 
  RefreshCw, 
  AlertCircle, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  Save, 
  X,
  Calendar,
  User as UserIcon
} from 'lucide-react';
import Swal from 'sweetalert2';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { selectUser } from '@/redux/slices/authSlice';

const EditorDashboardPage = () => {
  const user = useSelector(selectUser);
  const navigate = useNavigate();
  
  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedSummary, setExpandedSummary] = useState(null);
  const [editingSummary, setEditingSummary] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [viewMode, setViewMode] = useState('all'); // 'all' or 'mine'

  // Redirect if not editor or admin
  useEffect(() => {
    if (user && user.role !== 'editor' && user.role !== 'admin') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Fetch all summaries
  const fetchAllSummaries = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('smartbrief_token');
      const response = await fetch('http://localhost:5000/api/admin/summaries?limit=100', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (response.ok) {
        setSummaries(data.data.summaries);
      } else {
        setError(data.message || 'Failed to fetch summaries');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch user's own summaries
  const fetchMySummaries = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('smartbrief_token');
      const response = await fetch('http://localhost:5000/api/summaries?limit=100', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (response.ok) {
        setSummaries(data.data.summaries);
      } else {
        setError(data.message || 'Failed to fetch summaries');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'editor' || user?.role === 'admin') {
      if (viewMode === 'all') {
        fetchAllSummaries();
      } else {
        fetchMySummaries();
      }
    }
  }, [user, viewMode]);

  // Edit summary
  const handleEditSummary = (summary) => {
    setEditingSummary(summary._id);
    setEditContent(summary.summarizedContent);
    setExpandedSummary(summary._id);
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
          title: 'Success!',
          text: 'Summary updated successfully',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
        setEditingSummary(null);
        setEditContent('');
        viewMode === 'all' ? fetchAllSummaries() : fetchMySummaries();
      } else {
        Swal.fire({
          title: 'Error!',
          text: data.message || 'Failed to update summary',
          icon: 'error'
        });
      }
    } catch (err) {
      Swal.fire({
        title: 'Error!',
        text: 'Network error: ' + err.message,
        icon: 'error'
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Delete summary
  const handleDeleteSummary = async (summaryId, ownerName) => {
    const result = await Swal.fire({
      title: 'Delete Summary?',
      text: `Delete this summary${ownerName ? ` by ${ownerName}` : ''}? This cannot be undone!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      reverseButtons: true
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
          title: 'Deleted!',
          text: 'Summary deleted successfully',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
        viewMode === 'all' ? fetchAllSummaries() : fetchMySummaries();
      } else {
        Swal.fire({
          title: 'Error!',
          text: data.message || 'Failed to delete summary',
          icon: 'error'
        });
      }
    } catch (err) {
      Swal.fire({
        title: 'Error!',
        text: 'Network error: ' + err.message,
        icon: 'error'
      });
    } finally {
      setActionLoading(null);
    }
  };

  const getRoleBadgeVariant = (role) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'editor': return 'default';
      case 'reviewer': return 'secondary';
      default: return 'outline';
    }
  };

  if (user?.role !== 'editor' && user?.role !== 'admin') {
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Edit className="w-8 h-8 text-blue-600" />
            Editor Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Manage and edit all content summaries
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
              <CardTitle className="text-sm font-medium">Your Role</CardTitle>
              <UserIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Badge variant="default" className="text-lg">EDITOR</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">View Mode</CardTitle>
              <Sparkles className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Badge variant="secondary" className="text-lg">
                {viewMode === 'all' ? 'All Summaries' : 'My Summaries'}
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Tabs for View Mode */}
        <Tabs value={viewMode} onValueChange={setViewMode} className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList className="grid w-full md:w-[400px] grid-cols-2">
              <TabsTrigger value="all" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                All Summaries
              </TabsTrigger>
              <TabsTrigger value="mine" className="flex items-center gap-2">
                <UserIcon className="w-4 h-4" />
                My Summaries
              </TabsTrigger>
            </TabsList>
            
            <Button 
              onClick={() => viewMode === 'all' ? fetchAllSummaries() : fetchMySummaries()} 
              variant="outline" 
              size="sm"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>

          {/* All Summaries Tab */}
          <TabsContent value="all">
            <Card>
              <CardHeader>
                <CardTitle>All Content Summaries</CardTitle>
                <CardDescription>
                  View, edit, and delete all summaries from all users
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
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
                      <Card key={summary._id} className="border-l-4 border-l-blue-500">
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
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              <span>{new Date(summary.createdAt).toLocaleDateString()}</span>
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
                                      className="w-full min-h-[200px] p-4 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                      placeholder="Edit summary content..."
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
                                  <div className="text-sm text-gray-800 p-4 bg-white rounded-lg border border-blue-200">
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

          {/* My Summaries Tab */}
          <TabsContent value="mine">
            <Card>
              <CardHeader>
                <CardTitle>My Summaries</CardTitle>
                <CardDescription>
                  View and manage your own summaries
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-500">Loading your summaries...</p>
                  </div>
                ) : summaries.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">
                      No summaries yet
                    </h3>
                    <p className="text-gray-500 mb-6">
                      Start by creating your first AI summary!
                    </p>
                    <Button onClick={() => navigate('/summarize')}>
                      Create Summary
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {summaries.map((summary) => (
                      <Card key={summary._id} className="border-l-4 border-l-primary">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="default">
                                  <Sparkles className="w-3 h-3 mr-1" />
                                  {summary.isFallback ? 'Quick Summary' : 'AI Generated'}
                                </Badge>
                                <span className="flex items-center text-xs text-gray-500 gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {new Date(summary.createdAt).toLocaleDateString()}
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
                                onClick={() => handleDeleteSummary(summary._id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>

                        {expandedSummary === summary._id && (
                          <CardContent className="border-t bg-gray-50 pt-4">
                            <div className="space-y-4">
                              {summary.originalContent && (
                                <div>
                                  <h4 className="font-semibold text-sm text-gray-700 mb-2">
                                    Original Content
                                  </h4>
                                  <div className="text-sm text-gray-600 p-4 bg-white rounded-lg border max-h-48 overflow-y-auto">
                                    {summary.originalContent}
                                  </div>
                                </div>
                              )}
                              <div>
                                <h4 className="font-semibold text-sm text-gray-700 mb-2">
                                  AI Summary
                                </h4>
                                <div className="text-sm text-gray-800 p-4 bg-white rounded-lg border">
                                  {summary.summarizedContent}
                                </div>
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

export default EditorDashboardPage;
