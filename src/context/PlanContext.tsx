import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

export type Plan = 'free' | 'pro';

interface UserPlan {
  plan: Plan;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  subscription_status: string | null;
  current_period_end: string | null;
}

interface PlanContextValue {
  plan: Plan;
  eventCount: number;
  canCreateEvent: boolean;
  planLoading: boolean;
  currentPeriodEnd: string | null;
  subscriptionStatus: string | null;
  hasStripeCustomer: boolean;
  refreshPlan: () => Promise<void>;
}

const PlanContext = createContext<PlanContextValue | null>(null);

export function PlanProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [planData, setPlanData] = useState<UserPlan | null>(null);
  const [eventCount, setEventCount] = useState(0);
  const [planLoading, setPlanLoading] = useState(true);

  const loadPlan = useCallback(async () => {
    if (!user) {
      setPlanData(null);
      setEventCount(0);
      setPlanLoading(false);
      return;
    }

    setPlanLoading(true);

    const [planResult, countResult] = await Promise.all([
      supabase
        .from('user_plans')
        .select('plan, stripe_customer_id, stripe_subscription_id, subscription_status, current_period_end')
        .eq('user_id', user.id)
        .maybeSingle(),
      supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id),
    ]);

    if (planResult.data) {
      setPlanData(planResult.data as UserPlan);
    } else {
      // Auto-provision a free plan row if the trigger hasn't run yet
      await supabase
        .from('user_plans')
        .upsert({ user_id: user.id, plan: 'free' }, { onConflict: 'user_id' });
      setPlanData({ plan: 'free', stripe_customer_id: null, stripe_subscription_id: null, subscription_status: null, current_period_end: null });
    }

    setEventCount(countResult.count ?? 0);
    setPlanLoading(false);
  }, [user]);

  useEffect(() => {
    loadPlan();
  }, [loadPlan]);

  const plan = planData?.plan ?? 'free';
  const canCreateEvent = plan === 'pro' || eventCount < 3;

  return (
    <PlanContext.Provider value={{
      plan,
      eventCount,
      canCreateEvent,
      planLoading,
      currentPeriodEnd: planData?.current_period_end ?? null,
      subscriptionStatus: planData?.subscription_status ?? null,
      hasStripeCustomer: !!planData?.stripe_customer_id,
      refreshPlan: loadPlan,
    }}>
      {children}
    </PlanContext.Provider>
  );
}

export function usePlan() {
  const ctx = useContext(PlanContext);
  if (!ctx) throw new Error('usePlan must be used within PlanProvider');
  return ctx;
}
