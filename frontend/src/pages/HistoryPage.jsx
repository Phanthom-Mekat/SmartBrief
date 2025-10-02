import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Swal from 'sweetalert2';
import { 
  fetchSummaries, 
  deleteSummary as deleteSummaryAction,
  selectSummaries,
  selectFetchStatus,
  selectFetchError,
  selectDeleteError,
  selectPagination 
} from '../redux/slices/summarySlice';
import { Card, CardContent, CardDescription, CardHeader } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { 
  History, 
  Trash2, 
  Copy, 
  FileText, 
  Calendar, 
  TrendingDown, 
  ChevronLeft, 
  ChevronRight,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const HistoryPage = () => {
  const dispatch = useDispatch();
  
  const summaries = useSelector(selectSummaries);
  const fetchStatus = useSelector(selectFetchStatus);
  const fetchError = useSelector(selectFetchError);
  const deleteError = useSelector(selectDeleteError);
  const pagination = useSelector(selectPagination);
  
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const loading = fetchStatus === 'loading';
  const error = fetchError || deleteError;
  const totalPages = pagination?.totalPages || 1;

  useEffect(() => {
    dispatch(fetchSummaries({ page, limit: 10 }));
  }, [dispatch, page]);

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Delete Summary?',
      text: "This action cannot be undone. Are you sure you want to delete this summary?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
      customClass: {
        popup: 'rounded-lg',
        title: 'text-xl font-bold',
        htmlContainer: 'text-gray-600',
      }
    });

    if (result.isConfirmed) {
      try {
        await dispatch(deleteSummaryAction(id)).unwrap();
        
        // Show success message
        Swal.fire({
          title: 'Deleted!',
          text: 'Your summary has been deleted successfully.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
          customClass: {
            popup: 'rounded-lg'
          }
        });

        // Refresh the list
        dispatch(fetchSummaries({ page, limit: 10 }));
      } catch {
        // Show error message
        Swal.fire({
          title: 'Error!',
          text: 'Failed to delete the summary. Please try again.',
          icon: 'error',
          confirmButtonColor: '#3b82f6',
          customClass: {
            popup: 'rounded-lg'
          }
        });
      }
    }
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  if (loading && summaries.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <Skeleton className="h-10 w-64 mb-2" />
            <Skeleton className="h-5 w-96" />
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <History className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-gray-900">Your Summaries</h1>
          </div>
          <p className="text-gray-600">
            View and manage all your AI-generated content summaries
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!loading && summaries.length === 0 && (
          <Card className="text-center py-16">
            <CardContent>
              <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No summaries yet
              </h3>
              <p className="text-gray-500 mb-6">
                Start by creating your first AI summary!
              </p>
              <Button onClick={() => window.location.href = '/summarize'}>
                Create Summary
              </Button>
            </CardContent>
          </Card>
        )}

        {summaries.length > 0 && (
          <div className="space-y-4">
            {summaries.map((summary) => (
              <Card 
                key={summary._id} 
                className="hover:shadow-lg transition-shadow duration-200 border-l-4 border-l-primary"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge 
                          variant={summary.isFallback ? "secondary" : "default"}
                          className="flex items-center gap-1"
                        >
                          <Sparkles className="w-3 h-3" />
                          {summary.isFallback ? 'Quick Summary' : 'AI Generated'}
                        </Badge>
                        <span className="flex items-center text-xs text-gray-500 gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(summary.createdAt)}
                        </span>
                      </div>
                      <CardDescription className="text-sm text-gray-600 line-clamp-2">
                        {summary.summarizedContent 
                          ? `${summary.summarizedContent.substring(0, 150)}...` 
                          : 'No preview available'}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleExpand(summary._id)}
                        title={expandedId === summary._id ? "Collapse" : "Expand"}
                      >
                        {expandedId === summary._id ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleCopy(summary.summarizedContent, summary._id)}
                        title="Copy summary"
                      >
                        <Copy className={`w-4 h-4 ${copiedId === summary._id ? 'text-green-600' : ''}`} />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(summary._id)}
                        title="Delete summary"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
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
                      <TrendingDown className="w-3.5 h-3.5 text-green-600" />
                      <span>{summary.compressionRatio || 'N/A'}% compressed</span>
                    </div>
                    {summary.processingTime && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{summary.processingTime}ms</span>
                      </div>
                    )}
                  </div>
                </div>

                {expandedId === summary._id && (
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
                        </h4>
                        <div className="text-sm text-gray-800 p-4 bg-white rounded-lg border border-primary/20">
                          {summary.summarizedContent || 'Summary not available'}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
                        <span>Model: {summary.aiModel || 'Gemini 1.5 Flash'}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCopy(summary.summarizedContent, summary._id)}
                          className="text-xs"
                        >
                          <Copy className="w-3 h-3 mr-1" />
                          {copiedId === summary._id ? 'Copied!' : 'Copy Summary'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            
            <div className="flex items-center gap-2">
              {[...Array(totalPages)].map((_, i) => {
                const pageNum = i + 1;
                if (
                  pageNum === 1 ||
                  pageNum === totalPages ||
                  Math.abs(pageNum - page) <= 1
                ) {
                  return (
                    <Button
                      key={pageNum}
                      variant={page === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPage(pageNum)}
                      disabled={loading}
                      className="w-8 h-8 p-0"
                    >
                      {pageNum}
                    </Button>
                  );
                } else if (Math.abs(pageNum - page) === 2) {
                  return <span key={pageNum} className="text-gray-400">...</span>;
                }
                return null;
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || loading}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}

        {summaries.length > 0 && (
          <div className="text-center text-sm text-gray-500 mt-4">
            Showing page {page} of {totalPages}  {pagination?.total || 0} total summaries
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;
