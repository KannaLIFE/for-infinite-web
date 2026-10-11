<script setup lang="ts">
import { services } from '../data/services';
</script>

<template>
  <div class="w-full space-y-6 px-4">
    <header class="flex items-center gap-3">
      <h1 class="mono text-2xl font-semibold text-[var(--fi-text)]">鏈嶅姟 路 濮旀墭</h1>
      <span class="mono border border-[var(--fi-line-solid)] bg-[var(--fi-panel)] px-2 py-0.5 text-[10px]" :class="services.status === 'open' ? 'text-[var(--fi-blue)]' : 'text-[var(--fi-muted)]'">
        /services 路 {{ services.status === 'open' ? '鎺ュ崟涓? : '鏆備笉鎺ュ崟' }}
      </span>
    </header>

    <p class="mono text-xs text-[var(--fi-muted)]">{{ services.tagline }}</p>

    <section class="fi-px-panel bg-[var(--fi-panel)] p-5">
      <div class="mb-3 flex items-center justify-between">
        <h2 class="mono text-sm text-[var(--fi-warm)]">浠锋牸 路 鏈嶅姟绫诲瀷</h2>
        <span class="mono text-[10px] text-[var(--fi-blue)]">{{ services.discountNote }}</span>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead>
            <tr class="mono border-b-2 border-[var(--fi-line-solid)] text-xs text-[var(--fi-muted)]">
              <th class="py-2 pr-4">绫诲瀷</th>
              <th class="py-2 pr-4">鑼冨洿</th>
              <th class="py-2 pr-4">鍘熶环</th>
              <th class="py-2">鎶樻墸浠?/th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in services.rows" :key="r.type" class="border-b border-[var(--fi-line)]">
              <td class="mono py-2 pr-4 text-[var(--fi-text)]">{{ r.type }}</td>
              <td class="py-2 pr-4 text-[var(--fi-muted)]">{{ r.scope }}</td>
              <td class="mono py-2 pr-4 text-[var(--fi-muted)] line-through">{{ r.price }}</td>
              <td class="mono py-2 text-[var(--fi-warm)]">{{ r.discounted || r.price }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="mono mt-3 text-xs text-[var(--fi-muted)]">
        {{ services.turnaroundNote }} 路 {{ services.rushNote }}
      </p>
    </section>

    <div class="grid gap-6 md:grid-cols-2">
      <section class="fi-px-panel bg-[var(--fi-panel)] p-5">
        <h2 class="mono mb-3 text-sm text-[var(--fi-blue)]">鍙帴</h2>
        <ul class="space-y-2 text-sm text-[var(--fi-text)]">
          <li v-for="d in services.dos" :key="d" class="flex items-center gap-2">
            <span class="inline-block h-2 w-2 bg-[var(--fi-blue)]"></span>{{ d }}
          </li>
        </ul>
      </section>
      <section class="fi-px-panel bg-[var(--fi-panel)] p-5">
        <h2 class="mono mb-3 text-sm text-[#ff8a8a]">涓嶆帴</h2>
        <ul class="space-y-2 text-sm text-[var(--fi-muted)]">
          <li v-for="d in services.donts" :key="d" class="flex items-center gap-2">
            <span class="inline-block h-2 w-2 bg-[#ff6b6b]"></span>{{ d }}
          </li>
        </ul>
      </section>
    </div>

    <section class="fi-px-panel bg-[var(--fi-panel)] p-5">
      <h2 class="mono mb-3 text-sm text-[var(--fi-warm)]">鏉℃</h2>
      <ol class="list-inside list-decimal space-y-1.5 text-sm text-[var(--fi-muted)]">
        <li v-for="t in services.terms" :key="t">{{ t }}</li>
      </ol>
    </section>

    <section class="fi-px-panel bg-[var(--fi-panel)] p-5">
      <h2 class="mono mb-3 text-sm text-[var(--fi-violet)]">FAQ</h2>
      <div v-for="f in services.faq" :key="f.question" class="mb-3 last:mb-0">
        <p class="mono text-sm text-[var(--fi-text)]">Q锛歿{ f.question }}</p>
        <p class="mt-1 text-sm text-[var(--fi-muted)]">{{ f.answer }}</p>
      </div>
    </section>
  </div>
</template>
