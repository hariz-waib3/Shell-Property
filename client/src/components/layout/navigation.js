import { ROLES } from '@/data/constants'

// comingSoon: shown greyed out with a "Coming soon" tooltip, not clickable.
export const NAVIGATION = {
  [ROLES.PARTNER]: [
    { name: 'properties', label: 'Properties' },
    { name: 'my-lists', label: 'My Lists' },
    { name: 'my-deals', label: 'My Deals' },
    { name: 'documents', label: 'Documents' },
    { name: 'sourcing-request', label: 'General Enquiry' },
    { name: 'billing', label: 'Plan & Billing', comingSoon: true },
  ],
  [ROLES.ADMIN]: [
    { name: 'admin-dashboard', label: 'Dashboard' },
    { name: 'admin-properties', label: 'Properties' },
    { name: 'admin-enquiries', label: 'Enquiries' },
    { name: 'admin-documents', label: 'Documents' },
    { name: 'admin-subscribers', label: 'Subscribers' },
    { name: 'admin-plans', label: 'Plans & Paywall' },
  ],
}
