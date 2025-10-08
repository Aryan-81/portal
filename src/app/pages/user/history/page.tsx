"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Users, AlertCircle } from "lucide-react";
import ServiceRequestsTab from "./ServiceRequestsTab";
import EventsTab from "./EventsTab";

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

interface Event {
  id: number;
  name: string;
  date: string;
  duration: string;
  description: string;
  long_description: string;
  media: string | null;
  media_url: string;
  participants: number[];
  participants_usernames: string[];
  admin: number;
  reg_end_date: string;
}

interface EventParticipation {
  is_participating: boolean;
}

const HistoryPage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [eventParticipations, setEventParticipations] = useState<
    Record<number, EventParticipation>
  >({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("services");

  useEffect(() => {
    if (isAuthenticated) {
      fetchHistory();
    }
  }, [isAuthenticated]);

  const fetchHistory = async () => {
    try {
      setLoading(true);

      // Fetch service requests
      const serviceResponse = await api.get<ServiceRequest[]>(
        "/services/requests/my-requests/"
      );
      setServiceRequests(serviceResponse.data);

      // Fetch events and check participation
      await fetchEventsWithParticipation();

      setError("");
    } catch (err: any) {
      setError(
        err.response?.data?.error || err.message || "Failed to load history."
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchEventsWithParticipation = async () => {
    try {
      const participatingEvents: Event[] = [];
      const participationMap: Record<number, EventParticipation> = {};

      const eventsListResponse = await api.get<Event[]>("/events/list/");
      const allEvents = eventsListResponse.data;

      for (const event of allEvents) {
        try {
          const participationResponse = await api.get<EventParticipation>(
            `/events/events/${event.id}/participants/me/`
          );

          if (participationResponse.data.is_participating) {
            const eventDetailResponse = await api.get<Event>(
              `/events/retrieve/${event.id}/`
            );
            participatingEvents.push(eventDetailResponse.data);
            participationMap[event.id] = participationResponse.data;
          }
        } catch (error) {
          console.log(
            `User is not participating in event ${event.id} or event not found`
          );
        }
      }

      setEvents(participatingEvents);
      setEventParticipations(participationMap);
    } catch (error) {
      console.error("Error fetching events:", error);
      setEvents([]);
      setEventParticipations({});
    }
  };
  const handleUpdateServiceRequest = (updatedRequest: ServiceRequest) => {
    setServiceRequests((prev) =>
      prev.map((req) => (req.id === updatedRequest.id ? updatedRequest : req))
    );
  };

  // Get events where user is participating
  const getParticipatingEvents = (): Event[] => {
    return events.filter(
      (event) => eventParticipations[event.id]?.is_participating
    );
  };

  const getEventStatus = (event: Event): string => {
    const now = new Date();
    const eventDate = new Date(event.date);
    const regEndDate = new Date(event.reg_end_date);

    if (now > eventDate) return "COMPLETED";
    if (now > regEndDate) return "REGISTRATION_CLOSED";
    if (now >= new Date(eventDate.getTime() - 24 * 60 * 60 * 1000))
      return "UPCOMING_SOON";
    return "UPCOMING";
  };

  const participatingEvents = getParticipatingEvents();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-slate-900 dark:to-blue-900/20 mt-24">
        <div className="max-w-4xl mx-auto p-8">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Authentication Required</AlertTitle>
            <AlertDescription>
              Please log in to view your history.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-slate-900 dark:to-blue-900/20 mt-24">
        <div className="max-w-6xl mx-auto p-8">
          <div className="space-y-8">
            <Skeleton className="h-12 w-64" />
            <Skeleton className="h-10 w-full" />
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-slate-900 dark:to-blue-900/20 mt-24">
      <div className="max-w-6xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            My History
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            View your service requests and event registrations
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="services" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Service Requests ({serviceRequests.length})
            </TabsTrigger>
            <TabsTrigger value="events" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Event Registrations ({participatingEvents.length})
            </TabsTrigger>
          </TabsList>

          {/* Service Requests Tab */}
          <TabsContent value="services">
            <ServiceRequestsTab
              serviceRequests={serviceRequests}
              onUpdateRequest={handleUpdateServiceRequest}
            />
          </TabsContent>

          {/* Event Registrations Tab */}
          <TabsContent value="events">
            <EventsTab events={participatingEvents} />
          </TabsContent>
        </Tabs>

        {/* Statistics Summary */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {serviceRequests.length}
                </div>
                <div className="text-sm text-blue-600">Service Requests</div>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {
                    serviceRequests.filter((r) => r.status === "COMPLETED")
                      .length
                  }
                </div>
                <div className="text-sm text-green-600">Completed Services</div>
              </div>
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {participatingEvents.length}
                </div>
                <div className="text-sm text-purple-600">
                  Event Registrations
                </div>
              </div>
              <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {
                    participatingEvents.filter(
                      (e) => getEventStatus(e) === "COMPLETED"
                    ).length
                  }
                </div>
                <div className="text-sm text-orange-600">Events Attended</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HistoryPage;
