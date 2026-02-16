'use client';

import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Loader2, Lock } from "lucide-react";
import { createStripePaymentIntent } from "@/app/actions/payment";

function CheckoutForm({ amount, onSuccess }: { amount: number, onSuccess: (id: string) => void }) {
    const stripe = useStripe();
    const elements = useElements();
    const [message, setMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!stripe) return;

        const clientSecret = new URLSearchParams(window.location.search).get(
            "payment_intent_client_secret"
        );

        if (!clientSecret) return;

        stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
            switch (paymentIntent?.status) {
                case "succeeded":
                    setMessage("Payment succeeded!");
                    onSuccess(paymentIntent.id);
                    break;
                case "processing":
                case "processing":
                    setMessage("Your payment is processing.");
                    break;
                case "requires_payment_method":
                    setMessage("Your payment was not successful, please try again.");
                    break;
                default:
                    setMessage("Something went wrong.");
                    break;
            }
        });
    }, [stripe]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) return;

        setIsLoading(true);

        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                // Return to the same page
                return_url: window.location.href,
            },
            redirect: 'if_required'
        });

        if (error) {
            if (error.type === "card_error" || error.type === "validation_error") {
                setMessage(error.message || "An unexpected error occurred.");
            } else {
                setMessage("An unexpected error occurred.");
            }
        } else if (paymentIntent && paymentIntent.status === 'succeeded') {
            // Payment succeeded without redirect (e.g. standard card)
            setMessage("Payment succeeded!");
            onSuccess(paymentIntent.id);
        } else {
            setMessage("Payment status unknown.");
        }

        setIsLoading(false);
    };

    return (
        <form id="payment-form" onSubmit={handleSubmit} className="space-y-6">
            <PaymentElement id="payment-element" options={{ layout: "tabs" }} />

            {message && <div id="payment-message" className="text-red-600 text-sm bg-red-50 p-3 rounded-md">{message}</div>}

            <Button disabled={isLoading || !stripe || !elements} id="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 h-11">
                <span id="button-text">
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <div className="flex items-center gap-2"><Lock className="h-4 w-4" /> Pay ฿{amount.toLocaleString()}</div>}
                </span>
            </Button>
        </form>
    );
}

export function StripePaymentForm({ amount, registrationId, onSuccess }: { amount: number, registrationId: number, onSuccess: (id: string) => void }) {
    const [clientSecret, setClientSecret] = useState("");
    const [stripePromise, setStripePromise] = useState<any>(null);

    useEffect(() => {
        createStripePaymentIntent(amount, registrationId).then((data) => {
            if (data.error) {
                console.error(data.error);
                return;
            }
            if (data.clientSecret && data.publicKey) {
                setClientSecret(data.clientSecret);
                setStripePromise(loadStripe(data.publicKey));
            }
        });
    }, [amount, registrationId]);

    const appearance = {
        theme: 'stripe' as const,
        variables: {
            colorPrimary: '#4f46e5',
        },
    };
    const options = {
        clientSecret,
        appearance,
    };

    return (
        <div className="p-1">
            {clientSecret && stripePromise ? (
                <Elements options={options} stripe={stripePromise}>
                    <CheckoutForm amount={amount} onSuccess={onSuccess} />
                </Elements>
            ) : (
                <div className="flex justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                </div>
            )}
        </div>
    );
}
