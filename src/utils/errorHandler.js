/**
 * Обертка для async функций с обработкой ошибок
 * @param {Function} asyncFn - Асинхронная функция для выполнения
 * @param {string} errorMessage - Сообщение об ошибке для пользователя
 * @param {boolean} silent - Если true, не показывает alert (только логирует)
 * @returns {Function} - Обернутая функция, которая никогда не бросает исключения
 */
export function withErrorHandling(asyncFn, errorMessage, silent = false) {
  return async (...args) => {
    try {
      return await asyncFn(...args)
    } catch (error) {
      console.error(`${errorMessage}:`, error)
      if (!silent) {
        alert(`${errorMessage}: ${error.message}`)
      }
      return null
    }
  }
}
