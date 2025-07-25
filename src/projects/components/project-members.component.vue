<script>
import ProjectMemberCard from './project-member-card.component.vue'
import AddProjectMember from './add-project-member.component.vue'
import { projectTeamMemberService } from '../services/project-team-member.service.js'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'

export default {
  name: 'ProjectMembers',
  components: {
    ProjectMemberCard,
    AddProjectMember
  },
  data() {
    return {
      projectMembers: [],
      loading: false,
      showModal: false,
      projectId: null,
      organizationId: null,
      currentUserId: null,
      currentProjectRole: null,
      isContractor: false,
    }
  },
  created() {
    const orgId = this.$route.params.organizationId || this.$route.params.orgId;
    const projId = this.$route.params.projectId;
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.currentUserId = user.personId || user.id || null;
    console.log(this.currentOrgRole, 'XD')
    this.currentProjectRole = user.activeProjectRole || null;
    console.log('User data:', user);
    console.log('Current user role:', this.currentUserRole);

    this.organizationId = orgId ? Number(orgId) : 1
    this.projectId = projId ? Number(projId) : 1
    this.loadMembers()
    // Servicios PrimeVue
    this.toast = useToast()
    this.confirm = useConfirm()
  },
  methods: {
    canRemoveMember(member) {
      return (
          this.currentOrgRole === 'Contractor' &&
          this.currentProjectRole === 'Coordinator'
      );
    },
    // Muestra el tacho si el miembro NO soy yo
    showTrashForMember(member) {
      // member.personId (o member.id) debe coincidir con tu currentUserId
      return member.personId !== this.currentUserId;
    },
    async loadMembers() {
      this.loading = true
      try {
        const response = await projectTeamMemberService.getProjectTeamMembersByProjectId({ projectId: this.projectId })
        this.projectMembers = Array.isArray(response) ? response : []
      } catch (error) {
        this.projectMembers = []
        this.toast.add({
          severity: 'error',
          summary: 'Error de carga',
          detail: 'No se pudieron cargar los miembros del proyecto',
          life: 3000
        })
      } finally {
        this.loading = false
      }
    },
    async handleMemberAdded() {
      await this.loadMembers()
      this.toast.add({
        severity: 'success',
        summary: 'Miembro agregado',
        detail: 'El miembro ha sido agregado exitosamente',
        life: 3000
      })
      this.showModal = false
    },
    confirmRemoveMember(member) {
      if (!member || !member.id) return
      this.confirm.require({
        message: `¿Está seguro que desea eliminar a ${this.getPersonName(member)} del proyecto?`,
        header: 'Confirmar eliminación',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          this.removeMember(member.id);
          this.confirm.close();
        }
      })
    },
    async removeMember(memberId) {
      this.loading = true
      try {
        await projectTeamMemberService.delete(memberId)
        this.toast.add({
          severity: 'success',
          summary: 'Miembro eliminado',
          detail: 'El miembro ha sido eliminado exitosamente',
          life: 3000
        })
        await this.loadMembers()
      } catch (error) {
        this.toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo eliminar el miembro del proyecto',
          life: 3000
        })
      } finally {
        this.loading = false
      }
    },
    getPersonName(member) {
      if (!member) return 'Miembro desconocido'
      // Si backend retorna el nombre directamente:
      if (member.firstName && member.lastName) return `${member.firstName} ${member.lastName}`
      if (member.email) return member.email
      return `Miembro ID: ${member.id}`
    },
  },
  computed: {
    currentOrgRole() {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      console.log('XD', user.activeOrganizationRole, 'XD')
      return user.activeOrganizationRole || null;

    }
  }
}
</script>

<template>
  <div class="p-4">
    <!-- Toast for notifications -->
    <pv-toast />
    <!-- Confirmation dialog -->
    <pv-confirm-dialog />

    <div class="flex justify-between items-center mb-6">
      <h2 class="text-xl font-semibold">{{ $t('projects.working-team.title') }}</h2>
      <pv-button
          :label="$t('projects.working-team.add-member.title')"
          icon="pi pi-user-plus"
          @click="showModal = true"
          :disabled="currentOrgRole !== 'Contractor'"
      />
    </div>

    <div v-if="loading" class="text-center p-4">
      <pv-progress-spinner style="width: 50px; height: 50px;" />
      <div class="mt-2">Cargando miembros del proyecto...</div>
    </div>

    <div v-else-if="projectMembers.length === 0" class="text-gray-500 text-center p-4">
      {{ $t('projects.working-team.no-members') }}
    </div>

    <!-- Member cards -->
    <div v-else class="grid md:grid-cols-2 lg:grid-cols-3 gap-6 bg-gray-200 p-4 rounded-xl">
      <div v-for="member in projectMembers" :key="member.id" class="h-full">
        <ProjectMemberCard
            :member="member"
            :can-remove="canRemoveMember(member)"
            :show-trash="showTrashForMember(member)"
            @remove="confirmRemoveMember(member)"
        />
      </div>
    </div>

    <!-- Add member dialog -->
    <pv-dialog v-if="currentOrgRole === 'Contractor'" v-model:visible="showModal" modal header="Agregar miembro" style="width: 30rem">
      <AddProjectMember
          :organization-id="organizationId"
          :project-id="projectId"
          :visible="showModal"
          @member-added="handleMemberAdded"
          @close="showModal = false"
      />
    </pv-dialog>
  </div>
</template>

<style scoped>
* {
  color: black;
}
.flex.justify-between.items-center {
  margin-bottom: 2rem !important; /* Espacio debajo del botón */
}
.grid {
  display: grid;

  gap: 1.5rem;
}
</style>
