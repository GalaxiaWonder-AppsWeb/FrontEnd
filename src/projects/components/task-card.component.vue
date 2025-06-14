<script setup>
import { computed } from 'vue';
import { TaskStatus } from '../model/task-status.js';
import { Specialty } from '../model/specialty.js';

const props = defineProps({
  task: Object
});

const emit = defineEmits(['edit', 'delete', 'assign']);

const formattedDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const dateRange = computed(() => {
  return `${formattedDate(props.task.startingDate)} - ${formattedDate(props.task.dueDate)}`;
});

const statusColor = computed(() => {
  switch (props.task.status) {
    case TaskStatus.DRAFT: return 'warning';
    case TaskStatus.IN_PROGRESS: return 'info';
    case TaskStatus.COMPLETED: return 'success';
    default: return 'secondary';
  }
});
</script>

<template>
  <pv-card class="task-card">
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
        <p><strong>Specialty:</strong> <pv-tag :value="props.task.specialty" severity="success" /></p>
        <p><strong>Status:</strong> <pv-tag :value="props.task.status" :severity="statusColor" /></p>
        <p><strong>Responsible:</strong> {{ props.task.responsible ? props.task.responsible : '-' }}</p>
      </div>
    </template>

    <template #footer>
      <pv-button icon="pi pi-user-plus" label="Assign Responsible" class="w-full" outlined @click="emit('assign', props.task)" />
    </template>
  </pv-card>
</template>

<style scoped>
.task-card {
  width: 100%;
  border-left: 6px solid #f04ea0;
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

.task-details p {
  margin: 0.25rem 0;
}
</style>
