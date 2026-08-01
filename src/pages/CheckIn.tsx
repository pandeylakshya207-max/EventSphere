import { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import * as api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Registration } from '../types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Loader2, ScanLine } from 'lucide-react';
import { toast } from 'sonner';

export default function CheckIn() {
  const { isOrganizer } = useAuth();
  const [scanning, setScanning] = useState(true);
  const [result, setResult] = useState<Registration | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOrganizer) return;

    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false
    );

    scanner.render(onScanSuccess, () => {});

    function onScanSuccess(decodedText: string) {
      // decodedText is the registration ID encoded in the QR code
      handleCheckIn(decodedText);
      scanner.clear();
      setScanning(false);
    }

    return () => {
      scanner.clear().catch(error => console.error("Failed to clear scanner", error));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOrganizer]);

  const handleCheckIn = async (registrationId: string) => {
    setLoading(true);
    try {
      // The backend enforces that the organizer actually owns the event
      // this registration belongs to -- a malicious or mistaken scan of
      // someone else's ticket is rejected server-side with a 403, not just
      // hidden by the UI.
      const updated = await api.checkInRegistration(registrationId);
      setResult(updated);
      toast.success("Checked in successfully!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to check in");
      setScanning(true);
    } finally {
      setLoading(false);
    }
  };

  if (!isOrganizer) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-display mb-4">Access Denied</h1>
        <p className="text-white/60">Only organizers can access this page.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
          <ScanLine className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-display">Event Check-in</h1>
          <p className="text-white/60 text-sm">Scan attendee QR codes to verify tickets</p>
        </div>
      </div>

      <div className="space-y-6">
        {scanning ? (
          <Card className="glass-card overflow-hidden border-white/10">
            <CardContent className="p-0">
              <div id="reader" className="w-full"></div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {result && (
              <Card className="glass-card border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Ticket Details</span>
                    {!!result.checked_in ? (
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30 gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Checked In
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-white/40 border-white/10">
                        Pending
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-white/40 uppercase tracking-wider">Attendee</p>
                      <p className="font-medium">{result.user_name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-white/40 uppercase tracking-wider">Event</p>
                      <p className="font-medium">{result.event_title}</p>
                    </div>
                    <div>
                      <p className="text-xs text-white/40 uppercase tracking-wider">Tickets</p>
                      <p className="font-medium">{result.ticket_count}</p>
                    </div>
                    <div>
                      <p className="text-xs text-white/40 uppercase tracking-wider">Email</p>
                      <p className="font-medium text-sm truncate">{result.user_email}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Button
              onClick={() => {
                setResult(null);
                setScanning(true);
              }}
              className="w-full premium-button"
            >
              Scan Next Ticket
            </Button>
          </div>
        )}

        {loading && (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-white/20" />
          </div>
        )}
      </div>
    </div>
  );
}
