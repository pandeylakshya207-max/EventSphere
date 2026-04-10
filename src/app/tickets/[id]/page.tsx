"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import QRCode from "qrcode";
import { 
  CheckCircle2, Download, Share2, 
  Calendar, ArrowLeft, Zap 
} from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useEvents } from "@/lib/dummyHooks";
import { useAuth } from "@/components/auth-provider";

export default function TicketPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user: supabaseUser } = useAuth();
  const { getTicketById } = useEvents();
  const [ticket, setTicket] = useState<any>(null);
  const [qrUrl, setQrUrl] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const data = getTicketById(id as string);
    if (data) {
      setTicket({
          ...data,
          user: supabaseUser ? { 
            name: supabaseUser.user_metadata?.full_name || supabaseUser.email?.split("@")[0] 
          } : { name: "Attendee" }
      });
      generateQR(data.qrCode);
    }
    setLoading(false);
  }, [id, getTicketById, supabaseUser]);

  const generateQR = async (text: string) => {
    try {
      const url = await QRCode.toDataURL(text, {
        width: 256,
        margin: 1,
        color: { dark: "#8B5CF6", light: "#ffffff" },
      });
      setQrUrl(url);
    } catch (err) {
      console.error(err);
    }
  };

  const downloadTicket = async () => {
    const element = document.getElementById("ticket-view");
    if (!element) return;
    
    const canvas = await html2canvas(element, {
      backgroundColor: "#0F1115",
      scale: 2,
    });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Ticket-${id}.pdf`);
  };

  if (loading) return <div className="min-h-screen bg-dark-bg flex items-center justify-center"><Zap className="animate-spin text-brand-purple" size={48} /></div>;
  if (!ticket) return <div className="min-h-screen bg-dark-bg flex items-center justify-center text-white">Ticket not found</div>;

  return (
    <div className="min-h-screen bg-dark-bg flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="bg-glow" />

      <div className="max-w-md w-full relative z-10">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/30">
            <CheckCircle2 size={40} className="text-green-500" />
          </div>
          <h1 className="text-3xl font-black text-white">Booking Confirmed!</h1>
          <p className="text-gray-400">Your ticket is ready for the experience.</p>
        </div>

        <div id="ticket-view" className="bg-white rounded-[2rem] overflow-hidden shadow-2xl relative">
          <div className="bg-brand-purple p-8 text-white">
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-80 mb-1">Ticket Holder</div>
                <div className="text-lg font-bold">{ticket.user?.name || "Attendee"}</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-80 mb-1">Tier</div>
                <div className="text-lg font-bold">{ticket.tier?.name}</div>
              </div>
            </div>
            <h2 className="text-2xl font-black leading-tight mb-2">{ticket.event.title}</h2>
            <div className="flex items-center gap-2 text-sm opacity-80">
              <Calendar size={14} /> {new Date(ticket.event.date).toLocaleDateString()} • {ticket.event.time}
            </div>
          </div>

          <div className="flex items-center gap-4 px-1 -my-3 relative z-20">
            <div className="w-6 h-6 bg-dark-bg rounded-full -ml-3" />
            <div className="flex-grow border-b-2 border-dashed border-gray-200" />
            <div className="w-6 h-6 bg-dark-bg rounded-full -mr-3" />
          </div>

          <div className="bg-white p-8 pt-10 text-center text-black">
            {qrUrl ? (
              <img src={qrUrl} alt="Ticket QR Code" className="w-48 h-48 mx-auto mb-6 p-2 border-2 border-gray-100 rounded-2xl" />
            ) : (
              <div className="w-48 h-48 mx-auto mb-6 bg-gray-100 animate-pulse rounded-2xl" />
            )}
            
            <div className="text-[10px] uppercase tracking-[0.3em] font-black text-gray-400 mb-8">
              #{ticket.qrCode}
            </div>

            <div className="flex gap-4">
              <button 
                onClick={downloadTicket}
                className="flex-1 bg-gray-100 py-3 rounded-xl text-black font-bold text-sm flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
              >
                <Download size={18} /> Download
              </button>
              <button className="flex-1 border border-gray-100 py-3 rounded-xl text-black font-bold text-sm flex items-center justify-center gap-2">
                <Share2 size={18} /> Share
              </button>
            </div>
          </div>
        </div>

        <button 
          type="button"
          onClick={() => {
            if (window.history.length > 2) {
              router.back();
            } else {
              router.push("/events");
            }
          }}
          className="mt-8 flex items-center w-full justify-center gap-2 text-gray-500 hover:text-white transition-colors text-sm font-bold cursor-pointer"
        >
          <ArrowLeft size={16} /> Back to Events
        </button>
      </div>
    </div>
  );
}

