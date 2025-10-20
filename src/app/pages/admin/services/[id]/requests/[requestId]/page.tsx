"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  Download,
  File,
  Image,
  Video,
  MessageSquare,
  Plus,
  Minus,
  User,
} from "lucide-react";

interface UserType {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

interface ServiceType {
  id: number;
  name: string;
  description: string;
  admin: UserType;
}

interface Comment {
  message: string;
  dateTime: string;
  by: string;
}

interface ServiceRequestType {
  id: number;
  requested_by: UserType;
  service: ServiceType;
  plan: {
    plan: string;
    cost: number;
    discount: number;
    description?: string;
  };
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  request_msg: {
    subject: string;
    body: string;
  };
  media_url?: string;
  remark?: string;
  requested_at: string;
  updated_at: string;
  final_price: number;
}

const ServiceRequestDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const serviceId = params.id;
  const requestId = params.requestId;

  const [request, setRequest] = useState<ServiceRequestType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [updating, setUpdating] = useState<boolean>(false);
  const [newStatus, setNewStatus] = useState<string>("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState<string>("");
  const [addingComment, setAddingComment] = useState<boolean>(false);
  const [downloading, setDownloading] = useState<boolean>(false);

  useEffect(() => {
    if (requestId) fetchRequestDetail();
  }, [requestId]);

  const parseComments = (remark: string | null): Comment[] => {
    if (!remark) return [];
    
    try {
      // Try to parse as JSON array first
      const parsed = JSON.parse(remark);
      if (Array.isArray(parsed)) {
        return parsed.map(item => ({
          message: item.message || item,
          dateTime: item.dateTime || new Date().toISOString(),
          by: item.by || 'Admin'
        }));
      }
    } catch {
      // If parsing fails, treat as simple string message from admin
      return [{
        message: remark,
        dateTime: new Date().toISOString(),
        by: 'Admin'
      }];
    }
    
    return [];
  };

  const formatCommentsForStorage = (comments: Comment[]): string => {
    return JSON.stringify(comments);
  };

  const fetchRequestDetail = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/services/admin/requests/${requestId}/`);
      setRequest(response.data);
      setNewStatus(response.data.status);
      
      // Parse comments from remark
      const parsedComments = parseComments(response.data.remark);
      setComments(parsedComments);
      
    } catch (error) {
      console.error(error);
      toast.error("Failed to load request details");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!request) return;
    try {
      setUpdating(true);
      
      // Combine existing comments and format for storage
      const updatedRemark = formatCommentsForStorage(comments);

      await api.patch(`/services/admin/requests/${request.id}/update/`, {
        status: newStatus,
        remark: updatedRemark || undefined,
      });
      toast.success("Request updated successfully");
      fetchRequestDetail(); // Refresh to get latest data
    } catch (error) {
      console.error(error);
      toast.error("Failed to update request");
    } finally {
      setUpdating(false);
    }
  };

  const addComment = async () => {
    if (!newComment.trim() || !request) return;

    try {
      setAddingComment(true);
      
      const newCommentObj: Comment = {
        message: newComment.trim(),
        dateTime: new Date().toISOString(),
        by: "Admin" // Since this is admin panel
      };

      const updatedComments = [...comments, newCommentObj];
      setComments(updatedComments);
      
      // Update the remark immediately in local state
      const updatedRemark = formatCommentsForStorage(updatedComments);
      
      // Update via API
      await api.patch(`/services/admin/requests/${request.id}/update/`, {
        remark: updatedRemark,
      });
      
      toast.success("Comment added successfully");
      setNewComment("");
      
    } catch (error) {
      console.error(error);
      toast.error("Failed to add comment");
      // Revert on error
      fetchRequestDetail();
    } finally {
      setAddingComment(false);
    }
  };

  const deleteComment = async (index: number) => {
    if (!request) return;

    try {
      const updatedComments = comments.filter((_, i) => i !== index);
      setComments(updatedComments);
      
      const updatedRemark = formatCommentsForStorage(updatedComments);
      
      await api.patch(`/services/admin/requests/${request.id}/update/`, {
        remark: updatedRemark,
      });
      
      toast.success("Comment deleted successfully");
      
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete comment");
      // Revert on error
      fetchRequestDetail();
    }
  };

  const handleDownloadMedia = async () => {
    if (!request?.media_url) return;

    try {
      setDownloading(true);
      
      // Fetch the media file
      const response = await fetch(request.media_url);
      const blob = await response.blob();
      
      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Extract filename from URL or create one
      const filename = request.media_url.split('/').pop() || `service-request-${request.id}-media`;
      link.download = filename;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      window.URL.revokeObjectURL(url);
      toast.success("Media downloaded successfully");
      
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download media");
      
      // Fallback: open in new tab if download fails
      window.open(request.media_url, '_blank');
    } finally {
      setDownloading(false);
    }
  };

  const getFileIcon = (url: string) => {
    const extension = url.split('.').pop()?.toLowerCase();
    const isImage = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension || '');
    const isVideo = ['mp4', 'avi', 'mov', 'wmv', 'flv'].includes(extension || '');
    
    if (isImage) return <Image className="h-5 w-5" />;
    if (isVideo) return <Video className="h-5 w-5" />;
    return <File className="h-5 w-5" />;
  };

  const getFileName = (url: string) => {
    return url.split('/').pop() || 'Download File';
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: {
        variant: "secondary" as const,
        icon: Clock,
        color: "text-yellow-600",
      },
      IN_PROGRESS: {
        variant: "default" as const,
        icon: RefreshCw,
        color: "text-blue-600",
      },
      COMPLETED: {
        variant: "default" as const,
        icon: CheckCircle,
        color: "text-green-600",
      },
      CANCELLED: {
        variant: "destructive" as const,
        icon: XCircle,
        color: "text-red-600",
      },
    };
    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
    const IconComponent = config.icon;
    return (
      <Badge
        variant={config.variant}
        className="flex items-center space-x-1 w-fit"
      >
        <IconComponent className={`h-3 w-3 ${config.color}`} />
        <span className="capitalize">
          {status.toLowerCase().replace("_", " ")}
        </span>
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getCommentAuthorBadge = (by: string) => {
    if (by === "Admin") {
      return <Badge variant="default" className="text-xs bg-blue-100 text-blue-800">Staff</Badge>;
    } else {
      return <Badge variant="outline" className="text-xs"><User className="h-3 w-3 mr-1" />User</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-foreground">Loading request details...</p>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center text-foreground">
          <div className="mb-4">
            <XCircle className="h-16 w-16 text-muted-foreground mx-auto" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Request Not Found</h2>
          <p className="text-muted-foreground mb-4">The requested service request could not be found.</p>
          <Button onClick={() => router.back()} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-6 p-4 rounded-lg bg-card border border-border shadow-sm">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center space-x-2 text-card-foreground hover:bg-accent hover:text-accent-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-card-foreground">Service Request Detail</h1>
            <p className="text-muted-foreground mt-1">
              Request ID: {request.id} • Service: {request.service.name}
            </p>
          </div>
          {request.media_url && (
            <Button
              onClick={handleDownloadMedia}
              disabled={downloading}
              variant="outline"
              className="flex items-center space-x-2 border-border text-card-foreground hover:bg-accent hover:text-accent-foreground"
            >
              {downloading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              <span>{downloading ? "Downloading..." : "Download Media"}</span>
            </Button>
          )}
        </div>

        {/* User & Service Info */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-4">
            <CardTitle className="text-card-foreground">User & Service Information</CardTitle>
            <CardDescription className="text-muted-foreground">
              Details about the user and requested service
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-card-foreground">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="font-semibold text-sm text-muted-foreground">User</p>
                <p>
                  {request.requested_by.first_name} {request.requested_by.last_name}
                </p>
                <p className="text-sm text-muted-foreground">{request.requested_by.email}</p>
                <p className="text-xs text-muted-foreground">@{request.requested_by.username}</p>
              </div>
              
              <div>
                <p className="font-semibold text-sm text-muted-foreground">Service</p>
                <p>{request.service.name}</p>
                <p className="text-sm text-muted-foreground">{request.service.description}</p>
              </div>

              <div>
                <p className="font-semibold text-sm text-muted-foreground">Plan</p>
                <p>{request.plan.plan}</p>
                <p className="text-sm">
                  ${request.plan.cost} (-{request.plan.discount}% discount)
                </p>
                {request.plan.description && (
                  <p className="text-sm text-muted-foreground mt-1">{request.plan.description}</p>
                )}
              </div>

              <div>
                <p className="font-semibold text-sm text-muted-foreground">Final Price</p>
                <p className="text-lg font-bold text-green-600">${request.final_price}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-border">
              <div>
                <p className="font-semibold text-sm text-muted-foreground">Status</p>
                <div className="mt-1">{getStatusBadge(request.status)}</div>
              </div>
              
              <div>
                <p className="font-semibold text-sm text-muted-foreground">Requested At</p>
                <p className="text-sm">{formatDate(request.requested_at)}</p>
              </div>
              
              <div>
                <p className="font-semibold text-sm text-muted-foreground">Last Updated</p>
                <p className="text-sm">{formatDate(request.updated_at)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Request Message */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-4">
            <CardTitle className="text-card-foreground">Request Message</CardTitle>
            <CardDescription className="text-muted-foreground">
              Message submitted by the user
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-card-foreground">
            <div>
              <p className="font-semibold text-sm text-muted-foreground">Subject</p>
              <p className="mt-1">{request.request_msg.subject}</p>
            </div>
            <div>
              <p className="font-semibold text-sm text-muted-foreground">Message</p>
              <p className="mt-1 whitespace-pre-wrap">{request.request_msg.body}</p>
            </div>
          </CardContent>
        </Card>

        {/* Comments & Status Update */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-4">
            <CardTitle className="text-card-foreground flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Comments & Status Update
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Manage request status and communicate with the user
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Status Update Section */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-card-foreground">Status</label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger className="border-border bg-background text-foreground">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border text-card-foreground">
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Comments Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-card-foreground">
                  Comments & Updates ({comments.length})
                </label>
              </div>

              {/* Comments List */}
              {comments.length > 0 ? (
                <div className="space-y-3 max-h-60 overflow-y-auto border border-border rounded-lg p-4 bg-background">
                  {comments.map((comment, index) => (
                    <div 
                      key={index} 
                      className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-border"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm text-card-foreground">
                            {comment.by}
                          </span>
                          {getCommentAuthorBadge(comment.by)}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {formatDate(comment.dateTime)}
                          </span>
                          {comment.by === "Admin" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteComment(index)}
                              className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-card-foreground whitespace-pre-wrap">
                        {comment.message}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 border border-border rounded-lg bg-background">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No comments yet</p>
                  <p className="text-sm text-muted-foreground mt-1">Add the first comment to start the conversation</p>
                </div>
              )}

              {/* Add Comment Section */}
              <div className="space-y-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-card-foreground">
                    Add Comment
                  </label>
                  <Textarea
                    placeholder="Add a comment or update for the user..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={3}
                    className="border-border bg-background text-foreground resize-none"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={addComment}
                    disabled={addingComment || !newComment.trim()}
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    {addingComment ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                    {addingComment ? "Adding..." : "Add Comment"}
                  </Button>
                  {newComment && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setNewComment("")}
                      disabled={addingComment}
                    >
                      Clear
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Update Button */}
            <div className="flex justify-end pt-4 border-t border-border">
              <Button 
                onClick={handleStatusUpdate} 
                disabled={updating}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {updating ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    Updating...
                  </>
                ) : (
                  "Update Request"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Attachment */}
        {request.media_url && (
          <Card className="border-border bg-card">
            <CardHeader className="pb-4">
              <CardTitle className="text-card-foreground">Attachment</CardTitle>
              <CardDescription className="text-muted-foreground">
                Media file attached to this request
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-background">
                <div className="flex items-center space-x-3">
                  {getFileIcon(request.media_url)}
                  <div>
                    <p className="font-medium text-card-foreground">
                      {getFileName(request.media_url)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Click to download or view
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    onClick={handleDownloadMedia}
                    disabled={downloading}
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-2 border-border text-card-foreground hover:bg-accent hover:text-accent-foreground"
                  >
                    {downloading ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                    <span>{downloading ? "Downloading" : "Download"}</span>
                  </Button>
                  <Button
                    onClick={() => window.open(request.media_url, '_blank')}
                    variant="ghost"
                    size="sm"
                    className="text-card-foreground hover:bg-accent hover:text-accent-foreground"
                  >
                    View
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ServiceRequestDetailPage;