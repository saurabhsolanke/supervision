'use client';

import React, { useState } from 'react';
import { useTenant } from '@/lib/tenantStore';
import { PlanTier } from '@/types';
import { PLAN_CONFIGS } from '@/lib/constants';
import {
  CreditCard,
  Check,
  Zap,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  X,
  Layers,
  ArrowRight,
} from 'lucide-react';

interface BillingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BillingModal({ isOpen, onClose }: BillingModalProps) {
  const { currentOrg, upgradePlan, canManageBilling } = useTenant();

  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  if (!isOpen || !currentOrg) return null;

  const sub = currentOrg.subscription;
  const tiers: PlanTier[] = ['STARTER', 'PRO', 'ENTERPRISE'];

  const handleSelectTier = async (tier: PlanTier) => {
    if (!canManageBilling) return;
    const res = await upgradePlan(tier, billingCycle);
    if (res.success) {
      setSuccessNotice(`Subscription successfully updated to ${tier} (${billingCycle})!`);
      setTimeout(() => setSuccessNotice(null), 4000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-4xl max-h-[94vh] sm:max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <CreditCard size={18} className="text-[#0078D4] shrink-0" />
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 sm:gap-2 truncate">
                <span className="truncate">SaaS Subscription</span>
                <span className="px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs font-mono font-bold rounded bg-blue-100 text-[#0078D4] dark:bg-blue-950 dark:text-blue-300 shrink-0">
                  {sub.planTier}
                </span>
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500 truncate">
                Tenant: {currentOrg.name} | Status: <strong className="text-emerald-600 uppercase">{sub.status}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-md shrink-0 ml-2"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4 sm:space-y-6">
          {successNotice && (
            <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-900 text-xs font-semibold flex items-center gap-2">
              <Check size={16} />
              <span>{successNotice}</span>
            </div>
          )}

          {!canManageBilling && (
            <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-900 text-xs flex items-center gap-2">
              <AlertCircle size={15} />
              <span>
                <strong>Read-only Billing View:</strong> You must be an <strong>Owner</strong> to upgrade or change subscription tiers.
              </span>
            </div>
          )}

          {/* Current Subscription Metadata Overview */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs">
            <div>
              <span className="text-slate-400 uppercase tracking-wider text-[10px] block font-bold">Plan Tier</span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{sub.planTier}</span>
            </div>
            <div>
              <span className="text-slate-400 uppercase tracking-wider text-[10px] block font-bold">Seats In Use</span>
              <span className="text-sm font-bold text-[#0078D4]">{currentOrg.memberships.length} / {sub.maxSeats} seats</span>
            </div>
            <div>
              <span className="text-slate-400 uppercase tracking-wider text-[10px] block font-bold">Billing Cycle</span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-100 capitalize">{sub.billingCycle}</span>
            </div>
            <div>
              <span className="text-slate-400 uppercase tracking-wider text-[10px] block font-bold">Renewal Date</span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                {new Date(sub.currentPeriodEnd).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Monthly / Annual Toggle */}
          <div className="flex items-center justify-center gap-3">
            <span
              className={`text-xs font-medium cursor-pointer ${
                billingCycle === 'monthly' ? 'text-slate-900 dark:text-white font-bold' : 'text-slate-500'
              }`}
              onClick={() => setBillingCycle('monthly')}
            >
              Monthly Billing
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                billingCycle === 'annual' ? 'bg-[#0078D4]' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  billingCycle === 'annual' ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <div className="flex items-center gap-1.5">
              <span
                className={`text-xs font-medium cursor-pointer ${
                  billingCycle === 'annual' ? 'text-slate-900 dark:text-white font-bold' : 'text-slate-500'
                }`}
                onClick={() => setBillingCycle('annual')}
              >
                Annual Billing
              </span>
              <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                Save 20%
              </span>
            </div>
          </div>

          {/* Pricing Tiers Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {tiers.map((tier) => {
              const config = PLAN_CONFIGS[tier];
              const isCurrent = sub.planTier === tier;
              const price = billingCycle === 'annual' ? config.annualPrice : config.monthlyPrice;

              return (
                <div
                  key={tier}
                  className={`relative rounded-xl p-5 border flex flex-col justify-between transition-all ${
                    isCurrent
                      ? 'border-[#0078D4] ring-2 ring-[#0078D4]/20 bg-blue-50/20 dark:bg-blue-950/20 shadow-md'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
                  }`}
                >
                  {isCurrent && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-[#0078D4] text-white text-[10px] font-bold uppercase tracking-wider shadow-xs">
                      Current Active Plan
                    </div>
                  )}

                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                        {config.name}
                      </h3>
                      {tier === 'ENTERPRISE' && (
                        <Sparkles size={16} className="text-purple-600 dark:text-purple-400" />
                      )}
                    </div>

                    {/* Price */}
                    <div className="mb-4">
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-black text-slate-900 dark:text-slate-100">
                          ${price}
                        </span>
                        <span className="text-xs text-slate-500">/ user / mo</span>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {price === 0 ? 'Free forever' : `Billed ${billingCycle}`}
                      </span>
                    </div>

                    {/* Seat Limit Badge */}
                    <div className="mb-4 p-2 rounded bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300">
                      Seats: <strong>Up to {config.maxSeats} members</strong>
                    </div>

                    {/* Feature Checklist */}
                    <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300 mb-6">
                      {config.features.map((f) => (
                        <li key={f} className="flex items-start gap-2">
                          <Check size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Action Button */}
                  <div>
                    {isCurrent ? (
                      <button
                        disabled
                        className="w-full py-2 text-xs font-bold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 cursor-default border border-slate-200 dark:border-slate-700"
                      >
                        Active Subscription
                      </button>
                    ) : (
                      <button
                        onClick={() => handleSelectTier(tier)}
                        disabled={!canManageBilling}
                        className="w-full py-2 text-xs font-bold rounded-lg bg-[#0078D4] hover:bg-[#106EBE] active:bg-[#005A9E] text-white shadow-xs transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
                      >
                        <span>Switch to {config.name}</span>
                        <ArrowRight size={13} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Feature Matrix Table */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Layers size={14} className="text-[#0078D4]" />
              Multi-Tenant Commercial Feature Matrix
            </h4>

            <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-x-auto touch-pan-x text-xs">
              <table className="w-full min-w-[500px] text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700 text-slate-500 font-semibold">
                  <tr>
                    <th className="px-3 sm:px-4 py-2">Capability</th>
                    <th className="px-3 sm:px-4 py-2">Starter</th>
                    <th className="px-3 sm:px-4 py-2">Pro</th>
                    <th className="px-3 sm:px-4 py-2">Enterprise</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  <tr>
                    <td className="px-3 sm:px-4 py-2 font-medium">Max Team Member Seats</td>
                    <td className="px-3 sm:px-4 py-2 font-semibold">3 seats</td>
                    <td className="px-3 sm:px-4 py-2 font-semibold">10 seats</td>
                    <td className="px-3 sm:px-4 py-2 font-semibold text-[#0078D4]">50 seats</td>
                  </tr>
                  <tr>
                    <td className="px-3 sm:px-4 py-2 font-medium">Custom Column WIP Limits</td>
                    <td className="px-3 sm:px-4 py-2 text-slate-400">Fixed standard</td>
                    <td className="px-3 sm:px-4 py-2 text-emerald-600 font-semibold">Full control</td>
                    <td className="px-3 sm:px-4 py-2 text-emerald-600 font-semibold">Full control</td>
                  </tr>
                  <tr>
                    <td className="px-3 sm:px-4 py-2 font-medium">Sprint & Iteration Planning</td>
                    <td className="px-3 sm:px-4 py-2 text-slate-400">Backlog only</td>
                    <td className="px-3 sm:px-4 py-2 text-emerald-600 font-semibold">Included</td>
                    <td className="px-3 sm:px-4 py-2 text-emerald-600 font-semibold">Advanced velocity</td>
                  </tr>
                  <tr>
                    <td className="px-3 sm:px-4 py-2 font-medium">Backlog Export (JSON / CSV)</td>
                    <td className="px-3 sm:px-4 py-2 text-slate-400">Not included</td>
                    <td className="px-3 sm:px-4 py-2 text-emerald-600 font-semibold">Included</td>
                    <td className="px-3 sm:px-4 py-2 text-emerald-600 font-semibold">Automated sync</td>
                  </tr>
                  <tr>
                    <td className="px-3 sm:px-4 py-2 font-medium">Multi-Tenant Audit Logs & RLS</td>
                    <td className="px-3 sm:px-4 py-2 text-slate-400">Basic</td>
                    <td className="px-3 sm:px-4 py-2 text-slate-400">Basic</td>
                    <td className="px-3 sm:px-4 py-2 text-purple-600 font-bold">Enterprise SOC2 Grade</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex flex-col sm:flex-row gap-2 justify-between items-center text-xs text-slate-500">
          <div className="flex items-center gap-1.5 text-center sm:text-left">
            <ShieldCheck size={14} className="text-emerald-600 shrink-0" />
            <span className="text-[11px] sm:text-xs">Prorated upgrades, cancel anytime without lock-in</span>
          </div>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md hover:bg-slate-50 shadow-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
