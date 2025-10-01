import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectUser, decrementCredits } from '../redux/slices/authSlice';
import { 
  createSummary, 
  selectCurrentSummary, 
  selectSummaryStatus, 
  selectSummaryError,
  selectIsCreating,
  clearCurrentSummary,
  clearErrors
} from '../redux/slices/summarySlice';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Loader2, Sparkles, Copy, CheckCircle, FileText, Zap, AlertCircle } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';

/**
 * Summarize Page Component
 * Main interface for creating content summaries using AI
 */
const SummarizePage = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  
  // Redux state
  const currentSummary = useSelector(selectCurrentSummary);
  const summaryStatus = useSelector(selectSummaryStatus);
  const summaryError = useSelector(selectSummaryError);
  const isCreating = useSelector(selectIsCreating);

  // Local state
  const [content, setContent] = useState('');
  const [copied, setCopied] = useState(false);

  // Character count and validation
  const charCount = content.length;
  const minChars = 50;
  const maxChars = 50000;
  const isContentValid = charCount >= minChars && charCount <= maxChars;
  const hasCredits = user?.credits > 0;

  // Clear errors when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearErrors());
    };
  }, [dispatch]);

  // Update credits when summary is successfully created
  useEffect(() => {
    if (summaryStatus === 'succeeded' && currentSummary) {
      // Decrement credits in auth state
      dispatch(decrementCredits(1));
    }
  }, [summaryStatus, currentSummary, dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!isContentValid) {
      return; // Validation feedback is shown in UI
    }

    if (!hasCredits) {
      return; // Insufficient credits message is shown in UI
    }

    // Clear previous summary and dispatch async thunk
    dispatch(clearCurrentSummary());
    dispatch(createSummary(content));
  };

  const handleCopy = async () => {
    if (currentSummary?.summarizedContent) {
      await navigator.clipboard.writeText(currentSummary.summarizedContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleReset = () => {
    setContent('');
    dispatch(clearCurrentSummary());
    dispatch(clearErrors());
    setCopied(false);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Sparkles className="w-8 h-8 text-primary" />
          <h1 className="text-4xl font-bold">AI Content Summarizer</h1>
        </div>
        <p className="text-gray-600 text-lg">
          Transform long content into concise, intelligent summaries powered by AI
        </p>
      </div>

      {/* Main Content */}
      <div className="grid gap-6">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle>Your Content</CardTitle>
            <CardDescription>
              Paste or type the content you want to summarize ({minChars}-{maxChars.toLocaleString()} characters)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Textarea */}
              <div className="relative">
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Enter your content here... (Articles, documents, reports, etc.)"
                  className="w-full min-h-[300px] p-4 border rounded-lg resize-y focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={isCreating}
                />
                
                {/* Character Counter */}
                <div className="absolute bottom-2 right-2 text-xs text-gray-500 bg-white px-2 py-1 rounded">
                  {charCount.toLocaleString()} / {maxChars.toLocaleString()}
                  {charCount < minChars && (
                    <span className="text-orange-500 ml-2">
                      (min: {minChars})
                    </span>
                  )}
                  {charCount > maxChars && (
                    <span className="text-red-500 ml-2">
                      (exceeded)
                    </span>
                  )}
                </div>
              </div>

              {/* Validation Warning */}
              {charCount > 0 && !isContentValid && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {charCount < minChars 
                      ? `Content must be at least ${minChars} characters (current: ${charCount})`
                      : `Content exceeds maximum ${maxChars} characters (current: ${charCount.toLocaleString()})`
                    }
                  </AlertDescription>
                </Alert>
              )}
              
              {/* Insufficient Credits Warning */}
              {!hasCredits && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Insufficient credits. Please contact support to recharge your account.
                  </AlertDescription>
                </Alert>
              )}
              
              {/* Error Alert from API */}
              {summaryError && summaryStatus === 'failed' && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{summaryError}</AlertDescription>
                </Alert>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Zap className="w-4 h-4 text-primary" />
                  <span>Cost: <strong>1 Credit</strong></span>
                  <span className="text-gray-400">•</span>
                  <span>Your Credits: <strong>{user?.credits || 0}</strong></span>
                </div>

                <div className="flex gap-2">
                  {(content || currentSummary) && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleReset}
                      disabled={isCreating}
                    >
                      Reset
                    </Button>
                  )}
                  <Button
                    type="submit"
                    disabled={isCreating || !isContentValid || !hasCredits}
                  >
                    {isCreating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate Summary
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Summary Result */}
        {currentSummary && summaryStatus === 'succeeded' && (
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    Summary Generated
                  </CardTitle>
                  <CardDescription>
                    AI-powered summary using {currentSummary.aiModel || 'Gemini 1.5 Flash'}
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className="gap-2"
                >
                  {copied ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Summary Text */}
              <div className="p-4 bg-white rounded-lg border">
                <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                  {currentSummary.summarizedContent}
                </p>
              </div>

              <Separator />

              {/* Statistics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-white rounded-lg border">
                  <FileText className="w-5 h-5 mx-auto mb-1 text-gray-500" />
                  <div className="text-2xl font-bold text-primary">
                    {currentSummary.originalWordCount || 0}
                  </div>
                  <div className="text-xs text-gray-600">Original Words</div>
                </div>

                <div className="text-center p-3 bg-white rounded-lg border">
                  <FileText className="w-5 h-5 mx-auto mb-1 text-gray-500" />
                  <div className="text-2xl font-bold text-primary">
                    {currentSummary.summaryWordCount || 0}
                  </div>
                  <div className="text-xs text-gray-600">Summary Words</div>
                </div>

                <div className="text-center p-3 bg-white rounded-lg border">
                  <Zap className="w-5 h-5 mx-auto mb-1 text-gray-500" />
                  <div className="text-2xl font-bold text-primary">
                    {currentSummary.compressionRatio ? `${currentSummary.compressionRatio}%` : 'N/A'}
                  </div>
                  <div className="text-xs text-gray-600">Compression</div>
                </div>

                <div className="text-center p-3 bg-white rounded-lg border">
                  <Badge variant="secondary" className="mb-1">
                    completed
                  </Badge>
                  <div className="text-xs text-gray-600 mt-1">
                    {currentSummary.processingTime ? `${currentSummary.processingTime}ms` : 'Success'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SummarizePage;
