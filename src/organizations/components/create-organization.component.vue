<script>
import {Button as PvButton, InputText as PvInputText} from "primevue";
import {Organization} from "../model/organization.entity.js";
import {Ruc} from "../model/ruc.js";
import {PersonId} from "../../iam/model/person.entity.js";
import {OrganizationStatus} from "../model/organization-status.js";
import {organizationService} from "../services/organization.service.js";
import {OrganizationMember} from "../model/organization-member.entity.js";
import {OrganizationMemberType} from "../model/organization-member-type.js";
import {organizationMemberService} from "../services/organization-member.service.js";
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
        console.log('ENTRADA');

        const legalName = document.getElementById('legalName')?.value || '';
        const commercialName = document.getElementById('commercialName')?.value || '';
        const rucValue = document.getElementById('ruc')?.value || '';
        const personId = this.user?.personId;

        console.log("Legal Name:", legalName);
        console.log("Commercial Name:", commercialName);
        console.log("RUC:", rucValue);
        console.log("Created By:", personId);
        console.log("Status:", OrganizationStatus.ACTIVE);

        // Validación opcional de campos
        if (!legalName || !commercialName || !rucValue || !personId) {
          throw new Error("Todos los campos son obligatorios");
        }

        // Construir objeto plano
        const org = {
          legalName: legalName.trim(),
          commercialName: commercialName.trim(),
          ruc: rucValue.trim(),
          createdBy: personId,
          status: OrganizationStatus.ACTIVE
        };

        this.visible = false;

        const res = await organizationService.create(org);
        this.organizationId = res.id; // el ID viene del backend
        this.message = `Created: ${res.legalName}`;

        await this.LinkContractor(new PersonId(personId), this.organizationId);
        this.$emit('organization-created', this.organizationId);

      } catch (err) {
        console.error("Error al crear organización:", err);
        this.message = err.message || 'Error desconocido';
      }
    },
    onlyNumbers(event) {
      const value = event.target.value
      const numeric = value.replace(/\D/g, '')
      event.target.value = numeric
    },
    async LinkContractor(person, organization) {
      const member = new OrganizationMember({
        personId: person,
        organizationId: organization,
        type: OrganizationMemberType.CONTRACTOR
      })
      const res = await organizationMemberService.create(member.toJSON())
      this.createdMemberId = res.id
      this.message = `Member created for person ${res.personId}`
    }
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
  color: #000000;
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

