import { queryOptions } from "@tanstack/react-query";
import { getRole, listClasses, listMaterials } from "./academy.functions";

export const classesQuery = queryOptions({ queryKey: ["classes"], queryFn: () => listClasses() });
export const materialsQuery = queryOptions({ queryKey: ["materials"], queryFn: () => listMaterials() });
export const roleQuery = queryOptions({ queryKey: ["role"], queryFn: () => getRole() });
import { listEvents, listTeachers, listInbox } from "./extras.functions";
export const eventsQuery = queryOptions({ queryKey: ["events"], queryFn: () => listEvents() });
export const teachersQuery = queryOptions({ queryKey: ["teachers"], queryFn: () => listTeachers() });
export const inboxQuery = queryOptions({ queryKey: ["inbox"], queryFn: () => listInbox() });
