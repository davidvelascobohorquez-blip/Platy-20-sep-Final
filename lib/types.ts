export type EstimateDTO = {
  id: string;
  clientName: string;
  address: string;
  lat: number | null;
  lng: number | null;
  timeWindow: string;
  status: "PENDING" | "ASSIGNED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  vendorId: string | null;
  distanceKm: number | null;
  travelMinutes: number | null;
  assignedAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  vendor: { user: { name: string } } | null;
  result: {
    sold: boolean;
    scopeOfWork: string | null;
    quoteAmount: number | null;
    notes: string | null;
  } | null;
};

export const STATUS_LABEL: Record<EstimateDTO["status"], string> = {
  PENDING: "Pendiente de asignar",
  ASSIGNED: "Asignado",
  IN_PROGRESS: "En progreso",
  COMPLETED: "Completado",
  CANCELLED: "Cancelado"
};
