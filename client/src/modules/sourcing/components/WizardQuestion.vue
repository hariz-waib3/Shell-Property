<script setup>
// Renders one question from wizardSteps.js. The control type decides what is shown:
// 'single' and 'multiple' show chip buttons, 'input' a text box, 'textarea' a larger text box.
const props = defineProps({
  question: { type: Object, required: true },
})

const answer = defineModel({ type: [String, Array] })

const isMultiple = props.question.control === 'multiple'
const showsChips = props.question.control === 'single' || isMultiple

function isSelected(option) {
  if (isMultiple) return (answer.value || []).includes(option)
  return answer.value === option
}

function selectOption(option) {
  if (isMultiple) {
    const selected = answer.value || []
    if (selected.includes(option)) {
      answer.value = selected.filter((item) => item !== option)
    } else {
      answer.value = [...selected, option]
    }
    return
  }

  // Clicking the selected option again clears it.
  answer.value = answer.value === option ? undefined : option
}
</script>

<template>
  <div class="q">
    <label :for="`question-${question.key}`">
      {{ question.label }}
      <i v-if="question.required">*</i>
      <span v-if="isMultiple" class="muted hint">(select any)</span>
    </label>

    <div v-if="showsChips" class="chips">
      <button
        v-for="option in question.options"
        :key="option"
        type="button"
        class="chip"
        :class="{ on: isSelected(option) }"
        @click="selectOption(option)"
      >
        {{ option }}
      </button>
    </div>

    <div v-else-if="question.control === 'input'" class="field">
      <input :id="`question-${question.key}`" v-model="answer" :placeholder="question.placeholder" />
    </div>

    <div v-else class="field">
      <textarea
        :id="`question-${question.key}`"
        v-model="answer"
        rows="4"
        :placeholder="question.placeholder"
      ></textarea>
    </div>
  </div>
</template>

<style scoped>
.hint {
  font-weight: 400;
}
</style>
