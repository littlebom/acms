'use server';

import { query } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export interface SystemSettings {
    badge_size: '8.6x5.4' | '5.4x8.6' | '8x12' | '12x8' | '9x13' | '13x9' | '10x14' | '14x10';
    badge_orientation?: 'portrait' | 'landscape';
    system_name?: string;
    description?: string;
    primary_color?: string;
    secondary_color?: string;
    logo_url?: string;
    // Contact & Social
    contact_phone?: string;
    contact_email?: string;
    contact_address?: string;
    contact_map_url?: string;
    social_facebook?: string;
    social_twitter?: string;
    social_linkedin?: string;
    social_youtube?: string;
    social_line?: string;
    social_whatsapp?: string;
    // SMTP Settings
    smtp_host?: string;
    smtp_port?: string;
    smtp_user?: string;
    smtp_password?: string;
    smtp_from_email?: string;
    smtp_from_name?: string;
    smtp_secure?: string;
    // Academic Settings
    academic_conference_name?: string;
    academic_submission_deadline?: Date;
    academic_review_deadline?: Date;
    academic_review_type?: 'single_blind' | 'double_blind' | 'open';
    show_proceedings_menu?: boolean;
    proceedings_title?: string;
    proceedings_description?: string;
    // Publisher / Metadata
    publisher_name?: string;
    publisher_address?: string;
    publication_issn?: string;
    publication_doi_prefix?: string;
    publication_license?: string;
    // Payment Gateway Settings
    omise_public_key?: string;
    omise_secret_key?: string;
    omise_enabled?: boolean;
    stripe_publishable_key?: string;
    stripe_secret_key?: string;
    stripe_enabled?: boolean;
    payment_currency?: string;
}

export async function getSystemSettings(): Promise<SystemSettings> {
    try {
        const results = await query(
            'SELECT * FROM system_settings WHERE id = 1'
        ) as any[];

        if (results.length > 0) {
            return {
                badge_size: results[0].badge_size || '8.6x5.4',
                badge_orientation: results[0].badge_orientation || 'landscape',
                system_name: results[0].system_name,
                description: results[0].description,
                primary_color: results[0].primary_color,
                secondary_color: results[0].secondary_color,
                logo_url: results[0].logo_url,
                // Contact & Social
                contact_phone: results[0].contact_phone || '',
                contact_email: results[0].contact_email || '',
                contact_address: results[0].contact_address || '',
                contact_map_url: results[0].contact_map_url || '',
                social_facebook: results[0].social_facebook || '',
                social_twitter: results[0].social_twitter || '',
                social_linkedin: results[0].social_linkedin || '',
                social_youtube: results[0].social_youtube || '',
                social_line: results[0].social_line || '',
                social_whatsapp: results[0].social_whatsapp || '',
                // SMTP Settings
                smtp_host: results[0].smtp_host || 'smtp.gmail.com',
                smtp_port: results[0].smtp_port || '587',
                smtp_user: results[0].smtp_user || '',
                smtp_password: results[0].smtp_password || '',
                smtp_from_email: results[0].smtp_from_email || '',
                smtp_from_name: results[0].smtp_from_name || 'ACMS Conference',

                smtp_secure: results[0].smtp_secure || 'tls',
                // Academic Settings
                academic_conference_name: results[0].academic_conference_name,
                academic_submission_deadline: results[0].academic_submission_deadline,
                academic_review_deadline: results[0].academic_review_deadline,
                academic_review_type: results[0].academic_review_type || 'double_blind',
                show_proceedings_menu: Number(results[0].show_proceedings_menu) === 1,
                proceedings_title: results[0].proceedings_title,
                proceedings_description: results[0].proceedings_description,
                // Publisher / Metadata
                publisher_name: results[0].publisher_name,
                publisher_address: results[0].publisher_address,
                publication_issn: results[0].publication_issn,
                publication_doi_prefix: results[0].publication_doi_prefix,
                publication_license: results[0].publication_license,
                // Payment Gateway Settings
                omise_public_key: results[0].omise_public_key || '',
                omise_secret_key: results[0].omise_secret_key || '',
                omise_enabled: results[0].omise_enabled || false,
                stripe_publishable_key: results[0].stripe_publishable_key || '',
                stripe_secret_key: results[0].stripe_secret_key || '',
                stripe_enabled: results[0].stripe_enabled || false,
                payment_currency: results[0].payment_currency || 'THB',
            };
        }
    } catch (error) {
        console.error('Error fetching system settings:', error);
    }

    // Return defaults if no settings found
    return {
        badge_size: '8.6x5.4',
        badge_orientation: 'landscape',
        system_name: 'ACMS 2025',
        description: 'Conference Management System',
        primary_color: '#2D4391',
        secondary_color: '#4FDB90',
        smtp_host: 'smtp.gmail.com',
        smtp_port: '587',
        smtp_user: '',
        smtp_password: '',
        smtp_from_email: '',
        smtp_from_name: 'ACMS Conference',

        smtp_secure: 'tls',
        academic_review_type: 'double_blind',
        show_proceedings_menu: false,
    };
}


export async function updateSystemSettings(settings: Partial<SystemSettings>): Promise<{ success: boolean; error?: string }> {
    try {
        // Check if settings exist
        const existing = await query('SELECT id FROM system_settings WHERE id = 1') as any[];

        if (existing.length > 0) {
            // Update existing
            await query(
                `UPDATE system_settings SET 
                    badge_size = ?,
                    badge_orientation = ?,
                    system_name = ?,
                    description = ?,
                    primary_color = ?,
                    secondary_color = ?,
                    logo_url = ?,
                    contact_phone = ?,
                    contact_email = ?,
                    contact_address = ?,
                    contact_map_url = ?,
                    social_facebook = ?,
                    social_twitter = ?,
                    social_linkedin = ?,
                    social_youtube = ?,
                    social_line = ?,
                    social_whatsapp = ?,
                    smtp_host = ?,
                    smtp_port = ?,
                    smtp_user = ?,
                    smtp_password = ?,
                    smtp_from_email = ?,
                    smtp_from_name = ?,
                    smtp_secure = ?,
                    academic_conference_name = ?,
                    academic_submission_deadline = ?,
                    academic_review_deadline = ?,
                    academic_review_type = ?,
                    show_proceedings_menu = ?,
                    proceedings_title = ?,
                    proceedings_description = ?,
                    publisher_name = ?,
                    publisher_address = ?,
                    publication_issn = ?,
                    publication_doi_prefix = ?,
                    publication_license = ?,
                    omise_public_key = ?,
                    omise_secret_key = ?,
                    omise_enabled = ?,
                    stripe_publishable_key = ?,
                    stripe_secret_key = ?,
                    stripe_enabled = ?,
                    payment_currency = ?
                WHERE id = 1`,
                [
                    settings.badge_size || '8.6x5.4',
                    settings.badge_orientation || 'landscape',
                    settings.system_name || null,
                    settings.description || null,
                    settings.primary_color || null,
                    settings.secondary_color || null,
                    settings.logo_url || null,
                    settings.contact_phone || null,
                    settings.contact_email || null,
                    settings.contact_address || null,
                    settings.contact_map_url || null,
                    settings.social_facebook || null,
                    settings.social_twitter || null,
                    settings.social_linkedin || null,
                    settings.social_youtube || null,
                    settings.social_line || null,
                    settings.social_whatsapp || null,
                    settings.smtp_host || 'smtp.gmail.com',
                    settings.smtp_port || '587',
                    settings.smtp_user || null,
                    settings.smtp_password || null,
                    settings.smtp_from_email || null,
                    settings.smtp_from_name || 'ACMS Conference',
                    settings.smtp_secure || 'tls',
                    settings.academic_conference_name || null,
                    settings.academic_submission_deadline || null,
                    settings.academic_review_deadline || null,
                    settings.academic_review_type || 'double_blind',
                    settings.show_proceedings_menu ?? false,
                    settings.proceedings_title || null,
                    settings.proceedings_description || null,
                    settings.publisher_name || null,
                    settings.publisher_address || null,
                    settings.publication_issn || null,
                    settings.publication_doi_prefix || null,
                    settings.publication_license || null,
                    settings.omise_public_key || null,
                    settings.omise_secret_key || null,
                    settings.omise_enabled || false,
                    settings.stripe_publishable_key || null,
                    settings.stripe_secret_key || null,
                    settings.stripe_enabled || false,
                    settings.payment_currency || 'THB',
                ]
            );
        } else {
            // Insert new
            await query(
                `INSERT INTO system_settings (id, badge_size, badge_orientation, system_name, description, primary_color, secondary_color, logo_url, 
                 contact_phone, contact_email, contact_address, contact_map_url, social_facebook, social_twitter, social_linkedin, social_youtube, social_line, social_whatsapp,
                 smtp_host, smtp_port, smtp_user, smtp_password, smtp_from_email, smtp_from_name, smtp_secure, 
                 academic_conference_name, academic_submission_deadline, academic_review_deadline, academic_review_type, show_proceedings_menu, proceedings_title, proceedings_description,
                 publisher_name, publisher_address, publication_issn, publication_doi_prefix, publication_license,
                 omise_public_key, omise_secret_key, omise_enabled, stripe_publishable_key, stripe_secret_key, stripe_enabled, payment_currency)
                 VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    settings.badge_size || '8.6x5.4',
                    settings.badge_orientation || 'landscape',
                    settings.system_name || null,
                    settings.description || null,
                    settings.primary_color || null,
                    settings.secondary_color || null,
                    settings.logo_url || null,
                    settings.contact_phone || null,
                    settings.contact_email || null,
                    settings.contact_address || null,
                    settings.contact_map_url || null,
                    settings.social_facebook || null,
                    settings.social_twitter || null,
                    settings.social_linkedin || null,
                    settings.social_youtube || null,
                    settings.social_line || null,
                    settings.social_whatsapp || null,
                    settings.smtp_host || 'smtp.gmail.com',
                    settings.smtp_port || '587',
                    settings.smtp_user || null,
                    settings.smtp_password || null,
                    settings.smtp_from_email || null,
                    settings.smtp_from_name || 'ACMS Conference',
                    settings.smtp_secure || 'tls',
                    settings.academic_conference_name || null,
                    settings.academic_submission_deadline || null,
                    settings.academic_review_deadline || null,
                    settings.academic_review_type || 'double_blind',
                    settings.show_proceedings_menu ?? false,
                    settings.proceedings_title || null,
                    settings.proceedings_description || null,
                    settings.publisher_name || null,
                    settings.publisher_address || null,
                    settings.publication_issn || null,
                    settings.publication_doi_prefix || null,
                    settings.publication_license || null,
                    settings.omise_public_key || null,
                    settings.omise_secret_key || null,
                    settings.omise_enabled || false,
                    settings.stripe_publishable_key || null,
                    settings.stripe_secret_key || null,
                    settings.stripe_enabled || false,
                    settings.payment_currency || 'THB',
                ]
            );
        }

        revalidatePath('/admin/system/setting');
        revalidatePath('/admin/conference/tickets');
        revalidatePath('/', 'layout');
        return { success: true };
    } catch (error) {
        console.error('Error updating system settings:', error);
        return { success: false, error: 'Failed to update settings' };
    }
}
