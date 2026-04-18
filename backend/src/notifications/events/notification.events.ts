export const SIGHTING_CREATED = 'sighting.created';
export const LOST_REPORT_STATUS_CHANGED = 'lostReport.statusChanged';

export class SightingCreatedEvent {
  constructor(
    public readonly sightingId: string,
    public readonly lostReportId: string | null,
    public readonly reporterUserId: string,
  ) {}
}

export class LostReportStatusChangedEvent {
  constructor(
    public readonly lostReportId: string,
    public readonly dogId: string,
    public readonly ownerId: string,
    public readonly newStatus: 'RESOLVED' | 'CANCELLED',
  ) {}
}
