<script>
import {Button as PvButton, InputText as PvInputText} from "primevue";
import {Organization} from "../model/organization.entity.js";
import {Ruc} from "../model/ruc.js";
import {OrganizationStatus} from "../model/organization-status.js";
import {organizationService} from "../services/organization.service.js";

export default {
  name: "CreateOrganization",
  components: {PvButton, PvInputText},
  emits: ['organization-created'],
  data() {
    return {
      user: '',
      visible: false,
      form: {
        legalName: '',
        commercialName: '',
        ruc: ''
      }
    };
  },
  methods:{    
    async CreateOrganization() {
      try {
        // 1. Crear la organización
          const org = new Organization({
          legalName: document.getElementById('legalName')?.value,
          commercialName: document.getElementById('commercialName')?.value,
          ruc: new Ruc(document.getElementById('ruc')?.value),
          createdBy: Number(this.user.personId),
          status: OrganizationStatus.ACTIVE
        });
        
        // Cerramos el diálogo antes de comenzar operaciones asíncronas
        this.visible = false;
        
        // 2. Guardar la organización
        const res = await organizationService.create(org);
        // 3. Guardar el ID de la organización y mostrar mensaje
        this.organizationId = res.id;
        this.message = `Organización creada: ${res.legalName}`;
        
        // 5. Notificar creación exitosa
        this.$emit('organization-created', this.organizationId);
        
        // 6. Mostrar mensaje de éxito
        if (this.$toast) {
          this.$toast.add({
            severity: 'success',
            summary: 'Éxito',
            detail: `Organización "${res.legalName}" creada correctamente`,
            life: 3000
          });
        }
      } catch (err) {
        console.error("Error al crear organización:", err);
        this.message = `Error: ${err.message}`;
        
        // Mostrar mensaje de error al usuario
        if (this.$toast) {
          this.$toast.add({
            severity: 'error',
            summary: 'Error',
            detail: `No se pudo crear la organización: ${err.message}`,
            life: 5000
          });
        }
      }
    },
    onlyNumbers(event) {
      const value = event.target.value
      const numeric = value.replace(/\D/g, '')
      event.target.value = numeric
    },    

  },
  created(){
    this.user = JSON.parse(localStorage.getItem("user"))
  },
  computed: {
    isFormValid() {
      return (
          this.form.legalName.trim() !== '' &&
          this.form.commercialName.trim() !== '' &&
          /^\d{11}$/.test(this.form.ruc)
      )
    }
  }
};
</script>

<template>
  <div class="card flex justify-center">
    <pv-button :label="$t('organization.create-organization.title')" @click="visible = true" />

    <pv-dialog v-model:visible="visible" modal :header="$t('organization.create-organization.title')" :style="{ width: '30rem' }">

      <span class="dialog-header-text">
        {{ $t('organization.create-organization.information.title') }}
      </span>

      <div class="form-group">
        <label for="legalName">{{ $t('organization.create-organization.information.legal-name') }}</label>
        <pv-input-text id="legalName" v-model="form.legalName" class="flex-auto" autocomplete="off" />
      </div>

      <div class="form-group">
        <label for="commercialName">{{ $t('organization.create-organization.information.commercial-name') }}</label>
        <pv-input-text id="commercialName" v-model="form.commercialName" class="flex-auto" autocomplete="off" />
      </div>

      <div class="form-group">
        <label for="ruc">{{ $t('organization.create-organization.information.ruc') }}</label>
        <pv-input-text id="ruc" v-model="form.ruc" class="flex-auto" autocomplete="off" maxlength="11" @input="onlyNumbers($event)" />
      </div>

      <div class="dialog-actions">
        <pv-button type="button" :label="$t('organization.create-organization.information.cancel')" severity="secondary" @click="visible = false" />
        <pv-button
            type="button"
            :label="$t('organization.create-organization.information.create')"
            :disabled="!isFormValid"
            @click="CreateOrganization()"
        />
      </div>
    </pv-dialog>
  </div>
</template>

<style scoped>

.form-group {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.form-group label {
  font-weight: 600;
  width: 8rem;
  color: #ffffff;
}


.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.dialog-header-text {
  color: #ccc;
  margin-bottom: 1.5rem;
}

</style>

