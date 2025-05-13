<template>
  <form @submit.prevent="handleUpdate" class="p-fluid form-grid register-card">
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
  </form>
</template>

<script>
import { organizationService } from '../services/organization.service.js'
import {Organization, OrganizationId} from '../model/organization.entity.js'
import { OrganizationAssembler } from '../services/organization.assembler.js'
import {Ruc} from "../model/ruc.js";

export default {
  name: 'EditOrganization',
  data() {
    return {
      organizationId: null,
      originalOrg: null,
      legalName: '',
      commercialName: '',
      message: ''
    }
  },
  computed: {
    isValid() {
      return this.legalName.trim() !== '' && this.commercialName.trim() !== ''
    }
  },
  methods: {
    async loadOrganization() {
      console.log('Valor desde la URL:', this.$route.params.orgId);
      try {
        this.organizationId = this.$route.params.orgId
        console.log("ID DE ORGANIZACION:", this.organizationId)
        const res = await organizationService.getById({ id: this.organizationId })
        this.originalOrg = OrganizationAssembler.toEntityFromResource(res)
        this.legalName = this.originalOrg.legalName
        this.commercialName = this.originalOrg.commercialName
      } catch (err) {
        console.error('Error al cargar la organización:', err)
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
        console.log('Objeto antes de toJSON():', updatedOrg);
        console.log('ID asignado:', this.organizationId);
        console.log('Objeto convertido a JSON:', updatedOrg.toJSON());
        const res = await organizationService.update(updatedOrg.toJSON())
        this.message = `Organización actualizada: ${res.legalName}`
        console.log('Actualizado:', res)
      } catch (err) {
        console.error('Error al actualizar organización:', err)
        this.message = err.message
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
</style>
