import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { 
  Search, 
  Eye, 
  CheckCircle, 
  Clock, 
  User, 
  Calendar,
  AlertCircle
} from 'lucide-react';
import { adminAPI } from '@/lib/api';
import type { ProgressReview } from '@/types';
import { toast } from '@/hooks/use-toast';

export const AdminProgressReviews: React.FC = () => {
  const [progressReviews, setProgressReviews] = useState<ProgressReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
    hasNext: false,
    hasPrev: false,
  });
  const fetchProgressReviews = async (page = 1) => {
    try {
      setLoading(true);
      const response = await adminAPI.getProgressReviews({
        page,
        limit: 10,
        status: statusFilter || undefined,
      });
      
      // Handle the backend response structure correctly
      if (response.data && response.data.success) {
        const data = response.data.data;
        setProgressReviews(data.reviews || []);
        setPagination(data.pagination || {
          currentPage: 1,
          totalPages: 1,
          total: 0,
          hasNext: false,
          hasPrev: false,
        });
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error: any) {
      console.error('Error fetching progress reviews:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to load progress reviews. Please try again.",
        variant: "destructive",
      });
      setProgressReviews([]);
      setPagination({
        currentPage: 1,
        totalPages: 1,
        total: 0,
        hasNext: false,
        hasPrev: false,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgressReviews();
  }, [statusFilter]);
  const handleMarkCompleted = async (reviewId: string) => {
    try {
      setLoading(true);
      await adminAPI.markReviewCompleted(reviewId);
      toast({
        title: "Success",
        description: "Progress review marked as completed",
      });
      fetchProgressReviews(pagination.currentPage);
    } catch (error: any) {
      console.error('Error marking review completed:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to mark review as completed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in_review':
        return <Clock className="h-4 w-4 text-orange-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_review':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatStatus = (status: string) => {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Progress Reviews</h1>
          <p className="text-muted-foreground">
            Review and manage trainee progress submissions
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by trainee name or instructor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>            <div className="sm:w-48">
              <Label htmlFor="status">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Status</SelectItem>
                  <SelectItem value="in_review">In Review</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress Reviews List */}
      <Card>
        <CardHeader>
          <CardTitle>Progress Reviews ({pagination.total})</CardTitle>
          <CardDescription>
            All progress review submissions from instructors
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading progress reviews...</div>
          ) : progressReviews.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No progress reviews found. {searchTerm || statusFilter ? 'Try adjusting your filters.' : 'No reviews have been submitted yet.'}
            </div>
          ) : (
            <div className="space-y-4">
              {progressReviews.map((review) => (
                <div key={review.id} className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getStatusIcon(review.status)}
                        <h3 className="font-semibold text-lg">
                          Progress Review #{review.id}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(review.status)}`}>
                          {formatStatus(review.status)}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm mb-3">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>Trainee: {review.trainee?.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>Shared by: {review.sharedBy?.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>Shared: {new Date(review.shared_at).toLocaleDateString()}</span>
                        </div>
                        {review.reviewed_at && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>Reviewed: {new Date(review.reviewed_at).toLocaleDateString()}</span>
                          </div>
                        )}
                        {review.reviewedBy && (
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span>Reviewed by: {review.reviewedBy.name}</span>
                          </div>
                        )}
                      </div>

                      {review.trainee && (
                        <div className="bg-muted/50 rounded-md p-3 text-sm">
                          <h4 className="font-medium mb-2">Trainee Information:</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            <div>Institution: {review.trainee.institution_name || 'Not specified'}</div>
                            <div>Degree: {review.trainee.degree || 'Not specified'}</div>
                            <div>Mobile: {review.trainee.mobile}</div>
                            <div>Joining Date: {new Date(review.trainee.joining_date).toLocaleDateString()}</div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                      {review.status === 'in_review' && (
                        <Button 
                          variant="default" 
                          size="sm"
                          onClick={() => handleMarkCompleted(review.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Mark Complete
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => fetchProgressReviews(pagination.currentPage - 1)}
                    disabled={!pagination.hasPrev}
                  >
                    Previous
                  </Button>
                  <span className="px-4 py-2 text-sm">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => fetchProgressReviews(pagination.currentPage + 1)}
                    disabled={!pagination.hasNext}
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
