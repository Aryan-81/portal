import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Download, Eye, User, Users } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

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

interface EventsTabProps {
    events: Event[];
}

const EventsTab: React.FC<EventsTabProps> = ({ events }) => {
    const { user } = useAuth();

    const getEventStatus = (event: Event): string => {
        const now = new Date();
        const eventDate = new Date(event.date);
        const regEndDate = new Date(event.reg_end_date);
        
        if (now > eventDate) return 'COMPLETED';
        if (now > regEndDate) return 'REGISTRATION_CLOSED';
        if (now >= new Date(eventDate.getTime() - 24 * 60 * 60 * 1000)) return 'UPCOMING_SOON';
        return 'UPCOMING';
    };

    const getEventStatusBadge = (event: Event) => {
        const status = getEventStatus(event);
        const statusConfig = {
            COMPLETED: { variant: 'default' as const, label: 'Completed', color: 'text-gray-600 bg-gray-100' },
            REGISTRATION_CLOSED: { variant: 'secondary' as const, label: 'Registration Closed', color: 'text-orange-600 bg-orange-100' },
            UPCOMING_SOON: { variant: 'default' as const, label: 'Upcoming Soon', color: 'text-blue-600 bg-blue-100' },
            UPCOMING: { variant: 'secondary' as const, label: 'Upcoming', color: 'text-green-600 bg-green-100' },
        };

        const config = statusConfig[status as keyof typeof statusConfig] || { variant: 'secondary', label: status, color: 'text-gray-600 bg-gray-100' };
        return <Badge variant={config.variant} className={config.color}>{config.label}</Badge>;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatEventDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const downloadEventTicket = async (event: Event) => {
        try {
            const { jsPDF } = await import('jspdf');
            
            const doc = new jsPDF();
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            
            // Add header
            doc.setFontSize(20);
            doc.setTextColor(41, 128, 185);
            doc.text('I2EDC EVENTS', pageWidth / 2, 20, { align: 'center' });
            
            doc.setFontSize(16);
            doc.setTextColor(0, 0, 0);
            doc.text('EVENT TICKET', pageWidth / 2, 30, { align: 'center' });
            
            // Add event details
            doc.setFontSize(10);
            let yPosition = 50;
            
            const details = [
                `Event: ${event.name}`,
                `Date: ${formatEventDate(event.date)}`,
                `Duration: ${event.duration}`,
                `Registration Ends: ${formatDate(event.reg_end_date)}`,
                `Ticket: E-${event.id}-${user?.id || 'USER'}`,
                `Status: ${getEventStatus(event)}`,
                '',
                'Participant Information:',
                `Name: ${user?.first_name || ''} ${user?.last_name || ''}`,
                `Email: ${user?.email || ''}`,
                `Username: ${user?.username || ''}`,
                '',
                'Event Description:',
            ];
            
            details.forEach(line => {
                if (yPosition > pageHeight - 50) {
                    doc.addPage();
                    yPosition = 20;
                }
                doc.text(line, 20, yPosition);
                yPosition += 6;
            });
            
            // Add description with word wrap
            const descriptionLines = doc.splitTextToSize(event.description, pageWidth - 40);
            descriptionLines.forEach((line: string) => {
                if (yPosition > pageHeight - 50) {
                    doc.addPage();
                    yPosition = 20;
                }
                doc.text(line, 20, yPosition);
                yPosition += 6;
            });
            
            // Add terms and conditions
            yPosition += 10;
            const terms = [
                'Terms & Conditions:',
                '- Please bring this ticket to the event',
                '- Ticket is non-transferable',
                '- Valid for the registered participant only',
                '- Registration ends on: ' + formatDate(event.reg_end_date)
            ];
            
            terms.forEach(line => {
                if (yPosition > pageHeight - 30) {
                    doc.addPage();
                    yPosition = 20;
                }
                doc.text(line, 20, yPosition);
                yPosition += 6;
            });
            
            // Add footer
            doc.setFontSize(8);
            doc.setTextColor(128, 128, 128);
            doc.text('Present this ticket at the event entrance for scanning • events@i2edc.com', 
                    pageWidth / 2, pageHeight - 10, { align: 'center' });
            
            // Save the PDF
            doc.save(`ticket-${event.id}.pdf`);
            
        } catch (error) {
            console.error('Error generating ticket PDF:', error);
            downloadTextTicket(event);
        }
    };

    const downloadTextTicket = (event: Event) => {
        const ticketContent = `
I2EDC EVENTS - EVENT TICKET
============================

Event: ${event.name}
Date: ${formatEventDate(event.date)}
Duration: ${event.duration}
Registration Ends: ${formatDate(event.reg_end_date)}
Ticket: E-${event.id}-${user?.id || 'USER'}
Status: ${getEventStatus(event)}

PARTICIPANT INFORMATION:
------------------------
Name: ${user?.first_name || ''} ${user?.last_name || ''}
Email: ${user?.email || ''}
Username: ${user?.username || ''}

EVENT DESCRIPTION:
------------------
${event.description}

IMPORTANT NOTES:
----------------
- Please bring this ticket to the event
- Ticket is non-transferable
- Valid for the registered participant only
- Registration ends on: ${formatDate(event.reg_end_date)}
- Present at event entrance for scanning

For queries: events@i2edc.com
        `.trim();

        const blob = new Blob([ticketContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ticket-${event.id}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    if (events.length === 0) {
        return (
            <Card>
                <CardContent className="p-8 text-center">
                    <Users className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                        No Event Registrations
                    </h3>
                    <p className="text-gray-500 dark:text-gray-500 mb-4">
                        You haven't registered for any events yet.
                    </p>
                    <a href="/pages/events">
                        <Button>
                            Browse Events
                        </Button>
                    </a>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            {events.map((event) => (
                <Card key={event.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="text-xl flex items-center gap-2">
                                    {event.name}
                                    {getEventStatusBadge(event)}
                                </CardTitle>
                                <CardDescription className="flex items-center gap-2 mt-2">
                                    <Calendar className="w-4 h-4" />
                                    {formatEventDate(event.date)}
                                </CardDescription>
                            </div>
                            <div className="text-right">
                                <div className="text-sm text-gray-500">
                                    {event.participants.length} participants
                                </div>
                                <div className="text-xs text-gray-400 mt-1">
                                    Reg ends: {formatDate(event.reg_end_date)}
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    
                    <CardContent className="pb-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <h4 className="font-semibold text-sm text-gray-500 mb-1 flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    Duration
                                </h4>
                                <p className="text-gray-900 dark:text-white">{event.duration}</p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-sm text-gray-500 mb-1">Description</h4>
                                <p className="text-gray-600 dark:text-gray-400">
                                    {event.description}
                                </p>
                            </div>
                        </div>                                            
                        <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <h4 className="font-semibold text-sm text-green-700 dark:text-green-300 mb-1">
                                Registration Information
                            </h4>
                            <p className="text-green-600 dark:text-green-400 text-sm">
                                Status: Registered • 
                                Participants: {event.participants.length} • 
                                Registration ends: {formatDate(event.reg_end_date)}
                            </p>
                        </div>
                    </CardContent>
                    
                    <CardFooter className="flex justify-between items-center pt-4 border-t">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <User className="w-4 h-4" />
                            Ticket: E-{event.id}-{user?.id || 'USER'}
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => downloadEventTicket(event)}
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Download Ticket
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    alert(`Event Details:\n\nName: ${event.name}\nDate: ${formatEventDate(event.date)}\nDuration: ${event.duration}\nStatus: ${getEventStatus(event)}\nParticipants: ${event.participants.length}\nRegistration Ends: ${formatDate(event.reg_end_date)}\nDescription: ${event.description}\n\nDetailed Info: ${event.long_description || 'No additional details'}`);
                                }}
                            >
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                            </Button>
                        </div>
                    </CardFooter>
                </Card>
            ))}
        </div>
    );
};

export default EventsTab;