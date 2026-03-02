# Informe Técnico - TaskFlow

## Descripción del Proyecto

**TaskFlow** es una aplicación web de gestión de tareas (to-do list) capaz de sincronizar datos en tiempo real entre múltiples dispositivos, construida con React + Vite, Supabase y Tailwind CSS.

---

## Diagrama de Arquitectura

```
┌─────────────────────────────────────────────┐
│              FRONTEND (Vercel)               │
│  ┌──────────────┐   ┌───────────────────┐   │
│  │  React SPA   │   │   Tailwind CSS    │   │
│  │  (Vite)      │   │   Framer Motion   │   │
│  └──────┬───────┘   └───────────────────┘   │
│         │ Supabase JS SDK                   │
└─────────┼───────────────────────────────────┘
          │ HTTPS / WebSocket
┌─────────▼───────────────────────────────────┐
│           SUPABASE (Backend as a Service)    │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐  │
│  │   Auth   │  │ PostgreSQL│  │ Realtime  │  │
│  │(JWT/OAuth)│  │  (tasks) │  │(WebSocket)│  │
│  └──────────┘  └──────────┘  └───────────┘  │
└─────────────────────────────────────────────┘
```

---

## Implementación de Autenticación

Se utiliza **Supabase Auth** con email y contraseña. El SDK maneja sesiones con JWT y el estado de autenticación se propaga globalmente mediante `AuthContext`. El hook `onAuthStateChange` de Supabase detecta cambios de sesión automáticamente.

Row Level Security (RLS) garantiza que cada usuario solo accede a sus propias tareas, incluso si alguien obtiene la clave `anon`.

---

## Sincronización en Tiempo Real

La sincronización se implementa en el hook `useTasks.js` usando **Supabase Realtime**:

```javascript
const channel = supabase
  .channel('tasks-realtime')
  .on('postgres_changes', {
    event: '*',        // Escucha INSERT, UPDATE y DELETE
    schema: 'public',
    table: 'tasks',
    filter: `user_id=eq.${user.id}`,
  }, (payload) => {
    // Actualizar el estado de React sin recargar la página
    if (payload.eventType === 'INSERT') setTasks(prev => [payload.new, ...prev])
    // ...
  })
  .subscribe()
```

Supabase Realtime usa **WebSockets** para notificar cambios en tiempo real. La UI se actualiza automáticamente cuando se hace un cambio desde otro dispositivo.

---

## Funcionalidades Adicionales Implementadas

| Funcionalidad | Descripción |
|---|---|
| **Dashboard con estadísticas** | Tarjetas con total, pendientes, completadas y % de progreso. Gráfica de barras por categoría usando Recharts. |
| **Categorías con colores** | Trabajo 🔵, Personal 🟢, Estudio 🟡 y Otro 🟣. Con badges visuales en cada tarjeta. |
| **Fechas de vencimiento** | Las tareas pueden tener fecha límite con indicador rojo cuando están vencidas. |
| **Filtrado y búsqueda** | Filtro por estado (pendiente/completada), por categoría y búsqueda de texto en título y descripción. |
| **Modo oscuro/claro** | Toggle en el sidebar con preferencia guardada en localStorage. |
| **Animaciones** | Framer Motion en entradas/salidas de componentes, modales y transiciones de página. |
| **Diseño Glassmorphism** | Cards con `backdrop-filter: blur` y bordes semitransparentes. |

---

## Capturas de Pantalla

*(Agregar después del deploy)*
- **Desktop**: Vista del Dashboard con estadísticas
- **Desktop**: Vista de lista de tareas
- **Mobile**: Sidebar desplegable

---

## Dificultades y Soluciones

| Dificultad | Solución |
|---|---|
| Suscripciones duplicadas en Realtime | Limpiar el canal con `supabase.removeChannel()` en el cleanup del `useEffect` |
| RLS bloqueando inserciones | Agregar `WITH CHECK (auth.uid() = user_id)` a la política de Supabase |
| Sidebar responsivo en mobile | Usar AnimatePresence de Framer Motion con `x: -280` para el drawer |
| Tailwind CSS v4 sin `tailwind.config.js` | Usar el plugin `@tailwindcss/vite` y el decorator `@import "tailwindcss"` en CSS |
