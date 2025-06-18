<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import { projectTeamMemberService } from '../services/project-team-member.service.js';
import { personService } from '../../shared/services/person.service.js';
import { TaskStatus } from '../model/task-status.js';
import { ProjectRole } from '../model/project-role.js';

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

// Route y data
const route = useRoute();
const projectId = computed(() => {
  const id = Number(route.params.projectId);
  return isNaN(id) ? null : id;
});
const teamMembers = ref([]);
const personDetails = ref({});
const loading = ref(false);
const selectedMemberId = ref(null);
const error = ref(null);
const searchQuery = ref("");

// Cargamos los miembros del proyecto con la especialidad requerida
const loadProjectMembers = async () => {
  console.log(`Iniciando carga de miembros para proyecto ID: ${projectId.value}`);
  
  if (!projectId.value) {
    console.error("No se pudo determinar el ID del proyecto");
    error.value = "No se pudo determinar el ID del proyecto";
    return;
  }

  if (!props.task) {
    console.error("No hay una tarea definida para asignar responsable");
    error.value = "No hay una tarea definida para asignar responsable";
    return;
  }

  if (!props.task.specialty) {
    console.warn("La tarea no tiene especialidad definida, se cargarán todos los miembros");
  }

  try {
    loading.value = true;
    error.value = null;
    
    console.log(`Buscando miembros para proyecto ${projectId.value} con especialidad ${props.task.specialty || 'cualquiera'}`);
    
    // Usar la función para obtener miembros por especialidad (ahora con mejor manejo de errores)
    let members = [];
    
    if (props.task.specialty) {
      // Intentar primero con la especialidad específica
      console.log(`Buscando miembros con especialidad: ${props.task.specialty}`);
      try {
        members = await projectTeamMemberService.getByProjectIdAndSpecialty({
          projectId: projectId.value,
          specialty: props.task.specialty
        });
        console.log(`Encontrados ${members?.length || 0} miembros con especialidad específica`);
      } catch (specialtyError) {
        console.error("Error buscando por especialidad específica:", specialtyError);
        members = [];
      }
    }
    
    // Si no hay miembros con esa especialidad o no se especificó especialidad, 
    // intentar cargar todos los miembros del proyecto
    if (!members || members.length === 0) {
      console.log(`No se encontraron miembros con la especialidad, cargando todos los miembros del proyecto ${projectId.value}`);
      try {
        const allMembers = await projectTeamMemberService.getByProjectId({ 
          projectId: projectId.value 
        });
        
        console.log(`Encontrados ${allMembers?.length || 0} miembros del proyecto en total`);
        teamMembers.value = allMembers || [];
      } catch (allMembersError) {
        console.error("Error cargando todos los miembros:", allMembersError);
        teamMembers.value = [];
        error.value = "No se pudieron cargar los miembros del proyecto";
      }
    } else {
      teamMembers.value = members;
    }
    
    // Si no encontramos miembros de ninguna forma, probar un último recurso:
    // obtener todos los project-team-members y filtrar manualmente
    if (!teamMembers.value.length) {
      console.log("Intentando último recurso: obtener todos los miembros de equipos y filtrar manualmente");
      try {
        const apiUrl = import.meta.env.VITE_PROPGMS_API_URL || 'http://localhost:3000';
        const response = await fetch(`${apiUrl}/project-team-members`);
        
        if (response.ok) {
          const allTeamMembers = await response.json();
          console.log(`Obtenidos ${allTeamMembers.length} miembros de equipos en total`);
          
          // Filtrar manualmente por projectId
          const filteredMembers = allTeamMembers.filter(m => 
            m.projectId === Number(projectId.value)
          );
          
          console.log(`Después de filtrar por projectId=${projectId.value}, quedan ${filteredMembers.length} miembros`);
          teamMembers.value = filteredMembers;
        }
      } catch (lastResortError) {
        console.error("Error en último intento de carga:", lastResortError);
      }
    }
    
    // Cargar detalles de cada miembro
    if (teamMembers.value.length) {
      console.log(`Cargando detalles para ${teamMembers.value.length} miembros`);
      await loadMemberDetails();
    } else {
      console.warn("No se encontraron miembros para el proyecto");
      error.value = `No se encontraron miembros en el equipo del proyecto ${projectId.value}`;
    }
  } catch (err) {
    console.error('Error general cargando miembros del proyecto:', err);
    error.value = 'No se pudieron cargar los miembros del equipo. Por favor, intente nuevamente.';
  } finally {
    loading.value = false;
  }
};

// Cargar detalles de cada miembro (nombres, etc.)
const loadMemberDetails = async () => {
  if (!teamMembers.value || !teamMembers.value.length) {
    console.log("No hay miembros para cargar detalles");
    return;
  }
  
  console.log("Cargando detalles para miembros:", teamMembers.value);
  
  const apiUrl = import.meta.env.VITE_PROPGMS_API_URL || 'http://localhost:3000';
  
  for (const member of teamMembers.value) {
    try {
      if (!member) {
        console.warn("Miembro inválido encontrado en el array");
        continue;
      }
      
      console.log("Procesando miembro:", member);
      
      // Determinar el ID correcto para buscar. Podría ser organizationMemberId o memberId
      const orgMemberId = member.organizationMemberId || member.memberId;
      
      if (!orgMemberId) {
        console.warn("El miembro no tiene ID definido:", member);
        continue;
      }
      
      // 1. Primero, cargar el miembro de la organización para obtener el personId
      console.log(`Consultando miembro de organización con ID ${orgMemberId} en ${apiUrl}/members/${orgMemberId}`);
      
      try {
        const orgMemberResponse = await fetch(`${apiUrl}/members/${orgMemberId}`);
        
        if (!orgMemberResponse.ok) {
          throw new Error(`Error al obtener miembro de organización con ID ${orgMemberId}: ${orgMemberResponse.status}`);
        }
        
        const orgMember = await orgMemberResponse.json();
        console.log(`Miembro de organización obtenido:`, orgMember);
        
        // 2. Ahora, cargar la información de la persona usando el personId
        if (!orgMember.personId) {
          console.warn(`El miembro de organización no tiene personId definido:`, orgMember);
          continue;
        }
        
        console.log(`Cargando detalles para persona con ID: ${orgMember.personId}`);
        const personResponse = await fetch(`${apiUrl}/persons/${orgMember.personId}`);
        
        if (!personResponse.ok) {
          throw new Error(`Error al obtener persona con ID ${orgMember.personId}: ${personResponse.status}`);
        }
        
        const person = await personResponse.json();
        console.log(`Persona obtenida:`, person);
        
        // Almacenar la información de la persona en el cache
        personDetails.value[orgMemberId] = person;
        
      } catch (fetchError) {
        console.error(`Error en petición fetch:`, fetchError.message);
        
        // Intento alternativo: si el miembro tiene personId directamente, intentar usarlo
        if (member.personId) {
          console.log(`Intentando cargar persona directamente con ID: ${member.personId}`);
          try {
            const directPersonResponse = await fetch(`${apiUrl}/persons/${member.personId}`);
            if (directPersonResponse.ok) {
              const person = await directPersonResponse.json();
              console.log(`Persona obtenida directamente:`, person);
              personDetails.value[orgMemberId] = person;
            }
          } catch (directError) {
            console.error(`Error al obtener persona directamente:`, directError);
          }
        }
      }
    } catch (err) {
      console.error(`Error general cargando detalles del miembro:`, err);
    }
  }
};

// Filtrar miembros por especialidad coincidente con la tarea
const filteredMembers = computed(() => {
  if (!teamMembers.value || !teamMembers.value.length) {
    console.log("No hay miembros para filtrar");
    return [];
  }
  
  console.log("Filtrando miembros. Total miembros:", teamMembers.value.length);
  
  // Primero, verificar si hay miembros con la especialidad exacta
  const exactSpecialtyMembers = teamMembers.value.filter(member => {
    if (!member) return false;
    return member.specialty === props.task.specialty && member.role === ProjectRole.SPECIALIST;
  });
  
  // Si encontramos miembros con la especialidad exacta, usamos solo esos
  const membersToFilter = exactSpecialtyMembers.length > 0 ? exactSpecialtyMembers : teamMembers.value;
  console.log(`Usando ${membersToFilter.length} miembros para filtrar (${exactSpecialtyMembers.length} con especialidad exacta)`);
  
  // Ahora aplicamos los filtros adicionales
  const filtered = membersToFilter.filter(member => {
    // Verificar que el miembro sea válido
    if (!member) {
      console.warn("Miembro inválido encontrado durante filtrado");
      return false;
    }
    
    // Determinar los criterios de coincidencia
    const matchesRole = member.role === ProjectRole.SPECIALIST;
    
    // Variable para especialidad: si estamos usando membersToFilter = exactSpecialtyMembers, 
    // entonces ya sabemos que todos coinciden con la especialidad
    const matchesSpecialty = exactSpecialtyMembers.length > 0 ? true : (
      // Si estamos usando todos los miembros, debemos verificar la especialidad
      member.specialty === props.task.specialty
    );
    
    // Determinar el ID del miembro a usar para búsqueda y mostrar información
    const memberId = member.organizationMemberId || member.memberId;
    
    // Filtrar por término de búsqueda si existe
    let matchesSearch = true;
    if (searchQuery.value && searchQuery.value.trim() !== '') {
      const query = searchQuery.value.toLowerCase().trim();
      const person = personDetails.value[memberId];
      
      if (person) {
        const fullName = `${person.name || ''} ${person.lastName || ''}`.toLowerCase();
        matchesSearch = fullName.includes(query) || 
                      (person.email && person.email.toLowerCase().includes(query));
      } else {
        // Si no podemos buscar por datos personales, intentar buscar en los datos del miembro
        matchesSearch = false;
        console.log(`No se encontraron datos personales para el miembro ${memberId} durante la búsqueda`);
      }
    }
    
    const shouldInclude = matchesRole && matchesSearch && (exactSpecialtyMembers.length > 0 || matchesSpecialty);
    
    if (!shouldInclude) {
      const reason = !matchesRole ? "No es especialista" : 
                     !matchesSearch ? "No coincide con término de búsqueda" : 
                     !matchesSpecialty ? "No coincide con especialidad requerida" : "Desconocido";
      console.log(`Miembro ${memberId} excluido. Razón: ${reason}`);
    }
    
    return shouldInclude;
  });
  
  console.log(`Filtrado completado. Miembros resultantes: ${filtered.length}`);
  return filtered;
});

// Comprobar si el miembro ya es responsable de la tarea
const isCurrentResponsible = (memberId) => {
  if (!memberId || !props.task) return false;
  
  // Comprobar diferentes posibles formatos del ID
  const responsibleId = props.task.responsible;
  
  if (!responsibleId) return false;
  
  // Intentar como string y como número
  return (
    responsibleId === memberId || 
    responsibleId === Number(memberId) || 
    String(responsibleId) === String(memberId)
  );
};

// Formatear el nombre del miembro para mostrar
const getMemberName = (memberId) => {
  if (!memberId) return "Miembro desconocido";
  
  console.log(`Intentando obtener nombre para miembro con ID: ${memberId}`);
  console.log(`Estado actual de personDetails:`, personDetails.value);
  
  const person = personDetails.value[memberId];
  if (!person) {
    // Si no tenemos datos de esta persona, buscar si hay algún personId disponible
    console.log(`No se encontraron datos de persona para miembro ${memberId}, intentando encontrar alternativas`);
    
    // Buscar si tenemos este miembro en teamMembers
    const teamMember = teamMembers.value.find(m => 
      m.id === memberId || 
      m.memberId === memberId || 
      m.organizationMemberId === memberId
    );
    
    if (teamMember && teamMember.personId && personDetails.value[teamMember.personId]) {
      console.log(`Encontrado personId alternativo: ${teamMember.personId}`);
      const alternatePerson = personDetails.value[teamMember.personId];
      const altFirstName = alternatePerson.name || '';
      const altLastName = alternatePerson.lastName || '';
      return `${altFirstName} ${altLastName}`.trim() || `Miembro ${memberId}`;
    }
    
    return `Miembro ${memberId}`;
  }

  const firstName = person.name || '';
  const lastName = person.lastName || '';
  
  if (!firstName && !lastName) return `Miembro ${memberId}`;
  
  return `${firstName} ${lastName}`.trim();
};

// Manejar asignación de responsable
const handleAssign = () => {
  console.log(`Intentando asignar miembro con ID: ${selectedMemberId.value}`);
  
  if (!selectedMemberId.value) {
    console.warn("No se ha seleccionado ningún miembro");
    return;
  }
  
  // Verificar si tenemos datos de la persona para este miembro
  const person = personDetails.value[selectedMemberId.value];
  console.log(`Datos de persona para el miembro seleccionado:`, person);
  
  // Encontrar el miembro completo en la lista filtrada para tener todos sus datos
  const selectedMember = filteredMembers.value.find(m => 
    m.id === selectedMemberId.value || 
    m.organizationMemberId === selectedMemberId.value || 
    m.memberId === selectedMemberId.value
  );
  
  console.log("Miembro completo seleccionado:", selectedMember);
  
  // Emitir el ID del miembro seleccionado
  emit('assign', selectedMemberId.value);
  
  // Cerrar el diálogo después de asignar
  emit('update:visible', false);
};

// Cerrar el diálogo
const handleCancel = () => {
  emit('cancel');
};

// Actualizar visibilidad
const updateVisible = (value) => {
  emit('update:visible', value);
  if (value) {
    // Si el diálogo se vuelve visible, establecer el miembro responsable actual como seleccionado
    if (props.task && props.task.responsible) {
      selectedMemberId.value = props.task.responsible;
    }
  }
};

// Observar cambios en la visibilidad para cargar datos
watch(() => props.visible, (isVisible) => {
  console.log(`Dialog visibility changed to: ${isVisible}`);
  if (isVisible) {
    // Forzar carga de miembros con timeout para asegurar que el dialog esté completamente renderizado
    setTimeout(() => {
      loadProjectMembers();
    }, 200);
  }
}, { immediate: true });

// Observar cambios en la tarea para recargar los miembros si cambia
watch(() => props.task, (newTask) => {
  console.log(`Task changed:`, newTask);
  if (props.visible && newTask) {
    loadProjectMembers();
  }
}, { deep: true });

// Cargar datos al montar el componente
onMounted(() => {
  console.log(`Component mounted. Dialog visible: ${props.visible}`);
  if (props.visible) {
    loadProjectMembers();
  }
});
</script>

<template>
  <pv-dialog 
    :visible="visible" 
    @update:visible="updateVisible"
    :modal="true"
    :closable="true"
    :style="{ width: '600px' }"
    header="Asignar Responsable a Tarea"
  >
    <div class="assign-container">
      <div v-if="loading" class="loading">
        <pv-progress-spinner size="50" />
        <p>Cargando miembros del equipo...</p>
      </div>

      <div v-else-if="error" class="error">
        <p>{{ error }}</p>
        <pv-button label="Reintentar" icon="pi pi-refresh" @click="loadProjectMembers" />
      </div>
      
      <div v-else class="member-selection">
        <div class="task-info">
          <h3>Tarea: {{ props.task.name }}</h3>
          <div class="task-specialty">
            <span class="label">Especialidad requerida:</span>
            <pv-tag :value="props.task.specialty" severity="success" />
          </div>
        </div>

        <div class="search-container">
          <span class="p-input-icon-left">
            <i class="pi pi-search" />
            <pv-input-text v-model="searchQuery" placeholder="Buscar miembro..." class="w-full" />
          </span>
        </div>        <div v-if="filteredMembers.length === 0" class="empty-filtered-members">
          <i class="pi pi-exclamation-circle"></i>
          <p>No hay especialistas disponibles con la especialidad {{ props.task.specialty }}.</p>
          <pv-button label="Cargar todos los miembros" icon="pi pi-users" class="p-button-outlined p-button-sm mt-3" @click="loadProjectMembers" />
        </div>
        
        <div v-else class="form-field">
          <p class="selection-label">Seleccione un miembro del equipo:</p>
          <p class="note">Solo se muestran miembros con especialidad en {{ props.task.specialty }}</p>          <!-- Información de depuración antes de la DataView -->
          <div class="debug-section" v-if="filteredMembers && filteredMembers.length > 0">
            <p>Miembros disponibles: {{ filteredMembers.length }}</p>
          </div>
          
          <!-- Lista básica en lugar de DataView para probar -->
          <div class="basic-list" v-if="filteredMembers && filteredMembers.length > 0">
            <div 
              v-for="member in filteredMembers" 
              :key="member.id || member.organizationMemberId || 'member-' + Math.random()" 
              class="member-item"
              :class="{ 'selected': selectedMemberId === (member.organizationMemberId || member.memberId || member.id) }"
              @click="selectedMemberId = member.organizationMemberId || member.memberId || member.id"
            >
              <pv-radio-button 
                :value="member.organizationMemberId || member.memberId || member.id" 
                v-model="selectedMemberId"
              />
              <div class="member-info">
                <div class="member-name">
                  {{ getMemberName(member.organizationMemberId || member.memberId || member.id) }}
                </div>
                <div class="member-specialty">
                  <pv-tag 
                    :value="member.specialty" 
                    :severity="member.specialty === props.task.specialty ? 'success' : 'info'" 
                  />
                </div>
                <div class="member-debug">
                  ID: {{ member.id }} | OrgMemberID: {{ member.organizationMemberId }}
                </div>
              </div>
            </div>
          </div>
          
          <!-- DataView original (oculto por ahora) -->
          <pv-data-view 
            v-if="false"
            :value="filteredMembers" 
            :layout="'list'"
            :paginator="filteredMembers.length > 5"
            :rows="5"
          >            
            <template #empty>
              <div class="empty-state">
                <i class="pi pi-search-minus"></i>
                <p>No se pudieron encontrar miembros para mostrar.</p>
                <pre class="debug-info">{{ JSON.stringify(filteredMembers, null, 2) }}</pre>
              </div>
            </template><template #list="slotProps">
              <!-- Mostrar información de depuración -->
              <pre class="debug-row">{{ JSON.stringify(slotProps.data, null, 2) }}</pre>
              
              <!-- Elemento del miembro -->
              <div class="member-item" 
                  :class="{ 'selected': selectedMemberId === (slotProps.data.organizationMemberId || slotProps.data.memberId || slotProps.data.id) }">
                <pv-radio-button 
                  :value="slotProps.data.organizationMemberId || slotProps.data.memberId || slotProps.data.id" 
                  v-model="selectedMemberId"
                  :inputId="`member-${slotProps.data.organizationMemberId || slotProps.data.memberId || slotProps.data.id}`"
                /><label :for="`member-${slotProps.data.organizationMemberId || slotProps.data.memberId || slotProps.data.id}`" class="member-info">
                  <div class="member-name">
                    {{ getMemberName(slotProps.data.organizationMemberId || slotProps.data.memberId || slotProps.data.id) }}
                    <span v-if="isCurrentResponsible(slotProps.data.organizationMemberId || slotProps.data.memberId || slotProps.data.id)" class="current-tag">
                      (Responsable actual)
                    </span>
                  </div>
                  <div class="member-debug" style="font-size: 0.7rem; color: #999;">
                    ID: {{ slotProps.data.id }} | OrgMemberID: {{ slotProps.data.organizationMemberId }}
                  </div>
                  <div class="member-specialty">
                    <pv-tag 
                      :value="slotProps.data.specialty" 
                      :severity="slotProps.data.specialty === props.task.specialty ? 'success' : 'info'" 
                    />
                    <span v-if="slotProps.data.specialty === props.task.specialty" class="specialty-match">
                      <i class="pi pi-check-circle"></i> Coincide con especialidad requerida
                    </span>
                  </div>
                </label>
              </div>
            </template>
          </pv-data-view>
        </div>
        
        <div class="status-warning">
          <i class="pi pi-info-circle"></i>
          <p>Al asignar un responsable, el estado de la tarea cambiará automáticamente a "PENDIENTE"</p>
        </div>
      </div>
    </div>
    
    <template #footer>
      <div class="dialog-footer">
        <pv-button label="Cancelar" icon="pi pi-times" class="p-button-text" @click="handleCancel" />
        <pv-button 
          label="Asignar Responsable" 
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
  gap: 1.5rem;
}

.loading, .error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
}

.loading p {
  margin-top: 1rem;
  color: var(--text-color-secondary);
}

.member-selection {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.task-info {
  border-bottom: 1px solid var(--surface-border);
  padding-bottom: 1rem;
}

.task-info h3 {
  margin: 0 0 0.5rem 0;
  color: var(--text-color);
}

.task-specialty {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.label {
  font-weight: 500;
}

.search-container {
  width: 100%;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.selection-label {
  font-weight: 600;
  margin: 0;
}

.note {
  margin: 0;
  font-size: 0.9rem;
  color: var(--text-color-secondary);
  font-style: italic;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.member-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  border-radius: 6px;
  gap: 1rem;
  transition: background-color 0.2s;
  cursor: pointer;
}

.member-item:hover {
  background-color: var(--surface-hover);
}

.member-item.selected {
  background-color: var(--surface-hover);
}

.member-info {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  cursor: pointer;
}

.member-name {
  font-weight: 500;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.current-tag {
  font-size: 0.85rem;
  color: var(--primary-color);
  font-weight: 600;
}

.member-specialty {
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.specialty-match {
  font-size: 0.85rem;
  color: var(--green-600);
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.specialty-match i {
  font-size: 0.85rem;
}

.empty-filtered-members {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  text-align: center;
  color: var(--text-color-secondary);
}

.empty-filtered-members i {
  font-size: 2rem;
  margin-bottom: 1rem;
  color: var(--orange-500);
}

.status-warning {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: var(--yellow-50);
  border-left: 4px solid var(--yellow-500);
  padding: 0.75rem 1rem;
  border-radius: 6px;
  margin-top: 1rem;
}

.status-warning i {
  color: var(--yellow-600);
  font-size: 1.25rem;
}

.status-warning p {
  margin: 0;
  font-size: 0.9rem;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
}

.empty-state i {
  font-size: 2rem;
  color: var(--text-color-secondary);
  margin-bottom: 1rem;
}

.empty-state p {
  color: var(--text-color-secondary);
  margin-bottom: 1rem;
}

.debug-info {
  font-size: 0.8rem;
  background-color: var(--surface-ground);
  padding: 1rem;
  border-radius: 4px;
  max-width: 100%;
  overflow-x: auto;
  text-align: left;
}

.debug-row {
  font-size: 0.7rem;
  background-color: #f8f9fa;
  padding: 0.5rem;
  border-radius: 4px;
  margin-bottom: 0.5rem;
  color: #666;
  white-space: pre-wrap;
  overflow-x: auto;
  max-height: 150px;
}

.debug-section {
  margin-bottom: 1rem;
  padding: 0.5rem;
  background-color: var(--surface-ground);
  border-radius: 4px;
  font-size: 0.9rem;
}

.basic-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.basic-list .member-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  border: 1px solid var(--surface-border);
  border-radius: 6px;
  background-color: var(--surface-card);
  transition: background-color 0.2s;
}

.basic-list .member-item:hover {
  background-color: var(--surface-hover);
}

.basic-list .member-item.selected {
  background-color: var(--surface-hover);
  border-color: var(--primary-color);
}

.basic-list .member-info {
  margin-left: 1rem;
  flex-grow: 1;
}

.basic-list .member-name {
  font-weight: 500;
  color: var(--text-color);
  margin-bottom: 0.25rem;
}

.basic-list .member-specialty {
  margin-bottom: 0.25rem;
}

.basic-list .member-debug {
  font-size: 0.7rem;
  color: var(--text-color-secondary);
}
</style>
