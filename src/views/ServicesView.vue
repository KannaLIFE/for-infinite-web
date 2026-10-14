<script setup lang="ts">
import { services } from '../data/services';
import { pick, pickList, t } from '../lib/i18n';
</script>

<template>
  <div class="w-full space-y-6 px-4">
    <header class="flex items-center gap-3">
      <h1 class="mono text-2xl font-semibold text-[var(--fi-text)]">{{ t('services.title') }}</h1>
      <span class="mono border border-[var(--fi-line-solid)] bg-[var(--fi-panel)] px-2 py-0.5 text-[10px]" :class="services.status === 'open' ? 'text-[var(--fi-blue)]' : 'text-[var(--fi-muted)]'">
        /services · {{ services.status === 'open' ? t('services.open') : t('services.closed') }}
      </span>
    </header>

    <p class="mono text-xs text-[var(--fi-muted)]">{{ pick(services.tagline, services.taglineEn) }}</p>

    <section v-if="services.rows.length" class="fi-px-panel bg-[var(--fi-panel)] p-5">
      <div class="mb-3 flex items-center justify-between">
        <h2 class="mono text-sm text-[var(--fi-warm)]">{{ t('services.pricing') }}</h2>
        <span class="mono text-[10px] text-[var(--fi-blue)]">{{ pick(services.discountNote, services.discountNoteEn) }}</span>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead>
            <tr class="mono border-b-2 border-[var(--fi-line-solid)] text-xs text-[var(--fi-muted)]">
              <th class="py-2 pr-4">{{ t('services.thType') }}</th>
              <th class="py-2 pr-4">{{ t('services.thScope') }}</th>
              <th class="py-2 pr-4">{{ t('services.thPrice') }}</th>
              <th class="py-2">{{ t('services.thDiscounted') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in services.rows" :key="r.type" class="border-b border-[var(--fi-line)]">
              <td class="mono py-2 pr-4 text-[var(--fi-text)]">{{ pick(r.type, r.typeEn) }}</td>
              <td class="py-2 pr-4 text-[var(--fi-muted)]">{{ pick(r.scope, r.scopeEn) }}</td>
              <td class="mono py-2 pr-4 text-[var(--fi-muted)] line-through">{{ r.price }}</td>
              <td class="mono py-2 text-[var(--fi-warm)]">{{ r.discounted || r.price }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="mono mt-3 text-xs text-[var(--fi-muted)]">
        {{ pick(services.turnaroundNote, services.turnaroundNoteEn) }} · {{ pick(services.rushNote, services.rushNoteEn) }}
      </p>
    </section>

    <div v-if="services.dos.length || services.donts.length" class="grid gap-6 md:grid-cols-2">
      <section class="fi-px-panel bg-[var(--fi-panel)] p-5">
        <h2 class="mono mb-3 text-sm text-[var(--fi-blue)]">{{ t('services.dos') }}</h2>
        <ul class="space-y-2 text-sm text-[var(--fi-text)]">
          <li v-for="d in pickList(services.dos, services.dosEn)" :key="d" class="flex items-center gap-2">
            <span class="inline-block h-2 w-2 bg-[var(--fi-blue)]"></span>{{ d }}
          </li>
        </ul>
      </section>
      <section class="fi-px-panel bg-[var(--fi-panel)] p-5">
        <h2 class="mono mb-3 text-sm text-[#ff8a8a]">{{ t('services.donts') }}</h2>
        <ul class="space-y-2 text-sm text-[var(--fi-muted)]">
          <li v-for="d in pickList(services.donts, services.dontsEn)" :key="d" class="flex items-center gap-2">
            <span class="inline-block h-2 w-2 bg-[#ff6b6b]"></span>{{ d }}
          </li>
        </ul>
      </section>
    </div>

    <section v-if="services.terms.length" class="fi-px-panel bg-[var(--fi-panel)] p-5">
      <h2 class="mono mb-3 text-sm text-[var(--fi-warm)]">{{ t('services.terms') }}</h2>
      <ol class="list-inside list-decimal space-y-1.5 text-sm text-[var(--fi-muted)]">
        <li v-for="term in pickList(services.terms, services.termsEn)" :key="term">{{ term }}</li>
      </ol>
    </section>

    <section v-if="services.faq.length" class="fi-px-panel bg-[var(--fi-panel)] p-5">
      <h2 class="mono mb-3 text-sm text-[var(--fi-violet)]">FAQ</h2>
      <div v-for="f in services.faq" :key="f.question" class="mb-3 last:mb-0">
        <p class="mono text-sm text-[var(--fi-text)]">{{ t('services.faqQ', { q: pick(f.question, f.questionEn) }) }}</p>
        <p class="mt-1 text-sm text-[var(--fi-muted)]">{{ pick(f.answer, f.answerEn) }}</p>
      </div>
    </section>
  </div>
</template>
