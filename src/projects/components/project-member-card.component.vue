<!-- src/projects/components/project-member-card.component.vue -->
<template>
  <pv-card class="mb-3 shadow-2 border-round-xl">
    <template #title>      <div class="flex justify-between items-center">
        <div class="font-semibold text-lg">
          {{ person.name }} {{ person.lastName }}
        </div>
        <div class="flex gap-2">
          <pv-button icon="pi pi-pencil" severity="info" text rounded @click="$emit('edit', member)" />
          <pv-button icon="pi pi-trash" severity="danger" text rounded @click="$emit('remove', member)" 
                    v-tooltip.top="'Eliminar miembro del proyecto'" />
        </div>
      </div>
    </template>

    <template #content>
      <div class="text-sm text-color-secondary mb-2">{{ person.email }}</div>
      <div class="text-sm font-medium">
        {{ $t('projects.working-team.role') }}: {{ member.role }}
      </div>
      <div v-if="member.role === 'SPECIALIST'" class="text-sm">
        {{ $t('projects.working-team.specialty') }}: {{ member.specialty }}
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
    person: {
      type: Object,
      required: true
    }
  },
  emits: ['edit', 'remove']
}
</script>

<style scoped>
/* Personaliza más si deseas */
</style>
