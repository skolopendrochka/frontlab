<template>
  <q-page class="flex flex-center q-pa-md">
    <div class="row full-width" style="max-width: 880px">
      <div class="col-12 col-md-5 q-pa-lg text-white bg-primary rounded-borders">
        <div class="text-h4">Checkly</div>
        <p class="q-mt-md">
          Чек-лист для учебной практики: пункты, сроки, тема и сохранение состояния между сессиями.
        </p>
        <p class="text-caption">Работа: Екатерина Чичулина</p>
      </div>
      <div class="col-12 col-md-7">
        <q-card flat class="q-pa-lg">
          <div class="text-h6 q-mb-sm">Вход</div>
          <div class="text-caption text-grey-7 q-mb-lg">user@test.com / 123456</div>
          <form @submit.prevent="submit">
            <q-input
              v-model="email"
              outlined
              type="email"
              label="Почта"
              class="q-mb-sm"
              :error="!!issues.email"
              @blur="onEmailBlur"
            />
            <HintLine :text="issues.email" />
            <q-input
              v-model="password"
              outlined
              type="password"
              label="Пароль"
              class="q-mb-sm"
              :error="!!issues.password"
              @blur="checkField('password', password)"
            />
            <HintLine :text="issues.password" />
            <HintLine :text="identity.lastFault ?? undefined" />
            <q-btn
              type="submit"
              unelevated
              color="primary"
              class="full-width q-mt-md"
              label="Продолжить"
              :loading="identity.busy"
            />
          </form>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import HintLine from 'src/components/FieldHint.vue';
import { useFormSchema } from 'src/composables/useFormSchema';
import { probeEmailTaken, signInSchema } from 'src/utils/schemas';
import { useIdentityStore } from 'src/stores/sessionStore';
import { usePaletteStore } from 'src/stores/lookStore';

const router = useRouter();
const route = useRoute();
const identity = useIdentityStore();
const palette = usePaletteStore();
const { issues, check, checkField, checkLater } = useFormSchema(signInSchema);

const email = ref('user@test.com');
const password = ref('123456');

async function onEmailBlur(): Promise<void> {
  if (!checkField('email', email.value)) return;
  await checkLater('email', () => probeEmailTaken(email.value));
}

async function submit(): Promise<void> {
  if (!check({ email: email.value, password: password.value })) return;
  const result = await identity.enter({ email: email.value, password: password.value });
  if (!result.ok) return;
  palette.pushToast({ tone: 'positive', text: `Вы вошли как ${result.value.account.name}` });
  const back = typeof route.query.back === 'string' ? route.query.back : '/';
  await router.push(back);
}
</script>
