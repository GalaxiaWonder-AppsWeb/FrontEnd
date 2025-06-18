<script setup>
import { computed, ref, onMounted } from 'vue';
import { TaskStatus } from '../model/task-status.js';
import { Specialty } from '../model/specialty.js';
import { personService } from '../../shared/services/person.service.js';

const props = defineProps({
  task: Object
});

const emit = defineEmits(['edit', 'delete', 'assign']);

// Estado local
const responsiblePerson = ref(null);
const loadingResponsible = ref(false);

// Cargar los datos de la persona responsable
const loadResponsiblePerson = async () => {
  if (!props.task.responsible) return;
  
  try {
    loadingResponsible.value = true;
    const person = await personService.getById(props.task.responsible);
    if (person) {
      responsiblePerson.value = person;
    }
  } catch (error) {
    console.error('Error al cargar los datos del responsable:', error);
  } finally {
    loadingResponsible.value = false;
  }
};

// Formateo de fechas
const formattedDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

// Rango de fechas formateado
const dateRange = computed(() => {
  return `${formattedDate(props.task.startingDate)} - ${formattedDate(props.task.dueDate)}`;
});

// Color del estado para mostrar en la etiqueta
const statusColor = computed(() => {
  switch (props.task.status) {
    case TaskStatus.DRAFT: return 'warning';
    case TaskStatus.PENDING: return 'info';
    case TaskStatus.SUBMITTED: return 'primary';
    case TaskStatus.APPROVED: return 'success';
    case TaskStatus.REJECTED: return 'danger';
    default: return 'secondary';
  }
});

// Nombre del responsable formateado
const responsibleName = computed(() => {
  if (loadingResponsible.value) return 'Cargando...';
  if (!props.task.responsible) return 'Sin asignar';
  if (responsiblePerson.value) {
    return `${responsiblePerson.value.name || ''} ${responsiblePerson.value.lastName || ''}`.trim() || `ID: ${props.task.responsible}`;
  }
  return `ID: ${props.task.responsible}`;
});

onMounted(() => {
  loadResponsiblePerson();
});
</script>

<template>  <pv-card :class="['task-card', { 'assigned-to-me': props.task.isAssignedToMe }]">
    <template #title>
      <div class="card-header">
        <span class="task-title">{{ props.task.name }}</span>
        <div class="card-icons">
          <pv-button icon="pi pi-pencil" text rounded @click="emit('edit', props.task)" />
          <pv-button icon="pi pi-trash" text rounded severity="danger" @click="emit('delete', props.task)" />
        </div>
      </div>
    </template>

    <template #subtitle>
      <div class="task-dates">{{ dateRange }}</div>
    </template>

    <template #content>
      <div class="task-details">
        <div class="detail-row">
          <span class="label">Especialidad:</span>
          <pv-tag :value="props.task.specialty" severity="success" />
        </div>
        
        <div class="detail-row">
          <span class="label">Estado:</span>
          <pv-tag :value="props.task.status" :severity="statusColor" />
        </div>
        
        <div class="detail-row">
          <span class="label">Responsable:</span>
          <div class="responsible-info">
            <span v-if="loadingResponsible" class="loading-text">
              <i class="pi pi-spin pi-spinner" style="font-size: 0.85rem;"></i> Cargando...
            </span>
            <span v-else-if="!props.task.responsible" class="unassigned">
              <i class="pi pi-user-minus"></i> Sin asignar
            </span>
            <span v-else class="assigned">
              <i class="pi pi-user"></i> {{ responsibleName }}
            </span>
          </div>
        </div>
      </div>
    </template>    <template #footer>
      <div class="footer-actions" v-if="props.task.isAssignedToMe">
        <!-- Acciones específicas para las tareas asignadas al usuario -->
        <pv-button 
          icon="pi pi-check" 
          label="Mi tarea - Ver detalles" 
          class="w-full" 
          severity="success"
          @click="emit('edit', props.task)" 
        />
      </div>
      <div class="footer-actions" v-else>
        <!-- Acciones estándar para tareas no asignadas al usuario -->
        <pv-button 
          icon="pi pi-user-plus" 
          label="Asignar Responsable" 
          class="w-full" 
          outlined 
          @click="emit('assign', props.task)" 
          :disabled="loadingResponsible"
        />
      </div>
    </template>
  </pv-card>
</template>

<style scoped>
.task-card {
  width: 100%;
  border-left: 6px solid #f04ea0;
  transition: transform 0.2s, box-shadow 0.2s;
  position: relative;
  overflow: hidden;
}

.task-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* Estilo especial para tareas asignadas al usuario actual */
.task-card.assigned-to-me {
  border-left: 6px solid #22c55e; /* verde para tareas asignadas a mí */
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.2);
}

.task-card.assigned-to-me::before {
  content: "Asignada a mí";
  position: absolute;
  top: 1rem;
  right: -2rem;
  background: #22c55e;
  color: white;
  font-size: 0.7rem;
  font-weight: bold;
  padding: 0.15rem 2rem;
  transform: rotate(45deg);
  z-index: 1;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.task-title {
  font-weight: bold;
  font-size: 1.1rem;
}

.card-icons {
  display: flex;
  gap: 0.5rem;
}

.task-dates {
  font-size: 0.9rem;
  color: var(--text-color-secondary);
}

.task-details {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.detail-row {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.label {
  font-weight: 600;
  color: var(--text-color);
}

.responsible-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.loading-text {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-style: italic;
  color: var(--text-color-secondary);
}

.unassigned {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-style: italic;
  color: var(--text-color-secondary);
}

.assigned {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  color: var(--text-color);
}
</style>
