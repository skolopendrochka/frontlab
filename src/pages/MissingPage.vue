<template>
  <q-page class="flex flex-center">
    <div class="text-center">
      <div class="text-h2 text-primary">Потерялись</div>
      <div class="text-body1 q-mt-sm">Такого адреса в Checkly нет</div>
      <q-btn class="q-mt-lg" unelevated color="secondary" text-color="white" label="К чек-листу" :to="{ name: 'home' }" />
    </div>
  </q-page>
</template>

<script setup lang="ts"></script>
