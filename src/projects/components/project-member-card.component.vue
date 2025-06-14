<script setup>
import { ref, computed, onMounted } from 'vue';
import { ProjectRole } from '../model/project-role.js';
import { Specialty } from '../model/specialty.js';
import { personService } from '../../iam/services/person.service.js';

const props = defineProps({
  teamMember: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['remove', 'update']);

// State
const loading = ref(false);
const error = ref(null);
const memberDetails = ref(null);

// Get the specialty display name
const specialtyName = computed(() => {
  return props.teamMember.specialty || 'N/A';
});

// Get the role display name (always SPECIALIST)
const roleName = computed(() => {
  return ProjectRole.SPECIALIST;
});

// Get the member's full name
const memberFullName = computed(() => {
  if (!memberDetails.value) return 'Loading...';
  return `${memberDetails.value.firstName} ${memberDetails.value.lastName}`;
});

// Get the member's email
const memberEmail = computed(() => {
  if (!memberDetails.value) return '';
  return memberDetails.value.email || '';
});

// Load the member details
const loadMemberDetails = async () => {
  if (!props.teamMember.memberId) return;
  
  try {
    loading.value = true;
    error.value = null;
    const person = await personService.getById(props.teamMember.memberId);
    memberDetails.value = person;
  } catch (err) {
    console.error('Error loading team member details:', err);
    error.value = 'Failed to load member details';
  } finally {
    loading.value = false;
  }
};

// Handle remove button click
const handleRemove = () => {
  emit('remove', props.teamMember);
};

// Load member details when the component is mounted
onMounted(() => {
  loadMemberDetails();
});
</script>

<template>
  <pv-card class="team-member-card">
    <!-- Loading state -->
    <template v-if="loading">
      <div class="loading-container">
        <pv-progress-spinner style="width: 30px; height: 30px;" />
        <span>Loading member details...</span>
      </div>
    </template>
    
    <!-- Error state -->
    <template v-else-if="error">
      <div class="error-container">
        <i class="pi pi-exclamation-triangle" style="font-size: 1.5rem; color: var(--red-500);" />
        <span>{{ error }}</span>
      </div>
    </template>
    
    <!-- Content -->
    <template v-else>
      <div class="card-content">
        <!-- Member details -->
        <div class="member-info">
          <h3>{{ memberFullName }}</h3>
          <p v-if="memberEmail" class="email">{{ memberEmail }}</p>
          
          <div class="role-badge">
            <pv-tag severity="info" value="SPECIALIST" />
          </div>
          
          <div class="specialty-section">
            <span class="specialty-label">Specialty:</span>
            <pv-tag severity="success" :value="specialtyName" />
          </div>
        </div>
        
        <!-- Actions -->
        <div class="card-actions">
          <pv-button 
            icon="pi pi-trash" 
            class="p-button-rounded p-button-danger p-button-text" 
            @click="handleRemove"
            title="Remove from project"
          />
        </div>
      </div>
    </template>
  </pv-card>
</template>

<style scoped>
.team-member-card {
  margin-bottom: 1rem;
  transition: transform 0.2s, box-shadow 0.2s;
}

.team-member-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.card-content {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem;
}

.member-info {
  flex-grow: 1;
}

.member-info h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
}

.email {
  margin: 0 0 0.5rem 0;
  color: var(--text-color-secondary);
  font-size: 0.9rem;
}

.role-badge {
  margin-bottom: 0.75rem;
}

.specialty-section {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.specialty-label {
  font-weight: 500;
}

.card-actions {
  display: flex;
  align-items: flex-start;
}

.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  gap: 0.5rem;
  text-align: center;
}

.error-container {
  color: var(--red-500);
}
</style>