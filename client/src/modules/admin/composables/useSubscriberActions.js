import { computed, ref } from 'vue'
import { PLANS } from '@/data/constants'
import { setUserDisabled, setUserPlan } from '@/stores/db'
import { toast } from '@/stores/ui'

// Plan and account actions for a subscriber, shared by the subscribers list and the subscriber page.
// Every action asks for confirmation first: the view shows a ConfirmDialog while `confirmation` is set.
const ACTIONS = {
  grantPro: {
    title: 'Grant Pro access?',
    message: (user) => `${user.name} will get prices, full details and downloads.`,
    confirmLabel: 'Grant Pro',
    run: (user) => setUserPlan(user.id, PLANS.PRO),
    done: (user) => `${user.name} now has Pro access`,
  },
  downgrade: {
    title: 'Downgrade to Free?',
    message: (user) => `${user.name} will lose access to prices, full details and downloads.`,
    confirmLabel: 'Downgrade',
    danger: true,
    run: (user) => setUserPlan(user.id, PLANS.FREE),
    done: (user) => `${user.name} moved to the Free plan`,
  },
  disable: {
    title: 'Disable this account?',
    message: (user) => `${user.name} won't be able to sign in until the account is enabled again.`,
    confirmLabel: 'Disable account',
    danger: true,
    run: (user) => setUserDisabled(user.id, true),
    done: (user) => `${user.name}'s account is disabled`,
  },
  enable: {
    title: 'Enable this account?',
    message: (user) => `${user.name} will be able to sign in again.`,
    confirmLabel: 'Enable account',
    run: (user) => setUserDisabled(user.id, false),
    done: (user) => `${user.name} can sign in again`,
  },
}

export function useSubscriberActions() {
  const pending = ref(null) // { action, user }

  function changePlan(user) {
    pending.value = { action: user.plan === PLANS.PRO ? ACTIONS.downgrade : ACTIONS.grantPro, user }
  }

  function toggleDisabled(user) {
    pending.value = { action: user.disabled ? ACTIONS.enable : ACTIONS.disable, user }
  }

  // Text for the confirmation dialog, or null when nothing is waiting.
  const confirmation = computed(() => {
    if (!pending.value) return null
    const { action, user } = pending.value
    return {
      title: action.title,
      message: action.message(user),
      confirmLabel: action.confirmLabel,
      danger: Boolean(action.danger),
    }
  })

  function confirmPending() {
    const { action, user } = pending.value
    action.run(user)
    toast(action.done(user))
    pending.value = null
  }

  function cancelPending() {
    pending.value = null
  }

  return { changePlan, toggleDisabled, confirmation, confirmPending, cancelPending }
}
