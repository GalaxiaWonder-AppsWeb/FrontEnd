<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import ProjectMemberCard from './project-member-card.component.vue'
import AddProjectMember from './add-project-member.component.vue'
import { projectTeamMemberService } from '../services/project-team-member.service.js'
import { personService } from '../../shared/services/person.service.js'
import Toast from 'primevue/toast'
import ConfirmDialog from 'primevue/confirmdialog'

// Use PrimeVue services for confirmations and toast notifications
const toast = useToast();
const confirm = useConfirm();

// Obtener el ID del proyecto desde los parámetros de la ruta
const route = useRoute()
const projectId = computed(() => {
  const id = route.params.projectId
  
  if (!id) {
    console.warn('projectId no encontrado en los parámetros de la ruta, usando 1 como valor por defecto')
    return 1
  }
  
  const parsedId = Number(id)
  if (isNaN(parsedId)) {
    console.warn(`El ID del proyecto '${id}' no es un número válido, usando 1 como valor por defecto`)
    return 1
  }
  
  return parsedId
})

const projectMembers = ref([])
const showModal = ref(false)
const personsCache = ref({}) // Cache para almacenar las personas por ID
const organizationMembersCache = ref({}) // Cache para almacenar los miembros de la organización
const loading = ref(true) // Flag to control loading state

// Function to handle when a new member is added
const handleMemberAdded = async () => {
  console.log('Member added to project - refreshing data and closing dialog');
  
  try {
    // First reload members
    await loadMembers();
    console.log('Members list reloaded after member addition');
    
    // Show success toast
    toast.add({
      severity: 'success',
      summary: 'Miembro agregado',
      detail: 'El miembro ha sido agregado al proyecto exitosamente',
      life: 3000
    });
    
    // Then close the dialog
    showModal.value = false;
  } catch (error) {
    console.error('Error refreshing members after addition:', error);
    
    // Still close the dialog but show warning
    showModal.value = false;
    
    toast.add({
      severity: 'warn',
      summary: 'Miembro agregado pero...',
      detail: 'El miembro fue agregado pero hubo un error al actualizar la lista. Intente recargar manualmente.',
      life: 5000
    });
  }
}

// Function to handle member removal confirmation
const confirmRemoveMember = (member) => {
  if (!member || !member.id) {
    console.error('Cannot remove member: Invalid member object or missing ID');
    return;
  }
  
  // Use PrimeVue confirmDialog to ask for confirmation
  confirm.require({
    message: `¿Está seguro que desea eliminar a ${getPersonName(member)} del proyecto?`,
    header: 'Confirmar eliminación',
    icon: 'pi pi-exclamation-triangle',
    accept: () => {
      removeMember(member.id);
    },
    reject: () => {
      // Do nothing on reject
    }
  });
}

// Function to remove a member from the project
const removeMember = async (memberId) => {
  try {
    loading.value = true;
    await projectTeamMemberService.delete(memberId);
    
    // Show success message
    toast.add({
      severity: 'success',
      summary: 'Miembro eliminado',
      detail: 'El miembro ha sido eliminado del proyecto exitosamente',
      life: 3000
    });
    
    // Reload the members list
    await loadMembers();
  } catch (error) {
    console.error('Error removing project member:', error);
    
    // Show error message
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo eliminar el miembro del proyecto',
      life: 3000
    });
  } finally {
    loading.value = false;
  }
}

// Helper function to get person name from cache or return placeholder
const getPersonName = (member) => {
  if (!member) return 'Miembro desconocido';
  
  const person = getPersonForTeamMember(member);
  if (person && person.firstName && person.lastName) {
    return `${person.firstName} ${person.lastName}`;
  } else if (person && (person.firstName || person.lastName)) {
    return person.firstName || person.lastName;
  }
  
  return `Miembro ID: ${member.id}`;
}

const loadMembers = async () => {
  loading.value = true;
  
  // Clear caches before loading new data
  personsCache.value = {};
  organizationMembersCache.value = {};
  
  try {
    console.log(`Loading project members for project ID: ${projectId.value}...`);
    
    // Get fresh data using the projectTeamMemberService
    const response = await projectTeamMemberService.getByProjectId({ projectId: projectId.value });
    
    // Ensure we have a valid array and update the reference
    projectMembers.value = Array.isArray(response) ? response : [];
    
    console.log(`Project members loaded: ${projectMembers.value.length} members found`);
    
    // Precargar los datos de las personas asociadas a los miembros
    if (projectMembers.value.length > 0) {
      console.log('Preloading organization member and person data...');
      
      // Step 1: Load all organization member data first
      const apiUrl = import.meta.env.VITE_PROPGMS_API_URL || 'http://localhost:3000';
      
      const memberPromises = projectMembers.value.map(async (member) => {
        if (!member.organizationMemberId) {
          console.warn(`Project member ${member.id} has no organizationMemberId`);
          return;
        }
        
        try {
          // Fetch the organization member
          const orgMemberId = Number(member.organizationMemberId);
          console.log(`Fetching organization member data for ID: ${orgMemberId}`);
          
          const memberResponse = await fetch(`${apiUrl}/members/${orgMemberId}`);
          
          if (memberResponse.ok) {
            const orgMember = await memberResponse.json();
            console.log(`Organization member loaded for ID ${orgMemberId}:`, orgMember);
            
            // Store in the cache using the numeric ID
            organizationMembersCache.value[orgMemberId] = orgMember;
            
            // Step 2: Now fetch the associated person if there's a personId
            if (orgMember && orgMember.personId) {
              try {
                const personId = Number(orgMember.personId);
                const person = await loadPersonData(personId);
                
                if (person) {
                  // Store in the person cache by personId
                  personsCache.value[personId] = person;
                  
                  // Also cache by organizationMemberId for easy lookup in the template
                  personsCache.value[`org_${orgMemberId}`] = person;
                  
                  console.log(`Person data loaded for organization member ${orgMemberId}:`, person);
                }
              } catch (personError) {
                console.error(`Error loading person for organization member ${orgMemberId}:`, personError);
              }
            } else {
              console.warn(`Organization member ${orgMemberId} has no personId`);
            }
          } else {
            console.error(`Failed to fetch organization member ${orgMemberId}: ${memberResponse.status} ${memberResponse.statusText}`);
          }
        } catch (memberError) {
          console.error(`Error processing member ${member.id}:`, memberError);
        }
      });
      
      // Wait for all promises to resolve
      await Promise.all(memberPromises);
      
      console.log('All member data loaded.');
      console.log(`Cache status: ${Object.keys(personsCache.value).length} persons, ${Object.keys(organizationMembersCache.value).length} organization members`);
    } else {
      console.log('No project members to load data for');
    }
  } catch (error) {
    console.error('Error loading team members:', error);
    // Ensure we always have a valid array
    projectMembers.value = [];
    
    // Show error toast
    toast.add({
      severity: 'error',
      summary: 'Error de carga',
      detail: 'No se pudieron cargar los miembros del proyecto',
      life: 3000
    });
  } finally {
    loading.value = false;
  }
}

// Function to load person data with better error handling
const loadPersonData = async (personId) => {
  if (!personId) {
    console.warn('No person ID provided')
    return { name: 'Unknown', lastName: 'User', email: '' }
  }
  
  try {
    console.log(`Fetching person data for ID: ${personId}`)
    const person = await personService.getById(personId)
    
    if (person) {
      console.log(`Person data successfully retrieved for ID ${personId}:`, person)
      return person
    } else {
      console.warn(`Person with ID ${personId} not found`)
      return { name: 'Unknown', lastName: 'User', email: '' }
    }
  } catch (error) {
    console.error(`Error fetching person with ID ${personId}:`, error)
    return { name: 'Error', lastName: 'Loading', email: '' }
  }
}

// Get person data for a project team member
const getPersonForTeamMember = (projectTeamMember) => {
  if (!projectTeamMember || !projectTeamMember.organizationMemberId) {
    return { name: 'Unknown', lastName: 'Member', email: '' }
  }
  
  // Try to get from cache using the special key we created
  if (personsCache.value[`org_${projectTeamMember.organizationMemberId}`]) {
    return personsCache.value[`org_${projectTeamMember.organizationMemberId}`]
  }
  
  // If not found with special key, try the organization member cache
  const orgMember = organizationMembersCache.value[projectTeamMember.organizationMemberId]
  if (orgMember && orgMember.personId && personsCache.value[orgMember.personId]) {
    return personsCache.value[orgMember.personId]
  }
  
  // Return fallback data if nothing found
  return { name: 'Loading...', lastName: '', email: '' }
}

// Computed property to check if we have person data for each member
const allPersonDataLoaded = computed(() => {
  return projectMembers.value.every(member => {
    if (!member.organizationMemberId) return true
    return !!personsCache.value[`org_${member.organizationMemberId}`]
  })
})

// Cargar miembros cuando el componente se monta
onMounted(loadMembers)
</script>

<template>  <div class="p-4">
    <!-- Toast for notifications -->
    <pv-toast />
    
    <!-- Confirmation dialog -->
    <pv-confirm-dialog></pv-confirm-dialog>
    
    <div class="flex justify-between items-center mb-4">
    <h2 class="text-xl font-semibold">{{ $t('projects.working-team.title') }}</h2>
      <pv-button :label="$t('projects.working-team.add-member.title')" icon="pi pi-user-plus" @click="showModal = true" />
    </div>

    <!-- Loading indicator -->
    <div v-if="loading" class="text-center p-4">
      <pv-progress-spinner style="width: 50px; height: 50px;" />
      <div class="mt-2">Loading project members...</div>
    </div>

    <!-- No members message -->
    <div v-else-if="projectMembers.length === 0" class="text-gray-500 text-center p-4">
      {{$t('projects.working-team.no-members')}}
    </div>
      <!-- Debug information (can be removed in production) -->
    <div v-if="projectMembers.length > 0" class="mb-4 p-2 bg-gray-100 rounded text-xs">
      <details>
        <summary>Debug info (click to expand)</summary>
        <div>Members loaded: {{ projectMembers.length }}</div>
        <div>All person data loaded: {{ allPersonDataLoaded ? 'Yes' : 'No' }}</div>
        <div>Person cache entries: {{ Object.keys(personsCache).length }}</div>
        <div>Organization members cache entries: {{ Object.keys(organizationMembersCache).length }}</div>
        <div class="mt-2 font-bold">First team member:</div>
        <pre v-if="projectMembers[0]">{{ JSON.stringify(projectMembers[0], null, 2) }}</pre>
        <div class="mt-2 font-bold" v-if="projectMembers[0]?.organizationMemberId">
          Organization member for first team member:
        </div>
        <pre v-if="projectMembers[0]?.organizationMemberId && organizationMembersCache[projectMembers[0].organizationMemberId]">
          {{ JSON.stringify(organizationMembersCache[projectMembers[0].organizationMemberId], null, 2) }}
        </pre>
        <div class="mt-2 font-bold" v-if="projectMembers[0]?.organizationMemberId">
          Person for first team member:
        </div>
        <pre v-if="projectMembers[0]">
          {{ JSON.stringify(getPersonForTeamMember(projectMembers[0]), null, 2) }}
        </pre>
      </details>
    </div>    <!-- Member cards -->
    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      <ProjectMemberCard
        v-for="member in projectMembers"
        :key="member.id"
        :member="member"
        :person="getPersonForTeamMember(member)"
        @remove="confirmRemoveMember(member)"
      />
    </div>    <!-- Add member dialog -->
    <pv-dialog v-model:visible="showModal" modal header="Add Member" style="width: 30rem">
      <AddProjectMember :project-id="projectId" @member-added="handleMemberAdded" />
    </pv-dialog>
    
    <!-- Button to manually reload data (helpful for debugging) -->
    <div class="mt-4 text-center">
      <pv-button 
        :label="$t('projects.working-team.reload-data')" 
        icon="pi pi-refresh" 
        severity="secondary" 
        text 
        @click="loadMembers()" 
        :disabled="loading"
      />
    </div>
  </div>
</template>

<style scoped>
/* Aplica color negro a todos los textos */
* {
  color: black;
}

/* Sombra negra en botones personalizados */
.shadow-button {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.6);
}
</style>
