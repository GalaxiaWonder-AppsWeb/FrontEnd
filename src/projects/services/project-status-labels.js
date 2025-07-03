// Mapeo de estados de proyecto a etiquetas en español e inglés
import { ProjectStatus } from "../model/project-status.js";

export const ProjectStatusLabels = {
  en: {
    [ProjectStatus.BASIC_STUDIES]: 'Basic Studies',
    [ProjectStatus.DESIGN_IN_PROCESS]: 'Design In Process',
    [ProjectStatus.UNDER_REVIEW]: 'Under Review',
    [ProjectStatus.CHANGE_REQUESTED]: 'Change Requested',
    [ProjectStatus.CHANGE_PENDING]: 'Change Pending',
    [ProjectStatus.APPROVED]: 'Approved'
  },
  es: {
    [ProjectStatus.BASIC_STUDIES]: 'Estudios Básicos',
    [ProjectStatus.DESIGN_IN_PROCESS]: 'Diseño en Proceso',
    [ProjectStatus.UNDER_REVIEW]: 'En Revisión',
    [ProjectStatus.CHANGE_REQUESTED]: 'Cambio Solicitado',
    [ProjectStatus.CHANGE_PENDING]: 'Cambio Pendiente',
    [ProjectStatus.APPROVED]: 'Aprobado'
  }
};
