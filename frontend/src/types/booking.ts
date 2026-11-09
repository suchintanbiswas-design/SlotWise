export interface Resource {
    id: string;
    name: string;
    resourceType: string;
    capacity: number;
    buildingId: string;
    buildingName: string;
    approvalRequired: boolean;
}

export interface BookingResponse {
    id: string;
    resourceId: string;
    resourceName: string;
    userId: string;
    userFullName: string;
    startsAt: string;
    endsAt: string;
    status: string;
    purpose: string;
}

export interface BookingRequest {
    resourceId: string;
    startsAt: string;
    endsAt: string;
    purpose?: string;
}

