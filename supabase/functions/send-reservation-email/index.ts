
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

// Get API key from environment variable
const resendApiKey = Deno.env.get("RESEND_API_KEY");
if (!resendApiKey) {
  console.error("Missing RESEND_API_KEY environment variable");
}

const resend = new Resend(resendApiKey);

// CORS headers for browser requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  name: string;
  email: string;
  date: string;
  time: string;
  guests: number;
  status: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Received request to send-reservation-email function");
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log("Handling OPTIONS request");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY not configured. Please set this in Supabase secrets.");
    }

    const { name, email, date, time, guests, status }: EmailRequest = await req.json();
    
    console.log(`Preparing to send email to ${email} for reservation on ${date} with status ${status}`);

    // Format the date nicely (assuming date is in format YYYY-MM-DD)
    const formatDate = (dateStr: string): string => {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      }).format(date);
    };

    // Status-specific messages
    let statusMessage = "";
    let statusColor = "#4caf50";
    let subject = "";

    switch (status.toLowerCase()) {
      case "confirmed":
        subject = "Your Reservation is Confirmed! ✅";
        statusMessage = "Your reservation has been confirmed. We look forward to serving you!";
        statusColor = "#4caf50"; // Green
        break;
      case "pending":
        subject = "Your Reservation is Pending 🕒";
        statusMessage = "Your reservation is pending confirmation. We'll notify you once it's confirmed.";
        statusColor = "#ff9800"; // Orange
        break;
      case "cancelled":
        subject = "Your Reservation has been Cancelled ❌";
        statusMessage = "Your reservation has been cancelled. We hope to serve you another time.";
        statusColor = "#f44336"; // Red
        break;
      case "completed":
        subject = "Thank You for Dining With Us! 🍽️";
        statusMessage = "Thank you for dining with us! We hope you enjoyed your experience.";
        statusColor = "#2196f3"; // Blue
        break;
      default:
        subject = "Reservation Update";
        statusMessage = `Your reservation status has been updated to: ${status}`;
        statusColor = "#757575"; // Grey
    }

    // Enhanced HTML email template with responsive design
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${subject}</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              border-radius: 10px;
              overflow: hidden;
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            }
            .header {
              background-color: #222;
              color: white;
              padding: 20px;
              text-align: center;
            }
            .content {
              background-color: #fff;
              padding: 30px;
            }
            .reservation-details {
              background-color: #f9f9f9;
              padding: 20px;
              border-radius: 8px;
              margin-top: 20px;
            }
            .status-badge {
              display: inline-block;
              padding: 8px 16px;
              background-color: ${statusColor};
              color: white;
              border-radius: 20px;
              font-weight: bold;
              margin-top: 10px;
            }
            .details-row {
              display: flex;
              margin-bottom: 10px;
              border-bottom: 1px solid #eee;
              padding-bottom: 10px;
            }
            .details-label {
              font-weight: bold;
              width: 40%;
            }
            .details-value {
              width: 60%;
            }
            .footer {
              background-color: #f5f5f5;
              text-align: center;
              padding: 15px;
              font-size: 12px;
              color: #666;
            }
            @media only screen and (max-width: 480px) {
              body { padding: 10px; }
              .content { padding: 15px; }
              .details-row { flex-direction: column; }
              .details-label, .details-value { width: 100%; }
              .details-value { margin-top: 5px; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Reservation Update</h1>
            </div>
            <div class="content">
              <p>Dear ${name},</p>
              
              <p>${statusMessage}</p>
              
              <div class="status-badge">${status.toUpperCase()}</div>
              
              <div class="reservation-details">
                <h3>Reservation Details</h3>
                
                <div class="details-row">
                  <div class="details-label">Date:</div>
                  <div class="details-value">${formatDate(date)}</div>
                </div>
                
                <div class="details-row">
                  <div class="details-label">Time:</div>
                  <div class="details-value">${time}</div>
                </div>
                
                <div class="details-row">
                  <div class="details-label">Party Size:</div>
                  <div class="details-value">${guests} ${guests > 1 ? 'people' : 'person'}</div>
                </div>
              </div>
              
              <p style="margin-top: 20px;">If you have any questions or need to make changes to your reservation, please don't hesitate to contact us.</p>
              
              <p>Thank you for choosing our restaurant!</p>
              
              <p>Warm regards,<br>The Restaurant Team</p>
            </div>
            <div class="footer">
              <p>This is an automated message, please do not reply to this email.</p>
              <p>© ${new Date().getFullYear()} All Rights Reserved</p>
            </div>
          </div>
        </body>
      </html>
    `;

    console.log("Sending email...");
    
    const emailResponse = await resend.emails.send({
      from: "Restaurant <onboarding@resend.dev>",
      to: [email],
      subject: subject,
      html: htmlContent,
    });

    console.log("Email response:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { 
        "Content-Type": "application/json",
        ...corsHeaders
      },
    });
  } catch (error) {
    console.error("Email sending error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error"
      }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders
        },
      }
    );
  }
};

console.log("Starting send-reservation-email function service");
serve(handler);
