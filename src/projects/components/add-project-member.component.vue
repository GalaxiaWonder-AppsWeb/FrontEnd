<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import { organizationMemberService } from '../../organizations/services/organization-member.service';
import { projectTeamMemberService } from '../services/project-team-member.service';
import { projectService } from '../services/project.service.js';
import { Specialty } from '../model/specialty.js';
import { ProjectRole } from '../model/project-role.js';

// Define props y emits
const props = defineProps({
  projectId: {
    type: [Number, String],
    required: true,
    validator: (value) => {
      const id = Number(value);
      const isValid = !isNaN(id) && id > 0;
      if (!isValid) {
        console.error(`Invalid projectId prop: ${value}`);
      }
      return isValid;
    }
  }
});

const emit = defineEmits(['member-added']);

// Convertir el projectId a número
const projectId = computed(() => {
  return Number(props.projectId);
});
const organizationId = ref(null);

// Estados
const loading = ref(true);
const addingMember = ref(false);
const error = ref('');
const success = ref('');
const filterValue = ref('');

// Datos
const organizationMembers = ref([]);
const projectMembers = ref([]);
const selectedMembers = ref([]);
const membersToAdd = ref([]);
const roleOptions = Object.values(ProjectRole).map(role => ({
  label: role,
  value: role
}));
const specialtyOptions = Object.values(Specialty).map(specialty => ({
  label: specialty,
  value: specialty
}));

// Filtro para la tabla de miembros disponibles
const filteredAvailableMembers = computed(() => {
  if (!filterValue.value || !availableMembers.value) {
    return availableMembers.value;
  }
  
  const searchTerm = filterValue.value.toLowerCase();
  return availableMembers.value.filter(member => {
    // Buscar por nombre
    if (member.label && member.label.toLowerCase().includes(searchTerm)) {
      return true;
    }
    
    // Buscar por correo electrónico (verificando que exista)
    if (member.email && member.email.toLowerCase().includes(searchTerm)) {
      return true;
    }
    
    // Buscar en el objeto miembro
    if (member.member) {
      // Buscar en el email del miembro
      if (member.member.email && member.member.email.toLowerCase().includes(searchTerm)) {
        return true;
      }
      
      // Buscar en firstName y lastName si existen
      if (member.member.firstName && member.member.firstName.toLowerCase().includes(searchTerm)) {
        return true;
      }
      
      if (member.member.lastName && member.member.lastName.toLowerCase().includes(searchTerm)) {
        return true;
      }
    }
    
    return false;
  });
});

// Miembros disponibles (los que no están ya en el proyecto)
const availableMembers = computed(() => {
  // Ensure both arrays exist
  if (!organizationMembers.value || !Array.isArray(organizationMembers.value)) {
    console.log('organizationMembers no es un array válido, devolviendo lista vacía');
    return [];
  }
  
  if (!projectMembers.value || !Array.isArray(projectMembers.value)) {
    console.log('projectMembers no es un array válido, devolviendo todos los miembros de la organización');
    return organizationMembers.value.filter(member => member.type === 'Worker')
      .map(formatMemberForDropdown);
  }
  
  try {
    // Obtenemos los IDs de los miembros actuales del proyecto
    // Solo recopilar los IDs organizationMemberId, que es lo que realmente necesitamos
    const projectMemberOrganizationIds = [];
    
    console.log('Extrayendo organizationMemberId de miembros actuales del proyecto:', projectMembers.value);
    
    projectMembers.value.forEach((member, index) => {
      // Para cada miembro del proyecto, guardamos el organizationMemberId (o memberId que es lo mismo)
      const orgMemberId = member.organizationMemberId || member.memberId;
      
      if (orgMemberId) {
        // Convertir a número para comparaciones consistentes
        projectMemberOrganizationIds.push(Number(orgMemberId));
        console.log(`Proyecto - miembro ${index}: organizationMemberId = ${orgMemberId}`);
      }
    });

    console.log('IDs de miembros de organización ya en el proyecto:', projectMemberOrganizationIds);
    console.log('Total miembros de organización disponibles para filtrar:', organizationMembers.value.length);
    
    // Filtramos solo por organizationMemberId, que es el ID relevante
    const filteredMembers = organizationMembers.value.filter(member => {
      if (!member || typeof member !== 'object') {
        console.log('Miembro inválido encontrado, excluyendo:', member);
        return false;
      }
      
      // Obtener el ID del miembro de la organización
      const orgMemberId = Number(member.id);
      
      // Verificar si este miembro ya está en el proyecto
      const isAlreadyInProject = projectMemberOrganizationIds.includes(orgMemberId);
      
      // Verificar que el miembro sea un Worker (solo tipo Worker puede ser miembro de proyecto)
      const isWorker = member.type === 'Worker';
      
      const shouldInclude = !isAlreadyInProject && isWorker;
      
      if (!shouldInclude) {
        const reason = !isWorker ? "No es worker" : "Ya está en el proyecto";
        console.log(`Miembro ${orgMemberId} excluido. Razón: ${reason}`);
      } else {
        console.log(`Miembro ${orgMemberId} incluido en la lista de disponibles`);
      }
      
      return shouldInclude;
    });
    
    console.log(`Después de filtrar: ${filteredMembers.length} miembros disponibles`);
    
    // Formateamos los miembros para el dropdown
    return filteredMembers.map(formatMemberForDropdown);
  } catch (err) {
    console.error('Error al filtrar miembros disponibles:', err);
    return [];
  }
});

// Función auxiliar para formatear un miembro para el dropdown
const formatMemberForDropdown = (member) => {
  // IMPORTANTE: Usar el ID del miembro de la organización, no el ID de la persona
  const memberId = member.id; // Este es el organizationMemberId que necesitamos
  const personId = member.personId; // Este es el ID de la persona asociada
  
  console.log(`Preparando miembro para dropdown. ID del miembro: ${memberId}, ID de la persona: ${personId}`, member);
  
  // Crear el nombre a mostrar
  let displayName = 'Unknown Member';
  if (member.firstName && member.lastName) {
    displayName = `${member.firstName} ${member.lastName}`;
  } else if (member.personId) {
    displayName = `Member ID: ${memberId} (Persona: ${personId})`;
  }
  
  // Obtener el email si está disponible
  const email = member.email || '';
  
  return {
    label: displayName,
    value: memberId, // Este es el organizationMemberId que usaremos para agregar al proyecto
    personId: personId, // Guardamos el personId para referencia
    member: member,
    email: email,
    debug: `Miembro ID: ${memberId}, Persona ID: ${personId}`
  };
};

// Función para cargar la información del proyecto para obtener la organizationId
const loadProjectDetails = async () => {
  try {
    // Validar que el projectId sea válido
    if (projectId.value === null || isNaN(projectId.value)) {
      throw new Error(`ID de proyecto inválido: ${projectId.value}`);
    }
    
    // Asegurarse de que el ID sea un número válido
    const validProjectId = Number(projectId.value);
    
    // Usamos el servicio de proyectos para obtener los detalles
    const project = await projectService.getById(validProjectId);
    
    if (!project) {
      throw new Error(`No se pudo obtener la información del proyecto con ID: ${validProjectId}`);
    }
    
    if (!project.organizationId) {
      throw new Error('El proyecto no tiene una organización asignada');
    }
    
    organizationId.value = project.organizationId;
    return project;
  } catch (err) {
    error.value = 'No se pudieron cargar los detalles del proyecto';
    return null;
  }
};

// Función para cargar miembros de la organización
const loadOrganizationMembers = async () => {
  try {
    // Validar el ID de la organización
    if (!organizationId.value || isNaN(Number(organizationId.value))) {
      error.value = 'ID de organización inválido';
      organizationMembers.value = [];
      return;
    }
    
    // Intentar con getByOrgId
    const response = await organizationMemberService.getByOrgId({id: organizationId.value});
    
    // Crear un array temporal para guardar los miembros
    let tempMembers = [];
    
    // Check if the response has a data property (which should be an array)
    if (response && response.data && Array.isArray(response.data)) {
      tempMembers = response.data;
    } else if (Array.isArray(response)) {
      // If the response is already an array
      tempMembers = response;
    } else {
      // Si el formato es inesperado, intentar consultar directamente a la API
      try {
        const apiUrl = `${import.meta.env.VITE_PROPGMS_API_URL || 'http://localhost:3000'}/members?organizationId=${organizationId.value}`;
        const directResponse = await fetch(apiUrl);
        if (directResponse.ok) {
          tempMembers = await directResponse.json();
        } else {
          tempMembers = [];
        }
      } catch (directError) {
        tempMembers = [];
      }
    }
    
    // Filtrar solo los miembros con rol "Worker" 
    organizationMembers.value = tempMembers.filter(member => member.type === 'Worker');
    
    // Obtener más información de cada miembro (como su correo electrónico) si es necesario
    for (const member of organizationMembers.value) {      try {
        // Si tenemos personId, intentamos obtener más información de la persona
        if (member.personId) {
          // URL correcta para la API: /persons/ (según la estructura de tu db.json)
          const personUrl = `${import.meta.env.VITE_PROPGMS_API_URL || 'http://localhost:3000'}/persons/${member.personId}`;
          try {
            const personResponse = await fetch(personUrl);
            if (personResponse.ok) {
              const personData = await personResponse.json();
              // Añadir información de la persona al miembro
              member.firstName = personData.firstName || '';
              member.lastName = personData.lastName || '';
              member.email = personData.email || '';
            }
          } catch (error) {
            // Error silencioso
          }
        }
      } catch (personError) {
        // Error silencioso
      }
    }
    } catch (err) {
    error.value = 'No se pudieron cargar los miembros de la organización';
    organizationMembers.value = []; // Ensure it's an array even on error
  }
};

// Función para cargar miembros actuales del proyecto
const loadProjectMembers = async () => {
  try {
    if (projectId.value === null || isNaN(projectId.value)) {
      error.value = 'ID de proyecto inválido';
      projectMembers.value = []; // Ensure it's an array
      return;
    }
    
    // Corregido: pasando el objeto con propiedad projectId
    const response = await projectTeamMemberService.getByProjectId({ projectId: projectId.value });
    
    // Ensure we always set an array
    if (Array.isArray(response)) {
      projectMembers.value = response;
    } else if (response && Array.isArray(response.data)) {
      projectMembers.value = response.data;
    } else {
      projectMembers.value = [];
    }
  } catch (err) {
    error.value = 'No se pudieron cargar los miembros del proyecto';
    projectMembers.value = []; // Ensure it's an array even on error
  }
};

// Función para preparar los miembros seleccionados para su asignación
const prepareSelectedMembers = () => {
  if (!selectedMembers.value || selectedMembers.value.length === 0) {
    error.value = 'Por favor, selecciona al menos un miembro';
    return false;
  }
  
  // Verificar que todos los miembros seleccionados sean válidos
  const validMembers = selectedMembers.value.filter(member => 
    member && member.value && member.label
  );
  
  if (validMembers.length === 0) {
    error.value = 'No se pudo procesar la selección. Por favor, selecciona los miembros nuevamente.';
    return false;
  }
  
  if (validMembers.length < selectedMembers.value.length) {
    console.warn(`Se encontraron ${selectedMembers.value.length - validMembers.length} miembros inválidos en la selección`);
  }
    // Crear registros para cada miembro seleccionado con roles y especialidades por defecto
  membersToAdd.value = validMembers.map(member => {
    console.log(`Preparando miembro para agregar:`, member);
    
    return {
      memberId: member.value, // Este es el organizationMemberId (ID de la colección "members")
      personId: member.personId, // Guardamos también el personId para referencia
      name: member.label,
      role: ProjectRole.SPECIALIST, // Por defecto, todos son especialistas
      specialty: Specialty.ARCHITECTURE, // Especialidad por defecto
      debug: `Usando miembro: ${member.value}, persona: ${member.personId}`
    };
  });
  
  console.log('Miembros preparados para añadir:', membersToAdd.value);
  
  return true;
};

// Función para validar que todos los miembros tengan roles y especialidades asignadas correctamente
const validateMembersToAdd = () => {
  if (membersToAdd.value.length === 0) {
    error.value = 'No hay miembros seleccionados para agregar';
    return false;
  }
  
  let hasError = false;
  
  // Verificar cada miembro
  for (const member of membersToAdd.value) {
    // Verificar que tenga un rol asignado
    if (!member.role) {
      error.value = `Por favor, asigna un rol a ${member.name}`;
      hasError = true;
      break;
    }
    
    // Si es SPECIALIST, verificar que tenga una especialidad
    if (member.role === ProjectRole.SPECIALIST) {
      if (!member.specialty) {
        error.value = `Por favor, asigna una especialidad a ${member.name} (rol Especialista)`;
        hasError = true;
        break;
      }
    }
    
    // Si no es SPECIALIST ni COORDINATOR, mostrar un error
    if (member.role !== ProjectRole.SPECIALIST && member.role !== ProjectRole.COORDINATOR) {
      error.value = `El rol '${member.role}' no es válido para ${member.name}. Debe ser COORDINATOR o SPECIALIST`;
      hasError = true;
      break;
    }
  }
  
  // Si hay COORDINATOR y SPECIALIST, verificar que los especialistas tengan su especialidad
  const hasCoordinator = membersToAdd.value.some(m => m.role === ProjectRole.COORDINATOR);
  const specialists = membersToAdd.value.filter(m => m.role === ProjectRole.SPECIALIST);
  
  if (!hasError && specialists.length > 0) {
    // Verificar que cada especialista tenga una especialidad asignada
    for (const specialist of specialists) {
      if (!specialist.specialty) {
        error.value = `El miembro ${specialist.name} es un especialista, pero no tiene una especialidad asignada`;
        hasError = true;
        break;
      }
    }
  }
  
  return !hasError;
};

// Función para agregar miembros al proyecto
const addMembersToProject = async () => {
  // Validar projectId antes de continuar
  if (projectId.value === null || isNaN(projectId.value)) {
    error.value = 'ID de proyecto inválido o no especificado';
    return;
  }

  if (!validateMembersToAdd()) {
    return;
  }

  try {
    addingMember.value = true;
    error.value = '';
    success.value = ''; // Limpiar mensajes anteriores

    console.log(`Iniciando adición de ${membersToAdd.value.length} miembro(s) al proyecto ${projectId.value}...`);

    // Agregar cada miembro seleccionado al proyecto
    for (const member of membersToAdd.value) {
      try {
        // Agregar un miembro a la vez para evitar problemas de concurrencia
        console.log(`Agregando miembro al proyecto: memberId=${member.memberId}, role=${member.role}, specialty=${member.specialty}`);
        
        const result = await projectTeamMemberService.addToProject(
          projectId.value,
          member.memberId, // Este debe ser el ID del miembro de la organización
          member.specialty,
          member.role
        );
        
        console.log(`Miembro ${member.memberId} (${member.name}) agregado con éxito:`, result);
        
        // Recargar la lista de miembros del proyecto después de cada adición
        await loadProjectMembers();
      } catch (memberError) {
        console.error(`Error agregando miembro ${member.memberId} (${member.name}):`, memberError);
        // Continuar con los siguientes miembros en caso de error
      }
    }
    
    // Reiniciar el formulario
    selectedMembers.value = [];
    membersToAdd.value = [];

    // Re-cargar listas completas al finalizar
    await loadOrganizationMembers();
    await loadProjectMembers();

    success.value = 'Miembros agregados al proyecto exitosamente';
    console.log('Miembros agregados exitosamente, listas recargadas');
    
    // Emit event to parent that members were added
    emit('member-added');
    
    // Limpiar el mensaje de éxito después de un tiempo
    setTimeout(() => {
      success.value = '';
    }, 3000);
  } catch (err) {
    console.error('Error general al agregar miembros:', err);
    error.value = `No se pudo agregar los miembros al proyecto: ${err.message || 'Error desconocido'}`;
  } finally {
    addingMember.value = false;
  }
};

// Vigilamos cambios en la lista de miembros del proyecto
// para actualizar la lista de miembros disponibles
watch(projectMembers, async (newMembers, oldMembers) => {
  console.log('projectMembers cambió:', newMembers);
  
  // Si la lista ha cambiado y estamos agregando miembros (no al inicializarse)
  if (oldMembers && oldMembers.length !== newMembers.length && !loading.value) {
    console.log('Detectado cambio en miembros del proyecto, refrescando miembros disponibles...');
    // No es necesario recargar de la API, el computed se recalculará automáticamente
  }
}, { deep: true });

// Cargamos los datos al montar el componente
onMounted(async () => {
  console.log('Inicializando componente add-project-member con projectId:', projectId.value);
  try {
    loading.value = true;
    error.value = ''; // Limpiamos cualquier error previo
    success.value = ''; // Limpiamos cualquier mensaje de éxito previo
    
    // Verificar que el ID del proyecto sea válido antes de continuar
    if (projectId.value === null || isNaN(projectId.value)) {
      error.value = `ID de proyecto inválido o no especificado: ${props.projectId}`;
      loading.value = false;
      return;
    }
    
    console.log(`Cargando detalles del proyecto ${projectId.value}...`);
    const project = await loadProjectDetails();

    if (project) {
      console.log(`Proyecto cargado:`, project);
      if (!organizationId.value) {
        error.value = `El proyecto no tiene una organización asociada (ID proyecto: ${projectId.value})`;
        loading.value = false;
        return;
      }
      
      console.log(`Cargando miembros de la organización ${organizationId.value}...`);
      await loadOrganizationMembers();
      
      console.log(`Cargando miembros actuales del proyecto ${projectId.value}...`);
      await loadProjectMembers();
      
      console.log(`Inicialización completa. Miembros de organización: ${organizationMembers.value.length}, Miembros de proyecto: ${projectMembers.value.length}`);
    } else {
      error.value = `No se pudo cargar la información del proyecto ${projectId.value}`;
    }
  } catch (err) {
    console.error('Error initializing component:', err);
    error.value = 'No se pudo inicializar el componente: ' + (err.message || 'Error desconocido');
  } finally {
    loading.value = false;
  }
});
</script>

<template>  
  <div class="add-project-member">
    <h2 class="title">{{ $t('projects.working-team.add-member.subtitle') }}</h2>    <div v-if="loading" class="loading">
      <pv-progress-spinner style="width: 50px; height: 50px;" />
      <p>Cargando miembros de la organización...</p>
    </div>

    <div v-else>
      <pv-message v-if="error" severity="error" :closable="true" @close="error = ''">
        {{ error }}
        <div v-if="error.includes('inicializar')" class="error-details">
          <button @click="$emit('member-added')" class="p-link">Cerrar y volver</button>
        </div>
      </pv-message>

      <pv-message v-if="success" severity="success" :closable="true" @close="success = ''">
        {{ success }}
      </pv-message>
      
      <div v-if="!loading && !error && availableMembers.length === 0" class="empty-state">
        <i class="pi pi-exclamation-triangle" style="font-size: 2rem; color: var(--yellow-500);"></i>
        <h3>{{$t('projects.working-team.add-member.no-members')}}</h3>
        <pv-button label="Cerrar" icon="pi pi-times" @click="$emit('member-added')" class="mt-3" />
      </div>
      
      <div class="member-selection-section">        <h3>{{$t('projects.working-team.add-member.first-step')}}</h3>
        
        <pv-message severity="info" :closable="false" style="margin-bottom: 1rem">
          <div>
            <i class="pi pi-info-circle mr-2"></i>
            <span><strong>Información:</strong> Solo se muestran miembros de la organización que no han sido agregados previamente al proyecto. Si no ve algún miembro, puede que ya esté asignado al proyecto.</span>
          </div>
        </pv-message>
        
        <div class="search-container">
          <span class="p-input-icon-left">
            <i class="pi pi-search" />
            <pv-input-text 
              v-model="filterValue" 
              :placeholder="$t('projects.working-team.add-member.first-step-placeholder')"
              class="w-full" 
            />
          </span>
        </div>
          <div v-if="availableMembers.length === 0" class="no-members-message">
          <i class="pi pi-exclamation-circle"></i>
          <span>{{$t('projects.working-team.add-member.no-members')}}</span>
          <pv-button 
            icon="pi pi-refresh" 
            class="p-button-text p-button-sm ml-2" 
            @click="async () => { 
              await loadOrganizationMembers(); 
              await loadProjectMembers(); 
            }"
            title="Recargar lista de miembros disponibles"
          />
        </div>
        <div v-else class="member-selection">          <pv-multi-select
            v-model="selectedMembers"
            :options="filteredAvailableMembers"
            optionLabel="label"
            placeholder="Selecciona los miembros que deseas agregar"
            :disabled="addingMember || membersToAdd.length > 0"
            class="w-full mb-3"
            :filter="true"
            display="chip"
            :maxSelectedLabels="3"
            :virtualScrollerOptions="{ itemSize: 40 }"
          >            <template #option="slotProps">
              <div class="member-option">
                <div class="member-name">{{ slotProps.option.label }}</div>
                <div class="member-email">
                  {{ slotProps.option.email || slotProps.option.member?.email || 'Sin correo electrónico' }}
                </div>
                <div class="member-ids">
                  <small>ID Miembro: <strong>{{ slotProps.option.value }}</strong>, 
                  ID Persona: <strong>{{ slotProps.option.personId }}</strong></small>
                </div>
              </div>
            </template>            <template #value="slotProps">
              <div class="member-value">
                <span>{{ slotProps.value?.label || $t('projects.working-team.add-member.first-step-select') }}</span>
                <span class="member-email-chip" v-if="slotProps.value">
                  ({{ slotProps.value.email || slotProps.value.member?.email }})
                </span>
              </div>
            </template>
          </pv-multi-select>
            <div class="selection-info" v-if="selectedMembers.length > 0">
            <i class="pi pi-users"></i>
            <span>{{ selectedMembers.length }} miembro(s) seleccionado(s)</span>
          </div>
          
          <div class="refresh-section">
            <pv-button 
              icon="pi pi-refresh" 
              class="p-button-outlined p-button-sm mb-3"
              @click="async () => { 
                await loadOrganizationMembers(); 
                await loadProjectMembers(); 
              }"
              label="Recargar lista de miembros"
            />
            <small class="ml-2 text-color-secondary">{{ availableMembers.length }} miembro(s) disponible(s)</small>
          </div>
          <pv-button
            :disabled="selectedMembers.length === 0 || membersToAdd.length > 0"
            :label="$t('projects.working-team.add-member.first-step-button')"
            icon="pi pi-arrow-right"
            @click="prepareSelectedMembers"
            class="mt-3"
          />
        </div>
      </div>
        <div v-if="membersToAdd.length > 0" class="role-assignment-section">
        <h3>{{$t('projects.working-team.add-member.second-step.title')}}</h3>
        <p class="instruction">{{ $t('projects.working-team.add-member.second-step.description') }}</p>
        
        <pv-data-table :value="membersToAdd" class="mb-3" stripedRows responsiveLayout="stack">
          <pv-column field="name" :header="$t('projects.working-team.add-member.second-step.table.name')"></pv-column>
          <pv-column field="role" :header="$t('projects.working-team.add-member.second-step.table.role')">
            <template #body="{ data, index }">
              <pv-dropdown
                v-model="membersToAdd[index].role"
                :options="roleOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="Selecciona un rol"
                class="w-full"
                :disabled="addingMember"
              />
            </template>
          </pv-column>
          <pv-column field="specialty" :header="$t('projects.working-team.add-member.second-step.table.specialty')">
            <template #body="{ data, index }">
              <pv-dropdown
                v-if="membersToAdd[index].role === ProjectRole.SPECIALIST"
                v-model="membersToAdd[index].specialty"
                :options="specialtyOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="Selecciona una especialidad"
                class="w-full"
                :disabled="addingMember"
              />
              <span v-else class="not-applicable">No aplica</span>
            </template>
          </pv-column>
        </pv-data-table>
        
        <div class="button-container">
          <pv-button
            outlined
            :label="$t('projects.working-team.add-member.second-step.back-button')"
            icon="pi pi-arrow-left"
            @click="membersToAdd = []"
            class="p-button-secondary mr-2"
            :disabled="addingMember"
          />
          <pv-button
            :label="$t('projects.working-team.add-member.second-step.button')"
            icon="pi pi-users"
            @click="addMembersToProject"
            :loading="addingMember"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
* {
  color: white;
}
.title {
  color:White;
}

.add-project-member {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

h2 {
  margin-bottom: 20px;
  color: var(--text-color);
}

h3 {
  margin-top: 1.5rem;
  margin-bottom: 1rem;
  font-size: 1.25rem;
  color: var(--text-color);
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 20px;
}

.member-selection-section, .role-assignment-section {
  background-color: var(--surface-card);
  border-radius: 6px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.search-container {
  margin-bottom: 1rem;
}

.member-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-top: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.instruction {
  color: var(--text-color-secondary);
  font-style: italic;
  margin-bottom: 1rem;
}

.button-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 1rem;
}

.no-members-message {
  display: flex;
  align-items: center;
  color: var(--text-color-secondary);
  font-style: italic;
  padding: 1rem 0;
}

.no-members-message i {
  margin-right: 0.5rem;
  font-size: 1.2rem;
}

.selection-info {
  display: flex;
  align-items: center;
  color: var(--text-color-secondary);
  margin-bottom: 1rem;
}

.selection-info i {
  margin-right: 0.5rem;
  font-size: 1.2rem;
}

.refresh-section {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}

.member-option {
  padding: 0.5rem 0;
}

.member-name {
  font-weight: 500;
}

.member-email {
  font-size: 0.85rem;
  color: var(--text-color-secondary);
}

.member-ids {
  font-size: 0.75rem;
  color: var(--text-color-secondary);
  margin-top: 0.25rem;
  background-color: var(--surface-ground);
  padding: 0.25rem 0.5rem;
  border-radius: 3px;
}

.not-applicable {
  color: var(--text-color-secondary);
  font-style: italic;
}

/* Make PrimeVue components use full width */
:deep(.p-dropdown), :deep(.p-multiselect) {
  width: 100%;
}

:deep(.p-datatable-tbody > tr > td) {
  padding: 0.75rem 1rem;
}

/* Estilos para el email en la selección de miembros */
.member-email-chip {
  font-size: 0.8rem;
  color: var(--text-color-secondary);
  margin-left: 0.5rem;
}

/* Estilo para resaltar usuarios sin email */
.member-email:empty::after {
  content: 'Sin correo electrónico';
  color: var(--pink-500);
  font-style: italic;
}

/* Estilo para destacar los mensajes importantes */
.important-message {
  background-color: var(--yellow-50);
  border-left: 3px solid var(--yellow-500);
  padding: 0.5rem 1rem;
  margin: 1rem 0;
  color: var(--text-color);
}

/* Estilos para el estado vacío */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
  background-color: var(--surface-ground);
  border-radius: 8px;
  margin: 1rem 0;
}

.empty-state h3 {
  margin-top: 1rem;
  margin-bottom: 0.5rem;
  color: var(--text-color);
}

.empty-state p {
  margin: 0.5rem 0;
  color: var(--text-color-secondary);
}

.empty-state .subtitle {
  font-weight: bold;
  margin-top: 1rem;
  margin-bottom: 0.25rem;
}

.empty-state ul {
  text-align: left;
  margin: 0.5rem 0;
  padding-left: 1.5rem;
}

.empty-state ul li {
  margin: 0.25rem 0;
  color: var(--text-color-secondary);
}

/* Estilos para detalles de error */
.error-details {
  margin-top: 0.5rem;
  font-size: 0.9rem;
}
</style>