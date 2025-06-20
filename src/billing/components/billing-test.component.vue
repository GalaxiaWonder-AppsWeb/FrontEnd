<script>
import { billingService } from '../services/billing.service.js'
import { Invoice } from '../model/invoice.entity.js'
import { Money } from '../../shared/model/money.js'

export default {
  name: 'BillingTest',
  data() {
    return {
      payerId: '',
      invoiceId: '',
      invoices: [],
      message: ''
    }
  },
  methods: {
    async testCreateInvoice() {
      try {
        const payer = parseInt(this.payerId)
        if (isNaN(payer)) {
          this.message = 'Payer ID must be a number'
          return
        }

        const invoice = new Invoice({
          payer: payer,
          issuedDate: new Date(),
          dueDate: new Date(),
          items: [],
          status: 'PENDING'
        })

        const res = await billingService.create(invoice.toJSON())
        this.invoiceId = res.id
        this.message = `Invoice created for ${res.payer}`
        console.log(res)
      } catch (err) {
        this.message = err.message
      }
    },

    async testGetAll() {
      try {
        const res = await billingService.getAll()
        this.invoices = res
        this.message = `Fetched ${res.length} invoices`
        console.log(res)
      } catch (err) {
        this.message = err.message
      }
    },

    async testGetById() {
      try {
        const id = parseInt(this.invoiceId)
        const res = await billingService.getById(id)
        this.message = `Invoice: ${res.id}`
        console.log(res)
      } catch (err) {
        this.message = err.message
      }
    },

    async testGetByPayer() {
      try {
        const payerId = parseInt(this.payerId)
        const res = await billingService.getByPayerId(payerId)
        this.invoices = res
        this.message = `Fetched ${res.length} invoices for payer`
        console.log(res)
      } catch (err) {
        this.message = err.message
      }
    },

    async testDelete() {
      try {
        const id = parseInt(this.invoiceId)
        await billingService.delete(id)
        this.message = `Deleted invoice ${this.invoiceId}`
        this.invoiceId = ''
      } catch (err) {
        this.message = err.message
      }
    }
  }
}
</script>

<template>
  <div class="billing-test">
    <h2>Billing Service Test</h2>

    <div class="form">
      <label>Payer ID:</label>
      <input v-model="payerId" type="text" placeholder="Enter Payer ID" />
      <label>Invoice ID:</label>
      <input v-model="invoiceId" type="text" placeholder="Enter Invoice ID" />
    </div>

    <div class="buttons">
      <button @click="testCreateInvoice" :disabled="!payerId">Create</button>
      <button @click="testGetAll">Get All</button>
      <button @click="testGetById" :disabled="!invoiceId">Get By ID</button>
      <button @click="testGetByPayer" :disabled="!payerId">Get By Payer</button>
      <button @click="testDelete" :disabled="!invoiceId">Delete</button>
    </div>

    <p v-if="message"><strong>{{ message }}</strong></p>

    <ul v-if="invoices.length">
      <li v-for="inv in invoices" :key="inv.id">
        {{ inv.id }} - {{ inv.status }} - {{ inv.payer }}
      </li>
    </ul>
  </div>
</template>

<style scoped>
.billing-test {
  padding: 1rem;
}
input {
  margin: 0.25rem 0;
  padding: 4px;
  width: 300px;
}
button {
  margin: 0.25rem;
  padding: 0.5rem 1rem;
}
</style>
