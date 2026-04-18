export const SIGHTING_CREATED = 'sighting.created';
export const LOST_REPORT_CREATED = 'lostReport.created';
export const LOST_REPORT_STATUS_CHANGED = 'lostReport.statusChanged';

export class SightingCreatedEvent {
  constructor(
    public readonly sightingId: string,
    public readonly lostReportId: string | null,
    public readonly reporterUserId: string,
  ) {}
}

export class LostReportCreatedEvent {
  constructor(
    public readonly lostReportId: string,
    public readonly ownerId: string,
    public readonly dogName: string,
    public readonly latitude: number,
    public readonly longitude: number,
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
