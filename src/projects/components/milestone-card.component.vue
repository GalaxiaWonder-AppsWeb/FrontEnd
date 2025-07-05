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

    <template #footer>
      <pv-button 
        :label="$t('schedule.milestone-card.view-tasks')"
        icon="pi pi-list" 
        class="view-tasks-btn"
        @click="emit('view-tasks', milestone)"
      />
    </template>
  </pv-card>
</template>

<style scoped>
.milestone-card {
  width: 100%;
  margin-bottom: 1rem;
  background: var(--color-neutral-light, #F6FAF9);
  border-radius: 14px;
  border: 1.5px solid var(--color-primary-light, #E1E8EC);
  box-shadow: 0 2px 18px 0 rgba(34,57,107,0.07), 0 1.5px 7px 0 rgba(0,0,0,0.06);
  padding: 1.3rem 1.25rem 1.25rem 1.25rem;
  transition: box-shadow 0.18s, border-color 0.18s;
  display: flex;
  flex-direction: column;
  position: relative;
}

.milestone-card:hover {
  box-shadow: 0 6px 22px 0 rgba(34,57,107,0.15), 0 3px 12px 0 rgba(0,0,0,0.09);
  border-color: var(--color-primary, #22396B);
}

.card-header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.6rem;
}

.milestone-progress {
  position: absolute;
  top: 0.9rem;
  left: 1.2rem;
  color: var(--color-primary, #22396B);
  font-size: 0.83rem;
  font-weight: bold;
  padding: 2px 12px;
  border-radius: 14px;
  box-shadow: 0 1px 4px 0 rgba(250,185,0,0.08);
}

.milestone-title {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--color-primary, #22396B);
  letter-spacing: 0.01em;
}

.milestone-actions {
  display: flex;
  gap: 0.5rem;
}

.milestone-actions .p-button {
  background: var(--color-primary, #22396B) !important;
  border: none !important;
  color: #fff !important;
  border-radius: 50%;
  padding: 0.45rem !important;
  box-shadow: none;
  transition: background 0.13s;
}
.milestone-actions .p-button:hover {
  background: var(--color-secondary, #FAB900) !important;
  color: var(--color-primary, #22396B) !important;
}

.milestone-dates {
  color: var(--color-neutral-dark, #0C0C20);
  font-size: 0.95rem;
  margin: 0.4rem 0 0.8rem 0;
}

.milestone-stats, .stat-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.stat-item i {
  color: var(--color-primary, #22396B);
  font-size: 1.09rem;
}
.stat-item {
  color: var(--color-neutral-dark, #0C0C20);
  font-size: 1rem;
}

.view-tasks-btn {
  background: var(--color-primary, #22396B) !important;
  color: #fff !important;
  border-radius: 7px !important;
  border: none !important;
  margin-top: 1rem;
  font-weight: 500;
  font-size: 1.02rem;
  padding: 0.45rem 1.2rem !important;
  box-shadow: 0 1.5px 7px 0 rgba(34,57,107,0.07);
  transition: background 0.13s;
}
.view-tasks-btn:hover {
  background: var(--color-secondary, #FAB900) !important;
  color: var(--color-primary, #22396B) !important;
}

/* Si usas PrimeVue Card, ajusta el padding para un look limpio */
:deep(.p-card-content) {
  padding-top: 0.7rem !important;
  padding-bottom: 0 !important;
}

</style>