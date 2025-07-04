<script setup>
import { computed } from 'vue';

const props = defineProps({
  milestone: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['edit', 'delete', 'view-tasks']);

const formattedDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const dateRange = computed(() => {
  return `${formattedDate(props.milestone.startDate)} - ${formattedDate(props.milestone.endDate)}`;
});

const tasksCount = computed(() => {
  return props.milestone.items ? props.milestone.items.length : 0;
});

const progressPercentage = computed(() => {
  if (!props.milestone.items || props.milestone.items.length === 0) {
    return 0;
  }

  // Count completed tasks (this would need to be adjusted based on your task status model)
  const completedTasks = props.milestone.items.filter(item => 
    item.status === 'COMPLETED' || item.status === 'APPROVED'
  ).length;
  
  return Math.round((completedTasks / props.milestone.items.length) * 100);
});

// Handle edit button click
const handleEditClick = () => {
  emit('edit', props.milestone);
};
</script>

<template>
  <pv-card class="milestone-card">
    <template #header>
      <div class="card-header-content">
        <div class="milestone-progress">
          <pv-progress-bar :value="progressPercentage" />
          <span class="progress-text">{{ progressPercentage }}%</span>
        </div>
      </div>
    </template>
    
    <template #title>
      <div class="card-title-container">
        <h3 class="milestone-title">{{ milestone.name }}</h3>
        <div class="milestone-actions">          <pv-button 
            icon="pi pi-pencil" 
            text rounded 
            @click="handleEditClick"
            class="p-button-text" 
            aria-label="Edit milestone"
            tooltip="Edit milestone"
          />
          <pv-button 
            icon="pi pi-trash" 
            text rounded 
            severity="danger" 
            @click="emit('delete', milestone)" 
            class="p-button-text" 
            aria-label="Delete milestone"
            tooltip="Delete milestone"
          />
        </div>
      </div>
    </template>

    <template #subtitle>
      <div class="milestone-dates">{{ dateRange }}</div>
    </template>

    <template #content>
      <div class="milestone-stats">
        <div class="stat-item">
          <i class="pi pi-check-square"></i>
          <span>{{ tasksCount }} {{ $t('schedule.milestone-card.tasks') }}</span>
        </div>
      </div>
    </template>

    <template #footer>
      <pv-button 
        :label="$t('schedule.milestone-card.view-tasks')"
        icon="pi pi-list" 
        class="w-full p-button-outlined" 
        @click="emit('view-tasks', milestone)"
      />
    </template>
  </pv-card>
</template>

<style scoped>
.milestone-card {
  width: 100%;
  margin-bottom: 1rem;
  border-left: 4px solid var(--primary-color);
}

.card-header-content {
  padding: 0.5rem 1rem;
  background-color: var(--surface-ground);
}

.milestone-progress {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.progress-text {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--primary-color);
}

.card-title-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.milestone-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.milestone-actions {
  display: flex;
  gap: 0.25rem;
}

.milestone-dates {
  color: var(--text-color-secondary);
  font-size: 0.875rem;
}

.milestone-stats {
  display: flex;
  gap: 1.5rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.stat-item i {
  color: var(--primary-color);
  font-size: 1rem;
}

:deep(.p-card-content) {
  padding-top: 1rem;
}
</style>