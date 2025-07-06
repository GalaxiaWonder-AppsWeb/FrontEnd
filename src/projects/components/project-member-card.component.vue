<!-- src/projects/components/project-member-card.component.vue -->
<template>
  <pv-card class="mb-3 shadow-2 border-round-xl">
    <template #title>
      <div class="flex justify-between items-center">
        <div class="font-semibold text-lg">
          {{ member.firstName }} {{ member.lastName }}
        </div>

      </div>
    </template>

    <template #content>
      <div class="text-sm text-color-secondary mb-2">{{ member.emailAddress }}</div>
      <div class="text-sm font-medium">
        {{ $t('projects.working-team.role') }}: {{ member.role }}
      </div>
      <div v-if="member.role === 'SPECIALIST'" class="text-sm">
        {{ $t('projects.working-team.specialty') }}: {{ member.specialty }}
      </div>

      <div class="flex gap-2">
        <pv-button
            v-if="canRemove && showTrash"
            icon="pi pi-trash"
            severity="danger"
            text
            rounded
            @click="$emit('remove', member)"
            v-tooltip.top="'Eliminar miembro del proyecto'"
        />
      </div>
    </template>
  </pv-card>
</template>

<script>
export default {
  name: 'ProjectMemberCard',
  props: {
    member: {
      type: Object,
      required: true
    },
    canRemove: { type: Boolean, default: false },
    showTrash: { type: Boolean, default: true }
  },
  emits: ['edit', 'remove'],
  created() {

  }
}
</script>

<style scoped>
/* Personaliza más si deseas */
  pv-card {
    padding: 1rem;
    margin-bottom: 1rem!important;
  }
/* Estilos agradables para el card del miembro de proyecto */

.pv-card, .mb-3 {
  background: var(--color-neutral-light, #f6faf9) !important;
  border-radius: 1.5rem !important;
  box-shadow: 0 2px 16px rgba(34, 57, 107, 0.08), 0 1.5px 7px 0 rgba(0,0,0,0.06) !important;
  border: 1px solid var(--color-primary-light, #e1e8ec) !important;
  padding: 1.5rem 1.2rem !important;
  margin-bottom: 1.5rem !important;
  transition: box-shadow 0.18s;
}

.pv-card:hover, .mb-3:hover {
  box-shadow: 0 4px 24px rgba(34, 57, 107, 0.15), 0 1.5px 7px 0 rgba(0,0,0,0.08) !important;
  border-color: var(--color-primary, #22396b) !important;
}

.font-semibold {
  color: var(--color-primary, #22396b);
}

.text-color-secondary {
  color: var(--color-secondary, #fab900);
}

.text-sm {
  color: var(--color-neutral-dark, #0c0c20);
  font-size: 1em;
}

.flex {
  display: flex;
}
.gap-2 {
  gap: 0.5rem;
}
.justify-between {
  justify-content: space-between;
}
.items-center {
  align-items: center;
}

.pv-button[severity="danger"] {
  background: #e53935 !important;
  border-color: #e53935 !important;
  color: #fff !important;
  box-shadow: 0 2px 8px rgba(229,57,53,0.08);
}

.pv-button[severity="danger"]:hover,
.pv-button[severity="danger"]:focus {
  background: #c62828 !important;
  border-color: #c62828 !important;
  color: #fff !important;
}

.pv-button[rounded] {
  border-radius: 50% !important;
}

.pv-button[text] {
  background: transparent !important;
  color: #e53935 !important;
  border: none !important;
  box-shadow: none !important;
}

.mb-2 {
  margin-bottom: 0.6rem !important;
}

.shadow-2 {
  box-shadow: 0 2px 16px rgba(34, 57, 107, 0.08) !important;
}

.border-round-xl {
  border-radius: 1.5rem !important;
}



/* Responsive para mobile */
@media (max-width: 600px) {
  .pv-card, .mb-3 {
    padding: 1rem 0.5rem !important;
  }
}

</style>
