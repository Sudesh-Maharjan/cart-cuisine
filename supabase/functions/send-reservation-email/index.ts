
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ReservationEmailRequest {
  name: string;
  email: string;
  date: string;
  time: string;
  guests: number;
  status: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Received email request");
    const { name, email, date, time, guests, status }: ReservationEmailRequest = await req.json();
    
    if (!email) {
      throw new Error("Email is required");
    }

    // Format date for display
    const formattedDate = new Date(date).toLocaleDateString('en-UK', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const statusText = status === 'confirmed' 
      ? 'Your reservation has been confirmed!' 
      : status === 'cancelled' 
        ? 'Your reservation has been cancelled.' 
        : 'The status of your reservation has been updated.';

    const emailResponse = await resend.emails.send({
      from: "Restaurant <onboarding@resend.dev>",
      to: [email],
      subject: `Reservation ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h1 style="color: #4f46e5; text-align: center;">${statusText}</h1>
          
          <div style="background-color: #f9fafb; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h2 style="margin-top: 0; color: #374151;">Reservation Details</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Date:</strong> ${formattedDate}</p>
            <p><strong>Time:</strong> ${time}</p>
            <p><strong>Number of Guests:</strong> ${guests}</p>
            <p><strong>Status:</strong> <span style="text-transform: capitalize; ${
              status === 'confirmed' ? 'color: #059669;' : 
              status === 'cancelled' ? 'color: #dc2626;' : 
              'color: #d97706;'
            }">${status}</span></p>
          </div>
          
          <p>If you have any questions or need to make changes to your reservation, please don't hesitate to contact us.</p>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
            <p style="color: #6b7280; font-size: 14px;">Thank you for choosing our restaurant!</p>
          </div>
        </div>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-reservation-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
