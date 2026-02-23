import {
  PriceMonitoringJobStatus,
  PriceAlertSeverity,
} from '../types/price-monitoring';

export const PRICE_CHANGE_THRESHOLDS = {
  INFO: 5,
  WARNING: 15,
  CRITICAL: 30,
} as const;

export const PRICE_MONITORING_JOB_STATUS_LABELS: Record<PriceMonitoringJobStatus, string> = {
  [PriceMonitoringJobStatus.PENDING]: 'Pending',
  [PriceMonitoringJobStatus.RUNNING]: 'Running',
  [PriceMonitoringJobStatus.COMPLETED]: 'Completed',
  [PriceMonitoringJobStatus.FAILED]: 'Failed',
  [PriceMonitoringJobStatus.PARTIAL]: 'Partial',
};

export const PRICE_ALERT_SEVERITY_LABELS: Record<PriceAlertSeverity, string> = {
  [PriceAlertSeverity.INFO]: 'Info',
  [PriceAlertSeverity.WARNING]: 'Warning',
  [PriceAlertSeverity.CRITICAL]: 'Critical',
};
