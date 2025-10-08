import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Calendar,
  Clock,
  Download,
  Eye,
  IndianRupee,
  Package,
  MessageSquare,
  Plus,
} from "lucide-react";
import { useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

interface Comment {
  message: string;
  dateTime: string;
  by: string;
}

interface ServiceRequest {
  id: number;
  service: {
    id: number;
    name: string;
    description: string;
  };
  plan: {
    plan: string;
    cost: number;
    discount: number;
    description?: string;
  };
  status:
    | "PENDING"
    | "APPROVED"
    | "IN_QUEUE"
    | "REJECTED"
    | "IN_PROGRESS"
    | "COMPLETED"
    | "CANCELLED";
  request_msg: {
    subject: string;
    body: string;
  };
  media_url: string | null;
  remark: string | null;
  requested_at: string;
  updated_at: string;
}

interface ServiceRequestsTabProps {
  serviceRequests: ServiceRequest[];
  onUpdateRequest: (updatedRequest: ServiceRequest) => void;
}

const ServiceRequestsTab: React.FC<ServiceRequestsTabProps> = ({
  serviceRequests,
  onUpdateRequest,
}) => {
  const { user } = useAuth();
  const [editingCommentRequestId, setEditingCommentRequestId] = useState<
    number | null
  >(null);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const parseComments = (remark: string | null): Comment[] => {
    if (!remark) return [];

    try {
      // Try to parse as JSON array first
      const parsed = JSON.parse(remark);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => ({
          message: item.message || item,
          dateTime: item.dateTime || new Date().toISOString(),
          by: item.by || "Admin",
        }));
      }
    } catch {
      // If parsing fails, treat as simple string message from admin
      return [
        {
          message: remark,
          dateTime: new Date().toISOString(),
          by: "Admin",
        },
      ];
    }

    return [];
  };

  const formatCommentsForStorage = (comments: Comment[]): string => {
    return JSON.stringify(comments);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: {
        variant: "secondary" as const,
        label: "Pending",
        color: "text-yellow-600 bg-yellow-100",
      },
      APPROVED: {
        variant: "default" as const,
        label: "Approved",
        color: "text-green-600 bg-green-100",
      },
      IN_QUEUE: {
        variant: "secondary" as const,
        label: "In Queue",
        color: "text-blue-600 bg-blue-100",
      },
      IN_PROGRESS: {
        variant: "default" as const,
        label: "In Progress",
        color: "text-blue-600 bg-blue-100",
      },
      COMPLETED: {
        variant: "default" as const,
        label: "Completed",
        color: "text-green-600 bg-green-100",
      },
      REJECTED: {
        variant: "destructive" as const,
        label: "Rejected",
        color: "text-red-600 bg-red-100",
      },
      CANCELLED: {
        variant: "destructive" as const,
        label: "Cancelled",
        color: "text-red-600 bg-red-100",
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      variant: "secondary",
      label: status,
      color: "text-gray-600 bg-gray-100",
    };
    return (
      <Badge variant={config.variant} className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const addComment = async (requestId: number) => {
    if (!newComment.trim()) return;

    setLoading(true);
    setError("");

    try {
      // Find the current request
      const currentRequest = serviceRequests.find(
        (req) => req.id === requestId
      );
      if (!currentRequest) return;

      // Parse existing comments
      const existingComments = parseComments(currentRequest.remark);

      // Add new comment
      const newCommentObj: Comment = {
        message: newComment.trim(),
        dateTime: new Date().toISOString(),
        by:
          `${user?.first_name || ""} ${user?.last_name || ""}`.trim() ||
          user?.username ||
          "User",
      };

      const updatedComments = [...existingComments, newCommentObj];
      const updatedRemark = formatCommentsForStorage(updatedComments);

      // Update the request via API
      await api.patch(`/services/requests/my-requests/${requestId}/update/`, {
        remark: updatedRemark,
      });

      // Fetch the updated request to get the latest data
      const updatedResponse = await api.get(
        `/services/requests/my-requests/${requestId}/`
      );

      // Update local state with the fresh data
      onUpdateRequest(updatedResponse.data);

      // Reset form
      setNewComment("");
      setEditingCommentRequestId(null);
    } catch (err: any) {
      setError(
        err.response?.data?.error || err.message || "Failed to add comment."
      );
    } finally {
      setLoading(false);
    }
  };

  const downloadPDFReceipt = async (request: ServiceRequest) => {
    try {
      const { jsPDF } = await import("jspdf");

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // Add header
      doc.setFontSize(20);
      doc.setTextColor(41, 128, 185);
      doc.text("I2EDC SERVICES", pageWidth / 2, 20, { align: "center" });

      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text("SERVICE REQUEST RECEIPT", pageWidth / 2, 30, {
        align: "center",
      });

      // Add receipt details
      doc.setFontSize(10);
      let yPosition = 50;

      const details = [
        `Receipt ID: SR-${request.id}`,
        `Date: ${formatDate(request.requested_at)}`,
        `Status: ${request.status}`,
        "",
        `Service: ${request.service.name}`,
        `Plan: ${request.plan.plan}`,
        `Original Cost: ₹${request.plan.cost}`,
        `Discount: ${request.plan.discount}%`,
        `Final Amount: ₹${
          request.plan.cost * (1 - request.plan.discount / 100)
        }`,
        "",
        `Subject: ${request.request_msg.subject}`,
        "Description:",
      ];

      details.forEach((line) => {
        if (yPosition > pageHeight - 50) {
          doc.addPage();
          yPosition = 20;
        }
        doc.text(line, 20, yPosition);
        yPosition += 6;
      });

      // Add description with word wrap
      const descriptionLines = doc.splitTextToSize(
        request.request_msg.body,
        pageWidth - 40
      );
      descriptionLines.forEach((line: string) => {
        if (yPosition > pageHeight - 50) {
          doc.addPage();
          yPosition = 20;
        }
        doc.text(line, 20, yPosition);
        yPosition += 6;
      });

      // Add comments if any
      const comments = parseComments(request.remark);
      if (comments.length > 0) {
        yPosition += 10;
        doc.text("Comments & Updates:", 20, yPosition);
        yPosition += 8;

        comments.forEach((comment, index) => {
          if (yPosition > pageHeight - 50) {
            doc.addPage();
            yPosition = 20;
          }

          const commentLines = doc.splitTextToSize(
            `${comment.by} (${formatDate(comment.dateTime)}): ${
              comment.message
            }`,
            pageWidth - 40
          );

          commentLines.forEach((line: string) => {
            if (yPosition > pageHeight - 50) {
              doc.addPage();
              yPosition = 20;
            }
            doc.text(line, 20, yPosition);
            yPosition += 6;
          });
          yPosition += 2;
        });
      }

      // Add footer
      yPosition += 10;
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(
        "Thank you for choosing I2EDC Services. For any queries, contact us at support@i2edc.com",
        pageWidth / 2,
        pageHeight - 10,
        { align: "center" }
      );

      // Save the PDF
      doc.save(`receipt-${request.id}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      downloadTextReceipt(request);
    }
  };

  const downloadTextReceipt = (request: ServiceRequest) => {
    const comments = parseComments(request.remark);
    const receiptContent = `
I2EDC SERVICES - SERVICE REQUEST RECEIPT
=========================================

Receipt ID: SR-${request.id}
Date: ${formatDate(request.requested_at)}
Status: ${request.status}

SERVICE DETAILS:
----------------
Service: ${request.service.name}
Plan: ${request.plan.plan}
Original Cost: ₹${request.plan.cost}
Discount: ${request.plan.discount}%
Final Amount: ₹${request.plan.cost * (1 - request.plan.discount / 100)}

REQUEST DETAILS:
----------------
Subject: ${request.request_msg.subject}
Description: ${request.request_msg.body}

${
  comments.length > 0
    ? `COMMENTS & UPDATES:\n-------------------\n${comments
        .map(
          (comment) =>
            `${comment.by} (${formatDate(comment.dateTime)}): ${
              comment.message
            }`
        )
        .join("\n\n")}`
    : ""
}

Thank you for choosing I2EDC Services.
For any queries, contact us at support@i2edc.com
        `.trim();

    const blob = new Blob([receiptContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `receipt-${request.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (serviceRequests.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Package className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
            No Service Requests
          </h3>
          <p className="text-gray-500 dark:text-gray-500 mb-4">
            You haven't made any service requests yet.
          </p>
          <a href="/pages/services">
            <Button>Browse Services</Button>
          </a>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {serviceRequests.map((request) => {
        const finalPrice =
          request.plan.cost * (1 - request.plan.discount / 100);
        const comments = parseComments(request.remark);

        return (
          <Card key={request.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl flex items-center gap-2">
                    {request.service.name}
                    {getStatusBadge(request.status)}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-2">
                    <Calendar className="w-4 h-4" />
                    Requested {formatDate(request.requested_at)}
                  </CardDescription>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-lg font-bold text-green-600">
                    <IndianRupee className="w-5 h-5" />
                    {finalPrice.toFixed(2)}
                  </div>
                  {request.plan.discount > 0 && (
                    <div className="text-sm text-gray-500 line-through">
                      ₹{request.plan.cost}
                    </div>
                  )}
                  <div className="text-sm text-gray-500">
                    {request.plan.plan} Plan
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-sm text-gray-500 mb-1">
                    Subject
                  </h4>
                  <p className="text-gray-900 dark:text-white">
                    {request.request_msg.subject}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-gray-500 mb-1">
                    Description
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 line-clamp-2">
                    {request.request_msg.body}
                  </p>
                </div>
              </div>

              {/* Comments Section */}
              {comments.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Comments & Updates ({comments.length})
                  </h4>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {comments.map((comment, index) => (
                      <div
                        key={index}
                        className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border"
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-medium text-sm text-gray-700 dark:text-gray-300">
                            {comment.by}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDate(comment.dateTime)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {comment.message}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add Comment Section */}
              <div className="mt-4">
                {editingCommentRequestId === request.id ? (
                  <div className="space-y-2">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add a comment or update..."
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => addComment(request.id)}
                        disabled={loading || !newComment.trim()}
                      >
                        {loading ? "Adding..." : "Add Comment"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingCommentRequestId(null);
                          setNewComment("");
                        }}
                        disabled={loading}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingCommentRequestId(request.id)}
                    className="flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Comment
                  </Button>
                )}
              </div>
            </CardContent>

            <CardFooter className="flex justify-between items-center pt-4 border-t">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                Last updated {formatDate(request.updated_at)}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadPDFReceipt(request)}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const comments = parseComments(request.remark);
                    const commentsText =
                      comments.length > 0
                        ? `\n\nComments:\n${comments
                            .map(
                              (comment) =>
                                `- ${comment.by} (${formatDate(
                                  comment.dateTime
                                )}): ${comment.message}`
                            )
                            .join("\n")}`
                        : "";

                    alert(
                      `Service Request Details:\n\nSubject: ${
                        request.request_msg.subject
                      }\nDescription: ${request.request_msg.body}\nStatus: ${
                        request.status
                      }\nPlan: ${request.plan.plan}\nCost: ₹${
                        request.plan.cost
                      }\nDiscount: ${
                        request.plan.discount
                      }%\nFinal Amount: ₹${finalPrice.toFixed(
                        2
                      )}${commentsText}`
                    );
                  }}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </Button>
              </div>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
};

export default ServiceRequestsTab;
