import { CanonicalBusiness } from '../../types';

export function applyQcWorkflow(record: CanonicalBusiness): CanonicalBusiness {
  const hasMinimumFields =
    Boolean(record.business_name) &&
    Boolean(record.category) &&
    Boolean(record.city) &&
    Boolean(record.district) &&
    (Boolean(record.phone_primary) || Boolean(record.facebook_url) || Boolean(record.instagram_url)) &&
    (Boolean(record.address_text) || Boolean(record.latitude));

  if (!hasMinimumFields) {
    return {
      ...record,
      status: 'Rejected',
      publish_readiness_score: Math.min(record.publish_readiness_score, 0.35),
      verification_notes: [...(record.verification_notes || []), 'Rejected by non-negotiable quality rule']
    };
  }

  if (record.status === 'Outside Central Coverage') {
    return { ...record, status: 'Outside Central Coverage' };
  }

  if (record.publish_readiness_score >= 0.85) return { ...record, status: 'Export Ready' };
  if (record.publish_readiness_score >= 0.75) return { ...record, status: 'Verified' };
  if (record.publish_readiness_score >= 0.55) return { ...record, status: 'Needs Verification' };
  return { ...record, status: 'Needs Cleaning' };
}
