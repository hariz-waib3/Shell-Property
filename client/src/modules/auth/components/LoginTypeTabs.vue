<script setup>
// Partner / Admin choice on the login page. Each card links to its own URL (/login or /admin/login).
</script>

<template>
  <nav class="role-cards" aria-label="Choose sign-in type">
    <RouterLink :to="{ name: 'login' }" class="role-card" exact-active-class="selected">
      <span class="icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
          <circle cx="12" cy="8" r="4" />
          <path d="M4 20c1.5-3.5 4.5-5 8-5s6.5 1.5 8 5" />
        </svg>
      </span>
      <span class="text">
        <b>Partner</b>
        <small>Agent / buyer's advocate</small>
      </span>
      <span class="radio" aria-hidden="true"></span>
    </RouterLink>

    <RouterLink :to="{ name: 'admin-login' }" class="role-card" exact-active-class="selected">
      <span class="icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round">
          <path d="M12 3l7 3v5c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6z" />
          <path d="M9 12l2 2 4-4" stroke-linecap="round" />
        </svg>
      </span>
      <span class="text">
        <b>Admin</b>
        <small>Shell Property team</small>
      </span>
      <span class="radio" aria-hidden="true"></span>
    </RouterLink>
  </nav>
</template>

<style scoped>
.role-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin: 20px 0 24px;
}

.role-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 36px 14px 14px;
  border: 1px solid var(--line);
  border-radius: 12px;
  background: #fff;
  color: inherit;
  text-decoration: none;
  transition:
    border-color 0.15s,
    box-shadow 0.15s,
    background 0.15s;
}

.role-card:hover {
  border-color: #cfc6b6;
}

.role-card.selected {
  border-color: var(--gold);
  background: #fdfaf4;
  box-shadow: 0 0 0 3px var(--gold-l);
}

.icon {
  flex: none;
  width: 38px;
  height: 38px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  background: var(--bg);
  color: var(--ink2);
}

.icon svg {
  width: 20px;
  height: 20px;
}

.selected .icon {
  background: var(--ink);
  color: var(--gold);
}

.text b {
  display: block;
  font-size: 14px;
}

.text small {
  display: block;
  margin-top: 1px;
  font-size: 12px;
  color: var(--muted);
}

/* Radio-style dot in the corner: empty circle, filled gold when selected. */
.radio {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 1.5px solid #cfccc5;
}

.selected .radio {
  border-color: var(--gold);
  background: var(--gold);
  box-shadow: inset 0 0 0 3px #fff;
}

@media (max-width: 420px) {
  .role-cards {
    grid-template-columns: 1fr;
  }
}
</style>
