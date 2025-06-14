<script setup>
import { ref, onMounted, computed } from 'vue';
import { organizationMemberService } from '../../organizations/services/organization-member.service.js';

const props = defineProps({
  visible: {
    type: Boolean,
    required: true
  },
  task: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['update:visible', 'assign', 'cancel']);

// Data
const members = ref([]);
const loading = ref(false);
const selectedMemberId = ref(null);
const error = ref(null);

// Load organization members
const loadMembers = async () => {
  try {
    loading.value = true;
    error.value = null;
    // Assuming we have the current organization ID in some store or service
    // This should be adjusted based on your application structure
    const organizationId = 1; // This should be dynamically loaded in a real scenario
    const response = await organizationMemberService.getByOrganizationId(organizationId);
    members.value = response;
  } catch (err) {
    console.error('Error loading members:', err);
    error.value = 'Failed to load organization members. Please try again.';
  } finally {
    loading.value = false;
  }
};

// Check if the member is currently responsible for the task
const isCurrentResponsible = (memberId) => {
  return props.task && props.task.responsible === memberId;
};

// Format member name
const memberName = (member) => {
  return `${member.person?.firstName || ''} ${member.person?.lastName || ''} ${isCurrentResponsible(member.id) ? '(Current)' : ''}`;
};

// Handle assign button click
const handleAssign = () => {
  if (selectedMemberId.value) {
    emit('assign', selectedMemberId.value);
  }
};

// Close the dialog
const handleCancel = () => {
  emit('cancel');
};

// Update visibility
const updateVisible = (value) => {
  emit('update:visible', value);
  if (value) {
    // If dialog becomes visible, set the currently responsible member as selected
    if (props.task && props.task.responsible) {
      selectedMemberId.value = props.task.responsible;
    }
  }
};

// Load members when component is mounted
onMounted(loadMembers);
</script>

<template>
  <pv-dialog 
    :visible="visible" 
    @update:visible="updateVisible"
    :modal="true"
    :closable="false"
    :style="{ width: '500px' }"
    header="Assign Responsible"
  >
    <div class="assign-container">
      <div v-if="loading" class="loading">
        <pv-progress-spinner />
      </div>

      <div v-else-if="error" class="error">
        <p>{{ error }}</p>
        <pv-button label="Retry" icon="pi pi-refresh" @click="loadMembers" />
      </div>
      
      <div v-else-if="members.length === 0" class="empty-state">
        <p>No organization members available.</p>
      </div>
      
      <div v-else class="member-selection">
        <h3>Task: {{ props.task.name }}</h3>
        
        <div class="form-field">
          <label for="member">Select Responsible Person</label>
          <pv-dropdown
            id="member"
            v-model="selectedMemberId"
            :options="members"
            optionLabel="person.firstName"
            optionValue="id"
            placeholder="Select a member"
            class="w-full"
          >
            <template #option="slotProps">
              <div class="member-option">
                <div>{{ memberName(slotProps.option) }}</div>
              </div>
            </template>
          </pv-dropdown>
        </div>
      </div>
    </div>
    
    <template #footer>
      <div class="dialog-footer">
        <pv-button label="Cancel" icon="pi pi-times" class="p-button-text" @click="handleCancel" />
        <pv-button 
          label="Assign" 
          icon="pi pi-user" 
          :disabled="!selectedMemberId"
          @click="handleAssign" 
        />
      </div>
    </template>
  </pv-dialog>
</template>

<style scoped>
.assign-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.loading, .error, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  text-align: center;
}

.member-selection {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.member-option {
  padding: 0.5rem 0;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

label {
  font-weight: 500;
}
</style>
