# TaskFlow - App de Gestión de Tareas

**TaskFlow** es una aplicación web moderna de gestión de tareas (to-do list) con sincronización en tiempo real en la nube, construida con React + Vite, Supabase y Tailwind CSS.

## 🚀 Características

- 🔐 **Autenticación** con email y contraseña (Supabase Auth)
- ✅ **CRUD de tareas**: crear, leer, editar y eliminar
- 📡 **Sincronización en tiempo real** usando Supabase Realtime
- 📊 **Dashboard** con estadísticas y gráfica por categorías
- 🏷️ **Categorías**: Trabajo, Personal, Estudio y Otro
- 📅 **Fechas de vencimiento** con indicador visual
- 🔍 **Filtrado y búsqueda** de tareas
- 🌙 **Modo oscuro/claro** con persistencia
- 📱 **Diseño responsivo** para desktop y mobile

## 🛠️ Tecnologías

| Tecnología | Uso |
|---|---|
| React 18 + Vite | Frontend SPA |
| Tailwind CSS v4 | Estilos responsivos |
| Supabase | Auth + BD PostgreSQL + Realtime |
| React Router v6 | Enrutamiento |
| Framer Motion | Animaciones |
| Recharts | Gráficas del dashboard |
| Lucide React | Iconos |
| Vercel | Hosting y deploy |

## ⚙️ Instalación local

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/taskflow.git
cd taskflow
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar Supabase

a) Crea un proyecto gratuito en [supabase.com](https://supabase.com)

b) Ve a **SQL Editor** en tu proyecto y ejecuta el contenido del archivo [`supabase_schema.sql`](./supabase_schema.sql)

c) Copia tus credenciales desde **Project Settings → API**:
- **Project URL** → `VITE_SUPABASE_URL`
- **anon public key** → `VITE_SUPABASE_ANON_KEY`

### 4. Configurar variables de entorno
```bash
cp .env.example .env
```
Edita `.env` con tus credenciales de Supabase:
```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 5. Ejecutar en desarrollo
```bash
npm run dev
```
Abre [http://localhost:5173](http://localhost:5173)

## 🌐 Deploy en Vercel

1. Sube el proyecto a un repositorio público en GitHub
2. Ve a [vercel.com](https://vercel.com) e importa el repositorio
3. En **Environment Variables** de Vercel, agrega:
   - `VITE_SUPABASE_URL` → tu URL de Supabase
   - `VITE_SUPABASE_ANON_KEY` → tu clave anon de Supabase
4. Haz clic en **Deploy** — Vercel detecta Vite automáticamente

**URL del proyecto desplegado:** [https://taskflow-app.vercel.app](https://taskflow-app.vercel.app) *(actualizar después del deploy)*

## 📁 Estructura del proyecto

```
src/
├── components/
│   ├── layout/    # Sidebar, navegación
│   └── tasks/     # TaskCard, TaskModal
├── contexts/      # AuthContext, ThemeContext
├── hooks/         # useTasks (CRUD + Realtime)
├── lib/           # Cliente de Supabase
└── pages/         # AuthPage, DashboardPage, TasksPage
```

## 📄 Licencia
MIT
