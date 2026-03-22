/**
 * Обертка для async функций с обработкой ошибок
 * @param {Function} asyncFn - Асинхронная функция для выполнения
 * @param {string} errorMessage - Сообщение об ошибке для пользователя
 * @returns {Function} - Обернутая функция, которая никогда не бросает исключения
 */
export function withErrorHandling(asyncFn, errorMessage) {
  return async (...args) => {
    try {
      return await asyncFn(...args)
    } catch (error) {
      console.error(`${errorMessage}:`, error)
      alert(`${errorMessage}: ${error.message}`)
      return null
    }
  }
}
