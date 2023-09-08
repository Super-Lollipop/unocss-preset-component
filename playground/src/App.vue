<script setup lang="ts">
import { ref } from 'vue'

const checked = ref(false)
const disabled = ref(false)
function change(event: any) {
  checked.value = event.target.checked
}
</script>

<template>
  <div class="h-100vh flex justify-center items-center gap-10">
    <div class="flex flex-col gap-4">
      <button class="btn w-40" @click="disabled = !disabled">
        toggle disabled
      </button>
      <button class="btn w-40" @click="checked = !checked">
        {{ checked ? 'ON' : 'OFF' }}
      </button>
    </div>
    <div class="flex flex-col items-center">
      lg
      <label class="switch sm:switch-lg selector-[.\\_asdfas]:bg-green">
        <input
          type="checkbox"
          :checked="checked"
          :disabled="disabled"
          class="switch-input"
          @change="change($event)"
        >
        <span class="switch-inner" />
        <span class="switch-handle" />
      </label>
      md
      <label class="switch switch-loading">
        <input
          type="checkbox"
          :checked="checked"
          :disabled="disabled"
          class="switch-input"
          @change="change($event)"
        >
        <span class="switch-inner" />
        <span class="switch-handle" />
      </label>
      sm
      <label class="switch switch-sm">
        <input
          type="checkbox"
          :checked="checked"
          :disabled="disabled"
          class="switch-input"
          @change="change($event)"
        >
        <span class="switch-inner" />
        <span class="switch-handle" />
      </label>
      xs
      <label class="switch switch-xs">
        <input
          type="checkbox"
          :checked="checked"
          :disabled="disabled"
          class="switch-input"
          @change="change($event)"
        >
        <span class="switch-inner" />
        <span class="switch-handle" />
      </label>
    </div>
    <div class="flex flex-col items-center">
      lg
      <label class="switch-text switch-text-lg">
        <input
          type="checkbox"
          :checked="checked"
          :disabled="disabled"
          class="switch-input"
          @change="change($event)"
        >
        <span class="switch-inner">
          <span>ON</span>
          <span>OFF</span>
        </span>
        <span class="switch-handle" />
      </label>
      defalut
      <label class="switch-text">
        <input
          type="checkbox"
          :checked="checked"
          :disabled="disabled"
          class="switch-input"
          @change="change($event)"
        >
        <span class="switch-inner">
          <span>ON</span>
          <span>OFF</span>
        </span>
        <span class="switch-handle" />
      </label>
      sm
      <label class="switch-text switch-text-sm">
        <input
          type="checkbox"
          :checked="checked"
          :disabled="disabled"
          class="switch-input"
          @change="change($event)"
        >
        <span class="switch-inner">
          <span>ON</span>
          <span>OFF</span>
        </span>
        <span class="switch-handle" />
      </label>
      xs
      <label class="switch-text switch-text-xs switch-loading">
        <input
          type="checkbox"
          :checked="checked"
          :disabled="disabled"
          class="switch-input"
          @change="change($event)"
        >
        <span class="switch-inner">
          <span>ON</span>
          <span>OFF</span>
        </span>
        <span class="switch-handle" />
      </label>
    </div>
  </div>
</template>
