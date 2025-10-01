import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchSummaries, 
  deleteSummary as deleteSummaryAction,
  selectSummaries,
  selectFetchStatus,
  selectFetchError,
  selectDeleteError,
  selectPagination 
} from '../redux/slices/summarySlice';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { History, Trash2, Eye, FileText, Calendar, TrendingDown } from 'lucide-react';

/**
 * History Page Component
 * Displays user's summary history with pagination and details
 */
const HistoryPage = () => {
  const dispatch = useDispatch();
  
  // Redux selectors
  const summaries = useSelector(selectSummaries);
  const fetchStatus = useSelector(selectFetchStatus);
  const fetchError = useSelector(selectFetchError);
  const deleteError = useSelector(selectDeleteError);
  const pagination = useSelector(selectPagination);
  
  // Local state
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState(null);

  // Computed values
  const loading = fetchStatus === 'loading';
  const error = fetchError || deleteError;
  const totalPages = pagination.totalPages;

  // Fetch summaries when page changes
  const loadSummaries = useCallback(() => {
    dispatch(fetchSummaries({ page, limit: 10 }));
  }, [dispatch, page]);

  useEffect(() => {
    loadSummaries();
  }, [loadSummaries]);

  const handleDelete = async (summaryId) => {
    if (!window.confirm('Are you sure you want to delete this summary?')) {
      return;
    }

    // Dispatch delete action
    const result = await dispatch(deleteSummaryAction(summaryId));
    
    // Refresh list if delete was successful
    if (result.type.endsWith('/fulfilled')) {
      loadSummaries();
    }
  };

  const toggleExpand = (summaryId) => {
    setExpandedId(expandedId === summaryId ? null : summaryId);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <History className="w-8 h-8 text-primary" />
          <h1 className="text-4xl font-bold">Summary History</h1>
        </div>
        <p className="text-gray-600 text-lg">
          View and manage all your previously generated summaries
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle>Your Summaries</CardTitle>
          <CardDescription>
            {loading ? 'Loading...' : `${summaries.length} summaries on this page`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            // Loading Skeletons
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : summaries.length === 0 ? (
            // Empty State
            <div className="text-center py-12">
              <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No Summaries Yet
              </h3>
              <p className="text-gray-500 mb-6">
                Start creating summaries to see them here
              </p>
              <Button onClick={() => window.location.href = '/summarize'}>
                Create Your First Summary
              </Button>
            </div>
          ) : (
            // Table View
            <div className="space-y-4">
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Preview</TableHead>
                      <TableHead className="text-center">Original</TableHead>
                      <TableHead className="text-center">Summary</TableHead>
                      <TableHead className="text-center">Compression</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {summaries.map((summary) => (
                      <>
                        <TableRow key={summary._id} className="cursor-pointer hover:bg-gray-50">
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <span className="text-sm">
                                {formatDate(summary.createdAt)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-md">
                              <p className="text-sm text-gray-700 truncate">
                                {summary.originalContent.substring(0, 80)}...
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex flex-col items-center">
                              <FileText className="w-4 h-4 text-gray-400 mb-1" />
                              <span className="text-sm font-medium">
                                {summary.originalWordCount}w
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex flex-col items-center">
                              <FileText className="w-4 h-4 text-primary mb-1" />
                              <span className="text-sm font-medium">
                                {summary.summaryWordCount}w
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex flex-col items-center">
                              <TrendingDown className="w-4 h-4 text-green-500 mb-1" />
                              <span className="text-sm font-medium text-green-600">
                                {summary.compressionRatio}%
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant={summary.status === 'completed' ? 'default' : 'secondary'}>
                              {summary.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleExpand(summary._id)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(summary._id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>

                        {/* Expanded Detail Row */}
                        {expandedId === summary._id && (
                          <TableRow>
                            <TableCell colSpan={7} className="bg-gray-50">
                              <div className="p-4 space-y-4">
                                <div>
                                  <h4 className="font-semibold text-sm text-gray-700 mb-2">
                                    Original Content:
                                  </h4>
                                  <p className="text-sm text-gray-600 p-3 bg-white rounded border">
                                    {summary.originalContent}
                                  </p>
                                </div>
                                <div>
                                  <h4 className="font-semibold text-sm text-gray-700 mb-2">
                                    Summary:
                                  </h4>
                                  <p className="text-sm text-gray-800 p-3 bg-white rounded border border-primary/20">
                                    {summary.summarizedContent}
                                  </p>
                                </div>
                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                  <span>AI Model: {summary.aiModel || 'N/A'}</span>
                                  <span>•</span>
                                  <span>Processing Time: {summary.processingTime || 'N/A'}ms</span>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-gray-600">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page + 1)}
                    disabled={page === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default HistoryPage;
