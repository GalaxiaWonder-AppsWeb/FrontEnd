<template>
  <div class="settings-container">    <form @submit.prevent="handleUpdate" class="p-fluid form-grid register-card">
      <h1 class="form-title">{{$t('organization.edit-organization.title')}}</h1>

      <div class="field-row">
        <div class="p-field">
          <label for="legalName">{{$t('organization.edit-organization.legal-name')}}</label>
          <pv-input-text id="legalName" v-model="legalName" required />
        </div>
        <div class="p-field">
          <label for="commercialName">{{$t('organization.edit-organization.commercial-name')}}</label>
          <pv-input-text id="commercialName" v-model="commercialName" required />
        </div>
      </div>

      <pv-button
          class="p-button"
          :label="$t('organization.edit-organization.change-settings')"
          icon="pi pi-save"
          type="submit"
          :disabled="!isValid"
      />

      <p :class="messageClass">{{this.message}}</p>
      
      <div class="danger-zone">
        <h2>Zona de Peligro</h2>
        <div class="delete-section">
          <pv-button
              class="p-button-danger p-button-outlined"
              :label="$t('organization.edit-organization.delete')"
              icon="pi pi-trash"
              @click="showDeleteConfirmation"
          />
        </div>
      </div>
    </form>
    
    <pv-dialog v-model:visible="deleteDialogVisible" :modal="true" :closable="false" header="Confirmar eliminación" class="delete-dialog">
      <p>{{$t('organization.edit-organization.delete-confirm')}}</p>
      <template #footer>
        <pv-button :label="$t('common.cancel')" @click="deleteDialogVisible = false" class="p-button-text" />
        <pv-button :label="$t('common.delete')" @click="handleDeleteOrganization" class="p-button-danger" :loading="deleting" />
      </template>
    </pv-dialog>
  </div>
</template>

<script>
import { organizationService } from '../services/organization.service.js'
import { Organization, OrganizationId } from '../model/organization.entity.js'
import { OrganizationAssembler } from '../services/organization.assembler.js'
import { Ruc } from "../model/ruc.js";
import { organizationMemberService } from '../services/organization-member.service.js'
import axios from 'axios';
import { useRouter } from 'vue-router';
import { Button as PvButton, InputText as PvInputText, Dialog as PvDialog } from "primevue";

export default {
  name: 'EditOrganization',
  components: {
    PvButton,
    PvInputText,
    PvDialog  },
  setup() {
    const router = useRouter();
    return { router };
  },
  data() {
    return {
      organizationId: null,
      originalOrg: null,
      legalName: '',
      commercialName: '',
      message: '',      messageClass: 'confirm-message',
      deleteDialogVisible: false,
      deleting: false
    }
  },
  computed: {
    isValid() {
      return this.isEmpty() && this.isOriginal();
    }
  },
  methods: {
    async loadOrganization() {
      console.log('Valor desde la URL:', this.$route.params.orgId);
      try {
        this.organizationId = this.$route.params.orgId
        const res = await organizationService.getById({ id: this.organizationId })
        this.originalOrg = OrganizationAssembler.toEntityFromResource(res)
        this.legalName = this.originalOrg.legalName
        this.commercialName = this.originalOrg.commercialName
      } catch (err) {
        this.message = err.message
      }
    },
    async handleUpdate() {
      try {
        const updatedOrg = new Organization({
          id: new OrganizationId(this.organizationId),
          legalName: this.legalName,
          commercialName: this.commercialName,
          ruc: new Ruc(this.originalOrg.ruc),
          createdBy: this.originalOrg.createdBy,
          status: this.originalOrg.status
        })
        const res = await organizationService.update(updatedOrg.toJSON())
        this.message = `Organización actualizada`
        console.log('Actualizado:', res)
      } catch (err) {
        console.error('Error al actualizar organización')
        this.message = err.message
      }
    },    isEmpty(){
      return this.legalName.trim() !== '' && this.commercialName.trim() !== ''
    },
    isOriginal(){
      return this.legalName.trim() !== this.originalOrg.legalName.trim() || this.commercialName.trim() !== this.originalOrg.commercialName.trim()    },
    
    showDeleteConfirmation() {
      this.deleteDialogVisible = true;
    },
      async handleDeleteOrganization() {
      try {
        this.deleting = true;
        this.message = '';
        
        // 1. Obtener todos los miembros de la organización
        const membersResponse = await organizationMemberService.getByOrgId(this.organizationId);
        const members = membersResponse?.data || membersResponse || [];
        
        console.log(`Se encontraron ${members.length} miembros para eliminar`);
        
        // 2. Eliminar todos los miembros de la organización
        for (const member of members) {
          await organizationMemberService.delete({ id: member.id });
          console.log(`Miembro ${member.id} eliminado`);
        }
        
        // 3. Eliminar la organización
        await organizationService.delete({ id: this.organizationId });
        
        // 4. Mostrar mensaje de éxito
        this.$toast.add({
          severity: 'success',
          summary: 'Éxito',
          detail: this.$t('organization.edit-organization.deleted-success'),
          life: 3000
        });
        
        // 5. Redirigir al usuario a la lista de organizaciones después de un breve retraso
        setTimeout(() => {
          this.router.push('/organizations');
        }, 1500);
        
      } catch (err) {
        console.error('Error al eliminar la organización', err);
        this.message = this.$t('organization.edit-organization.deleted-error');
        this.messageClass = 'error-message';
        this.$toast.add({
          severity: 'error',
          summary: 'Error',
          detail: this.$t('organization.edit-organization.deleted-error'),
          life: 3000
        });      } finally {
        this.deleteDialogVisible = false;
        this.deleting = false;
      }
    }
  },
  created() {
    this.loadOrganization()
  }
}
</script>

<style scoped>
.register-card {
  max-width: 540px;
  margin: 3rem auto;
  padding: 2.5rem;
  border-radius: 12px;
  box-shadow: 0 0 16px rgba(0, 0, 0, 0.15);
  color: black;
  background-color: white;
}

.form-title {
  text-align: center;
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
}

.field-row {
  display: flex;
  gap: 1rem;
}

.p-field {
  display: flex;
  flex-direction: column;
  flex: 1;
}

label {
  font-weight: 500;
  margin-bottom: 0.5rem;
  padding-left: 0.25rem;
  font-size: 0.95rem;
  min-height: 1.5rem;
}

.p-button {
  width: 100%;
  margin-top: 0.5rem;
}

.confirm-message {
  color: green;
}

.error-message {
  color: var(--red-600);
}

.danger-zone {
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid #ddd;
}

.danger-zone h2 {
  color: var(--red-600);
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

.delete-section {
  background-color: #fff9f9;
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid #ffe0e0;
}

.delete-dialog {
  max-width: 450px;
}
</style>
