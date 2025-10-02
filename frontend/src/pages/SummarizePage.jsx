import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectUser, updateUserCredits } from '../redux/slices/authSlice';
import { 
  createSummary,
  createSummaryFromFile,
  regenerateSummary,
  selectCurrentSummary, 
  selectSummaryStatus, 
  selectSummaryError,
  selectIsCreating,
  selectUpdatedCredits,
  clearCurrentSummary,
  clearErrors
} from '../redux/slices/summarySlice';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Loader2, Sparkles, Copy, CheckCircle, FileText, Zap, AlertCircle, Upload, X, RefreshCw, Edit3 } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

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
  const updatedCredits = useSelector(selectUpdatedCredits);

  // Local state
  const [content, setContent] = useState('');
  const [copied, setCopied] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [showPromptEditor, setShowPromptEditor] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');

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

  // Update credits from backend response when summary is successfully created
  useEffect(() => {
    if (summaryStatus === 'succeeded' && updatedCredits !== null) {
      // Sync credits from backend response
      dispatch(updateUserCredits(updatedCredits));
    }
  }, [summaryStatus, updatedCredits, dispatch]);

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
    setCustomPrompt('');
    setShowPromptEditor(false);
  };

  const handleRegenerate = async () => {
    if (!currentSummary?.id) return;
    
    try {
      await dispatch(regenerateSummary({ 
        summaryId: currentSummary.id, 
        customPrompt: customPrompt || null 
      })).unwrap();
      setShowPromptEditor(false);
    } catch (error) {
      console.error('Regeneration error:', error);
    }
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
        {/* Input Section with Tabs */}
        <Card>
          <CardHeader>
            <CardTitle>Create Summary</CardTitle>
            <CardDescription>
              Choose to paste text or upload a file (.txt or .docx)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="text" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="text">
                  <FileText className="w-4 h-4 mr-2" />
                  Paste Text
                </TabsTrigger>
                <TabsTrigger value="file">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload File
                </TabsTrigger>
              </TabsList>

              {/* Text Input Tab */}
              <TabsContent value="text">
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
          </TabsContent>

          {/* File Upload Tab */}
          <TabsContent value="file">
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary transition-colors">
                <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <div className="mb-4">
                  <label htmlFor="fileUpload" className="cursor-pointer">
                    <span className="text-primary hover:underline font-medium">
                      Click to upload
                    </span>
                    {' '}or drag and drop
                  </label>
                  <input
                    id="fileUpload"
                    type="file"
                    accept=".txt,.docx"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setSelectedFile(file);
                        setUploadError(null);
                      }
                    }}
                    disabled={isCreating}
                  />
                </div>
                <p className="text-sm text-gray-500">
                  Supports .txt and .docx files (Max 10MB)
                </p>
              </div>

              {selectedFile && (
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium text-sm">{selectedFile.name}</p>
                      <p className="text-xs text-gray-500">
                        {(selectedFile.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedFile(null);
                      setUploadError(null);
                    }}
                    disabled={isCreating}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}

              {uploadError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{uploadError}</AlertDescription>
                </Alert>
              )}

              {!hasCredits && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Insufficient credits. Please contact support to recharge your account.
                  </AlertDescription>
                </Alert>
              )}

              {summaryError && summaryStatus === 'failed' && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{summaryError}</AlertDescription>
                </Alert>
              )}

              <div className="flex items-center justify-between pt-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Zap className="w-4 h-4 text-primary" />
                  <span>Cost: <strong>1 Credit</strong></span>
                  <span className="text-gray-400">•</span>
                  <span>Your Credits: <strong>{user?.credits || 0}</strong></span>
                </div>

                <Button
                  onClick={async () => {
                    if (!selectedFile) {
                      setUploadError('Please select a file first');
                      return;
                    }
                    if (!hasCredits) return;

                    dispatch(clearCurrentSummary());
                    try {
                      await dispatch(createSummaryFromFile(selectedFile)).unwrap();
                      setSelectedFile(null);
                    } catch (error) {
                      setUploadError(error.message || 'Failed to process file');
                    }
                  }}
                  disabled={!selectedFile || isCreating || !hasCredits}
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload & Summarize
                    </>
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
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
                    {currentSummary.regenerationCount > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        v{currentSummary.regenerationCount + 1}
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    AI-powered summary using {currentSummary.aiModel || 'Gemini 1.5 Flash'}
                    {currentSummary.customPrompt && ' • Custom prompt applied'}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPromptEditor(!showPromptEditor)}
                    className="gap-2"
                    disabled={isCreating}
                  >
                    <Edit3 className="w-4 h-4" />
                    {showPromptEditor ? 'Cancel' : 'Re-prompt'}
                  </Button>
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
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Custom Prompt Editor */}
              {showPromptEditor && (
                <div className="p-4 border rounded-lg bg-blue-50 space-y-3">
                  <div className="flex items-start gap-2">
                    <RefreshCw className="w-5 h-5 text-blue-600 mt-1" />
                    <div className="flex-1">
                      <h4 className="font-medium text-sm mb-1">Customize Summary Prompt</h4>
                      <p className="text-xs text-gray-600 mb-3">
                        Provide custom instructions to regenerate the summary. Leave empty to use default prompt. 
                        <strong className="text-blue-700"> Free regeneration - no credits charged!</strong>
                      </p>
                      <textarea
                        value={customPrompt}
                        onChange={(e) => setCustomPrompt(e.target.value)}
                        placeholder="Example: Summarize this in bullet points focusing on key technical details..."
                        className="w-full min-h-[100px] p-3 border rounded-lg resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        disabled={isCreating}
                      />
                      <div className="flex justify-end gap-2 mt-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setShowPromptEditor(false);
                            setCustomPrompt('');
                          }}
                          disabled={isCreating}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleRegenerate}
                          disabled={isCreating}
                        >
                          {isCreating ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Regenerating...
                            </>
                          ) : (
                            <>
                              <RefreshCw className="w-4 h-4 mr-2" />
                              Regenerate Summary
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

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
