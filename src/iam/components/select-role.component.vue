<template>
  <div class="field">
    <pv-select
        v-model="internalValue"
        :options="roleOptions"
        optionLabel="label"
        optionValue="value"
        :placeholder="$t('register.roles.choose-role')"
        class="w-full"
    />
  </div>
</template>

<script>
import { UserType } from '../model/user-type.js'

export default {
  name: 'SelectRole',
  props: {
    modelValue: {
      type: String,
      default: ''
    }
  },
  emits: ['update:modelValue'],
  computed: {
    roleOptions() {
      return [
        { label: this.$t('register.roles.worker'), value: UserType.WORKER},
        { label: this.$t('register.roles.client'), value: UserType.CLIENT}
      ]
    },
    internalValue: {
      get() {
        return this.modelValue
      },
      set(value) {
        this.$emit('update:modelValue', value)
      }
    }
  }
}
</script>

<style scoped>
.field {
  margin-bottom: 1.5rem;
}

::v-deep(.p-select) {
  width: 100%;
}

::v-deep(.p-inputtext) {
  background-color: black;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem;
  font-size: 1rem;
}

::v-deep(.p-dropdown) {
  background-color: black;
  border: none;
  border-radius: 8px;
}

::v-deep(.p-dropdown-label) {
  color: white;
}

::v-deep(.p-dropdown-trigger) {
  color: white;
}

</style>

