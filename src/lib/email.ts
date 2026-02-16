import nodemailer from 'nodemailer';
import { query } from '@/lib/db';

// Get SMTP settings from database
async function getSmtpSettings() {
    try {
        const results = await query('SELECT * FROM system_settings WHERE id = 1') as any[];
        if (results.length > 0) {
            return {
                host: results[0].smtp_host || 'smtp.gmail.com',
                port: results[0].smtp_port || '587',
                user: results[0].smtp_user || '',
                password: results[0].smtp_password || '',
                fromEmail: results[0].smtp_from_email || '',
                fromName: results[0].smtp_from_name || 'ACMS Conference',
                secure: results[0].smtp_secure || 'tls',
            };
        }
    } catch (error) {
        console.error('[Email] Error fetching SMTP settings:', error);
    }

    // Fallback to environment variables
    return {
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: process.env.SMTP_PORT || '587',
        user: process.env.SMTP_USER || '',
        password: process.env.SMTP_PASSWORD || '',
        fromEmail: process.env.SMTP_FROM || 'noreply@conference.com',
        fromName: process.env.APP_NAME || 'ACMS Conference',
        secure: 'tls',
    };
}

// Create transporter dynamically
function createTransporter(settings: Awaited<ReturnType<typeof getSmtpSettings>>) {
    return nodemailer.createTransport({
        host: settings.host,
        port: parseInt(settings.port),
        secure: settings.secure === 'ssl', // true for 465, false for other ports
        auth: {
            user: settings.user,
            pass: settings.password,
        },
    });
}

interface SendEmailParams {
    to: string;
    subject: string;
    html: string;
    text?: string;
}

export async function sendEmail({ to, subject, html, text }: SendEmailParams) {
    try {
        // Get SMTP settings from database
        const smtpSettings = await getSmtpSettings();

        // Check if email is configured
        if (!smtpSettings.user || !smtpSettings.password) {
            console.log('[Email] SMTP not configured. Skipping email send.');
            console.log('[Email] Would send to:', to);
            console.log('[Email] Subject:', subject);
            return { success: true, skipped: true };
        }

        // Create transporter with current settings
        const transporter = createTransporter(smtpSettings);

        const fromEmail = smtpSettings.fromEmail || smtpSettings.user;
        const fromName = smtpSettings.fromName;

        const info = await transporter.sendMail({
            from: `"${fromName}" <${fromEmail}>`,
            to,
            subject,
            text: text || html.replace(/<[^>]*>/g, ''),
            html,
        });

        console.log('[Email] Sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('[Email] Error sending email:', error);
        return { success: false, error };
    }
}

// =====================================================
// Email Templates
// =====================================================

export function paperSubmittedEmail(paperTitle: string, authorName: string, paperId: number) {
    return {
        subject: `Paper Submitted: ${paperTitle}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
                    <h1 style="color: white; margin: 0;">Paper Submitted Successfully</h1>
                </div>
                <div style="padding: 30px; background: #f8fafc;">
                    <p>Dear ${authorName},</p>
                    <p>Your paper has been successfully submitted for review.</p>
                    
                    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <p style="margin: 0; color: #666;">Paper ID</p>
                        <p style="margin: 5px 0; font-size: 18px; font-weight: bold;">#${paperId}</p>
                        <p style="margin: 15px 0 0; color: #666;">Title</p>
                        <p style="margin: 5px 0; font-size: 18px; font-weight: bold;">${paperTitle}</p>
                    </div>
                    
                    <p>You can track your submission status in the "My Submissions" section.</p>
                    <p>We will notify you once the review process is complete.</p>
                    
                    <p style="color: #666; font-size: 14px; margin-top: 30px;">
                        Best regards,<br>
                        The Conference Team
                    </p>
                </div>
            </div>
        `,
    };
}

export function reviewerAssignedEmail(reviewerName: string, paperTitle: string, dueDate?: Date) {
    const dueDateStr = dueDate ? new Date(dueDate).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
    }) : 'As soon as possible';

    return {
        subject: `New Review Assignment: ${paperTitle}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); padding: 30px; text-align: center;">
                    <h1 style="color: white; margin: 0;">New Review Assignment</h1>
                </div>
                <div style="padding: 30px; background: #f8fafc;">
                    <p>Dear ${reviewerName},</p>
                    <p>You have been assigned a new paper to review.</p>
                    
                    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <p style="margin: 0; color: #666;">Paper Title</p>
                        <p style="margin: 5px 0; font-size: 18px; font-weight: bold;">${paperTitle}</p>
                        <p style="margin: 15px 0 0; color: #666;">Due Date</p>
                        <p style="margin: 5px 0; font-size: 16px; color: #e53e3e;">${dueDateStr}</p>
                    </div>
                    
                    <p>Please log in to your reviewer dashboard to accept or decline this assignment.</p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reviewer/assignments" 
                           style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
                            View Assignment
                        </a>
                    </div>
                    
                    <p style="color: #666; font-size: 14px; margin-top: 30px;">
                        Best regards,<br>
                        The Conference Team
                    </p>
                </div>
            </div>
        `,
    };
}

export function paperDecisionEmail(
    authorName: string,
    paperTitle: string,
    decision: 'accepted' | 'rejected' | 'revision_required',
    comments?: string
) {
    const decisionConfig = {
        accepted: {
            title: 'Congratulations! Your Paper Has Been Accepted',
            color: '#38a169',
            message: 'We are pleased to inform you that your paper has been accepted for the conference.',
            action: 'Please submit your camera-ready version through the submission system.',
        },
        rejected: {
            title: 'Paper Decision: Not Accepted',
            color: '#e53e3e',
            message: 'After careful review, we regret to inform you that your paper has not been accepted.',
            action: 'We encourage you to consider the reviewers\' feedback for future submissions.',
        },
        revision_required: {
            title: 'Revision Required for Your Paper',
            color: '#dd6b20',
            message: 'Your paper requires revisions before a final decision can be made.',
            action: 'Please submit your revised paper through the submission system.',
        },
    };

    const config = decisionConfig[decision];

    return {
        subject: `Paper Decision: ${paperTitle}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: ${config.color}; padding: 30px; text-align: center;">
                    <h1 style="color: white; margin: 0;">${config.title}</h1>
                </div>
                <div style="padding: 30px; background: #f8fafc;">
                    <p>Dear ${authorName},</p>
                    <p>${config.message}</p>
                    
                    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <p style="margin: 0; color: #666;">Paper Title</p>
                        <p style="margin: 5px 0; font-size: 18px; font-weight: bold;">${paperTitle}</p>
                    </div>
                    
                    ${comments ? `
                    <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
                        <p style="margin: 0; font-weight: bold; color: #856404;">Editor's Comments:</p>
                        <p style="margin: 10px 0 0; color: #856404;">${comments}</p>
                    </div>
                    ` : ''}
                    
                    <p>${config.action}</p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/my-submissions" 
                           style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
                            View My Submissions
                        </a>
                    </div>
                    
                    <p style="color: #666; font-size: 14px; margin-top: 30px;">
                        Best regards,<br>
                        The Conference Team
                    </p>
                </div>
            </div>
        `,
    };
}

export function reviewCompletedEmail(editorName: string, paperTitle: string, paperId: number, reviewerName: string) {
    return {
        subject: `Review Completed: ${paperTitle}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
                    <h1 style="color: white; margin: 0;">Review Completed</h1>
                </div>
                <div style="padding: 30px; background: #f8fafc;">
                    <p>Dear ${editorName},</p>
                    <p>A review has been completed for the following paper:</p>
                    
                    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <p style="margin: 0; color: #666;">Paper Title</p>
                        <p style="margin: 5px 0; font-size: 18px; font-weight: bold;">${paperTitle}</p>
                        <p style="margin: 15px 0 0; color: #666;">Reviewed by</p>
                        <p style="margin: 5px 0;">${reviewerName}</p>
                    </div>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin/papers/${paperId}" 
                           style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
                            View Paper Details
                        </a>
                    </div>
                    
                    <p style="color: #666; font-size: 14px; margin-top: 30px;">
                        Best regards,<br>
                        The Conference System
                    </p>
                </div>
            </div>
        `,
    };
}
