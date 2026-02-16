'use server';

import { getSystemSettings } from "./settings";
import { query } from "@/lib/db";
import { revalidatePath } from "next/cache";

interface OmiseSourceResponse {
    object: string;
    id: string;
    livemode: boolean;
    location: string;
    amount: number;
    currency: string;
    flow: string;
    type: string;
    charge_status: string;
    scannable_code?: {
        image: {
            download_uri: string;
        }
    };
    created_at: string;
}

interface OmiseChargeResponse {
    object: string;
    id: string;
    status: string;
    amount: number;
    currency: string;
    source: OmiseSourceResponse;
    authorize_uri: string;
    return_uri: string;
}

// Stripe Types
import Stripe from 'stripe';

export async function createStripePaymentIntent(amount: number, registrationId: number) {
    try {
        const settings = await getSystemSettings();
        if (!settings.stripe_secret_key) {
            return { error: 'Stripe secret key is not configured.' };
        }

        const stripe = new Stripe(settings.stripe_secret_key);

        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount * 100, // Amount in cents
            currency: (settings.payment_currency || 'thb').toLowerCase(),
            automatic_payment_methods: {
                enabled: true,
            },
            metadata: {
                registration_id: registrationId.toString(),
                type: 'conference_registration'
            }
        });

        return {
            clientSecret: paymentIntent.client_secret,
            publicKey: settings.stripe_publishable_key
        };

    } catch (error: any) {
        console.error('Create Stripe PaymentIntent Error:', error);
        return { error: `Failed to initialize Stripe payment: ${error.message}` };
    }
}

export async function createOmisePromptPayCharge(amount: number, registrationId: number) {
    try {
        const settings = await getSystemSettings();
        if (!settings.omise_secret_key) {
            return { error: 'Omise secret key is not configured.' };
        }

        const secretKey = settings.omise_secret_key;

        // 1. Create a Source for PromptPay
        const sourceResponse = await fetch('https://api.omise.co/sources', {
            method: 'POST',
            headers: {
                'Authorization': 'Basic ' + Buffer.from(secretKey + ':').toString('base64'),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                amount: amount * 100, // Amount in satang (THB cents)
                currency: 'thb',
                type: 'promptpay'
            })
        });

        if (!sourceResponse.ok) {
            const err = await sourceResponse.json();
            console.error('Omise Source Error:', err);
            return { error: 'Failed to create payment source: ' + (err.message || sourceResponse.statusText) };
        }

        const sourceData = await sourceResponse.json() as OmiseSourceResponse;

        // 2. Create a Charge using the Source
        // We set return_uri to the registration page (though for PromptPay it's less critical as it's a background scan, but good practice)
        // We'll calculate the return URL dynamically or assume a pattern
        const returnUri = process.env.NEXT_PUBLIC_BASE_URL
            ? `${process.env.NEXT_PUBLIC_BASE_URL}/register-conference/${registrationId}`
            : `http://localhost:3000/register-conference/${registrationId}`;

        const chargeResponse = await fetch('https://api.omise.co/charges', {
            method: 'POST',
            headers: {
                'Authorization': 'Basic ' + Buffer.from(secretKey + ':').toString('base64'),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                amount: amount * 100,
                currency: 'thb',
                return_uri: returnUri,
                source: sourceData.id,
                description: `Registration #${registrationId}`,
                metadata: {
                    registration_id: registrationId
                }
            })
        });

        if (!chargeResponse.ok) {
            const err = await chargeResponse.json();
            console.error('Omise Charge Error:', err);
            return { error: 'Failed to create charge: ' + (err.message || chargeResponse.statusText) };
        }

        const chargeData = await chargeResponse.json() as OmiseChargeResponse;

        // Save charge ID to registration for later reference?
        // Ideally we should have a payments table, but for now we can maybe just log it or rely on the metadata
        // Or update the registration with a payment_intent_id if we had that column. 
        // For now, we return the data needed for the frontend to show the QR.

        return {
            success: true,
            chargeId: chargeData.id,
            qrImage: chargeData.source.scannable_code?.image.download_uri
        };

    } catch (error) {
        console.error('Create PromptPay Charge Error:', error);
        return { error: 'Internal server error processing payment.' };
    }

}

export async function createOmiseTrueMoneyCharge(amount: number, phoneNumber: string, registrationId: number) {
    try {
        const settings = await getSystemSettings();
        if (!settings.omise_secret_key) {
            return { error: 'Omise secret key is not configured.' };
        }

        const secretKey = settings.omise_secret_key;

        // 1. Create a Source for TrueMoney
        // Note: Omise require phone number for TrueMoney
        const sourceResponse = await fetch('https://api.omise.co/sources', {
            method: 'POST',
            headers: {
                'Authorization': 'Basic ' + Buffer.from(secretKey + ':').toString('base64'),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                amount: amount * 100,
                currency: 'thb',
                type: 'truemoney',
                phone_number: phoneNumber
            })
        });

        if (!sourceResponse.ok) {
            const err = await sourceResponse.json();
            console.error('Omise Source Error:', err);
            return { error: 'Failed to create payment source: ' + (err.message || sourceResponse.statusText) };
        }

        const sourceData = await sourceResponse.json() as OmiseSourceResponse;

        // 2. Create a Charge
        const returnUri = process.env.NEXT_PUBLIC_BASE_URL
            ? `${process.env.NEXT_PUBLIC_BASE_URL}/register-conference/${registrationId}`
            : `http://localhost:3000/register-conference/${registrationId}`;

        const chargeResponse = await fetch('https://api.omise.co/charges', {
            method: 'POST',
            headers: {
                'Authorization': 'Basic ' + Buffer.from(secretKey + ':').toString('base64'),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                amount: amount * 100,
                currency: 'thb',
                return_uri: returnUri,
                source: sourceData.id,
                description: `Registration #${registrationId} (TrueMoney)`,
                metadata: {
                    registration_id: registrationId
                }
            })
        });

        if (!chargeResponse.ok) {
            const err = await chargeResponse.json();
            console.error('Omise Charge Error:', err);
            return { error: 'Failed to create charge: ' + (err.message || chargeResponse.statusText) };
        }

        const chargeData = await chargeResponse.json() as OmiseChargeResponse;

        return {
            success: true,
            chargeId: chargeData.id,
            authorizeUri: chargeData.authorize_uri,
            status: chargeData.status
        };

    } catch (error) {
        console.error('Create TrueMoney Charge Error:', error);
        return { error: 'Internal server error processing payment.' };
    }
}

export async function checkOmisePaymentStatus(chargeId: string, registrationId: number) {
    try {
        const settings = await getSystemSettings();
        if (!settings.omise_secret_key) return { status: 'unknown' };

        const response = await fetch(`https://api.omise.co/charges/${chargeId}`, {
            headers: {
                'Authorization': 'Basic ' + Buffer.from(settings.omise_secret_key + ':').toString('base64')
            }
        });

        if (!response.ok) return { status: 'error' };

        const charge = await response.json();

        if (charge.status === 'successful') {
            // Update registration status in DB
            await query(
                'UPDATE registrations SET status = ?, updated_at = NOW() WHERE id = ?',
                ['paid', registrationId]
            );

            revalidatePath(`/register-conference/${registrationId}`); // Assuming this is the path
            return { status: 'successful' };
        } else if (charge.status === 'failed') {
            return { status: 'failed', message: charge.failure_message };
        }

        return { status: 'pending' };

    } catch (error) {
        console.error('Check Status Error:', error);
        return { status: 'error' };
    }
}

export async function verifyStripePayment(paymentIntentId: string, registrationId: number) {
    try {
        const settings = await getSystemSettings();
        if (!settings.stripe_secret_key) return { error: 'Configuration error' };

        const stripe = new Stripe(settings.stripe_secret_key);
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        if (paymentIntent.status === 'succeeded') {
            // Update registration status in DB
            await query(
                'UPDATE registrations SET status = ?, updated_at = NOW() WHERE id = ?',
                ['paid', registrationId]
            );
            revalidatePath(`/register-conference/${registrationId}`);
            return { success: true };
        }

        return { success: false, status: paymentIntent.status };

    } catch (error) {
        console.error('Verify Stripe Error:', error);
        return { error: 'Verification failed' };
    }
}
