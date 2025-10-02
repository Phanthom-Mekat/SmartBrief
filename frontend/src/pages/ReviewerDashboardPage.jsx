import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { 
  FileText, 
  Eye, 
  RefreshCw, 
  AlertCircle, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  Calendar,
  User as UserIcon,
  ShieldCheck,
  CheckCircle,
  XCircle,
  AlertTriangle,
  MessageSquare,
  History,
  TrendingUp,
  ClipboardCheck
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { selectUser } from '@/redux/slices/authSlice';

const ReviewerDashboardPage = () => {
  const user = useSelector(selectUser);
  const navigate = useNavigate();
  
  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedSummary, setExpandedSummary] = useState(null);
  const [viewMode, setViewMode] = useState('pending'); // 'pending', 'all', 'mine'
  const [statistics, setStatistics] = useState({
    overall: { total: 0, pending: 0, approved: 0, rejected: 0, needs_revision: 0 },
    myReviews: { total: 0, approved: 0, rejected: 0, needs_revision: 0 }
  });
  const [reviewHistory, setReviewHistory] = useState(null);
  const [showHistoryFor, setShowHistoryFor] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  // Redirect if not reviewer or admin
  useEffect(() => {
    if (user && user.role !== 'reviewer' && user.role !== 'admin') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('smartbrief_token');
      const response = await fetch('http://localhost:5000/api/reviews/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (response.ok) {
        setStatistics(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  // Fetch summaries for review
  const fetchPendingReviews = async (status = 'pending') => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('smartbrief_token');
      const response = await fetch(`http://localhost:5000/api/reviews/pending?status=${status}&limit=100`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (response.ok) {
        setSummaries(data.data);
        if (data.statistics) {
          setStatistics(prev => ({ ...prev, overall: data.statistics }));
        }
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

  // Submit review
  const handleReviewSubmit = async (summaryId, action) => {
    // Show input dialog for comments
    const { value: comments, isConfirmed } = await Swal.fire({
      title: `${action === 'approved' ? 'Approve' : action === 'rejected' ? 'Reject' : 'Request Revision'}`,
      input: 'textarea',
      inputLabel: 'Comments (optional)',
      inputPlaceholder: 'Enter your feedback...',
      showCancelButton: true,
      confirmButtonText: 'Submit Review',
      confirmButtonColor: action === 'approved' ? '#10b981' : action === 'rejected' ? '#ef4444' : '#f59e0b',
      cancelButtonText: 'Cancel',
      inputValidator: (value) => {
        if (action === 'rejected' && !value) {
          return 'Please provide a reason for rejection';
        }
      }
    });

    if (!isConfirmed) return;

    try {
      setActionLoading(summaryId);
      
      const token = localStorage.getItem('smartbrief_token');
      const response = await fetch(`http://localhost:5000/api/reviews/${summaryId}/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action, comments })
      });

      const data = await response.json();
      
      if (response.ok) {
        await Swal.fire({
          icon: 'success',
          title: 'Review Submitted!',
          text: `Summary ${action} successfully`,
          timer: 2000,
          showConfirmButton: false
        });

        // Refresh the list
        if (viewMode === 'pending') {
          fetchPendingReviews('pending');
        } else if (viewMode === 'all') {
          fetchPendingReviews('all');
        }
        fetchStats();
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Failed',
          text: data.message || 'Failed to submit review'
        });
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Network error: ' + err.message
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Fetch review history
  const fetchReviewHistory = async (summaryId) => {
    try {
      const token = localStorage.getItem('smartbrief_token');
      const response = await fetch(`http://localhost:5000/api/reviews/${summaryId}/history`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (response.ok) {
        setReviewHistory(data.data);
        setShowHistoryFor(summaryId);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: data.message || 'Failed to fetch review history'
        });
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Network error: ' + err.message
      });
    }
  };

  useEffect(() => {
    if (user?.role === 'reviewer' || user?.role === 'admin') {
      fetchStats();
      if (viewMode === 'pending') {
        fetchPendingReviews('pending');
      } else if (viewMode === 'all') {
        fetchPendingReviews('all');
      } else if (viewMode === 'mine') {
        fetchMySummaries();
      }
    }
  }, [user, viewMode]);

  // Get badge color based on review status
  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle, label: 'Pending' },
      approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Approved' },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Rejected' },
      needs_revision: { color: 'bg-orange-100 text-orange-800', icon: AlertCircle, label: 'Needs Revision' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  // Get role badge color
  const getRoleBadge = (role) => {
    const roleColors = {
      admin: 'bg-red-100 text-red-800',
      editor: 'bg-blue-100 text-blue-800',
      reviewer: 'bg-purple-100 text-purple-800',
      user: 'bg-gray-100 text-gray-800'
    };

    return (
      <Badge className={`${roleColors[role] || roleColors.user} uppercase text-xs`}>
        {role}
      </Badge>
    );
  };

  if (loading && summaries.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin text-purple-600" />
            <span className="ml-3 text-lg">Loading reviews...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <ClipboardCheck className="w-8 h-8" />
                Reviewer Dashboard
              </h1>
              <p className="text-purple-100 mt-2">Review and provide feedback on content summaries</p>
            </div>
            <Button
              onClick={() => {
                fetchStats();
                if (viewMode === 'pending') fetchPendingReviews('pending');
                else if (viewMode === 'all') fetchPendingReviews('all');
                else fetchMySummaries();
              }}
              className="bg-white text-purple-600 hover:bg-purple-50"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-yellow-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending Reviews</p>
                  <p className="text-3xl font-bold text-yellow-600">
                    {statistics.overall.pending}
                  </p>
                </div>
                <AlertTriangle className="w-10 h-10 text-yellow-500 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Approved</p>
                  <p className="text-3xl font-bold text-green-600">
                    {statistics.overall.approved}
                  </p>
                </div>
                <CheckCircle className="w-10 h-10 text-green-500 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Rejected</p>
                  <p className="text-3xl font-bold text-red-600">
                    {statistics.overall.rejected}
                  </p>
                </div>
                <XCircle className="w-10 h-10 text-red-500 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">My Reviews</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {statistics.myReviews.total}
                  </p>
                </div>
                <TrendingUp className="w-10 h-10 text-purple-500 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Review Summaries
            </CardTitle>
            <CardDescription>
              Review, approve, reject, or request revisions for summaries
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={viewMode} onValueChange={setViewMode} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="pending" className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Pending Reviews
                  {statistics.overall.pending > 0 && (
                    <Badge variant="destructive" className="ml-1 rounded-full px-2 py-0">
                      {statistics.overall.pending}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="all" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  All Summaries
                </TabsTrigger>
                <TabsTrigger value="mine" className="flex items-center gap-2">
                  <UserIcon className="w-4 h-4" />
                  My Summaries
                </TabsTrigger>
              </TabsList>

              {/* Pending Reviews Tab */}
              <TabsContent value="pending" className="space-y-4 mt-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {summaries.length === 0 && !loading && (
                  <div className="text-center py-12">
                    <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-700">All Caught Up!</h3>
                    <p className="text-gray-500 mt-2">No pending reviews at the moment</p>
                  </div>
                )}

                {summaries.map((summary) => (
                  <Card key={summary._id} className="border-l-4 border-l-yellow-500 hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            {getStatusBadge(summary.reviewStatus)}
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <UserIcon className="w-4 h-4" />
                              <span className="font-medium">{summary.user?.name || 'Unknown'}</span>
                              <span className="text-gray-400">•</span>
                              {getRoleBadge(summary.user?.role)}
                              <span className="text-gray-400">•</span>
                              <span>{summary.user?.email}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              <span>{new Date(summary.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <FileText className="w-3.5 h-3.5" />
                              <span>{summary.originalWordCount || 0} words</span>
                            </div>
                            {summary.compressionRatio && (
                              <div className="flex items-center gap-1">
                                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                                <span>{summary.compressionRatio}% compressed</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setExpandedSummary(expandedSummary === summary._id ? null : summary._id)}
                        >
                          {expandedSummary === summary._id ? (
                            <ChevronUp className="w-5 h-5" />
                          ) : (
                            <ChevronDown className="w-5 h-5" />
                          )}
                        </Button>
                      </div>
                    </CardHeader>

                    {expandedSummary === summary._id && (
                      <CardContent className="space-y-4">
                        <Separator />

                        {/* Original Content */}
                        <div>
                          <h4 className="font-semibold text-sm text-gray-700 mb-2 flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            Original Content
                          </h4>
                          <div className="p-4 bg-gray-50 rounded-lg border text-sm text-gray-700 max-h-48 overflow-y-auto">
                            {summary.originalContent}
                          </div>
                        </div>

                        {/* Summary */}
                        <div>
                          <h4 className="font-semibold text-sm text-gray-700 mb-2 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-purple-600" />
                            AI Generated Summary
                          </h4>
                          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200 text-sm text-gray-700">
                            {summary.summarizedContent}
                          </div>
                        </div>

                        {/* Review Actions */}
                        <div className="flex items-center gap-3 pt-4">
                          <Button
                            onClick={() => handleReviewSubmit(summary._id, 'approved')}
                            disabled={actionLoading === summary._id}
                            className="bg-green-600 hover:bg-green-700 text-white flex-1"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Approve
                          </Button>
                          <Button
                            onClick={() => handleReviewSubmit(summary._id, 'needs_revision')}
                            disabled={actionLoading === summary._id}
                            className="bg-orange-600 hover:bg-orange-700 text-white flex-1"
                          >
                            <AlertCircle className="w-4 h-4 mr-2" />
                            Request Revision
                          </Button>
                          <Button
                            onClick={() => handleReviewSubmit(summary._id, 'rejected')}
                            disabled={actionLoading === summary._id}
                            variant="destructive"
                            className="flex-1"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Reject
                          </Button>
                          <Button
                            onClick={() => fetchReviewHistory(summary._id)}
                            variant="outline"
                          >
                            <History className="w-4 h-4 mr-2" />
                            History
                          </Button>
                        </div>

                        {actionLoading === summary._id && (
                          <div className="flex items-center justify-center py-4">
                            <RefreshCw className="w-5 h-5 animate-spin text-purple-600" />
                            <span className="ml-2 text-sm text-gray-600">Submitting review...</span>
                          </div>
                        )}
                      </CardContent>
                    )}
                  </Card>
                ))}
              </TabsContent>

              {/* All Summaries Tab */}
              <TabsContent value="all" className="space-y-4 mt-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {summaries.length === 0 && !loading && (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">No summaries found</p>
                  </div>
                )}

                {summaries.map((summary) => (
                  <Card key={summary._id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            {getStatusBadge(summary.reviewStatus)}
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <UserIcon className="w-4 h-4" />
                              <span className="font-medium">{summary.user?.name || 'Unknown'}</span>
                              <span className="text-gray-400">•</span>
                              {getRoleBadge(summary.user?.role)}
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              <span>{new Date(summary.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <FileText className="w-3.5 h-3.5" />
                              <span>{summary.originalWordCount || 0} words</span>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setExpandedSummary(expandedSummary === summary._id ? null : summary._id)}
                        >
                          {expandedSummary === summary._id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </Button>
                      </div>
                    </CardHeader>

                    {expandedSummary === summary._id && (
                      <CardContent className="space-y-4">
                        <Separator />
                        <div>
                          <h4 className="font-semibold text-sm text-gray-700 mb-2">Summary</h4>
                          <div className="p-4 bg-gray-50 rounded-lg border text-sm">
                            {summary.summarizedContent}
                          </div>
                        </div>

                        {summary.reviewComments && (
                          <div>
                            <h4 className="font-semibold text-sm text-gray-700 mb-2 flex items-center gap-2">
                              <MessageSquare className="w-4 h-4" />
                              Review Comments
                            </h4>
                            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 text-sm">
                              {summary.reviewComments}
                            </div>
                          </div>
                        )}

                        <div className="flex gap-2">
                          {summary.reviewStatus === 'pending' && (
                            <>
                              <Button
                                onClick={() => handleReviewSubmit(summary._id, 'approved')}
                                disabled={actionLoading === summary._id}
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Approve
                              </Button>
                              <Button
                                onClick={() => handleReviewSubmit(summary._id, 'needs_revision')}
                                disabled={actionLoading === summary._id}
                                className="bg-orange-600 hover:bg-orange-700 text-white"
                              >
                                <AlertCircle className="w-4 h-4 mr-2" />
                                Request Revision
                              </Button>
                              <Button
                                onClick={() => handleReviewSubmit(summary._id, 'rejected')}
                                disabled={actionLoading === summary._id}
                                variant="destructive"
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                Reject
                              </Button>
                            </>
                          )}
                          <Button
                            onClick={() => fetchReviewHistory(summary._id)}
                            variant="outline"
                          >
                            <History className="w-4 h-4 mr-2" />
                            View History
                          </Button>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </TabsContent>

              {/* My Summaries Tab */}
              <TabsContent value="mine" className="space-y-4 mt-6">
                {summaries.length === 0 && !loading && (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">You haven't created any summaries yet</p>
                  </div>
                )}

                {summaries.map((summary) => (
                  <Card key={summary._id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          {getStatusBadge(summary.reviewStatus)}
                          <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              <span>{new Date(summary.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setExpandedSummary(expandedSummary === summary._id ? null : summary._id)}
                        >
                          {expandedSummary === summary._id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </Button>
                      </div>
                    </CardHeader>

                    {expandedSummary === summary._id && (
                      <CardContent className="space-y-4">
                        <Separator />
                        <div>
                          <h4 className="font-semibold text-sm text-gray-700 mb-2">Your Summary</h4>
                          <div className="p-4 bg-gray-50 rounded-lg border text-sm">
                            {summary.summarizedContent}
                          </div>
                        </div>

                        {summary.reviewComments && (
                          <div>
                            <h4 className="font-semibold text-sm text-gray-700 mb-2 flex items-center gap-2">
                              <MessageSquare className="w-4 h-4" />
                              Reviewer Feedback
                            </h4>
                            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 text-sm">
                              {summary.reviewComments}
                              {summary.reviewedBy && (
                                <p className="text-xs text-gray-500 mt-2">
                                  - Reviewed by {summary.reviewedBy.name} on {new Date(summary.reviewedAt).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                        <Button
                          onClick={() => fetchReviewHistory(summary._id)}
                          variant="outline"
                        >
                          <History className="w-4 h-4 mr-2" />
                          View Review History
                        </Button>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Review History Modal */}
        {showHistoryFor && reviewHistory && (
          <Card className="fixed inset-0 z-50 m-8 overflow-auto bg-white shadow-2xl">
            <CardHeader className="sticky top-0 bg-white border-b z-10">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <History className="w-5 h-5" />
                  Review History
                </CardTitle>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowHistoryFor(null);
                    setReviewHistory(null);
                  }}
                >
                  <XCircle className="w-5 h-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div>
                <h4 className="font-semibold text-sm text-gray-700 mb-2">Current Status</h4>
                <div className="flex items-center gap-3">
                  {getStatusBadge(reviewHistory.currentStatus)}
                  {reviewHistory.reviewedBy && (
                    <span className="text-sm text-gray-600">
                      by {reviewHistory.reviewedBy.name} on {new Date(reviewHistory.reviewedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
                {reviewHistory.currentComments && (
                  <div className="mt-2 p-3 bg-blue-50 rounded border text-sm">
                    {reviewHistory.currentComments}
                  </div>
                )}
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold text-sm text-gray-700 mb-3">Review History</h4>
                {reviewHistory.history.length === 0 ? (
                  <p className="text-sm text-gray-500">No review history yet</p>
                ) : (
                  <div className="space-y-3">
                    {reviewHistory.history.map((entry, index) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-lg border">
                        <div className="flex items-center gap-3 mb-2">
                          {getStatusBadge(entry.action)}
                          <span className="text-sm text-gray-600">
                            by {entry.reviewer?.name || 'Unknown'} on {new Date(entry.timestamp).toLocaleString()}
                          </span>
                        </div>
                        {entry.comments && (
                          <p className="text-sm text-gray-700 mt-2">{entry.comments}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ReviewerDashboardPage;
