import { queryOptions } from "@tanstack/react-query";
import { getRole, listClasses, listMaterials } from "./academy.functions";

export const classesQuery = queryOptions({ queryKey: ["classes"], queryFn: () => listClasses() });
export const materialsQuery = queryOptions({ queryKey: ["materials"], queryFn: () => listMaterials() });
export const roleQuery = queryOptions({ queryKey: ["role"], queryFn: () => getRole() });
