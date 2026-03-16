import React from 'react'

const s = {
  container: { padding: '0 0 2rem' },
  section: { marginBottom: '1.5rem', border: '1px solid var(--bd)', borderRadius: 10, padding: '20px 24px', background: 'var(--bg)' },
  h: { fontSize: 16, fontWeight: 600, color: 'var(--tx)', marginBottom: 16 },
  h2: { fontSize: 14, fontWeight: 600, color: 'var(--tx)', marginTop: 20, marginBottom: 10 },
  p: { fontSize: 13, color: 'var(--tx2)', lineHeight: 1.6, marginBottom: 12 },
  list: { fontSize: 13, color: 'var(--tx2)', lineHeight: 1.8, marginLeft: 20, marginBottom: 12 },
  emoji: { fontSize: 16, marginRight: 8 },
  card: { background: 'var(--bg2)', padding: '14px 18px', borderRadius: 8, marginBottom: 12, border: '1px solid var(--bd)' },
  cardTitle: { fontSize: 13, fontWeight: 600, color: 'var(--tx)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 },
  cardText: { fontSize: 12, color: 'var(--tx2)', lineHeight: 1.6 },
}

export default function RetroView() {
  return (
    <div style={s.container}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
        <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--tx)' }}>🔄 Ретроспектива</span>
      </div>

      <div style={s.section}>
        <div style={s.h}>Что такое ретроспектива?</div>
        <p style={s.p}>
          Ретро — это встреча команды в конце спринта, где все честно говорят что было круто, что не очень, 
          и как сделать следующий спринт еще лучше. Без обвинений, только конструктив и улучшения.
        </p>
      </div>

      <div style={s.section}>
        <div style={s.h}>Как проводить (30-60 минут)</div>
        
        <div style={s.card}>
          <div style={s.cardTitle}>
            <span style={s.emoji}>1️⃣</span>
            Подготовка (5 мин)
          </div>
          <div style={s.cardText}>
            Соберите всю команду. Включите камеры, выключите уведомления. 
            Создайте доску (Miro, FigJam или просто Google Doc) с тремя колонками.
          </div>
        </div>

        <div style={s.card}>
          <div style={s.cardTitle}>
            <span style={s.emoji}>2️⃣</span>
            Сбор фидбека (15 мин)
          </div>
          <div style={s.cardText}>
            Каждый молча пишет стикеры в три колонки:
            <br/>• 🟢 Что было хорошо (keep doing)
            <br/>• 🔴 Что было плохо (stop doing)
            <br/>• 🟡 Что попробовать (try doing)
            <br/><br/>
            Пишите конкретно: не "плохая коммуникация", а "не было дейли в понедельник и мы дублировали работу".
          </div>
        </div>

        <div style={s.card}>
          <div style={s.cardTitle}>
            <span style={s.emoji}>3️⃣</span>
            Обсуждение (20 мин)
          </div>
          <div style={s.cardText}>
            Каждый зачитывает свои стикеры. Группируйте похожие темы. 
            Обсуждайте без обвинений — фокус на процессе, а не на людях.
            <br/><br/>
            Правило: если кто-то говорит "мы", а не "ты" — это хороший знак.
          </div>
        </div>

        <div style={s.card}>
          <div style={s.cardTitle}>
            <span style={s.emoji}>4️⃣</span>
            Action Items (10 мин)
          </div>
          <div style={s.cardText}>
            Выберите 2-3 самые важные проблемы. Для каждой придумайте конкретное действие:
            <br/>• Что делаем?
            <br/>• Кто ответственный?
            <br/>• Когда проверим результат?
            <br/><br/>
            Не берите больше 3 пунктов — лучше сделать мало, но качественно.
          </div>
        </div>

        <div style={s.card}>
          <div style={s.cardTitle}>
            <span style={s.emoji}>5️⃣</span>
            Закрытие (5 мин)
          </div>
          <div style={s.cardText}>
            Зафиксируйте action items в таск-трекере. 
            Поблагодарите команду за честность. Можно закончить чем-то позитивным — 
            например, каждый говорит кого хочет отметить за спринт.
          </div>
        </div>
      </div>

      <div style={s.section}>
        <div style={s.h}>Частые косяки</div>
        
        <p style={s.p}>
          ❌ Превращается в обвинения конкретных людей
          <br/>✅ Говорим о процессах и системе, а не о личностях
        </p>
        
        <p style={s.p}>
          ❌ Слишком много action items, которые никто не делает
          <br/>✅ Максимум 2-3 пункта с конкретными ответственными
        </p>
        
        <p style={s.p}>
          ❌ Один человек говорит 80% времени
          <br/>✅ Фасилитатор следит, чтобы все высказались
        </p>
        
        <p style={s.p}>
          ❌ Не проверяем action items с прошлой ретро
          <br/>✅ Начинаем с проверки: что сделали, что нет, почему
        </p>
      </div>

      <div style={s.section}>
        <div style={s.h}>Форматы для разнообразия</div>
        
        <div style={s.card}>
          <div style={s.cardTitle}>⛵ Парусник</div>
          <div style={s.cardText}>
            Ветер (что помогает), якорь (что тормозит), риф (риски впереди), остров (цель)
          </div>
        </div>

        <div style={s.card}>
          <div style={s.cardTitle}>🌡️ Температура</div>
          <div style={s.cardText}>
            Каждый ставит оценку спринту от 1 до 10 и объясняет почему
          </div>
        </div>

        <div style={s.card}>
          <div style={s.cardTitle}>🎬 Оскар</div>
          <div style={s.cardText}>
            Номинации: лучший баг, самый неожиданный поворот, лучший тимворк и т.д.
          </div>
        </div>

        <div style={s.card}>
          <div style={s.cardTitle}>🚦 Светофор</div>
          <div style={s.cardText}>
            Зеленое (продолжаем), желтое (обсудить), красное (прекратить)
          </div>
        </div>
      </div>

      <div style={s.section}>
        <div style={s.h}>Главное правило</div>
        <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--tx)', lineHeight: 1.6, marginBottom: 12 }}>
          Ретро — это безопасное пространство. Что обсуждается на ретро, остается на ретро. 
          Никаких последствий за честность. Иначе люди перестанут говорить правду, и встреча превратится в пустую формальность.
        </p>
      </div>
    </div>
  )
}
