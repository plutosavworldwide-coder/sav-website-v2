import { motion } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';
import { PURCHASE_PLANS } from '../lib/purchasePlans';

export default function MembershipPlanCards({ onSelect }) {
    return <div className="grid items-stretch gap-5 md:grid-cols-3">
        {PURCHASE_PLANS.map((plan, index) => <motion.button type="button" key={plan.name} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: index * 0.06 }} onClick={() => onSelect(plan)} className={`dash-panel group flex h-full flex-col p-6 text-left transition-colors hover:border-[var(--dash-muted)] ${plan.popular ? 'border-[var(--dash-muted)]' : ''}`}>
            <div className="mb-5 flex h-6 items-center justify-between"><span className="dash-eyebrow">Membership</span>{plan.popular && <span className="rounded-md border border-[var(--dash-border)] bg-[var(--dash-panel-raised)] px-2 py-1 text-[10px] font-medium text-[var(--dash-text)]">Most popular</span>}</div>
            <h2 className="text-xl font-semibold tracking-tight text-[var(--dash-text)]">{plan.name}</h2>
            <div className="mb-4 mt-4 flex flex-wrap items-baseline gap-1.5"><span className="text-[36px] font-semibold leading-none tracking-[-0.04em] text-[var(--dash-text)]">€{plan.price}</span><span className="text-xs text-[var(--dash-muted)]">{plan.period}</span></div>
            <p className="text-xs leading-relaxed text-[var(--dash-muted)]">{plan.description}</p>
            <ul className="mb-6 mt-6 flex-1 space-y-3.5 border-t border-[var(--dash-border)] pt-5">
                {plan.features.map(feature => <li key={feature} className="flex items-start gap-2.5 text-xs leading-relaxed text-[var(--dash-muted)]"><Check size={14} className="mt-0.5 shrink-0 text-[var(--dash-subtle)]" /><span>{feature}</span></li>)}
            </ul>
            <span className={`${plan.popular ? 'dash-primary' : 'dash-secondary'} w-full`}>Get started<ArrowRight size={14} /></span>
        </motion.button>)}
    </div>;
}
