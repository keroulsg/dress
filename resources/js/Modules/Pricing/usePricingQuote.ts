import axios from 'axios';
import { useCallback, useState } from 'react';

import type { PricingBreakdown } from '../../types/contracts';

export interface QuoteRequest {
    dressId: number;
    startDate: string;
    endDate: string;
    couponCode?: string | null;
    deliveryRequested?: boolean;
    deliveryCity?: string | null;
}

/** Fetches a server-side pricing quote for a dress rental window. */
export function usePricingQuote(): {
    quote: PricingBreakdown | null;
    loading: boolean;
    error: string | null;
    fetchQuote: (input: QuoteRequest) => Promise<PricingBreakdown | null>;
} {
    const [quote, setQuote] = useState<PricingBreakdown | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchQuote = useCallback(async (input: QuoteRequest): Promise<PricingBreakdown | null> => {
        setLoading(true);
        setError(null);

        try {
            const response = await axios.post<PricingBreakdown>('/api/pricing/quote', {
                dress_id: input.dressId,
                start_date: input.startDate,
                end_date: input.endDate,
                coupon_code: input.couponCode ?? null,
                delivery_requested: input.deliveryRequested ?? false,
                delivery_city: input.deliveryCity ?? null,
            });

            setQuote(response.data);
            return response.data;
        } catch (err: unknown) {
            let message = 'Unable to fetch pricing quote.';

            if (axios.isAxiosError<{ message?: string }>(err)) {
                message = err.response?.data?.message ?? message;
            }

            setError(message);
            setQuote(null);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    return { quote, loading, error, fetchQuote };
}