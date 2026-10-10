<!-- This view allows a user to create client information. -->
<script setup>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'

import useVuelidate from '@vuelidate/core'
import { required, email, numeric, minLength, maxLength } from '@vuelidate/validators'
import { createClient } from '../api/api'
import { useToast } from 'vue-toastification'

const toast = useToast()
const router = useRouter()

const client = reactive({
  firstName: null,
  middleName: null,
  lastName: null,
  email: null,
  phoneNumber: {
    primary: null,
    alternate: null
  },
  address: {
    line1: null,
    line2: null,
    city: null,
    county: null,
    zip: null
  }
})

const rules = {
  client: {
    firstName: { required },
    lastName: { required },
    email: { required, email },
    phoneNumber: {
      primary: {
        required,
        numeric,
        minLength: minLength(10),
        maxLength: maxLength(10),
      },
    },
    address: {
      city: { required },
    },
  },
}

const v$ = useVuelidate(rules, { client })

async function submitForm() {
  await v$.value.$validate()

  if (v$.value.$error) {
    return
  }

  try {
    const response = await createClient(client)

    router.push('/findclient')

    toast.success(response)
  } catch (error) {
    toast.error(error)
  }
}
</script>

