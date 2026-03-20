export function validateTask(task) {
  const errors = []

  if (!task.name || task.name.trim() === '') {
    errors.push('Название задачи обязательно')
  }

  if (!task.epicId) {
    errors.push('Выберите эпик')
  }

  if (!task.status) {
    errors.push('Выберите статус')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export function showValidationErrors(errors) {
  if (errors.length > 0) {
    alert('Ошибки валидации:\n' + errors.join('\n'))
  }
}
